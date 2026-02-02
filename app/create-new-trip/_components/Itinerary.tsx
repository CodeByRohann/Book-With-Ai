"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { ArrowLeft, Clock, MapPin, Star, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import HotelCardItem from './HotelCardItem';
import PlaceCardItem from './PlaceCardItem';
import { Trip } from '@/utils/custom_types';
import { TripInfo, Hotel, Itinerary as ItineraryType, Activity } from './ChatBox';

type Props = {
    trip?: Trip
}

function Itinerary({ trip }: Props) {

    // Fallback if trip is not passed (though it should be)
    const tripData = trip?.tripDetail;

    if (!tripData) return null;

    return (
        <div className="space-y-12">

            {/* Hotels Section */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                        <Star className="w-5 h-5 fill-current" />
                    </div>
                    <h2 className='font-bold text-2xl text-gray-900 dark:text-white'>Hotel Recommendations</h2>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {tripData?.hotels?.map((hotel: Hotel, index: number) => (
                        <HotelCardItem key={`hotel-${index}`} hotel={hotel} />
                    ))}
                </div>
            </section>

            {/* Daily Itinerary Section */}
            <section>
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <h2 className='font-bold text-2xl text-gray-900 dark:text-white'>Day by Day Plan</h2>
                </div>

                <div className="relative border-l-2 border-dashed border-gray-200 dark:border-gray-800 ml-5 space-y-12 pb-10">
                    {tripData?.itinerary?.map((dayData: ItineraryType, dayIndex: number) => (
                        <div key={`day-${dayIndex}`} className="relative pl-10">
                            {/* Day Marker */}
                            <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-blue-600 border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-md z-10">
                                <span className="text-white text-xs font-bold">{dayData.day}</span>
                            </div>

                            {/* Header */}
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    Day {dayData.day}
                                    <span className="text-sm font-medium px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                        {dayData.best_time_to_visit_day || "Full Day"}
                                    </span>
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                                    {dayData.day_plan}
                                </p>
                            </div>

                            {/* Activities Grid */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                {dayData?.activities?.map((activity: Activity, index: number) => (
                                    <PlaceCardItem key={`place-${dayIndex}-${index}`} activity={activity} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Itinerary