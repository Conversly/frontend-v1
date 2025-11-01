export interface WidgetStyles {
    appearance?: 'light' | 'dark';  // renamed from 'theme'
    displayStyle?: 'corner' | 'overlay';  // NEW: corner or overlay
    displayName?: string;  // keeping camelCase in DB
    
    // Colors
    primaryColor?: string;  // replaces headerColor, buttonColor
    widgetBubbleColour?: string;  // backend expects this key for message bubbles
    
    // Icons & Assets
    PrimaryIcon?: string;  // renamed from profilePictureFile : url
    widgeticon?: string;  // renamed from chatIcon (for the widget button icon) : url
    
    // Button Configuration
    alignChatButton?: 'left' | 'right';  // maps to buttonAlignment in frontend
    showButtonText?: boolean;  // boolean : true/false to show text on widget button
    buttonText?: string;  // text shown on widget button
    
    // Messages & Placeholders
    messagePlaceholder?: string;
    footerText?: string;  // HTML
    dismissableNoticeText?: string;  // maps to dismissibleNoticeText. HTML
    
    // Dimensions
    chatWidth?: string;
    chatHeight?: string;  
    
    // Behavior Flags
    autoShowInitial?: boolean;  // replaces autoOpenChatWindowAfter > 0 check
    autoShowDelaySec?: number;  // renamed from autoOpenChatWindowAfter
    collectUserFeedback?: boolean;  // maps to collectFeedback
    regenerateMessages?: boolean;  // maps to allowRegenerate
    continueShowingSuggestedMessages?: boolean;  // maps to keepShowingSuggested
}



export interface ChatbotCustomization {
    styles?: WidgetStyles;
    onlyAllowOnAddedDomains?: boolean;
    initialMessage?: string;
    suggestedMessages?: string[];
}

export interface ChatbotWidget {
    chatbotId: string;
    partial: ChatbotCustomization;
}

// Type aliases for backward compatibility
export type ChatbotCustomizationPayload = ChatbotWidget;
export type ChatbotCustomizationPartial = ChatbotCustomization;

export interface UIConfigInput {
  // Message / content related
  DisplayName: string;
  InitialMessage: string;
  starterQuestions: string[];
  messagePlaceholder: string;
  keepShowingSuggested: boolean;
  collectFeedback: boolean;
  allowRegenerate: boolean;
  dismissibleNoticeText: string;
  footerText: string;

  // Behaviour / other
  autoShowInitial: boolean;
  autoShowDelaySec: number;
  widgetEnabled: boolean;

  // Style / colour / icons / layout
  primaryColor: string;
  widgetBubbleColour: string;
  PrimaryIcon: string;
  widgeticon: string;
  alignChatButton?: 'left' | 'right';
  buttonAlignment: 'left' | 'right';
  showButtonText: boolean;
  buttonText: string;
  appearance: 'light' | 'dark';
  widgetButtonText: string;
  chatWidth: string;
  chatHeight: string;
  displayStyle: 'corner' | 'overlay';
  converslyWebId: string;
  uniqueClientId: string;
  testing?: boolean;
}
