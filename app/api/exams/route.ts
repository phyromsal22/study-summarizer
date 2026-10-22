import { NextRequest, NextResponse } from 'next/server';
import { getClient, getModel } from '@/lib/ai/router';

export const maxDuration = 60; // 👈 បន្ថែមនេះដើម្បីការពារ Timeout លើ Vercel

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contextText, totalQuestions } = body;

    if (!contextText) {
      return NextResponse.json({ error: "មិនមានអត្ថបទសម្រាប់បង្កើតសំណួរទេ" }, { status: 400 });
    }

    const prompt = `
អ្នកគឺជាគ្រូបង្រៀនដែលកំពុងបង្កើតសំណួរប្រឡង។
សូមបង្កើតសំណួរ Multiple Choice ចំនួន ${totalQuestions} ពីអត្ថបទខាងក្រោម។
ទម្រង់ត្រូវតែជា JSON ដូចនេះ៖
{
  "questions": [
    {
      "question": "សំណួរនៅទីនេះ?",
      "options": [
        {"id": "A", "text": "ជម្រើស A"},
        {"id": "B", "text": "ជម្រើស B"},
        {"id": "C", "text": "ជម្រើស C"},
        {"id": "D", "text": "ជម្រើស D"}
      ],
      "correct_answer": "A",
      "explanation": "ការពន្យល់ខ្លីៗ"
    }
  ]
}

អត្ថបទ៖
${contextText}
`;

    const client = getClient('exam');
    const model = getModel('exam');

    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const data = JSON.parse(response.choices[0].message.content!);

    return NextResponse.json({ 
      questions: data.questions 
    });

  } catch (error: any) {
    console.error("🔥 EXAM API ERROR:", error);
    return NextResponse.json({ error: error.message || "មានបញ្ហាក្នុងការបង្កើត Exam" }, { status: 500 });
  }
}