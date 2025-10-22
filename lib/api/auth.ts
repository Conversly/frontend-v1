import { fetch } from "@/lib/api/axios";
import { API, ApiResponse } from "@/lib/api/config";
import { GoogleOauthResponse } from "@/types/auth";
import { redirect } from "next/navigation";

export const logout = async () => {
  const res = await fetch(
    API.ENDPOINTS.AUTH.BASE_URL() + API.ENDPOINTS.AUTH.LOGOUT(),
    {
      method: "POST",
    },
  ).then((res) => res.data);

  if (!res.success) {
    throw new Error(res.message);
  }

  return redirect("/");
};

export const googleOauth = async (
  code: string | null,
  credential: string | null,
) => {
  const res = (await fetch(
    API.ENDPOINTS.AUTH.BASE_URL() + API.ENDPOINTS.AUTH.GOOGLE_OAUTH(),
    {
      method: "POST",
      data: {
        code,
        credential,
      },
    },
  ).then((res) => res.data)) as ApiResponse<GoogleOauthResponse>;

  if (!res.success) {
    throw new Error(res.message);
  }

  return res;
};



export const getSystemTime = async () => {
  const res = (await fetch(
    API.ENDPOINTS.AUTH.BASE_URL() + API.ENDPOINTS.AUTH.SYSTEM_TIME(),
  ).then((res) => res.data)) as ApiResponse<{ systemTime: number }>;

  if (!res.success) {
    throw new Error(res.message);
  }

  return res.data;
};
