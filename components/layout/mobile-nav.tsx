"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FileText, LayoutDashboard, PlusCircle, Trophy, Settings } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const routes = [
  { name: "ដើម", path: "/dashboard", icon: LayoutDashboard },
  { name: "មេរៀន", path: "/lessons", icon: BookOpen },
  { name: "Exam", path: "/exams/new", icon: FileText },
  { name: "ប្រវត្តិ", path: "/exams", icon: Trophy },
  { name: "កំណត់", path: "/settings", icon: Settings }, // 👈 បន្ថែមនៅទីនេះ
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
      <div className="flex justify-around items-center h-16">
        {routes.map((route) => {
          const isActive = pathname === route.path;
          return (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <route.icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : "text-gray-400")} />
              <span className="text-[10px] font-medium">{route.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}