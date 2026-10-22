"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Target, Loader2, Layers, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Lesson = {
  id: string;
  title: string;
  summary: string;
  created_at: string;
  file_url?: string;
};

export default function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'qcm'>('summary');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (!error && data) {
        setLesson(data);
      }
      setLoading(false);
    };

    fetchLesson();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 max-w-lg mx-auto mt-10">
        <h2 className="text-xl font-bold mb-2 text-red-500">រកមិនឃើញមេរៀនទេ</h2>
        <button onClick={() => router.push('/dashboard')} className="bg-indigo-600 text-white px-6 py-2 rounded-xl mt-4 hover:bg-indigo-700 transition-all">
          ត្រឡប់ទៅផ្ទាំងដើម
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ក្បាលទំព័រ */}
      <div className="flex items-start gap-4 mb-8">
        <button 
          onClick={() => router.push('/dashboard')}
          className="p-2 mt-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all shrink-0"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-snug">
            {lesson.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              📅 បង្កើតនៅ៖ {new Date(lesson.created_at).toLocaleDateString('km-KH')}
            </span>
            {lesson.file_url && (
              <a 
                href={lesson.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full"
              >
                📄 មើលឯកសារដើម
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto bg-white dark:bg-gray-800 rounded-t-2xl p-2 gap-2">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'summary' 
              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
              : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50'
          }`}
        >
          <BookOpen className="w-5 h-5" /> សង្ខេបមេរៀន
        </button>

        <button
          onClick={() => setActiveTab('flashcards')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'flashcards' 
              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
              : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50'
          }`}
        >
          <Layers className="w-5 h-5" /> កាតចងចាំ
        </button>

        <button
          onClick={() => setActiveTab('qcm')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'qcm' 
              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
              : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50'
          }`}
        >
          <Target className="w-5 h-5" /> QCM តេស្តខ្លី
        </button>
      </div>

      {/* ផ្ទាំងសង្ខេប */}
      {activeTab === 'summary' && (
        <div className="bg-white dark:bg-gray-800 p-6 md:p-10 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">ខ្លឹមសារសង្ខេបដោយ AI</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">អានឱ្យបានឆាប់រហ័ស និងចងចាំបានយូរ</p>
            </div>
          </div>

          {/* បង្ហាញ Markdown ជាមួយ Custom Styling ដ៏ស្អាត */}
          <div className="text-gray-700 dark:text-gray-300">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4 border-b pb-2" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mt-8 mb-4 flex items-center gap-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3" {...props} />,
                p: ({node, ...props}) => <p className="mb-4 leading-[2] text-[1.05rem]" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-3 marker:text-indigo-500" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-3 marker:text-indigo-500 font-medium" {...props} />,
                li: ({node, ...props}) => <li className="leading-[1.8] pl-2" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-gray-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/30 px-1 rounded" {...props} />,
              }}
            >
              {lesson.summary}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* ផ្ទាំងកាតចងចាំ */}
      {activeTab === 'flashcards' && (
        <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center animate-in fade-in slide-in-from-bottom-4">
          <div className="w-20 h-20 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Layers className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">កាតចងចាំ</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">រំលឹកមេរៀនរបស់អ្នកឱ្យបានឆាប់រហ័ស និងមានប្រសិទ្ធភាពជាមួយ AI Flashcards</p>
          <button 
            onClick={() => router.push(`/lessons/${lesson.id}/flashcards`)}
            className="bg-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 mx-auto"
          >
            🎴 ចាប់ផ្តើមមើលកាត
          </button>
        </div>
      )}

      {/* ផ្ទាំង QCM */}
      {activeTab === 'qcm' && (
        <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center animate-in fade-in slide-in-from-bottom-4">
          <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">QCM តេស្តខ្លីៗ</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">សាកល្បងចំណេះដឹងរបស់អ្នកលើមេរៀននេះជាមួយសំណួរដែលបង្កើតដោយ AI</p>
          <button 
            onClick={() => router.push(`/lessons/${lesson.id}/qcm`)}
            className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 mx-auto"
          >
            🚀 ចាប់ផ្តើមធ្វើតេស្ត QCM
          </button>
        </div>
      )}
    </div>
  );
}