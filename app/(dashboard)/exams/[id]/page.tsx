"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Download, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  const [isExporting, setIsExporting] = useState(false);

  const storageKey = `exam_progress_${resolvedParams.id}`;

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
        
        // ប្រសិនបើ Exam នេះធ្លាប់ធ្វើរួចហើយ មិនចាំបាច់ទាញយក Progress ទេ
        if (data.completed) {
          setIsFinished(true);
        } else {
          // ទាញយកចម្លើយចាស់ និងទំព័រចាស់មកវិញ
          const savedProgress = localStorage.getItem(storageKey);
          if (savedProgress) {
            try {
              const parsed = JSON.parse(savedProgress);
              setAnswers(parsed.answers || {});
              setCurrentIndex(parsed.currentIndex || 0);
            } catch (e) {
              console.error("Error parsing saved progress", e);
            }
          }
        }
      }
      setLoading(false);
    };

    fetchExam();
  }, [resolvedParams.id, storageKey]);

  // 👇 មុខងាររក្សាទុកទិន្នន័យភ្លាមៗ (ជួយការពារការបាត់ទិន្នន័យពេលចុចចេញរវល់)
  const saveProgress = (newAnswers: Record<number, string>, newIndex: number) => {
    localStorage.setItem(storageKey, JSON.stringify({ answers: newAnswers, currentIndex: newIndex }));
  };

  const handleSelectOption = (optionId: string) => {
    const newAnswers = { ...answers, [currentIndex]: optionId };
    setAnswers(newAnswers);
    saveProgress(newAnswers, currentIndex); // រក្សាទុកភ្លាមៗ
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      saveProgress(answers, nextIndex); // រក្សាទុកភ្លាមៗ
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      saveProgress(answers, prevIndex); // រក្សាទុកភ្លាមៗ
    }
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
    
    const supabase = createClient();
    await supabase
      .from('exams')
      .update({ score: finalScore, completed: true })
      .eq('id', resolvedParams.id);

    localStorage.removeItem(storageKey);
    setIsFinished(true);
  };

  const handleDownloadPDF = async () => {
    const input = document.getElementById("exam-pdf-content");
    if (!input) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${examTitle}.pdf`);
    } catch (error) {
      console.error("Error generating PDF", error);
    } finally {
      setIsExporting(false);
    }
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
      <div className="max-w-3xl mx-auto space-y-6 mt-10">
        <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">បញ្ចប់ការធ្វើតេស្ត!</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            ពិន្ទុរបស់អ្នក៖ <span className="font-bold text-indigo-600 text-3xl">{score}</span> / {questions.length}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button 
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {isExporting ? "កំពុងបង្កើត PDF..." : "ទាញយកជា PDF"}
            </button>
            <button 
              onClick={() => router.push('/exams')}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              ត្រឡប់ទៅប្រវត្តិតេស្ត
            </button>
          </div>
        </div>

        <div id="exam-pdf-content" className="bg-white p-8 rounded-2xl border border-gray-200">
          <div className="text-center mb-8 border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{examTitle}</h1>
            <p className="text-gray-600">ពិន្ទុសរុប: {score} / {questions.length}</p>
            <p className="text-gray-500 text-sm">កាលបរិច្ឆេទ: {new Date().toLocaleDateString('km-KH')}</p>
          </div>

          <div className="space-y-8">
            {questions.map((q, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === q.correct_answer;

              return (
                <div key={index} className="border-b pb-6 last:border-0">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                      {q.question}
                    </h3>
                  </div>

                  <div className="pl-11 space-y-2">
                    {q.options.map((opt) => {
                      const isCorrectOpt = opt.id === q.correct_answer;
                      const isUserChoice = opt.id === userAnswer;

                      let textClass = "text-gray-600";
                      if (isCorrectOpt) textClass = "text-green-700 font-bold";
                      else if (isUserChoice && !isCorrectOpt) textClass = "text-red-600 line-through";

                      return (
                        <div key={opt.id} className={`flex items-center gap-2 ${textClass}`}>
                          <span className="font-semibold">{opt.id}.</span>
                          <span>{opt.text}</span>
                          {isCorrectOpt && <CheckCircle2 className="w-4 h-4 ml-2" />}
                          {isUserChoice && !isCorrectOpt && <XCircle className="w-4 h-4 ml-2" />}
                        </div>
                      );
                    })}
                    
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                      <span className="font-semibold text-indigo-600">ការពន្យល់: </span>
                      {q.explanation}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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