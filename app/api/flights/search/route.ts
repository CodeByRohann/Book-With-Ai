import { NextRequest, NextResponse } from 'next/server';
import { searchFlights } from '@/utils/serpapi';
import { scoreFlights, findCheapest, findFastest, findBestValue, Flight as ScoringFlight } from '@/utils/flightScoring';
import { generateFlightReasons, UserProfile } from '@/utils/aiEvaluator';

// Author: Sanket - AI-powered flight search with scoring and reasoning

// Increase timeout for dual API calls (round-trip flights)
export const maxDuration = 60; // 60 seconds for Vercel serverless functions

/**
 * POST /api/flights/search
 * Searches flights and returns AI-evaluated results with labels
 */
export async function POST(request: NextRequest) {
  try {
    const { from, to, date, returnDate, passengers = 1, userId } = await request.json();

    // Validate input
    if (!from || !to || !date) {
      return NextResponse.json({
        error: 'Missing required fields: from, to, date'
      }, { status: 400 });
    }

    // Airport codes mapping
    const airportCodes: { [key: string]: string } = {
      'pune': 'PNQ', 'mumbai': 'BOM', 'delhi': 'DEL', 'bangalore': 'BLR',
      'dubai': 'DXB', 'singapore': 'SIN', 'london': 'LHR', 'paris': 'CDG',
      'new york': 'JFK', 'tokyo': 'HND', 'goa': 'GOI', 'chennai': 'MAA',
      'kolkata': 'CCU', 'hyderabad': 'HYD', 'ahmedabad': 'AMD'
    };

    // Author: Sanket - Clean input by removing extra words and extracting just city name
    const cleanCityName = (input: string): string => {
      // Remove common extra words like "tomorrow", "today", "next week", etc.
      const cleaned = input.toLowerCase()
        .replace(/\s+(tomorrow|today|next week|next month|on \d{4}-\d{2}-\d{2})/gi, '')
        .trim();
      return cleaned;
    };

    const fromClean = cleanCityName(from);
    const toClean = cleanCityName(to);

    const fromCode = airportCodes[fromClean] || from.toUpperCase().substring(0, 3);
    const toCode = airportCodes[toClean] || to.toUpperCase().substring(0, 3);

    // Step 1: Fetch raw flights from SerpAPI (now with return date support)
    const tripType = returnDate ? 'round-trip' : 'one-way';
    console.log(`🔍 Fetching ${tripType} flights: ${fromCode} → ${toCode}`);
    const rawFlights = await searchFlights(fromCode, toCode, date, passengers, returnDate);

    if (rawFlights.length === 0) {
      console.warn('⚠️ No flights found');
      return NextResponse.json({
        success: true,
        route: `${fromCode} → ${toCode}`,
        date,
        returnDate,
        tripType,
        passengers,
        flights: [],
        labeled: null,
        searchTime: new Date().toISOString()
      });
    }

    // Step 2: Get user preferences (if userId provided)
    const userProfile = await getUserProfile(userId);

    // Step 3: Convert to scoring format and score flights
    const scoringFlights: ScoringFlight[] = rawFlights.map((f) => ({
      id: f.id,
      airline: f.airline,
      flightNumber: f.flightNumber,
      from: f.from,
      to: f.to,
      departureTime: f.departure,
      arrivalTime: f.arrival,
      duration: parseDuration(f.duration),
      price: f.price,
      stops: f.stops,
      layoverTime: f.stops > 0 ? 120 : 0, // Default 2h layover if stops exist
      cabinClass: 'Economy',
    }));

    const topCandidates = scoreFlights(scoringFlights, userProfile.weights, 10);

    // Step 4: Generate AI reasoning for top flights
    console.log('🤖 Generating AI reasoning...');
    const evaluatedFlights = await generateFlightReasons(topCandidates, userProfile);

    // Step 5: Label best options
    const labeled = {
      bestForYou: evaluatedFlights[0] || null, // Highest matchScore
      cheapest: findCheapest(topCandidates),
      fastest: findFastest(topCandidates),
      bestValue: findBestValue(topCandidates),
    };

    console.log(`✅ Evaluated ${evaluatedFlights.length} flights`);

    return NextResponse.json({
      success: true,
      route: `${fromCode} → ${toCode}`,
      date,
      passengers,
      flights: evaluatedFlights, // Top 10 with AI reasoning
      labeled, // Best options with labels
      userBudget: userProfile.averageTripBudget, // Return user's budget for UI filtering
      searchTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Flight search error:', error);
    return NextResponse.json({
      error: 'Failed to search flights'
    }, { status: 500 });
  }
}

/**
 * Get user profile from Convex (if available)
 * Falls back to default profile if user not authenticated
 */
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

/**
 * Get user profile from Convex
 */
async function getUserProfile(userId?: string): Promise<UserProfile> {
  const defaultProfile: UserProfile = {
    travelStyle: 'Balanced',
    layoverTolerance: '1 Stop',
    averageTripBudget: 2500,
    preferredCabinClass: 'Economy',
    weights: {
      price: 0.4,
      duration: 0.3,
      comfort: 0.3,
    },
  };

  if (!userId) return defaultProfile;

  try {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    // Fetch user preferences using the new internal query
    // This allows us to get data for the specific user requesting the search
    const preferences = await convex.query(api.userPreferences.getPreferencesByUserId, { userId });

    if (!preferences) return defaultProfile;

    // Map Convex preferences to our local UserProfile interface
    return {
      travelStyle: preferences.travelStyle || 'Balanced',
      layoverTolerance: preferences.layoverTolerance || '1 Stop',
      averageTripBudget: preferences.averageTripBudget || 2500,
      preferredCabinClass: preferences.preferredCabinClass || 'Economy',
      // Use the pre-calculated weights from the DB
      weights: preferences.weights || {
        price: 0.4,
        duration: 0.3,
        comfort: 0.3
      },
      preferredAirlines: preferences.preferredAirlines
    };

  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return defaultProfile;
  }
}

/**
 * Parse duration string (e.g., "5h 30m") to minutes
 */
function parseDuration(duration: string): number {
  const hoursMatch = duration.match(/(\d+)h/);
  const minutesMatch = duration.match(/(\d+)m/);
  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
  return hours * 60 + minutes;
}