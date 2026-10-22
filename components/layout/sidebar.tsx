"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  BookOpen, FileText, LayoutDashboard, PlusCircle, 
  Trophy, TrendingUp, Settings, LogOut, User 
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react"; // 👈 បន្ថែម useEffect, useState

const routes = [
  { name: "ផ្ទាំងដើម", path: "/dashboard", icon: LayoutDashboard },
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
  const [streak, setStreak] = useState(0); // 👈 បន្ថែម State សម្រាប់ Streak

  // ទាញយក Streak ពី Database ពេល Sidebar ត្រូវបាន Load
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
    <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen transition-colors duration-300">
      <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-700">
        <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
          <span className="text-2xl">📚</span> StudyAI
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {routes.map((route) => {
          const isActive = pathname === route.path;
          return (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                isActive 
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              <route.icon className={cn("w-5 h-5", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400")} />
              {route.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
        {/* 👇 បង្ហាញ Streak ពិតប្រាកដ 👇 */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl text-center border border-orange-100 dark:border-orange-900/50">
          <p className="text-sm font-bold text-orange-600 dark:text-orange-400 mb-1 flex items-center justify-center gap-1">
            🔥 {streak} ថ្ងៃជាប់គ្នា!
          </p>
          <p className="text-xs text-orange-500/80 dark:text-orange-300/80">
            {streak > 0 ? "បន្តខិតខំរៀនរាល់ថ្ងៃណា!" : "ចាប់ផ្តើមរៀនថ្ងៃនេះ!"}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-all"
        >
          <LogOut className="w-5 h-5" />
          ចាកចេញ (Logout)
        </button>
      </div>
    </aside>
  );
}