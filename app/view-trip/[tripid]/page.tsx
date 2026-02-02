"use client"
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import SmartMap from '@/app/create-new-trip/_components/SmartMap';
import Itinerary from '@/app/create-new-trip/_components/Itinerary';
import { Trip } from '@/utils/custom_types';
import { useTripDetail, useUserDetail } from '@/app/provider';
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react';
import { useParams } from 'next/navigation'

function ViewTrip() {

    const { tripid } = useParams();
    const { userDetail, setUserDetail } = useUserDetail();
    const convex = useConvex();
    const [tripData, setTripData] = useState<Trip>();
    // Author: Sanket - Type-safe context usage
    const tripContext = useTripDetail();
    const { tripDetailInfo, setTripDetailInfo } = tripContext || { tripDetailInfo: null, setTripDetailInfo: () => { } };
    useEffect(() => {
        if (userDetail) {
            GetTrip();
        }
    }, [userDetail])

    const GetTrip = async () => {
        if (!userDetail) return;

        const result = await convex.query(api.tripDetail.GetTripById, {
            tripid: tripid + ''
        });
        console.log(result);
        setTripData(result);
        setTripDetailInfo(result?.tripDetail)
    }

    return (
        <div className='h-[calc(100vh-64px)] overflow-hidden bg-gray-50 dark:bg-black'>
            <div className='h-full flex'>
                {/* Left Content - Scrollable */}
                <div className='flex-1 h-full overflow-y-auto'>
                    <div className="max-w-4xl mx-auto p-6 md:p-10 pb-20">
                        {/* Trip Header */}
                        {tripData?.tripDetail && (
                            <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="relative h-64 w-full rounded-[32px] overflow-hidden mb-8 shadow-xl">
                                    <Image
                                        src="/placeholder.jpg"
                                        alt="Trip Cover"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                    <div className="absolute bottom-6 left-8 text-white">
                                        <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg">
                                            {tripData?.tripDetail?.destination}
                                        </h1>
                                        <div className="flex gap-4 items-center text-white/90 font-medium">
                                            <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm">
                                                {tripData?.tripDetail?.duration} Days
                                            </span>
                                            <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm">
                                                {tripData?.tripDetail?.budget} Budget
                                            </span>
                                            <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm">
                                                {tripData?.tripDetail?.group_size} Travelers
                                            </span>
                                        </div>
                                    </div>
                                    <Button className='absolute top-6 right-6 bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-0 rounded-full h-10 w-10 p-0 flex items-center justify-center'>
                                        <ExternalLink className='w-5 h-5' />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Itinerary Timeline */}
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                            <Itinerary trip={tripData} />
                        </div>
                    </div>
                </div>

                {/* Right Map - Sticky/Fixed */}
                <div className='hidden xl:block w-[450px] h-full border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 relative z-10'>
                    <div className="absolute inset-0">
                        <SmartMap />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ViewTrip