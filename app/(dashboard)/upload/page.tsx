"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2, CheckCircle2 } from "lucide-react";
import { saveLesson } from "@/lib/utils/storage";

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

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "មានបញ្ហាអ្វីមួយកើតឡើង");

      setSummary(data.summary);

      // រក្សាទុកចូល localStorage
      const newLesson = saveLesson({
        title: file.name.replace(".pdf", "").replace(".txt", ""),
        summary: data.summary,
      });
      setSavedLessonId(newLesson.id);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">ផ្ទុកឯកសារថ្មី</h1>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
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
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-500" /> លទ្ធផលសង្ខេប
          </h2>
          <div className="prose prose-indigo max-w-none whitespace-pre-wrap leading-relaxed text-gray-700">
            {summary}
          </div>
          <div className="pt-4 border-t border-gray-100">
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