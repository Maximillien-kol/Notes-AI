# Multiple Gemini API Keys Setup

## Overview
Your Notes AI app now supports **multiple Gemini API keys with automatic fallback**. When your primary API key hits its rate limit, the system automatically tries your backup key. If both keys are exhausted, users see a clear message.

## How It Works

1. **Primary Key Active** → Uses `GOOGLE_GENERATIVE_AI_API_KEY_1`
2. **Primary Key Rate Limited** → Automatically switches to `GOOGLE_GENERATIVE_AI_API_KEY_2`
3. **Both Keys Exhausted** → Shows user: *"Your API tokens have ended"*

## Setup Instructions

### Step 1: Add Your API Keys to `.env.local`

Create or update your `.env.local` file with:

```bash
# Primary Gemini API Key
GOOGLE_GENERATIVE_AI_API_KEY_1=AIzaSyCoCcQyYAGaKs476zcj3pMFw5jLpEacIBc

# Backup Gemini API Key (your second key)
GOOGLE_GENERATIVE_AI_API_KEY_2=your_second_api_key_here
```

### Step 2: Get a Second API Key (Optional but Recommended)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it as `GOOGLE_GENERATIVE_AI_API_KEY_2`

### Step 3: Test It

Run your development server:
```bash
npm run dev
```

The system will automatically use whichever key has available quota!

## What Happens When Rate Limits Are Hit?

### Scenario 1: Primary Key Exhausted
```
[API] Attempting with provider: Google Gemini (Primary) (1/2)
[API] ⚠️ Rate limit hit on Google Gemini (Primary): quota exceeded
[API] Attempting with provider: Google Gemini (Backup) (2/2)
[API] ✅ Success with provider: Google Gemini (Backup)
```
✅ **Result:** Request succeeds using backup key

### Scenario 2: Both Keys Exhausted
```
[API] ⚠️ Rate limit hit on Google Gemini (Primary)
[API] ⚠️ Rate limit hit on Google Gemini (Backup)
```
❌ **Result:** User sees: *"Your API tokens have ended. All configured API keys have reached their rate limits."*

## Benefits

✅ **No downtime** - Seamless fallback when rate limits hit  
✅ **Clear error messages** - Users know exactly what happened  
✅ **Easy to extend** - Add more keys anytime  
✅ **Smart logging** - See which key handled each request  
✅ **Cost optimization** - Spread load across multiple free tier keys

## Monitoring

Check your server logs to see which API key is being used:
- `✅ Success with provider: Google Gemini (Primary)` - Primary key worked
- `✅ Success with provider: Google Gemini (Backup)` - Backup key was used
- `⚠️ Rate limit hit` - Key exceeded quota

## Adding More Keys

To add a third key, simply update `lib/ai.ts`:

```typescript
// Add a third Gemini instance
const gemini3 = process.env.GOOGLE_GENERATIVE_AI_API_KEY_3
  ? createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY_3,
    })
  : null

// Add to providers array
{
  name: "Google Gemini (Backup 2)",
  model: gemini3 ? gemini3("gemini-2.0-flash-exp") : null,
  enabled: Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY_3),
  isGemini: true,
}
```

## Troubleshooting

**Problem:** "AI service is not configured"  
**Solution:** Make sure at least one `GOOGLE_GENERATIVE_AI_API_KEY_X` is set in `.env.local`

**Problem:** Still getting rate limit errors  
**Solution:** All your API keys have reached their quota. Wait for quota reset or add more keys.

**Problem:** Not using backup key  
**Solution:** Check server logs to confirm rate limit detection is working
