import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Author: Sanket - Updated to match new UserPreferences schema
export const updateUserPreferences = mutation({
  args: {
    preferredBudget: v.optional(v.object({
      flight: v.optional(v.number()),
      hotel: v.optional(v.number()),
      total: v.optional(v.number()),
    })),
    preferredDestinations: v.optional(v.array(v.string())),
    preferredAirlines: v.optional(v.array(v.string())),
    preferredHotelCategories: v.optional(v.array(v.string())),
    travelStyle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const userId = identity.email!;

    const existing = await ctx.db
      .query("UserPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const updateData = {
      userId: userId,
      preferredBudget: args.preferredBudget || { flight: 0, hotel: 0, total: 0 },
      preferredDestinations: args.preferredDestinations || [],
      preferredAirlines: args.preferredAirlines || [],
      preferredHotelCategories: args.preferredHotelCategories || [],
      homeAirports: [],
      travelStyle: args.travelStyle ?? "Balanced",
      lastUpdated: new Date().toISOString(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, updateData);
      return existing._id;
    } else {
      return await ctx.db.insert("UserPreferences", updateData);
    }
  },
});

// Get user preferences
export const getUserPreferences = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null; // Or return default structure if preferred
    }

    const userId = identity.email!;

    const preferences = await ctx.db
      .query("UserPreferences")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!preferences) {
      // Return default preferences
      return {
        userId: userId,
        preferredBudget: { flight: 0, hotel: 0, total: 0 },
        preferredDestinations: [],
        preferredAirlines: [],
        preferredHotelCategories: [],
        homeAirports: [],
        travelStyle: "Balanced",
        lastUpdated: new Date().toISOString(),
      };
    }

    return preferences;
  },
});

// Learn from user trip data
export const learnFromTrip = mutation({
  args: {
    tripData: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const userId = identity.email!;

    const preferences = await ctx.db
      .query("UserPreferences")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!preferences) {
      // Create initial preferences from trip data
      const newPreferences = {
        userId: userId,
        preferredBudget: {
          flight: 0,
          hotel: 0,
          total: parseInt(args.tripData.budget?.replace(/\D/g, '') || '0')
        },
        preferredDestinations: [args.tripData.destination].filter(Boolean),
        preferredAirlines: [],
        preferredHotelCategories: [],
        homeAirports: [],
        travelStyle: args.tripData.budget?.toLowerCase().includes('luxury') ? 'Relaxed' :
          args.tripData.budget?.toLowerCase().includes('cheap') ? 'Adventurous' : 'Balanced',
        lastUpdated: new Date().toISOString(),
      };

      await ctx.db.insert("UserPreferences", newPreferences);
    } else {
      // Update existing preferences
      const updatedDestinations = [...(preferences.preferredDestinations || [])];
      if (args.tripData.destination && !updatedDestinations.includes(args.tripData.destination)) {
        updatedDestinations.push(args.tripData.destination);
        // Keep only last 10 destinations
        if (updatedDestinations.length > 10) {
          updatedDestinations.shift();
        }
      }

      // Update travel style based on budget choices
      let travelStyle = preferences.travelStyle || 'Balanced';
      if (args.tripData.budget?.toLowerCase().includes('luxury')) {
        travelStyle = 'Relaxed';
      } else if (args.tripData.budget?.toLowerCase().includes('cheap')) {
        travelStyle = 'Adventurous';
      }

      await ctx.db.patch(preferences._id, {
        preferredDestinations: updatedDestinations,
        travelStyle,
        lastUpdated: new Date().toISOString(),
      });
    }

    // Record search history
    await ctx.db.insert("SearchHistory", {
      userId: userId,
      searchType: "trip",
      searchData: args.tripData,
      searchDate: new Date().toISOString(),
      results: {},
    });
  },
});

