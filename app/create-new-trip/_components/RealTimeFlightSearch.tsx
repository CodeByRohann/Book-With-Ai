'use client'
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Plane, Users, Luggage, Search, Loader2, IndianRupee } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { handleError, handleSuccess } from '@/lib/error-handler';

interface Flight {
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
  stops: number;
  aircraft: string;
  baggage: string;
  meals: boolean;
  cancellation: string;
  availability: number;
}

interface FlightSearchData {
  success: boolean;
  route: string;
  date: string;
  passengers: number;
  flights: Flight[];
  searchTime: string;
}

export default function FlightSearchResults() {
  const { user } = useUser();
  const router = useRouter();
  const createBooking = useMutation(api.bookings.createFlightBooking);

  const [searchData, setSearchData] = useState({
    from: 'Pune',
    to: 'Dubai',
    date: new Date().toISOString().split('T')[0],
    passengers: 1
  });
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState<string | null>(null);

  const searchFlights = async () => {
    if (!searchData.from || !searchData.to || !searchData.date) {
      alert('Please fill all search fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchData)
      });

      const data: FlightSearchData = await response.json();

      if (data.success) {
        setFlights(data.flights);
        setHasSearched(true);
        console.log(`Found ${data.flights.length} flights for ${data.route}`);
      } else {
        alert('Failed to search flights');
      }
    } catch (error) {
      console.error('Flight search error:', error);
      alert('Error searching flights');
    } finally {
      setLoading(false);
    }
  };

  // Author: Sanket - Integrated flight booking with Convex
  const bookFlight = async (flight: Flight) => {
    if (!user) {
      handleError(new Error('Not authenticated'), 'Please sign in to book flights');
      router.push('/sign-in');
      return;
    }

    setBookingInProgress(flight.id);
    try {
      const bookingId = await createBooking({
        userId: user.id,
        bookingId: `BK${Date.now()}`,
        flightId: flight.id,
        airline: flight.airline,
        flightNumber: flight.flightNumber,
        from: flight.from,
        to: flight.to,
        departure: flight.departure,
        arrival: flight.arrival,
        date: searchData.date,
        passengers: searchData.passengers,
        totalPrice: flight.price * searchData.passengers,
        currency: flight.currency,
        status: 'pending',
        bookingDate: new Date().toISOString(),
        passengerDetails: {
          adults: searchData.passengers,
          // TODO: Collect detailed passenger info in a modal
        }
      });

      handleSuccess('Flight booking created successfully!');
      router.push(`/bookings/${bookingId}`);
    } catch (error) {
      handleError(error, 'Failed to book flight. Please try again.');
    } finally {
      setBookingInProgress(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Real-Time Flight Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="w-5 h-5" />
            Real-Time Flight Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="text-sm font-medium">From</label>
              <Input
                placeholder="Departure city"
                value={searchData.from}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchData({ ...searchData, from: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">To</label>
              <Input
                placeholder="Destination city"
                value={searchData.to}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchData({ ...searchData, to: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={searchData.date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchData({ ...searchData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Passengers</label>
              <Input
                type="number"
                min="1"
                max="9"
                value={searchData.passengers}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchData({ ...searchData, passengers: parseInt(e.target.value) })}
              />
            </div>
            <Button
              onClick={searchFlights}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search Flights
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Flight Results */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
              <p className="text-lg font-medium">Searching real-time flights...</p>
              <p className="text-sm text-muted-foreground">This may take a few seconds</p>
            </div>
          </CardContent>
        </Card>
      )}

      {hasSearched && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Flight Results ({flights.length} found)
            </h2>
            <Badge variant="outline">
              Last updated: {new Date().toLocaleTimeString()}
            </Badge>
          </div>

          {flights.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Plane className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No flights found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {flights.map((flight) => (
                <Card key={flight.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                      {/* Airline Info */}
                      <div className="lg:col-span-2">
                        <div className="text-lg font-bold">{flight.airline}</div>
                        <div className="text-sm text-muted-foreground">{flight.flightNumber}</div>
                        <div className="text-xs text-muted-foreground">{flight.aircraft}</div>
                      </div>

                      {/* Flight Times */}
                      <div className="lg:col-span-3">
                        <div className="flex items-center justify-between">
                          <div className="text-center">
                            <div className="text-xl font-bold">{flight.departure}</div>
                            <div className="text-sm text-muted-foreground">{flight.from}</div>
                          </div>
                          <div className="flex-1 mx-4">
                            <div className="flex items-center justify-center">
                              <div className="flex-1 border-t border-dashed"></div>
                              <Plane className="w-4 h-4 mx-2 text-blue-600" />
                              <div className="flex-1 border-t border-dashed"></div>
                            </div>
                            <div className="text-center text-xs text-muted-foreground mt-1">
                              {flight.duration}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold">{flight.arrival}</div>
                            <div className="text-sm text-muted-foreground">{flight.to}</div>
                          </div>
                        </div>
                      </div>

                      {/* Flight Details */}
                      <div className="lg:col-span-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4" />
                            {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Luggage className="w-4 h-4" />
                            {flight.baggage}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4" />
                            {flight.availability} seats left
                          </div>
                        </div>
                      </div>

                      {/* Price & Book */}
                      <div className="lg:col-span-4">
                        <div className="text-right space-y-2">
                          <div className="text-2xl font-bold flex items-center justify-end">
                            <IndianRupee className="w-5 h-5" />
                            {flight.price.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {flight.cancellation}
                          </div>
                          <Button
                            onClick={() => bookFlight(flight)}
                            className="w-full"
                            size="lg"
                            disabled={bookingInProgress === flight.id}
                          >
                            {bookingInProgress === flight.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Booking...
                              </>
                            ) : (
                              'Book Now'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}