export const API = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  ENDPOINTS: {
    USER: {
      BASE_URL: () => "/user",
      GET_USER: () => "/me",
    },
    WATCHLIST: {
      BASE_URL: () => "/watchlist",
      REMOVE: () => "/remove",
      ADD: () => "/add",
    },
    AUTH: {
      BASE_URL: () => "/auth",
      LOGOUT: () => "/logout",
      GOOGLE_OAUTH: () => "/google-oauth",
      SYSTEM_TIME: () => "/system-time",
    },

  },
};

export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || "wss://terminal.trench.ag/terminal";

export type ApiResponse<T, U = never> =
  | { success: false; message: string; data: U }
  | { success: true; message: string; data: T };
