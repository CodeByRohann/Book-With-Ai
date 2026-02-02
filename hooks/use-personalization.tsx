'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-react";

export interface TravelPreferences {
  preferredBudget: {
    flight: number;
    hotel: number;
    total: number;
  };
  preferredDestinations: string[];
  preferredAirlines: string[];
  preferredHotelCategories: string[];
  travelStyle: string; // "Relaxed" | "Balanced" | "Adventurous"
}

export interface TravelPatterns {
  favoriteDestinations: { name: string; count: number }[];
  averageTripDuration: number;
  preferredBudgetRange: { min: number; max: number; average: number };
  travelFrequency: { totalTrips: number; tripsThisYear: number };
  seasonalPreferences: { [season: string]: number };
  groupSizePreferences: { [size: string]: number };
}

export interface PersonalizationRecommendation {
  name?: string;
  reason: string;
  match?: number;
  category?: string;
  description?: string;
  style?: string;
  range?: string;
}

export const usePersonalization = () => {
  const { user } = useUser();
  const userId = user?.id;

  // Queries
  const preferences = useQuery(api.personalization.getUserPreferences,
    userId ? {} : "skip"
  );

  const travelPatterns = useQuery(api.personalization.getUserTravelPatterns,
    userId ? {} : "skip"
  );

  // Mutations
  const updatePreferences = useMutation(api.personalization.updateUserPreferences);
  const learnFromTrip = useMutation(api.personalization.learnFromTrip);
  const recordInteraction = useMutation(api.personalization.recordUserInteraction);

  // State for recommendations
  const [recommendations, setRecommendations] = useState<{
    destinations: PersonalizationRecommendation[];
    budget: PersonalizationRecommendation[];
    hotels: PersonalizationRecommendation[];
    travelStyle: PersonalizationRecommendation[];
  }>({
    destinations: [],
    budget: [],
    hotels: [],
    travelStyle: []
  });

  // Get recommendations
  const destinationRecs = useQuery(api.personalization.getPersonalizedRecommendations,
    userId ? { type: "destinations" } : "skip"
  );

  const budgetRecs = useQuery(api.personalization.getPersonalizedRecommendations,
    userId ? { type: "budget" } : "skip"
  );

  const hotelRecs = useQuery(api.personalization.getPersonalizedRecommendations,
    userId ? { type: "hotels" } : "skip"
  );

  const travelStyleRecs = useQuery(api.personalization.getPersonalizedRecommendations,
    userId ? { type: "travel_style" } : "skip"
  );

  // Update recommendations when data changes
  useEffect(() => {
    setRecommendations({
      destinations: (destinationRecs as any) || [],
      budget: (budgetRecs as any) || [],
      hotels: (hotelRecs as any) || [],
      travelStyle: (travelStyleRecs as any) || []
    });
  }, [destinationRecs, budgetRecs, hotelRecs, travelStyleRecs]);

  // Learning functions
  const learnFromNewTrip = async (tripData: any) => {
    if (!userId) return;

    try {
      await learnFromTrip({ tripData });
    } catch (error) {
      console.error('Error learning from trip:', error);
    }
  };

  const recordUserAction = async (actionType: string, data: any) => {
    if (!userId) return;

    try {
      await recordInteraction({
        interactionType: actionType,
        data
      });
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  };

  const updateUserPreferences = async (newPreferences: Partial<TravelPreferences>) => {
    if (!userId) return;

    try {
      await updatePreferences({
        ...newPreferences,
        travelStyle: newPreferences.travelStyle
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  // Smart recommendation functions
  const getSmartDestinationSuggestion = useCallback((currentInput: string): string[] => {
    if (!preferences || !currentInput) return [];

    const suggestions = [...(preferences.preferredDestinations || [])];

    // Add popular destinations based on travel style
    if (preferences.travelStyle === 'Relaxed') {
      suggestions.push('Dubai, UAE', 'Maldives', 'Swiss Alps', 'Monaco');
    } else if (preferences.travelStyle === 'Adventurous') {
      suggestions.push('Thailand', 'Portugal', 'Vietnam', 'Czech Republic');
    } else {
      suggestions.push('Paris, France', 'Tokyo, Japan', 'New York, USA', 'Barcelona, Spain');
    }

    // Filter based on current input
    return suggestions
      .filter(dest => dest.toLowerCase().includes(currentInput.toLowerCase()))
      .slice(0, 5);
  }, [preferences]);

  const getSmartBudgetSuggestion = useCallback((destination: string, days: number): number => {
    if (!preferences || !travelPatterns) return 1000;

    const baseAmount = travelPatterns.preferredBudgetRange.average || 1000;

    // Adjust based on destination (simplified logic)
    let multiplier = 1;
    const dest = destination.toLowerCase();

    if (dest.includes('dubai') || dest.includes('maldives') || dest.includes('switzerland')) {
      multiplier = 2.5;
    } else if (dest.includes('thailand') || dest.includes('vietnam') || dest.includes('portugal')) {
      multiplier = 0.6;
    } else if (dest.includes('paris') || dest.includes('london') || dest.includes('tokyo')) {
      multiplier = 1.8;
    }

    // Adjust based on travel style
    if (preferences?.travelStyle === 'Relaxed') {
      multiplier *= 2;
    } else if (preferences?.travelStyle === 'Adventurous') {
      multiplier *= 0.5;
    }

    return Math.round(baseAmount * multiplier * (days / 7));
  }, [preferences, travelPatterns]);

  const getPersonalizedGroupSize = useCallback((): string => {
    if (!travelPatterns?.groupSizePreferences) return 'Just Me';

    const groupPrefs = travelPatterns.groupSizePreferences;
    const mostCommon = Object.entries(groupPrefs)
      .sort(([, a], [, b]) => (b as number) - (a as number))[0];

    return mostCommon ? mostCommon[0] : 'Just Me';
  }, [travelPatterns?.groupSizePreferences]);

  // Confidence scoring
  const getRecommendationConfidence = useCallback((): number => {
    if (!preferences || !travelPatterns) return 0;

    let score = 0;
    const maxScore = 100;

    // Historical data weight (40%)
    if (travelPatterns.travelFrequency.totalTrips > 0) {
      score += Math.min(40, travelPatterns.travelFrequency.totalTrips * 8);
    }

    // Preference completeness (30%)
    let prefScore = 0;
    if (preferences.preferredDestinations && preferences.preferredDestinations.length > 0) prefScore += 10;
    if (preferences.travelStyle && preferences.travelStyle !== 'Balanced') prefScore += 10;
    if (preferences.preferredBudget?.total && preferences.preferredBudget.total > 0) prefScore += 10;
    score += prefScore;

    // Recent activity (30%)
    if (travelPatterns.travelFrequency.tripsThisYear > 0) {
      score += Math.min(30, travelPatterns.travelFrequency.tripsThisYear * 15);
    }

    return Math.min(maxScore, score);
  }, [preferences, travelPatterns]);

  return {
    // Data
    preferences: preferences as TravelPreferences | null,
    travelPatterns: travelPatterns as TravelPatterns | null,
    recommendations,

    // Actions
    updateUserPreferences,
    learnFromNewTrip,
    recordUserAction,

    // Smart suggestions
    getSmartDestinationSuggestion,
    getSmartBudgetSuggestion,
    getPersonalizedGroupSize,
    getRecommendationConfidence,

    // Loading states
    isLoading: preferences === undefined || travelPatterns === undefined,
    hasData: !!preferences && !!travelPatterns,

    // Utils
    userId
  };
};