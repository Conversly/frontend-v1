export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export interface ResponseUserMetadata {
    [key: string]: unknown;
}

export interface ResponseUser {
    uniqueClientId: string; // Random ID to identify user
    converslyWebId: string; // API_KEY
    metadata?: ResponseUserMetadata;
}

export interface ResponseRequestMetadata {
    originUrl?: string;
    [key: string]: unknown;
}

export interface ChatbotResponseRequest {
    query: string; // JSON stringified array of ChatMessage
    mode: "default" | string;
    user: ResponseUser;
    metadata?: ResponseRequestMetadata;
}

export interface ChatbotResponseData {
    responseId?: string;
    response: string;
    citations: string[];
    success: boolean;
}

export interface FeedbackRequest {
    responseId: string;
    feedback: "positive" | "negative";
    comment?: string;
}

export interface FeedbackResponse {
    success: boolean;
    message: string;
}
