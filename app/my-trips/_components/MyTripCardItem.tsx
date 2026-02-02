'use client'
import React, { useEffect, useState } from 'react'
import { Trip } from '@/utils/custom_types'
import Image from 'next/image'
import { ArrowBigRightIcon } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

type Props = {
    trip: Trip
}

function MyTripCardItem({ trip }: Props) {
    const [photoUrl, setPhotoUrl] = useState<string>();
    useEffect(() => {
        trip && GetGooglePlaceDetail();
    }, [trip])

    const GetGooglePlaceDetail = async () => {
        const result = await axios.post('/api/google-place-detail', {
            placeName: trip?.tripDetail?.destination
        });
        if (result?.data?.e) {
            return;
        }
        setPhotoUrl(result?.data);
    }
    return (
        <Link href={'/view-trip/' + trip?.tripId} className='group p-4 bg-white dark:bg-card border border-border/50 rounded-3xl hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 hover:-translate-y-1 block h-full'>
            <div className="relative overflow-hidden rounded-2xl h-[240px] mb-4">
                <Image src={photoUrl ? photoUrl : '/placeholder.jpg'} alt={trip.tripId} fill
                    className='object-cover group-hover:scale-105 transition-transform duration-500'
                    unoptimized={true}
                />
            </div>
            <div className="px-1">
                <h2 className='flex items-center gap-2 font-bold text-lg text-foreground mb-1 mt-2 line-clamp-1'>
                    {trip?.tripDetail?.origin}
                    <ArrowBigRightIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    {trip?.tripDetail?.destination}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-medium px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-lg">
                        {trip?.tripDetail?.duration}
                    </span>
                    <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg">
                        {trip?.tripDetail?.budget} Budget
                    </span>
                </div>
            </div>
        </Link>
    )
}

export default MyTripCardItem