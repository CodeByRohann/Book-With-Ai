// Author: Sanket - Custom user profile dropdown replacing Clerk UserButton
'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { User, Settings, LogOut, Plane } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CustomUserButton() {
    const { user } = useUser()
    const { signOut } = useClerk()
    const router = useRouter()

    if (!user) return null

    const handleSignOut = async () => {
        await signOut()
        router.push('/')
    }

    // Get user initials for avatar
    const initials = user.firstName && user.lastName
        ? `${user.firstName[0]}${user.lastName[0]}`
        : user.emailAddresses[0]?.emailAddress[0].toUpperCase() || 'U'

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:shadow-lg transition-shadow">
                    {initials}
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                    <div className="flex items-center gap-3 py-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">
                                {user.firstName && user.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user.emailAddresses[0]?.emailAddress}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {user.emailAddresses[0]?.emailAddress}
                            </p>
                        </div>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <Link href="/personalization">
                    <DropdownMenuItem className="cursor-pointer">
                        <Plane className="w-4 h-4 mr-2" />
                        Travel Preferences
                    </DropdownMenuItem>
                </Link>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
