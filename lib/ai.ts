import { google } from "@ai-sdk/google"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

// Create separate Gemini instances for each API key
const gemini1 = process.env.GOOGLE_GENERATIVE_AI_API_KEY_1
  ? createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY_1,
  })
  : null

const gemini2 = process.env.GOOGLE_GENERATIVE_AI_API_KEY_2
  ? createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY_2,
  })
  : null

// AI Provider configurations with multiple Gemini API keys for fallback
// When one key hits rate limit, it automatically tries the next one
export const AI_PROVIDERS = [
  {
    name: "Google Gemini (Primary)",
    model: gemini1 ? gemini1("gemini-2.5-flash-live") : null,
    enabled: Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY_1),
    isGemini: true,
  },
  {
    name: "Google Gemini (Backup)",
    model: gemini2 ? gemini2("gemini-2.5-flash-live") : null,
    enabled: Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY_2),
    isGemini: true,
  },
] as const

// Get available providers (only those with API keys configured)
export function getAvailableProviders() {
  return AI_PROVIDERS.filter((provider) => provider.enabled && provider.model !== null)
}

// Check if an error is a rate limit error from Gemini
export function isRateLimitError(error: Error): boolean {
  const errorMessage = error.message.toLowerCase()
  return (
    errorMessage.includes("rate limit") ||
    errorMessage.includes("quota exceeded") ||
    errorMessage.includes("429") ||
    errorMessage.includes("resource exhausted") ||
    errorMessage.includes("too many requests")
  )
}

// Default model configuration
export const AI_CONFIG = {
  maxOutputTokens: 4000,
  temperature: 0.7,
} as const

// System prompts for different actions
export const PROMPTS = {
  clean: `You are a Notes Cleaner.
The user will paste messy class notes or personal notes.
Your task:
1. Clean and rewrite the notes in clear sentences.
2. Organize ideas logically and remove noise.
3. Use HTML formatting: <b>text</b> ONLY for section titles/headings, <i>text</i> for italic emphasis, <u>text</u> for underline emphasis.
4. Use numbered lists (1., 2., 3.) for organization.

IMPORTANT FORMATTING RULES:
- Use <b>bold</b> ONLY for section headings/titles
- Use <i>italic</i> for emphasis on important terms
- Use <u>underline</u> for key points
- Use <br> for line breaks when needed
- DO NOT use markdown symbols: *, _, ##, ###, -, —

Do not add ideas the user did not mention unless needed for clarity.
Do not use emojis.
Return the cleaned notes only in HTML format.`,

  summarize: `You are a Notes Summarizer.
The user will paste class notes or personal notes.
Your task:
1. Extract the main points and key ideas.
2. Provide a concise summary using simple language.
3. Use HTML formatting: <b>text</b> ONLY for section titles/headings, <i>text</i> for italic emphasis, <u>text</u> for underline emphasis.
4. Use numbered lists (1., 2., 3.) for organization.

IMPORTANT FORMATTING RULES:
- Use <b>bold</b> ONLY for section headings/titles
- Use <i>italic</i> for emphasis on important terms
- Use <u>underline</u> for key points
- Use <br> for line breaks when needed
- DO NOT use markdown symbols: *, _, ##, ###, -, —

Do not add ideas the user did not mention.
Do not use emojis.
Return only the summary in HTML format.`,

  fullOutput: `You are a Notes Cleaner.
The user will paste messy class notes or personal notes.
Your tasks:
1. Clean and rewrite the notes in clear sentences.
2. Organize ideas logically and remove noise.
3. Extract bullet points and key ideas.
4. Extract definitions if any exist.
5. Provide a short summary using simple language.
6. Use HTML formatting: <b>text</b> ONLY for section titles/headings, <i>text</i> for italic emphasis, <u>text</u> for underline emphasis.

IMPORTANT FORMATTING RULES:
- Use <b>bold</b> ONLY for section headings/titles (like "Cleaned Notes", "Key Points", etc.)
- Use <i>italic</i> for emphasis on important terms
- Use <u>underline</u> for key points
- Use <br> for line breaks when needed
- DO NOT use markdown symbols: *, _, ##, ###, -, —

Do not add ideas the user did not mention unless needed for clarity.
Do not use emojis.

Return everything in clean sections with the following format:

<b>Cleaned Notes</b><br>
[cleaned version of the notes with italic and underline emphasis only]<br><br>

<b>Key Points</b><br>
[numbered list of main ideas with italic and underline emphasis only]<br><br>

<b>Definitions</b><br>
[any definitions found with italic and underline emphasis only, or "No definitions found" if none]<br><br>

<b>Summary</b><br>
[brief summary with italic and underline emphasis only]`,
} as const

export type ActionType = keyof typeof PROMPTS
