"use client";

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bot,
  MessageCircle,
  HelpCircle,
  MessageSquare,
  BrainCircuit,
  Settings2,
  Code,
  Palette,
  Sparkles,
} from 'lucide-react';
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import { toast } from 'sonner';
import { ChatbotPreview } from '@/components/chatbot/ChatbotPreview';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useCustomizationDraft, useCustomizationStore } from '@/store/chatbot/customization';
import type { UIConfigInput } from '@/types/customization';
import { SectionHeader, ContentTab, AppearanceTab, AITab, IntegrationTab } from './customization';

interface CustomizationTabProps {
  chatbotId: string;
  systemPrompt: string;
}

export function CustomizationTab({ chatbotId, systemPrompt }: CustomizationTabProps) {
  // Icons array for widget customization
  const icons = [
    { id: 'chat', component: <MessageCircle className="w-6 h-6" /> },
    { id: 'bot', component: <Bot className="w-6 h-6" /> },
    { id: 'brain', component: <BrainCircuit className="w-6 h-6" /> },
    { id: 'help', component: <HelpCircle className="w-6 h-6" /> },
    { id: 'message', component: <MessageSquare className="w-6 h-6" /> },
  ];

  // Pull centralized draft + actions from the store
  const draft = useCustomizationDraft();
  const { 
    setDraftConfig, 
    loadCustomization, 
    saveCustomization, 
    resetDraftFromSaved, 
    isSaving, 
    isLoading,
    // Domain management
    domains,
    isLoadingDomains,
    isSavingDomain,
    loadDomains,
    addDomain,
    // API Key management
    apiKey,
    isLoadingApiKey,
    isCreatingApiKey,
    loadApiKey,
    generateApiKey,
  } = useCustomizationStore();

  // Local default to seed the store on first mount
  const defaultConfig: UIConfigInput = {
    DisplayName: 'Support Bot',
    InitialMessage: 'Hi! How can I help you today? 👋',
    starterQuestions: ['What is this about?', 'How do I get started?', '', ''],
    messagePlaceholder: 'Message...',
    keepShowingSuggested: false,
    collectFeedback: true,
    allowRegenerate: true,
    dismissibleNoticeText: '',
    footerText: '',
    autoShowInitial: true,
    autoShowDelaySec: 3,
    widgetEnabled: true,
    primaryColor: '#0e4b75',
    widgetBubbleColour: '#0e4b75',
    PrimaryIcon: '',
    widgeticon: 'chat',
    buttonAlignment: 'right',
    showButtonText: false,
    buttonText: 'Chat with us',
    appearance: 'light',
    widgetButtonText: 'Chat with us',
    chatWidth: '350px',
    chatHeight: '500px',
    displayStyle: 'corner',
    converslyWebId: '',
    uniqueClientId: '',
    testing: false,
  };

  // Load configuration on mount
  useEffect(() => {
    if (!draft) setDraftConfig(defaultConfig);
    loadCustomization(chatbotId).catch(() => {});
    loadDomains(chatbotId).catch(() => {});
    loadApiKey(chatbotId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatbotId]);

  const config: UIConfigInput = draft ?? defaultConfig;

  // Helper to update draft
  const updateConfig = (updates: Partial<UIConfigInput>) => {
    setDraftConfig({ ...config, ...updates });
  };

  // Icon upload handler
  const handleIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });
      if (!res.ok) throw new Error('Upload failed');
      const blob = await res.json();
      updateConfig({ PrimaryIcon: blob.url as string, widgeticon: '' });
      toast.success('Profile picture uploaded');
    } catch (e: any) {
      toast.error(e?.message || 'Upload failed');
    }
  };

  // Domain management handler
  const handleAddDomain = async (domain: string) => {
    await addDomain(chatbotId, domain);
  };

  // API key generation handler
  const handleGenerateApiKey = async () => {
    await generateApiKey(chatbotId);
  };

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl text-white mb-1">
              Chat widget
            </h2>
            <p className="font-sans text-base text-gray-400">
              Customize your chatbot's content, appearance and integrations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Widget status</span>
            <input
              type="checkbox"
              checked={config.widgetEnabled}
              onChange={(e) => updateConfig({ widgetEnabled: e.target.checked })}
              className="w-5 h-5 rounded border-gray-700 bg-gray-800/50"
            />
            <Button
              disabled={isSaving}
              onClick={async () => {
                try {
                  await saveCustomization(chatbotId);
                  toast.success('Customization saved');
                } catch (err: any) {
                  toast.error(err?.message || 'Failed to save');
                }
              }}
              className="ml-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90"
            >
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
            <Button
              variant="outline"
              onClick={() => resetDraftFromSaved()}
              className="ml-2 border-gray-700 text-white hover:bg-gray-700/50"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Two-column layout: settings left, preview right */}
        <div className="grid lg:grid-cols-[1fr_500px] gap-6 items-start">
          <div className="space-y-6">
            {/* Main Settings Tabs */}
            <Tabs defaultValue="content" className="space-y-6">
              <TabsList className="bg-gray-900/60 p-1 rounded-xl flex flex-wrap">
                <TabsTrigger 
                  value="content" 
                  className="font-sans text-base data-[state=active]:bg-gradient-to-r from-pink-500 to-purple-500 data-[state=active]:text-white"
                >
                  <Settings2 className="w-4 h-4 mr-2" />
                  Content
                </TabsTrigger>
                <TabsTrigger 
                  value="appearance" 
                  className="font-sans text-base data-[state=active]:bg-gradient-to-r from-pink-500 to-purple-500 data-[state=active]:text-white"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger 
                  value="ai" 
                  className="font-sans text-base data-[state=active]:bg-gradient-to-r from-pink-500 to-purple-500 data-[state=active]:text-white"
                >
                  <BrainCircuit className="w-4 h-4 mr-2" />
                  AI
                </TabsTrigger>
                <TabsTrigger 
                  value="integration" 
                  className="font-sans text-base data-[state=active]:bg-gradient-to-r from-pink-500 to-purple-500 data-[state=active]:text-white"
                >
                  <Code className="w-4 h-4 mr-2" />
                  Integration
                </TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content">
                <ContentTab config={config} updateConfig={updateConfig} />
              </TabsContent>

              {/* Appearance Tab */}
              <TabsContent value="appearance">
                <AppearanceTab 
                  config={config} 
                  updateConfig={updateConfig} 
                  icons={icons}
                  onIconUpload={handleIconUpload}
                />
              </TabsContent>

              {/* AI Tab */}
              <TabsContent value="ai">
                <AITab 
                  config={config} 
                  updateConfig={updateConfig} 
                  systemPrompt={systemPrompt}
                />
              </TabsContent>

              {/* Integration Tab */}
              <TabsContent value="integration">
                <IntegrationTab
                  config={config}
                  chatbotId={chatbotId}
                  systemPrompt={systemPrompt}
                  domains={domains}
                  isLoadingDomains={isLoadingDomains}
                  isSavingDomain={isSavingDomain}
                  onAddDomain={handleAddDomain}
                  apiKey={apiKey}
                  isLoadingApiKey={isLoadingApiKey}
                  isCreatingApiKey={isCreatingApiKey}
                  onGenerateApiKey={handleGenerateApiKey}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Right Column */}
          <div className="sticky top-6 self-start">
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
              <SectionHeader 
                title="Live Preview" 
                description="See how your chatbot will appear on your website"
                icon={Sparkles}
              />
              <div className="mt-6 flex justify-center">
                <ChatbotPreview
                  color={config.primaryColor}
                  selectedIcon={
                    config.PrimaryIcon ? (
                      <img src={config.PrimaryIcon} alt="Custom Icon" className="w-6 h-6" />
                    ) : (
                      icons.find((icon) => icon.id === config.widgeticon)?.component
                    )
                  }
                  buttonAlignment={config.buttonAlignment}
                  showButtonText={config.showButtonText}
                  buttonText={config.widgetButtonText}
                  welcomeMessage={config.InitialMessage}
                  displayStyle={config.displayStyle}
                  customIcon={config.PrimaryIcon}
                  starterQuestions={config.starterQuestions}
                  HeaderText={config.DisplayName}
                  inputPlaceholder={config.messagePlaceholder}
                  initialMessages={config.InitialMessage.split('\n').filter((l: string) => l.trim() !== '')}
                  keepShowingSuggested={config.keepShowingSuggested}
                  collectFeedback={config.collectFeedback}
                  allowRegenerate={config.allowRegenerate}
                  dismissibleNoticeText={config.dismissibleNoticeText}
                  footerText={config.footerText}
                  autoShowInitial={config.autoShowInitial}
                  autoShowDelaySec={config.autoShowDelaySec}
                  widgetEnabled={config.widgetEnabled}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
