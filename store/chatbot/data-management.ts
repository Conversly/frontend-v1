'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LOCAL_STORAGE_KEY } from '@/utils/local-storage-key';

interface DataManagementState {
  selectedIds: string[];
  filters: { query: string; type: 'all' | 'file' | 'url' | 'text' };
  sort: { key: 'name' | 'createdAt'; dir: 'asc' | 'desc' };
  page: number;
  pageSize: number;
  setSelectedIds: (ids: string[]) => void;
  setFilters: (f: Partial<DataManagementState['filters']>) => void;
  setSort: (s: Partial<DataManagementState['sort']>) => void;
  setPage: (p: number) => void;
  reset: () => void;
}

export const useDataManagementStore = create<DataManagementState>()(
  persist(
    (set, get) => ({
      selectedIds: [],
      filters: { query: '', type: 'all' },
      sort: { key: 'createdAt', dir: 'desc' },
      page: 1,
      pageSize: 20,
      setSelectedIds: (ids) => set({ selectedIds: ids }),
      setFilters: (f) => set({ filters: { ...get().filters, ...f } }),
      setSort: (s) => set({ sort: { ...get().sort, ...s } }),
      setPage: (p) => set({ page: p }),
      reset: () =>
        set({
          selectedIds: [],
          filters: { query: '', type: 'all' },
          sort: { key: 'createdAt', dir: 'desc' },
          page: 1,
        }),
    }),
    {
      name: LOCAL_STORAGE_KEY.CHATBOT_DATA_MANAGEMENT,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        selectedIds: s.selectedIds,
        filters: s.filters,
        sort: s.sort,
        page: s.page,
        pageSize: s.pageSize,
      }),
    },
  ),
);

export const useDataManagementFilters = () => useDataManagementStore((s) => s.filters);
export const useDataManagementSelected = () => useDataManagementStore((s) => s.selectedIds);


