"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, FileText, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Lesson = {
  id: string;
  title: string;
  summary: string;
};

export default function ExamBuilderPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLessons = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('lessons')
        .select('id, title, summary')
        .order('created_at', { ascending: false });
        
      if (data) {
        const validLessons = data.filter((l: any) => 
          l.title && 
          l.summary && 
          l.summary.trim() !== "" && 
          !l.title.match(/^[0-9a-f]{8}-[0-9a-f]{4}/i)
        );
        setLessons(validLessons);
      }
    };
    fetchLessons();
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
    setProgressText("កំពុងរៀបចំ...");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("សូម Login ជាមុនសិន");

      const selectedLessonData = lessons.filter(l => selectedLessons.includes(l.id));
      const combinedText = selectedLessonData.map(l => `មេរៀន៖ ${l.title}\n${l.summary}`).join("\n\n---\n\n");

      if (!combinedText) throw new Error("មេរៀនដែលបានជ្រើសរើសមិនមានសង្ខេបទេ");

      let allGeneratedQuestions: any[] = [];
      let remaining = totalQuestions;
      const batchSize = 5;

      while (remaining > 0) {
        const currentBatchSize = Math.min(remaining, batchSize);
        setProgressText(`កំពុងបង្កើតសំណួរ... (${allGeneratedQuestions.length}/${totalQuestions})`);

        // 👇 បញ្ជូនបញ្ជីសំណួរដែលបានបង្កើតរួច ទៅកាន់ API
        const existingQuestionTexts = allGeneratedQuestions.map(q => q.question);

        const res = await fetch("/api/exams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            contextText: combinedText, 
            totalQuestions: currentBatchSize, 
            difficulty,
            existingQuestions: existingQuestionTexts
          }),
        });

        const textResponse = await res.text();
        let data;
        try {
          data = JSON.parse(textResponse);
        } catch (parseError) {
          throw new Error(`ប្រព័ន្ធមានបញ្ហា (${res.status})។ សូមព្យាយាមម្តងទៀត។`);
        }

        if (!res.ok) throw new Error(data.error || "មានបញ្ហាក្នុងការបង្កើត Exam");

        allGeneratedQuestions.push(...data.questions);
        remaining -= currentBatchSize;
      }

      setProgressText("កំពុងរក្សាទុក...");

      const { data: newExam, error: dbError } = await supabase
        .from('exams')
        .insert({
          title: `Exam ថ្មី - ${new Date().toLocaleDateString('km-KH')}`,
          questions: allGeneratedQuestions,
          total_questions: allGeneratedQuestions.length,
          completed: false,
          user_id: user.id
        })
        .select()
        .single();

      if (dbError) throw new Error(dbError.message);

      router.push(`/exams/${newExam.id}`);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setProgressText("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">បង្កើត Exam ថ្មី</h1>
        <p className="text-gray-500 dark:text-gray-400">ជ្រើសរើសមេរៀនដែលអ្នកចង់ធ្វើតេស្ត</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <FileText className="w-5 h-5 text-indigo-500" /> មេរៀនដែលមាន
          </h2>
          
          {lessons.length === 0 ? (
             <p className="text-gray-500 text-sm">មិនទាន់មានមេរៀនដែលមានសង្ខេបទេ។ សូមទៅផ្ទុកឯកសារជាមុនសិន។</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {lessons.map((lesson) => (
                <label 
                  key={lesson.id}
                  className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedLessons.includes(lesson.id) 
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-600" 
                      : "border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-gray-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    checked={selectedLessons.includes(lesson.id)}
                    onChange={() => toggleLesson(lesson.id)}
                  />
                  <span className="ml-3 font-medium text-gray-900 dark:text-gray-100 flex-1 line-clamp-2">
                    {lesson.title}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" /> ចំនួនសំណួរសរុប
            </label>
            <input
              type="number"
              min={5}
              max={50}
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" /> កម្រិតពិបាក
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "easy", label: "ងាយស្រួល", color: "text-green-600" },
                { id: "medium", label: "មធ្យម", color: "text-yellow-600" },
                { id: "hard", label: "ពិបាក", color: "text-red-600" },
                { id: "mix", label: "ចម្រុះ", color: "text-indigo-600" },
              ].map((level) => (
                <button
                  key={level.id}
                  onClick={() => setDifficulty(level.id)}
                  className={`py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                    difficulty === level.id
                      ? `border-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 ${level.color} dark:text-white`
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300"
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/50">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={loading || selectedLessons.length === 0}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/30"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> {progressText}</>
          ) : (
            "✨ បង្កើត Exam ឥឡូវនេះ"
          )}
        </button>
      </div>
    </div>
  );
}