import { ChatbotCustomizationPayload } from '@/types/customization';

export interface UIConfigInput {
  color: string;
  widgetHeader: string;
  welcomeMessage: string;
  promptscript: string;
  selectedIcon: string;
  customIcon: string | null;
  buttonAlignment: 'left' | 'right';
  showButtonText: boolean;
  widgetButtonText: string;
  chatWidth: string;
  chatHeight: string;
  displayStyle: 'corner' | 'overlay';
  domains: string[];
  starterQuestions: string[];
  messagePlaceholder: string;
  initialMessagesText: string;
  keepShowingSuggested: boolean;
  collectFeedback: boolean;
  allowRegenerate: boolean;
  dismissibleNoticeHtml: string;
  footerHtml: string;
  autoShowInitial: boolean;
  autoShowDelaySec: number;
  widgetEnabled: boolean;
}

/**
 * Map the UI config state to a backend payload compatible with competitor schema.
 * Note: This does not POST anywhere; it only transforms the object.
 */
export function mapConfigToCustomizationPayload(
  chatbotId: string,
  config: UIConfigInput,
  options?: { theme?: 'light' | 'dark'; onlyAllowOnAddedDomains?: boolean }
): ChatbotCustomizationPayload {
  const initialMessages = config.initialMessagesText
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const suggestedMessages = config.starterQuestions
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const allowedDomains = (config.domains || [])
    .map((s) => (s || '').trim())
    .filter((s) => s.length > 0);

  const theme = options?.theme ?? 'light';
  const onlyAllowOnAddedDomains = options?.onlyAllowOnAddedDomains ?? false;

  return {
    chatbotId,
    partial: {
      channel_specific_instructions: {},
      styles: {
        theme,
        header_color: config.color,
        user_message_color: config.color,
        button_color: config.color,
        display_name: config.widgetHeader,
        profile_picture_file: config.customIcon ?? null,
        chat_icon: config.customIcon ? null : config.selectedIcon || null,
        auto_open_chat_window_after: config.autoShowInitial ? config.autoShowDelaySec : 0,
        align_chat_button: config.buttonAlignment,
        message_placeholder: config.messagePlaceholder,
        footer: config.footerHtml,
        collect_user_feedback: config.collectFeedback,
        regenerate_messages: config.allowRegenerate,
        continue_showing_suggested_messages: config.keepShowingSuggested,
        dismissable_notice: config.dismissibleNoticeHtml,
        hidden_paths: [],
      },
      only_allow_on_added_domains: onlyAllowOnAddedDomains,
      initial_messages: initialMessages.length ? initialMessages : [config.welcomeMessage].filter(Boolean),
      suggested_messages: suggestedMessages,
      allowed_domains: allowedDomains.length ? allowedDomains : [''],
    },
  };
}
