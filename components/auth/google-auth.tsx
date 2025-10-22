"use client";

import { useAuth } from "@/hooks/use-auth";
import { useAuthLoadingStore, useIsAnyAuthLoading } from "@/store/auth-loading";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const POPUP_DIMENSIONS = { width: 500, height: 600 } as const;

interface GoogleTokenPayload {
  email: string;
  name: string;
  picture?: string;
  sub: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  nonce: string;
}

interface GoogleAuthProps {
  onLoadingChange?: (loading: boolean) => void;
}

export const GoogleAuth: React.FC<GoogleAuthProps> = ({
  onLoadingChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { authenticateWithGoogle } = useAuth();
  const { setAuthLoading, clearAuthLoading } = useAuthLoadingStore();
  const isAnyAuthLoading = useIsAnyAuthLoading();

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectURI = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI?.replace(
    /\/$/,
    "",
  );

  const updateLoadingState = useCallback(
    (loading: boolean) => {
      setIsLoading(loading);
      if (loading) {
        setAuthLoading("google");
      } else {
        clearAuthLoading();
      }
      onLoadingChange?.(loading);
    },
    [onLoadingChange, setAuthLoading, clearAuthLoading],
  );

  const buildOAuthUrl = useCallback(async (): Promise<string> => {
    // Generate a random nonce for security
    const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const authUrl = new URL(GOOGLE_AUTH_URL);
    authUrl.searchParams.set("client_id", googleClientId!);
    authUrl.searchParams.set("redirect_uri", redirectURI!);
    authUrl.searchParams.set("response_type", "id_token");
    authUrl.searchParams.set("scope", "openid email profile");
    authUrl.searchParams.set("prompt", "select_account");
    authUrl.searchParams.set("nonce", nonce);
    authUrl.searchParams.set("state", `provider=google&flow=popup`);

    console.log("OAuth Config:");
    console.log("- Client ID:", googleClientId);
    console.log("- Redirect URI:", redirectURI);
    console.log("- Full Auth URL:", authUrl.toString());

    return authUrl.toString();
  }, [googleClientId, redirectURI]);

  const handlePopupFlow = useCallback(
    async (authUrl: string, toastId: string): Promise<void> => {
      const { width, height } = POPUP_DIMENSIONS;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;

      const authWindow = window.open(
        "about:blank",
        "_blank",
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`,
      );

      if (!authWindow) {
        throw new Error(
          "Failed to open authentication window. Please allow popups.",
        );
      }

      authWindow.location.href = authUrl;

      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          try {
            const url = authWindow.location.href || "";
            console.log("Checking popup URL:", url);

            if (url.startsWith(window.location.origin)) {
              console.log("URL matches origin, checking for token...");
              const hashParams = new URLSearchParams(url.split("#")[1] || "");
              const idToken = hashParams.get("id_token");
              console.log("ID Token found:", idToken ? "YES" : "NO");

              if (idToken) {
                console.log("Calling backend with token...");
                authWindow.close();
                clearInterval(interval);
                authenticateWithGoogle(idToken)
                  .then(() => {
                    console.log("Backend authentication successful!");
                    toast.success("Authenticated", { id: toastId });
                    resolve();
                  })
                  .catch((error) => {
                    console.error("Backend authentication failed:", error);
                    reject(error);
                  });
              }
            }
          } catch (error) {
            console.log("Error accessing popup URL (CORS - normal):", error);
          }

          if (authWindow.closed) {
            console.log("Popup was closed by user");
            clearInterval(interval);
            updateLoadingState(false);
            toast.error("Authentication cancelled", { id: toastId });
            reject(new Error("Authentication cancelled"));
          }
        }, 500);
      });
    },
    [updateLoadingState, authenticateWithGoogle],
  );

  const handleLogin = useCallback(async (): Promise<void> => {
    if (!googleClientId || !redirectURI) {
      throw new Error("Google OAuth not properly configured");
    }

    updateLoadingState(true);
    const toastId = toast.loading("Authenticating...");

    try {
      const authUrl = await buildOAuthUrl();
      await handlePopupFlow(authUrl, toastId);
    } catch (error: any) {
      updateLoadingState(false);
      console.error("Google login initiation failed:", error);

      const errorMessage = error?.message || "Google authentication failed";
      toast.error(errorMessage, { id: toastId });
      throw error;
    }
  }, [
    googleClientId,
    redirectURI,
    buildOAuthUrl,
    handlePopupFlow,
    updateLoadingState,
  ]);

  return (
    <Button
      variant="outline"
      onClick={handleLogin}
      disabled={isAnyAuthLoading || !googleClientId}
      className="h-9 bg-[#181818] text-foreground-medium hover:text-foreground-light"
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[#7fac93]" />
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      {isLoading ? "Signing in..." : "Continue with Google"}
    </Button>
  );
};

export default GoogleAuth;
