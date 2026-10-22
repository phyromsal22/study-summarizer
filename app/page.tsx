"use client";

import Link from "next/link";
import { BookOpen, Brain, FileText, Target, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-hidden relative">
      
      {/* ពន្លឺពណ៌ Gradient នៅផ្ទៃខាងក្រោយ */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-r from-indigo-300/30 to-purple-300/30 dark:from-indigo-900/20 dark:to-purple-900/20 blur-[120px] rounded-full -z-10" />

      {/* ផ្នែក Navbar */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto backdrop-blur-md bg-white/50 dark:bg-gray-900/50 sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-3xl">📚</span>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            StudyAI
          </span>
        </div>
        <Link 
          href="/dashboard"
          className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-full font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
        >
          ចូលទៅកាន់កម្មវិធី
        </Link>
      </nav>

      {/* ផ្នែក Hero */}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32 text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium text-sm mb-8 border border-indigo-100 dark:border-indigo-800"
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
          ប្រព័ន្ធសិក្សាដ៏ឆ្លាតវៃបំផុតសម្រាប់សិស្សនិស្សិត
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8 leading-tight"
        >
          សង្ខេបមេរៀន និងបង្កើតតេស្ត <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            ដោយប្រើប្រាស់ AI
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          បំប្លែងឯកសារ PDF ដ៏វែងរបស់អ្នកទៅជាសង្ខេបខ្លីៗ កាតចងចាំ និងសំណួរប្រឡងបានក្នុងរយៈពេលត្រឹមតែចុចប៊ូតុងមួយ។
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24"
        >
          <Link 
            href="/dashboard"
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
          >
            ចាប់ផ្តើមឥឡូវនេះ <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* ផ្នែកបង្ហាញមុខងារ (Features) */}
        <div className="grid md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
          {[
            { icon: FileText, title: "សង្ខេបឆ្លាតវៃ", desc: "បំប្លែងឯកសារ PDF ទៅជាចំណុចសំខាន់ៗភ្លាមៗ កាត់បន្ថយពេលវេលាអាន។", color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
            { icon: Target, title: "បង្កើតតេស្ត (Exam)", desc: "សាកល្បងចំណេះដឹងជាមួយសំណួរដែលបង្កើតដោយ AI ពីមេរៀនផ្ទាល់ខ្លួន។", color: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
            { icon: Brain, title: "កាតចងចាំ", desc: "រំលឹកមេរៀនឱ្យបានឆាប់រហ័ស និងមានប្រសិទ្ធភាពខ្ពស់បំផុតជាមួយ Flashcards។", color: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}