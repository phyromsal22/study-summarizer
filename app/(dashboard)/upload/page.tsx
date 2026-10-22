"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [savedLessonId, setSavedLessonId] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setSummary("");
    setError("");
    setSavedLessonId("");

    try {
      const supabase = createClient();
      
      // ទាញយកព័ត៌មានអ្នកប្រើប្រាស់បច្ចុប្បន្ន
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("សូម Login ជាមុនសិន");

      // ១. Upload File ទៅ Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('lessons-pdf')
        .upload(filePath, file);

      if (uploadError) throw new Error("មិនអាច Upload ឯកសារបានទេ: " + uploadError.message);

      // ទាញយក Public URL នៃឯកសារ
      const { data: { publicUrl } } = supabase.storage
        .from('lessons-pdf')
        .getPublicUrl(filePath);

      // ២. ហៅ API ដើម្បីសង្ខេប
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/summarize", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "មានបញ្ហាអ្វីមួយកើតឡើង");

      setSummary(data.summary);

      // ៣. រក្សាទុកចូល Database ជាមួយ Link ឯកសារ
      const { data: savedData, error: dbError } = await supabase
        .from('lessons')
        .insert({
          title: file.name.replace(".pdf", "").replace(".txt", ""),
          summary: data.summary,
          user_id: user.id,
          file_url: publicUrl, // 👈 រក្សាទុក Link
        })
        .select()
        .single();

      if (dbError) throw new Error(dbError.message);
      
      setSavedLessonId(savedData.id);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">ផ្ទុកឯកសារថ្មី</h1>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
        <UploadCloud className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
        <input
          type="file"
          accept=".pdf,.txt"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mb-6"
        />

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> កំពុងវិភាគដោយ AI...</>
          ) : (
            "ចាប់ផ្តើមសង្ខេប"
          )}
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>}

      {summary && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-500" /> លទ្ធផលសង្ខេប
          </h2>
          <div className="prose prose-indigo max-w-none whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">
            {summary}
          </div>
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <button 
              onClick={() => router.push(`/lessons/${savedLessonId}`)}
              className="bg-indigo-50 text-indigo-700 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-100 transition-all"
            >
              មើលមេរៀនពេញលេញ →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}