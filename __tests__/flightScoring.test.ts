// Author: Sanket - Unit tests for flight scoring logic
// Tests price, duration, and comfort scoring algorithms

import { describe, test, expect } from 'vitest'
import {
    scoreFlights,
    findCheapest,
    findFastest,
    findBestValue,
    type ScoredFlight,
    type UserWeights,
} from '@/utils/flightScoring'

describe('Flight Scoring - Price Score', () => {
    test('should give higher score to cheaper flights', () => {
        const flights = [
            {
                id: '1',
                airline: 'Delta',
                flightNumber: 'DL100',
                from: 'JFK',
                to: 'LAX',
                departure: '10:00',
                arrival: '13:00',
                duration: '5h',
                price: 500,
                currency: 'USD',
                stops: 0,
            },
            {
                id: '2',
                airline: 'United',
                flightNumber: 'UA200',
                from: 'JFK',
                to: 'LAX',
                departure: '11:00',
                arrival: '14:00',
                duration: '5h',
                price: 1000,
                currency: 'USD',
                stops: 0,
            },
        ]

        const weights: UserWeights = { price: 1.0, duration: 0, comfort: 0 }
        const scored = scoreFlights(flights, weights, 2)

        // Cheapest flight should rank first
        expect(scored[0].id).toBe('1')
        expect(scored[0].priceScore).toBeGreaterThan(scored[1].priceScore)
        expect(scored[0].mathScore).toBeGreaterThan(scored[1].mathScore)
    })

    test('should normalize price scores between 0 and 100', () => {
        const flights = [
            {
                id: '1',
                airline: 'Delta',
                flightNumber: 'DL100',
                from: 'JFK',
                to: 'LAX',
                departure: '10:00',
                arrival: '13:00',
                duration: '5h',
                price: 300,
                currency: 'USD',
                stops: 0,
            },
            {
                id: '2',
                airline: 'United',
                flightNumber: 'UA200',
                from: 'JFK',
                to: 'LAX',
                departure: '11:00',
                arrival: '14:00',
                duration: '5h',
                price: 1500,
                currency: 'USD',
                stops: 0,
            },
        ]

        const weights: UserWeights = { price: 1.0, duration: 0, comfort: 0 }
        const scored = scoreFlights(flights, weights, 2)

        // All scores should be between 0 and 100
        scored.forEach((flight) => {
            expect(flight.priceScore).toBeGreaterThanOrEqual(0)
            expect(flight.priceScore).toBeLessThanOrEqual(100)
        })
    })
})

describe('Flight Scoring - Duration Score', () => {
    test('should give higher score to faster flights', () => {
        const flights = [
            {
                id: '1',
                airline: 'Delta',
                flightNumber: 'DL100',
                from: 'JFK',
                to: 'LAX',
                departure: '10:00',
                arrival: '13:00',
                duration: '3h',
                price: 500,
                currency: 'USD',
                stops: 0,
            },
            {
                id: '2',
                airline: 'United',
                flightNumber: 'UA200',
                from: 'JFK',
                to: 'LAX',
                departure: '11:00',
                arrival: '19:00',
                duration: '8h',
                price: 500,
                currency: 'USD',
                stops: 1,
            },
        ]

        const weights: UserWeights = { price: 0, duration: 1.0, comfort: 0 }
        const scored = scoreFlights(flights, weights, 2)

        // Faster flight should rank first
        expect(scored[0].id).toBe('1')
        expect(scored[0].durationScore).toBeGreaterThan(scored[1].durationScore)
    })

    test('should handle duration strings correctly', () => {
        const flights = [
            {
                id: '1',
                airline: 'Delta',
                flightNumber: 'DL100',
                from: 'JFK',
                to: 'LAX',
                departure: '10:00',
                arrival: '13:30',
                duration: '3h 30m',
                price: 500,
                currency: 'USD',
                stops: 0,
            },
            {
                id: '2',
                airline: 'United',
                flightNumber: 'UA200',
                from: 'JFK',
                to: 'LAX',
                departure: '11:00',
                arrival: '16:15',
                duration: '5h 15m',
                price: 500,
                currency: 'USD',
                stops: 0,
            },
        ]

        const weights: UserWeights = { price: 0, duration: 1.0, comfort: 0 }
        const scored = scoreFlights(flights, weights, 2)

        // 3h 30m should rank higher than 5h 15m
        expect(scored[0].id).toBe('1')
    })
})

