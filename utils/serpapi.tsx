import { getJson } from 'serpapi';

const SERPAPI_KEY = process.env.SERPAPI_KEY;

export interface PlaceSearchResult {
  title: string;
  address: string;
  rating?: number;
  reviews?: number;
  phone?: string;
  website?: string;
  description?: string;
  images?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  place_id?: string;
}

// Search for places using SerpAPI Google Places
export async function searchPlaces(query: string, location?: string): Promise<PlaceSearchResult[]> {
  try {
    const searchQuery = location ? `${query} in ${location}` : query;

    const response = await getJson({
      engine: "google_maps",
      q: searchQuery,
      type: "search",
      api_key: SERPAPI_KEY
    });

    const places: PlaceSearchResult[] = (response.local_results || []).map((place: any) => ({
      title: place.title,
      address: place.address,
      rating: place.rating,
      reviews: place.reviews,
      phone: place.phone,
      website: place.website,
      description: place.description,
      coordinates: place.gps_coordinates ? {
        lat: place.gps_coordinates.latitude,
        lng: place.gps_coordinates.longitude
      } : undefined,
      place_id: place.place_id
    }));

    return places;
  } catch (error) {
    console.error('SerpAPI Places Search Error:', error);
    return [];
  }
}

// Search for travel information and images
export async function searchTravelInfo(destination: string): Promise<{
  attractions: PlaceSearchResult[];
  hotels: PlaceSearchResult[];
  restaurants: PlaceSearchResult[];
}> {
  try {
    const [attractions, hotels, restaurants] = await Promise.all([
      searchPlaces(`tourist attractions ${destination}`),
      searchPlaces(`hotels ${destination}`),
      searchPlaces(`restaurants ${destination}`)
    ]);

    return {
      attractions: attractions.slice(0, 10),
      hotels: hotels.slice(0, 8),
      restaurants: restaurants.slice(0, 6)
    };
  } catch (error) {
    console.error('SerpAPI Travel Info Error:', error);
    return {
      attractions: [],
      hotels: [],
      restaurants: []
    };
  }
}

// Get images for a specific place
export async function getPlaceImages(placeName: string): Promise<string[]> {
  try {
    const response = await getJson({
      engine: "google_images",
      q: `${placeName} travel destination`,
      num: 10,
      safe: "active",
      api_key: SERPAPI_KEY
    });

    const images = (response.images_results || [])
      .map((img: any) => img.original)
      .filter((url: string) => url && url.startsWith('http'))
      .slice(0, 5);

    return images;
  } catch (error) {
    console.error('SerpAPI Images Error:', error);
    return [];
  }
}

// Search places with detailed information (for hotels, restaurants, etc.)
export async function searchPlacesWithSerpAPI(query: string): Promise<any[]> {
  try {
    const response = await getJson({
      engine: "google_maps",
      q: query,
      type: "search",
      api_key: SERPAPI_KEY
    });

    return response.local_results || [];
  } catch (error) {
    console.error('SerpAPI Places Search Error:', error);
    return [];
  }
}

// Interface for our app's Flight model
export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  currency: string;
  logo?: string;
  stops: number;
  aircraft?: string;
  baggage?: string;
  meals?: boolean;
  cancellation?: string;
  tripType?: 'one-way' | 'round-trip';
  departureDate?: string;
  returnDate?: string;
  returnFlight?: {
    departure: string;
    arrival: string;
    duration: string;
    airline: string;
    stops: number;
  };
}

// Search for flights using SerpAPI Google Flights
// Author: Sanket - Enhanced to support round-trip flights
export async function searchFlights(
  fromCode: string,
  toCode: string,
  date: string,
  passengers: number = 1,
  returnDate?: string
): Promise<Flight[]> {
  try {
    // Author: Sanket - Enhanced to handle round-trip flights with dual API calls
    // SerpAPI only returns one leg even for round-trip, so we make two separate calls

    if (returnDate) {
      console.log(`✈️ Searching round-trip flights: ${fromCode} -> ${toCode} on ${date} returning ${returnDate}`);
      console.log(`🔄 Making dual API calls...`);

      // Make two separate API calls: outbound and return
      const [outboundFlights, returnFlights] = await Promise.all([
        searchOneWayFlights(fromCode, toCode, date, passengers),
        searchOneWayFlights(toCode, fromCode, returnDate, passengers) // Reverse direction
      ]);

      console.log(`✅ Outbound flights: ${outboundFlights.length}, Return flights: ${returnFlights.length}`);

      // Combine outbound and return flights into round-trip options
      const combined = combineRoundTripFlights(outboundFlights, returnFlights, date, returnDate);
      console.log(`✅ Combined ${combined.length} round-trip flight options`);
      return combined;
    } else {
      console.log(`✈️ Searching one-way flights: ${fromCode} -> ${toCode} on ${date}`);
      return searchOneWayFlights(fromCode, toCode, date, passengers);
    }
  } catch (error) {
    console.error('❌ SerpAPI Flight Search Error:', error);
    return [];
  }
}

