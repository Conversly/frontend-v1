export interface WidgetStyles {
    theme: 'light' | 'dark';

    headerColor: string;

    userMessageColor: string;

    buttonColor: string;

    displayName: string;

    profilePictureFile?: string | null;

    chatIcon?: string | null;

    autoOpenChatWindowAfter: number; // seconds

    alignChatButton: 'left' | 'right';

    messagePlaceholder: string;

    footerText: string;

    collectUserFeedback: boolean;

    regenerateMessages: boolean;

    continueShowingSuggestedMessages: boolean;

    dismissableNoticeText: string;

    hiddenPaths: string[];
}

export interface ChatbotCustomizationPartial {
    styles: WidgetStyles;
    onlyAllowOnAddedDomains: boolean;
    initialMessage: string;
    suggestedMessages: string[];
    allowedDomains: string[];
}

export interface ChatbotCustomizationPayload {
    chatbotId: string;
    partial: ChatbotCustomizationPartial;
}

// Centralized UI config used by the editor screens (client-side state)
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
    dismissibleNoticeText: string;
    footerText: string;
    autoShowInitial: boolean;
    autoShowDelaySec: number;
    widgetEnabled: boolean;
}
