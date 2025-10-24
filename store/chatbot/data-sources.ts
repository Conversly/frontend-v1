'use client';

import { create } from 'zustand';
import { PutBlobResult } from '@vercel/blob';
import { DocumentData } from '@/types/datasource';

export interface DataSource {
  id: string;
  type: 'file' | 'url' | 'text';
  name: string;
  size?: number;
  createdAt?: string;
}

export interface PendingSource {
  id: string;
  type: 'Website' | 'Document' | 'QandA' | 'CSV';
  name: string;
  content?: File | string;
  citation?: string;
  blobData?: DocumentData; // Store the blob result after upload
}

interface DataSourcesState {
  sources: DataSource[];
  pendingSources: PendingSource[];
  isLoading: boolean;
  uploadLoading: boolean;
  showQADialog: boolean;
  error: Error | null;
  
  // Pending sources management
  addPendingSource: (source: Omit<PendingSource, 'id'>) => void;
  removePendingSource: (id: string) => void;
  clearPendingSources: () => void;
  updatePendingSourceWithBlob: (id: string, blobData: DocumentData) => void;
  
  // Upload management
  uploadFile: (file: File) => Promise<DocumentData>;
  setUploadLoading: (loading: boolean) => void;
  
  // Dialog management
  setShowQADialog: (show: boolean) => void;
  
  // Loading states
  setIsLoading: (loading: boolean) => void;
  
  // Legacy methods (kept for compatibility)
  fetchSources: (chatbotId: number) => Promise<void>;
  addSource: (chatbotId: number, src: DataSource) => Promise<void>;
  removeSource: (chatbotId: number, id: string) => Promise<void>;
  setSources: (sources: DataSource[]) => void;
  clear: () => void;
}

export const useDataSourcesStore = create<DataSourcesState>((set, get) => ({
  sources: [],
  pendingSources: [],
  isLoading: false,
  uploadLoading: false,
  showQADialog: false,
  error: null,

  // Pending sources management
  addPendingSource: (source) => {
    const newSource: PendingSource = {
      ...source,
      id: Date.now().toString(),
    };
    set((state) => ({
      pendingSources: [...state.pendingSources, newSource],
    }));
  },

  removePendingSource: (id) => {
    set((state) => ({
      pendingSources: state.pendingSources.filter((s) => s.id !== id),
    }));
  },

  clearPendingSources: () => {
    set({ pendingSources: [] });
  },

  updatePendingSourceWithBlob: (id, blobData) => {
    set((state) => ({
      pendingSources: state.pendingSources.map((source) =>
        source.id === id ? { ...source, blobData } : source
      ),
    }));
  },

  // Upload management
  uploadFile: async (file: File) => {
    set({ uploadLoading: true });
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const blob = (await res.json()) as PutBlobResult;
      
      // Transform to DocumentData format
      const documentData: DocumentData = {
        url: blob.url,
        downloadUrl: blob.downloadUrl,
        pathname: blob.pathname,
        contentType: blob.contentType || file.type,
        contentDisposition: blob.contentDisposition || `attachment; filename="${file.name}"`,
      };

      set({ uploadLoading: false });
      return documentData;
    } catch (error) {
      set({ uploadLoading: false, error: error as Error });
      throw error;
    }
  },

  setUploadLoading: (loading) => set({ uploadLoading: loading }),

  // Dialog management
  setShowQADialog: (show) => set({ showQADialog: show }),

  // Loading states
  setIsLoading: (loading) => set({ isLoading: loading }),

  // API methods
  fetchSources: async (chatbotId: number) => {
    set({ isLoading: true, error: null });
    try {
      const { fetchDataSources } = await import('@/lib/api/datasource');
      const sources = await fetchDataSources(chatbotId.toString());
      
      // Transform API response to match DataSource interface
      const transformedSources: DataSource[] = sources.map((s) => ({
        id: s.id.toString(),
        type: s.type === 'Website' ? 'url' : s.type === 'Document' ? 'file' : 'text',
        name: s.name,
        createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : undefined,
      }));
      
      set({ sources: transformedSources, isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },
  addSource: async (_chatbotId: number, _src: DataSource) => {
    // This is handled by processDataSource via handleSaveAllSources
    // Keep for compatibility
  },
  removeSource: async (chatbotId: number, id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { deleteKnowledge } = await import('@/lib/api/datasource');
      await deleteKnowledge(chatbotId, parseInt(id));
      
      // Remove from local state
      set((state) => ({
        sources: state.sources.filter((s) => s.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },
  setSources: (sources) => set({ sources }),
  clear: () => set({ 
    sources: [], 
    pendingSources: [],
    isLoading: false, 
    uploadLoading: false,
    showQADialog: false,
    error: null 
  }),
}));

// Selectors
export const useDataSources = () => useDataSourcesStore((s) => s.sources);
export const usePendingSources = () => useDataSourcesStore((s) => s.pendingSources);
export const useIsLoading = () => useDataSourcesStore((s) => s.isLoading);
export const useUploadLoading = () => useDataSourcesStore((s) => s.uploadLoading);
export const useShowQADialog = () => useDataSourcesStore((s) => s.showQADialog);
export const useFetchDataSources = () => useDataSourcesStore((s) => s.fetchSources);


