import Link from "next/link";
import { BookOpen, Brain, FileText, Target, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ផ្នែក Navbar */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-3xl">📚</span>
          <span className="text-2xl font-bold text-indigo-600">StudyAI</span>
        </div>
        <Link 
          href="/dashboard"
          className="bg-indigo-50 text-indigo-700 px-6 py-2 rounded-full font-semibold hover:bg-indigo-100 transition-all"
        >
          ចូលទៅកាន់កម្មវិធី
        </Link>
      </nav>

      {/* ផ្នែក Hero */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-medium text-sm mb-8">
          <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
          ប្រព័ន្ធសិក្សាដ៏ឆ្លាតវៃបំផុតសម្រាប់សិស្សនិស្សិត
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight">
          សង្ខេបមេរៀន និងបង្កើតតេស្ត <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            ដោយប្រើប្រាស់ AI
          </span>
        </h1>
        
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
          បំប្លែងឯកសារ PDF ដ៏វែងរបស់អ្នកទៅជាសង្ខេបខ្លីៗ កាតចងចាំ និងសំណួរប្រឡងបានក្នុងរយៈពេលត្រឹមតែចុចប៊ូតុងមួយ។ រៀនបានលឿនជាងមុន និងចងចាំបានយូរជាងមុន។
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link 
            href="/dashboard"
            className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            ចាប់ផ្តើមឥឡូវនេះ <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/upload"
            className="w-full sm:w-auto bg-white text-gray-700 border-2 border-gray-200 px-8 py-4 rounded-2xl font-bold text-lg hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
          >
            សាកល្បងផ្ទុកឯកសារ
          </Link>
        </div>

        {/* ផ្នែកបង្ហាញមុខងារ (Features) */}
        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">សង្ខេបឆ្លាតវៃ</h3>
            <p className="text-gray-500 leading-relaxed">
              បំប្លែងឯកសារ PDF ទៅជាចំណុចសំខាន់ៗភ្លាមៗ។ កាត់បន្ថយពេលវេលាអាន និងផ្តោតលើអ្វីដែលសំខាន់។
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <Target className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">បង្កើតតេស្ត (QCM & Exam)</h3>
            <p className="text-gray-500 leading-relaxed">
              សាកល្បងចំណេះដឹងរបស់អ្នកជាមួយសំណួរដែលបង្កើតដោយ AI ពីមេរៀនផ្ទាល់ខ្លួនរបស់អ្នក។
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6">
              <Brain className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">តាមដានវឌ្ឍនភាព</h3>
            <p className="text-gray-500 leading-relaxed">
              មើលពិន្ទុ និងប្រវត្តិនៃការធ្វើតេស្តរបស់អ្នក ដើម្បីដឹងថាតើអ្នកខ្សោយលើផ្នែកណា។
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} StudyAI. បង្កើតឡើងដើម្បីការសិក្សាដ៏ឆ្លាតវៃ។</p>
      </footer>
    </div>
  );
}