// Author: Sanket - Unit tests for partner deep link generation
// Tests URL generation for all booking partners

import { describe, test, expect } from 'vitest'
import {
    generateSkyscannerLink,
    generateKayakLink,
    generateGoogleFlightsLink,
    generateBookingLink,
    generateExpediaLink,
    generatePartnerLink,
    getAllPartnerLinks,
    type FlightDetails,
    type BookingPartner,
} from '@/utils/partnerLinks'

describe('Skyscanner Deep Links', () => {
    test('should generate correct one-way flight URL', () => {
        const flight: FlightDetails = {
            from: 'JFK',
            to: 'LAX',
            departureDate: '2026-03-15',
            passengers: 1,
        }

        const url = generateSkyscannerLink(flight)

        expect(url).toContain('skyscanner.com/transport/flights')
        expect(url).toContain('jfk')
        expect(url).toContain('lax')
        expect(url).toContain('260315') // YYMMDD format
    })

    test('should generate correct round-trip flight URL', () => {
        const flight: FlightDetails = {
            from: 'JFK',
            to: 'LAX',
            departureDate: '2026-03-15',
            returnDate: '2026-03-22',
            passengers: 2,
        }

        const url = generateSkyscannerLink(flight)

        expect(url).toContain('260315') // Outbound
        expect(url).toContain('260322') // Inbound
        expect(url).toContain('adults=2')
    })

    test('should include cabin class parameter', () => {
        const flight: FlightDetails = {
            from: 'JFK',
            to: 'LAX',
            departureDate: '2026-03-15',
            cabinClass: 'business',
        }

        const url = generateSkyscannerLink(flight)

        expect(url).toContain('cabinclass=business')
    })
})

describe('Kayak Deep Links', () => {
    test('should generate correct one-way flight URL', () => {
        const flight: FlightDetails = {
            from: 'JFK',
            to: 'LAX',
            departureDate: '2026-03-15',
            passengers: 1,
        }

        const url = generateKayakLink(flight)

        expect(url).toContain('kayak.com/flights')
        expect(url).toContain('JFK-LAX')
        expect(url).toContain('2026-03-15')
        expect(url).toContain('1adults')
        expect(url).toContain('sort=bestflight_a')
    })

    test('should generate correct round-trip flight URL', () => {
        const flight: FlightDetails = {
            from: 'JFK',
            to: 'LAX',
            departureDate: '2026-03-15',
            returnDate: '2026-03-22',
            passengers: 3,
        }

        const url = generateKayakLink(flight)

        expect(url).toContain('2026-03-15')
        expect(url).toContain('2026-03-22')
        expect(url).toContain('3adults')
    })

    test('should map cabin classes correctly', () => {
        const economyFlight: FlightDetails = {
            from: 'JFK',
            to: 'LAX',
            departureDate: '2026-03-15',
            cabinClass: 'economy',
        }

        const businessFlight: FlightDetails = {
            from: 'JFK',
            to: 'LAX',
            departureDate: '2026-03-15',
            cabinClass: 'business',
        }

        const economyUrl = generateKayakLink(economyFlight)
        const businessUrl = generateKayakLink(businessFlight)

        // Economy is default, should not have cabin param
        expect(economyUrl).not.toContain('cabin=')
        // Business should have cabin param
        expect(businessUrl).toContain('cabin=b')
    })
})

describe('Google Flights Deep Links', () => {
    test('should generate correct flight search URL', () => {
        const flight: FlightDetails = {
            from: 'JFK',
            to: 'LAX',
            departureDate: '2026-03-15',
            passengers: 1,
        }

        const url = generateGoogleFlightsLink(flight)

        expect(url).toContain('google.com/travel/flights')
        expect(url).toContain('LAX')
        expect(url).toContain('JFK')
        expect(url).toContain('2026-03-15')
    })

    test('should include passenger count', () => {
        const flight: FlightDetails = {
            from: 'JFK',
            to: 'LAX',
            departureDate: '2026-03-15',
            passengers: 4,
        }

        const url = generateGoogleFlightsLink(flight)

        expect(url).toContain('adults=4')
    })
})

describe('Booking.com Deep Links', () => {
    test('should generate correct flight URL', () => {
        const flight: FlightDetails = {
            from: 'JFK',
            to: 'LAX',
            departureDate: '2026-03-15',
            passengers: 2,
        }

        const url = generateBookingLink(flight)

        expect(url).toContain('booking.com/flights')
        expect(url).toContain('from=JFK')
        expect(url).toContain('to=LAX')
        expect(url).toContain('depart=2026-03-15')
        expect(url).toContain('adults=2')
    })

    test('should include return date if provided', () => {
        const flight: FlightDetails = {
            from: 'JFK',
            to: 'LAX',
            departureDate: '2026-03-15',
            returnDate: '2026-03-22',
        }

        const url = generateBookingLink(flight)

        expect(url).toContain('return=2026-03-22')
    })

    test('should uppercase cabin class', () => {
        const flight: FlightDetails = {
            from: 'JFK',
            to: 'LAX',
            departureDate: '2026-03-15',
            cabinClass: 'business',
        }

        const url = generateBookingLink(flight)

        expect(url).toContain('cabinClass=BUSINESS')
    })
})

