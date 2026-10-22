import { NextRequest, NextResponse } from 'next/server';
import { getClient, getModel } from '@/lib/ai/router';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { contextText, question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "សូមវាយសំណួរជាមុនសិន" }, { status: 400 });
    }

    // ប្រសិនបើគ្មានមេរៀនទេ ឱ្យវាឆ្លើយតាមចំណេះដឹងទូទៅ
    const systemPrompt = contextText 
      ? `អ្នកគឺជាគ្រូបង្រៀនដ៏ឆ្លាតវៃ។ សូមឆ្លើយសំណួររបស់សិស្សដោយផ្អែកលើខ្លឹមសារមេរៀនខាងក្រោមនេះ។
ប្រសិនបើចម្លើយមិនមាននៅក្នុងមេរៀននោះទេ សូមប្រាប់ថា "ខ្ញុំមិនអាចរកឃើញចម្លើយនៅក្នុងមេរៀនដែលបានជ្រើសរើសទេ"។

ខ្លឹមសារមេរៀន៖
${contextText}`
      : `អ្នកគឺជាគ្រូបង្រៀនដ៏ឆ្លាតវៃ។ សូមឆ្លើយសំណួរខាងក្រោមឱ្យបានលម្អិត។`;

    const client = getClient('summarize'); // ប្រើ DeepSeek
    const model = getModel('summarize');

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      temperature: 0.5,
    });

    return NextResponse.json({ answer: response.choices[0].message.content });

  } catch (error: any) {
    console.error("🔥 ASK AI ERROR:", error);
    return NextResponse.json({ error: error.message || "មានបញ្ហាក្នុងការឆ្លើយតប" }, { status: 500 });
  }
}