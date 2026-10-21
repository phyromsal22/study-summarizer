import { NextRequest, NextResponse } from 'next/server';
import { getClient, getModel } from '@/lib/ai/router';

// Mock ទិន្នន័យមេរៀន (ព្រោះយើងមិនទាន់មាន Database)
const MOCK_LESSONS_DATA: Record<string, string> = {
  "1": "កោសិកាគឺជាឯកតាតូចបំផុតនៃជីវិត។ វាមានប្រភេទ Prokaryotic និង Eukaryotic។ Nucleus ផ្ទុក DNA ។",
  "2": "Mitochondria គឺជារោងចក្រថាមពលរបស់កោសិកា ដែលផលិត ATP សម្រាប់ដំណើរការកោសិកា។ Ribosome ផលិត Protein ។",
  "3": "គណិតវិទ្យា៖ សមីការដឺក្រេទី២ មានទម្រង់ ax^2 + bx + c = 0 ។ ដំណោះស្រាយរកបានតាមរូបមន្ត x = (-b ± √(b^2 - 4ac)) / 2a ។"
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lessonIds, totalQuestions } = body;

    if (!lessonIds || lessonIds.length === 0) {
      return NextResponse.json({ error: "សូមជ្រើសរើសមេរៀន" }, { status: 400 });
    }

    // ប្រមូលអត្ថបទពីមេរៀនដែលបានជ្រើសរើស
    const contextText = lessonIds.map((id: string) => MOCK_LESSONS_DATA[id] || "").join("\n\n");

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

    // បង្កើត ID សម្រាប់ Exam ថ្មី (ជាបណ្តោះអាសន្ន)
    const examId = Date.now().toString();

    // បញ្ជូនលទ្ធផលត្រឡប់ទៅវិញ
    return NextResponse.json({ 
      examId: examId, 
      questions: data.questions 
    });

  } catch (error: any) {
    console.error("🔥 EXAM API ERROR:", error);
    return NextResponse.json({ error: error.message || "មានបញ្ហាក្នុងការបង្កើត Exam" }, { status: 500 });
  }
}