// Usage limits for free tier
const FREE_TIER_DOCUMENT_LIMIT = 10
const RESET_INTERVAL_HOURS = 24

interface UsageData {
    documentCount: number
    resetTime: string
}

export function getUsageData(): UsageData {
    if (typeof window === 'undefined') {
        return { documentCount: 0, resetTime: new Date().toISOString() }
    }

    const stored = localStorage.getItem('usage-data')
    if (!stored) {
        const resetTime = new Date(Date.now() + RESET_INTERVAL_HOURS * 60 * 60 * 1000)
        const initialData = { documentCount: 0, resetTime: resetTime.toISOString() }
        localStorage.setItem('usage-data', JSON.stringify(initialData))
        return initialData
    }

    const data: UsageData = JSON.parse(stored)
    const resetTime = new Date(data.resetTime)
    const now = new Date()

    // Check if reset time has passed
    if (now >= resetTime) {
        const newResetTime = new Date(Date.now() + RESET_INTERVAL_HOURS * 60 * 60 * 1000)
        const resetData = { documentCount: 0, resetTime: newResetTime.toISOString() }
        localStorage.setItem('usage-data', JSON.stringify(resetData))
        return resetData
    }

    return data
}

export function incrementDocumentCount(): boolean {
    const data = getUsageData()

    if (data.documentCount >= FREE_TIER_DOCUMENT_LIMIT) {
        return false // Limit reached
    }

    const newData = {
        ...data,
        documentCount: data.documentCount + 1,
    }

    localStorage.setItem('usage-data', JSON.stringify(newData))
    return true // Success
}

export function hasReachedLimit(): boolean {
    const data = getUsageData()
    return data.documentCount >= FREE_TIER_DOCUMENT_LIMIT
}

export function getResetTime(): Date {
    const data = getUsageData()
    return new Date(data.resetTime)
}

export function getRemainingDocuments(): number {
    const data = getUsageData()
    return Math.max(0, FREE_TIER_DOCUMENT_LIMIT - data.documentCount)
}
