import { extractText } from 'unpdf';

export async function extractTextFromPDF(buffer: Buffer) {
  try {
    // unpdf ត្រូវការទិន្នន័យជា Uint8Array
    const uint8Array = new Uint8Array(buffer);
    
    // ទាញយកអត្ថបទ (mergePages: true ដើម្បីរួមបញ្ចូលគ្រប់ទំព័រជាអត្ថបទតែមួយ)
    const { text } = await extractText(uint8Array, { mergePages: true });
    
    return text;
  } catch (error) {
    console.error("Error parsing PDF with unpdf:", error);
    throw new Error("មិនអាចអានឯកសារ PDF បានទេ");
  }
}