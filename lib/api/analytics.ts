import { fetch } from "@/lib/api/axios";
import { API } from "@/lib/api/config";
import { GetAnalyticsResponse, AnalyticsData } from "@/types/analytics";

export const getAnalytics = async (chatbotId: string): Promise<AnalyticsData> => {
  try {
    const endpoint = API.ENDPOINTS.ANALYTICS.GET_ANALYTICS().replace(
      ":chatbotId",
      chatbotId
    );
    const res = await fetch(API.ENDPOINTS.ANALYTICS.BASE_URL() + endpoint, {
      method: "GET",
    }).then((res) => res.data) as GetAnalyticsResponse;

    if (!res.success) {
      throw new Error("Failed to fetch analytics");
    }

    return res.data;
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message || "Failed to fetch analytics");
  }
};

