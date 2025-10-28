'use client';

import { create } from 'zustand';
import { ChatbotCustomizationPayload, ChatbotCustomizationPartial, UIConfigInput } from '@/types/customization';
import { getWidgetConfig, updateWidgetConfig } from '@/lib/api/deploy';

interface CustomizationState {
  // Saved server payload
  savedPayload: ChatbotCustomizationPayload | null;
  // Draft UI config used by the editor screens
  draftConfig: UIConfigInput | null;
  isSaving: boolean;
  isLoading: boolean;
  setDraftConfig: (draft: NonNullable<CustomizationState['draftConfig']>) => void;
  resetDraftFromSaved: () => void;
  loadCustomization: (chatbotId: string | number) => Promise<void>;
  saveCustomization: (chatbotId: string | number) => Promise<ChatbotCustomizationPayload>;
}

function payloadToUIConfig(payload: ChatbotCustomizationPayload): UIConfigInput {
  const p = payload.partial;
  const s = p.styles;
  return {
    color: s.headerColor || '#0e4b75',
    widgetHeader: s.displayName || 'Support Bot',
    welcomeMessage: (p.initialMessages?.[0] as string) || 'Hi! How can I help you today? 👋',
    promptscript: '',
    selectedIcon: (s.chatIcon as string) || 'chat',
    customIcon: (s.profilePictureFile as string) || null,
    buttonAlignment: s.alignChatButton || 'right',
    showButtonText: false,
    widgetButtonText: 'Chat with us',
    chatWidth: '350px',
    chatHeight: '500px',
    displayStyle: 'corner',
    domains: p.allowedDomains || [''],
    starterQuestions: p.suggestedMessages || [],
    messagePlaceholder: s.messagePlaceholder || 'Message...',
    initialMessagesText: (p.initialMessages || []).join('\n'),
    keepShowingSuggested: !!s.continueShowingSuggestedMessages,
    collectFeedback: !!s.collectUserFeedback,
    allowRegenerate: !!s.regenerateMessages,
    dismissibleNoticeText: s.dismissableNoticeText || '',
    footerText: s.footerText || '',
    autoShowInitial: (s.autoOpenChatWindowAfter ?? 0) > 0,
    autoShowDelaySec: Number(s.autoOpenChatWindowAfter ?? 3),
    widgetEnabled: true,
  };
}

export const useCustomizationStore = create<CustomizationState>((set, get) => ({
  savedPayload: null,
  draftConfig: null,
  isSaving: false,
  isLoading: false,

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
      const initialMessages = draft.initialMessagesText
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const suggestedMessages = draft.starterQuestions
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const allowedDomains = (draft.domains || [])
        .map((s) => (s || '').trim())
        .filter((s) => s.length > 0);

      const partial: ChatbotCustomizationPartial = {
        styles: {
          theme: 'light',
          headerColor: draft.color,
          userMessageColor: draft.color,
          buttonColor: draft.color,
          displayName: draft.widgetHeader,
          profilePictureFile: draft.customIcon ?? null,
          chatIcon: draft.customIcon ? null : draft.selectedIcon || null,
          autoOpenChatWindowAfter: draft.autoShowInitial ? draft.autoShowDelaySec : 0,
          alignChatButton: draft.buttonAlignment,
          messagePlaceholder: draft.messagePlaceholder,
          footerText: draft.footerText,
          collectUserFeedback: draft.collectFeedback,
          regenerateMessages: draft.allowRegenerate,
          continueShowingSuggestedMessages: draft.keepShowingSuggested,
          dismissableNoticeText: draft.dismissibleNoticeText,
          hiddenPaths: [],
        },
        onlyAllowOnAddedDomains: false,
        initialMessages: initialMessages.length ? initialMessages : [draft.welcomeMessage].filter(Boolean) as string[],
        suggestedMessages,
        allowedDomains: allowedDomains.length ? allowedDomains : [''],
      };

      const saved = await updateWidgetConfig(chatbotId, partial);
      set({ savedPayload: saved });
      return saved;
    } finally {
      set({ isSaving: false });
    }
  },
}));

// Backward-compatible selector name returning the new draftConfig
export const useCustomizationDraft = () => useCustomizationStore((s) => s.draftConfig);


