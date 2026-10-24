import { NextRequest, NextResponse } from 'next/server';
import { getClient, getModel } from '@/lib/ai/router';

export const maxDuration = 60;

// 👇 មុខងារសម្រាប់ឆ្លាស់ទីតាំងចម្លើយ (Shuffle)
function shuffleQuestionOptions(question: any) {
  const correctOption = question.options.find((opt: any) => opt.id === question.correct_answer);
  if (!correctOption) return question;

  const correctText = correctOption.text;
  const shuffledOptions = [...question.options];
  
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
    const { contextText, totalQuestions, difficulty = 'medium' } = body;

    if (!contextText) {
      return NextResponse.json({ error: "មិនមានអត្ថបទសម្រាប់បង្កើតសំណួរទេ" }, { status: 400 });
    }

    let difficultyPrompt = "";
    if (difficulty === 'easy') {
      difficultyPrompt = "កម្រិត៖ ងាយស្រួល";
    } else if (difficulty === 'hard') {
      difficultyPrompt = "កម្រិត៖ ពិបាក";
    } else if (difficulty === 'mix') {
      difficultyPrompt = "កម្រិត៖ ចម្រុះ";
    } else {
      difficultyPrompt = "កម្រិត៖ មធ្យម";
    }

    const client = getClient('exam');
    const model = getModel('exam');

    let allQuestions: any[] = [];
    let remaining = totalQuestions;
    const batchSize = 10;

    while (remaining > 0) {
      const currentBatchSize = Math.min(remaining, batchSize);

      const prompt = `
អ្នកគឺជាគ្រូបង្រៀនដែលកំពុងបង្កើតសំណួរប្រឡង។
សូមបង្កើតសំណួរ Multiple Choice ចំនួន ${currentBatchSize} ពីអត្ថបទខាងក្រោម។
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

អត្ថបទ៖
${contextText}
`;

      const response = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 4000,
      });

      const data = JSON.parse(response.choices[0].message.content!);
      
      // 👇 ឆ្លាស់ទីតាំងចម្លើយ A, B, C, D
      const shuffledBatch = data.questions.map((q: any) => shuffleQuestionOptions(q));
      
      allQuestions.push(...shuffledBatch);
      remaining -= currentBatchSize;
    }

    return NextResponse.json({ 
      questions: allQuestions 
    });

  } catch (error: any) {
    console.error("🔥 EXAM API ERROR:", error);
    return NextResponse.json({ error: error.message || "មានបញ្ហាក្នុងការបង្កើត Exam" }, { status: 500 });
  }
}