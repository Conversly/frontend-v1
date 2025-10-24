import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEY } from "@/utils/query-key";
import {
  fetchDataSources,
  processDataSource,
  deleteKnowledge,
  fetchEmbeddings,
  addCitation,
} from "@/lib/api/datasource";
import type { ProcessRequest, DataSourceItem } from "@/types/datasource";

export const useDataSourcesQuery = (chatbotId: string) =>
  useQuery<DataSourceItem[]>({
    queryKey: [QUERY_KEY.DATASOURCES, chatbotId],
    queryFn: () => fetchDataSources(chatbotId),
    staleTime: 60_000,
  });

export const useProcessDataSource = (chatbotId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [QUERY_KEY.DATASOURCES_PROCESS, chatbotId],
    mutationFn: (input: ProcessRequest) => processDataSource(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY.DATASOURCES, chatbotId] });
    },
  });
};

export const useDeleteKnowledge = (chatbotId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [QUERY_KEY.DATASOURCES_DELETE, chatbotId],
    mutationFn: (vars: { chatbotId: number; datasourceId: number }) =>
      deleteKnowledge(vars.chatbotId, vars.datasourceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY.DATASOURCES, chatbotId] });
    },
  });
};

export const useEmbeddingsQuery = (dataSourceId: string) =>
  useQuery({
    queryKey: [QUERY_KEY.DATASOURCES_EMBEDDINGS, dataSourceId],
    queryFn: () => fetchEmbeddings(dataSourceId),
    staleTime: 60_000,
    enabled: !!dataSourceId,
  });

export const useAddCitation = (chatbotId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addCitation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY.DATASOURCES, chatbotId] });
    },
  });
};