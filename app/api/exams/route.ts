import { NextRequest, NextResponse } from 'next/server';
import { getClient, getModel } from '@/lib/ai/router';

export const maxDuration = 60;

function cleanJSONString(str: string) {
  let cleaned = str.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/```json/g, "").replace(/```/g, "").trim();
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/```/g, "").trim();
  }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.substring(start, end + 1);
  }
  return cleaned;
}

function shuffleQuestionOptions(question: any) {
  if (!question || !question.options || !Array.isArray(question.options)) return question;
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

  return { ...question, options: updatedOptions, correct_answer: newCorrectAnswer };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // 👇 API នេះនឹងទទួលតែចំនួនតូច (ឧ. ៥ សំណួរ) ពី Frontend តែម្តង
    const { contextText, totalQuestions, difficulty = 'medium' } = body;

    if (!contextText || contextText.trim() === "") {
      return NextResponse.json({ error: "មេរៀនដែលបានជ្រើសរើសមិនមានអត្ថបទសង្ខេបទេ" }, { status: 400 });
    }

    let difficultyPrompt = "";
    if (difficulty === 'easy') difficultyPrompt = "កម្រិត៖ ងាយស្រួល";
    else if (difficulty === 'hard') difficultyPrompt = "កម្រិត៖ ពិបាក";
    else if (difficulty === 'mix') difficultyPrompt = "កម្រិត៖ ចម្រុះ";
    else difficultyPrompt = "កម្រិត៖ មធ្យម";

    const client = getClient('exam');
    const model = getModel('exam');

    const prompt = `
អ្នកគឺជាគ្រូបង្រៀនដែលកំពុងបង្កើតសំណួរប្រឡង។
សូមបង្កើតសំណួរ Multiple Choice ចំនួន ${totalQuestions} ពីអត្ថបទខាងក្រោម។
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

អត្ថបទ៖
${contextText}
`;

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'អ្នកគឺជាអ្នកបង្កើត JSON ដ៏ជំនាញ។ ត្រូវតែឆ្លើយតបជា JSON តែមួយមុខ។' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000, // ៥ សំណួរមិនត្រូវការ Token ច្រើនទេ
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("AI returned empty content");

    const cleanedData = cleanJSONString(content);
    const data = JSON.parse(cleanedData);
    
    if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error("Invalid JSON structure from AI");
    }

    const shuffledBatch = data.questions.map((q: any) => shuffleQuestionOptions(q));

    return NextResponse.json({ questions: shuffledBatch });

  } catch (error: any) {
    console.error("🔥 EXAM API ERROR:", error);
    return NextResponse.json({ error: error.message || "មានបញ្ហាក្នុងការបង្កើត Exam" }, { status: 500 });
  }
}