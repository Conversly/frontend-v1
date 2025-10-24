"use client";

import { useState, useEffect } from 'react';
import { Globe, File, MessageSquare, Trash2, Edit, Database, Plus, Eye, Quote } from 'lucide-react';
import { toast } from 'sonner';
import { CitationDialog } from '@/components/chatbot/citationDialog';
import { ContentDialog } from '@/components/chatbot/contentDialog';
import { Button } from '@/components/ui/button';

interface DataSource {
  id: number;
  type: string;
  name: string;
  sourceDetails: any;
  createdAt: Date;
}

interface GroupedSources {
  Website: DataSource[];
  Document: DataSource[];
  QandA: DataSource[];
  Other: DataSource[];
}

import { useAddCitation, useDataSourcesQuery, useDeleteKnowledge } from '@/services/datasource';
import { fetchEmbeddings } from '@/lib/api/datasource';

export function DataManagementTab({
  chatbotId,
}: {
  chatbotId: string;
}) {
  const [sources, setSources] = useState<GroupedSources>({
    Website: [],
    Document: [],
    QandA: [],
    Other: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // For citation dialog
  const [showCitationDialog, setShowCitationDialog] = useState(false);
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);

  // For content dialog
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [chunks, setChunks] = useState<{id : number, text : string, topic : string}[]>([]);

  const { data: fetchedSources, isLoading: listLoading } = useDataSourcesQuery(chatbotId);
  const { mutateAsync: removeKnowledge } = useDeleteKnowledge(chatbotId);
  const { mutateAsync: submitCitation } = useAddCitation(chatbotId);

  // Group data when fetchedSources changes
  useEffect(() => {
    if (!fetchedSources) return;
    setIsLoading(true);
    loadDataSources(fetchedSources);
  }, [fetchedSources]);

  const loadDataSources = (dataSources: any[]) => {
    try {
      const grouped = dataSources.reduce((acc, source) => {
        const category = ['Website', 'Document', 'QandA', 'CSV'].includes(source.type)
          ? source.type
          : 'Other';
        acc[category as keyof GroupedSources].push({
          ...source,
          createdAt: new Date(source.createdAt),
        });
        return acc;
      }, {
        Website: [],
        Document: [],
        QandA: [],
        Other: [],
      } as GroupedSources);

      setSources(grouped);
    } catch (error) {
      toast.error('Failed to load data sources');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete knowledge
  const handleDelete = async (source: DataSource) => {
    if (window.confirm(`Are you sure you want to delete this ${source.type.toLowerCase()}?`)) {
      try {
        await removeKnowledge({ chatbotId: Number(chatbotId), datasourceId: source.id });
        toast.success(`${source.type} deleted successfully`);
      } catch (error) {
        toast.error('Failed to delete data source');
      }
    }
  };

  // Open the citation dialog for a specific source
  const handleOpenCitationDialog = (source: DataSource) => {
    setSelectedSource(source);
    setShowCitationDialog(true);
  };

  // Callback for when citation is submitted from CitationDialog
  const handleAddCitation = async (citationText: string, dataSourceId: number) => {
    if (!selectedSource) return;
    try {
      await submitCitation({ chatbotId: Number(chatbotId), dataSourceId, citation: citationText });
      toast.success('Citation added successfully');
      setShowCitationDialog(false);
      setSelectedSource(null);
    } catch (error) {
      toast.error('Failed to add citation');
    }
  };

  // Show content from embeddings table
  const handleShowContent = async (source: DataSource) => {
    setSelectedSource(source);
    setIsContentLoading(true);
    setShowContentDialog(true);

    try {
      // fetch chunks from your embeddings table or relevant API
      const embeddingChunks = await fetchEmbeddings(source.id.toString());
      setChunks(embeddingChunks); // store in state
    } catch (error) {
      toast.error('Failed to load data source content');
    } finally {
      setIsContentLoading(false);
    }
  };

  // Return icon for each source type
  const getIcon = (type: string) => {
    switch (type) {
      case 'Website':
        return <Globe className="w-5 h-5" />;
      case 'Document':
        return <File className="w-5 h-5" />;
      case 'QandA':
        return <MessageSquare className="w-5 h-5" />;
      case 'CSV':
        return <File className="w-5 h-5" />;
      default:
        return <Database className="w-5 h-5" />;
    }
  };

  if (isLoading || listLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {Object.entries(sources).map(([type, items]) =>
        items.length > 0 && (
          <div key={type} className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10">
                {getIcon(type)}
              </div>
              <div>
                <h3 className="font-heading text-xl text-white">{type}s</h3>
                <p className="text-sm text-gray-400">
                  {type === 'Website' && 'Content from crawled websites'}
                  {type === 'Document' && 'Uploaded document content'}
                  {type === 'QandA' && 'Custom Q&A pairs'}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {items.map((source: DataSource) => (
                <div key={source.id} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative border rounded-xl p-4 bg-gray-800/50">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium text-white">{source.name}</h4>
                        <p className="text-sm text-gray-400">
                          Added on {new Date(source.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleShowContent(source)}
                          variant="ghost"
                          size="icon"
                          className="hover:bg-gray-700/50"
                          title="View Content"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        <Button
                          onClick={() => handleOpenCitationDialog(source)}
                          variant="ghost"
                          size="icon"
                          className="hover:bg-gray-700/50"
                          title="Add Citation"
                        >
                          <Quote className="w-4 h-4" />
                        </Button>

                        <Button
                          onClick={() => handleDelete(source)}
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          title="Delete Source"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      <CitationDialog
        isOpen={showCitationDialog}
        onClose={() => {
          setShowCitationDialog(false);
          setSelectedSource(null);
        }}
        onSubmit={handleAddCitation}
        datasourceId={selectedSource?.id ?? 0}
      />

      <ContentDialog
        isOpen={showContentDialog}
        onClose={() => {
          setShowContentDialog(false);
          setChunks([]);
          setSelectedSource(null);
        }}
        title={`Content from: ${selectedSource?.name ?? ''}`}
        chunks={chunks.map(chunk => chunk.text)}
        isLoading={isContentLoading}
        isEditable={true}
        onSave={async (editedChunks) => {
          // You'll implement the save functionality
          console.log('Saving edited chunks:', editedChunks);
        }}
      />
    </div>
  );
}
