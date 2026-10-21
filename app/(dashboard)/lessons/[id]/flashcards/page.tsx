"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { getLessonById, getFlashcardsByLesson, saveFlashcardsToLesson, Flashcard } from "@/lib/utils/storage";

export default function FlashcardsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  // ទាញយក ឬបង្កើតកាតថ្មី
  useEffect(() => {
    const initFlashcards = async () => {
      const existingCards = getFlashcardsByLesson(resolvedParams.id);
      
      if (existingCards.length > 0) {
        setCards(existingCards);
        setLoading(false);
        return;
      }

      const lesson = getLessonById(resolvedParams.id);
      if (!lesson) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/flashcards/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ summary: lesson.summary }),
        });
        const data = await res.json();
        
        if (res.ok) {
          const savedCards = saveFlashcardsToLesson(resolvedParams.id, data.flashcards);
          setCards(savedCards);
        }
      } catch (err) {
        console.error("Failed to generate flashcards", err);
      } finally {
        setLoading(false);
      }
    };

    initFlashcards();
  }, [resolvedParams.id]);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-gray-500 animate-pulse">AI កំពុងបង្កើតកាតចងចាំសម្រាប់អ្នក...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center p-10 bg-white rounded-2xl border border-gray-100 max-w-lg mx-auto mt-10">
        <h2 className="text-xl font-bold mb-2">មានបញ្ហា</h2>
        <p className="text-gray-500 mb-4">មិនអាចបង្កើតកាតបានទេ</p>
        <button onClick={() => router.push(`/lessons/${resolvedParams.id}`)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl">
          ត្រឡប់ក្រោយ
        </button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-8 mt-4">
      {/* ក្បាលទំព័រ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push(`/lessons/${resolvedParams.id}`)}
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">កាតចងចាំ</h1>
        </div>
        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* កាតចងចាំ (Flip Card) */}
      <div 
        className="relative w-full h-[350px] cursor-pointer"
        style={{ perspective: '1000px' }} // បន្ថែម Perspective សម្រាប់ 3D
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className="w-full h-full relative"
          style={{
            transition: 'transform 0.6s',
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          
          {/* ផ្នែកខាងមុខ (សំណួរ) */}
          <div 
            className="absolute w-full h-full bg-white border-2 border-indigo-100 rounded-3xl shadow-sm p-8 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: 'hidden' }} // 👈 លាក់ខ្នងកាត
          >
            <span className="text-sm font-semibold text-indigo-400 mb-4 tracking-wider uppercase">សំណួរ</span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-relaxed">
              {currentCard.question}
            </h2>
            <p className="text-sm text-gray-400 mt-8 flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> ចុចដើម្បីមើលចម្លើយ
            </p>
          </div>

          {/* ផ្នែកខាងក្រោយ (ចម្លើយ) */}
          <div 
            className="absolute w-full h-full bg-indigo-600 rounded-3xl shadow-lg p-8 flex flex-col items-center justify-center text-center text-white"
            style={{ 
              backfaceVisibility: 'hidden', // 👈 លាក់ខ្នងកាត
              transform: 'rotateY(180deg)' // 👈 បង្វិលខ្នងកាត 180 ដឺក្រេ
            }}
          >
            <span className="text-sm font-semibold text-indigo-200 mb-4 tracking-wider uppercase">ចម្លើយ</span>
            <p className="text-xl md:text-2xl font-medium leading-relaxed">
              {currentCard.answer}
            </p>
          </div>

        </div>
      </div>

      {/* ប៊ូតុងបញ្ជា */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-4 bg-white border border-gray-200 rounded-full disabled:opacity-50 hover:bg-gray-50 transition-all shadow-sm"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        
        <p className="text-sm text-gray-400">ចុចលើកាតដើម្បីត្រឡប់</p>

        <button
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className="p-4 bg-indigo-600 text-white rounded-full disabled:opacity-50 hover:bg-indigo-700 transition-all shadow-sm"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}