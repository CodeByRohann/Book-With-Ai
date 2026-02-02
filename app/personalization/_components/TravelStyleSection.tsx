// Author: Sanket - Travel style selector component for profile page
'use client'

import { Coffee, Scale, Backpack } from 'lucide-react'

interface TravelStyle {
    id: string
    icon: React.ReactNode
    title: string
    description: string
    weights: string
}

const travelStyles: TravelStyle[] = [
    {
        id: "Relaxed",
        icon: <Coffee className="w-8 h-8" />,
        title: "Relaxed",
        description: "Comfort over cost, prefer nonstop flights",
        weights: "30% price, 20% speed, 50% comfort"
    },
    {
        id: "Balanced",
        icon: <Scale className="w-8 h-8" />,
        title: "Balanced",
        description: "Good mix of price, speed, and comfort",
        weights: "40% price, 30% speed, 30% comfort"
    },
    {
        id: "Adventurous",
        icon: <Backpack className="w-8 h-8" />,
        title: "Adventurous",
        description: "Budget-focused, don't mind layovers",
        weights: "50% price, 40% speed, 10% comfort"
    }
]

interface TravelStyleSectionProps {
    value: string
    onChange: (style: string) => void
}

export default function TravelStyleSection({ value, onChange }: TravelStyleSectionProps) {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold text-foreground">Travel Style</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Choose your preferred travel style to get personalized flight recommendations
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {travelStyles.map(style => (
                    <button
                        key={style.id}
                        onClick={() => onChange(style.id)}
                        className={`p-6 border-2 rounded-xl transition-all duration-200 text-left ${value === style.id
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 shadow-lg scale-105'
                                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:shadow-md'
                            }`}
                    >
                        <div className={`mb-3 ${value === style.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
                            {style.icon}
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{style.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{style.description}</p>
                        <div className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                            {style.weights}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
