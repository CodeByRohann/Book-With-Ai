// Author: Sanket
// React error boundary to gracefully handle component crashes
'use client';

import React from 'react';
import { Button } from './ui/button';

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

/**
 * Error boundary component that catches React errors and displays a fallback UI
 * Prevents entire application crashes from component-level errors
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error details for debugging
        console.error('Error Boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Show custom fallback or default error UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex items-center justify-center min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-red-600 dark:text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                            Oops! Something went wrong
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            We encountered an unexpected error. Please try refreshing the page or go back to continue.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button
                                onClick={() => window.location.reload()}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Refresh Page
                            </Button>
                            <Button
                                onClick={() => window.history.back()}
                                variant="outline"
                            >
                                Go Back
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
