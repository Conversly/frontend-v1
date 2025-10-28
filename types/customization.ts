export interface WidgetStyles {
  theme: 'light' | 'dark';
  header_color: string;
  user_message_color: string;
  button_color: string;
  display_name: string;
  profile_picture_file?: string | null;
  chat_icon?: string | null;
  auto_open_chat_window_after: number; // seconds
  align_chat_button: 'left' | 'right';
  message_placeholder: string;
  footer: string; // HTML
  collect_user_feedback: boolean;
  regenerate_messages: boolean;
  continue_showing_suggested_messages: boolean;
  dismissable_notice: string; // HTML
  hidden_paths: string[];
}

export interface ChannelSpecificInstructions {
  // Extend later for channel overrides
  [key: string]: unknown;
}

export interface ChatbotCustomizationPartial {
  channel_specific_instructions: ChannelSpecificInstructions;
  styles: WidgetStyles;
  only_allow_on_added_domains: boolean;
  initial_messages: string[];
  suggested_messages: string[];
  allowed_domains: string[];
}

export interface ChatbotCustomizationPayload {
  chatbotId: string;
  partial: ChatbotCustomizationPartial;
}
