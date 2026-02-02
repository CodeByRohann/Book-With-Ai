import { query } from "./_generated/server";
import { v } from "convex/values";

// Author: Sanket - Calculate user travel statistics from bookings

/**
 * Get aggregated travel stats for the authenticated user
 * Calculates: countries visited, miles flown, flights taken
 */
export const getTravelStats = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const userId = identity.email!;

        // Get user from UserTable
        const user = await ctx.db
            .query("UserTable")
            .withIndex("by_email", (q) => q.eq("email", userId))
            .first();

        if (!user) {
            return {
                countriesVisited: 0,
                milesFlown: 0,
                flightsTaken: 0,
            };
        }

        // Return stats from UserTable (these are updated when bookings are made)
        return {
            countriesVisited: user.countriesVisited || 0,
            milesFlown: user.totalMiles || 0,
            flightsTaken: user.flightsTaken || 0,
        };
    },
});

/**
 * Get upcoming trip for the user
 * Returns the nearest future trip based on start date
 */
export const getUpcomingTrip = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const userId = identity.email!;

        // Get user from UserTable
        const user = await ctx.db
            .query("UserTable")
            .withIndex("by_email", (q) => q.eq("email", userId))
            .first();

        if (!user) {
            return null;
        }

        // Get all itineraries for this user
        const itineraries = await ctx.db
            .query("Itineraries")
            .filter((q) => q.eq(q.field("userId"), userId))
            .collect();

        // Filter for future trips and sort by start date
        const now = new Date();
        const upcomingTrips = itineraries
            .filter((trip) => new Date(trip.startDate) > now)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        return upcomingTrips[0] || null;
    },
});
