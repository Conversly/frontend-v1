'use client';

import { create } from 'zustand';
import { ChatbotCustomizationPayload } from '@/types/customization';
import { mapConfigToCustomizationPayload, UIConfigInput } from '@/lib/customization-mapper';
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
    color: s.header_color || '#0e4b75',
    widgetHeader: s.display_name || 'Support Bot',
    welcomeMessage: (p.initial_messages?.[0] as string) || 'Hi! How can I help you today? 👋',
    promptscript: '',
    selectedIcon: (s.chat_icon as string) || 'chat',
    customIcon: (s.profile_picture_file as string) || null,
    buttonAlignment: s.align_chat_button || 'right',
    showButtonText: false,
    widgetButtonText: 'Chat with us',
    chatWidth: '350px',
    chatHeight: '500px',
    displayStyle: 'corner',
    domains: p.allowed_domains || [''],
    starterQuestions: p.suggested_messages || [],
    messagePlaceholder: s.message_placeholder || 'Message...',
    initialMessagesText: (p.initial_messages || []).join('\n'),
    keepShowingSuggested: !!s.continue_showing_suggested_messages,
    collectFeedback: !!s.collect_user_feedback,
    allowRegenerate: !!s.regenerate_messages,
    dismissibleNoticeHtml: s.dismissable_notice || '',
    footerHtml: s.footer || '',
    autoShowInitial: (s.auto_open_chat_window_after ?? 0) > 0,
    autoShowDelaySec: Number(s.auto_open_chat_window_after ?? 3),
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
      const payload = mapConfigToCustomizationPayload(String(chatbotId), draft);
      const saved = await updateWidgetConfig(chatbotId, payload.partial);
      set({ savedPayload: saved });
      return saved;
    } finally {
      set({ isSaving: false });
    }
  },
}));

// Backward-compatible selector name returning the new draftConfig
export const useCustomizationDraft = () => useCustomizationStore((s) => s.draftConfig);


