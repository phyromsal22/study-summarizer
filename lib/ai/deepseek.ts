import OpenAI from 'openai';

let deepseekInstance: OpenAI | null = null;

export function getDeepseekClient() {
  if (!deepseekInstance) {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error("សូមបំពេញ DEEPSEEK_API_KEY ក្នុងឯកសារ .env.local ជាមុនសិន");
    }
    deepseekInstance = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com',
    });
  }
  return deepseekInstance;
}