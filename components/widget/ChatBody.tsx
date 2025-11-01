"use client"

import { useState } from "react"
import { X } from "lucide-react"
import type { UIConfigInput } from "@/types/customization"
import type { Message } from "@/components/widget/helpers/chat-message"
import { ChatMessage } from "@/components/widget/helpers/chat-message"
import { Button } from "@/components/ui/button"
import { TypingIndicator } from "@/components/widget/helpers/typing-indicator"
import { PromptSuggestions } from "@/components/widget/helpers/prompt-suggestions"
import { MessageActions } from "@/components/widget/helpers/message-actions"
import { useAutoScroll } from "@/hooks/use-auto-scroll"
import { cn } from "@/lib/utils"

interface ChatBodyProps {
  config: UIConfigInput
  messages: Message[]
  isTyping: boolean
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

export function ChatBody({
  config,
  messages,
  isTyping,
  handleSuggestionClick,
  handleRegenerate,
  handleRating,
}: ChatBodyProps) {
  const [dismissedNotice, setDismissedNotice] = useState(false)
  const hasUserMessages = messages.some((m) => m.role === "user")
  const showSuggestions = !hasUserMessages || config.keepShowingSuggested

  // Auto-scroll hook to automatically scroll to bottom when new messages arrive
  const { containerRef, handleScroll } = useAutoScroll([
    messages.length,
    isTyping,
  ])

  return (
    <div className="flex-1 relative overflow-hidden">
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-y-auto px-6 py-4 text-left"
      >
        <div className="space-y-4">
        {/* Dismissible Notice */}
        {config.dismissibleNoticeText && !dismissedNotice && (
          <div 
            className={cn(
              "relative p-4 rounded-lg border",
              config.appearance === "dark" 
                ? "bg-blue-950/50 border-blue-900" 
                : "bg-blue-50 border-blue-200"
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDismissedNotice(true)}
              className="absolute top-2 right-2 h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
            <div 
              className={cn(
                "pr-8 text-sm",
                config.appearance === "dark" ? "text-blue-200" : "text-blue-900"
              )}
              dangerouslySetInnerHTML={{ __html: config.dismissibleNoticeText }}
            />
          </div>
        )}

        {/* Messages with ChatMessage component for full markdown support */}
        {messages.map((message, index) => {
          const isBot = message.role === "assistant"
          const isLastBotMessage = 
            isBot && 
            (index === messages.length - 1 || 
            (index === messages.length - 2 && messages[messages.length - 1]?.role === "user"))

          return (
            <ChatMessage
              key={message.id}
              {...message}
              animation="slide"
              showTimeStamp={false}
              actions={
                isBot ? (
                  <MessageActions
                    messageId={message.id}
                    content={message.content}
                    appearance={config.appearance}
                    showFeedback={config.collectFeedback}
                    showRegenerate={config.allowRegenerate}
                    showCopy={true}
                    isLastBotMessage={isLastBotMessage}
                    onRating={handleRating}
                    onRegenerate={handleRegenerate}
                  />
                ) : undefined
              }
            />
          )
        })}

        {/* Typing Indicator */}
        {isTyping && <TypingIndicator />}

        {/* Starter Questions using PromptSuggestions component */}
        {showSuggestions && config.starterQuestions?.length > 0 && (
          <div className={cn(
            "pt-2",
            config.keepShowingSuggested && hasUserMessages && "scale-90 origin-top"
          )}>
            {!hasUserMessages ? (
              <PromptSuggestions
                label="How can I help you today?"
                suggestions={config.starterQuestions}
                append={(message) => handleSuggestionClick(message.content)}
              />
            ) : (
              // Smaller suggestions after conversation starts
              <div className="space-y-2">
                <p 
                  className={cn(
                    "text-xs font-medium text-center",
                    config.appearance === "dark" ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  Try asking:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {config.starterQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(question)}
                      className={cn(
                        "justify-start text-left h-auto py-2 px-3 text-xs whitespace-normal",
                        config.appearance === "dark"
                          ? "border-gray-700 hover:bg-gray-800"
                          : "border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
