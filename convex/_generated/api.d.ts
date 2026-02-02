/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as bookings from "../bookings.js";
import type * as documents from "../documents.js";
import type * as group_trips from "../group_trips.js";
import type * as itineraries from "../itineraries.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_validators from "../lib/validators.js";
import type * as loyalty from "../loyalty.js";
import type * as notifications from "../notifications.js";
import type * as personalization from "../personalization.js";
import type * as price_alerts from "../price_alerts.js";
import type * as saved_flights from "../saved_flights.js";
import type * as tripDetail from "../tripDetail.js";
import type * as user from "../user.js";
import type * as userPreferences from "../userPreferences.js";
import type * as userPreferencesCleanup from "../userPreferencesCleanup.js";
import type * as userStats from "../userStats.js";
import type * as user_dashboard from "../user_dashboard.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  bookings: typeof bookings;
  documents: typeof documents;
  group_trips: typeof group_trips;
  itineraries: typeof itineraries;
  "lib/auth": typeof lib_auth;
  "lib/errors": typeof lib_errors;
  "lib/validators": typeof lib_validators;
  loyalty: typeof loyalty;
  notifications: typeof notifications;
  personalization: typeof personalization;
  price_alerts: typeof price_alerts;
  saved_flights: typeof saved_flights;
  tripDetail: typeof tripDetail;
  user: typeof user;
  userPreferences: typeof userPreferences;
  userPreferencesCleanup: typeof userPreferencesCleanup;
  userStats: typeof userStats;
  user_dashboard: typeof user_dashboard;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
