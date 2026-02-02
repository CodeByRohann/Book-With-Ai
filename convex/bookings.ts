// Author: Sanket
// Flight and hotel booking mutations for Convex database
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Creates a new flight booking in the database
 * Returns the booking ID for confirmation page
 */
export const createFlightBooking = mutation({
    args: {
        userId: v.string(),
        bookingId: v.string(),
        flightId: v.string(),
        airline: v.string(),
        flightNumber: v.string(),
        from: v.string(),
        to: v.string(),
        departure: v.string(),
        arrival: v.string(),
        date: v.string(),
        passengers: v.number(),
        totalPrice: v.number(),
        currency: v.string(),
        status: v.string(),
        bookingDate: v.string(),
        passengerDetails: v.any(),
    },
    handler: async (ctx, args) => {
        const bookingId = await ctx.db.insert("FlightBookings", args);
        return bookingId;
    },
});

/**
 * Retrieves all flight bookings for a specific user
 */
export const getUserFlightBookings = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const bookings = await ctx.db
            .query("FlightBookings")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();
        return bookings;
    },
});

/**
 * Gets a specific flight booking by ID
 */
export const getFlightBookingById = query({
    args: { bookingId: v.id("FlightBookings") },
    handler: async (ctx, args) => {
        const booking = await ctx.db.get(args.bookingId);
        return booking;
    },
});

/**
 * Updates flight booking status (e.g., confirmed, cancelled)
 */
export const updateFlightBookingStatus = mutation({
    args: {
        bookingId: v.id("FlightBookings"),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.bookingId, { status: args.status });
    },
});

/**
 * Creates a new hotel booking
 */
export const createHotelBooking = mutation({
    args: {
        userId: v.string(),
        bookingId: v.string(),
        hotelId: v.string(),
        hotelName: v.string(),
        city: v.string(),
        checkIn: v.string(),
        checkOut: v.string(),
        nights: v.number(),
        guests: v.number(),
        roomType: v.string(),
        totalPrice: v.number(),
        currency: v.string(),
        status: v.string(),
        bookingDate: v.string(),
        guestDetails: v.any(),
    },
    handler: async (ctx, args) => {
        const bookingId = await ctx.db.insert("HotelBookings", args);
        return bookingId;
    },
});

/**
 * Gets all hotel bookings for a user
 */
export const getUserHotelBookings = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const bookings = await ctx.db
            .query("HotelBookings")
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .order("desc")
            .collect();
        return bookings;
    },
});
