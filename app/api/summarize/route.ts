import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/lib/parsers/pdf-parser';
import { generateSummary } from '@/lib/ai/tasks/summarize.task';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'សូមជ្រើសរើសឯកសារ' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    if (file.type === 'application/pdf') {
      text = await extractTextFromPDF(buffer);
    } else if (file.type === 'text/plain') {
      text = await file.text();
    } else {
      return NextResponse.json({ error: 'ប្រភេទឯកសារមិនគាំទ្រទេ' }, { status: 400 });
    }

    const limitedText = text.slice(0, 100000);
    const summary = await generateSummary(limitedText);

    return NextResponse.json({ summary });
    
  } catch (error: any) {
    console.error("🔥 API ERROR:", error);
    return NextResponse.json(
      { error: error.message || 'មានបញ្ហាក្នុងការសង្ខេប' }, 
      { status: 500 }
    );
  }
} // 👈 ត្រូវប្រាកដថាមានសញ្ញានេះនៅចុងបញ្ចប់