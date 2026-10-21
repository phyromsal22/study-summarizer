import Link from "next/link";
import { Plus, FileText } from "lucide-react";

export default function DashboardPage() {
  const mockLessons = [
    { id: 1, title: "ជីវវិទ្យា ជំពូក 3", progress: 70, date: "ម្សិលមិញ" },
    { id: 2, title: "គណិតវិទ្យា ជំពូក 5", progress: 40, date: "ថ្ងៃនេះ" },
    { id: 3, title: "ប្រវត្តិវិទ្យា ជំពូក 2", progress: 100, date: "2 ថ្ងៃមុន" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* ប្រអប់ផ្ទុកឯកសារ */}
      <Link 
        href="/upload"
        className="block border-2 border-dashed border-gray-300 bg-white rounded-2xl p-10 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer"
      >
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">ផ្ទុកឯកសារថ្មី</h3>
        <p className="text-sm text-gray-500">អូសឯកសារ PDF មកទីនេះ ឬចុចដើម្បីជ្រើសរើស</p>
      </Link>

      {/* បញ្ជីមេរៀន */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">📖 ឯកសាររបស់ខ្ញុំ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockLessons.map((lesson) => (
            <Link 
              key={lesson.id} 
              href={`/lessons/${lesson.id}`}
              className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs text-gray-400">{lesson.date}</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-4">{lesson.title}</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>វឌ្ឍនភាព</span>
                  <span>{lesson.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full" 
                    style={{ width: `${lesson.progress}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}