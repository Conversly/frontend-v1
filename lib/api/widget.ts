import { API } from "@/lib/api/config";
import type { ApiResponse } from "@/lib/api/config";
import type {
  ChatbotResponseRequest,
  ChatbotResponseData,
  FeedbackRequest,
  FeedbackResponse,
  ChatMessage,
} from "@/types/response";
import axios, { type InternalAxiosRequestConfig } from "axios";

// Create a separate axios instance for response API
export const responseFetch = axios.create({
  baseURL: API.RESPONSE_BASE_URL,
  withCredentials: true,
});

responseFetch.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  },
);

/**
 * Send a chat query to the chatbot and get a response
 * @param messages - Array of chat messages (conversation history)
 * @param user - User information including uniqueClientId and converslyWebId (API_KEY)
 * @param mode - Response mode (default: "default")
 * @param metadata - Optional metadata like originUrl
 * @param testing - If true, returns dummy response instead of calling API
 * @returns ChatbotResponseData with response text and citations
 */
export const getChatbotResponse = async (
  messages: ChatMessage[],
  user: ChatbotResponseRequest["user"],
  mode: string = "default",
  metadata?: ChatbotResponseRequest["metadata"],
  testing: boolean = true,
): Promise<ChatbotResponseData> => {
  // Return dummy response if testing mode is enabled
  if (testing) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const dummyResponses = [
          {
            responseId: `resp-${Date.now()}`,
            response: `Great question! Here's what I can tell you:\n\n- **Point 1**: This is a dummy response with markdown support\n- **Point 2**: You can format text with *italics* and **bold**\n- **Point 3**: Backend integration will be added later\n\n\`\`\`javascript\n// Even code blocks work!\nconst demo = "awesome";\n\`\`\``,
            citations: [
              "https://reactjs.org/docs/getting-started.html",
              "https://www.typescriptlang.org/docs/",
            ],
            success: true,
          },
          {
            responseId: `resp-${Date.now()}`,
            response: `I'd be happy to help with that! 😊\n\nHere are some key features:\n\n1. **Markdown rendering** - Full support for rich text\n2. **Code highlighting** - Syntax highlighting for code blocks\n3. **Animations** - Smooth message animations\n4. **Feedback system** - Like/dislike buttons\n\nIs there anything specific you'd like to know?`,
            citations: [
              "https://ui.shadcn.com/docs/components",
              "https://tailwindcss.com/docs",
              "https://www.framer.com/motion/",
              "https://github.com/remarkjs/react-markdown",
            ],
            success: true,
          },
          {
            responseId: `resp-${Date.now()}`,
            response: `Let me explain that:\n\n> This is a blockquote - perfect for highlighting important information!\n\n### Key Points:\n\n- Easy to customize\n- Built with React + TypeScript\n- Uses ShadCN UI components\n\n**Try the starter questions below!** 👇`,
            citations: [
              "https://vitejs.dev/guide/",
              "https://react.dev/",
            ],
            success: true,
          },
        ];
        
        const response = dummyResponses[Math.floor(Math.random() * dummyResponses.length)];
        resolve(response);
      }, 1500); // Simulate network delay
    });
  }

  // Real API call
  const requestBody: ChatbotResponseRequest = {
    query: JSON.stringify(messages),
    mode,
    user,
    metadata,
  };

  const res = await responseFetch(API.ENDPOINTS.RESPONSE.BASE_URL(), {
    method: "POST",
    data: requestBody,
  }).then((res: any) => res.data as ChatbotResponseData);

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
 * @param testing - If true, returns dummy success response instead of calling API
 * @returns FeedbackResponse with success status
 */
export const submitFeedback = async (
  responseId: string,
  feedback: "positive" | "negative",
  comment?: string,
  testing: boolean = false,
): Promise<FeedbackResponse> => {
  // Return dummy response if testing mode is enabled
  if (testing) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: "Feedback submitted successfully (testing mode)",
        });
      }, 500);
    });
  }

  // Real API call
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
  ).then((res: any) => res.data as ApiResponse<FeedbackResponse>);

  if (!res.success) {
    throw new Error(res.message || "Failed to submit feedback");
  }

  return res.data;
};
