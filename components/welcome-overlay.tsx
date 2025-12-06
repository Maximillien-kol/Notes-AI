"use client"

import type React from "react"

import { useState } from "react"
import { X, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface WelcomeOverlayProps {
  onClose: () => void
}

export function WelcomeOverlay({ onClose }: WelcomeOverlayProps) {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // Save email to database
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (!response.ok && !data.message) {
        throw new Error(data.error || 'Failed to subscribe')
      }

      // Store email in localStorage for personalization
      localStorage.setItem('user-email', email.trim())

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }

    // Auto close after success
    if (!error) {
      setTimeout(() => {
        onClose()
      }, 2000)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleSkip} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 p-8 rounded-2xl border border-border bg-card shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <img src="/favicon.svg" alt="Notes AI" className="h-8 w-8" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Notes AI</h2>

          {/* Subtitle */}
          <p className="text-muted-foreground mb-6">
            We&apos;re currently in beta. Sign up to get notified when V1 launches with full features including cloud
            sync, team collaboration, and advanced AI models.
          </p>

          {!submitted ? (
            <>
              {/* Email form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background border-border"
                    disabled={isSubmitting}
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Subscribing..." : "Get Early Access"}
                </Button>
              </form>

              {/* Skip link */}
              <button
                onClick={handleSkip}
                className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip for now
              </button>

              {/* Features preview */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">
                    Free Plan
                  </span>
                  <span className="text-xs text-muted-foreground">Currently available</span>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {["Clean Notes", "Summarize", "Full Output", "Download as TXT"].map((feature) => (
                    <span
                      key={feature}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mb-3">Coming in V1:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["Cloud Sync", "Team Sharing", "Advanced AI", "Export to PDF", "Unlimited Documents"].map(
                    (feature) => (
                      <span
                        key={feature}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                      >
                        {feature}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Success state */
            <div className="py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-4">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-foreground font-medium">You&apos;re on the list!</p>
              <p className="text-sm text-muted-foreground mt-1">We&apos;ll notify you when V1 is ready.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
