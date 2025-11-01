import { fetch } from '@/lib/api/axios';
import { API, ApiResponse } from '@/lib/api/config';
import { ChatbotCustomizationPartial, ChatbotCustomizationPayload } from '@/types/customization';

export type GetWidgetResponse = ChatbotCustomizationPayload;

export interface UpdateWidgetRequest extends ChatbotCustomizationPartial {}
export type UpdateWidgetResponse = ChatbotCustomizationPayload;

// Domain Types
export interface DomainInfo {
	id: number;
	domain: string;
	createdAt: Date | null;
}

export interface AllowedDomainsResponse {
	domains: DomainInfo[];
}

export interface AddDomainRequest {
	chatbotId: string | number;
	domain: string;
}

export interface AddDomainResponse {
	id: number;
	domain: string;
	createdAt: Date | null;
}

// API Key Types
export interface ApiKeyResponse {
	apiKey: string;
}

export interface ApiKeyGetResponse {
	apiKey: string | null;
}

export const getWidgetConfig = async (chatbotId: string | number): Promise<GetWidgetResponse> => {
	const endpoint = API.ENDPOINTS.DEPLOY.WIDGET();
	const res = await fetch(
		API.ENDPOINTS.DEPLOY.BASE_URL() + endpoint,
		{
			method: 'GET',
			params: {
				chatbotId: String(chatbotId)
			}
		}
	).then((r) => r.data) as ApiResponse<GetWidgetResponse, Error>;

	if (!res.success) {
		throw new Error(res.message);
	}
	return res.data;
};


export const updateWidgetConfig = async (
	chatbotId: string | number,
	partial: UpdateWidgetRequest
): Promise<UpdateWidgetResponse> => {
	const endpoint = API.ENDPOINTS.DEPLOY.UPDATE_CHATBOT_WIDGET();
	const res = await fetch(
		API.ENDPOINTS.DEPLOY.BASE_URL() + endpoint,
		{
			method: 'POST',
			data: {
				chatbotId: String(chatbotId),
				partial
			}
		}
	).then((r) => r.data) as ApiResponse<UpdateWidgetResponse, Error>;

	if (!res.success) {
		throw new Error(res.message);
	}
	return res.data;
};

// Domain Management Functions
export const getDomainAllowlist = async (chatbotId: string | number): Promise<AllowedDomainsResponse> => {
	const endpoint = API.ENDPOINTS.DEPLOY.GET_DOMAIN_ALLOWLIST();
	const res = await fetch(
		API.ENDPOINTS.DEPLOY.BASE_URL() + endpoint,
		{
			method: 'GET',
			params: {
				chatbotId: String(chatbotId)
			}
		}
	).then((r) => r.data) as ApiResponse<AllowedDomainsResponse, Error>;

	if (!res.success) {
		throw new Error(res.message);
	}
	return res.data;
};

export const addDomainToAllowlist = async (
	chatbotId: string | number,
	domain: string
): Promise<AddDomainResponse> => {
	const endpoint = API.ENDPOINTS.DEPLOY.UPDATE_DOMAIN_ALLOWLIST();
	const res = await fetch(
		API.ENDPOINTS.DEPLOY.BASE_URL() + endpoint,
		{
			method: 'POST',
			data: { domain },
			params: {
				chatbotId: String(chatbotId)
			}
		}
	).then((r) => r.data) as ApiResponse<AddDomainResponse, Error>;

	if (!res.success) {
		throw new Error(res.message);
	}
	return res.data;
};

// API Key Management Functions
export const getApiKey = async (chatbotId: string | number): Promise<ApiKeyGetResponse> => {
	const endpoint = API.ENDPOINTS.DEPLOY.GET_API_KEY();
	const res = await fetch(
		API.ENDPOINTS.DEPLOY.BASE_URL() + endpoint,
		{
			method: 'GET',
			params: {
				chatbotId: String(chatbotId)
			}
		}
	).then((r) => r.data) as ApiResponse<ApiKeyGetResponse, Error>;

	if (!res.success) {
		throw new Error(res.message);
	}
	return res.data;
};

export const createApiKey = async (chatbotId: string | number): Promise<ApiKeyResponse> => {
	const endpoint = API.ENDPOINTS.DEPLOY.CREATE_API_KEY();
	const res = await fetch(
		API.ENDPOINTS.DEPLOY.BASE_URL() + endpoint,
		{
			method: 'POST',
			params: {
				chatbotId: String(chatbotId)
			}
		}
	).then((r) => r.data) as ApiResponse<ApiKeyResponse, Error>;

	if (!res.success) {
		throw new Error(res.message);
	}
	return res.data;
};

