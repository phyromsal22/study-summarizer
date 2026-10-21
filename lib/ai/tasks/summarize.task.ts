import { getClient, getModel } from '../router';
import { summarizePrompt } from '../prompts/summarize';

export async function generateSummary(text: string) {
  const client = getClient('summarize');
  const model = getModel('summarize');

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'user', content: summarizePrompt(text) }
    ],
    temperature: 0.5,
  });

  return response.choices[0].message.content;
}