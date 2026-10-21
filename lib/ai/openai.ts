import OpenAI from 'openai';

let openaiInstance: OpenAI | null = null;

export function getOpenAIClient() {
  if (!openaiInstance) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("សូមបំពេញ OPENAI_API_KEY ក្នុងឯកសារ .env.local ជាមុនសិន");
    }
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiInstance;
}