'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sparkles,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  Brain,
  Target,
  TrendingUp
} from 'lucide-react';
import { usePersonalization } from '@/hooks/use-personalization';

interface SmartSuggestionsProps {
  currentDestination?: string;
  currentBudget?: string;
  currentDays?: number;
  currentGroupSize?: string;
  onSuggestionApply?: (type: string, value: any) => void;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  currentDestination = '',
  currentBudget = '',
  currentDays = 0,
  currentGroupSize = '',
  onSuggestionApply
}) => {
  const {
    getSmartDestinationSuggestion,
    getSmartBudgetSuggestion,
    getPersonalizedGroupSize,
    getRecommendationConfidence,
    recordUserAction,
    preferences,
    hasData
  } = usePersonalization();

  // Compute suggestions directly without useEffect to avoid infinite loops
  const destinationSuggestions = hasData && currentDestination
    ? getSmartDestinationSuggestion(currentDestination)
    : [];

  const smartBudget = hasData && currentDestination && currentDays > 0
    ? getSmartBudgetSuggestion(currentDestination, currentDays)
    : 0;

  const personalizedGroupSize = hasData
    ? getPersonalizedGroupSize()
    : '';

  if (!hasData) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-6">
          <div className="text-center space-y-2">
            <Brain className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Create a few trips to unlock AI-powered suggestions
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const confidence = getRecommendationConfidence();

  return (
    <div className="space-y-4">
      {/* AI Assistant Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-medium">AI Travel Assistant</span>
        </div>
        <Badge variant={confidence > 70 ? "default" : "secondary"}>
          {confidence}% confident
        </Badge>
      </div>

      <div className="grid gap-4">
        {/* Destination Suggestions */}
        {destinationSuggestions.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Recommended Destinations</span>
                <Badge variant="outline" className="text-xs">
                  Based on your history
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {destinationSuggestions.slice(0, 4).map((destination, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => {
                      onSuggestionApply?.('destination', destination);
                      recordUserAction('suggestion_applied', { type: 'destination', value: destination });
                    }}
                  >
                    {destination}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Smart Budget Suggestion */}
        {smartBudget > 0 && currentDestination && currentDays > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Smart Budget</span>
                <Badge variant="outline" className="text-xs">
                  For {currentDays} days in {currentDestination}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">${smartBudget.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    Based on your {preferences?.travelStyle} style
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    onSuggestionApply?.('budget', smartBudget.toString());
                    recordUserAction('suggestion_applied', { type: 'budget', value: smartBudget });
                  }}
                >
                  Apply
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personalized Group Size */}
        {personalizedGroupSize && personalizedGroupSize !== currentGroupSize && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Suggested Group Size</span>
                <Badge variant="outline" className="text-xs">
                  Your usual preference
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{typeof personalizedGroupSize === 'string' ? personalizedGroupSize : JSON.stringify(personalizedGroupSize)}</p>
                  <p className="text-xs text-muted-foreground">
                    Most common in your trips
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    onSuggestionApply?.('groupSize', personalizedGroupSize);
                    recordUserAction('suggestion_applied', { type: 'group_size', value: personalizedGroupSize });
                  }}
                >
                  Apply
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Travel Style Insight */}
        {preferences?.travelStyle && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-center space-x-3">
                <Target className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Your travel style: <span className="capitalize">{preferences.travelStyle}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {preferences.travelStyle === 'Relaxed' && 'Focusing on premium experiences and comfort'}
                    {preferences.travelStyle === 'Adventurous' && 'Optimizing for value and affordable adventures'}
                    {preferences.travelStyle === 'Balanced' && 'Perfect balance of comfort and value'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

interface PersonalizedInputProps {
  type: 'destination' | 'budget' | 'days' | 'groupSize';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const PersonalizedInput: React.FC<PersonalizedInputProps> = ({
  type,
  value,
  onChange,
  placeholder,
  className
}) => {
  const {
    getSmartDestinationSuggestion,
    hasData,
    recordUserAction
  } = usePersonalization();

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (type === 'destination' && hasData && value.length > 1 && getSmartDestinationSuggestion) {
      const destSuggestions = getSmartDestinationSuggestion(value);
      setSuggestions(destSuggestions);
      setShowSuggestions(destSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value, type, hasData]);

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    recordUserAction('autocomplete_used', { type, suggestion });
  };

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />

      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-40 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="w-full px-3 py-2 text-left hover:bg-muted transition-colors text-sm border-b last:border-b-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-center space-x-2">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span>{suggestion}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  AI suggestion
                </Badge>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};