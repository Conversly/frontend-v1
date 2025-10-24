'use client';

import { create } from 'zustand';

export interface UiTheme { primary: string; secondary: string; darkMode: boolean }
export interface WidgetConfig { position: 'left' | 'right'; rounded: boolean }

interface CustomizationState {
  saved: { theme: UiTheme; widget: WidgetConfig } | null;
  draft: { theme: UiTheme; widget: WidgetConfig } | null;
  isSaving: boolean;
  setDraft: (draft: NonNullable<CustomizationState['draft']>) => void;
  setSaved: (saved: NonNullable<CustomizationState['saved']>) => void;
  resetDraft: () => void;
  saveCustomization: (chatbotId: number) => Promise<void>;
}

export const useCustomizationStore = create<CustomizationState>((set) => ({
  saved: null,
  draft: null,
  isSaving: false,
  setDraft: (draft) => set({ draft }),
  setSaved: (saved) => set({ saved, draft: saved }),
  resetDraft: () => set((s) => ({ draft: s.saved })),
  saveCustomization: async (_chatbotId: number) => {
    // TODO: replace with backend API call
  },
}));

export const useCustomizationDraft = () => useCustomizationStore((s) => s.draft);


