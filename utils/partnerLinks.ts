// Author: Sanket - Partner deep link generator for flight bookings
// Generates partner-specific URLs with pre-filled flight details

export type FlightDetails = {
    from: string;           // Origin airport code (e.g., "JFK")
    to: string;             // Destination airport code (e.g., "LAX")
    departureDate: string;  // YYYY-MM-DD format
    returnDate?: string;    // Optional return date
    passengers?: number;    // Number of passengers (default: 1)
    cabinClass?: string;    // "economy" | "premium" | "business" | "first"
    airline?: string;       // Airline name or code
    flightNumber?: string;  // Specific flight number
};

export type BookingPartner = 'skyscanner' | 'kayak' | 'google' | 'booking' | 'expedia';

/**
 * Generate a deep link to Skyscanner with pre-filled flight details
 */
export function generateSkyscannerLink(flight: FlightDetails): string {
    const { from, to, departureDate, returnDate, passengers = 1, cabinClass = 'economy' } = flight;

    // Skyscanner URL format: https://www.skyscanner.com/transport/flights/{origin}/{destination}/{outbound}/{inbound}?adults={n}&cabinclass={class}
    const baseUrl = 'https://www.skyscanner.com/transport/flights';
    const origin = from.toLowerCase();
    const destination = to.toLowerCase();
    const outbound = departureDate.replace(/-/g, '').substring(2); // YYMMDD format
    const inbound = returnDate ? returnDate.replace(/-/g, '').substring(2) : '';

    let url = `${baseUrl}/${origin}/${destination}/${outbound}`;
    if (inbound) {
        url += `/${inbound}`;
    }

    const params = new URLSearchParams();
    if (passengers > 1) params.set('adults', passengers.toString());
    if (cabinClass !== 'economy') params.set('cabinclass', cabinClass);

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
}

/**
 * Generate a deep link to Kayak with pre-filled flight details
 */
export function generateKayakLink(flight: FlightDetails): string {
    const { from, to, departureDate, returnDate, passengers = 1, cabinClass = 'e' } = flight;

    // Kayak URL format: https://www.kayak.com/flights/{origin}-{destination}/{outbound}/{inbound}/{passengers}adults?sort=bestflight_a
    const baseUrl = 'https://www.kayak.com/flights';
    const route = `${from}-${to}`;
    const outbound = departureDate;
    const inbound = returnDate || '';

    let url = `${baseUrl}/${route}/${outbound}`;
    if (inbound) {
        url += `/${inbound}`;
    }
    url += `/${passengers}adults`;

    const params = new URLSearchParams();
    params.set('sort', 'bestflight_a');

    // Cabin class mapping: e=economy, p=premium, b=business, f=first
    const cabinMap: Record<string, string> = {
        'economy': 'e',
        'premium': 'p',
        'business': 'b',
        'first': 'f'
    };
    const cabin = cabinMap[cabinClass] || 'e';
    if (cabin !== 'e') params.set('cabin', cabin);

    return `${url}?${params.toString()}`;
}

/**
 * Generate a deep link to Google Flights with pre-filled flight details
 */
export function generateGoogleFlightsLink(flight: FlightDetails): string {
    const { from, to, departureDate, returnDate, passengers = 1, cabinClass = 'economy' } = flight;

    // Google Flights URL format: https://www.google.com/travel/flights?q=Flights%20to%20{destination}%20from%20{origin}%20on%20{date}
    const baseUrl = 'https://www.google.com/travel/flights';

    const params = new URLSearchParams();

    // Build flight search query
    const tripType = returnDate ? '2' : '1'; // 1=one-way, 2=round-trip
    params.set('hl', 'en');
    params.set('curr', 'USD');

    // Flight details in Google's format
    const flightQuery = `Flights to ${to} from ${from} on ${departureDate}`;
    params.set('q', flightQuery);

    // Additional parameters
    if (passengers > 1) params.set('adults', passengers.toString());

    // Cabin class mapping
    const cabinMap: Record<string, string> = {
        'economy': '1',
        'premium': '2',
        'business': '3',
        'first': '4'
    };
    const cabin = cabinMap[cabinClass] || '1';
    if (cabin !== '1') params.set('tfs', `f.0.c.${cabin}`);

    return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate a deep link to Booking.com flights with pre-filled details
 */
export function generateBookingLink(flight: FlightDetails): string {
    const { from, to, departureDate, returnDate, passengers = 1, cabinClass = 'ECONOMY' } = flight;

    // Booking.com Flights URL format
    const baseUrl = 'https://www.booking.com/flights';

    const params = new URLSearchParams();
    params.set('from', from);
    params.set('to', to);
    params.set('depart', departureDate);
    if (returnDate) params.set('return', returnDate);
    params.set('adults', passengers.toString());
    params.set('cabinClass', cabinClass.toUpperCase());
    params.set('sort', 'BEST');

    return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate a deep link to Expedia with pre-filled flight details
 */
export function generateExpediaLink(flight: FlightDetails): string {
    const { from, to, departureDate, returnDate, passengers = 1 } = flight;

    // Expedia URL format
    const baseUrl = 'https://www.expedia.com/Flights-Search';

    const params = new URLSearchParams();
    params.set('flight-type', returnDate ? 'on' : 'one');
    params.set('leg1', `from:${from},to:${to},departure:${departureDate}TANYT`);
    if (returnDate) {
        params.set('leg2', `from:${to},to:${from},departure:${returnDate}TANYT`);
    }
    params.set('passengers', `adults:${passengers}`);
    params.set('mode', 'search');

    return `${baseUrl}?${params.toString()}`;
}

/**
 * Main function to generate partner deep link
 * @param partner - The booking partner to generate link for
 * @param flight - Flight details to pre-fill
 * @returns Deep link URL with pre-filled flight details
 */
export function generatePartnerLink(
    partner: BookingPartner,
    flight: FlightDetails
): string {
    switch (partner) {
        case 'skyscanner':
            return generateSkyscannerLink(flight);
        case 'kayak':
            return generateKayakLink(flight);
        case 'google':
            return generateGoogleFlightsLink(flight);
        case 'booking':
            return generateBookingLink(flight);
        case 'expedia':
            return generateExpediaLink(flight);
        default:
            // Fallback to Skyscanner
            return generateSkyscannerLink(flight);
    }
}

/**
 * Get all available partner links for a flight
 * Useful for showing multiple booking options to the user
 */
export function getAllPartnerLinks(flight: FlightDetails): Record<BookingPartner, string> {
    return {
        skyscanner: generateSkyscannerLink(flight),
        kayak: generateKayakLink(flight),
        google: generateGoogleFlightsLink(flight),
        booking: generateBookingLink(flight),
        expedia: generateExpediaLink(flight),
    };
}

/**
 * Track partner redirect (for analytics)
 * Call this before redirecting to partner site
 */
export function trackPartnerRedirect(
    partner: BookingPartner,
    flightId: string,
    userId?: string
): void {
    // Log redirect event
    console.log('[Partner Redirect]', {
        partner,
        flightId,
        userId,
        timestamp: new Date().toISOString(),
    });

    // TODO: Send to analytics service (Google Analytics, Mixpanel, etc.)
    // Example: analytics.track('partner_redirect', { partner, flightId, userId });
}
