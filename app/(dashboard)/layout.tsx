import Link from "next/link"; // 👈 បន្ថែម Link
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar សម្រាប់អេក្រង់ធំ */}
      <Sidebar />

      {/* ផ្នែកខ្លឹមសារសំខាន់ */}
      <main className="flex-1 flex flex-col pb-16 md:pb-0">
        {/* Topbar */}
        <header className="pt-safe bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="h-16 flex items-center justify-between px-4 md:px-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              សួស្តី, សិស្ស! 👋
            </h2>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              
              {/* 👇 ធ្វើឱ្យរូប S អាចចុចចូលទៅកាន់ Profile បាន */}
              <Link 
                href="/profile" 
                className="w-10 h-10 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800 transition-colors rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold"
              >
                S
              </Link>
            </div>
          </div>
        </header>
        
        {/* ទំព័រផ្សេងៗនឹងបង្ហាញនៅទីនេះ */}
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Navigation សម្រាប់ទូរស័ព្ទ */}
      <MobileNav />
    </div>
  );
}