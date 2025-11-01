"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Copy,
  Code,
  Globe,
  Plus,
  Key,
} from 'lucide-react';
import { toast } from 'sonner';
import { Highlight, themes } from 'prism-react-renderer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SectionHeader } from './SectionHeader';
import type { UIConfigInput } from '@/types/customization';

interface IntegrationTabProps {
  config: UIConfigInput;
  chatbotId: string;
  systemPrompt: string;
  // Domain management
  domains: Array<{ id: string | number; domain: string; createdAt?: string | Date | null }>;
  isLoadingDomains: boolean;
  isSavingDomain: boolean;
  onAddDomain: (domain: string) => Promise<void>;
  // API Key management
  apiKey: string | null;
  isLoadingApiKey: boolean;
  isCreatingApiKey: boolean;
  onGenerateApiKey: () => Promise<void>;
}

export function IntegrationTab({
  config,
  chatbotId,
  systemPrompt,
  domains,
  isLoadingDomains,
  isSavingDomain,
  onAddDomain,
  apiKey,
  isLoadingApiKey,
  isCreatingApiKey,
  onGenerateApiKey,
}: IntegrationTabProps) {
  const [newDomainInput, setNewDomainInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleAddDomainToAllowlist = async () => {
    if (!newDomainInput.trim()) {
      toast.error('Please enter a domain');
      return;
    }
    try {
      await onAddDomain(newDomainInput.trim());
      setNewDomainInput('');
      toast.success('Domain added successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add domain');
    }
  };

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      toast.success('API key copied to clipboard');
    }
  };

  const copyToClipboard = (text: string, type: 'embed' | 'iframe') => {
    navigator.clipboard.writeText(text);
    toast.success(`${type === 'embed' ? 'Widget' : 'iframe'} code copied to clipboard`);
  };

  const renderCode = (code: string, language: string) => (
    <Highlight theme={themes.nightOwl} code={code.trim()} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`p-3 rounded-lg text-xs overflow-x-auto whitespace-pre ${className}`}
          style={{ ...style, maxWidth: '100%' }}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })} className="whitespace-pre">
              <span className="select-none opacity-50 mr-4">{i + 1}</span>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );

  const embedCode = `<script
    src="https://tuveroqvhzgyatcq.public.blob.vercel-storage.com/loader.min.js"
    data-chatbot-id=${chatbotId}>
  </script>`
;

  const iframeCode = `<iframe
  COMING SOON!!
></iframe>`;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* API Key Section */}
      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
        <SectionHeader 
          title="API Key" 
          description="Manage your API key for chatbot integration"
          icon={Key}
        />
        
        <div className="space-y-4">
          {isLoadingApiKey ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          ) : apiKey ? (
            <div className="space-y-4">
              <div className="p-4 border border-green-500/20 rounded-xl bg-green-500/5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading text-lg text-white">Your API Key</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyApiKey}
                      className="border-gray-700 text-white hover:bg-gray-700/50"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 rounded-lg bg-gray-800/50 text-green-400 font-mono text-sm break-all">
                      {showApiKey ? apiKey : '•'.repeat(32)}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-gray-400 hover:text-white"
                    >
                      {showApiKey ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Keep your API key secure and don't share it publicly.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 border border-pink-500/20 rounded-xl bg-pink-500/5">
                <div className="space-y-3">
                  <h4 className="font-heading text-lg text-white">No API Key Yet</h4>
                  <p className="font-sans text-sm text-gray-400">
                    Generate an API key to integrate your chatbot with external applications.
                  </p>
                  <Button
                    onClick={onGenerateApiKey}
                    disabled={isCreatingApiKey}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90"
                  >
                    {isCreatingApiKey ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 mr-2" />
                        Generate API Key
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Integration Code */}
      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
        <SectionHeader 
          title="Widget Code" 
          description="Add this code to your website to embed the chatbot"
          icon={Code}
        />
        
        <Tabs defaultValue="script" className="space-y-4">
          <TabsList className="bg-gray-800/50 p-1 rounded-xl">
            <TabsTrigger value="script" className="font-sans text-base">
              Script Tag
            </TabsTrigger>
            <TabsTrigger value="iframe" className="font-sans text-base">
              iframe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="script">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="absolute right-2 top-2 border-gray-700 text-white hover:bg-gray-700/50"
                onClick={() => copyToClipboard(embedCode, 'embed')}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              {renderCode(embedCode, 'html')}
            </div>
          </TabsContent>

          <TabsContent value="iframe">
            <div className="relative">
              {renderCode(iframeCode, 'html')}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Allowed Domains */}
      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
        <SectionHeader 
          title="Allowed Domains" 
          description="Control which websites can embed your chatbot"
          icon={Globe}
        />
        <div className="space-y-4">
          {isLoadingDomains ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          ) : (
            <>
              {domains.length > 0 ? (
                <div className="space-y-3">
                  {domains.map((domainInfo) => (
                    <div 
                      key={domainInfo.id} 
                      className="flex items-center justify-between p-3 border border-gray-700/50 rounded-lg bg-gray-800/30"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="font-mono text-sm text-white">{domainInfo.domain}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {domainInfo.createdAt 
                          ? new Date(domainInfo.createdAt).toLocaleDateString()
                          : 'N/A'
                        }
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 border border-dashed border-gray-700 rounded-lg">
                  <Globe className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No domains added yet</p>
                </div>
              )}
              
              <div className="flex items-center gap-3 mt-4">
                <Input
                  value={newDomainInput}
                  onChange={(e) => setNewDomainInput(e.target.value)}
                  placeholder="example.com"
                  className="bg-gray-800/50 border-gray-700/50 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddDomainToAllowlist();
                    }
                  }}
                />
                <Button
                  onClick={handleAddDomainToAllowlist}
                  disabled={isSavingDomain || !newDomainInput.trim()}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90"
                >
                  {isSavingDomain ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </>
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                Enter domain without protocol (e.g., example.com not https://example.com)
              </p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
