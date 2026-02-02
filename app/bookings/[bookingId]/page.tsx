'use client'
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plane, Calendar, Users, MapPin, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

export default function BookingConfirmation() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params.bookingId as Id<"FlightBookings">;

    const booking = useQuery(api.bookings.getFlightBookingById, { bookingId });

    if (booking === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
                    <p className="text-lg font-medium">Loading booking details...</p>
                </div>
            </div>
        );
    }

    if (booking === null) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="text-center py-12">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-red-600 dark:text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Booking Not Found</h2>
                        <p className="text-muted-foreground mb-6">
                            We couldn't find this booking. It may have been cancelled or doesn't exist.
                        </p>
                        <Button onClick={() => router.push('/my-trips')}>
                            View My Trips
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Author: Sanket - Booking confirmation UI with all flight details
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Success Header */}
                <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10">
                    <CardContent className="flex items-center gap-4 py-6">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-green-900 dark:text-green-100">
                                Booking Confirmed!
                            </h1>
                            <p className="text-green-700 dark:text-green-300">
                                Your flight has been successfully booked
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Booking Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Booking Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Booking ID</p>
                                <p className="font-mono font-semibold">{booking.bookingId}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                                    {booking.status.toUpperCase()}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Booked On</p>
                                <p className="font-semibold">
                                    {new Date(booking.bookingDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Flight Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plane className="w-5 h-5" />
                            Flight Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Airline */}
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Airline</p>
                            <p className="text-xl font-bold">{booking.airline}</p>
                            <p className="text-muted-foreground">{booking.flightNumber}</p>
                        </div>

                        {/* Route */}
                        <div className="flex items-center justify-between py-4 border-y">
                            <div className="text-center flex-1">
                                <p className="text-3xl font-bold">{booking.from}</p>
                                <p className="text-sm text-muted-foreground mt-1">Departure</p>
                                <p className="text-lg font-semibold mt-2">{booking.departure}</p>
                            </div>

                            <div className="mx-6">
                                <div className="flex items-center">
                                    <div className="h-px flex-1 bg-border w-12"></div>
                                    <Plane className="w-6 h-6 mx-2 text-blue-600" />
                                    <div className="h-px flex-1 bg-border w-12"></div>
                                </div>
                            </div>

                            <div className="text-center flex-1">
                                <p className="text-3xl font-bold">{booking.to}</p>
                                <p className="text-sm text-muted-foreground mt-1">Arrival</p>
                                <p className="text-lg font-semibold mt-2">{booking.arrival}</p>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Travel Date</p>
                                    <p className="font-semibold">{new Date(booking.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Passengers</p>
                                    <p className="font-semibold">{booking.passengers}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <p className="font-semibold capitalize">{booking.status}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Price Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Price Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between text-lg">
                                <span>Base Fare ({booking.passengers} passenger{booking.passengers > 1 ? 's' : ''})</span>
                                <span className="font-semibold">
                                    {booking.currency} {booking.totalPrice.toLocaleString()}
                                </span>
                            </div>
                            <div className="border-t pt-3">
                                <div className="flex justify-between text-2xl font-bold">
                                    <span>Total Amount</span>
                                    <span className="text-green-600 dark:text-green-400">
                                        {booking.currency} {booking.totalPrice.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Next Steps */}
                <Card>
                    <CardHeader>
                        <CardTitle>Next Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                            <li>A confirmation email has been sent to your registered email address</li>
                            <li>You'll receive your e-ticket within 24 hours</li>
                            <li>Please check-in online 24 hours before departure</li>
                            <li>Arrive at the airport at least 3 hours before departure for international flights</li>
                        </ol>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-4">
                    <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => router.push('/my-trips')}
                    >
                        View My Trips
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push('/create-new-trip')}
                    >
                        Book Another Flight
                    </Button>
                </div>
            </div>
        </div>
    );
}
