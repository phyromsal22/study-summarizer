import { getDeepseekClient } from './deepseek';

export type AITask = 'summarize' | 'flashcards' | 'qcm' | 'exam';

// ប្រើ DeepSeek សម្រាប់គ្រប់ Task ទាំងអស់សិន
export function getClient(task: AITask) {
  return getDeepseekClient();
}

export function getModel(task: AITask): string {
  return 'deepseek-chat';
}