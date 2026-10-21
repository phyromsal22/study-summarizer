"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Loader2, ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";
import { getExamsHistory, ExamRecord } from "@/lib/utils/storage";

export default function ExamListPage() {
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setExams(getExamsHistory());
    setLoading(false);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ប្រវត្តិតេស្ត</h1>
          <p className="text-gray-500">បញ្ជី Exam ដែលអ្នកបានបង្កើត</p>
        </div>
        <Link 
          href="/exams/new"
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm"
        >
          + បង្កើត Exam ថ្មី
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">មិនទាន់មាន Exam ទេ</h3>
          <p className="text-gray-500 mb-6">អ្នកមិនទាន់បង្កើត Exam ណាមួយនៅឡើយទេ</p>
          <Link 
            href="/exams/new"
            className="text-indigo-600 font-medium hover:underline inline-flex items-center gap-2"
          >
            ចាប់ផ្តើមបង្កើតឥឡូវនេះ <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => (
            <Link 
              key={exam.id}
              href={`/exams/${exam.id}`}
              className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    exam.completed ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                  }`}>
                    {exam.completed ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(exam.createdAt).toLocaleDateString('km-KH')}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{exam.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{exam.totalQuestions} សំណួរ</p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-2">
                {exam.completed ? (
                  <div>
                    <span className="text-sm text-gray-500">ពិន្ទុ៖ </span>
                    <span className="font-bold text-indigo-600 text-lg">{exam.score}</span>
                    <span className="text-gray-400 text-sm"> / {exam.totalQuestions}</span>
                  </div>
                ) : (
                  <span className="text-sm text-orange-500 font-medium flex items-center gap-1">
                    <PlayCircle className="w-4 h-4" /> មិនទាន់ធ្វើតេស្ត
                  </span>
                )}
                <span className="text-indigo-600 text-sm font-medium">មើលលម្អិត →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}