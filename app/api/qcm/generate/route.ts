import { NextRequest, NextResponse } from 'next/server';
import { getClient, getModel } from '@/lib/ai/router';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { summary, questionCount = 5, difficulty = 'medium' } = body;

    if (!summary) {
      return NextResponse.json({ error: "មិនមានអត្ថបទសង្ខេបទេ" }, { status: 400 });
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

    const client = getClient('qcm');
    const model = getModel('qcm');

    let allQuestions: any[] = [];
    let remaining = questionCount;
    const batchSize = 10; // បង្កើត ១០ សំណួរក្នុងមួយដង ដើម្បីកុំឱ្យលើស Token កំណត់

    while (remaining > 0) {
      const currentBatchSize = Math.min(remaining, batchSize);

      const prompt = `
អ្នកគឺជាគ្រូបង្រៀនដែលកំពុងបង្កើតសំណួរតេស្តខ្លីៗ (QCM)។
សូមបង្កើតសំណួរ Multiple Choice ចំនួន ${currentBatchSize} ពីអត្ថបទសង្ខេបខាងក្រោម។
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
      "correct_answer": "A",
      "explanation": "ការពន្យល់ខ្លីៗ"
    }
  ]
}

អត្ថបទសង្ខេប៖
${summary}
`;

      const response = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 4000, // បង្កើនកម្រិតអក្សរអាចសរសេរបាន
      });

      const data = JSON.parse(response.choices[0].message.content!);
      allQuestions.push(...data.questions);
      
      remaining -= currentBatchSize;
    }

    return NextResponse.json({ questions: allQuestions });

  } catch (error: any) {
    console.error("🔥 QCM API ERROR:", error);
    return NextResponse.json({ error: error.message || "មានបញ្ហាក្នុងការបង្កើត QCM" }, { status: 500 });
  }
}