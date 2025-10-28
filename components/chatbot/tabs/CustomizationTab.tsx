"use client";

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Bot,
  MessageCircle,
  HelpCircle,
  MessageSquare,
  BrainCircuit,
  Copy,
  Minus,
  Upload,
  Frame,
  Code,
  Palette,
  Settings2,
  Layout,
  Globe,
  ListPlus,
  Sparkles,
  Plus,
  LucideIcon,
  Mail,
  Key
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { toast } from 'sonner';
import { ChatbotPreview } from '@/components/chatbot/ChatbotPreview';
import { Highlight, themes } from 'prism-react-renderer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useCustomizationDraft, useCustomizationStore } from '@/store/chatbot/customization';
import type { UIConfigInput } from '@/types/customization';

interface CustomizationTabProps {
  chatbotId: string;
  systemPrompt: string;
}

/** 
 * A central interface for all chatbot configuration,
 * making it easier to store and manage the entire config in a single object. 
 */
// We now use the centralized UI config from the customization store (UIConfigInput)

function SectionHeader({ 
  title, 
  description,
  icon: Icon 
}: { 
  title: string; 
  description?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10">
          <Icon className="w-5 h-5 text-pink-500" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-semibold text-white">
            {title}
          </h2>
          {description && (
            <p className="font-sans text-base text-gray-400">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export function CustomizationTab({ chatbotId, systemPrompt }: CustomizationTabProps) {
  // Icons array remains constant; no need to store in state
  const icons = [
    { id: 'chat', component: <MessageCircle className="w-6 h-6" /> },
    { id: 'bot', component: <Bot className="w-6 h-6" /> },
    { id: 'brain', component: <BrainCircuit className="w-6 h-6" /> },
    { id: 'help', component: <HelpCircle className="w-6 h-6" /> },
    { id: 'message', component: <MessageSquare className="w-6 h-6" /> },
  ];

  // Pull centralized draft + actions from the store
  const draft = useCustomizationDraft();
  const { setDraftConfig, loadCustomization, saveCustomization, resetDraftFromSaved, isSaving, isLoading } = useCustomizationStore();

  // Local default to seed the store on first mount (matches previous defaults)
  const defaultConfig: UIConfigInput = {
    color: '#0e4b75',
    widgetHeader: 'Support Bot',
    welcomeMessage: 'Hi! How can I help you today? 👋',
    promptscript: systemPrompt,
    selectedIcon: 'chat',
    customIcon: null,
    buttonAlignment: 'right',
    showButtonText: false,
    widgetButtonText: 'Chat with us',
    chatWidth: '350px',
    chatHeight: '500px',
    displayStyle: 'corner',
    domains: [''],
    starterQuestions: ['What is this about?', 'How do I get started?', '', ''],
    messagePlaceholder: 'Message...',
    initialMessagesText: '',
    keepShowingSuggested: false,
    collectFeedback: true,
    allowRegenerate: true,
  dismissibleNoticeText: '',
  footerText: '',
    autoShowInitial: true,
    autoShowDelaySec: 3,
    widgetEnabled: true,
  };

  // Ensure we have a draft in the store, then try to load server config
  useEffect(() => {
    if (!draft) setDraftConfig(defaultConfig);
    // Fire and forget load; if it fails, keep defaults
    loadCustomization(chatbotId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatbotId]);

  const config: UIConfigInput = draft ?? defaultConfig;

  // Helper to update draft without rewriting entire object each time
  const updateConfig = (updates: Partial<UIConfigInput>) => {
    setDraftConfig({ ...config, ...updates });
  };

  /** Domain management */
  const handleAddDomain = () => {
  updateConfig({ domains: [...config.domains, ''] });
  };

  const handleDomainChange = (index: number, value: string) => {
    const newDomains = [...config.domains];
    newDomains[index] = value;
  updateConfig({ domains: newDomains });
  };

  const handleRemoveDomain = (index: number) => {
    const newDomains = config.domains.filter((_, i) => i !== index);
  updateConfig({ domains: newDomains });
  };

  /** Starter questions management */
  const handleStarterQuestionChange = (index: number, value: string) => {
    const newQuestions = [...config.starterQuestions];
    newQuestions[index] = value;
  updateConfig({ starterQuestions: newQuestions });
  };

  const handleAddStarterQuestion = () => {
  updateConfig({ starterQuestions: [...config.starterQuestions, ''] });
  };

  /** File upload helper to upload icon and store URL */
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
      updateConfig({ customIcon: blob.url as string, selectedIcon: '' });
      toast.success('Profile picture uploaded');
    } catch (e: any) {
      toast.error(e?.message || 'Upload failed');
    }
  };

  /** Copy code to clipboard */
  const copyToClipboard = (text: string, type: 'embed' | 'iframe') => {
    navigator.clipboard.writeText(text);
    toast.success(`${type === 'embed' ? 'Widget' : 'iframe'} code copied to clipboard`);
  };

  /** Prism highlight helper */
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

  /** 
   * Embed code using the config object. 
   * Notice we read from `config` instead of multiple variables.
   */
  const embedCode = `<script>
(function () {
  const botConfig = {
    botId: "${chatbotId}",
    color: "${config.color}",
    title: "${config.widgetHeader}",
    welcomeMessage: "${config.welcomeMessage}",
    headerText: "${config.widgetHeader}",
    apiUrl: REPLACE IT WITH YOUR API URL,
    apiKey: REPLACE IT WITH YOUR API KEY,
    buttonAlign: "${config.buttonAlignment}",
    buttonText: "${config.widgetButtonText}",
    height: "${config.chatHeight}",
    width: "${config.chatWidth}",
    displayStyle: "${config.displayStyle}",
    customIcon: ${config.customIcon ? `"${config.customIcon}"` : 'null'},
    starter_questions: ${JSON.stringify(
      config.starterQuestions.filter((q) => q.trim() !== '')
    )},
    prompt: "${config.promptscript}"
  };
  const script = document.createElement("script");
  script.src = "https://cloud-ide-shas.s3.us-east-1.amazonaws.com/docBot/chat.js";
  script.async = true;
  script.onload = () => {
    if (window.DocsBotAI) { window.DocsBotAI.init(botConfig); }
  };
  document.head.appendChild(script);
})();
</script>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
`;

  const iframeCode = `<iframe
  COMING SOON!!
></iframe>`;

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
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Display Name */}
                  <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
                    <SectionHeader 
                      title="Display Name" 
                      description="Controls the name displayed in the chat header"
                      icon={MessageSquare}
                    />
                    <Input
                      value={config.widgetHeader}
                      onChange={(e) => updateConfig({ widgetHeader: e.target.value.slice(0, 100) })}
                      maxLength={100}
                      placeholder="Support Bot"
                      className="bg-gray-800/50 border-gray-700/50 text-white"
                    />
                  </div>

                  {/* Initial Messages */}
                  <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
                    <SectionHeader 
                      title="Initial Messages" 
                      description="Shown automatically when the chat opens"
                      icon={MessageSquare}
                    />
                    <div className="space-y-2">
                      <Textarea
                        value={config.initialMessagesText}
                        onChange={(e) => updateConfig({ initialMessagesText: e.target.value.slice(0, 1000) })}
                        placeholder="Hi! What can I help you with?\nAsk me about pricing\n..."
                        maxLength={1000}
                        className="bg-gray-800/50 border-gray-700/50 text-white min-h-[120px]"
                      />
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Enter each message in a new line</span>
                        <div className="flex items-center gap-3">
                          <span>{config.initialMessagesText.length}/1000</span>
                          <Button variant="outline" size="sm" className="border-gray-700 text-white hover:bg-gray-700/50" onClick={() => updateConfig({ initialMessagesText: '' })}>Reset</Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Suggested Messages */}
                  <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6 space-y-4">
                    <SectionHeader 
                      title="Suggested Messages" 
                      description="Quick replies shown as buttons"
                      icon={ListPlus}
                    />
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/40 border border-gray-800/60">
                      <span className="text-sm text-gray-300">Keep showing the suggested messages after the user's first message</span>
                      <input type="checkbox" className="w-5 h-5" checked={config.keepShowingSuggested} onChange={(e) => updateConfig({ keepShowingSuggested: e.target.checked })} />
                    </div>
                    <div className="space-y-3">
                      {config.starterQuestions.map((question, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Input
                            value={question}
                            onChange={(e) => handleStarterQuestionChange(index, e.target.value)}
                            placeholder={`Suggestion ${index + 1}`}
                            className="bg-gray-800/50 border-gray-700/50 text-white"
                          />
                          {index >= 2 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newQuestions = config.starterQuestions.filter((_, i) => i !== index);
                                updateConfig({ starterQuestions: newQuestions });
                              }}
                              className="text-gray-400 hover:text-white hover:bg-gray-700"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        onClick={handleAddStarterQuestion}
                        variant="outline"
                        className="w-full border-gray-700 text-white hover:bg-gray-700/50"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add suggested message
                      </Button>
                    </div>
                  </div>

                  {/* Message Placeholder */}
                  <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
                    <SectionHeader 
                      title="Message Placeholder" 
                      description="Shown inside the input before the user types"
                      icon={MessageSquare}
                    />
                    <Input
                      value={config.messagePlaceholder}
                      onChange={(e) => updateConfig({ messagePlaceholder: e.target.value.slice(0, 100) })}
                      placeholder="Message..."
                      maxLength={100}
                      className="bg-gray-800/50 border-gray-700/50 text-white"
                    />
                  </div>

                  {/* Feedback and Regenerate */}
                  <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6 space-y-4">
                    <SectionHeader 
                      title="User Actions" 
                      description="Enable feedback and regenerate controls"
                      icon={Sparkles}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Collect user feedback on answers</span>
                      <input type="checkbox" className="w-5 h-5" checked={config.collectFeedback} onChange={(e) => updateConfig({ collectFeedback: e.target.checked })} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Allow regenerate last response</span>
                      <input type="checkbox" className="w-5 h-5" checked={config.allowRegenerate} onChange={(e) => updateConfig({ allowRegenerate: e.target.checked })} />
                    </div>
                  </div>

                  {/* Dismissible Notice */}
                  <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
                    <SectionHeader 
                      title="Dismissible Notice" 
                      description="Temporary notice shown until user's first message (plain text)"
                      icon={MessageSquare}
                    />
                    <div className="space-y-2">
                      <Textarea
                        value={config.dismissibleNoticeText}
                        onChange={(e) => updateConfig({ dismissibleNoticeText: e.target.value.slice(0, 200) })}
                        placeholder="Type a short notice (text only)."
                        maxLength={200}
                        className="bg-gray-800/50 border-gray-700/50 text-white min-h-[100px]"
                      />
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>This notice hides after the user's first message</span>
                        <span>{config.dismissibleNoticeText.length}/200</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
                    <SectionHeader 
                      title="Footer" 
                      description="Persistent info at the bottom of the chat (plain text)"
                      icon={MessageSquare}
                    />
                    <div className="space-y-2">
                      <Textarea
                        value={config.footerText}
                        onChange={(e) => updateConfig({ footerText: e.target.value.slice(0, 200) })}
                        placeholder="Add a disclaimer or link (text only)."
                        maxLength={200}
                        className="bg-gray-800/50 border-gray-700/50 text-white min-h-[80px]"
                      />
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Shown above the input</span>
                        <span>{config.footerText.length}/200</span>
                      </div>
                    </div>
                  </div>

                  {/* Auto Show Initial Messages */}
                  <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
                    <SectionHeader 
                      title="Auto Show Initial Messages" 
                      description="Automatically show initial messages after a delay"
                      icon={MessageSquare}
                    />
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="w-5 h-5" checked={config.autoShowInitial} onChange={(e) => updateConfig({ autoShowInitial: e.target.checked })} />
                        <span className="text-sm text-gray-300">Enable</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={config.autoShowDelaySec}
                          onChange={(e) => updateConfig({ autoShowDelaySec: Number(e.target.value) })}
                          className="w-24 bg-gray-800/50 border-gray-700/50 text-white"
                        />
                        <span className="text-sm text-gray-400">seconds</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="appearance">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Theme Settings */}
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
                <SectionHeader 
                  title="Theme Settings" 
                  description="Customize the visual appearance of your widget"
                  icon={Palette}
                />
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Color Picker */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="font-sans text-base text-gray-300">Theme Color</label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-sans text-sm">
                            This color will be used for the widget's header, buttons, and accents
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex gap-4">
                      <Input
                        type="color"
                        value={config.color}
                        onChange={(e) => updateConfig({ color: e.target.value })}
                        className="w-16 h-10 p-1 rounded-lg cursor-pointer bg-gray-800/50 border-gray-700/50"
                      />
                      <Input
                        value={config.color}
                        onChange={(e) => updateConfig({ color: e.target.value })}
                        placeholder="#000000"
                        className="flex-1 bg-gray-800/50 border-gray-700/50 text-white"
                      />
                    </div>
                  </div>

                  {/* Header Text */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="font-sans text-base text-gray-300">Widget Header</label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-sans text-sm">
                            The title shown at the top of your chat widget
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      value={config.widgetHeader}
                      onChange={(e) => updateConfig({ widgetHeader: e.target.value })}
                      placeholder="Support Bot"
                      className="bg-gray-800/50 border-gray-700/50 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Icon Settings */}
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
                <SectionHeader 
                  title="Icon Settings" 
                  description="Choose or upload a custom icon for your chat widget"
                  icon={Layout}
                />
                
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-4">
                    {icons.map((icon) => (
                      <Button
                        key={icon.id}
                        variant={config.selectedIcon === icon.id && !config.customIcon ? 'default' : 'outline'}
                        onClick={() => updateConfig({ selectedIcon: icon.id, customIcon: null })}
                        className="p-3 bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50"
                      >
                        {icon.component}
                      </Button>
                    ))}
                    <div className="flex items-center gap-2">
                      <label 
                        htmlFor="customIconUpload" 
                        className="cursor-pointer p-3 rounded-xl border border-gray-700/50 hover:bg-gray-700/50 transition-colors"
                      >
                        <Upload className="w-6 h-6 text-gray-400" />
                      </label>
                      <input
                        id="customIconUpload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleIconUpload}
                      />
                      {config.customIcon && (
                        <img src={config.customIcon} alt="Custom Icon" className="w-10 h-10 rounded-lg object-contain" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-400">
                    <HelpCircle className="w-4 h-4" />
                    <p className="font-sans text-sm">
                      Select a preset icon or upload your own. Custom icons will override presets.
                    </p>
                  </div>
                </div>
              </div>

              {/* Size & Position */}
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
                <SectionHeader 
                  title="Size & Position" 
                  description="Configure the dimensions and placement of your widget"
                  icon={Frame}
                />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="font-sans text-base text-gray-300 mb-2 block">Widget Width</label>
                      <Input
                        value={config.chatWidth}
                        onChange={(e) => updateConfig({ chatWidth: e.target.value })}
                        placeholder="e.g., 350px"
                        className="bg-gray-800/50 border-gray-700/50 text-white"
                      />
                    </div>
                    <div>
                      <label className="font-sans text-base text-gray-300 mb-2 block">Widget Height</label>
                      <Input
                        value={config.chatHeight}
                        onChange={(e) => updateConfig({ chatHeight: e.target.value })}
                        placeholder="e.g., 500px"
                        className="bg-gray-800/50 border-gray-700/50 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="font-sans text-base text-gray-300 mb-2 block">Display Style</label>
                    <div className="flex items-center gap-4">
                      <Button
                        variant={config.displayStyle === 'corner' ? 'default' : 'outline'}
                        onClick={() => updateConfig({ displayStyle: 'corner' })}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90"
                      >
                        Corner
                      </Button>
                      <Button
                        variant={config.displayStyle === 'overlay' ? 'default' : 'outline'}
                        onClick={() => updateConfig({ displayStyle: 'overlay' })}
                        className="border-gray-700 text-white hover:bg-gray-700/50"
                      >
                        Overlay
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Button Settings */}
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
                <SectionHeader 
                  title="Button Settings" 
                  description="Customize the chat button appearance"
                  icon={MessageSquare}
                />
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="font-sans text-base text-gray-300">Button Alignment</label>
                    <div className="flex items-center gap-4">
                      <Button
                        variant={config.buttonAlignment === 'left' ? 'default' : 'outline'}
                        onClick={() => updateConfig({ buttonAlignment: 'left' })}
                        className={config.buttonAlignment === 'left' 
                          ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90"
                          : "border-gray-700 text-white hover:bg-gray-700/50"
                        }
                      >
                        Left
                      </Button>
                      <Button
                        variant={config.buttonAlignment === 'right' ? 'default' : 'outline'}
                        onClick={() => updateConfig({ buttonAlignment: 'right' })}
                        className={config.buttonAlignment === 'right' 
                          ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90"
                          : "border-gray-700 text-white hover:bg-gray-700/50"
                        }
                      >
                        Right
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <label className="font-sans text-base text-gray-300">Show Button Text</label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-sans text-sm">Display text next to the chat button</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.showButtonText}
                      onChange={(e) => updateConfig({ showButtonText: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-700 bg-gray-800/50"
                    />
                  </div>

                  {config.showButtonText && (
                    <div className="space-y-2">
                      <label className="font-sans text-base text-gray-300">Button Text</label>
                      <Input
                        value={config.widgetButtonText}
                        onChange={(e) => updateConfig({ widgetButtonText: e.target.value })}
                        placeholder="Chat with us"
                        className="bg-gray-800/50 border-gray-700/50 text-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
              </TabsContent>

              {/* AI Tab */}
              <TabsContent value="ai">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Welcome Message */}
                  <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
                    <SectionHeader 
                      title="Welcome Message" 
                      description="Initial bot message shown on open"
                      icon={MessageSquare}
                    />
                    <Textarea
                      value={config.welcomeMessage}
                      onChange={(e) => updateConfig({ welcomeMessage: e.target.value })}
                      placeholder="Hi! How can I help you today? 👋"
                      className="bg-gray-800/50 border-gray-700/50 text-white min-h-[100px]"
                    />
                  </div>

                  {/* Prompt Script */}
                  <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
                    <SectionHeader 
                      title="System Prompt" 
                      description="Define your assistant's personality and behavior"
                      icon={BrainCircuit}
                    />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="font-sans text-base text-gray-300">Prompt Script</label>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-sans text-sm">This script defines how your AI assistant behaves and responds</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Textarea
                        value={config.promptscript}
                        onChange={(e) => updateConfig({ promptscript: e.target.value })}
                        placeholder="You are a helpful assistant..."
                        className="bg-gray-800/50 border-gray-700/50 text-white min-h-[200px]"
                      />
                    </div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="integration">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* API Key Section */}
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
                <SectionHeader 
                  title="API Key" 
                  description="Get your API key to use the chatbot"
                  icon={Key}
                />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-pink-500/20 rounded-xl bg-pink-500/5">
                    <div className="space-y-1">
                      <h4 className="font-heading text-lg text-white">Need an API Key?</h4>
                      <p className="font-sans text-sm text-gray-400">
                        Contact us to get your API key for integration
                      </p>
                    </div>
                    <a
                      href={`mailto:tyagishashank118@gmail.com?subject=API Key Request&body=I need API key for my business,%0D%0A%0D%0AChatbot ID: ${chatbotId}%0D%0AMy email: `}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 transition-opacity"
                    >
                      <Mail className="w-4 h-4" />
                      Request API Key and Url
                    </a>
                  </div>
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
                      {config.domains.map((domain, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Input
                            value={domain}
                            onChange={(e) => handleDomainChange(index, e.target.value)}
                            placeholder="https://example.com"
                            className="bg-gray-800/50 border-gray-700/50 text-white"
                          />
                          {config.domains.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveDomain(index)}
                              className="text-gray-400 hover:text-white hover:bg-gray-700"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        onClick={handleAddDomain}
                        variant="outline"
                        className="w-full border-gray-700 text-white hover:bg-gray-700/50"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Domain
                      </Button>
                    </div>
                  </div>
            </motion.div>
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
                  color={config.color}
                  selectedIcon={
                    config.customIcon ? (
                      <img src={config.customIcon} alt="Custom Icon" className="w-6 h-6" />
                    ) : (
                      icons.find((icon) => icon.id === config.selectedIcon)?.component
                    )
                  }
                  buttonAlignment={config.buttonAlignment}
                  showButtonText={config.showButtonText}
                  buttonText={config.widgetButtonText}
                  welcomeMessage={config.welcomeMessage}
                  displayStyle={config.displayStyle}
                  customIcon={config.customIcon}
                  starterQuestions={config.starterQuestions}
                  HeaderText={config.widgetHeader}
                  // New content props
                  inputPlaceholder={config.messagePlaceholder}
                  initialMessages={config.initialMessagesText.split('\n').filter((l) => l.trim() !== '')}
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
