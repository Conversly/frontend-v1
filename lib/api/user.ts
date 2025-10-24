import { User  } from "@/types/user";
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