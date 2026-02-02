import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser, getCurrentUserEmail } from "./lib/auth";

// Fetch all dashboard data for a user
export const getUserDashboard = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        // Author: Sanket - Using centralized auth helper
        const { user } = await getCurrentUser(ctx);
        const userId = user.email;

        // Let's fetch preferences
        const preferences = await ctx.db.query("UserPreferences")
            .filter(q => q.eq(q.field("userId"), userId))
            .first();

        // Let's fetch stats
        const flights = await ctx.db.query("SavedFlights")
            .filter(q => q.eq(q.field("userId"), userId))
            .collect();

        const itineraries = await ctx.db.query("Itineraries")
            .filter(q => q.eq(q.field("userId"), userId))
            .collect();

        // Calculate simplified stats
        const stats = {
            totalTrips: itineraries.length,
            savedFlights: flights.length,
            // Mocking miles calculation for now as we don't store distance yet
            totalMiles: (flights.length * 1250) + (itineraries.length * 3000),
            countriesVisited: new Set(itineraries.map(i => i.destination?.country)).size
        };

        // Upcoming Trip (Nearest future date)
        const upcomingTrip = itineraries
            .filter(i => new Date(i.startDate) > new Date())
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

        // Notifications Settings
        const notificationSettings = await ctx.db.query("NotificationPreferences")
            .filter(q => q.eq(q.field("userId"), userId))
            .first();

        return {
            user,
            preferences,
            stats,
            upcomingTrip,
            notificationSettings
        };
    },
});

// Update User Profile (Personal Info)
export const updateProfile = mutation({
    args: {
        data: v.object({
            name: v.optional(v.string()),
            phone: v.optional(v.string()),
            dob: v.optional(v.string()),
            country: v.optional(v.string()),
            language: v.optional(v.string()),
            email: v.optional(v.string()), // usually read-only but allowed if changed
        })
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        // Author: Sanket - Using centralized auth helper
        const { user } = await getCurrentUser(ctx);

        if (!user) {
            throw new Error("User profile not found");
        }

        await ctx.db.patch(user._id, args.data);
    }
});

// Update Travel Preferences
export const updatePreferences = mutation({
    args: {
        // We will create if not exists
        preferences: v.object({
            preferredDestinations: v.optional(v.array(v.string())),
            preferredAirlines: v.optional(v.array(v.string())),
            homeAirports: v.optional(v.array(v.string())),
            travelCompanions: v.optional(v.string()),
            preferredCabinClass: v.optional(v.string()),
            preferredBudget: v.optional(v.object({
                min: v.optional(v.number()),
                max: v.optional(v.number()),
                currency: v.optional(v.string()),
            })),
            seatPreference: v.optional(v.string()),
            mealPreference: v.optional(v.string()),
            layoverTolerance: v.optional(v.string()),
            travelStyle: v.optional(v.string()),
            averageTripBudget: v.optional(v.number()),
            averageTripLength: v.optional(v.string()),
            accessibilityNeeds: v.optional(v.string()),
        })
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");
        const userId = identity.email!;

        const existing = await ctx.db.query("UserPreferences")
            .filter(q => q.eq(q.field("userId"), userId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                ...args.preferences,
                lastUpdated: new Date().toISOString()
            });
        } else {
            await ctx.db.insert("UserPreferences", {
                userId: userId,
                ...args.preferences,
                preferredHotelCategories: [], // Default
                lastUpdated: new Date().toISOString()
            });
        }
    }
});

// Update Notification Preferences
export const updateNotifications = mutation({
    args: {
        settings: v.object({
            emailNotifications: v.boolean(),
            pushNotifications: v.boolean(),
            smsNotifications: v.boolean(),
            priceAlerts: v.boolean(),
            notificationTime: v.optional(v.string()),
            twoFactorEnabled: v.optional(v.boolean()),
        })
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");
        const userId = identity.email!;

        const existing = await ctx.db.query("NotificationPreferences")
            .filter(q => q.eq(q.field("userId"), userId))
            .first();

        const defaults = {
            tripReminders: true,
            weatherAlerts: true,
            dealAlerts: true,
            updatedAt: new Date().toISOString()
        };

        if (existing) {
            await ctx.db.patch(existing._id, {
                ...args.settings,
                updatedAt: new Date().toISOString()
            });
        } else {
            await ctx.db.insert("NotificationPreferences", {
                userId: userId,
                ...defaults,
                ...args.settings
            });
        }
    }
});

// Clear AI Memory (Mock for now, would delete vector embeddings in real app)
export const clearAiMemory = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");
        const userId = identity.email!;

        // Logic to clear history
        const existing = await ctx.db.query("NotificationPreferences")
            .filter(q => q.eq(q.field("userId"), userId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                aiMemoryStatus: "Cleared" as any
            });
        }
    }
});
