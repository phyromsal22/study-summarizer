"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Trophy, Target, TrendingUp, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Lesson = { id: string };
type ExamRecord = {
  id: string;
  title: string;
  score: number;
  total_questions: number;
  created_at: string;
  completed: boolean;
};

export default function StatsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // ទាញយកមេរៀន
      const { data: lessonsData } = await supabase.from('lessons').select('id');
      if (lessonsData) setLessons(lessonsData);

      // ទាញយក Exam ទាំងអស់
      const { data: examsData } = await supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false });
      if (examsData) setExams(examsData);

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return null;

  const completedExams = exams.filter(e => e.completed);
  const totalCompleted = completedExams.length;
  
  const averageScore = totalCompleted > 0 
    ? Math.round((completedExams.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalCompleted) * 10) / 10
    : 0;

  const averagePercentage = totalCompleted > 0
    ? Math.round((completedExams.reduce((acc, curr) => acc + ((curr.score || 0) / curr.total_questions), 0) / totalCompleted) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">វឌ្ឍនភាពសិក្សា</h1>
        <p className="text-gray-500 dark:text-gray-400">មើលស្ថិតិ និងលទ្ធផលនៃការសិក្សារបស់អ្នក</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">មេរៀនសរុប</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{lessons.length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Exam បានធ្វើ</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalCompleted}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">ពិន្ទុមធ្យម</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{averageScore}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">ភាគរយមធ្យម</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{averagePercentage}%</h3>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">លទ្ធផលតេស្តថ្មីៗ</h2>
        </div>
        
        {completedExams.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">អ្នកមិនទាន់បានធ្វើតេស្តណាមួយនៅឡើយទេ</p>
            <Link href="/exams/new" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-all">
              បង្កើត Exam ឥឡូវនេះ
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {completedExams.slice(0, 5).map((exam) => (
              <div key={exam.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{exam.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(exam.created_at).toLocaleDateString('km-KH')} • {exam.total_questions} សំណួរ
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">ពិន្ទុ</p>
                  <p className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">
                    {exam.score} / {exam.total_questions}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}