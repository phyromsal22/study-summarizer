"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Question = {
  question: string;
  options: { id: string; text: string }[];
  correct_answer: string;
  explanation: string;
};

export default function ExamRunnerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [examTitle, setExamTitle] = useState("");

  // ទាញយក Exam ពី Supabase
  useEffect(() => {
    const fetchExam = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (!error && data) {
        setQuestions(data.questions);
        setExamTitle(data.title);
      }
      setLoading(false);
    };

    fetchExam();
  }, [resolvedParams.id]);

  const handleSelectOption = (optionId: string) => {
    setAnswers({ ...answers, [currentIndex]: optionId });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct_answer) score++;
    });
    return score;
  };

  const handleFinish = async () => {
    const finalScore = calculateScore();
    
    // រក្សាទុកពិន្ទុចូល Supabase
    const supabase = createClient();
    await supabase
      .from('exams')
      .update({ score: finalScore, completed: true })
      .eq('id', resolvedParams.id);

    setIsFinished(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 max-w-lg mx-auto mt-10">
        <h2 className="text-xl font-bold mb-2 text-red-500">រកមិនឃើញ Exam នេះទេ</h2>
        <button onClick={() => router.push('/exams')} className="bg-indigo-600 text-white px-6 py-2 rounded-xl mt-4">
          ត្រឡប់ទៅប្រវត្តិតេស្ត
        </button>
      </div>
    );
  }

  if (isFinished) {
    const score = calculateScore();
    return (
      <div className="max-w-2xl mx-auto space-y-6 mt-10 text-center">
        <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">បញ្ចប់ការធ្វើតេស្ត!</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            ពិន្ទុរបស់អ្នក៖ <span className="font-bold text-indigo-600 text-3xl">{score}</span> / {questions.length}
          </p>
          <button 
            onClick={() => router.push('/exams')}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all"
          >
            ត្រឡប់ទៅប្រវត្តិតេស្ត
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">{examTitle}</h1>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
        <span>សំណួរទី {currentIndex + 1} នៃ {questions.length}</span>
        <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
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
            const isSelected = answers[currentIndex] === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                  isSelected 
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200" 
                    : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-800 dark:text-gray-200"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  isSelected ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}>
                  {opt.id}
                </div>
                <span className="font-medium">{opt.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          ត្រឡប់ក្រោយ
        </button>

        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleFinish}
            className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-sm"
          >
            បញ្ចប់ និងមើលពិន្ទុ
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm"
          >
            សំណួរបន្ទាប់
          </button>
        )}
      </div>
    </div>
  );
}