/**
 * Search for one-way flights using SerpAPI
 * Author: Sanket - Extracted from main searchFlights function
 */
async function searchOneWayFlights(
  fromCode: string,
  toCode: string,
  date: string,
  passengers: number
): Promise<Flight[]> {
  console.log(`📡 Calling SerpAPI: ${fromCode} -> ${toCode} on ${date}`);

  const response = await getJson({
    engine: "google_flights",
    departure_id: fromCode,
    arrival_id: toCode,
    outbound_date: date,
    currency: "INR",
    hl: "en",
    adults: passengers,
    api_key: SERPAPI_KEY,
    type: "2" // Always one-way for individual legs
  });

  if (!response.best_flights && !response.other_flights) {
    console.warn(`⚠️ No flights found for ${fromCode} -> ${toCode} on ${date}`);
    return [];
  }

  const rawFlights = [...(response.best_flights || []), ...(response.other_flights || [])];
  console.log(`✅ SerpAPI returned ${rawFlights.length} flights for ${fromCode} -> ${toCode}`);

  return rawFlights.slice(0, 15).map((f: any, index: number) => {
    const leg = f.flights[0];
    return {
      id: `FL-${index}-${fromCode}-${toCode}-${date}`,
      airline: leg.airline || 'Unknown Airline',
      flightNumber: leg.flight_number || '',
      from: leg.departure_airport?.name || fromCode,
      to: leg.arrival_airport?.name || toCode,
      departure: leg.departure_airport?.time?.split(' ')[1] || '00:00',
      arrival: leg.arrival_airport?.time?.split(' ')[1] || '00:00',
      duration: `${Math.floor(f.total_duration / 60)}h ${f.total_duration % 60}m`,
      price: f.price || 0,
      currency: 'INR',
      logo: leg.airline_logo,
      stops: f.layovers ? f.layovers.length : 0,
      aircraft: leg.airplane,
      baggage: 'Check with airline',
      cancellation: 'Check rules',
      tripType: 'one-way',
      departureDate: date,
    };
  });
}

/**
 * Combine outbound and return flights into round-trip options
 * Author: Sanket - Creates round-trip flight combinations
 */
function combineRoundTripFlights(
  outboundFlights: Flight[],
  returnFlights: Flight[],
  outboundDate: string,
  returnDate: string
): Flight[] {
  const roundTripFlights: Flight[] = [];

  // Strategy: Combine flights from the same airline first, then mix
  // Take top 5 outbound and top 5 return to create combinations
  const topOutbound = outboundFlights.slice(0, 5);
  const topReturn = returnFlights.slice(0, 5);

  let combinationIndex = 0;

  // First: Same airline combinations (preferred)
  for (const outbound of topOutbound) {
    const matchingReturn = topReturn.find(r => r.airline === outbound.airline);
    if (matchingReturn) {
      roundTripFlights.push({
        ...outbound,
        id: `RT-${combinationIndex++}-${outbound.airline}`,
        tripType: 'round-trip',
        price: outbound.price + matchingReturn.price, // Combined price
        departureDate: outboundDate,
        returnDate: returnDate,
        returnFlight: {
          departure: matchingReturn.departure,
          arrival: matchingReturn.arrival,
          duration: matchingReturn.duration,
          airline: matchingReturn.airline,
          stops: matchingReturn.stops,
        }
      });
    }
  }

  // Second: Mixed airline combinations (if we have less than 10 options)
  if (roundTripFlights.length < 10) {
    for (const outbound of topOutbound) {
      for (const returnFlight of topReturn) {
        // Skip if already added (same airline combo)
        if (outbound.airline === returnFlight.airline) continue;

        // Skip if we already have enough options
        if (roundTripFlights.length >= 10) break;

        roundTripFlights.push({
          ...outbound,
          id: `RT-${combinationIndex++}-${outbound.airline}-${returnFlight.airline}`,
          tripType: 'round-trip',
          price: outbound.price + returnFlight.price,
          departureDate: outboundDate,
          returnDate: returnDate,
          returnFlight: {
            departure: returnFlight.departure,
            arrival: returnFlight.arrival,
            duration: returnFlight.duration,
            airline: returnFlight.airline,
            stops: returnFlight.stops,
          }
        });
      }
    }
  }

  console.log(`✅ Combined ${roundTripFlights.length} round-trip flight options`);

  // DEBUG: Log first flight to verify returnFlight structure
  if (roundTripFlights.length > 0) {
    console.log('🔍 DEBUG - First round-trip flight:', JSON.stringify({
      id: roundTripFlights[0].id,
      tripType: roundTripFlights[0].tripType,
      airline: roundTripFlights[0].airline,
      price: roundTripFlights[0].price,
      hasReturnFlight: !!roundTripFlights[0].returnFlight,
      returnFlight: roundTripFlights[0].returnFlight
    }, null, 2));
  }

  return roundTripFlights;
}