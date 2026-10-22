"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { StudyTimer } from "@/components/study-timer"; // 👈 ភ្ជាប់ Timer

type Lesson = {
  id: string;
  title: string;
  summary: string;
  created_at: string;
  file_url?: string;
};

// Animation សម្រាប់កាតមេរៀននីមួយៗ
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1, // លេចឡើងម្តងមួយៗ
      duration: 0.4,
    },
  }),
};

export default function DashboardPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLessons(data);
      }
      // ពន្យារពេលបន្តិចដើម្បីឱ្យឃើញ Skeleton Loading ស្អាត
      setTimeout(() => setLoading(false), 500); 
    };

    fetchLessons();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* ផ្នែកខាងលើ៖ ប្រអប់ Upload និង Study Timer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ប្រអប់ Upload (យក ២ ចន្លោះ) */}
        <div className="md:col-span-2">
          <Link 
            href="/upload"
            className="block border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl p-10 text-center hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer h-full flex flex-col justify-center"
          >
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">ផ្ទុកឯកសារថ្មី</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">អូសឯកសារ PDF មកទីនេះ ឬចុចដើម្បីជ្រើសរើស</p>
          </Link>
        </div>

        {/* Study Timer (យក ១ ចន្លោះ) */}
        <div>
          <StudyTimer />
        </div>
      </div>

      {/* ផ្នែកខាងក្រោម៖ បញ្ជីមេរៀន */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">📖 ឯកសាររបស់ខ្ញុំ</h3>
        
        {/* Loading Skeleton ពេលកំពុងទាញទិន្នន័យ */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">មិនទាន់មានឯកសារទេ។ សូមផ្ទុកឯកសារដំបូងរបស់អ្នក!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
              >
                <Link 
                  href={`/lessons/${lesson.id}`}
                  className="block bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex-1 line-clamp-2">{lesson.title}</h4>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(lesson.created_at).toLocaleDateString('km-KH')}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}