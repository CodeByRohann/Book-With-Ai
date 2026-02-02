import React, { useState, useEffect } from 'react'
import { Plane, Clock, ArrowRight, Briefcase, Utensils, AlertCircle, Sparkles, TrendingDown, Zap, Award, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { generatePartnerLink, trackPartnerRedirect, type BookingPartner, type FlightDetails } from '@/utils/partnerLinks'

// Author: Sanket - Enhanced with AI evaluation features and partner deep linking
export type Flight = {
    id: string
    airline: string
    flightNumber: string
    from: string
    to: string
    departure: string
    arrival: string
    duration: string
    price: number
    currency: string
    stops: number
    aircraft?: string
    baggage?: string
    meals?: boolean
    cancellation?: string
    availability?: number
    // Date fields for deep linking
    departureDate?: string // YYYY-MM-DD format
    returnDate?: string // Optional return date
    // NEW: Trip type and return flight details
    tripType?: 'one-way' | 'round-trip'
    returnFlight?: {
        departure: string  // Return departure time
        arrival: string    // Return arrival time
        duration: string   // Return flight duration
        airline: string    // Return airline (might be different)
        stops: number      // Return flight stops
    }
    // AI Evaluation fields
    reason?: string // AI-generated reasoning
    matchScore?: number // 0-100 match score
    mathScore?: number // Mathematical score
}

type FlightBookingUIProps = {
    flights: Flight[]
    route: { from: string, to: string }
    budget?: number
    labeled?: {
        bestForYou?: Flight
        cheapest?: Flight
        fastest?: Flight
        bestValue?: Flight
    }
    passengers?: number // Number of passengers for deep linking
    preferredPartner?: BookingPartner // Preferred booking partner
}

function FlightBookingUI({ flights, route, budget, labeled, passengers = 1, preferredPartner = 'skyscanner' }: FlightBookingUIProps) {
    const [selectedPartner, setSelectedPartner] = useState<BookingPartner>(preferredPartner);

    // Author: Sanket - DEBUG: Log flight data to verify returnFlight property
    useEffect(() => {
        if (flights.length > 0) {
            console.log('🔍 CLIENT DEBUG - First flight received by UI:', {
                id: flights[0].id,
                tripType: flights[0].tripType,
                airline: flights[0].airline,
                price: flights[0].price,
                hasReturnFlight: !!flights[0].returnFlight,
                returnFlight: flights[0].returnFlight
            });
        }
    }, [flights]);

    // Author: Sanket - Enhanced booking handler with partner deep links
    const handleBook = (flight: Flight) => {
        // Extract airport codes from full airport names
        // SerpAPI returns full names like "Chhatrapati Shivaji Maharaj International Airport Mumbai"
        // We need to extract the 3-letter code (BOM, DEL, etc.)
        const extractAirportCode = (airportName: string): string => {
            // Common airport code mappings
            const codeMap: { [key: string]: string } = {
                'mumbai': 'BOM',
                'delhi': 'DEL',
                'bangalore': 'BLR',
                'chennai': 'MAA',
                'kolkata': 'CCU',
                'hyderabad': 'HYD',
                'pune': 'PNQ',
                'goa': 'GOI',
                'ahmedabad': 'AMD',
                'dubai': 'DXB',
                'singapore': 'SIN',
                'london': 'LHR',
                'new york': 'JFK',
                'paris': 'CDG',
                'tokyo': 'HND'
            };

            // Try to find city name in the airport name
            const lowerName = airportName.toLowerCase();
            for (const [city, code] of Object.entries(codeMap)) {
                if (lowerName.includes(city)) {
                    return code;
                }
            }

            // Fallback: try to extract 3-letter uppercase code from the name
            const codeMatch = airportName.match(/\b([A-Z]{3})\b/);
            if (codeMatch) {
                return codeMatch[1];
            }

            // Last resort: return first 3 letters uppercase
            return airportName.substring(0, 3).toUpperCase();
        };

        // Build flight details for deep linking
        const flightDetails: FlightDetails = {
            from: extractAirportCode(flight.from),
            to: extractAirportCode(flight.to),
            departureDate: flight.departureDate || new Date().toISOString().split('T')[0],
            returnDate: flight.returnDate,
            passengers: passengers,
            airline: flight.airline,
            flightNumber: flight.flightNumber,
        };

        console.log('🔗 Generating deep link:', flightDetails);

        // Generate partner-specific deep link
        const deepLink = generatePartnerLink(selectedPartner, flightDetails);

        console.log('✈️ Redirecting to:', deepLink);

        // Track redirect for analytics
        trackPartnerRedirect(selectedPartner, flight.id);

        // Open partner site in new tab
        window.open(deepLink, '_blank');
    }

    // Generic handler for "View All" links (without specific flight)
    const handleViewAll = () => {
        const genericUrl = `https://www.${selectedPartner}.com/transport/flights/${route.from.toLowerCase()}/${route.to.toLowerCase()}`;
        window.open(genericUrl, '_blank');
    }

    const filteredFlights = budget
        ? flights.filter(f => f.price <= budget)
        : flights;

    // Helper to get badge for a flight
    const getFlightBadge = (flight: Flight) => {
        if (labeled?.bestForYou?.id === flight.id) {
            return { label: 'Best for You', icon: Award, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' };
        }
        if (labeled?.cheapest?.id === flight.id) {
            return { label: 'Cheapest', icon: TrendingDown, color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' };
        }
        if (labeled?.fastest?.id === flight.id) {
            return { label: 'Fastest', icon: Zap, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' };
        }
        if (labeled?.bestValue?.id === flight.id) {
            return { label: 'Best Value', icon: Sparkles, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' };
        }
        return null;
    };

    if (!filteredFlights || filteredFlights.length === 0) {
        return (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-gray-500">No flights found {budget ? `within ₹${budget}` : 'for this route'}.</p>
                {budget && flights.length > 0 && (
                    <div className="mt-2 text-xs text-indigo-600 cursor-pointer" onClick={handleViewAll}>
                        View {flights.length} flights outside budget
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-4 w-full">
            <div className="flex items-center justify-between px-2">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Plane className="w-4 h-4 text-indigo-500" />
                    Flights to {route.to} {budget && <span className="text-xs font-normal text-gray-500">(Max ₹{budget.toLocaleString()})</span>}
                </h3>
                {labeled && (
                    <Badge variant="outline" className="text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Ranked
                    </Badge>
                )}
            </div>

            <div className="grid gap-3">
                {filteredFlights.map((flight) => {
                    const badge = getFlightBadge(flight);

                    return (
                        <div key={flight.id} className={`bg-white dark:bg-gray-800 p-4 rounded-xl border transition-all shadow-sm group ${badge ? 'border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-100 dark:ring-indigo-900' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500'
                            }`}>

                            {/* AI Badge */}
                            {badge && (
                                <div className="mb-3 flex items-center gap-2">
                                    <Badge className={`${badge.color} flex items-center gap-1 text-xs font-semibold`}>
                                        <badge.icon className="w-3 h-3" />
                                        {badge.label}
                                    </Badge>
                                    {flight.matchScore && (
                                        <span className="text-xs text-gray-500">
                                            {Math.round(flight.matchScore)}% match
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Header: Airline & Price */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-xs text-gray-600 dark:text-gray-300">
                                        {flight.airline.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{flight.airline}</h4>
                                        <p className="text-xs text-gray-500">{flight.flightNumber} • {flight.aircraft}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                        {flight.currency === 'USD' ? '$' : '₹'}{flight.price.toLocaleString()}
                                    </div>
                                    {flight.availability && (
                                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                            {flight.availability} seats left
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* AI Reasoning */}
                            {flight.reason && (
                                <div className="mb-3 p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900">
                                    <div className="flex items-start gap-2">
                                        <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                                            {flight.reason}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Outbound Flight Route Visual */}
                            <div className="mb-4">
                                {flight.tripType === 'round-trip' && (
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                                        <Plane className="w-3 h-3" /> Outbound
                                    </p>
                                )}
                                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">{flight.departure}</p>
                                        <p className="text-xs font-medium text-gray-500 uppercase">{flight.from}</p>
                                    </div>

                                    <div className="flex-1 px-4 flex flex-col items-center">
                                        <p className="text-xs text-gray-400 mb-1">{flight.duration}</p>
                                        <div className="w-full flex items-center gap-2">
                                            <div className="h-[2px] flex-1 bg-gray-300 dark:bg-gray-600 relative">
                                                <div className="absolute top-1/2 -translate-y-1/2 left-0 w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                                <div className="absolute top-1/2 -translate-y-1/2 right-0 w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                            </div>
                                            {flight.stops === 0 ? (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-medium whitespace-nowrap">
                                                    Non-stop
                                                </span>
                                            ) : (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 font-medium whitespace-nowrap">
                                                    {flight.stops} Stop
                                                </span>
                                            )}
                                            <div className="h-[2px] flex-1 bg-gray-300 dark:bg-gray-600 relative"></div>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">{flight.arrival}</p>
                                        <p className="text-xs font-medium text-gray-500 uppercase">{flight.to}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Return Flight (if round-trip) */}
                            {flight.returnFlight && (
                                <div className="mb-4">
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                                        <Plane className="w-3 h-3 rotate-180" /> Return
                                    </p>
                                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">{flight.returnFlight.departure}</p>
                                            <p className="text-xs font-medium text-gray-500 uppercase">{flight.to}</p>
                                        </div>

                                        <div className="flex-1 px-4 flex flex-col items-center">
                                            <p className="text-xs text-gray-400 mb-1">{flight.returnFlight.duration}</p>
                                            <div className="w-full flex items-center gap-2">
                                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                                                <Plane className="w-4 h-4 text-indigo-600 dark:text-indigo-400 rotate-180" />
                                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {flight.returnFlight.stops === 0 ? 'Nonstop' : `${flight.returnFlight.stops} stop${flight.returnFlight.stops > 1 ? 's' : ''}`}
                                            </p>
                                        </div>

                                        <div className="text-center">
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">{flight.returnFlight.arrival}</p>
                                            <p className="text-xs font-medium text-gray-500 uppercase">{flight.from}</p>
                                        </div>
                                    </div>
                                    {flight.returnFlight.airline !== flight.airline && (
                                        <p className="text-xs text-gray-500 mt-1">Return operated by {flight.returnFlight.airline}</p>
                                    )}
                                </div>
                            )}

                            {/* Amenities & Action */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex gap-3 text-xs text-gray-500">
                                    {flight.baggage && (
                                        <div className="flex items-center gap-1" title={flight.baggage}>
                                            <Briefcase className="w-3 h-3" />
                                            <span>{flight.baggage}</span>
                                        </div>
                                    )}
                                    {flight.meals && (
                                        <div className="flex items-center gap-1">
                                            <Utensils className="w-3 h-3" />
                                            <span>Meals</span>
                                        </div>
                                    )}
                                </div>
                                <Button size="sm" onClick={() => handleBook(flight)} className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white">
                                    Book Flight
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center mt-2">
                <Button variant="ghost" size="sm" onClick={handleViewAll} className="text-xs text-gray-500">
                    View all flights on {selectedPartner.charAt(0).toUpperCase() + selectedPartner.slice(1)} <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
            </div>
        </div>
    )
}

export default FlightBookingUI
