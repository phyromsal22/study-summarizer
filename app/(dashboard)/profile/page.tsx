"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, Mail, LogOut, Loader2, Save } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        // ទាញយកឈ្មោះដែលបានរក្សាទុក (បើមាន)
        setFullName(user.user_metadata?.full_name || "");
      }
      setLoading(false);
    };

    getUser();
  }, []);

  const handleUpdateProfile = async () => {
    setSaving(true);
    setMessage("");
    const supabase = createClient();
    
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });

    if (!error) {
      setMessage("បានធ្វើបច្ចុប្បន្នភាពប្រវត្តិរូបដោយជោគជ័យ!");
    } else {
      setMessage("មានបញ្ហា: " + error.message);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">ប្រវត្តិរូបរបស់ខ្ញុំ</h1>
        <p className="text-gray-500 dark:text-gray-400">គ្រប់គ្រងព័ត៌មានគណនីរបស់អ្នក</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* ផ្នែកក្បាល Profile */}
        <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex items-center gap-6">
          <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-4xl uppercase">
            {fullName ? fullName.charAt(0) : user?.email?.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {fullName || "សិស្ស StudyAI"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4" /> {user?.email}
            </p>
          </div>
        </div>

        {/* ផ្នែកកែប្រែព័ត៌មាន */}
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" /> ឈ្មោះពេញ
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="បញ្ចូលឈ្មោះរបស់អ្នក..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          {message && (
            <p className={`text-sm ${message.includes("ជោគជ័យ") ? "text-green-500" : "text-red-500"}`}>
              {message}
            </p>
          )}

          <button
            onClick={handleUpdateProfile}
            disabled={saving}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            រក្សាទុកការផ្លាស់ប្តូរ
          </button>
        </div>
      </div>

      {/* ផ្នែក Logout */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">ចាកចេញពីគណនី</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">អ្នកនឹងត្រូវ Login ឡើងវិញនៅពេលក្រោយ។</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition-all whitespace-nowrap"
        >
          <LogOut className="w-5 h-5" /> ចាកចេញ (Logout)
        </button>
      </div>
    </div>
  );
}