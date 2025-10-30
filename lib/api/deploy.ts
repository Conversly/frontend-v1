import { fetch } from '@/lib/api/axios';
import { API, ApiResponse } from '@/lib/api/config';
import { ChatbotCustomizationPartial, ChatbotCustomizationPayload } from '@/types/customization';

export type GetWidgetResponse = ChatbotCustomizationPayload;

export interface UpdateWidgetRequest extends ChatbotCustomizationPartial {}
export type UpdateWidgetResponse = ChatbotCustomizationPayload;

export const getWidgetConfig = async (chatbotId: string | number): Promise<GetWidgetResponse> => {
	const endpoint = API.ENDPOINTS.DEPLOY.WIDGET().replace(':chatbotId', String(chatbotId));
	const res = await fetch(
		API.ENDPOINTS.DEPLOY.BASE_URL() + endpoint,
		{ method: 'GET' }
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
		{ method: 'POST', data: { chatbotId, partial } }
	).then((r) => r.data) as ApiResponse<UpdateWidgetResponse, Error>;

	if (!res.success) {
		throw new Error(res.message);
	}
	return res.data;
};

