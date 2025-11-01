'use client';

import { create } from 'zustand';
import { ChatbotCustomizationPayload, ChatbotCustomizationPartial, UIConfigInput, WidgetStyles } from '@/types/customization';
import { 
  getWidgetConfig, 
  updateWidgetConfig, 
  getDomainAllowlist, 
  addDomainToAllowlist,
  getApiKey,
  createApiKey,
  DomainInfo 
} from '@/lib/api/deploy';

interface CustomizationState {
  // Saved server payload
  savedPayload: ChatbotCustomizationPayload | null;
  // Draft UI config used by the editor screens
  draftConfig: UIConfigInput | null;
  isSaving: boolean;
  isLoading: boolean;
  
  // Domain management
  domains: DomainInfo[];
  isLoadingDomains: boolean;
  isSavingDomain: boolean;
  
  // API Key management
  apiKey: string | null;
  isLoadingApiKey: boolean;
  isCreatingApiKey: boolean;
  
  setDraftConfig: (draft: NonNullable<CustomizationState['draftConfig']>) => void;
  resetDraftFromSaved: () => void;
  loadCustomization: (chatbotId: string | number) => Promise<void>;
  saveCustomization: (chatbotId: string | number) => Promise<ChatbotCustomizationPayload>;
  
  // Domain methods
  loadDomains: (chatbotId: string | number) => Promise<void>;
  addDomain: (chatbotId: string | number, domain: string) => Promise<void>;
  
  // API Key methods
  loadApiKey: (chatbotId: string | number) => Promise<void>;
  generateApiKey: (chatbotId: string | number) => Promise<string>;
}

function payloadToUIConfig(payload: ChatbotCustomizationPayload): UIConfigInput {
  const p = payload.partial;
  const s = (p.styles ?? {}) as WidgetStyles;
  return {
    DisplayName: s.displayName || 'Support Bot',
    InitialMessage: (p.initialMessage as string) || 'Hi! How can I help you today? 👋',
    starterQuestions: p.suggestedMessages || [],
    messagePlaceholder: s.messagePlaceholder || 'Message...',
    keepShowingSuggested: !!s.continueShowingSuggestedMessages,
    collectFeedback: !!s.collectUserFeedback,
    allowRegenerate: !!s.regenerateMessages,
    dismissibleNoticeText: s.dismissableNoticeText || '',
    footerText: s.footerText || '',
    autoShowInitial: s.autoShowInitial ?? false,
    autoShowDelaySec: s.autoShowDelaySec ?? 3,
    widgetEnabled: true, // Default to enabled
    primaryColor: s.primaryColor || '#0e4b75',
    widgetBubbleColour: s.widgetBubbleColour || '#0e4b75',
    PrimaryIcon: s.PrimaryIcon || '',
    widgeticon: s.widgeticon || 'chat',
    buttonAlignment: s.alignChatButton || 'right',
    showButtonText: s.showButtonText ?? false,
    buttonText: s.buttonText || 'Chat with us',
    appearance: s.appearance || 'light',
    widgetButtonText: s.buttonText || 'Chat with us',
    chatWidth: s.chatWidth || '350px',
    chatHeight: s.chatHeight || '500px',
    displayStyle: s.displayStyle || 'corner',
    converslyWebId: '',
    uniqueClientId: '',
    testing: false,
  };
}

export const useCustomizationStore = create<CustomizationState>((set, get) => ({
  savedPayload: null,
  draftConfig: null,
  isSaving: false,
  isLoading: false,
  
  // Domain state
  domains: [],
  isLoadingDomains: false,
  isSavingDomain: false,
  
  // API Key state
  apiKey: null,
  isLoadingApiKey: false,
  isCreatingApiKey: false,

  setDraftConfig: (draft) => set({ draftConfig: draft }),
  resetDraftFromSaved: () => {
    const saved = get().savedPayload;
    if (saved) {
      set({ draftConfig: payloadToUIConfig(saved) });
    }
  },

  loadCustomization: async (chatbotId) => {
    set({ isLoading: true });
    try {
      const data = await getWidgetConfig(chatbotId);
      set({ savedPayload: data, draftConfig: payloadToUIConfig(data) });
    } finally {
      set({ isLoading: false });
    }
  },

  saveCustomization: async (chatbotId) => {
    const draft = get().draftConfig;
    if (!draft) throw new Error('No draft configuration to save');
    set({ isSaving: true });
    try {
      // Build server payload (camelCase) directly from the UI draft
      const initialMessage = draft.InitialMessage.trim();

      const suggestedMessages = draft.starterQuestions
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const partial: ChatbotCustomizationPartial = {
        styles: {
          appearance: draft.appearance,
          displayStyle: draft.displayStyle,
          displayName: draft.DisplayName,
          primaryColor: draft.primaryColor,
          widgetBubbleColour: draft.widgetBubbleColour,
          PrimaryIcon: draft.PrimaryIcon,
          widgeticon: draft.widgeticon,
          alignChatButton: draft.buttonAlignment,
          showButtonText: draft.showButtonText,
          buttonText: draft.buttonText,
          messagePlaceholder: draft.messagePlaceholder,
          footerText: draft.footerText,
          dismissableNoticeText: draft.dismissibleNoticeText,
          chatWidth: draft.chatWidth,
          chatHeight: draft.chatHeight,
          autoShowInitial: draft.autoShowInitial,
          autoShowDelaySec: draft.autoShowDelaySec,
          collectUserFeedback: draft.collectFeedback,
          regenerateMessages: draft.allowRegenerate,
          continueShowingSuggestedMessages: draft.keepShowingSuggested,
        },
        onlyAllowOnAddedDomains: false,
        initialMessage,
        suggestedMessages,
      };

      const saved = await updateWidgetConfig(chatbotId, partial);
      set({ savedPayload: saved });
      return saved;
    } finally {
      set({ isSaving: false });
    }
  },
  
  // Domain management methods
  loadDomains: async (chatbotId) => {
    set({ isLoadingDomains: true });
    try {
      const data = await getDomainAllowlist(chatbotId);
      set({ domains: data.domains });
    } catch (error) {
      console.error('Failed to load domains:', error);
      set({ domains: [] });
    } finally {
      set({ isLoadingDomains: false });
    }
  },
  
  addDomain: async (chatbotId, domain) => {
    set({ isSavingDomain: true });
    try {
      const newDomain = await addDomainToAllowlist(chatbotId, domain);
      set((state) => ({ domains: [...state.domains, newDomain] }));
    } finally {
      set({ isSavingDomain: false });
    }
  },
  
  // API Key management methods
  loadApiKey: async (chatbotId) => {
    set({ isLoadingApiKey: true });
    try {
      const data = await getApiKey(chatbotId);
      set({ apiKey: data.apiKey });
    } catch (error) {
      console.error('Failed to load API key:', error);
      set({ apiKey: null });
    } finally {
      set({ isLoadingApiKey: false });
    }
  },
  
  generateApiKey: async (chatbotId) => {
    set({ isCreatingApiKey: true });
    try {
      const data = await createApiKey(chatbotId);
      set({ apiKey: data.apiKey });
      return data.apiKey;
    } finally {
      set({ isCreatingApiKey: false });
    }
  },
}));

// Backward-compatible selector name returning the new draftConfig
export const useCustomizationDraft = () => useCustomizationStore((s) => s.draftConfig);


