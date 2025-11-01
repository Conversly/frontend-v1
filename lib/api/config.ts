export const API = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1",
  RESPONSE_BASE_URL: process.env.NEXT_PUBLIC_RESPONSE_API_BASE_URL || "/api/v1",
  ENDPOINTS: {
    USER: {
      BASE_URL: () => "/user",
      GET_USER: () => "/me",  // get
    },
    AUTH: {
      BASE_URL: () => "/auth",
      LOGOUT: () => "/logout",  // post
      GOOGLE_OAUTH: () => "/google-oauth",
      SYSTEM_TIME: () => "/system-time",
    },
    CHATBOT: {
      BASE_URL: () => "/chatbot",
      CREATE: () => "/create",  // post
      GENERATE_INSTRUCTIONS: () => "/generate-prompt",
      EDIT_INSTRUCTIONS: () => "/prompt",  // post
      GET_CHATBOT: () => "/:chatbotId",  // get
      GET_CHATBOTS: () => "/",  // get
    },
    DATA_SOURCE: {
      BASE_URL: () => "/datasource",  
      PROCESS: () => "/process",  // post
      ADD_CITATION: () => "/citation",   // put
      EMBEDDINGS: () => "/embeddings/:dataSourceId", // get
      DELETE_KNOWLEDGE: () => "/knowledge",  // delete
      GET_DATA_SOURCES: () => "/:chatbotId",  // get
    },
    ANALYTICS: {
      BASE_URL: () => "/analytics",
      GET_ANALYTICS: () => "/:chatbotId",
    },
    DEPLOY: {
      BASE_URL: () => "/deploy",
      WIDGET: () => "/widget/config",  // get
      UPDATE_CHATBOT_WIDGET: () => "/widget",  // post
      GET_DOMAIN_ALLOWLIST: () => "/widget/domains",  // get
      UPDATE_DOMAIN_ALLOWLIST: () => "/widget/domains",  // post
      GET_API_KEY: () => "/key",  // get
      CREATE_API_KEY: () => "/key",  // post
    },
    
    RESPONSE: {
      BASE_URL: () => "/response",
      FEEDBACK: () => "/feedback",  // post
    }
  },
};

export type ApiResponse<T, U = never> =
  | { success: false; message: string; data: U }
  | { success: true; message: string; data: T };
