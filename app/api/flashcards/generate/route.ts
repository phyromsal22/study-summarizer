import { NextRequest, NextResponse } from 'next/server';
import { getClient, getModel } from '@/lib/ai/router';

export const maxDuration = 60; // 👈 បន្ថែមនេះដើម្បីការពារ Timeout លើ Vercel

export async function POST(req: NextRequest) {
  try {
    const { summary } = await req.json();

    if (!summary) {
      return NextResponse.json({ error: "មិនមានអត្ថបទសង្ខេបទេ" }, { status: 400 });
    }

    const prompt = `
អ្នកគឺជាគ្រូបង្រៀនដែលកំពុងបង្កើតកាតចងចាំ (Flashcards)។
សូមបង្កើតកាតចងចាំចំនួន 5 ពីអត្ថបទសង្ខេបខាងក្រោម។
ទម្រង់ត្រូវតែជា JSON ដូចនេះ៖
{
  "flashcards": [
    {
      "question": "សំណួរខ្លីៗ?",
      "answer": "ចម្លើយខ្លីៗ"
    }
  ]
}

អត្ថបទសង្ខេប៖
${summary}
`;

    const client = getClient('flashcards');
    const model = getModel('flashcards');

    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const data = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json({ flashcards: data.flashcards });

  } catch (error: any) {
    console.error("🔥 FLASHCARD API ERROR:", error);
    return NextResponse.json({ error: error.message || "មានបញ្ហាក្នុងការបង្កើតកាត" }, { status: 500 });
  }
}