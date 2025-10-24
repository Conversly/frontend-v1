'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Globe, FileText, Database, MessageSquare,
  Briefcase, Cloud, Mail, AlertCircle, Lock, Plus, X,
  Upload, ArrowRight
} from 'lucide-react';
import { QADialog } from '@/components/chatbot/QADialog';
import { toast } from "sonner";
import Papa from 'papaparse';
import { documentSchema, csvSchema, urlSchema } from '@/utils/datasource-validation';
import { motion } from "framer-motion";
import { useDataSourcesStore, usePendingSources, useIsLoading, useShowQADialog } from '@/store/chatbot/data-sources';
import { useProcessDataSource } from '@/services/datasource';
import { ProcessRequest, DocumentData } from '@/types/datasource';

const DATA_SOURCES = {
  productivity: [
    {
      id: 'document',
      name: 'Document',
      description: 'Upload document files containing text (PDF, Word, TXT, etc)',
      icon: FileText,
      available: true
    },
    {
      id: 'qa',
      name: 'Q&A',
      description: 'Finetune your bot by providing common questions and answers',
      icon: MessageSquare,
      available: true
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Answer questions from the content of Notion pages',
      icon: Database,
      available: false
    },
    {
      id: "CSV",
      name: "CSV",
      description: "Upload the QnA in bult in form of specially formatted csv file",
      icon: FileText,
      available: true
    }
  ],
  web: [
    {
      id: 'url',
      name: 'Single URL',
      description: 'Answer from the content from a single webpage',
      icon: Globe,
      available: true
    },
    {
      id: 'sitemap',
      name: 'Sitemap',
      description: 'Answer from all content on a website referenced by its XML sitemap',
      icon: Database,
      available: false
    }
  ],
  cloud: [
    {
      id: 'gdrive',
      name: 'Google Drive',
      description: 'Answer questions from documents in Google Drive',
      icon: Cloud,
      available: false
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      description: 'Answer questions from documents in Dropbox',
      icon: Cloud,
      available: false
    }
  ],
  business: [
    {
      id: 'zendesk',
      name: 'Zendesk',
      description: 'Answer questions from Zendesk Help Center articles',
      icon: Briefcase,
      available: false
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Answer questions from your Slack workspace',
      icon: Mail,
      available: false
    }
  ]
};

const dataSources = [
  {
    title: "Website Import",
    description: "Train your assistant on your website content",
    icon: Globe,
    type: "website",
    features: ["Automatic crawling", "Regular updates", "Structured data"],
    gradient: "from-pink-500/10 via-purple-500/10 to-blue-500/10",
  },
  {
    title: "Document Upload",
    description: "Upload PDFs, DOCs, and other files",
    icon: Upload,
    type: "document",
    features: ["Multiple formats", "Batch upload", "Text extraction"],
    gradient: "from-blue-500/10 via-purple-500/10 to-pink-500/10",
  },
  {
    title: "API Integration",
    description: "Connect to external data sources",
    icon: Database,
    type: "api",
    features: ["Real-time sync", "Custom endpoints", "Secure access"],
    gradient: "from-purple-500/10 via-pink-500/10 to-blue-500/10",
  },
]

