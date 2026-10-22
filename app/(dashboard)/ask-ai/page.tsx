"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send, Bot, User, Loader2, FileText, CheckCircle2 } from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  summary: string;
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function AskAIPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'សួស្តី! ខ្ញុំជាជំនួយការ AI របស់អ្នក។ សូមជ្រើសរើសមេរៀនខាងលើ រួចសួរខ្ញុំពីអ្វីដែលអ្នកចង់ដឹង។' }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingLessons, setFetchingLessons] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ទាញយកមេរៀនទាំងអស់
  useEffect(() => {
    const fetchLessons = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('lessons').select('id, title, summary');
      if (data) setLessons(data);
      setFetchingLessons(false);
    };
    fetchLessons();
  }, []);

  // រំកិលចុះក្រោមពេលមានសារថ្មី
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleLesson = (id: string) => {
    setSelectedLessons(prev => 
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    // ប្រមូលខ្លឹមសារមេរៀនដែលបានជ្រើសរើស
    const selectedData = lessons.filter(l => selectedLessons.includes(l.id));
    const contextText = selectedData.map(l => `មេរៀន៖ ${l.title}\n${l.summary}`).join("\n\n---\n\n");

    try {
      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contextText, question: userMsg }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: "សូមទោស មានបញ្ហាក្នុងការឆ្លើយតប។ សូមព្យាយាមម្តងទៀត។" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6">
      
      {/* ផ្នែកជ្រើសរើសមេរៀន (ខាងឆ្វេង) */}
      <div className="w-full md:w-80 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden shrink-0 h-1/3 md:h-full">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            ជ្រើសរើសមេរៀន
          </h2>
          <p className="text-xs text-gray-500 mt-1">អ្នកអាចជ្រើស ១ ឬច្រើនមេរៀន</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {fetchingLessons ? (
            <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
          ) : lessons.length === 0 ? (
            <p className="text-sm text-gray-500 text-center">មិនទាន់មានមេរៀនទេ</p>
          ) : (
            lessons.map(lesson => (
              <label 
                key={lesson.id}
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                  selectedLessons.includes(lesson.id)
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                    : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <input 
                  type="checkbox"
                  className="mt-1 w-4 h-4 text-indigo-600 rounded"
                  checked={selectedLessons.includes(lesson.id)}
                  onChange={() => toggleLesson(lesson.id)}
                />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug">
                  {lesson.title}
                </span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* ផ្នែក Chat (ខាងស្តាំ) */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden h-2/3 md:h-full">
        {/* សារ */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-sm' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                <span className="text-sm text-gray-500">កំពុងវិភាគ...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ប្រអប់វាយសារ */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedLessons.length > 0 ? "សួរអំពីមេរៀនដែលបានជ្រើសរើស..." : "សួរអ្វីក៏បាន (ឬជ្រើសមេរៀនជាមុន)..."}
              className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
            />
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-indigo-600 text-white p-3 px-6 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">ផ្ញើ</span>
            </button>
          </form>
          {selectedLessons.length > 0 && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> កំពុងប្រើប្រាស់មេរៀន {selectedLessons.length} សម្រាប់ការឆ្លើយតប
            </p>
          )}
        </div>
      </div>

    </div>
  );
}