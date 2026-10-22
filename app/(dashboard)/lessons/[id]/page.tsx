"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Target, Loader2, Layers } from "lucide-react";
import { createClient } from "@/lib/supabase/client"; // 👈 ប្រើ Supabase

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

  // ទាញយកទិន្នន័យមេរៀនពី Supabase
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 max-w-lg mx-auto mt-10">
        <h2 className="text-xl font-bold mb-2 text-red-500">រកមិនឃើញមេរៀនទេ</h2>
        <button onClick={() => router.push('/dashboard')} className="bg-indigo-600 text-white px-6 py-2 rounded-xl mt-4">
          ត្រឡប់ទៅផ្ទាំងដើម
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ក្បាលទំព័រ */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{lesson.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            បង្កើតនៅ៖ {new Date(lesson.created_at).toLocaleDateString('km-KH')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'summary' 
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          សង្ខេបមេរៀន
        </button>

        <button
          onClick={() => setActiveTab('flashcards')}
          className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'flashcards' 
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Layers className="w-5 h-5" />
          កាតចងចាំ
        </button>

        <button
          onClick={() => setActiveTab('qcm')}
          className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'qcm' 
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Target className="w-5 h-5" />
          QCM តេស្តខ្លី
        </button>
      </div>

      {/* ផ្ទាំងសង្ខេប */}
      {activeTab === 'summary' && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in">
          <div className="prose prose-indigo dark:prose-invert max-w-none whitespace-pre-wrap leading-loose text-gray-700 dark:text-gray-300 text-lg">
            {lesson.summary}
          </div>
        </div>
      )}

      {/* ផ្ទាំងកាតចងចាំ */}
      {activeTab === 'flashcards' && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center animate-in fade-in">
          <Layers className="w-16 h-16 text-indigo-200 dark:text-indigo-900/50 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">កាតចងចាំ</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">រំលឹកមេរៀនរបស់អ្នកឱ្យបានឆាប់រហ័ស</p>
          <button 
            onClick={() => router.push(`/lessons/${lesson.id}/flashcards`)}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all"
          >
            🎴 ចាប់ផ្តើមមើលកាត
          </button>
        </div>
      )}

      {/* ផ្ទាំង QCM */}
      {activeTab === 'qcm' && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center animate-in fade-in">
          <Target className="w-16 h-16 text-indigo-200 dark:text-indigo-900/50 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">QCM តេស្តខ្លីៗ</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">សាកល្បងចំណេះដឹងរបស់អ្នកលើមេរៀននេះ</p>
          <button 
            onClick={() => router.push(`/lessons/${lesson.id}/qcm`)}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all"
          >
            🚀 ចាប់ផ្តើមធ្វើតេស្ត QCM
          </button>
        </div>
      )}
    </div>
  );
}