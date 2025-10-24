import { fetch } from "@/lib/api/axios";
import { API, ApiResponse } from "@/lib/api/config";
import {
  ProcessRequest,
  DatasourceResponse,
  AddCitationRequest,
  AddCitationResponse,
  FetchEmbeddingsResponse,
  DeleteKnowledgeResponse,
  FetchDataSourcesResponse,
} from "@/types/datasource";

export const processDataSource = async (
  request: ProcessRequest
): Promise<ApiResponse<DatasourceResponse>> => {
  try {
    const res = await fetch(
      API.ENDPOINTS.DATA_SOURCE.BASE_URL() + API.ENDPOINTS.DATA_SOURCE.PROCESS(),
      {
        method: "POST",
        data: request,
      },
    ).then((res) => res.data) as ApiResponse<DatasourceResponse>;

    if (!res.success) {
      throw new Error(res.message);
    }

    return res;
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message || "Failed to process data source");
  }
};

export const addCitation = async (
  request: AddCitationRequest
): Promise<ApiResponse<AddCitationResponse["data"]>> => {
  try {
    const res = await fetch(
      API.ENDPOINTS.DATA_SOURCE.BASE_URL() + API.ENDPOINTS.DATA_SOURCE.ADD_CITATION(),
      {
        method: "PUT",
        data: request,
      },
    ).then((res) => res.data) as ApiResponse<AddCitationResponse["data"]>;

    if (!res.success) {
      throw new Error(res.message);
    }

    return res;
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message || "Failed to add citation");
  }
};

export const fetchEmbeddings = async (
  dataSourceId: string
): Promise<FetchEmbeddingsResponse["data"]> => {
  try {
    const endpoint = API.ENDPOINTS.DATA_SOURCE.EMBEDDINGS().replace(
      ":dataSourceId",
      dataSourceId
    );
    const res = await fetch(API.ENDPOINTS.DATA_SOURCE.BASE_URL() + endpoint, {
      method: "GET",
    }).then((res) => res.data) as FetchEmbeddingsResponse;

    if (!res.success) {
      throw new Error("Failed to fetch embeddings");
    }

    return res.data;
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message || "Failed to fetch embeddings");
  }
};

export const deleteKnowledge = async (
  chatbotId: number,
  datasourceId: number
): Promise<DeleteKnowledgeResponse> => {
  try {
    const res = await fetch(
      API.ENDPOINTS.DATA_SOURCE.BASE_URL() + API.ENDPOINTS.DATA_SOURCE.DELETE_KNOWLEDGE(),
      {
        method: "DELETE",
        data: { chatbotId, datasourceId },
      },
    ).then((res) => res.data) as DeleteKnowledgeResponse;

    if (!res.success) {
      throw new Error(res.message);
    }

    return res;
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message || "Failed to delete knowledge");
  }
};

export const fetchDataSources = async (
  chatbotId: string
): Promise<FetchDataSourcesResponse["data"]> => {
  try {
    const endpoint = API.ENDPOINTS.DATA_SOURCE.GET_DATA_SOURCES().replace(
      ":chatbotId",
      chatbotId
    );
    const res = await fetch(API.ENDPOINTS.DATA_SOURCE.BASE_URL() + endpoint, {
      method: "GET",
    }).then((res) => res.data) as FetchDataSourcesResponse;

    if (!res.success) {
      throw new Error("Failed to fetch data sources");
    }

    return res.data;
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message || "Failed to fetch data sources");
  }
};