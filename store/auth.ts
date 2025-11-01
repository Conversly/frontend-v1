import { logout as apiLogout } from "@/lib/api/auth";
import { User } from "@/types/user";
import { QUERY_KEY } from "@/utils/query-key";
import { LOCAL_STORAGE_KEY } from "@/utils/local-storage-key";
import { QueryClient } from "@tanstack/react-query";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  isUserFetching: boolean;
  setUser: (user: User) => void;
  setIsUserFetching: (isFetching: boolean) => void;
  logout: (queryClient?: QueryClient) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      userSettings: null,
      isUserFetching: false,
      setUser: (user) => set({ user }),
      setIsUserFetching: (isUserFetching) => set({ isUserFetching }),
      logout: async (queryClient?: QueryClient) => {
        if (queryClient) {
          queryClient.removeQueries({
            queryKey: [QUERY_KEY.LOGGED_IN_USER],
          });
        }

        // Clear localStorage flag
        localStorage.setItem(LOCAL_STORAGE_KEY.IS_LOGGED_IN, "false");

        set({
          user: null,
          isUserFetching: false,
        });
        await apiLogout();
        window.location.reload();
      },
    }),
    {
      name: LOCAL_STORAGE_KEY.AUTH,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
