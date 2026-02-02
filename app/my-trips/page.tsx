"use client"
import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import { useConvex, useMutation, useQuery } from 'convex/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { useUserDetail } from '../provider';
import { ArrowBigRightIcon, Plane } from 'lucide-react';
import FlightBookingCard from './_components/FlightBookingCard';
import { Skeleton } from '@/components/ui/skeleton';

function MyTrips() {
    const { userDetail } = useUserDetail();

    // Fetch Real Flight Bookings
    const flightBookings = useQuery(api.tripDetail.getUpcomingFlights) || [];
    const deleteMockFlights = useMutation(api.tripDetail.deleteMockFlights);

    useEffect(() => {
        if (userDetail) {
            // Remove mock data as requested
            deleteMockFlights();
        }
    }, [userDetail]);

    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen'>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <Plane className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className='font-bold text-3xl text-foreground tracking-tight'>My Trips</h2>
                        <p className="text-gray-500 dark:text-gray-400">View and manage your upcoming and past bookings</p>
                    </div>
                </div>
                <div className="hidden md:block">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">Live Updates Active</span>
                    </div>
                </div>
            </div>

            {/* Author: Sanket - Loading state while fetching bookings */}
            {flightBookings === undefined ? (
                <div className="space-y-6 mt-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="border rounded-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                            <div className="flex items-center gap-8">
                                <Skeleton className="h-12 w-24" />
                                <Skeleton className="h-px flex-1" />
                                <Skeleton className="h-12 w-24" />
                            </div>
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-10 w-32" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : flightBookings.length === 0 ? (
                <div className='p-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl flex flex-col items-center justify-center gap-6 mt-6 bg-gray-50/50 dark:bg-card/50'>
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <ArrowBigRightIcon className="w-10 h-10 text-blue-600 dark:text-blue-400 opacity-50" />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">No trips planned yet</h2>
                        <p className="text-muted-foreground">Start a new chat to plan your first adventure!</p>
                    </div>
                    <Link href={'/create-new-trip'}>
                        <Button className="rounded-full px-8 bg-blue-600 hover:bg-blue-700 h-10">Create New Trip</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-10 mt-6">
                    {/* Upcoming Trips Section */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                            Upcoming Trips
                            <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{flightBookings.length}</span>
                        </h3>
                        <div className='flex flex-col gap-6'>
                            {flightBookings.map((flight, index) => (
                                <FlightBookingCard key={index} flight={flight} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyTrips