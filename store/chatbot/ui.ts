'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LOCAL_STORAGE_KEY } from '@/utils/local-storage-key';

export type TabValue = 'data' | 'data-management' | 'customize' | 'system' | 'analytics' | 'settings';

interface ChatbotUiState {
  activeTab: TabValue;
  setActiveTab: (tab: TabValue) => void;
}

export const useChatbotUiStore = create<ChatbotUiState>()(
  persist(
    (set) => ({
      activeTab: 'data',
      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    {
      name: LOCAL_STORAGE_KEY.CHATBOT_DASHBOARD_UI,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ activeTab: s.activeTab }),
    },
  ),
);

export const useActiveTab = () => useChatbotUiStore((s) => s.activeTab);
export const useSetActiveTab = () => useChatbotUiStore((s) => s.setActiveTab);


