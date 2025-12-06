"use client"

import { X, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LimitReachedOverlayProps {
    onClose: () => void
    resetTime: Date
}

export function LimitReachedOverlay({ onClose, resetTime }: LimitReachedOverlayProps) {
    const getTimeRemaining = () => {
        const now = new Date()
        const diff = resetTime.getTime() - now.getTime()

        if (diff <= 0) {
            return "Available now!"
        }

        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        return `${hours}h ${minutes}m`
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md mx-4 p-8 rounded-2xl border border-border bg-card shadow-2xl">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Content */}
                <div className="text-center">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                        <Clock className="h-8 w-8 text-primary" />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-foreground mb-2">Daily Limit Reached</h2>

                    {/* Message */}
                    <p className="text-muted-foreground mb-6">
                        You&apos;ve reached your free tier limit of <strong>10 documents per day</strong>.
                    </p>

                    {/* Time remaining */}
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                        <p className="text-sm text-muted-foreground mb-1">New documents available in:</p>
                        <p className="text-2xl font-bold text-primary">{getTimeRemaining()}</p>
                    </div>

                    {/* Upgrade CTA */}
                    <div>
                        <p className="text-sm text-muted-foreground mb-4">
                            Want unlimited documents? Upgrade to Pro!
                        </p>
                        <Button className="w-full mb-2" onClick={() => window.location.href = '/pricing'}>
                            View Pricing Plans
                        </Button>
                        <Button variant="outline" className="w-full" onClick={onClose}>
                            Got It
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
