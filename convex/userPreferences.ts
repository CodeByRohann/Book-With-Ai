import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Author: Sanket - API endpoints for user profile and preferences

/**
 * Get user preferences for the authenticated user
 * Returns default values if no preferences exist
 */
export const getUserPreferences = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const userId = identity.email!;

        const preferences = await ctx.db
            .query("UserPreferences")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (!preferences) {
            // Return default preferences
            return {
                userId: userId,
                homeAirports: [],
                preferredAirlines: [],
                preferredCabinClass: "Economy",
                typicalTravelType: "Solo",
                seatPreference: "Window",
                mealPreference: "Regular",
                layoverTolerance: "1 Stop",
                averageTripBudget: 2500,
                averageTripLength: "1 Week",
                travelStyle: "Balanced",
                weights: {
                    price: 0.4,
                    duration: 0.3,
                    comfort: 0.3,
                },
                lastUpdated: new Date().toISOString(),
            };
        }

        return preferences;
    },
});

/**
 * Internal query to get preferences by userId (for API routes)
 */
export const getPreferencesByUserId = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const preferences = await ctx.db
            .query("UserPreferences")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();

        if (!preferences) {
            // Return default preferences
            return {
                userId: args.userId,
                homeAirports: [],
                preferredAirlines: [],
                preferredCabinClass: "Economy",
                typicalTravelType: "Solo",
                seatPreference: "Window",
                mealPreference: "Regular",
                layoverTolerance: "1 Stop",
                averageTripBudget: 2500,
                averageTripLength: "1 Week",
                travelStyle: "Balanced",
                weights: {
                    price: 0.4,
                    duration: 0.3,
                    comfort: 0.3,
                },
                lastUpdated: new Date().toISOString(),
            };
        }

        return preferences;
    },
});

/**
 * Update user preferences
 * Accepts partial updates - only provided fields will be updated
 */
export const updateUserPreferences = mutation({
    args: {
        homeAirports: v.optional(v.array(v.string())),
        preferredAirlines: v.optional(v.array(v.string())),
        preferredCabinClass: v.optional(v.string()),
        typicalTravelType: v.optional(v.string()),
        accessibilityNeeds: v.optional(v.string()),
        seatPreference: v.optional(v.string()),
        mealPreference: v.optional(v.string()),
        layoverTolerance: v.optional(v.string()),
        averageTripBudget: v.optional(v.number()),
        averageTripLength: v.optional(v.string()),
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

        // Calculate AI weights based on travel style
        const weights = calculateWeights(
            args.travelStyle || existing?.travelStyle || "Balanced",
            args.layoverTolerance || existing?.layoverTolerance || "1 Stop"
        );

        const updateData = {
            ...args,
            weights,
            lastUpdated: new Date().toISOString(),
        };

        if (existing) {
            await ctx.db.patch(existing._id, updateData);
            return existing._id;
        } else {
            return await ctx.db.insert("UserPreferences", {
                userId: userId,
                ...updateData,
            });
        }
    },
});

/**
 * Calculate AI weights based on user's travel style and preferences
 * Author: Sanket - Core logic for AI flight scoring
 */
function calculateWeights(travelStyle: string, layoverTolerance: string) {
    const baseWeights: { [key: string]: { price: number; duration: number; comfort: number } } = {
        Relaxed: { price: 0.3, duration: 0.2, comfort: 0.5 },
        Balanced: { price: 0.4, duration: 0.3, comfort: 0.3 },
        Adventurous: { price: 0.5, duration: 0.4, comfort: 0.1 },
    };

    let weights = baseWeights[travelStyle] || baseWeights.Balanced;

    // Boost comfort if user wants nonstop flights
    if (layoverTolerance === "Nonstop") {
        weights = {
            price: Math.max(0, weights.price - 0.1),
            duration: Math.max(0, weights.duration - 0.1),
            comfort: Math.min(1, weights.comfort + 0.2),
        };
    }

    return weights;
}
