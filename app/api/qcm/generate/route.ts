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
    const { summary, questionCount = 5, difficulty = 'medium' } = body;

    if (!summary) {
      return NextResponse.json({ error: "មិនមានអត្ថបទសង្ខេបទេ" }, { status: 400 });
    }

    let difficultyPrompt = "";
    if (difficulty === 'easy') difficultyPrompt = "កម្រិត៖ ងាយស្រួល";
    else if (difficulty === 'hard') difficultyPrompt = "កម្រិត៖ ពិបាក";
    else if (difficulty === 'mix') difficultyPrompt = "កម្រិត៖ ចម្រុះ";
    else difficultyPrompt = "កម្រិត៖ មធ្យម";

    const client = getClient('qcm');
    const model = getModel('qcm');

    let allQuestions: any[] = [];
    let remaining = questionCount;
    
    // 👇 កាត់បន្ថយ Batch Size មកត្រឹម ៥ ដើម្បីកុំឱ្យ JSON វែងពេក
    const batchSize = 5; 

    while (remaining > 0) {
      const currentBatchSize = Math.min(remaining, batchSize);

      const prompt = `
អ្នកគឺជាគ្រូបង្រៀនដែលកំពុងបង្កើតសំណួរតេស្តខ្លីៗ (QCM)។
សូមបង្កើតសំណួរ Multiple Choice ចំនួន ${currentBatchSize} ពីអត្ថបទសង្ខេបខាងក្រោម។
${difficultyPrompt}

ច្បាប់ដាច់ខាត៖
១. ទម្រង់ត្រូវតែជា JSON ត្រឹមត្រូវ ១០០%។
២. ហាមដាក់ចម្លើយត្រូវជាជម្រើស A គ្រប់សំណួរទាំងអស់។

ទម្រង់ JSON៖
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

      try {
        const response = await client.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: 'អ្នកគឺជាអ្នកបង្កើត JSON ដ៏ជំនាញ។' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 4000,
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("AI returned empty content");

        const data = JSON.parse(content);
        const shuffledBatch = data.questions.map((q: any) => shuffleQuestionOptions(q));
        
        allQuestions.push(...shuffledBatch);
        remaining -= currentBatchSize;
      } catch (err: any) {
        console.error(`Error generating batch:`, err);
        return NextResponse.json({ error: "មានបញ្ហាក្នុងការបង្កើតសំណួរ (JSON Error)។ សូមព្យាយាមម្តងទៀត។" }, { status: 500 });
      }
    }

    return NextResponse.json({ questions: allQuestions });

  } catch (error: any) {
    console.error("🔥 QCM API ERROR:", error);
    return NextResponse.json({ error: error.message || "មានបញ្ហាក្នុងការបង្កើត QCM" }, { status: 500 });
  }
}