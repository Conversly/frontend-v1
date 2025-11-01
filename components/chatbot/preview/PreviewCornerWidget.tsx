"use client"

import type { CSSProperties, ReactElement } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Bot, BrainCircuit, HelpCircle, MessageCircle, MessageSquare } from "lucide-react"

import { Card } from "@/components/ui/card"
import { ChatBody } from "@/components/widget/ChatBody"
import { ChatHeader } from "@/components/widget/ChatHeader"
import { ChatInput } from "@/components/widget/ChatInput"
import type { Message } from "@/components/widget/helpers/chat-message"
import { cn } from "@/lib/utils"
import type { UIConfigInput } from "@/types/customization"

interface PreviewCornerWidgetProps {
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

export function PreviewCornerWidget({
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
}: PreviewCornerWidgetProps) {
  const buttonAlignment = (config as UIConfigInput & { buttonAlignment?: "left" | "right" })
    .buttonAlignment
  const alignment = buttonAlignment ?? config.alignChatButton ?? "right"
  const isLeft = alignment === "left"

  const alignmentStyle: CSSProperties = isLeft ? { left: "16px" } : { right: "16px" }
  const bubbleColor = config.widgetBubbleColour || config.primaryColor
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
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              "absolute flex items-center gap-2 rounded-full shadow-lg px-4 py-3 font-medium text-white",
              config.showButtonText ? "px-5" : "px-4"
            )}
            style={{
              ...alignmentStyle,
              bottom: "16px",
              backgroundColor: bubbleColor,
            }}
          >
            {resolveWidgetIcon("h-6 w-6")}
            {config.showButtonText && buttonLabel && (
              <span>{buttonLabel}</span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="absolute flex flex-col"
            style={{
              ...alignmentStyle,
              bottom: "16px",
              width: config.chatWidth || "380px",
              maxWidth: "calc(100% - 32px)",
              height: config.chatHeight || "520px",
              maxHeight: "calc(100% - 32px)",
            }}
          >
            <Card
              className={cn(
                "flex h-full flex-col overflow-hidden shadow-2xl",
                config.appearance === "dark"
                  ? "border border-gray-800 bg-gray-950"
                  : "border border-gray-200 bg-white"
              )}
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
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


