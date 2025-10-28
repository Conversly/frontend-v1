import { fetch } from "@/lib/api/axios";
import { API, ApiResponse } from "@/lib/api/config";
import {
  ChatbotResponse,
  CreateChatbotInput,
  InstructionResponse,
  GetChatbotsResponse,
  DeleteChatbotInput,
  DeleteChatbotResponse,
} from "@/types/chatbot";

export const createChatBot = async (chatbot: CreateChatbotInput) => {
  const res = await fetch(
    API.ENDPOINTS.CHATBOT.BASE_URL() + API.ENDPOINTS.CHATBOT.CREATE(),
    {
      method: "POST",
      data: chatbot,
    },
  ).then((res) => res.data) as ApiResponse<ChatbotResponse, Error>;

  if (!res.success) {
    throw new Error(res.message);
  }
  return res.data;
};

export const getInstructions = async (topic: string) => {
  const res = await fetch(
    API.ENDPOINTS.CHATBOT.BASE_URL() + API.ENDPOINTS.CHATBOT.GENERATE_INSTRUCTIONS(),
    {
      method: "GET",
      params: { topic },
    },
  ).then((res) => res.data) as ApiResponse<InstructionResponse, Error>;

  if (!res.success) {
    throw new Error(res.message);
  }

  return res.data;
};

export const updateInstructions = async (chatbotId: string, systemPrompt: string) => {
  const res = await fetch(
    API.ENDPOINTS.CHATBOT.BASE_URL() + API.ENDPOINTS.CHATBOT.EDIT_INSTRUCTIONS(),
    {
      method: "POST",
      data: { chatbotId, systemPrompt },
    },
  ).then((res) => res.data) as ApiResponse<InstructionResponse, Error>;

  if (!res.success) {
    throw new Error(res.message);
  }

  return res.data;
};

export const getChatbot = async (chatbotId: string): Promise<ChatbotResponse> => {
  const endpoint = API.ENDPOINTS.CHATBOT.GET_CHATBOT().replace(
    ":chatbotId",
    chatbotId
  );
  const res = await fetch(API.ENDPOINTS.CHATBOT.BASE_URL() + endpoint, {
    method: "GET",
  }).then((res) => res.data) as ApiResponse<ChatbotResponse, Error>;

  if (!res.success) {
    throw new Error(res.message);
  }

  return res.data;
};

export const getChatbots = async (): Promise<GetChatbotsResponse[]> => {
  const res = await fetch(
    API.ENDPOINTS.CHATBOT.BASE_URL() + API.ENDPOINTS.CHATBOT.GET_CHATBOTS(),
    {
      method: "GET",
    },
  ).then((res) => res.data) as ApiResponse<GetChatbotsResponse[], Error>;

  if (!res.success) {
    throw new Error(res.message);
  }

  return res.data;
};

export const deleteChatbot = async (
  input: DeleteChatbotInput
): Promise<DeleteChatbotResponse> => {
  try {
    const res = await fetch(
      API.ENDPOINTS.CHATBOT.BASE_URL() + API.ENDPOINTS.CHATBOT.GET_CHATBOT().replace(":chatbotId", input.id.toString()),
      {
        method: "DELETE",
      },
    ).then((res) => res.data) as DeleteChatbotResponse;

    if (!res.success) {
      throw new Error(res.message || "Failed to delete chatbot");
    }

    return res;
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message || "Failed to delete chatbot");
  }
};

