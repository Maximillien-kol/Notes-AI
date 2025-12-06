import { generateText } from "ai"
import { AI_CONFIG, PROMPTS, type ActionType } from "@/lib/ai"
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

    // Generate the cleaned/summarized notes using AI SDK v5
    const { text, usage, finishReason } = await generateText({
      model: AI_CONFIG.defaultModel,
      system: systemPrompt,
      prompt: notes,
      maxOutputTokens: AI_CONFIG.maxOutputTokens,
      temperature: AI_CONFIG.temperature,
    })

    // Track the event (placeholder)
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
      },
    })

    return Response.json({
      result: text,
      usage,
      finishReason,
    })
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
