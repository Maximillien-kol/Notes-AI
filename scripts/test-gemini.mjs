import { config } from 'dotenv';
config({ path: '.env.local' });
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

async function testGemini() {
    console.log('Testing Gemini 2.5 Flash Integration...');

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        console.error('❌ Error: GOOGLE_GENERATIVE_AI_API_KEY is missing in .env.local');
        return;
    }
    console.log('✅ API Key found');

    try {
        const model = google('gemini-2.5-flash-live');
        console.log('Using model: gemini-2.5-flash-live');
        console.log('Sending test request...');

        const startTime = Date.now();
        const { text } = await generateText({
            model,
            prompt: 'Clean these notes: meeting tmrw 3pm w john abt budget - need report by friday',
        });

        const duration = Date.now() - startTime;
        console.log(`✅ Success! (took ${duration}ms)`);
        console.log('--- Response ---');
        console.log(text);
        console.log('----------------');
    } catch (error) {
        console.error('❌ Failed to call Gemini:');
        console.error(error.message);
        if (error.responseBody) {
            console.error(error.responseBody);
        }
    }
}

testGemini();
