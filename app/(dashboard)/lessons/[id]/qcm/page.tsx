"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, ArrowLeft, Play, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Question = {
  question: string;
  options: { id: string; text: string }[];
  correct_answer: string;
  explanation: string;
};

export default function QCMPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState("");

  // States សម្រាប់ការកំណត់ (Setup)
  const [isStarted, setIsStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState("medium"); // 👈 បន្ថែម State សម្រាប់កម្រិត
  const [loading, setLoading] = useState(false);

  // មុខងារចាប់ផ្តើមបង្កើតសំណួរ
  const startQCM = async () => {
    setIsStarted(true);
    setLoading(true);
    setError("");

    const supabase = createClient();
    
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('summary')
      .eq('id', resolvedParams.id)
      .single();

    if (lessonError || !lesson) {
      setError("រកមិនឃើញមេរៀនទេ");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/qcm/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          summary: lesson.summary, 
          questionCount: questionCount,
          difficulty: difficulty // 👈 បញ្ជូនកម្រិតទៅ API
        }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setQuestions(data.questions);
      } else {
        throw new Error(data.error || "មិនអាចបង្កើតសំណួរបានទេ");
      }
    } catch (err: any) {
      console.error("Failed to load QCM", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (optionId: string) => {
    if (isAnswered) return;
    setSelectedOption(optionId);
    setIsAnswered(true);

    if (optionId === questions[currentIndex].correct_answer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  // ================= ផ្ទាំងកំណត់ (Setup Screen) =================
  if (!isStarted) {
    return (
      <div className="max-w-xl mx-auto space-y-6 mt-10">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.push(`/lessons/${resolvedParams.id}`)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">កំណត់ការធ្វើតេស្ត QCM</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-8 text-center">
          
          {/* ជ្រើសរើសចំនួនសំណួរ */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" /> ចំនួនសំណួរ
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {[5, 10, 15].map((num) => (
                <button
                  key={num}
                  onClick={() => setQuestionCount(num)}
                  className={`py-3 rounded-xl font-bold text-lg border-2 transition-all ${
                    questionCount === num
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-500"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* ជ្រើសរើសកម្រិតពិបាក */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" /> កម្រិតពិបាក
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "easy", label: "ងាយស្រួល", color: "text-green-600" },
                { id: "medium", label: "មធ្យម", color: "text-yellow-600" },
                { id: "hard", label: "ពិបាក", color: "text-red-600" },
                { id: "mix", label: "ចម្រុះ", color: "text-indigo-600" },
              ].map((level) => (
                <button
                  key={level.id}
                  onClick={() => setDifficulty(level.id)}
                  className={`py-3 rounded-xl font-bold border-2 transition-all ${
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

          <button
            onClick={startQCM}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
          >
            🚀 ចាប់ផ្តើមឥឡូវនេះ
          </button>
        </div>
      </div>
    );
  }

  // ================= Loading Screen =================
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4 mt-20">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        <p className="text-gray-500 dark:text-gray-400 animate-pulse text-lg">
          AI កំពុងបង្កើតសំណួរ {questionCount} សម្រាប់អ្នក...
        </p>
      </div>
    );
  }

  // ================= Error Screen =================
  if (error || questions.length === 0) {
    return (
      <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 max-w-lg mx-auto mt-10">
        <h2 className="text-xl font-bold mb-2 text-red-500">មានបញ្ហា</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error || "មិនអាចបង្កើតសំណួរបានទេ"}</p>
        <button onClick={() => setIsStarted(false)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl">
          ព្យាយាមម្តងទៀត
        </button>
      </div>
    );
  }

  // ================= Finished Screen =================
  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 mt-10 text-center">
        <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <CheckCircle2 className="w-20 h-20 text-indigo-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">ធ្វើតេស្តរួចរាល់!</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            ពិន្ទុរបស់អ្នក៖ <span className="font-bold text-indigo-600 text-3xl">{score}</span> / {questions.length}
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => router.push(`/lessons/${resolvedParams.id}`)}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              ត្រឡប់ទៅមេរៀន
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all"
            >
              ធ្វើម្តងទៀត
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= Quiz Screen =================
  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-6 mt-4">
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => router.push(`/lessons/${resolvedParams.id}`)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">QCM តេស្តខ្លី</h1>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
        <span>សំណួរទី {currentIndex + 1} នៃ {questions.length}</span>
        <span>ពិន្ទុ៖ {score}</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-8">
        <div 
          className="bg-indigo-500 h-2 rounded-full transition-all" 
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 leading-relaxed">
          {currentQ.question}
        </h2>

        <div className="space-y-3">
          {currentQ.options.map((opt) => {
            let buttonClass = "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-800 dark:text-gray-200";
            let icon = null;

            if (isAnswered) {
              if (opt.id === currentQ.correct_answer) {
                buttonClass = "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-300";
                icon = <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />;
              } else if (opt.id === selectedOption) {
                buttonClass = "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-300";
                icon = <XCircle className="w-5 h-5 text-red-600 ml-auto" />;
              } else {
                buttonClass = "border-gray-200 dark:border-gray-700 opacity-50";
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${buttonClass}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                  isAnswered && opt.id === currentQ.correct_answer ? "bg-green-600 text-white" :
                  isAnswered && opt.id === selectedOption ? "bg-red-600 text-white" :
                  "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}>
                  {opt.id}
                </div>
                <span className="font-medium flex-1">{opt.text}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className={`mt-6 p-4 rounded-xl text-sm animate-in fade-in slide-in-from-top-2 ${
            selectedOption === currentQ.correct_answer ? "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300" : "bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300"
          }`}>
            <p className="font-semibold mb-1">
              {selectedOption === currentQ.correct_answer ? "✅ ត្រឹមត្រូវ!" : "❌ មិនត្រឹមត្រូវទេ!"}
            </p>
            <p>{currentQ.explanation}</p>
          </div>
        )}
      </div>

      {isAnswered && (
        <div className="flex justify-end pt-4 animate-in fade-in">
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm"
          >
            {currentIndex === questions.length - 1 ? "មើលលទ្ធផល" : "សំណួរបន្ទាប់ →"}
          </button>
        </div>
      )}
    </div>
  );
}