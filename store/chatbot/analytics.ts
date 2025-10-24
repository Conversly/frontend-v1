'use client';

import { create } from 'zustand';
import { getAnalytics } from '@/lib/api/analytics';
import { AnalyticsData } from '@/types/analytics';

interface AnalyticsState {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: Error | null;
  loadAnalytics: (chatbotId: string) => Promise<void>;
  clear: () => void;
}

export const useChatbotAnalytics = create<AnalyticsState>((set) => ({
  data: null,
  isLoading: false,
  error: null,
  loadAnalytics: async (chatbotId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getAnalytics(chatbotId);
      set({ data, isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },
  clear: () => set({ data: null, isLoading: false, error: null }),
}));

export const useAnalyticsData = () => useChatbotAnalytics((s) => s.data);
export const useLoadAnalytics = () => useChatbotAnalytics((s) => s.loadAnalytics);


