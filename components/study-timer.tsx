"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";

export function StudyTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 នាទី
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (interval) clearInterval(interval);
      alert("អបអរសាទរ! អ្នកបានរៀនរួចរាល់ ២៥ នាទីហើយ។ សម្រាកបន្តិចណា!");
      setTimeLeft(25 * 60);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex flex-col items-center justify-center">
      <div className="flex items-center gap-2 mb-4">
        <Timer className="w-6 h-6 text-indigo-100" />
        <h3 className="font-semibold text-lg">Study Timer</h3>
      </div>
      
      <div className="text-5xl font-bold font-mono tracking-wider mb-6">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTimer}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-2 rounded-full font-medium transition-all"
        >
          {isActive ? (
            <><Pause className="w-4 h-4" /> ផ្អាក</>
          ) : (
            <><Play className="w-4 h-4" /> ចាប់ផ្តើម</>
          )}
        </button>
        <button
          onClick={resetTimer}
          className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all"
          title="ចាប់ផ្តើមឡើងវិញ"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}