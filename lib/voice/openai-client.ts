// Singleton OpenAI client for voice services.
// Never import this in client components — server-side only.
import OpenAI from 'openai';

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    console.error('[OpenAI Client] OPENAI_API_KEY is not configured');
    throw new Error('OPENAI_API_KEY is not configured');
  }
  if (!client) {
    console.log('[OpenAI Client] Initializing OpenAI client...');
    console.log('[OpenAI Client] API key format:', process.env.OPENAI_API_KEY.substring(0, 20) + '...');
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log('[OpenAI Client] Client initialized successfully');
  }
  return client;
}