// Get personalized recommendations
export const getPersonalizedRecommendations = query({
  args: {
    type: v.string(), // "destinations", "hotels", "budget"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.email!;

    const preferences = await ctx.db
      .query("UserPreferences")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    const searchHistory = await ctx.db
      .query("SearchHistory")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .take(10);

    const user = await ctx.db
      .query("UserTable")
      .filter((q) => q.eq(q.field("email"), userId))
      .first();

    const trips = user ? await ctx.db
      .query("TripDetailTable")
      .filter((q) => q.eq(q.field("uid"), user._id))
      .order("desc")
      .take(5) : [];

    // Generate recommendations based on type
    switch (args.type) {
      case "destinations":
        return generateDestinationRecommendations(preferences, searchHistory, trips);
      case "budget":
        return generateBudgetRecommendations(preferences, searchHistory, trips);
      case "hotels":
        return generateHotelRecommendations(preferences, searchHistory, trips);
      case "travel_style":
        return generateTravelStyleRecommendations(preferences, searchHistory, trips);
      default:
        return [];
    }
  },
});

// Get user travel patterns
export const getUserTravelPatterns = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const userId = identity.email!;

    const user = await ctx.db
      .query("UserTable")
      .filter((q) => q.eq(q.field("email"), userId))
      .first();

    const trips = user ? await ctx.db
      .query("TripDetailTable")
      .filter((q) => q.eq(q.field("uid"), user._id))
      .order("desc")
      .collect() : [];

    const searchHistory = await ctx.db
      .query("SearchHistory")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .take(50);

    // Analyze patterns
    const patterns = {
      favoriteDestinations: extractFavoriteDestinations(trips),
      averageTripDuration: calculateAverageDuration(trips),
      preferredBudgetRange: calculateBudgetRange(trips),
      travelFrequency: calculateTravelFrequency(trips),
      seasonalPreferences: calculateSeasonalPreferences(trips),
      groupSizePreferences: calculateGroupSizePreferences(trips),
    };

    return patterns;
  },
});

// Record user interaction for learning
export const recordUserInteraction = mutation({
  args: {
    interactionType: v.string(), // "search", "view", "book", "favorite"
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const userId = identity.email!;

    await ctx.db.insert("SearchHistory", {
      userId: userId,
      searchType: args.interactionType,
      searchData: args.data,
      searchDate: new Date().toISOString(),
      results: {},
    });

    // Learn from the interaction
    if (args.interactionType === "favorite_destination") {
      const preferences = await ctx.db
        .query("UserPreferences")
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();

      if (preferences) {
        const updatedDestinations = [...(preferences.preferredDestinations || [])];
        if (!updatedDestinations.includes(args.data.destination)) {
          updatedDestinations.unshift(args.data.destination);
          // Keep top 10
          if (updatedDestinations.length > 10) {
            updatedDestinations.pop();
          }

          await ctx.db.patch(preferences._id, {
            preferredDestinations: updatedDestinations,
            lastUpdated: new Date().toISOString(),
          });
        }
      }
    }
  },
});

// Helper functions for recommendations
function generateDestinationRecommendations(preferences: any, history: any[], trips: any[]) {
  const destinations = [
    { name: "Dubai, UAE", reason: "Popular luxury destination", match: 85 },
    { name: "Paris, France", reason: "Cultural hub with great cuisine", match: 78 },
    { name: "Tokyo, Japan", reason: "Perfect blend of tradition and technology", match: 82 },
    { name: "Bali, Indonesia", reason: "Tropical paradise for relaxation", match: 76 },
    { name: "New York, USA", reason: "Urban adventure and entertainment", match: 80 },
  ];

  // Customize based on preferences
  if (preferences?.travelStyle === 'Relaxed') {
    destinations.unshift(
      { name: "Maldives", reason: "Ultimate luxury beach resort destination", match: 95 },
      { name: "Swiss Alps", reason: "Premium mountain luxury experience", match: 90 }
    );
  } else if (preferences?.travelStyle === 'Adventurous') {
    destinations.unshift(
      { name: "Thailand", reason: "Amazing value for money destination", match: 92 },
      { name: "Portugal", reason: "European charm at affordable prices", match: 88 }
    );
  }

  return destinations.slice(0, 5);
}

