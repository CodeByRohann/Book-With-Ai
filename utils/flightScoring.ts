// Author: Sanket - Mathematical flight scoring for AI evaluation
// This module provides fast filtering of flight options based on user preferences

export interface Flight {
    id: string;
    airline: string;
    flightNumber: string;
    from: string;
    to: string;
    departureTime: string;
    arrivalTime: string;
    duration: number; // in minutes
    price: number;
    stops: number;
    layoverTime?: number; // in minutes, total layover time
    cabinClass: string;
}

export interface UserWeights {
    price: number; // 0-1
    duration: number; // 0-1
    comfort: number; // 0-1
}

export interface ScoredFlight extends Flight {
    mathScore: number; // 0-100
    priceScore: number;
    durationScore: number;
    comfortScore: number;
}

/**
 * Score and rank flights based on user preferences
 * Returns top N flights sorted by score
 */
export function scoreFlights(
    flights: Flight[],
    weights: UserWeights,
    topN: number = 10
): ScoredFlight[] {
    if (flights.length === 0) return [];

    // Extract all prices and durations for normalization
    const prices = flights.map((f) => f.price);
    const durations = flights.map((f) => f.duration);

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    // Score each flight
    const scoredFlights = flights.map((flight) => {
        // Price score: lower is better (0-100, where 100 is cheapest)
        const priceScore = normalizeInverse(flight.price, minPrice, maxPrice);

        // Duration score: shorter is better (0-100, where 100 is fastest)
        const durationScore = normalizeInverse(flight.duration, minDuration, maxDuration);

        // Comfort score: fewer stops and shorter layovers are better
        const comfortScore = calculateComfortScore(flight);

        // Weighted total score
        const mathScore =
            priceScore * weights.price +
            durationScore * weights.duration +
            comfortScore * weights.comfort;

        return {
            ...flight,
            mathScore,
            priceScore,
            durationScore,
            comfortScore,
        };
    });

    // Sort by score (highest first) and return top N
    return scoredFlights
        .sort((a, b) => b.mathScore - a.mathScore)
        .slice(0, topN);
}

/**
 * Normalize value to 0-100 scale (inverse: lower is better)
 */
function normalizeInverse(value: number, min: number, max: number): number {
    if (max === min) return 100; // All values are the same
    return ((max - value) / (max - min)) * 100;
}

/**
 * Calculate comfort score based on stops and layover time
 */
function calculateComfortScore(flight: Flight): number {
    let score = 100;

    // Penalize for stops
    if (flight.stops === 0) {
        score = 100; // Nonstop is perfect
    } else if (flight.stops === 1) {
        score = 70; // 1 stop is acceptable
    } else if (flight.stops === 2) {
        score = 40; // 2 stops is uncomfortable
    } else {
        score = 20; // 3+ stops is very uncomfortable
    }

    // Further penalize for long layovers
    if (flight.layoverTime) {
        if (flight.layoverTime > 360) {
            // > 6 hours
            score -= 30;
        } else if (flight.layoverTime > 180) {
            // > 3 hours
            score -= 15;
        } else if (flight.layoverTime > 120) {
            // > 2 hours
            score -= 5;
        }
    }

    return Math.max(0, score); // Ensure score doesn't go negative
}

/**
 * Find the cheapest flight from scored flights
 */
export function findCheapest(flights: ScoredFlight[]): ScoredFlight | null {
    if (flights.length === 0) return null;
    return flights.reduce((cheapest, flight) =>
        flight.price < cheapest.price ? flight : cheapest
    );
}

/**
 * Find the fastest flight from scored flights
 */
export function findFastest(flights: ScoredFlight[]): ScoredFlight | null {
    if (flights.length === 0) return null;
    return flights.reduce((fastest, flight) =>
        flight.duration < fastest.duration ? flight : fastest
    );
}

/**
 * Find the best value flight (best price/duration ratio)
 */
export function findBestValue(flights: ScoredFlight[]): ScoredFlight | null {
    if (flights.length === 0) return null;

    const flightsWithValue = flights.map((flight) => ({
        ...flight,
        valueScore: (flight.priceScore + flight.durationScore) / 2,
    }));

    return flightsWithValue.reduce((best, flight) =>
        flight.valueScore > best.valueScore ? flight : best
    );
}
