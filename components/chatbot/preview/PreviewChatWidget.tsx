"use client"

import { useEffect, useRef, useState } from "react"

import type { Message } from "@/components/widget/helpers/chat-message"
import { PreviewCornerWidget } from "@/components/chatbot/preview/PreviewCornerWidget"
import { PreviewOverlayWidget } from "@/components/chatbot/preview/PreviewOverlayWidget"
import { cn } from "@/lib/utils"
import type { UIConfigInput } from "@/types/customization"

interface PreviewChatWidgetProps {
  config: UIConfigInput
}

export function PreviewChatWidget({ config }: PreviewChatWidgetProps) {
  const [isOpen, setIsOpen] = useState<boolean>(config.autoShowInitial ?? true)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoShowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const initialMessages: Message[] = config.InitialMessage
      ? [
          {
            id: "preview-initial",
            role: "assistant",
            content: config.InitialMessage,
            createdAt: new Date(),
          },
        ]
      : []

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }

    setMessages(initialMessages)
    setInput("")
    setIsTyping(false)
  }, [config.InitialMessage])

  useEffect(() => {
    if (autoShowTimeoutRef.current) {
      clearTimeout(autoShowTimeoutRef.current)
      autoShowTimeoutRef.current = null
    }

    if (!config.widgetEnabled) {
      setIsOpen(false)
      return
    }

    if (!config.autoShowInitial) {
      setIsOpen(false)
      return
    }

    const delay = Math.max(0, config.autoShowDelaySec ?? 0)

    if (delay > 0) {
      setIsOpen(false)
      autoShowTimeoutRef.current = setTimeout(() => {
        setIsOpen(true)
        autoShowTimeoutRef.current = null
      }, delay * 1000)
    } else {
      setIsOpen(true)
    }

    return () => {
      if (autoShowTimeoutRef.current) {
        clearTimeout(autoShowTimeoutRef.current)
        autoShowTimeoutRef.current = null
      }
    }
  }, [config.autoShowInitial, config.autoShowDelaySec, config.widgetEnabled])

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (autoShowTimeoutRef.current) {
        clearTimeout(autoShowTimeoutRef.current)
      }
    }
  }, [])

  const scheduleAssistantPreview = (prompt: string, variant: "default" | "regenerate" = "default") => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: `preview-assistant-${Date.now()}`,
          role: "assistant",
          content:
            variant === "regenerate"
              ? `Here is another way ${config.DisplayName || "the assistant"} might respond to that question.`
              : `This is a preview of how ${config.DisplayName || "the assistant"} could reply to “${prompt}”.`,
          createdAt: new Date(),
        },
      ])
    }, 600)
  }

  const handleSendMessage = (content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return

    const userMessage: Message = {
      id: `preview-user-${Date.now()}`,
      role: "user",
      content: trimmed,
      createdAt: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    scheduleAssistantPreview(trimmed, "default")
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  const handleRegenerate = () => {
    const lastUserMessage = [...messages].reverse().find((message) => message.role === "user")
    if (!lastUserMessage) return

    setIsTyping(true)
    scheduleAssistantPreview(lastUserMessage.content, "regenerate")
  }

  const handleRating = (
    messageId: string,
    rating: "thumbs-up" | "thumbs-down",
    feedback?: {
      issue?: string
      incorrect?: boolean
      irrelevant?: boolean
      unaddressed?: boolean
    }
  ) => {
    console.debug("Preview rating", { messageId, rating, feedback })
  }

  const widgetProps = {
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
  }

  return (
    <div
      className={cn(
        "relative h-[640px] w-full max-w-[580px] overflow-hidden rounded-2xl border shadow-lg",
        config.appearance === "dark" ? "border-gray-800 bg-gray-950" : "border-gray-200 bg-white"
      )}
    >
      <div className="absolute inset-0">
        {config.displayStyle === "overlay" ? (
          <PreviewOverlayWidget {...widgetProps} />
        ) : (
          <PreviewCornerWidget {...widgetProps} />
        )}
      </div>

      {!config.widgetEnabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 p-6 text-center dark:bg-black/60">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Chat widget is disabled</p>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Enable it from settings to see the live preview here.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}


