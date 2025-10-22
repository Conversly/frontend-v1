import { create } from "zustand";

export type AuthType = "google" | "phantom" | null;

interface AuthLoadingState {
  currentAuthType: AuthType;
  setAuthLoading: (authType: AuthType) => void;
  clearAuthLoading: () => void;
}

export const useAuthLoadingStore = create<AuthLoadingState>((set) => ({
  currentAuthType: null,

  setAuthLoading: (authType: AuthType) => set({ currentAuthType: authType }),

  clearAuthLoading: () => set({ currentAuthType: null }),
}));

export const useIsAnyAuthLoading = () =>
  useAuthLoadingStore((state) => state.currentAuthType !== null);
