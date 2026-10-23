"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  BookOpen, FileText, LayoutDashboard, PlusCircle, 
  Trophy, TrendingUp, Settings, LogOut, User, Bot 
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

const routes = [
  { name: "ផ្ទាំងដើម", path: "/dashboard", icon: LayoutDashboard },
  { name: "សួរ AI", path: "/ask-ai", icon: Bot },
  { name: "ឯកសាររបស់ខ្ញុំ", path: "/lessons", icon: BookOpen },
  { name: "បង្កើត Exam", path: "/exams/new", icon: FileText },
  { name: "ប្រវត្តិតេស្ត", path: "/exams", icon: Trophy },
  { name: "វឌ្ឍនភាព", path: "/stats", icon: TrendingUp },
  { name: "ផ្ទុកឯកសារ", path: "/upload", icon: PlusCircle },
  { name: "ការកំណត់", path: "/settings", icon: Settings },
  { name: "ប្រវត្តិរូប", path: "/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const fetchStreak = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('current_streak').eq('id', user.id).single();
        if (data) setStreak(data.current_streak);
      }
    };
    fetchStreak();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="hidden md:flex w-64 flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 min-h-screen transition-all duration-300">
      <div className="h-20 flex items-center px-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">📚</div>
          StudyAI
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-4">
        {routes.map((route) => {
          const isActive = pathname === route.path;
          return (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium group",
                isActive 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" 
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <route.icon className={cn(
                "w-5 h-5 transition-transform group-hover:scale-110", 
                isActive ? "text-white" : "text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400"
              )} />
              {route.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-4">
        {/* ប្រអប់ Streak */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-200/50 dark:bg-orange-700/30 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150" />
          <p className="text-sm font-bold text-orange-600 dark:text-orange-400 mb-1 flex items-center justify-center gap-1">
            🔥 {streak} ថ្ងៃជាប់គ្នា!
          </p>
          <p className="text-xs text-orange-500/80 dark:text-orange-300/80 relative z-10">
            {streak > 0 ? "បន្តខិតខំរៀនរាល់ថ្ងៃណា!" : "ចាប់ផ្តើមរៀនថ្ងៃនេះ!"}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 font-medium transition-all"
        >
          <LogOut className="w-5 h-5" />
          ចាកចេញ (Logout)
        </button>
      </div>
    </aside>
  );
}