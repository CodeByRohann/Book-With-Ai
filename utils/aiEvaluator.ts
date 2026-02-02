// Author: Sanket - AI-powered flight reasoning using OpenAI GPT-4o mini
// Generates personalized explanations for why each flight is recommended

import { ScoredFlight } from "./flightScoring";
import OpenAI from "openai";

export interface UserProfile {
    travelStyle: string; // "Relaxed" | "Balanced" | "Adventurous"
    layoverTolerance: string; // "Nonstop" | "1 Stop" | "Any"
    averageTripBudget: number;
    preferredAirlines?: string[];
    preferredCabinClass?: string;
    weights: {
        price: number;
        duration: number;
        comfort: number;
    };
}

export interface FlightWithReason extends ScoredFlight {
    reason: string; // AI-generated explanation
    matchScore: number; // 0-100, how well it matches user profile
}

/**
 * Generate AI reasoning for top flight options
 * Uses OpenAI GPT-4o mini to create personalized explanations
 */
export async function generateFlightReasons(
    topFlights: ScoredFlight[],
    userProfile: UserProfile
): Promise<FlightWithReason[]> {
    if (topFlights.length === 0) return [];

    try {
        const prompt = buildPrompt(topFlights, userProfile);
        const response = await callOpenAI(prompt);
        const aiResults = parseAIResponse(response);

        // Merge AI results with flight data
        return topFlights.map((flight, index) => {
            const aiResult = aiResults.find((r) => r.flightId === flight.id) || {
                reason: "Good option for your trip",
                matchScore: flight.mathScore,
            };

            return {
                ...flight,
                reason: aiResult.reason,
                matchScore: aiResult.matchScore,
            };
        });
    } catch (error) {
        console.error("AI reasoning failed:", error);
        // Fallback to rule-based reasons
        return topFlights.map((flight) => ({
            ...flight,
            reason: generateFallbackReason(flight, userProfile),
            matchScore: flight.mathScore,
        }));
    }
}

/**
 * Build the prompt for OpenAI API
 */
function buildPrompt(flights: ScoredFlight[], profile: UserProfile): string {
    const flightSummaries = flights.map((f, i) => ({
        id: f.id,
        index: i + 1,
        airline: f.airline,
        price: f.price,
        duration: Math.round(f.duration / 60), // Convert to hours
        stops: f.stops,
        mathScore: Math.round(f.mathScore),
    }));

    return `You are a travel assistant helping a user choose the best flight.

User Profile:
- Travel Style: ${profile.travelStyle}
- Layover Tolerance: ${profile.layoverTolerance}
- Budget: $${profile.averageTripBudget}
${profile.preferredAirlines ? `- Preferred Airlines: ${profile.preferredAirlines.join(", ")}` : ""}

Flight Options (sorted by relevance):
${JSON.stringify(flightSummaries, null, 2)}

For each flight, write ONE concise sentence (max 15 words) explaining why it's a good or bad match for this user's profile. Focus on the most important factor (price, speed, or comfort).

Also assign a "matchScore" (0-100) based on how well it fits the user's preferences.

Return ONLY a JSON array in this exact format:
[
  { "flightId": "flight_id_here", "reason": "reason here", "matchScore": 85 }
]`;
}

/**
 * Call OpenAI API for reasoning using GPT-4o mini
 */
async function callOpenAI(prompt: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY not configured");
    }

    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "You are a helpful travel assistant that provides concise, personalized flight recommendations in JSON format.",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: "json_object" }, // Ensures JSON response
    });

    return response.choices[0]?.message?.content || "";
}

/**
 * Parse OpenAI's JSON response
 */
function parseAIResponse(
    response: string
): Array<{ flightId: string; reason: string; matchScore: number }> {
    try {
        // OpenAI with json_object format returns clean JSON
        const parsed = JSON.parse(response);

        // Handle both array and object with array property
        if (Array.isArray(parsed)) {
            return parsed;
        } else if (parsed.flights && Array.isArray(parsed.flights)) {
            return parsed.flights;
        } else if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
            return parsed.recommendations;
        }

        return [];
    } catch (error) {
        console.error("Failed to parse OpenAI response:", error);
        return [];
    }
}

/**
 * Generate fallback reason if AI fails
 */
function generateFallbackReason(flight: ScoredFlight, profile: UserProfile): string {
    // Rule-based reasoning
    if (flight.stops === 0 && profile.layoverTolerance === "Nonstop") {
        return "Direct flight matches your nonstop preference";
    }

    if (flight.price < profile.averageTripBudget * 0.7) {
        return `Great value at $${flight.price}, well below your budget`;
    }

    if (flight.duration < 300) {
        // < 5 hours
        return "Quick flight with minimal travel time";
    }

    if (flight.stops === 1 && flight.layoverTime && flight.layoverTime < 120) {
        return "Efficient connection with short layover";
    }

    return "Good balance of price, speed, and comfort";
}
