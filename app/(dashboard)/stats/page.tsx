"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Trophy, Target, TrendingUp, CheckCircle2, PlayCircle } from "lucide-react";
import { getLessons, getExamsHistory, Lesson, ExamRecord } from "@/lib/utils/storage";

export default function StatsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLessons(getLessons());
    setExams(getExamsHistory());
    setLoading(false);
  }, []);

  if (loading) return null;

  const completedExams = exams.filter(e => e.completed);
  const totalCompleted = completedExams.length;
  
  // គណនាពិន្ទុមធ្យម
  const averageScore = totalCompleted > 0 
    ? Math.round((completedExams.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalCompleted) * 10) / 10
    : 0;

  // គណនាភាគរយមធ្យម
  const averagePercentage = totalCompleted > 0
    ? Math.round((completedExams.reduce((acc, curr) => acc + ((curr.score || 0) / curr.totalQuestions), 0) / totalCompleted) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">វឌ្ឍនភាពសិក្សា</h1>
        <p className="text-gray-500">មើលស្ថិតិ និងលទ្ធផលនៃការសិក្សារបស់អ្នក</p>
      </div>

      {/* ប្រអប់ស្ថិតិ ៤ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">មេរៀនសរុប</p>
            <h3 className="text-2xl font-bold text-gray-900">{lessons.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Exam បានធ្វើ</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalCompleted}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">ពិន្ទុមធ្យម</p>
            <h3 className="text-2xl font-bold text-gray-900">{averageScore}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">ភាគរយមធ្យម</p>
            <h3 className="text-2xl font-bold text-gray-900">{averagePercentage}%</h3>
          </div>
        </div>
      </div>

      {/* បញ្ជីលទ្ធផលថ្មីៗ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">លទ្ធផលតេស្តថ្មីៗ</h2>
        </div>
        
        {completedExams.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500 mb-4">អ្នកមិនទាន់បានធ្វើតេស្តណាមួយនៅឡើយទេ</p>
            <Link href="/exams/new" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-all">
              បង្កើត Exam ឥឡូវនេះ
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {completedExams.slice(0, 5).map((exam) => (
              <div key={exam.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{exam.title}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(exam.createdAt).toLocaleDateString('km-KH')} • {exam.totalQuestions} សំណួរ
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">ពិន្ទុ</p>
                  <p className="font-bold text-indigo-600 text-lg">
                    {exam.score} / {exam.totalQuestions}
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