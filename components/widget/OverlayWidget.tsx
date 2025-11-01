"use client"

import { MessageCircle } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import type { UIConfigInput } from "@/types/customization"
import type { Message } from "@/components/widget/helpers/chat-message"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChatHeader } from "./ChatHeader"
import { ChatBody } from "./ChatBody"
import { ChatInput } from "./ChatInput"
import { cn, calculateDynamicHeight } from "@/lib/utils"

interface OverlayWidgetProps {
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

export function OverlayWidget({
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
}: OverlayWidgetProps) {
  const isLeft = config.alignChatButton === "left"

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              "fixed z-50 flex items-center gap-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 font-medium",
              config.showButtonText ? "px-6 py-4" : "p-4"
            )}
            style={{ 
              [isLeft ? "left" : "right"]: "20px",
              bottom: "20px",
              backgroundColor: config.widgetBubbleColour 
            }}
          >
            {config.widgeticon ? (
              <img 
                src={config.widgeticon} 
                alt="Chat" 
                className="w-6 h-6"
              />
            ) : (
              <MessageCircle className="w-8 h-8 text-white" />
            )}
            {config.showButtonText && config.buttonText && (
              <span className="text-white">{config.buttonText}</span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Dialog Overlay */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          showCloseButton={false}
          className={cn(
            "p-0 gap-0 max-w-none overflow-hidden",
            config.appearance === "dark" ? "bg-gray-900 border-gray-800" : "bg-white"
          )}
          style={{
            width: config.chatWidth || "1800px",
            maxWidth: "calc(100vw - 2rem)",
            height: calculateDynamicHeight(config.chatHeight || "700px", messages.length),
            maxHeight: "calc(100vh - 2rem)",
          }}
        >
          <DialogTitle className="sr-only">{config.DisplayName || "Chat"}</DialogTitle>
          <div className="h-full flex flex-col">
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
