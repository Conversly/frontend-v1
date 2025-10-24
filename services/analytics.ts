import { useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "@/utils/query-key";
import { getAnalytics } from "@/lib/api/analytics";
import type { AnalyticsData } from "@/types/analytics";

export const useAnalyticsQuery = (chatbotId: string) =>
  useQuery<AnalyticsData>({
    queryKey: [QUERY_KEY.ANALYTICS, chatbotId],
    queryFn: () => getAnalytics(chatbotId),
    staleTime: 60_000,
  });