function generateBudgetRecommendations(preferences: any, history: any[], trips: any[]) {
  const budgetRanges = [
    { range: "$500 - $1,000", category: "Budget", description: "Great value destinations" },
    { range: "$1,000 - $2,500", category: "Mid-range", description: "Balanced comfort and cost" },
    { range: "$2,500 - $5,000", category: "Premium", description: "Enhanced experiences" },
    { range: "$5,000+", category: "Luxury", description: "Ultimate comfort and exclusivity" },
  ];

  // Recommend based on travel style
  if (preferences?.travelStyle === 'Adventurous') {
    return budgetRanges.slice(0, 2);
  } else if (preferences?.travelStyle === 'Relaxed') {
    return budgetRanges.slice(2);
  }

  return budgetRanges;
}

function generateHotelRecommendations(preferences: any, history: any[], trips: any[]) {
  return [
    { category: "Boutique Hotels", reason: "Unique character and personalized service" },
    { category: "Business Hotels", reason: "Perfect for work and leisure balance" },
    { category: "Resort Hotels", reason: "All-inclusive relaxation experience" },
    { category: "City Center Hotels", reason: "Close to attractions and transportation" },
  ];
}

function generateTravelStyleRecommendations(preferences: any, history: any[], trips: any[]) {
  return [
    { style: "Adventure", description: "Thrilling activities and exploration" },
    { style: "Cultural", description: "Museums, history, and local traditions" },
    { style: "Relaxation", description: "Spas, beaches, and peaceful environments" },
    { style: "Culinary", description: "Food tours and cooking experiences" },
  ];
}

function extractFavoriteDestinations(trips: any[]) {
  const destinations: { [key: string]: number } = {};
  trips.forEach(trip => {
    const dest = trip.tripDetail?.trip_plan?.destination;
    if (dest) {
      destinations[dest] = (destinations[dest] || 0) + 1;
    }
  });

  return Object.entries(destinations)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
}

function calculateAverageDuration(trips: any[]) {
  if (trips.length === 0) return 0;

  const durations = trips.map(trip => {
    const duration = trip.tripDetail?.trip_plan?.duration;
    return parseInt(duration?.replace(/\D/g, '') || '0');
  }).filter(d => d > 0);

  return durations.length > 0
    ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
    : 0;
}

function calculateBudgetRange(trips: any[]) {
  if (trips.length === 0) return { min: 0, max: 0, average: 0 };

  const budgets = trips.map(trip => {
    const budget = trip.tripDetail?.trip_plan?.budget;
    return parseInt(budget?.replace(/\D/g, '') || '0');
  }).filter(b => b > 0);

  if (budgets.length === 0) return { min: 0, max: 0, average: 0 };

  return {
    min: Math.min(...budgets),
    max: Math.max(...budgets),
    average: Math.round(budgets.reduce((sum, b) => sum + b, 0) / budgets.length)
  };
}

function calculateTravelFrequency(trips: any[]) {
  return {
    totalTrips: trips.length,
    tripsThisYear: trips.filter(trip => {
      const tripDate = new Date(trip._creationTime);
      const currentYear = new Date().getFullYear();
      return tripDate.getFullYear() === currentYear;
    }).length
  };
}

function calculateSeasonalPreferences(trips: any[]) {
  const seasons: { [key: string]: number } = { spring: 0, summer: 0, fall: 0, winter: 0 };

  trips.forEach(trip => {
    const tripDate = new Date(trip._creationTime);
    const month = tripDate.getMonth();

    if (month >= 2 && month <= 4) seasons.spring++;
    else if (month >= 5 && month <= 7) seasons.summer++;
    else if (month >= 8 && month <= 10) seasons.fall++;
    else seasons.winter++;
  });

  return seasons;
}

function calculateGroupSizePreferences(trips: any[]) {
  const groupSizes: { [key: string]: number } = {};

  trips.forEach(trip => {
    const groupSize = trip.tripDetail?.trip_plan?.group_size || 'Unknown';
    groupSizes[groupSize] = (groupSizes[groupSize] || 0) + 1;
  });

  return groupSizes;
}