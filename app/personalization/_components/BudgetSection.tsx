// Author: Sanket - Budget slider component for average trip budget
'use client'

import { Slider } from '@/components/ui/slider'
import { IndianRupee } from 'lucide-react'

interface BudgetSectionProps {
    budget: number
    onChange: (budget: number) => void
}

export default function BudgetSection({ budget, onChange }: BudgetSectionProps) {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold text-foreground">Budget & Trip Details</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Set your typical trip budget to get better recommendations
                </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-6 rounded-xl border border-indigo-100 dark:border-indigo-900">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center">
                        <IndianRupee className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground">
                            Average Trip Budget
                        </label>
                        <div className="text-3xl font-bold text-foreground">
                            ₹{budget.toLocaleString()}
                        </div>
                    </div>
                </div>

                <Slider
                    min={500}
                    max={10000}
                    step={100}
                    value={[budget]}
                    onValueChange={([value]) => onChange(value)}
                    className="w-full"
                />

                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>₹500</span>
                    <span>₹5,000</span>
                    <span>₹10,000</span>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                    {budget < 1500 && "Budget-conscious traveler"}
                    {budget >= 1500 && budget < 4000 && "Moderate budget"}
                    {budget >= 4000 && budget < 7000 && "Comfortable budget"}
                    {budget >= 7000 && "Premium traveler"}
                </div>
            </div>
        </div>
    )
}
