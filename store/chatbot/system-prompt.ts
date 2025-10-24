'use client';

import { create } from 'zustand';
import { updateInstructions } from '@/lib/api/chatbot';

interface SystemPromptState {
  savedPrompt: string | null;
  draftPrompt: string;
  isSaving: boolean;
  error: Error | null;
  setSavedPrompt: (v: string) => void;
  setDraftPrompt: (v: string) => void;
  savePrompt: (chatbotId: string) => Promise<void>;
  resetDraft: () => void;
}

export const useSystemPromptStore = create<SystemPromptState>((set, get) => ({
  savedPrompt: null,
  draftPrompt: '',
  isSaving: false,
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
  resetDraft: () => set((s) => ({ draftPrompt: s.savedPrompt ?? '' })),
}));

export const useSystemPromptDraft = () => useSystemPromptStore((s) => s.draftPrompt);
export const useSetSystemPromptDraft = () => useSystemPromptStore((s) => s.setDraftPrompt);


