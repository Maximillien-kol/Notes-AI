/**
 * Analytics Integration Placeholder
 *
 * This module provides placeholder functions for analytics tracking.
 * Can be integrated with Vercel Analytics, Mixpanel, PostHog, etc.
 */

export interface AnalyticsEvent {
  name: string
  properties?: Record<string, string | number | boolean>
  timestamp?: Date
}

// Placeholder: Track a custom event
export function trackEvent(event: AnalyticsEvent): void {
  // TODO: Implement analytics tracking
  console.log("[Analytics] Event tracked:", event.name, event.properties)
}

// Placeholder: Identify a user
export function identifyUser(_userId: string, _traits?: Record<string, string | number | boolean>): void {
  // TODO: Implement user identification
  console.log("[Analytics] identifyUser placeholder called")
}

// Placeholder: Track page view
export function trackPageView(path: string): void {
  // Vercel Analytics handles this automatically
  console.log("[Analytics] Page view:", path)
}

// Common events for Notes AI
export const EVENTS = {
  NOTE_CLEANED: "note_cleaned",
  NOTE_SUMMARIZED: "note_summarized",
  FULL_OUTPUT_GENERATED: "full_output_generated",
  COPIED_TO_CLIPBOARD: "copied_to_clipboard",
  DOWNLOADED_AS_TEXT: "downloaded_as_text",
  ERROR_OCCURRED: "error_occurred",
} as const
