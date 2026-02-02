"use client"
import { Button } from '@/components/ui/button'
import { SignInButton, useUser } from '@clerk/nextjs'
import CustomUserButton from '@/components/ui/custom-user-button'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { useTripDetail } from '../provider'
import { ThemeToggle } from '@/components/theme-toggle'
import NotificationCenter from '@/components/ui/notification-center'
import { Home, Plane, Bell, Map, Bookmark, FileText, Award, TrendingUp } from 'lucide-react'

const menuOptions = [
    {
        icon: <Home className="w-5 h-5" />,
        path: '/'
    },
    {
        icon: <Plane className="w-5 h-5" />,
        path: '/my-trips'
    },
    {
        icon: <Bell className="w-5 h-5" />,
        path: '/price-alerts'
    },
    {
        icon: <Map className="w-5 h-5" />,
        path: '/explore'
    },
    {
        icon: <Award className="w-5 h-5" />,
        path: '/loyalty-program'
    },
    {
        icon: <FileText className="w-5 h-5" />,
        path: '/create-new-trip'
    }
]

function Header() {
    // Author: Sanket - Proper type-safe context usage
    const tripContext = useTripDetail();
    const { tripDetailInfo, setTripDetailInfo } = tripContext || { tripDetailInfo: null, setTripDetailInfo: () => { } };

    const { user } = useUser();
    const path = usePathname();

    return (
        <>
            {/* Desktop & Tablet Header */}
            <div className='p-3 px-4 shadow-sm border-b bg-white dark:bg-background/95 sticky top-0 z-50'>
                <div className='max-w-7xl mx-auto flex justify-between items-center'>
                    {/* Logo  */}
                    <div className='flex items-center gap-3'>
                        <div className="relative w-10 h-10">
                            <Image src={'/logo-small.png'} alt='logo' fill className='object-contain rounded-lg' />
                        </div>
                        <h2 className='font-bold text-xl text-foreground tracking-tight'>Book With Ai</h2>
                    </div>

                    {/* Center Icon Navigation - Hidden on Mobile */}
                    <div className='hidden md:flex items-center gap-2'>
                        {menuOptions.map((menu, index) => (
                            <Link key={index} href={menu.path}>
                                <div className={`px-4 py-2.5 rounded-full flex items-center gap-2 transition-all duration-200 font-medium text-sm
                                ${path == menu.path
                                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                        : 'text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-foreground'
                                    }`}>
                                    {menu.icon}
                                    <span className="hidden lg:inline">{menu.path === '/' ? 'Home' : menu.path.replace('/', '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Right Section */}
                    <div className='flex gap-3 items-center'>
                        <ThemeToggle />

                        {!user ?
                            <div className='flex gap-3 items-center'>
                                <Link href='/sign-in'>
                                    <div className="font-medium text-sm px-4 py-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors cursor-pointer">Sign In</div>
                                </Link>
                                <Link href='/sign-up'>
                                    <div className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors cursor-pointer">Get Started</div>
                                </Link>
                            </div> :
                            <div className='flex items-center gap-3 pl-2'>
                                <CustomUserButton />
                            </div>
                        }
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className='fixed bottom-0 left-0 right-0 border-t bg-white dark:bg-background/95 backdrop-blur z-50 md:hidden pb-safe'>
                <div className='flex justify-around items-center p-3'>
                    {menuOptions.map((menu, index) => (
                        <Link key={index} href={menu.path}>
                            <div className={`p-3 rounded-full transition-all duration-200 flex flex-col items-center gap-1
                                ${path == menu.path
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-muted-foreground'
                                }`}>
                                {menu.icon}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    )
}

export default Header