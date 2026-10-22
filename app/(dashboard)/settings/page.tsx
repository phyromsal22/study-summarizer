"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ShieldAlert, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const [isClearing, setIsClearing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClearData = async () => {
    const confirm = window.confirm("តើអ្នកប្រាកដជាចង់លុបទិន្នន័យទាំងអស់មែនទេ? មេរៀន ពិន្ទុ និងកាតចងចាំទាំងអស់នឹងត្រូវលុបចោលជារៀងរហូត។");
    
    if (confirm) {
      setIsClearing(true);
      const supabase = createClient();
      
      try {
        // លុបទិន្នន័យចេញពី Supabase តាមលំដាប់លំដោយ (ដើម្បីកុំឱ្យជាប់ Foreign Key)
        await supabase.from('flashcards').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('exams').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        
        // លុប LocalStorage ចាស់ៗ (បើមានសល់)
        localStorage.removeItem('studyai_lessons');
        localStorage.removeItem('studyai_exams');
        localStorage.removeItem('studyai_flashcards');
        
        setShowSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1500);
      } catch (error) {
        console.error("Error clearing data:", error);
        alert("មានបញ្ហាក្នុងការលុបទិន្នន័យ");
      } finally {
        setIsClearing(false);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">ការកំណត់</h1>
        <p className="text-gray-500 dark:text-gray-400">គ្រប់គ្រងគណនី និងទិន្នន័យរបស់អ្នក</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">គណនី (Profile)</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ព័ត៌មានអ្នកប្រើប្រាស់បណ្តោះអាសន្ន</p>
        </div>
        <div className="p-6 flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-2xl">
            S
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">សិស្ស StudyAI</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">គណនីធម្មតា (គ្មាន Login)</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-900/50 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-red-50 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/20">
          <h2 className="text-lg font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" /> តំបន់គ្រោះថ្នាក់ (Danger Zone)
          </h2>
        </div>
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">លុបទិន្នន័យទាំងអស់</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">លុបមេរៀន ពិន្ទុ និងកាតចងចាំទាំងអស់ចេញពី Database របស់អ្នក។</p>
          </div>
          
          <button
            onClick={handleClearData}
            disabled={isClearing || showSuccess}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-all whitespace-nowrap"
          >
            {showSuccess ? (
              <><CheckCircle2 className="w-5 h-5" /> លុបរួចរាល់</>
            ) : isClearing ? (
              "កំពុងលុប..."
            ) : (
              <><Trash2 className="w-5 h-5" /> លុបទិន្នន័យ</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}