// Author: Sanket - Preferences section for flight booking preferences
'use client'

import { Button } from '@/components/ui/button'

interface PreferencesSectionProps {
    layoverTolerance: string
    onChange: (prefs: { layoverTolerance?: string }) => void
}

const layoverOptions = [
    { value: "Nonstop", label: "Nonstop", description: "Direct flights only" },
    { value: "1 Stop", label: "1 Stop", description: "Max 1 layover" },
    { value: "Any", label: "Any", description: "Any number of stops" }
]

export default function PreferencesSection({ layoverTolerance, onChange }: PreferencesSectionProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-foreground">Flight Preferences</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Set your preferences for flight connections and layovers
                </p>
            </div>

            {/* Layover Tolerance */}
            <div>
                <label className="block text-sm font-medium mb-3">Layover Tolerance</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {layoverOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => onChange({ layoverTolerance: option.value })}
                            className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 text-left ${layoverTolerance === option.value
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                    : 'bg-background border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                                }`}
                        >
                            <div className="font-medium">{option.label}</div>
                            <div className={`text-xs mt-1 ${layoverTolerance === option.value ? 'text-indigo-100' : 'text-muted-foreground'
                                }`}>
                                {option.description}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
