

import { API, ApiResponse } from "@/lib/api/config";
import {
  ChatbotResponseRequest,
  ChatbotResponseData,
  FeedbackRequest,
  FeedbackResponse,
  ChatMessage,
} from "@/types/response";
import axios from "axios";

// Create a separate axios instance for response API
export const responseFetch = axios.create({
  baseURL: API.RESPONSE_BASE_URL,
  withCredentials: true,
});

responseFetch.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Send a chat query to the chatbot and get a response
 * @param messages - Array of chat messages (conversation history)
 * @param user - User information including unique_client_id and conversly_web_id (API_KEY)
 * @param mode - Response mode (default: "default")
 * @param metadata - Optional metadata like origin_url
 * @returns ChatbotResponseData with response text and citations
 */
export const getChatbotResponse = async (
  messages: ChatMessage[],
  user: ChatbotResponseRequest["user"],
  mode: string = "default",
  metadata?: ChatbotResponseRequest["metadata"],
): Promise<ChatbotResponseData> => {
  const requestBody: ChatbotResponseRequest = {
    query: JSON.stringify(messages),
    mode,
    user,
    metadata,
  };

  const res = await responseFetch(API.ENDPOINTS.RESPONSE.BASE_URL(), {
    method: "POST",
    data: requestBody,
  }).then((res) => res.data as ChatbotResponseData);

  if (!res.success) {
    throw new Error("Failed to get chatbot response");
  }

  return res;
};

/**
 * Submit feedback for a chatbot response
 * @param responseId - The responseId from the original chatbot response
 * @param feedback - Either "positive" or "negative"
 * @param comment - Optional comment about the feedback
 * @returns FeedbackResponse with success status
 */
export const submitFeedback = async (
  responseId: string,
  feedback: "positive" | "negative",
  comment?: string,
): Promise<FeedbackResponse> => {
  const requestBody: FeedbackRequest = {
    responseId: responseId,
    feedback,
    comment,
  };

  const res = await responseFetch(
    API.ENDPOINTS.RESPONSE.BASE_URL() + API.ENDPOINTS.RESPONSE.FEEDBACK(),
    {
      method: "POST",
      data: requestBody,
    },
  ).then((res) => res.data as ApiResponse<FeedbackResponse>);

  if (!res.success) {
    throw new Error(res.message || "Failed to submit feedback");
  }

  return res.data;
};

