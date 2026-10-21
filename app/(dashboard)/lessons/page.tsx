"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Search, Plus } from "lucide-react";
import { getLessons, Lesson } from "@/lib/utils/storage";

export default function MyLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLessons(getLessons());
    setLoading(false);
  }, []);

  // មុខងារស្វែងរកមេរៀនតាមចំណងជើង
  const filteredLessons = lessons.filter(lesson => 
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ក្បាលទំព័រ និងប្រអប់ស្វែងរក */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ឯកសាររបស់ខ្ញុំ</h1>
          <p className="text-gray-500">មេរៀនសរុបចំនួន {lessons.length}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ស្វែងរកមេរៀន..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Link 
            href="/upload"
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> បន្ថែម
          </Link>
        </div>
      </div>

      {/* បញ្ជីមេរៀន */}
      {filteredLessons.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? "រកមិនឃើញមេរៀនទេ" : "មិនទាន់មានមេរៀនទេ"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? "សូមសាកល្បងស្វែងរកពាក្យផ្សេង" : "ចាប់ផ្តើមផ្ទុកឯកសារដំបូងរបស់អ្នក"}
          </p>
          {!searchTerm && (
            <Link href="/upload" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-all">
              ផ្ទុកឯកសារឥឡូវនេះ
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLessons.map((lesson) => (
            <Link 
              key={lesson.id} 
              href={`/lessons/${lesson.id}`}
              className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-lg transition-all flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 flex-1 line-clamp-2">{lesson.title}</h4>
              <p className="text-xs text-gray-400">
                {new Date(lesson.createdAt).toLocaleDateString('km-KH')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}