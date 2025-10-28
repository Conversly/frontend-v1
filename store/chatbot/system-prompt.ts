'use client';

import { create } from 'zustand';
import { updateInstructions, getInstructions } from '@/lib/api/chatbot';

interface SystemPromptState {
  savedPrompt: string | null;
  draftPrompt: string;
  isSaving: boolean;
  isImproving: boolean;
  error: Error | null;
  setSavedPrompt: (v: string) => void;
  setDraftPrompt: (v: string) => void;
  savePrompt: (chatbotId: string) => Promise<void>;
  improvePrompt: (topic: string) => Promise<void>;
  resetDraft: () => void;
}

export const useSystemPromptStore = create<SystemPromptState>((set, get) => ({
  savedPrompt: null,
  draftPrompt: '',
  isSaving: false,
  isImproving: false,
  error: null,
  setSavedPrompt: (v) => set({ savedPrompt: v, draftPrompt: v }),
  setDraftPrompt: (v) => set({ draftPrompt: v }),
  savePrompt: async (chatbotId: string) => {
    const { draftPrompt } = get();
    set({ isSaving: true, error: null });
    try {
      const result = await updateInstructions(chatbotId, draftPrompt);
      set({ savedPrompt: result.systemPrompt, isSaving: false });
    } catch (error) {
      set({ error: error as Error, isSaving: false });
      throw error;
    }
  },
  improvePrompt: async (topic: string) => {
    set({ isImproving: true, error: null });
    try {
      const result = await getInstructions(topic);
      set({ draftPrompt: result.systemPrompt, isImproving: false });
    } catch (error) {
      set({ error: error as Error, isImproving: false });
      throw error;
    }
  },
  resetDraft: () => set((s) => ({ draftPrompt: s.savedPrompt ?? '' })),
}));

export const useSystemPromptDraft = () => useSystemPromptStore((s) => s.draftPrompt);
export const useSetSystemPromptDraft = () => useSystemPromptStore((s) => s.setDraftPrompt);


