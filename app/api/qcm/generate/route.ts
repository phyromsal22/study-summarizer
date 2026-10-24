import { NextRequest, NextResponse } from 'next/server';
import { getClient, getModel } from '@/lib/ai/router';

export const maxDuration = 60;

// 👇 មុខងារសម្រាប់ឆ្លាស់ទីតាំងចម្លើយ (Shuffle)
function shuffleQuestionOptions(question: any) {
  const correctOption = question.options.find((opt: any) => opt.id === question.correct_answer);
  if (!correctOption) return question; // ការពារ Error បើរកមិនឃើញ

  const correctText = correctOption.text;
  const shuffledOptions = [...question.options];
  
  // ឆ្លាស់ទីតាំងដោយចៃដន្យ (Fisher-Yates)
  for (let i = shuffledOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
  }

  const ids = ['A', 'B', 'C', 'D'];
  let newCorrectAnswer = 'A';

  const updatedOptions = shuffledOptions.map((opt, index) => {
    const newId = ids[index];
    if (opt.text === correctText) {
      newCorrectAnswer = newId;
    }
    return { ...opt, id: newId };
  });

  return {
    ...question,
    options: updatedOptions,
    correct_answer: newCorrectAnswer
  };
}

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
    const batchSize = 10;

    while (remaining > 0) {
      const currentBatchSize = Math.min(remaining, batchSize);

      const prompt = `
អ្នកគឺជាគ្រូបង្រៀនដែលកំពុងបង្កើតសំណួរតេស្តខ្លីៗ (QCM)។
សូមបង្កើតសំណួរ Multiple Choice ចំនួន ${currentBatchSize} ពីអត្ថបទសង្ខេបខាងក្រោម។
${difficultyPrompt}

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
        max_tokens: 4000,
      });

      const data = JSON.parse(response.choices[0].message.content!);
      
      // 👇 ឆ្លាស់ទីតាំងចម្លើយ A, B, C, D មុនពេលរក្សាទុក
      const shuffledBatch = data.questions.map((q: any) => shuffleQuestionOptions(q));
      
      allQuestions.push(...shuffledBatch);
      remaining -= currentBatchSize;
    }

    return NextResponse.json({ questions: allQuestions });

  } catch (error: any) {
    console.error("🔥 QCM API ERROR:", error);
    return NextResponse.json({ error: error.message || "មានបញ្ហាក្នុងការបង្កើត QCM" }, { status: 500 });
  }
}