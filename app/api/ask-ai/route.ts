import { NextRequest, NextResponse } from 'next/server';
import { getClient, getModel } from '@/lib/ai/router';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { contextText, question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "សូមវាយសំណួរជាមុនសិន" }, { status: 400 });
    }

    // 👇 កែប្រែ Prompt នៅទីនេះ ដើម្បីឱ្យ AI ឆ្លើយលម្អិត និងច្រើន 👇
    const systemPrompt = contextText 
      ? `អ្នកគឺជាគ្រូបង្រៀនដ៏ឆ្លាតវៃ និងមានបទពិសោធន៍ខ្ពស់។ ភារកិច្ចរបស់អ្នកគឺត្រូវឆ្លើយសំណួររបស់សិស្សដោយផ្អែកលើខ្លឹមសារមេរៀនខាងក្រោម។

ច្បាប់ដាច់ខាត៖
១. សូមឆ្លើយយ៉ាងលម្អិត គ្រប់ជ្រុងជ្រោយ និងទាញយកព័ត៌មានឱ្យបានច្រើនបំផុតពីមេរៀន។ កុំឆ្លើយខ្លីៗ។
២. ប្រើប្រាស់ចំណុចរៀបរាប់ (Bullet points) ឬលេខរៀង ដើម្បីឱ្យសិស្សអានងាយស្រួល និងចងចាំបានយូរ។
៣. ប្រសិនបើសំណួរទាក់ទងនឹងមេរៀនច្រើន សូមបញ្ជាក់ឱ្យដឹងថាចម្លើយនោះមកពីមេរៀនណា។
៤. ប្រសិនបើចម្លើយមិនមាននៅក្នុងមេរៀននោះទេ សូមប្រាប់ថា "ខ្ញុំមិនអាចរកឃើញចម្លើយនៅក្នុងមេរៀនដែលបានជ្រើសរើសទេ"។

ខ្លឹមសារមេរៀន៖
${contextText}`
      : `អ្នកគឺជាគ្រូបង្រៀនដ៏ឆ្លាតវៃ។ សូមឆ្លើយសំណួរខាងក្រោមឱ្យបានលម្អិត និងគ្រប់ជ្រុងជ្រោយបំផុត។`;

    const client = getClient('summarize'); // ប្រើ DeepSeek
    const model = getModel('summarize');

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      temperature: 0.6, // បង្កើនបន្តិចដើម្បីឱ្យវាឆ្លើយបានធម្មជាតិ និងលម្អិត
    });

    return NextResponse.json({ answer: response.choices[0].message.content });

  } catch (error: any) {
    console.error("🔥 ASK AI ERROR:", error);
    return NextResponse.json({ error: error.message || "មានបញ្ហាក្នុងការឆ្លើយតប" }, { status: 500 });
  }
}