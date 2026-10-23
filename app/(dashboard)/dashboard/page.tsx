"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { StudyTimer } from "@/components/study-timer";

type Lesson = {
  id: string;
  title: string;
  summary: string;
  created_at: string;
  file_url?: string;
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function DashboardPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // 👇 ១. គណនា Study Streak ពិតប្រាកដ 👇
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const today = new Date().toISOString().split('T')[0];
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('current_streak, last_active_date')
          .eq('id', user.id)
          .single();

        if (!profile) {
          await supabase.from('profiles').insert({ id: user.id, current_streak: 1, last_active_date: today });
        } else if (profile.last_active_date !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          let newStreak = profile.current_streak;
          
          if (profile.last_active_date === yesterdayStr) {
            newStreak += 1; 
          } else {
            newStreak = 1; 
          }

          await supabase.from('profiles').update({ current_streak: newStreak, last_active_date: today }).eq('id', user.id);
        }
      }

      // 👇 ២. ទាញយកមេរៀន 👇
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLessons(data);
      }
      setTimeout(() => setLoading(false), 500); 
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-10">
      
      {/* ផ្នែកខាងលើ៖ ប្រអប់ Upload និង Study Timer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ប្រអប់ Upload (កែឱ្យស្អាតបែប Glassmorphism) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2"
        >
          <Link 
            href="/upload"
            className="group relative overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-[2rem] p-12 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 cursor-pointer h-full flex flex-col justify-center items-center shadow-sm hover:shadow-xl hover:shadow-indigo-500/10"
          >
            {/* ពន្លឺពណ៌ពេល Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-indigo-500/20">
                <Plus className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                ផ្ទុកឯកសារថ្មី <Sparkles className="w-5 h-5 text-yellow-500" />
              </h3>
              <p className="text-gray-500 dark:text-gray-400">អូសឯកសារ PDF មកទីនេះ ឬចុចដើម្បីជ្រើសរើស</p>
            </div>
          </Link>
        </motion.div>

        {/* Study Timer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StudyTimer />
        </motion.div>
      </div>

      {/* បញ្ជីមេរៀន */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">📖 ឯកសាររបស់ខ្ញុំ</h3>
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-1.5 rounded-full">
            {lessons.length} មេរៀន
          </span>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 animate-pulse h-48"></div>
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-[2rem] border border-gray-100 dark:border-gray-700">
            <FileText className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">មិនទាន់មានឯកសារទេ។ សូមផ្ទុកឯកសារដំបូងរបស់អ្នក!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  className="group block bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
                >
                  {/* ពន្លឺតូចនៅជ្រុងពេល Hover */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <FileText className="w-7 h-7" />
                    </div>
                    
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 text-xl mb-3 line-clamp-2 leading-snug flex-1">
                      {lesson.title}
                    </h4>
                    
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50 dark:border-gray-700/50">
                      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900/50 px-2.5 py-1 rounded-md">
                        {new Date(lesson.created_at).toLocaleDateString('km-KH')}
                      </p>
                      <span className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 transform translate-x-2 group-hover:translate-x-0 duration-300">
                        មើល →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}