"use client"

import { AnimatePresence, motion } from "framer-motion"
import { MessageCircle } from "lucide-react"
import type { UIConfigInput } from "@/types/customization"
import type { Message } from "@/components/widget/helpers/chat-message"
import { Card } from "@/components/ui/card"
import { ChatHeader } from "./ChatHeader"
import { ChatBody } from "./ChatBody"
import { ChatInput } from "./ChatInput"
import { cn, calculateDynamicHeight } from "@/lib/utils"

interface CornerWidgetProps {
  config: UIConfigInput
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  messages: Message[]
  input: string
  setInput: (input: string) => void
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

export function CornerWidget({
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
}: CornerWidgetProps) {
  const isLeft = config.alignChatButton === "left"

  return (
    <div className="fixed z-50" style={{ 
      [isLeft ? "left" : "right"]: "20px",
      bottom: "20px" 
    }}>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              "flex items-center gap-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 font-medium",
              config.showButtonText ? "px-6 py-4" : "p-4"
            )}
            style={{ backgroundColor: config.widgetBubbleColour }}
          >
            {config.widgeticon ? (
              <img 
                src={config.widgeticon} 
                alt="Chat" 
                className="w-8 h-8"
              />
            ) : (
              <MessageCircle className="w-6 h-6 text-white" />
            )}
            {config.showButtonText && config.buttonText && (
              <span className="text-white">{config.buttonText}</span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed"
            style={{
              [isLeft ? "left" : "right"]: "20px",
              bottom: "20px",
              width: config.chatWidth || "400px",
              maxWidth: "calc(100vw - 40px)",
              height: calculateDynamicHeight(config.chatHeight || "600px", messages.length),
              maxHeight: "calc(100vh - 40px)",
            }}
          >
            <Card 
              className={cn(
                "h-full flex flex-col shadow-2xl overflow-hidden",
                config.appearance === "dark" ? "bg-gray-900 border-gray-800" : "bg-white"
              )}
            >
              <ChatHeader 
                config={config}
                onClose={() => setIsOpen(false)}
              />
              
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
