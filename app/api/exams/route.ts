import { NextRequest, NextResponse } from 'next/server';
import { getClient, getModel } from '@/lib/ai/router';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contextText, totalQuestions, difficulty = 'medium' } = body;

    if (!contextText) {
      return NextResponse.json({ error: "មិនមានអត្ថបទសម្រាប់បង្កើតសំណួរទេ" }, { status: 400 });
    }

    let difficultyPrompt = "";
    if (difficulty === 'easy') {
      difficultyPrompt = "កម្រិត៖ ងាយស្រួល (សួរតែអត្ថន័យផ្ទាល់ ឬពាក្យគន្លឹះច្បាស់ៗ)";
    } else if (difficulty === 'hard') {
      difficultyPrompt = "កម្រិត៖ ពិបាក (សួរឱ្យមានការត្រិះរិះពិចារណា វិភាគ ឬភ្ជាប់ចំណុចផ្សេងៗគ្នា)";
    } else if (difficulty === 'mix') {
      difficultyPrompt = "កម្រិត៖ ចម្រុះ (សូមលាយបញ្ចូលគ្នារវាងសំណួរងាយ មធ្យម និងពិបាក)";
    } else {
      difficultyPrompt = "កម្រិត៖ មធ្យម (សួរអំពីការយល់ដឹង និងការអនុវត្តជាមូលដ្ឋាន)";
    }

    // 👇 កែប្រែ Prompt នៅទីនេះ ដើម្បីចែកចាយចម្លើយ A B C D 👇
    const prompt = `
អ្នកគឺជាគ្រូបង្រៀនដែលកំពុងបង្កើតសំណួរប្រឡង។
សូមបង្កើតសំណួរ Multiple Choice ចំនួន ${totalQuestions} ពីអត្ថបទខាងក្រោម។
${difficultyPrompt}

ច្បាប់សំខាន់៖
សូមចែកចាយចម្លើយត្រូវឱ្យស្មើៗគ្នារវាងជម្រើស A, B, C និង D។ ហាមដាក់ចម្លើយត្រូវជាជម្រើស A គ្រប់សំណួរទាំងអស់។

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
      "correct_answer": "អាចជា A, B, C ឬ D",
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
      temperature: 0.8, // បង្កើនបន្តិចដើម្បីឱ្យវាបង្កើតចម្លើយចម្រុះ
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