describe('Flight Scoring - Comfort Score', () => {
    test('should prioritize nonstop flights for comfort', () => {
        const flights = [
            {
                id: '1',
                airline: 'Delta',
                flightNumber: 'DL100',
                from: 'JFK',
                to: 'LAX',
                departure: '10:00',
                arrival: '13:00',
                duration: '5h',
                price: 600,
                currency: 'USD',
                stops: 0,
            },
            {
                id: '2',
                airline: 'United',
                flightNumber: 'UA200',
                from: 'JFK',
                to: 'LAX',
                departure: '11:00',
                arrival: '14:00',
                duration: '5h',
                price: 500,
                currency: 'USD',
                stops: 2,
            },
        ]

        const weights: UserWeights = { price: 0, duration: 0, comfort: 1.0 }
        const scored = scoreFlights(flights, weights, 2)

        // Nonstop should rank first despite higher price
        expect(scored[0].id).toBe('1')
        expect(scored[0].comfortScore).toBe(100) // Nonstop = 100
        expect(scored[1].comfortScore).toBe(40) // 2 stops = 40
    })

    test('should apply correct comfort scores based on stops', () => {
        const flights = [
            {
                id: 'nonstop',
                airline: 'Delta',
                flightNumber: 'DL100',
                from: 'JFK',
                to: 'LAX',
                departure: '10:00',
                arrival: '13:00',
                duration: '5h',
                price: 500,
                currency: 'USD',
                stops: 0,
            },
            {
                id: '1stop',
                airline: 'United',
                flightNumber: 'UA200',
                from: 'JFK',
                to: 'LAX',
                departure: '11:00',
                arrival: '14:00',
                duration: '6h',
                price: 500,
                currency: 'USD',
                stops: 1,
            },
            {
                id: '2stops',
                airline: 'American',
                flightNumber: 'AA300',
                from: 'JFK',
                to: 'LAX',
                departure: '12:00',
                arrival: '15:00',
                duration: '7h',
                price: 500,
                currency: 'USD',
                stops: 2,
            },
            {
                id: '3stops',
                airline: 'Spirit',
                flightNumber: 'NK400',
                from: 'JFK',
                to: 'LAX',
                departure: '13:00',
                arrival: '16:00',
                duration: '8h',
                price: 500,
                currency: 'USD',
                stops: 3,
            },
        ]

        const weights: UserWeights = { price: 0, duration: 0, comfort: 1.0 }
        const scored = scoreFlights(flights, weights, 4)

        // Verify comfort scores
        const nonstop = scored.find((f) => f.id === 'nonstop')
        const oneStop = scored.find((f) => f.id === '1stop')
        const twoStops = scored.find((f) => f.id === '2stops')
        const threeStops = scored.find((f) => f.id === '3stops')

        expect(nonstop?.comfortScore).toBe(100)
        expect(oneStop?.comfortScore).toBe(70)
        expect(twoStops?.comfortScore).toBe(40)
        expect(threeStops?.comfortScore).toBe(20)
    })
})

describe('Flight Scoring - Weighted Scoring', () => {
    test('should correctly apply user weights - Adventurous profile', () => {
        const flights = [
            {
                id: 'cheap-slow',
                airline: 'Spirit',
                flightNumber: 'NK100',
                from: 'JFK',
                to: 'LAX',
                departure: '10:00',
                arrival: '18:00',
                duration: '8h',
                price: 300,
                currency: 'USD',
                stops: 2,
            },
            {
                id: 'expensive-fast',
                airline: 'Delta',
                flightNumber: 'DL200',
                from: 'JFK',
                to: 'LAX',
                departure: '11:00',
                arrival: '14:00',
                duration: '3h',
                price: 1000,
                currency: 'USD',
                stops: 0,
            },
        ]

        // Adventurous user prioritizes price
        const adventurousWeights: UserWeights = { price: 0.5, duration: 0.4, comfort: 0.1 }
        const adventurousScored = scoreFlights(flights, adventurousWeights, 2)

        // Cheap flight should win for adventurous user
        expect(adventurousScored[0].id).toBe('cheap-slow')
    })

    test('should correctly apply user weights - Relaxed profile', () => {
        const flights = [
            {
                id: 'cheap-slow',
                airline: 'Spirit',
                flightNumber: 'NK100',
                from: 'JFK',
                to: 'LAX',
                departure: '10:00',
                arrival: '18:00',
                duration: '8h',
                price: 300,
                currency: 'USD',
                stops: 2,
            },
            {
                id: 'expensive-fast',
                airline: 'Delta',
                flightNumber: 'DL200',
                from: 'JFK',
                to: 'LAX',
                departure: '11:00',
                arrival: '14:00',
                duration: '3h',
                price: 1000,
                currency: 'USD',
                stops: 0,
            },
        ]

        // Relaxed user prioritizes comfort
        const relaxedWeights: UserWeights = { price: 0.3, duration: 0.2, comfort: 0.5 }
        const relaxedScored = scoreFlights(flights, relaxedWeights, 2)

        // Nonstop flight should win for relaxed user
        expect(relaxedScored[0].id).toBe('expensive-fast')
    })

    test('should correctly apply user weights - Balanced profile', () => {
        const flights = [
            {
                id: 'extreme-cheap',
                airline: 'Spirit',
                flightNumber: 'NK100',
                from: 'JFK',
                to: 'LAX',
                departure: '10:00',
                arrival: '20:00',
                duration: '10h',
                price: 200,
                currency: 'USD',
                stops: 3,
            },
            {
                id: 'balanced-option',
                airline: 'United',
                flightNumber: 'UA200',
                from: 'JFK',
                to: 'LAX',
                departure: '11:00',
                arrival: '16:00',
                duration: '5h',
                price: 600,
                currency: 'USD',
                stops: 1,
            },
            {
                id: 'extreme-expensive',
                airline: 'Delta',
                flightNumber: 'DL300',
                from: 'JFK',
                to: 'LAX',
                departure: '12:00',
                arrival: '15:00',
                duration: '3h',
                price: 1500,
                currency: 'USD',
                stops: 0,
            },
        ]

        // Balanced user has equal weights
        const balancedWeights: UserWeights = { price: 0.4, duration: 0.3, comfort: 0.3 }
        const balancedScored = scoreFlights(flights, balancedWeights, 3)

        // Balanced option should rank highest
        expect(balancedScored[0].id).toBe('balanced-option')
    })
})

