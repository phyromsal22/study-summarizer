"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Search, Plus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Lesson = {
  id: string;
  title: string;
  summary: string;
  created_at: string;
};

export default function MyLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      const supabase = createClient();
      // 👇 ទាញយកទិន្នន័យពី Supabase ដូច Dashboard
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLessons(data);
      }
      setLoading(false);
    };

    fetchLessons();
  }, []);

  // មុខងារស្វែងរកមេរៀនតាមចំណងជើង
  const filteredLessons = lessons.filter(lesson => 
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ក្បាលទំព័រ និងប្រអប់ស្វែងរក */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">ឯកសាររបស់ខ្ញុំ</h1>
          <p className="text-gray-500 dark:text-gray-400">មេរៀនសរុបចំនួន {lessons.length}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ស្វែងរកមេរៀន..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Link 
            href="/upload"
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 whitespace-nowrap shadow-sm"
          >
            <Plus className="w-5 h-5" /> បន្ថែម
          </Link>
        </div>
      </div>

      {/* បញ្ជីមេរៀន */}
      {filteredLessons.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {searchTerm ? "រកមិនឃើញមេរៀនទេ" : "មិនទាន់មានមេរៀនទេ"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchTerm ? "សូមសាកល្បងស្វែងរកពាក្យផ្សេង" : "ចាប់ផ្តើមផ្ទុកឯកសារដំបូងរបស់អ្នក"}
          </p>
          {!searchTerm && (
            <Link href="/upload" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-sm">
              ផ្ទុកឯកសារឥឡូវនេះ
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLessons.map((lesson) => (
            <Link 
              key={lesson.id} 
              href={`/lessons/${lesson.id}`}
              className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/40 dark:to-blue-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-3 flex-1 line-clamp-2 leading-snug">
                {lesson.title}
              </h4>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                  {new Date(lesson.created_at).toLocaleDateString('km-KH')}
                </p>
                <span className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold">
                  មើល →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}