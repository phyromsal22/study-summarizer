// lib/utils/storage.ts

// ================= TYPES =================
export type Lesson = {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
};

export type ExamRecord = {
  id: string;
  title: string;
  questions: any[];
  score?: number;
  totalQuestions: number;
  createdAt: string;
  completed: boolean;
};

export type Flashcard = {
  id: string;
  question: string;
  answer: string;
};

// ================= LESSON MANAGEMENT =================
export function saveLesson(lesson: Omit<Lesson, 'id' | 'createdAt'>) {
  const lessons = getLessons();
  const newLesson: Lesson = {
    ...lesson,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  lessons.unshift(newLesson);
  localStorage.setItem('studyai_lessons', JSON.stringify(lessons));
  return newLesson;
}

export function getLessons(): Lesson[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('studyai_lessons');
  return data ? JSON.parse(data) : [];
}

export function getLessonById(id: string): Lesson | undefined {
  return getLessons().find(l => l.id === id);
}

export function deleteLesson(id: string) {
  const lessons = getLessons().filter(l => l.id !== id);
  localStorage.setItem('studyai_lessons', JSON.stringify(lessons));
}

// ================= EXAM MANAGEMENT =================
export function saveExamToHistory(exam: Omit<ExamRecord, 'id' | 'createdAt' | 'completed'>) {
  const exams = getExamsHistory();
  const newExam: ExamRecord = {
    ...exam,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    completed: false,
  };
  exams.unshift(newExam);
  localStorage.setItem('studyai_exams', JSON.stringify(exams));
  return newExam;
}

export function getExamsHistory(): ExamRecord[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('studyai_exams');
  return data ? JSON.parse(data) : [];
}

export function getExamById(id: string): ExamRecord | undefined {
  return getExamsHistory().find(e => e.id === id);
}

export function updateExamScore(id: string, score: number) {
  const exams = getExamsHistory();
  const index = exams.findIndex(e => e.id === id);
  if (index !== -1) {
    exams[index].score = score;
    exams[index].completed = true;
    localStorage.setItem('studyai_exams', JSON.stringify(exams));
  }
}

// ================= FLASHCARD MANAGEMENT =================
export function saveFlashcardsToLesson(lessonId: string, cards: Omit<Flashcard, 'id'>[]) {
  if (typeof window === 'undefined') return [];
  
  // បង្កើត ID ឱ្យកាតនីមួយៗ
  const newCards: Flashcard[] = cards.map(c => ({
    ...c,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5)
  }));

  const allCards = getAllFlashcards();
  allCards[lessonId] = newCards;
  localStorage.setItem('studyai_flashcards', JSON.stringify(allCards));
  return newCards;
}

export function getAllFlashcards(): Record<string, Flashcard[]> {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem('studyai_flashcards');
  return data ? JSON.parse(data) : {};
}

export function getFlashcardsByLesson(lessonId: string): Flashcard[] {
  const allCards = getAllFlashcards();
  return allCards[lessonId] || [];
}
// ================= SYSTEM MANAGEMENT =================
export function clearAllData() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('studyai_lessons');
  localStorage.removeItem('studyai_exams');
  localStorage.removeItem('studyai_flashcards');
  localStorage.removeItem('current_exam');
}