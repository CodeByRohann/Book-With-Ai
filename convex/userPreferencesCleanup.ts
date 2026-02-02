// Author: Sanket - Cleanup function to fix invalid travelStyle data
// This fixes old UserPreferences documents that have travelStyle as an object instead of string

import { mutation } from "./_generated/server";

/**
 * Fix invalid travelStyle data in UserPreferences
 * Call this once to clean up old data
 */
export const cleanupTravelStyleData = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        // Get all UserPreferences for this user
        const userId = identity.email!;
        const prefs = await ctx.db
            .query("UserPreferences")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        let fixed = 0;

        for (const pref of prefs) {
            let needsUpdate = false;
            const updates: any = {};

            // Check if travelStyle is an object (invalid)
            if (pref.travelStyle && typeof pref.travelStyle === 'object') {
                // Extract the actual value if it's in {type: "value"} format
                const travelStyleValue = (pref.travelStyle as any).type || 'Balanced';
                updates.travelStyle = travelStyleValue.charAt(0).toUpperCase() + travelStyleValue.slice(1);
                needsUpdate = true;
            }

            // Fix if travelStyle is missing
            if (!pref.travelStyle) {
                updates.travelStyle = 'Balanced';
                needsUpdate = true;
            }

            if (needsUpdate) {
                await ctx.db.patch(pref._id, updates);
                fixed++;
            }
        }

        return {
            message: fixed > 0 ? `Fixed ${fixed} preference(s)` : "No fixes needed",
            fixed
        };
    },
});
