// Author: Sanket - Enhanced personalization page with flight preferences
'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Save, Sparkles, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import TravelStyleSection from './_components/TravelStyleSection'
import PreferencesSection from './_components/PreferencesSection'
import BudgetSection from './_components/BudgetSection'

export default function PersonalizationPage() {
  const preferences = useQuery(api.userPreferences.getUserPreferences)
  const updatePrefs = useMutation(api.userPreferences.updateUserPreferences)

  const [formData, setFormData] = useState({
    travelStyle: 'Balanced',
    layoverTolerance: '1 Stop',
    averageTripBudget: 2000,
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load preferences when available
  useEffect(() => {
    if (preferences) {
      setFormData({
        travelStyle: preferences.travelStyle || 'Balanced',
        layoverTolerance: preferences.layoverTolerance || '1 Stop',
        averageTripBudget: preferences.averageTripBudget || 2000,
      })
    }
  }, [preferences])

  const handleSave = async () => {
    try {
      setSaving(true)
      setSaved(false)

      await updatePrefs(formData)

      setSaved(true)
      toast.success('Preferences saved successfully!', {
        description: 'Your flight recommendations will now be personalized based on your preferences.'
      })

      // Reset saved state after 3 seconds
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Failed to save preferences', {
        description: 'Please try again later.'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center space-x-2">
                  <Sparkles className="h-6 w-6 text-indigo-600" />
                  <span>Travel Preferences</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  Customize your flight search experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Info Card */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-100 dark:border-indigo-900">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">AI-Powered Flight Recommendations</h3>
                  <p className="text-sm text-muted-foreground">
                    Set your travel preferences below to get personalized flight recommendations.
                    Our AI will analyze flights based on your style, budget, and comfort preferences
                    to show you the best options for your trip.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Travel Style Section */}
          <Card>
            <CardContent className="p-6">
              <TravelStyleSection
                value={formData.travelStyle}
                onChange={(style) => setFormData({ ...formData, travelStyle: style })}
              />
            </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card>
            <CardContent className="p-6">
              <PreferencesSection
                layoverTolerance={formData.layoverTolerance}
                onChange={(prefs) => setFormData({ ...formData, ...prefs })}
              />
            </CardContent>
          </Card>

          {/* Budget Section */}
          <Card>
            <CardContent className="p-6">
              <BudgetSection
                budget={formData.averageTripBudget}
                onChange={(budget) => setFormData({ ...formData, averageTripBudget: budget })}
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Link href="/">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="min-w-[120px]"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>

          {/* How It Works */}
          <Card className="border-muted">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">How AI Personalization Works</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400 font-semibold">
                    1
                  </div>
                  <p>
                    <strong className="text-foreground">Travel Style</strong> determines how we balance price, speed, and comfort in our recommendations.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400 font-semibold">
                    2
                  </div>
                  <p>
                    <strong className="text-foreground">Layover Tolerance</strong> filters flights based on your connection preferences.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400 font-semibold">
                    3
                  </div>
                  <p>
                    <strong className="text-foreground">Budget</strong> helps us highlight flights within your typical spending range.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400 font-semibold">
                    4
                  </div>
                  <p>
                    <strong className="text-foreground">GPT-4o mini</strong> analyzes each flight and generates personalized reasons why it's a good match for you.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}