"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FileText, LayoutDashboard, Trophy, Bot } from "lucide-react"; // 👈 ប្តូរ User ទៅ Trophy
import { cn } from "@/lib/utils/cn";

const routes = [
  { name: "ដើម", path: "/dashboard", icon: LayoutDashboard },
  { name: "សួរ AI", path: "/ask-ai", icon: Bot },
  { name: "មេរៀន", path: "/lessons", icon: BookOpen },
  { name: "បង្កើត Exam", path: "/exams/new", icon: FileText },
  { name: "ប្រវត្តិតេស្ត", path: "/exams", icon: Trophy }, // 👈 ដាក់ប្រវត្តិតេស្តមកវិញ
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 pb-safe transition-colors duration-300">
      <div className="flex justify-around items-center h-16">
        {routes.map((route) => {
          const isActive = pathname === route.path;
          return (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              <route.icon className={cn("w-5 h-5", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400")} />
              <span className="text-[10px] font-medium">{route.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}