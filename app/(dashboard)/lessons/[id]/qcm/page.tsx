"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { getLessonById } from "@/lib/utils/storage";

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
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  // ទាញយកសង្ខេប និងបង្កើតសំណួរ
  useEffect(() => {
    const generateQCM = async () => {
      const lesson = getLessonById(resolvedParams.id);
      if (!lesson) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/qcm/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ summary: lesson.summary, questionCount: 5 }),
        });
        const data = await res.json();
        
        if (res.ok) {
          setQuestions(data.questions);
        }
      } catch (err) {
        console.error("Failed to load QCM", err);
      } finally {
        setLoading(false);
      }
    };

    generateQCM();
  }, [resolvedParams.id]);

  const handleSelect = (optionId: string) => {
    if (isAnswered) return; // មិនឱ្យចុចពីរដង

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

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-gray-500 animate-pulse">AI កំពុងបង្កើតសំណួរសម្រាប់អ្នក...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center p-10 bg-white rounded-2xl border border-gray-100 max-w-lg mx-auto mt-10">
        <h2 className="text-xl font-bold mb-2">មានបញ្ហា</h2>
        <p className="text-gray-500 mb-4">មិនអាចបង្កើតសំណួរបានទេ</p>
        <button onClick={() => router.push(`/lessons/${resolvedParams.id}`)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl">
          ត្រឡប់ក្រោយ
        </button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 mt-10 text-center">
        <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm">
          <CheckCircle2 className="w-20 h-20 text-indigo-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ធ្វើតេស្តរួចរាល់!</h1>
          <p className="text-xl text-gray-600 mb-6">
            ពិន្ទុរបស់អ្នក៖ <span className="font-bold text-indigo-600 text-3xl">{score}</span> / {questions.length}
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => router.push(`/lessons/${resolvedParams.id}`)}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
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

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ក្បាលទំព័រ */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => router.push(`/lessons/${resolvedParams.id}`)}
          className="p-2 hover:bg-gray-100 rounded-full transition-all"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">QCM តេស្តខ្លី</h1>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
        <span>សំណួរទី {currentIndex + 1} នៃ {questions.length}</span>
        <span>ពិន្ទុ៖ {score}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
        <div 
          className="bg-indigo-500 h-2 rounded-full transition-all" 
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* ប្រអប់សំណួរ */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">
          {currentQ.question}
        </h2>

        <div className="space-y-3">
          {currentQ.options.map((opt) => {
            // កំណត់ពណ៌ពេលឆ្លើយរួច
            let buttonClass = "border-gray-200 hover:border-indigo-300 hover:bg-gray-50";
            let icon = null;

            if (isAnswered) {
              if (opt.id === currentQ.correct_answer) {
                buttonClass = "border-green-500 bg-green-50 text-green-900";
                icon = <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />;
              } else if (opt.id === selectedOption) {
                buttonClass = "border-red-500 bg-red-50 text-red-900";
                icon = <XCircle className="w-5 h-5 text-red-600 ml-auto" />;
              } else {
                buttonClass = "border-gray-200 opacity-50"; // ធ្វើឱ្យព្រិលៗ
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
                  "bg-gray-100 text-gray-500"
                }`}>
                  {opt.id}
                </div>
                <span className="font-medium flex-1">{opt.text}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {/* បង្ហាញការពន្យល់ពេលឆ្លើយរួច */}
        {isAnswered && (
          <div className={`mt-6 p-4 rounded-xl text-sm animate-in fade-in slide-in-from-top-2 ${
            selectedOption === currentQ.correct_answer ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}>
            <p className="font-semibold mb-1">
              {selectedOption === currentQ.correct_answer ? "✅ ត្រឹមត្រូវ!" : "❌ មិនត្រឹមត្រូវទេ!"}
            </p>
            <p>{currentQ.explanation}</p>
          </div>
        )}
      </div>

      {/* ប៊ូតុងបន្ទាប់ */}
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