describe('Expedia Deep Links', () => {
    test('should generate correct one-way flight URL', () => {
        const flight: FlightDetails = {
            from: 'JFK',
            to: 'LAX',
            departureDate: '2026-03-15',
            passengers: 1,
        }

        const url = generateExpediaLink(flight)

        expect(url).toContain('expedia.com/Flights-Search')
        expect(url).toContain('flight-type=one')
        expect(url).toContain('from:JFK')
        expect(url).toContain('to:LAX')
        expect(url).toContain('departure:2026-03-15')
    })

    test('should generate correct round-trip flight URL', () => {
        const flight: FlightDetails = {
            from: 'JFK',
            to: 'LAX',
            departureDate: '2026-03-15',
            returnDate: '2026-03-22',
            passengers: 2,
        }

        const url = generateExpediaLink(flight)

        expect(url).toContain('flight-type=on')
        expect(url).toContain('leg1=from:JFK,to:LAX,departure:2026-03-15')
        expect(url).toContain('leg2=from:LAX,to:JFK,departure:2026-03-22')
        expect(url).toContain('adults:2')
    })
})

describe('Main Partner Link Generator', () => {
    const testFlight: FlightDetails = {
        from: 'JFK',
        to: 'LAX',
        departureDate: '2026-03-15',
        passengers: 1,
    }

    test('should generate Skyscanner link', () => {
        const url = generatePartnerLink('skyscanner', testFlight)
        expect(url).toContain('skyscanner.com')
    })

    test('should generate Kayak link', () => {
        const url = generatePartnerLink('kayak', testFlight)
        expect(url).toContain('kayak.com')
    })

    test('should generate Google Flights link', () => {
        const url = generatePartnerLink('google', testFlight)
        expect(url).toContain('google.com/travel/flights')
    })

    test('should generate Booking.com link', () => {
        const url = generatePartnerLink('booking', testFlight)
        expect(url).toContain('booking.com')
    })

    test('should generate Expedia link', () => {
        const url = generatePartnerLink('expedia', testFlight)
        expect(url).toContain('expedia.com')
    })

    test('should fallback to Skyscanner for unknown partner', () => {
        const url = generatePartnerLink('unknown' as BookingPartner, testFlight)
        expect(url).toContain('skyscanner.com')
    })
})

describe('Get All Partner Links', () => {
    test('should return links for all partners', () => {
        const flight: FlightDetails = {
            from: 'JFK',
            to: 'LAX',
            departureDate: '2026-03-15',
            passengers: 1,
        }

        const allLinks = getAllPartnerLinks(flight)

        expect(allLinks.skyscanner).toContain('skyscanner.com')
        expect(allLinks.kayak).toContain('kayak.com')
        expect(allLinks.google).toContain('google.com')
        expect(allLinks.booking).toContain('booking.com')
        expect(allLinks.expedia).toContain('expedia.com')
    })

    test('should have 5 partner links', () => {
        const flight: FlightDetails = {
            from: 'JFK',
            to: 'LAX',
            departureDate: '2026-03-15',
        }

        const allLinks = getAllPartnerLinks(flight)
        const partnerCount = Object.keys(allLinks).length

        expect(partnerCount).toBe(5)
    })
})

describe('Edge Cases', () => {
    test('should handle missing optional fields', () => {
        const minimalFlight: FlightDetails = {
            from: 'JFK',
            to: 'LAX',
            departureDate: '2026-03-15',
        }

        // Should not throw errors
        expect(() => generateSkyscannerLink(minimalFlight)).not.toThrow()
        expect(() => generateKayakLink(minimalFlight)).not.toThrow()
        expect(() => generateGoogleFlightsLink(minimalFlight)).not.toThrow()
        expect(() => generateBookingLink(minimalFlight)).not.toThrow()
        expect(() => generateExpediaLink(minimalFlight)).not.toThrow()
    })

    test('should handle lowercase airport codes', () => {
        const flight: FlightDetails = {
            from: 'jfk',
            to: 'lax',
            departureDate: '2026-03-15',
        }

        const skyscannerUrl = generateSkyscannerLink(flight)
        expect(skyscannerUrl).toContain('jfk')
        expect(skyscannerUrl).toContain('lax')
    })

    test('should handle uppercase airport codes', () => {
        const flight: FlightDetails = {
            from: 'JFK',
            to: 'LAX',
            departureDate: '2026-03-15',
        }

        const kayakUrl = generateKayakLink(flight)
        expect(kayakUrl).toContain('JFK')
        expect(kayakUrl).toContain('LAX')
    })

    test('should handle international airports', () => {
        const flight: FlightDetails = {
            from: 'LHR',
            to: 'CDG',
            departureDate: '2026-03-15',
            passengers: 2,
        }

        const url = generatePartnerLink('skyscanner', flight)
        expect(url).toContain('lhr')
        expect(url).toContain('cdg')
    })
})
