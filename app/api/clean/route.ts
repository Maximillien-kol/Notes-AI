import { generateText } from "ai"
import { AI_CONFIG, PROMPTS, getAvailableProviders, isRateLimitError, type ActionType } from "@/lib/ai"
import { checkRateLimit } from "@/lib/rate-limit"
import { trackEvent, EVENTS } from "@/lib/analytics"

export const maxDuration = 60

interface CleanRequest {
  notes: string
  action: ActionType
}

export async function POST(req: Request) {
  try {
    const body: CleanRequest = await req.json()
    const { notes, action } = body

    // Validate input
    if (!notes || typeof notes !== "string") {
      return Response.json({ error: "Notes content is required" }, { status: 400 })
    }

    if (!action || !PROMPTS[action]) {
      return Response.json({ error: "Invalid action. Use: clean, summarize, or fullOutput" }, { status: 400 })
    }

    // Check rate limit (placeholder - always allows for now)
    const clientId = req.headers.get("x-forwarded-for") || "anonymous"
    const rateLimitResult = await checkRateLimit(clientId)

    if (!rateLimitResult.success) {
      return Response.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          reset: rateLimitResult.reset.toISOString(),
        },
        { status: 429 },
      )
    }

    // Get the appropriate prompt for the action
    const systemPrompt = PROMPTS[action]

    // Get available AI providers
    const availableProviders = getAvailableProviders()

    if (availableProviders.length === 0) {
      console.error("[API] No AI providers configured")
      return Response.json(
        { error: "AI service is not configured. Please add your API keys to continue." },
        { status: 503 },
      )
    }

    // Try each provider in sequence until one succeeds
    let lastError: Error | null = null
    let rateLimitErrors = 0
    let providerIndex = 0

    for (const provider of availableProviders) {
      try {
        console.log(`[API] Attempting with provider: ${provider.name} (${providerIndex + 1}/${availableProviders.length})`)

        // Skip if model is null (shouldn't happen due to filter, but type safety)
        if (!provider.model) {
          console.warn(`[API] Provider ${provider.name} has no model configured, skipping`)
          continue
        }

        // Generate the cleaned/summarized notes using AI SDK
        const { text, usage, finishReason } = await generateText({
          model: provider.model,
          system: systemPrompt,
          prompt: notes,
          maxOutputTokens: AI_CONFIG.maxOutputTokens,
          temperature: AI_CONFIG.temperature,
        })

        console.log(`[API] ✅ Success with provider: ${provider.name}`)

        // Track the event
        const eventMap: Record<ActionType, string> = {
          clean: EVENTS.NOTE_CLEANED,
          summarize: EVENTS.NOTE_SUMMARIZED,
          fullOutput: EVENTS.FULL_OUTPUT_GENERATED,
        }
        trackEvent({
          name: eventMap[action],
          properties: {
            inputLength: notes.length,
            outputLength: text.length,
            provider: provider.name,
          },
        })

        return Response.json({
          result: text,
          usage,
          finishReason,
          provider: provider.name,
        })
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        const isRateLimit = isRateLimitError(lastError)

        if (isRateLimit) {
          rateLimitErrors++
          console.warn(
            `[API] ⚠️ Rate limit hit on ${provider.name}:`,
            lastError.message,
            `(${providerIndex + 1}/${availableProviders.length})`,
          )
        } else {
          console.warn(
            `[API] ❌ Provider ${provider.name} failed:`,
            lastError.message,
            `(${providerIndex + 1}/${availableProviders.length})`,
          )
        }

        providerIndex++
        // Continue to next provider
      }
    }

    // All providers failed - determine the error message
    const allKeysAreGemini = availableProviders.every((p) => p.isGemini)
    const allAreRateLimits = rateLimitErrors === availableProviders.length

    console.error("[API] All AI providers failed. Last error:", lastError?.message)

    // If all Gemini keys hit rate limits, show token exhaustion message
    if (allAreRateLimits && allKeysAreGemini) {
      trackEvent({
        name: EVENTS.ERROR_OCCURRED,
        properties: {
          error: "All API tokens exhausted",
          attemptedProviders: availableProviders.map((p) => p.name).join(", "),
        },
      })

      return Response.json(
        {
          error: "Your API tokens have ended. All configured API keys have reached their rate limits. Please try again later or add more API keys.",
          rateLimitExceeded: true,
        },
        { status: 429 },
      )
    }

    // Generic failure message
    trackEvent({
      name: EVENTS.ERROR_OCCURRED,
      properties: {
        error: lastError?.message || "All providers failed",
        attemptedProviders: availableProviders.map((p) => p.name).join(", "),
      },
    })

    return Response.json(
      {
        error: "All AI services are currently unavailable. Please try again later.",
        details: lastError?.message,
      },
      { status: 503 },
    )
  } catch (error) {
    console.error("[API] Error processing notes:", error)

    trackEvent({
      name: EVENTS.ERROR_OCCURRED,
      properties: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    })

    return Response.json({ error: "Failed to process notes. Please try again." }, { status: 500 })
  }
}
