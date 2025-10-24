import {
  createChatBot,
  getInstructions,
  getChatbots,
  deleteChatbot,
} from "@/lib/api/chatbot";
import { QUERY_KEY } from "@/utils/query-key";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateChatbot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [QUERY_KEY.CREATE_CHATBOT],
    mutationFn: createChatBot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_CHATBOTS] });
    },
  });
};

export const useGetInstructions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [QUERY_KEY.GET_INSTRUCTIONS],
    mutationFn: getInstructions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_INSTRUCTIONS] });
    },
  });
};

export const useGetChatbots = () => {
  return useQuery({
    queryKey: [QUERY_KEY.GET_CHATBOTS],
    queryFn: getChatbots,
    staleTime: 60_000,
  });
};

export const useDeleteChatbot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [QUERY_KEY.DELETE_CHATBOT],
    mutationFn: deleteChatbot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_CHATBOTS] });
    },
  });
};