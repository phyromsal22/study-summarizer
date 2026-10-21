"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FileText, LayoutDashboard, PlusCircle, Trophy, TrendingUp, Settings } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const routes = [
  { name: "ផ្ទាំងដើម", path: "/dashboard", icon: LayoutDashboard },
  { name: "ឯកសាររបស់ខ្ញុំ", path: "/lessons", icon: BookOpen },
  { name: "បង្កើត Exam", path: "/exams/new", icon: FileText },
  { name: "ប្រវត្តិតេស្ត", path: "/exams", icon: Trophy },
  { name: "វឌ្ឍនភាព", path: "/stats", icon: TrendingUp },
  { name: "ផ្ទុកឯកសារ", path: "/upload", icon: PlusCircle },
  { name: "ការកំណត់", path: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen transition-colors duration-300">
      <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-700">
        <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
          <span className="text-2xl">📚</span> StudyAI
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
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

      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl text-center">
          <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200 mb-1">🔥 7-Day Streak!</p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400">អ្នកកំពុងរៀនបានល្អណាស់</p>
        </div>
      </div>
    </aside>
  );
}