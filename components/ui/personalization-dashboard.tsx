'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  TrendingUp,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Star,
  Target,
  BarChart3,
  Settings,
  Sparkles,
  Heart
} from 'lucide-react';
import { usePersonalization } from '@/hooks/use-personalization';

export const PersonalizationDashboard: React.FC = () => {
  const {
    preferences,
    travelPatterns,
    recommendations,
    getRecommendationConfidence,
    isLoading,
    hasData,
    recordUserAction
  } = usePersonalization();

  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 animate-pulse" />
          <span>Analyzing your travel preferences...</span>
        </div>
        <Progress value={60} className="w-full" />
      </div>
    );
  }

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>Start Your Journey</span>
          </CardTitle>
          <CardDescription>
            Plan a few trips to unlock personalized recommendations powered by AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your travel assistant learns from your preferences and trip history to provide smarter suggestions.
          </p>
        </CardContent>
      </Card>
    );
  }

  const confidence = getRecommendationConfidence();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary" />
            <span>AI Travel Assistant</span>
          </h2>
          <p className="text-muted-foreground">
            Personalized recommendations based on your travel patterns
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={confidence > 70 ? "default" : confidence > 40 ? "secondary" : "outline"}>
            {confidence}% Confidence
          </Badge>
          <Target className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="patterns">Travel Patterns</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Travel Style */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Star className="h-4 w-4" />
                  <span>Travel Style</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {preferences?.travelStyle || 'Balanced'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {preferences?.travelStyle === 'Relaxed' && 'Premium experiences and comfort'}
                  {preferences?.travelStyle === 'Adventurous' && 'Value-focused adventures'}
                  {preferences?.travelStyle === 'Balanced' && 'Perfect mix of comfort and value'}
                </p>
              </CardContent>
            </Card>

            {/* Total Trips */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Travel History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {travelPatterns?.travelFrequency.totalTrips || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total trips planned ({travelPatterns?.travelFrequency.tripsThisYear || 0} this year)
                </p>
              </CardContent>
            </Card>

            {/* Average Budget */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Budget Range</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${travelPatterns?.preferredBudgetRange.average?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average trip budget
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <span>Quick Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.destinations.slice(0, 2).map((dest, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{dest.name}</p>
                      <p className="text-xs text-muted-foreground">{dest.reason}</p>
                    </div>
                    <Badge variant="outline">{dest.match}% match</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Destination Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Recommended Destinations</span>
                </CardTitle>
                <CardDescription>
                  Based on your travel history and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.destinations.map((dest, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium">{dest.name}</p>
                      <p className="text-sm text-muted-foreground">{dest.reason}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{dest.match}% match</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => recordUserAction('favorite_destination', { destination: dest.name })}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Budget Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Budget Recommendations</span>
                </CardTitle>
                <CardDescription>
                  Suggested budget ranges for your trips
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.budget.map((budget, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{budget.range}</p>
                      <Badge variant="outline">{budget.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{budget.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Hotel Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Hotel Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.hotels.map((hotel, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <p className="font-medium">{hotel.category}</p>
                    <p className="text-sm text-muted-foreground">{hotel.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Travel Style Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Travel Styles</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.travelStyle.map((style, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <p className="font-medium">{style.style}</p>
                    <p className="text-sm text-muted-foreground">{style.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Favorite Destinations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Favorite Destinations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {travelPatterns?.favoriteDestinations?.length ? (
                  <div className="space-y-2">
                    {travelPatterns.favoriteDestinations.map((dest, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span>{dest.name}</span>
                        <Badge variant="secondary">{dest.count} visits</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No destinations visited yet</p>
                )}
              </CardContent>
            </Card>

            {/* Seasonal Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Seasonal Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {travelPatterns?.seasonalPreferences && Object.entries(travelPatterns.seasonalPreferences).map(([season, count]) => (
                    <div key={season} className="flex items-center space-x-3">
                      <span className="capitalize w-16">{season}</span>
                      <Progress value={(count / Math.max(...Object.values(travelPatterns.seasonalPreferences))) * 100} className="flex-1" />
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Group Size Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Group Size Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {travelPatterns?.groupSizePreferences && Object.entries(travelPatterns.groupSizePreferences).map(([size, count]) => (
                    <div key={size} className="flex items-center justify-between">
                      <span>{size}</span>
                      <Badge variant="outline">{count} trips</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Travel Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Travel Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Average Trip Duration</span>
                      <span className="font-medium">{travelPatterns?.averageTripDuration || 0} days</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Budget Range</span>
                      <span className="font-medium">
                        ${travelPatterns?.preferredBudgetRange.min?.toLocaleString() || '0'} -
                        ${travelPatterns?.preferredBudgetRange.max?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Your Travel Preferences</span>
              </CardTitle>
              <CardDescription>
                These preferences are learned from your trip history and can influence future recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Preferred Destinations</h4>
                <div className="flex flex-wrap gap-2">
                  {preferences?.preferredDestinations?.map((dest, index) => (
                    <Badge key={index} variant="secondary">{dest}</Badge>
                  )) || <span className="text-sm text-muted-foreground">None yet</span>}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Travel Style</h4>
                <Badge variant="default" className="capitalize">
                  {preferences?.travelStyle || 'Balanced'}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium mb-2">Preferred Airlines</h4>
                <div className="flex flex-wrap gap-2">
                  {preferences?.preferredAirlines?.length ?
                    preferences.preferredAirlines.map((airline, index) => (
                      <Badge key={index} variant="outline">{airline}</Badge>
                    )) :
                    <span className="text-sm text-muted-foreground">None specified</span>
                  }
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Hotel Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {preferences?.preferredHotelCategories?.length ?
                    preferences.preferredHotelCategories.map((category, index) => (
                      <Badge key={index} variant="outline">{category}</Badge>
                    )) :
                    <span className="text-sm text-muted-foreground">None specified</span>
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};