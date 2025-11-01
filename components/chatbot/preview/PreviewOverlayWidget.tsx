"use client"

import type { ReactElement } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Bot, BrainCircuit, HelpCircle, MessageCircle, MessageSquare } from "lucide-react"

import { ChatBody } from "@/components/widget/ChatBody"
import { ChatHeader } from "@/components/widget/ChatHeader"
import { ChatInput } from "@/components/widget/ChatInput"
import type { Message } from "@/components/widget/helpers/chat-message"
import { cn } from "@/lib/utils"
import type { UIConfigInput } from "@/types/customization"

interface PreviewOverlayWidgetProps {
  config: UIConfigInput
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  messages: Message[]
  input: string
  setInput: (value: string) => void
  isTyping: boolean
  handleSendMessage: (content: string) => void
  handleSuggestionClick: (suggestion: string) => void
  handleRegenerate: () => void
  handleRating: (
    messageId: string,
    rating: "thumbs-up" | "thumbs-down",
    feedback?: {
      issue?: string
      incorrect?: boolean
      irrelevant?: boolean
      unaddressed?: boolean
    }
  ) => void
}

export function PreviewOverlayWidget({
  config,
  isOpen,
  setIsOpen,
  messages,
  input,
  setInput,
  isTyping,
  handleSendMessage,
  handleSuggestionClick,
  handleRegenerate,
  handleRating,
}: PreviewOverlayWidgetProps) {
  const buttonAlignment = (config as UIConfigInput & { buttonAlignment?: "left" | "right" })
    .buttonAlignment
  const alignment = buttonAlignment ?? config.alignChatButton ?? "right"
  const isLeft = alignment === "left"
  const buttonLabel = config.widgetButtonText || config.buttonText

  const resolveWidgetIcon = (className: string) => {
    if (config.widgeticon) {
      if (config.widgeticon.startsWith("http") || config.widgeticon.startsWith("data:")) {
        return <img src={config.widgeticon} alt="Chat" className={className} />
      }

      const iconMap: Record<string, (cls: string) => ReactElement> = {
        chat: (cls) => <MessageCircle className={cls} />,
        bot: (cls) => <Bot className={cls} />,
        brain: (cls) => <BrainCircuit className={cls} />,
        help: (cls) => <HelpCircle className={cls} />,
        message: (cls) => <MessageSquare className={cls} />,
      }

      const render = iconMap[config.widgeticon]
      if (render) {
        return render(className)
      }
    }

    return <MessageCircle className={className} />
  }

  return (
    <div className="relative h-full w-full">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              "absolute z-10 flex items-center gap-2 rounded-full px-5 py-3 font-medium text-white shadow-lg",
              config.showButtonText ? "px-6" : "px-5"
            )}
            style={{
              bottom: "20px",
              [isLeft ? "left" : "right"]: "20px",
              backgroundColor: config.widgetBubbleColour || config.primaryColor,
            }}
          >
            {resolveWidgetIcon("h-7 w-7")}
            {config.showButtonText && buttonLabel && <span>{buttonLabel}</span>}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 rounded-2xl bg-black/20 backdrop-blur-sm" />
            <div className="relative flex h-full w-full items-center justify-center p-6">
              <div
                className={cn(
                  "flex h-full w-full max-w-full flex-col overflow-hidden rounded-2xl border shadow-2xl",
                  config.appearance === "dark"
                    ? "border-gray-800 bg-gray-950"
                    : "border-gray-200 bg-white"
                )}
                style={{
                  width: config.chatWidth || "720px",
                  maxWidth: "100%",
                  height: config.chatHeight || "520px",
                  maxHeight: "100%",
                }}
              >
                <ChatHeader config={config} onClose={() => setIsOpen(false)} />
                <ChatBody
                  config={config}
                  messages={messages}
                  isTyping={isTyping}
                  handleSuggestionClick={handleSuggestionClick}
                  handleRegenerate={handleRegenerate}
                  handleRating={handleRating}
                />
                <ChatInput
                  config={config}
                  input={input}
                  setInput={setInput}
                  handleSendMessage={handleSendMessage}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


