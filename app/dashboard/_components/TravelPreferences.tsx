import React, { useState, useEffect } from 'react'
import { Plane, Armchair, Pizza, Clock, Wallet, Compass, Accessibility, Users } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'

function TravelPreferences({ preferences, onUpdate }: any) {
    const [data, setData] = useState({
        inFlight: {
            seat: 'Window',
            meal: 'Regular',
            layoverTolerance: '1 Stop'
        },
        travelStyle: {
            type: 'Balanced'
        },
        travelCompanions: 'Solo',
        budget: 2500,
        accessibility: '',
        preferredCabinClass: 'Economy',
    });

    useEffect(() => {
        if (preferences) {
            setData({
                inFlight: preferences.inFlightPreferences || { seat: 'Window', meal: 'Regular', layoverTolerance: '1 Stop' },
                travelStyle: preferences.travelStyle || { type: 'Balanced' },
                travelCompanions: preferences.travelCompanions || 'Solo',
                budget: preferences.preferredBudget?.max || 2500,
                accessibility: preferences.accessibilityNeeds || '',
                preferredCabinClass: preferences.preferredCabinClass || 'Economy',
            });
        }
    }, [preferences]);

    const handleUpdate = (field: string, value: any) => {
        const newData = { ...data, [field]: value };
        setData(newData);
        // Debounce or save on blur in real app, here we just update local state
        // and rely on a parent save or separate save button if needed.
        // For smoother UX, let's auto-save on button clicks.
        onUpdate({
            ...preferences,
            inFlightPreferences: newData.inFlight,
            travelStyle: newData.travelStyle,
            travelCompanions: newData.travelCompanions,
            preferredBudget: { ...preferences?.preferredBudget, max: newData.budget },
            accessibilityNeeds: newData.accessibility,
            preferredCabinClass: newData.preferredCabinClass
        });
    }

    const handleNestedUpdate = (parent: string, field: string, value: string) => {
        const newData: any = { ...data };
        newData[parent][field] = value;
        setData(newData);
        handleUpdate(parent, newData[parent]);
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm mt-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                    <Plane className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Travel Preferences</h3>
                    <p className="text-sm text-gray-500">Customize your travel experience</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Default Travel Setup */}
                <div className="space-y-4">
                    <Label className="font-semibold text-gray-900 dark:text-white">Preferred Cabin Class</Label>
                    <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl">
                        {['Economy', 'Premium', 'Business'].map((cls) => (
                            <button
                                key={cls}
                                onClick={() => handleUpdate('preferredCabinClass', cls)}
                                className={`py-2 text-sm font-medium rounded-lg transition-all ${data.preferredCabinClass === cls ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {cls}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" /> Typical Travel Type</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {['Solo', 'Family', 'Business', 'Couple'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => handleUpdate('travelCompanions', type)}
                                    className={`py-2 px-3 text-sm rounded-xl border flex items-center justify-center gap-2 ${data.travelCompanions === type
                                        ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800" />

                {/* In-Flight Preferences */}
                <div className="space-y-4">
                    <h4 className="font-bold text-gray-700 dark:text-gray-300">In-Flight Preferences</h4>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs text-gray-400 flex items-center gap-1"><Armchair className="w-3 h-3" /> Seat Preference</Label>
                            <div className="flex bg-gray-50 dark:bg-gray-800 rounded-lg p-1">
                                {['Window', 'Aisle', 'Any'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => handleNestedUpdate('inFlight', 'seat', opt)}
                                        className={`flex-1 py-1.5 text-xs rounded-md ${data.inFlight.seat === opt ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-gray-400 flex items-center gap-1"><Pizza className="w-3 h-3" /> Meal Preference</Label>
                            <select
                                value={data.inFlight.meal}
                                onChange={(e) => handleNestedUpdate('inFlight', 'meal', e.target.value)}
                                className="w-full text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-lg p-2"
                            >
                                <option>Regular</option>
                                <option>Vegetarian</option>
                                <option>Vegan</option>
                                <option>Gluten Free</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Layover Tolerance</Label>
                            <div className="flex bg-gray-50 dark:bg-gray-800 rounded-lg p-1">
                                {['Nonstop', '1 Stop', 'Any'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => handleNestedUpdate('inFlight', 'layoverTolerance', opt)}
                                        className={`flex-1 py-1.5 text-xs rounded-md ${data.inFlight.layoverTolerance === opt ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800" />

                {/* Budget & Style */}
                <div className="space-y-6">
                    <h4 className="font-bold text-gray-700 dark:text-gray-300">Budget & Travel Style</h4>

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <Label className="flex items-center gap-2"><Wallet className="w-4 h-4 text-gray-400" /> Average Trip Budget</Label>
                            <span className="font-bold text-blue-600">₹{data.budget.toLocaleString()}</span>
                        </div>
                        <Slider
                            value={[data.budget]}
                            max={10000}
                            step={100}
                            onValueChange={(val) => {
                                setData({ ...data, budget: val[0] });
                                // onUpdate logic requires debounce, omitting for brevity in this step
                            }}
                            onValueCommit={(val) => handleUpdate('budget', val[0])}
                            className="py-4"
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>₹500</span>
                            <span>₹10,000+</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Compass className="w-4 h-4 text-gray-400" /> Travel Style</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Relaxed', 'Balanced', 'Adventurous'].map(style => (
                                <button
                                    key={style}
                                    onClick={() => handleNestedUpdate('travelStyle', 'type', style)}
                                    className={`py-2 px-3 text-sm rounded-xl border ${data.travelStyle.type === style
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-white border-gray-200 text-gray-600'
                                        }`}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Accessibility */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Accessibility className="w-4 h-4 text-gray-400" /> Accessibility Needs</Label>
                    <Textarea
                        placeholder="E.g., Wheelchair assistance, priority boarding..."
                        value={data.accessibility}
                        onChange={(e) => setData({ ...data, accessibility: e.target.value })}
                        onBlur={(e) => handleUpdate('accessibility', e.target.value)}
                        className="bg-gray-50 dark:bg-gray-800 border-none resize-none"
                    />
                    <p className="text-xs text-gray-400">We'll include this in all your bookings</p>
                </div>
            </div>

            <div className="mt-6 p-3 bg-green-50 text-green-700 text-sm rounded-xl flex items-center gap-2 border border-green-100">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Preferences saved and applied to all searches automatically
            </div>
        </div>
    )
}

export default TravelPreferences
