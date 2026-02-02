"use client"
import React, { useEffect, useState, Suspense } from 'react'
import ChatBox from './_components/ChatBox'
import Itinerary from './_components/Itinerary'
import { useTripDetail } from '../provider';
import SmartMap from './_components/SmartMap';
import { Button } from '@/components/ui/button';
import { Globe, Globe2, Plane } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import AppSidebar from '../_components/AppSidebar';
import { ErrorBoundary } from '@/components/error-boundary';

function CreateNewTrip() {
    // Author: Sanket - Type-safe context usage without data loss on mount
    const tripContext = useTripDetail();
    const { tripDetailInfo, setTripDetailInfo } = tripContext || { tripDetailInfo: null, setTripDetailInfo: () => { } };

    return (
        <div className='flex h-full bg-gray-50 dark:bg-gray-900 overflow-hidden'>
            {/* Sidebar Navigation */}
            <div className='hidden lg:block z-50'>
                <AppSidebar />
            </div>

            {/* Main Content Area */}
            <div className='flex-1 lg:ml-72 relative h-full bg-white dark:bg-gray-900'>
                <div className='h-full flex flex-col'>
                    {/* Chat Box takes full height */}
                    <div className='flex-1 overflow-hidden'>
                        {/* Author: Sanket - Error boundary protects chat from crashes */}
                        <ErrorBoundary fallback={<div className="p-8 text-center text-gray-600">Failed to load chat. Please refresh the page.</div>}>
                            <Suspense fallback={<div className="p-4">Loading chat...</div>}>
                                <ChatBox />
                            </Suspense>
                        </ErrorBoundary>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateNewTrip