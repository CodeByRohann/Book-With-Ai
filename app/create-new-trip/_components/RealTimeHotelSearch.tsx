'use client'
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Hotel, Users, Search, Loader2, IndianRupee, Star, Wifi, Car, Coffee } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { handleError, handleSuccess } from '@/lib/error-handler';

interface Hotel {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  location: string;
  distance: string;
  image: string;
  amenities: string[];
  roomType: string;
  breakfast: string;
  cancellation: string;
  availability: number;
}

interface HotelSearchData {
  success: boolean;
  city: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  budget?: number;
  hotels: Hotel[];
  searchTime: string;
}

export default function RealTimeHotelSearch() {
  const { user } = useUser();
  const router = useRouter();
  const createHotelBooking = useMutation(api.bookings.createHotelBooking);

  const [searchData, setSearchData] = useState({
    city: 'Dubai',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    guests: 2,
    budget: 5000
  });
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState<string | null>(null);

  const searchHotels = async () => {
    if (!searchData.city || !searchData.checkIn || !searchData.checkOut) {
      alert('Please fill all search fields');
      return;
    }

    if (new Date(searchData.checkOut) <= new Date(searchData.checkIn)) {
      alert('Check-out date must be after check-in date');
      return;
    }

    setLoading(true);
    setHotels([]); // Clear previous results

    try {
      const response = await fetch('/api/search-hotels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: searchData.city,
          budget: searchData.budget?.toString(), // API expects string budget usually, or handles number
          checkIn: searchData.checkIn,
          checkOut: searchData.checkOut
        })
      });

      const data = await response.json();

      if (data.hotels) {
        // Map SerpAPI results to component's Hotel interface if needed, 
        // but the API already returns a coherent structure. 
        // Let's ensure compatibility.
        const mappedHotels: Hotel[] = data.hotels.map((h: any, idx: number) => ({
          id: h.name + idx, // Generate ID if missing
          name: h.name,
          category: 'Hotel', // Default
          rating: h.rating || 0,
          reviews: h.reviews || 0,
          pricePerNight: parseInt(h.price.replace(/[^\d]/g, '')) || 0,
          totalPrice: (parseInt(h.price.replace(/[^\d]/g, '')) || 0) *
            Math.ceil((new Date(searchData.checkOut).getTime() - new Date(searchData.checkIn).getTime()) / (1000 * 60 * 60 * 24)),
          currency: 'INR',
          location: h.address,
          distance: 'Center', // Not always available
          image: h.image,
          amenities: h.amenities || [],
          roomType: 'Standard',
          breakfast: h.amenities?.includes('Breakfast') ? 'Included' : 'Not included',
          cancellation: 'Check policy',
          availability: 5
        }));

        setHotels(mappedHotels);
        setHasSearched(true);
        console.log(`Found ${mappedHotels.length} hotels in ${searchData.city}`);
      } else {
        alert('No hotels found');
      }
    } catch (error) {
      console.error('Hotel search error:', error);
      alert('Error searching hotels');
    } finally {
      setLoading(false);
    }
  };

  // Author: Sanket - Integrated hotel booking with Convex
  const bookHotel = async (hotel: Hotel) => {
    if (!user) {
      handleError(new Error('Not authenticated'), 'Please sign in to book hotels');
      router.push('/sign-in');
      return;
    }

    setBookingInProgress(hotel.id);
    try {
      const nights = Math.ceil((new Date(searchData.checkOut).getTime() - new Date(searchData.checkIn).getTime()) / (1000 * 60 * 60 * 24));

      const bookingId = await createHotelBooking({
        userId: user.id,
        bookingId: `HB${Date.now()}`,
        hotelId: hotel.id,
        hotelName: hotel.name,
        city: searchData.city,
        checkIn: searchData.checkIn,
        checkOut: searchData.checkOut,
        nights: nights > 0 ? nights : 1,
        guests: searchData.guests,
        roomType: hotel.roomType,
        totalPrice: hotel.totalPrice,
        currency: hotel.currency,
        status: 'pending',
        bookingDate: new Date().toISOString(),
        guestDetails: {
          guests: searchData.guests,
        }
      });

      handleSuccess('Hotel booked successfully!');
      router.push(`/bookings/hotel/${bookingId}`);
    } catch (error) {
      handleError(error, 'Failed to book hotel. Please try again.');
    } finally {
      setBookingInProgress(null);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'free wifi': return <Wifi className="w-4 h-4" />;
      case 'parking': return <Car className="w-4 h-4" />;
      case 'restaurant': return <Coffee className="w-4 h-4" />;
      default: return <span className="w-4 h-4 text-center">•</span>;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Real-Time Hotel Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hotel className="w-5 h-5" />
            Real-Time Hotel Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div>
              <label className="text-sm font-medium">City</label>
              <Input
                placeholder="Destination city"
                value={searchData.city}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchData({ ...searchData, city: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Check-in</label>
              <Input
                type="date"
                value={searchData.checkIn}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchData({ ...searchData, checkIn: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Check-out</label>
              <Input
                type="date"
                value={searchData.checkOut}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchData({ ...searchData, checkOut: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Guests</label>
              <Input
                type="number"
                min="1"
                max="8"
                value={searchData.guests}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchData({ ...searchData, guests: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Budget (₹)</label>
              <Input
                type="number"
                min="1000"
                step="500"
                placeholder="Max budget"
                value={searchData.budget}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchData({ ...searchData, budget: parseInt(e.target.value) })}
              />
            </div>
            <Button
              onClick={searchHotels}
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
                  Search Hotels
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hotel Results */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
              <p className="text-lg font-medium">Searching real-time hotels...</p>
              <p className="text-sm text-muted-foreground">Finding best deals for you</p>
            </div>
          </CardContent>
        </Card>
      )}

      {hasSearched && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Hotels in {searchData.city} ({hotels.length} found)
            </h2>
            <Badge variant="outline">
              Last updated: {new Date().toLocaleTimeString()}
            </Badge>
          </div>

          {hotels.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Hotel className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No hotels found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search criteria or budget</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {hotels.map((hotel) => (
                <Card key={hotel.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Hotel Image */}
                      <div className="lg:col-span-3">
                        <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                          <Hotel className="w-12 h-12 text-gray-400" />
                        </div>
                      </div>

                      {/* Hotel Details */}
                      <div className="lg:col-span-6 space-y-3">
                        <div>
                          <h3 className="text-xl font-bold">{hotel.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center">
                              {renderStars(Math.floor(hotel.rating))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {hotel.rating} ({hotel.reviews} reviews)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {hotel.location} • {hotel.distance}
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-2">Room: {hotel.roomType}</p>
                          <p className="text-sm text-muted-foreground mb-2">{hotel.breakfast}</p>
                        </div>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-2">
                          {hotel.amenities.slice(0, 6).map((amenity, index) => (
                            <Badge key={index} variant="outline" className="flex items-center gap-1">
                              {getAmenityIcon(amenity)}
                              <span className="text-xs">{amenity}</span>
                            </Badge>
                          ))}
                          {hotel.amenities.length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{hotel.amenities.length - 6} more
                            </Badge>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {hotel.cancellation}
                        </div>
                      </div>

                      {/* Price & Book */}
                      <div className="lg:col-span-3">
                        <div className="text-right space-y-3">
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Per night</div>
                            <div className="text-lg font-bold flex items-center justify-end">
                              <IndianRupee className="w-4 h-4" />
                              {hotel.pricePerNight.toLocaleString()}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">
                              Total ({Math.ceil((new Date(searchData.checkOut).getTime() - new Date(searchData.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights)
                            </div>
                            <div className="text-2xl font-bold flex items-center justify-end text-blue-600">
                              <IndianRupee className="w-5 h-5" />
                              {hotel.totalPrice.toLocaleString()}
                            </div>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            {hotel.availability} rooms left
                          </div>

                          <Button
                            onClick={() => bookHotel(hotel)}
                            className="w-full"
                            size="lg"
                            disabled={bookingInProgress === hotel.id}
                          >
                            {bookingInProgress === hotel.id ? (
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