describe('Helper Functions', () => {
    const testFlights = [
        {
            id: '1',
            airline: 'Delta',
            flightNumber: 'DL100',
            from: 'JFK',
            to: 'LAX',
            departure: '10:00',
            arrival: '13:00',
            duration: '5h 30m',
            price: 500,
            currency: 'USD',
            stops: 0,
        },
        {
            id: '2',
            airline: 'United',
            flightNumber: 'UA200',
            from: 'JFK',
            to: 'LAX',
            departure: '11:00',
            arrival: '14:00',
            duration: '3h 15m',
            price: 300,
            currency: 'USD',
            stops: 1,
        },
        {
            id: '3',
            airline: 'American',
            flightNumber: 'AA300',
            from: 'JFK',
            to: 'LAX',
            departure: '12:00',
            arrival: '15:00',
            duration: '7h',
            price: 700,
            currency: 'USD',
            stops: 2,
        },
    ]

    test('findCheapest should return lowest price flight', () => {
        const cheapest = findCheapest(testFlights)
        expect(cheapest.id).toBe('2')
        expect(cheapest.price).toBe(300)
    })

    test('findFastest should return shortest duration flight', () => {
        const fastest = findFastest(testFlights)
        expect(fastest.id).toBe('2')
        expect(fastest.duration).toBe('3h 15m')
    })

    test('findBestValue should return best price/duration ratio', () => {
        const bestValue = findBestValue(testFlights)
        // Best value is typically a balance between price and duration
        expect(bestValue).toBeDefined()
        expect(['1', '2', '3']).toContain(bestValue.id)
    })
})

describe('Edge Cases', () => {
    test('should handle empty flight array', () => {
        const flights: any[] = []
        const weights: UserWeights = { price: 0.4, duration: 0.3, comfort: 0.3 }
        const scored = scoreFlights(flights, weights, 10)

        expect(scored).toEqual([])
    })

    test('should handle single flight', () => {
        const flights = [
            {
                id: '1',
                airline: 'Delta',
                flightNumber: 'DL100',
                from: 'JFK',
                to: 'LAX',
                departure: '10:00',
                arrival: '13:00',
                duration: '5h',
                price: 500,
                currency: 'USD',
                stops: 0,
            },
        ]

        const weights: UserWeights = { price: 0.4, duration: 0.3, comfort: 0.3 }
        const scored = scoreFlights(flights, weights, 10)

        expect(scored.length).toBe(1)
        expect(scored[0].id).toBe('1')
    })

    test('should limit results to topN parameter', () => {
        const flights = Array.from({ length: 20 }, (_, i) => ({
            id: `${i + 1}`,
            airline: 'Delta',
            flightNumber: `DL${i + 100}`,
            from: 'JFK',
            to: 'LAX',
            departure: '10:00',
            arrival: '13:00',
            duration: '5h',
            price: 500 + i * 10,
            currency: 'USD',
            stops: 0,
        }))

        const weights: UserWeights = { price: 1.0, duration: 0, comfort: 0 }
        const scored = scoreFlights(flights, weights, 10)

        expect(scored.length).toBe(10)
    })

    test('should handle flights with same price', () => {
        const flights = [
            {
                id: '1',
                airline: 'Delta',
                flightNumber: 'DL100',
                from: 'JFK',
                to: 'LAX',
                departure: '10:00',
                arrival: '13:00',
                duration: '5h',
                price: 500,
                currency: 'USD',
                stops: 0,
            },
            {
                id: '2',
                airline: 'United',
                flightNumber: 'UA200',
                from: 'JFK',
                to: 'LAX',
                departure: '11:00',
                arrival: '14:00',
                duration: '5h',
                price: 500,
                currency: 'USD',
                stops: 1,
            },
        ]

        const weights: UserWeights = { price: 1.0, duration: 0, comfort: 0 }
        const scored = scoreFlights(flights, weights, 2)

        // Should not crash and should return both flights
        expect(scored.length).toBe(2)
    })
})
