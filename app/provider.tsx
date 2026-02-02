"use client"
import React, { useContext, useEffect, useState } from 'react'
import Header from './_components/Header';
import { useMutation, useConvexAuth } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { UserDetailContext } from '@/context/UserDetailContext';
import { TripContextType, TripDetailContext } from '@/context/TripDetailContext';
import { TripInfo } from './create-new-trip/_components/ChatBox';
import { TooltipProvider } from '@/components/ui/tooltip';
import { handleError } from '@/lib/error-handler';

function Provider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const { isAuthenticated } = useConvexAuth();
    const CreateUser = useMutation(api.user.CreateNewUser)
    const [userDetail, setUserDetail] = useState<any>();
    const [tripDetailInfo, setTripDetailInfo] = useState<TripInfo | null>(() => {
        // Author: Sanket - Restore trip data from localStorage on mount
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('draft-trip');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error('Failed to parse saved trip:', e);
                }
            }
        }
        return null;
    });

    const { user } = useUser();

    useEffect(() => {
        if (user && isAuthenticated) {
            CreateNewUser();
        }
    }, [user, isAuthenticated])

    // Author: Sanket - Save trip data to localStorage whenever it changes
    useEffect(() => {
        if (tripDetailInfo) {
            localStorage.setItem('draft-trip', JSON.stringify(tripDetailInfo));
        } else {
            localStorage.removeItem('draft-trip');
        }
    }, [tripDetailInfo]);

    // Author: Sanket - User creation with proper error handling
    const CreateNewUser = async () => {
        if (user) {
            try {
                // Save New User if Not Exist
                const result = await CreateUser({
                    imageUrl: user?.imageUrl ?? '',
                    name: user?.fullName ?? ''
                });
                setUserDetail(result);
            } catch (e) {
                handleError(e, 'Failed to sync your account. Please refresh the page.');
            }
        }
    }

    return (
        <TooltipProvider>
            <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
                <TripDetailContext.Provider value={{ tripDetailInfo, setTripDetailInfo }}>
                    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
                        <Header />
                        <main className="flex-1 overflow-y-auto relative w-full header-aware-scroll">
                            {children}
                        </main>
                    </div>
                </TripDetailContext.Provider>
            </UserDetailContext.Provider>
        </TooltipProvider>
    )
}

export default Provider

export const useUserDetail = () => {
    return useContext(UserDetailContext);
}

export const useTripDetail = (): TripContextType | undefined => {
    return useContext(TripDetailContext)
}