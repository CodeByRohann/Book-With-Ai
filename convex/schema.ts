import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    UserTable: defineTable({
        name: v.string(),
        imageUrl: v.string(),
        email: v.string(),
        // Profile Info
        phone: v.optional(v.string()),
        phoneVerified: v.optional(v.boolean()),
        dob: v.optional(v.string()),
        country: v.optional(v.string()),
        language: v.optional(v.string()),
        currency: v.optional(v.string()), // USD, INR, EUR, etc.
        location: v.optional(v.string()),
        // Stats
        totalMiles: v.optional(v.number()),
        countriesVisited: v.optional(v.number()),
        flightsTaken: v.optional(v.number()),
        tripsPlanned: v.optional(v.number()),
        // Subscription
        subscription: v.optional(v.string()),
        subscriptionDate: v.optional(v.string()),
        isPremium: v.optional(v.boolean()),
        creditsRemaining: v.optional(v.number()),
        totalCreditsUsed: v.optional(v.number()),
    })
        .index("by_email", ["email"]),

    TripDetailTable: defineTable({
        tripId: v.string(),
        tripDetail: v.any(),
        uid: v.id('UserTable')
    })
        .index("by_uid", ["uid"])
        .index("by_trip_id", ["tripId"]),

    // Real-time flight bookings
    FlightBookings: defineTable({
        userId: v.string(),
        bookingId: v.string(),
        flightId: v.string(),
        airline: v.string(),
        flightNumber: v.string(),
        from: v.string(),
        to: v.string(),
        departure: v.string(),
        arrival: v.string(),
        date: v.string(),
        passengers: v.number(),
        totalPrice: v.number(),
        currency: v.string(),
        status: v.string(), // "confirmed", "pending", "cancelled"
        bookingDate: v.string(),
        passengerDetails: v.any(),
    })
        .index("by_user", ["userId"])
        .index("by_user_and_date", ["userId", "date"]),

    // Real-time hotel bookings  
    HotelBookings: defineTable({
        userId: v.string(),
        bookingId: v.string(),
        hotelId: v.string(),
        hotelName: v.string(),
        city: v.string(),
        checkIn: v.string(),
        checkOut: v.string(),
        nights: v.number(),
        guests: v.number(),
        roomType: v.string(),
        totalPrice: v.number(),
        currency: v.string(),
        status: v.string(), // "confirmed", "pending", "cancelled"
        bookingDate: v.string(),
        guestDetails: v.any(),
    }),

    // Trip search history and preferences
    SearchHistory: defineTable({
        userId: v.string(),
        searchType: v.string(), // "flight", "hotel", "trip"
        searchData: v.any(),
        searchDate: v.string(),
        results: v.any(),
    }),

    // User preferences for personalized recommendations
    // Author: Sanket - Temporarily using v.any() to fix schema validation issues with old data
    // TODO: Clean up old data and restore strict typing
    UserPreferences: defineTable({
        userId: v.string(),
        // Using v.any() temporarily to allow old data formats
        homeAirports: v.optional(v.any()),
        preferredAirlines: v.optional(v.any()),
        preferredCabinClass: v.optional(v.any()),
        typicalTravelType: v.optional(v.any()),
        accessibilityNeeds: v.optional(v.any()),
        seatPreference: v.optional(v.any()),
        mealPreference: v.optional(v.any()),
        layoverTolerance: v.optional(v.any()),
        averageTripBudget: v.optional(v.any()),
        averageTripLength: v.optional(v.any()),
        travelStyle: v.optional(v.any()),
        weights: v.optional(v.any()),
        preferredBudget: v.optional(v.any()),
        preferredDestinations: v.optional(v.any()),
        preferredHotelCategories: v.optional(v.any()),
        travelCompanions: v.optional(v.any()),
        inFlightPreferences: v.optional(v.any()),
        lastUpdated: v.optional(v.any()),
    }).index("by_user", ["userId"]),

    // Smart notifications and alerts
    Notifications: defineTable({
        userId: v.string(),
        type: v.string(), // "price_alert", "trip_reminder", "weather_alert", "deal_alert"
        title: v.string(),
        message: v.string(),
        data: v.any(), // Additional data for the notification
        isRead: v.boolean(),
        createdAt: v.string(),
        scheduledFor: v.optional(v.string()), // For scheduled notifications
        priority: v.string(), // "low", "medium", "high", "urgent"
        category: v.string(), // "travel", "booking", "alert", "reminder"
    })
        .index("by_user", ["userId"])
        .index("by_user_unread", ["userId", "isRead"]),

    // Price tracking for flights and hotels
    PriceAlerts: defineTable({
        userId: v.string(),
        alertType: v.string(), // "flight", "hotel"
        // Author: Sanket - Basic typed schema for search params to prevent corruption
        searchParams: v.object({
            from: v.optional(v.string()),
            to: v.optional(v.string()),
            location: v.optional(v.string()),
            date: v.optional(v.string()),
            checkIn: v.optional(v.string()),
            checkOut: v.optional(v.string()),
            airline: v.optional(v.string()),
        }),
        targetPrice: v.optional(v.number()),
        currentPrice: v.number(),
        lowestPrice: v.number(),
        highestPrice: v.number(),
        priceHistory: v.array(v.object({
            price: v.number(),
            date: v.string()
        })),
        isActive: v.boolean(),
        alertFrequency: v.string(), // "instant", "daily", "weekly"
        createdAt: v.string(),
        lastChecked: v.string(),
        notificationSent: v.boolean(),
    })
        .index("by_user", ["userId"]),

    // Trip reminders and planning alerts
    TripReminders: defineTable({
        userId: v.string(),
        tripId: v.string(),
        reminderType: v.string(), // "departure", "checkin", "checkout", "document_check", "packing"
        reminderDate: v.string(),
        isTriggered: v.boolean(),
        customMessage: v.optional(v.string()),
        importance: v.string(), // "low", "medium", "high"
        createdAt: v.string(),
    }),

    // User notification preferences
    NotificationPreferences: defineTable({
        userId: v.string(),

        // Channels
        emailNotifications: v.boolean(),
        pushNotifications: v.boolean(),
        smsNotifications: v.boolean(), // WhatsApp/SMS

        // Categories
        priceAlerts: v.boolean(),
        tripReminders: v.boolean(),
        weatherAlerts: v.boolean(),
        dealAlerts: v.boolean(),

        // Settings
        notificationTime: v.optional(v.string()), // "Morning", "Evening"
        twoFactorEnabled: v.optional(v.boolean()),
        aiMemoryStatus: v.optional(v.string()), // "Active", "Cleared"

        alertFrequency: v.optional(v.string()),
        quietHours: v.optional(v.object({
            enabled: v.boolean(),
            start: v.string(),
            end: v.string(),
        })),
        updatedAt: v.string(),
    })
        .index("by_user", ["userId"]),

    // User loyalty programs
    LoyaltyPrograms: defineTable({
        userId: v.string(),
        programName: v.string(), // e.g., "Emirates Skywards"
        airline: v.string(),     // e.g., "Emirates"
        tier: v.string(),        // e.g., "Silver", "Gold"
        memberId: v.string(),
        currentMiles: v.number(),
        progress: v.number(),    // 0-100
        nextTierMiles: v.number(),
        nextTier: v.string(),
    })
        .index("by_user", ["userId"]),

    // --- Phase 1: New Core Features ---

    // 1. Saved Flights
    SavedFlights: defineTable({
        userId: v.string(),
        // Search Parameters
        searchParams: v.object({
            from: v.string(),
            to: v.string(),
            departureDate: v.string(),
            returnDate: v.optional(v.string()),
            passengers: v.object({
                adults: v.number(),
                children: v.number(),
                infants: v.number(),
            }),
            class: v.string(),
            tripType: v.string(),
        }),
        // Flight Details
        flightDetails: v.object({
            outbound: v.object({
                airline: v.string(),
                flightNumber: v.string(),
                departure: v.string(),
                arrival: v.string(),
                duration: v.string(),
                stops: v.number(),
                aircraft: v.optional(v.string()),
            }),
            inbound: v.optional(v.object({
                airline: v.string(),
                flightNumber: v.string(),
                departure: v.string(),
                arrival: v.string(),
                duration: v.string(),
                stops: v.number(),
                aircraft: v.optional(v.string()),
            })),
        }),
        // Pricing
        pricing: v.object({
            amount: v.number(),
            currency: v.string(),
            pricePerPerson: v.number(),
            taxes: v.number(),
            fees: v.number(),
        }),
        // Metadata
        title: v.optional(v.string()),
        notes: v.optional(v.string()),
        tags: v.array(v.string()),
        color: v.optional(v.string()),
        // Tracking
        isPriceTracked: v.boolean(),
        priceAlertId: v.optional(v.id("PriceAlerts")),
        // Timestamps
        savedAt: v.string(),
        expiresAt: v.optional(v.string()),
        lastViewed: v.optional(v.string()),
    }).index("by_user", ["userId"])
        .index("by_user_and_date", ["userId", "savedAt"]),

    // 2. Itineraries
    Itineraries: defineTable({
        userId: v.string(),
        tripId: v.optional(v.id("TripDetailTable")), // Link to AI-generated trip

        // Basic Info
        title: v.string(),
        description: v.optional(v.string()),
        coverImage: v.optional(v.string()),
        destination: v.object({
            city: v.string(),
            country: v.string(),
            coordinates: v.optional(v.object({
                lat: v.number(),
                lng: v.number(),
            })),
        }),

        // Dates
        startDate: v.string(),
        endDate: v.string(),
        timezone: v.string(),

        // Status & Visibility
        status: v.string(),                // "draft" | "confirmed" | "in_progress" | "completed" | "cancelled"
        visibility: v.string(),            // "private" | "shared" | "public"

        // Collaborators
        collaborators: v.array(v.object({
            userId: v.string(),
            role: v.string(),              // "owner" | "editor" | "viewer"
            addedAt: v.string(),
        })),

        // Daily Itinerary
        days: v.array(v.object({
            day: v.number(),
            date: v.string(),
            title: v.optional(v.string()),
            activities: v.array(v.object({
                id: v.string(),
                time: v.string(),
                endTime: v.optional(v.string()),
                title: v.string(),
                description: v.optional(v.string()),
                location: v.object({
                    name: v.string(),
                    address: v.optional(v.string()),
                    coordinates: v.optional(v.object({
                        lat: v.number(),
                        lng: v.number(),
                    })),
                }),
                type: v.string(),
                category: v.optional(v.string()),
                cost: v.optional(v.object({
                    amount: v.number(),
                    currency: v.string(),
                    isPaid: v.boolean(),
                })),
                bookingInfo: v.optional(v.object({
                    confirmationNumber: v.string(),
                    status: v.string(),
                    documentId: v.optional(v.id("Documents")), // Forward reference, will work
                })),
                notes: v.optional(v.string()),
                attachments: v.array(v.string()),
            })),
        })),

        // Budget
        budget: v.object({
            total: v.number(),
            spent: v.number(),
            currency: v.string(),
            breakdown: v.object({
                flights: v.number(),
                accommodation: v.number(),
                activities: v.number(),
                food: v.number(),
                transport: v.number(),
                other: v.number(),
            }),
        }),

        // Linked Documents (Forward reference, can't strictly validate types in same defineSchema without workaround, using v.string() or v.id('Documents') if Documents is defined above or we rely on loose typing. Convex supports self-referential or out-of-order table names in v.id if they exist in schema. Let's use v.id("Documents") but we need to ensure Documents is defined. Since it's in the same object, it's fine.)
        documentIds: v.array(v.string()), // Using string to avoid circular dependency issues during definition if strict

        // Metadata
        createdAt: v.string(),
        updatedAt: v.string(),
        lastEditedBy: v.optional(v.string()),
    }).index("by_user", ["userId"])
        .index("by_status", ["userId", "status"])
        .index("by_dates", ["userId", "startDate"]),

    // 3. Documents (Document Vault)
    Documents: defineTable({
        userId: v.string(),

        // Associations
        tripId: v.optional(v.id("TripDetailTable")),
        itineraryId: v.optional(v.id("Itineraries")),

        // Document Type
        documentType: v.string(),
        category: v.string(),

        // Basic Info
        title: v.string(),
        description: v.optional(v.string()),

        // File Info
        storageId: v.string(),
        fileName: v.string(),
        fileSize: v.number(),
        mimeType: v.string(),
        thumbnailUrl: v.optional(v.string()),

        // Document Details (for travel docs)
        documentDetails: v.optional(v.object({
            documentNumber: v.string(),
            issuingCountry: v.string(),
            issueDate: v.string(),
            expiryDate: v.string(),
            holderName: v.optional(v.string()),
        })),

        // Organization
        tags: v.array(v.string()),
        color: v.optional(v.string()),
        folder: v.optional(v.string()),

        // Verification
        verificationStatus: v.optional(v.string()), // "verified" | "pending" | "rejected"

        // Security
        isEncrypted: v.boolean(),
        accessPin: v.optional(v.string()),

        // Sharing
        sharedWith: v.array(v.object({
            userId: v.string(),
            permission: v.string(),
            sharedAt: v.string(),
        })),

        // Reminders
        expiryReminderDays: v.optional(v.number()),

        // Metadata
        uploadedAt: v.string(),
        lastAccessed: v.optional(v.string()),
        lastModified: v.optional(v.string()),
        version: v.number(),
    }).index("by_user", ["userId"])
        .index("by_type", ["userId", "documentType"])
        .index("by_expiry", ["userId", "documentDetails.expiryDate"]),

    // 4. Group Trips
    GroupTrips: defineTable({
        // Basic Info
        name: v.string(),
        description: v.optional(v.string()),
        coverImage: v.optional(v.string()),

        // Destination
        destination: v.object({
            city: v.string(),
            country: v.string(),
            coordinates: v.optional(v.object({
                lat: v.number(),
                lng: v.number(),
            })),
        }),

        // Dates
        startDate: v.string(),
        endDate: v.string(),

        // Creator & Members
        creatorId: v.string(),
        members: v.array(v.object({
            userId: v.string(),
            name: v.string(),
            email: v.string(),
            avatar: v.optional(v.string()),
            role: v.string(),
            status: v.string(),
            joinedAt: v.string(),
            permissions: v.object({
                canEdit: v.boolean(),
                canInvite: v.boolean(),
                canManageExpenses: v.boolean(),
            }),
        })),

        // Linked Itinerary
        itineraryId: v.optional(v.id("Itineraries")),

        // Budget & Expenses
        budget: v.object({
            total: v.number(),
            currency: v.string(),
            perPerson: v.number(),
            splitMethod: v.string(),
        }),

        expenses: v.array(v.object({
            id: v.string(),
            description: v.string(),
            amount: v.number(),
            currency: v.string(),
            category: v.string(),
            paidBy: v.string(),
            date: v.string(),
            receipt: v.optional(v.string()),
            splitBetween: v.array(v.object({
                userId: v.string(),
                amount: v.number(),
                isPaid: v.boolean(),
            })),
            createdAt: v.string(),
        })),

        // Polls & Voting
        polls: v.array(v.object({
            id: v.string(),
            question: v.string(),
            description: v.optional(v.string()),
            options: v.array(v.object({
                id: v.string(),
                text: v.string(),
                votes: v.array(v.string()),
            })),
            allowMultiple: v.boolean(),
            createdBy: v.string(),
            createdAt: v.string(),
            deadline: v.optional(v.string()),
            isClosed: v.boolean(),
        })),

        // Chat Messages
        messages: v.array(v.object({
            id: v.string(),
            userId: v.string(),
            userName: v.string(),
            userAvatar: v.optional(v.string()),
            content: v.string(),
            type: v.string(),
            metadata: v.optional(v.any()),
            timestamp: v.string(),
            reactions: v.optional(v.array(v.object({
                emoji: v.string(),
                userIds: v.array(v.string()),
            }))),
        })),

        // Status
        status: v.string(),

        // Metadata
        createdAt: v.string(),
        updatedAt: v.string(),
    }).index("by_creator", ["creatorId"])
        // Cannot index inside array (members.userId), must rely on filter or separate mapping table if performance needed. 
        // For now, we will query all and filter, or add a top-level array of memberIds for indexing.
        // Let's add memberIds array for indexing.
        .index("by_status", ["status"]),
})