export function DataSourcesTab({ chatbotId }: { chatbotId: string }) {
  // Zustand store
  const { 
    addPendingSource, 
    removePendingSource, 
    clearPendingSources,
    uploadFile,
    setIsLoading,
    setShowQADialog,
  } = useDataSourcesStore();
  
  const pendingSources = usePendingSources();
  const isLoading = useIsLoading();
  const showQADialog = useShowQADialog();
  const { mutateAsync: processAllSources } = useProcessDataSource(chatbotId);

  const handleAddFile = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    // Validate file name and size
    const parsed = documentSchema.safeParse({ name: file.name, size: file.size });
    if (!parsed.success) {
      toast.error('Invalid document file', {
        description: parsed.error.issues[0].message,
      });
      return;
    }

    try {
      // Upload file to Vercel Blob
      const blobData = await uploadFile(file);
      
      // Add to pending sources with blob data
      addPendingSource({ 
        type: 'Document', 
        name: file.name, 
        content: file,
        blobData 
      });

      toast.success('File uploaded successfully');
      
      // Reset file input value
      const fileInput = document.getElementById(`file-upload-document`) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      toast.error('Failed to upload file', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };


  const handleAddCsv = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    // Step 1: Validate file type and size
    const parsed = csvSchema.safeParse({ name: file.name, size: file.size });
    if (!parsed.success) {
      toast.error('Invalid CSV file', {
        description: parsed.error.issues[0].message,
      });
      return;
    }

    // Step 2: Parse the CSV and validate columns
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const headers = results.meta.fields;

        // Ensure required columns are present
        if (!headers?.includes('Q') || !headers.includes('A') || !headers.includes("citation")) {
          toast.error('Invalid CSV format', {
            description: 'CSV file must contain "Q", "A", and "citation" columns.',
          });
          return;
        }

        try {
          // Upload CSV file to Vercel Blob
          const blobData = await uploadFile(file);
          
          // If valid, add to pending sources with blob data
          addPendingSource({ 
            type: 'CSV', 
            name: file.name, 
            content: file,
            blobData 
          });

          toast.success('CSV file uploaded successfully');

          const fileInput = document.getElementById('CSV-file-upload') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
        } catch (error) {
          toast.error('Failed to upload CSV file', {
            description: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },
      error: (error) => {
        toast.error('Error parsing CSV', {
          description: error.message,
        });
      },
    });
  };

  const handleAddURL = (url: string) => {
    if (url.trim()) {
      const parsed = urlSchema.safeParse(url);
      if (!parsed.success) {
        toast.error('Invalid URL', {
          description: parsed.error.issues[0].message,
        });
        return;
      }
      addPendingSource({
        type: 'Website',
        name: url.trim(),
      });
      toast.success('URL added successfully');
    }
  };

  const handleAddQA = (question: string, answer: string, citation: string) => {
    addPendingSource({
      type: 'QandA',
      name: question,
      content: answer,
      citation: citation
    });
    toast.success('Q&A pair added successfully');
  };

  const handleSaveAllSources = async () => {
    setIsLoading(true);
    try {
      // Extract website URLs
      const websiteUrls = pendingSources
        .filter(source => source.type === 'Website')
        .map(source => source.name);
  
      // Extract documents with blob data
      const documents: DocumentData[] = pendingSources
        .filter(source => source.type === 'Document' && source.blobData)
        .map(source => source.blobData as DocumentData);
  
      // Extract Q&A data
      const qandaData = pendingSources
        .filter(source => source.type === 'QandA')
        .map(source => ({
          question: source.name,
          answer: source.content as string,
          citations: source.citation
        }));
  
      // Extract CSV documents with blob data
      const csvDocuments: DocumentData[] = pendingSources
        .filter(source => source.type === 'CSV' && source.blobData)
        .map(source => source.blobData as DocumentData);
  
      // Combine all documents (regular + CSV)
      const allDocuments = [...documents, ...csvDocuments];

      // Build request
      const request: ProcessRequest = {
        chatbotId,
        websiteUrls: websiteUrls.length > 0 ? websiteUrls : undefined,
        documents: allDocuments.length > 0 ? allDocuments : undefined,
        qandaData: qandaData.length > 0 ? qandaData : undefined,
      };
  
      // Call the API via React Query mutation
      const result = await processAllSources(request);

      if (result.success) {
        toast.success('Data sources processing started', {
          description: 'Data sources will be available shortly',
        });
        
        // Reset sources
        clearPendingSources();
      } else {
        toast.error('Failed to process data sources', {
          description: result.message,
        });
      }

      setIsLoading(false);
    } catch (error) {
      if (error instanceof Error && error.message.includes('maximum number of data sources')) {
        toast.error('Maximum sources reached', {
          description: 'You have reached the maximum number of data sources allowed for this chatbot in the free tier.',
        });
      } else {
        toast.error('Failed to process data sources', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
        console.error('Error adding sources:', error);
      }
      setIsLoading(false);
    }
  };
  
  
  useEffect(() => {
    console.log('Component re-rendered');
  }, [pendingSources]);

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
        <h2 className="font-heading text-xl text-white mb-2">Knowledge Sources</h2>
        <p className="font-sans text-base text-gray-400">
          Enhance your AI assistant by adding different types of knowledge sources.
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="productivity" className="space-y-6">
        <TabsList className="bg-gray-900/60 p-1 rounded-xl">
          <TabsTrigger 
            value="productivity" 
            className="font-sans text-base data-[state=active]:bg-gradient-to-r from-pink-500 to-purple-500 data-[state=active]:text-white"
          >
            Productivity
          </TabsTrigger>
          <TabsTrigger 
            value="web"
            className="font-sans text-base data-[state=active]:bg-gradient-to-r from-pink-500 to-purple-500 data-[state=active]:text-white"
          >
            Web
          </TabsTrigger>
          <TabsTrigger 
            value="cloud"
            className="font-sans text-base data-[state=active]:bg-gradient-to-r from-pink-500 to-purple-500 data-[state=active]:text-white"
          >
            Cloud
          </TabsTrigger>
          <TabsTrigger 
            value="business"
            className="font-sans text-base data-[state=active]:bg-gradient-to-r from-pink-500 to-purple-500 data-[state=active]:text-white"
          >
            Business
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        {Object.entries(DATA_SOURCES).map(([category, sources]) => (
          <TabsContent key={category} value={category} className="mt-0">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sources.map((source) => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-purple-500/10 rounded-2xl" />
                  
                  <div className="relative bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6 h-full transition-all duration-300 hover:border-pink-500/20">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 mb-4">
                      <source.icon className="w-6 h-6 text-pink-500" />
                    </div>

                    <h3 className="font-heading text-lg font-semibold text-white mb-2">
                      {source.name}
                      {!source.available && (
                        <span className="ml-2 inline-flex items-center">
                          <Lock className="w-4 h-4 text-gray-400" />
                        </span>
                      )}
                    </h3>

                    <p className="font-sans text-base text-gray-400 mb-4">
                      {source.description}
                    </p>

                    {source.available ? (
                      source.id === 'url' ? (
                        <div>
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const input = e.currentTarget.querySelector('input');
                            if (input?.value) {
                              handleAddURL(input.value);
                              input.value = '';
                            }
                          }}>
                            <input
                              type="text" 
                              placeholder="Enter URL"
                              className="w-full mb-2 p-2 rounded-xl border border-gray-600 bg-transparent text-white"
                            />
                            <Button
                              type="submit"
                              variant="outline"
                              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 rounded-xl group"
                            >
                              <Globe className="w-4 h-4 mr-2" />
                              Add URL
                            </Button>
                          </form>
                          <div className="flex items-start gap-2 mt-2 text-xs text-muted-foreground">
                            <AlertCircle className="w-3 h-3 mt-0.5" />
                            <span>Enter a valid webpage URL to extract content</span>
                          </div>
                        </div>
                      ):
                      source.id === 'document' ? (
                        <div>
                          <Button
                            variant="outline"
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 rounded-xl group"
                            onClick={() => document.getElementById(`file-upload-${source.id}`)?.click()}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Upload Document
                            <input
                              id={`file-upload-${source.id}`}
                              type="file"
                              className="hidden"
                              accept=".pdf,.docx,.txt,.md"
                              onChange={(e) => {
                                if (e.target.files?.length) {
                                  handleAddFile(e.target.files);
                                }
                              }}
                            />
                          </Button>
                          <div className="flex items-start gap-2 mt-2 text-xs text-muted-foreground">
                            <AlertCircle className="w-3 h-3 mt-0.5" />
                            <span>Supports PDF, Word, TXT, MD. Max 10MB</span>
                          </div>
                        </div>
                      ) : source.id === 'CSV' ? (
                        <div>
                          <Button
                            variant="outline" 
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 rounded-xl group"
                            onClick={() => document.getElementById('CSV-file-upload')?.click()}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Upload CSV
                            <input
                              id="CSV-file-upload"
                              type="file"
                              className="hidden"
                              accept=".csv"
                              onChange={(e) => {
                                if (e.target.files?.length) {
                                  handleAddCsv(e.target.files);
                                }
                              }}
                            />
                          </Button>
                          <div className="flex items-start gap-2 mt-2 text-xs text-muted-foreground">
                            <AlertCircle className="w-3 h-3 mt-0.5" />
                            <span>Supports .csv files with 3 columns: Q, A ,citation</span>
                          </div>
                        </div>
                      ) : source.id === 'qa' ? (
                        <Button
                          onClick={() => setShowQADialog(true)}
                          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 rounded-xl group"
                        >
                          Add Q&A Pairs
                          <Plus className="ml-2 w-4 h-4 group-hover:rotate-90 transition-transform" />
                        </Button>
                      ) : (
                        <Button 
                          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 rounded-xl group"
                        >
                          Connect
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      )
                    ) : (
                      <Button 
                        disabled 
                        className="w-full bg-gray-800 text-gray-400 cursor-not-allowed rounded-xl"
                      >
                        Coming Soon
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Pending Sources */}
      {pendingSources.length > 0 && (
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
          <h3 className="font-heading text-lg text-white mb-4">Pending Sources</h3>
          <div className="space-y-3">
            {pendingSources.map((source) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between bg-gray-800/50 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-pink-500" />
                  <span className="font-sans text-base text-white">{source.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePendingSource(source.id)}
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
            
            <Button
              onClick={handleSaveAllSources}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 rounded-xl group mt-4"
            >
              {isLoading ? "Processing..." : "Process All Sources"}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      )}

      {/* QA Dialog */}
      <QADialog
        isOpen={showQADialog}
        onClose={() => setShowQADialog(false)}
        onSubmit={handleAddQA}
      />
    </div>
  );
} 