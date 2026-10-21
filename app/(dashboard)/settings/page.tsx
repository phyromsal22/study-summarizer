"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ShieldAlert, CheckCircle2 } from "lucide-react";
import { clearAllData } from "@/lib/utils/storage";

export default function SettingsPage() {
  const router = useRouter();
  const [isClearing, setIsClearing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClearData = () => {
    // បង្ហាញប្រអប់សួរបញ្ជាក់មុននឹងលុប
    const confirm = window.confirm("តើអ្នកប្រាកដជាចង់លុបទិន្នន័យទាំងអស់មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានឡើយ។");
    
    if (confirm) {
      setIsClearing(true);
      clearAllData();
      
      // បង្ហាញសារជោគជ័យ រួចបញ្ជូនទៅ Dashboard
      setTimeout(() => {
        setShowSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh(); // Refresh ដើម្បីឱ្យ Dashboard ទំនេរ
        }, 1500);
      }, 500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ការកំណត់</h1>
        <p className="text-gray-500">គ្រប់គ្រងគណនី និងទិន្នន័យរបស់អ្នក</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-lg font-bold text-gray-900">គណនី (Profile)</h2>
          <p className="text-sm text-gray-500 mt-1">ព័ត៌មានអ្នកប្រើប្រាស់បណ្តោះអាសន្ន</p>
        </div>
        <div className="p-6 flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-2xl">
            S
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">សិស្ស StudyAI</h3>
            <p className="text-gray-500 text-sm">គណនីធម្មតា (គ្មាន Login)</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-red-50 bg-red-50/50">
          <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" /> តំបន់គ្រោះថ្នាក់ (Danger Zone)
          </h2>
        </div>
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900">លុបទិន្នន័យទាំងអស់</h3>
            <p className="text-sm text-gray-500 mt-1">លុបមេរៀន ពិន្ទុ និងកាតចងចាំទាំងអស់ចេញពី Browser នេះ។</p>
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