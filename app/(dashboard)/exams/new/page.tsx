"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, FileText } from "lucide-react";
import { getLessons, Lesson, saveExamToHistory } from "@/lib/utils/storage";

export default function ExamBuilderPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLessons(getLessons());
  }, []);

  const toggleLesson = (id: string) => {
    setSelectedLessons(prev => 
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (selectedLessons.length === 0) {
      setError("សូមជ្រើសរើសយ៉ាងហោចណាស់មេរៀនមួយ");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const selectedLessonData = lessons.filter(l => selectedLessons.includes(l.id));
      const combinedText = selectedLessonData.map(l => l.summary).join("\n\n");

      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contextText: combinedText, totalQuestions }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "មានបញ្ហាក្នុងការបង្កើត Exam");

      // រក្សាទុកចូល LocalStorage
      const newExam = saveExamToHistory({
        title: `Exam ថ្មី - ${new Date().toLocaleDateString('km-KH')}`,
        questions: data.questions,
        totalQuestions: data.questions.length,
      });

      router.push(`/exams/${newExam.id}`);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">បង្កើត Exam ថ្មី</h1>
        <p className="text-gray-500">ជ្រើសរើសមេរៀនដែលអ្នកចង់ធ្វើតេស្ត</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" /> មេរៀនដែលមាន
          </h2>
          
          {lessons.length === 0 ? (
             <p className="text-gray-500 text-sm">មិនទាន់មានមេរៀនទេ។ សូមទៅផ្ទុកឯកសារជាមុនសិន។</p>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson) => (
                <label 
                  key={lesson.id}
                  className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedLessons.includes(lesson.id) 
                      ? "border-indigo-500 bg-indigo-50" 
                      : "border-gray-100 hover:border-indigo-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    checked={selectedLessons.includes(lesson.id)}
                    onChange={() => toggleLesson(lesson.id)}
                  />
                  <span className="ml-3 font-medium text-gray-900 flex-1">{lesson.title}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ចំនួនសំណួរសរុប
          </label>
          <input
            type="number"
            min={5}
            max={50}
            value={totalQuestions}
            onChange={(e) => setTotalQuestions(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={loading || selectedLessons.length === 0}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> កំពុងបង្កើត Exam...</>
          ) : (
            "✨ បង្កើត Exam ឥឡូវនេះ"
          )}
        </button>
      </div>
    </div>
  );
}