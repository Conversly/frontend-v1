"use client";

import { getLoggedInUser, getUserSettings } from "@/lib/api/user";
import { useAuth } from "@/store/auth";
import { LOCAL_STORAGE_KEY } from "@/utils/local-storage-key";
import { QUERY_KEY } from "@/utils/query-key";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect } from "react";

interface AuthContextType {}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const { data: user, error } = useQuery({
    queryKey: [QUERY_KEY.LOGGED_IN_USER],
    queryFn: async () => {
      return await getLoggedInUser();
    },
    retry: false,
  });

  const { data: userSettings } = useQuery({
    queryKey: [QUERY_KEY.USER_SETTINGS],
    queryFn: async () => {
      return await getUserSettings();
    },
  });

  useEffect(() => {
    if (localStorage.getItem(LOCAL_STORAGE_KEY.IS_LOGGED_IN) !== "true") {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    if (pathname === "/") {
      router.replace("/radar");
    }
  }, [pathname, router]);

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  useEffect(() => {
    if (error) {
      console.error("Something went wrong. Please try again.");
    }
  }, [error]);

  return (
    <AuthContext.Provider value={{}}>
      <div>{children}</div>
    </AuthContext.Provider>
  );
}
