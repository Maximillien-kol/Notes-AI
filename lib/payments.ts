/**
 * Payment Integration Placeholder
 *
 * This module provides placeholder functions for future payment integration.
 * Supports Stripe, Paystack, or other payment providers.
 *
 * TODO: Implement when ready:
 * - npm install stripe
 * - Add STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY to environment
 */

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  currency: string
  interval: "month" | "year"
  features: string[]
}

export interface Customer {
  id: string
  email: string
  subscriptionId?: string
  planId?: string
}

// Placeholder: Initialize a new subscription
export async function initSubscription(
  _customerId: string,
  _planId: string,
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
  // TODO: Implement Stripe subscription creation
  console.log("[Payments] initSubscription placeholder called")
  return { success: false, error: "Payment integration not yet configured" }
}

// Placeholder: Cancel an existing subscription
export async function cancelSubscription(_subscriptionId: string): Promise<{ success: boolean; error?: string }> {
  // TODO: Implement Stripe subscription cancellation
  console.log("[Payments] cancelSubscription placeholder called")
  return { success: false, error: "Payment integration not yet configured" }
}

// Placeholder: Get customer billing portal URL
export async function getBillingPortalUrl(_customerId: string): Promise<{ url?: string; error?: string }> {
  // TODO: Implement Stripe billing portal
  console.log("[Payments] getBillingPortalUrl placeholder called")
  return { error: "Payment integration not yet configured" }
}

// Placeholder: Handle webhook events
export async function handleWebhook(
  _payload: string,
  _signature: string,
): Promise<{ received: boolean; error?: string }> {
  // TODO: Implement Stripe webhook handling
  console.log("[Payments] handleWebhook placeholder called")
  return { received: false, error: "Payment integration not yet configured" }
}

// Available subscription plans (for pricing page)
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    currency: "USD",
    interval: "month",
    features: ["10 Documents", "Basic summarization", "Copy to clipboard"],
  },
  {
    id: "pro",
    name: "Pro",
    price: '$',
    currency: "USD",
    interval: "month",
    features: [
      "Unlimited note cleanings",
      "Advanced summarization",
      "Full output with definitions",
      "Download as text",
      "Priority processing",
    ],
  },
  {
    id: "team",
    name: "Team",
    price: '$',
    currency: "USD",
    interval: "month",
    features: ["Everything in Pro", "Team collaboration", "Shared note history", "Admin dashboard", "API access"],
  },
]
