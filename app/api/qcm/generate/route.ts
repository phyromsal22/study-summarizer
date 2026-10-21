import { NextRequest, NextResponse } from 'next/server';
import { getClient, getModel } from '@/lib/ai/router';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { summary, questionCount = 5 } = body;

    if (!summary) {
      return NextResponse.json({ error: "មិនមានអត្ថបទសង្ខេបទេ" }, { status: 400 });
    }

    const prompt = `
អ្នកគឺជាគ្រូបង្រៀនដែលកំពុងបង្កើតសំណួរតេស្តខ្លីៗ (QCM)។
សូមបង្កើតសំណួរ Multiple Choice ចំនួន ${questionCount} ពីអត្ថបទសង្ខេបខាងក្រោម។
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
      "explanation": "ការពន្យល់ខ្លីៗពីមូលហេតុដែលជាចម្លើយត្រូវ"
    }
  ]
}

អត្ថបទសង្ខេប៖
${summary}
`;

    const client = getClient('qcm');
    const model = getModel('qcm');

    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const data = JSON.parse(response.choices[0].message.content!);

    return NextResponse.json({ questions: data.questions });

  } catch (error: any) {
    console.error("🔥 QCM API ERROR:", error);
    return NextResponse.json({ error: error.message || "មានបញ្ហាក្នុងការបង្កើត QCM" }, { status: 500 });
  }
}