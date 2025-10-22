import { User, UserSetting, UserStrategyPreset } from "@/types/user";
import { fetch } from "./axios";
import { API, ApiResponse } from "./config";

export const getLoggedInUser = async () => {
  const res = (await fetch(
    API.ENDPOINTS.USER.BASE_URL() + API.ENDPOINTS.USER.GET_USER(),
  ).then((res) => res.data)) as ApiResponse<User>;

  if (!res.success) {
    throw new Error(res.message);
  }

  return res.data;
};

export const getUserSettings = async (chainSlug = "solana") => {
  const res = (await fetch(
    API.ENDPOINTS.USER.BASE_URL() + API.ENDPOINTS.USER.USER_SETTINGS(),
    {
      params: {
        chainSlug,
      },
    },
  ).then((res) => res.data)) as ApiResponse<Array<UserSetting>>;

  if (!res.success) {
    throw new Error(res.message);
  }

  return res.data;
};

export const updateUserSettings = async (settings: {
  settingId: string;
  priorityFeeValue: number;
  maxSlippagePercentage: number;
  mevProtection: boolean;
  bribe: number;
}) => {
  const res = (await fetch(
    API.ENDPOINTS.USER.BASE_URL() + API.ENDPOINTS.USER.USER_SETTINGS(),
    {
      params: {
        chainSlug: "solana",
      },
      method: "PATCH",
      data: settings,
    },
  ).then((res) => res.data)) as ApiResponse<{ error: string }>;

  if (!res.success) {
    throw new Error(res.message);
  }

  return res.data;
};

export const getUserStrategyPresets = async () => {
  const res = (await fetch(
    API.ENDPOINTS.USER.BASE_URL() + API.ENDPOINTS.USER.PRESETS(),
  ).then((res) => res.data)) as ApiResponse<Array<UserStrategyPreset>>;

  if (!res.success) {
    throw new Error(res.message);
  }

  return res.data;
};

export const createUserStrategyPreset = async (payload: {
  config: UserStrategyPreset["config"];
  name: string;
  description: string;
  emoji: string;
}) => {
  const res = (await fetch(
    API.ENDPOINTS.USER.BASE_URL() + API.ENDPOINTS.USER.PRESETS(),
    {
      method: "POST",
      data: payload,
    },
  ).then((res) => res.data)) as ApiResponse<UserStrategyPreset>;

  if (!res.success) {
    throw new Error(res.message);
  }

  return res.data;
};

export const updateUserStrategyPreset = async (payload: {
  presetId: string;
  config: UserStrategyPreset["config"];
  name: string | null;
  description: string | null;
  emoji: string | null;
}) => {
  const res = (await fetch(
    API.ENDPOINTS.USER.BASE_URL() + API.ENDPOINTS.USER.PRESETS(),
    {
      method: "PATCH",
      data: payload,
    },
  ).then((res) => res.data)) as ApiResponse<UserStrategyPreset>;

  if (!res.success) {
    throw new Error(res.message);
  }

  return res.data;
};

export const deleteUserStrategyPreset = async (presetId: string) => {
  const res = (await fetch(
    API.ENDPOINTS.USER.BASE_URL() + API.ENDPOINTS.USER.PRESETS(),
    {
      method: "DELETE",
      data: { presetId },
    },
  ).then((res) => res.data)) as ApiResponse<unknown>;

  if (!res.success) {
    throw new Error(res.message);
  }

  return res.data;
};
