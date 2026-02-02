import React from 'react'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Info, Plane, CreditCard, Tag } from 'lucide-react'
import { Trip } from '@/utils/custom_types'
import Link from 'next/link'

type Props = {
    trip: Trip
}

function MyTripListItem({ trip }: Props) {
    // Mocking missing data for the UI demo based on design
    const bookingRef = Math.random().toString(36).substring(2, 7).toUpperCase();
    const budget = Number(trip.tripDetail?.budget) || 0;
    const flightClass = budget > 10000 ? 'Business' : 'Economy';

    // Use real data if available, else show placeholders
    const displayDate = trip.tripDetail?.startDate ? new Date(trip.tripDetail.startDate).toLocaleDateString() : "Date TBD";
    const displayTime = "TBD"; // Times are usually in itinerary details, not top-level trip info yet

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                {/* Icon Section */}
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
                    <Plane className="w-8 h-8 text-white" />
                </div>

                {/* Main Info */}
                <div className="flex-1 space-y-4">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                                {trip?.tripDetail?.origin} <span className="text-gray-400">→</span> {trip?.tripDetail?.destination}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                {trip.tripDetail?.budget} Budget Trip
                            </p>
                        </div>
                        <span className="px-3 py-1 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs font-bold uppercase tracking-wider rounded-lg border border-green-100 dark:border-green-900 self-start md:self-auto">
                            Confirmed
                        </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2">
                        <div className="flex gap-3 items-start">
                            <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase">Date</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">{displayDate}</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase">Time</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">{displayTime}</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <CreditCard className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase">Class</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">{flightClass}</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase">Booking Ref</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 font-mono">{bookingRef}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-3">
                <Link href={'/view-trip/' + trip?.tripId}>
                    <Button variant="outline" className="rounded-xl border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800">
                        View Details
                    </Button>
                </Link>
                <Button variant="outline" className="rounded-xl border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800">
                    Check-in
                </Button>
                <Button variant="outline" className="rounded-xl border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800">
                    Manage Booking
                </Button>
            </div>
        </div>
    )
}

export default MyTripListItem
