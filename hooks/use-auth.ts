import { googleOauth } from "@/lib/api/auth";
import { useNewUserModal } from "@/store/new-user-modal";
import { GoogleOauthResponse } from "@/types/auth";
import { LOCAL_STORAGE_KEY } from "@/utils/local-storage-key";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface AuthConfig {
  redirectTo?: string;
  onSuccess?: () => Promise<void> | void;
  onError?: (error: string) => void;
}

interface UseAuthReturn {
  authenticateWithGoogle: (
    idToken: string,
  ) => Promise<void>;
  isAuthenticated: () => boolean;
}

export const useAuth = (config: AuthConfig = {}): UseAuthReturn => {
  const router = useRouter();
  const { showModal } = useNewUserModal();

  const { redirectTo = "/radar", onSuccess, onError } = config;

  const handleAuthSuccess = useCallback(
    async (message: string, response: GoogleOauthResponse) => {
      try {
        const { isNewUser } = response;

        localStorage.setItem(LOCAL_STORAGE_KEY.IS_LOGGED_IN, "true");

        if (onSuccess) {
          await onSuccess();
        }

        if (isNewUser) {
          showModal();
        }

        router.push(redirectTo);

        // Note: Toast functionality removed as react-hot-toast is not installed
        console.log(message);
      } catch (error) {
        console.error("Auth success handler error:", error);
        throw new Error("Authentication successful but navigation failed");
      }
    },
    [router, redirectTo, onSuccess, showModal],
  );

  const authenticateWithGoogle = useCallback(
    async (idToken: string): Promise<void> => {
      try {
        const response = await googleOauth(null, idToken);

        if (!response.success || !response.data) {
          throw new Error(response.message || "Google authentication failed");
        }
        
        await handleAuthSuccess(
          "Successfully logged in with Google!",
          response.data,
        );
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || "Failed to authenticate with Google";

        if (onError) onError(errorMessage);
        console.error(errorMessage);
        throw error;
      }
    },
    [handleAuthSuccess, onError],
  );

  const isAuthenticated = useCallback((): boolean => {
    return localStorage.getItem(LOCAL_STORAGE_KEY.IS_LOGGED_IN) === "true";
  }, []);

  return {
    authenticateWithGoogle,
    isAuthenticated,
  };
};
