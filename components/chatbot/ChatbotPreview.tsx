"use client"

import { Bot, Send, RefreshCw, ThumbsDown, ThumbsUp, AlertCircle } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface ChatbotPreviewProps {
  color: string
  selectedIcon: React.ReactNode
  buttonAlignment: "left" | "right"
  showButtonText: boolean
  buttonText: string
  welcomeMessage: string
  displayStyle: "corner" | "overlay"
  customIcon: string | null
  starterQuestions: string[]
  HeaderText: string
  
  inputPlaceholder?: string
  initialMessages?: string[]
  keepShowingSuggested?: boolean
  collectFeedback?: boolean
  allowRegenerate?: boolean
  dismissibleNoticeText?: string
  footerText?: string
  autoShowInitial?: boolean
  autoShowDelaySec?: number
  widgetEnabled?: boolean
}

export function ChatbotPreview({
  color,
  selectedIcon,
  buttonAlignment,
  showButtonText,
  buttonText,
  welcomeMessage,
  displayStyle,
  customIcon,
  starterQuestions,
  HeaderText,
  inputPlaceholder = "Type your message...",
  initialMessages = [],
  keepShowingSuggested = false,
  collectFeedback = true,
  allowRegenerate = true,
  dismissibleNoticeText = "",
  footerText = "",
  autoShowInitial = true,
  autoShowDelaySec = 3,
  widgetEnabled = true,
}: ChatbotPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [messages, setMessages] = useState<{ role: "user" | "bot"; content: string }[]>([])
  const [hasUserMessaged, setHasUserMessaged] = useState(false)
  const hasAutoShownRef = useRef(false)

  // Auto show initial messages after a delay
  useEffect(() => {
    if (!isExpanded) return
    if (!autoShowInitial) return
    if (hasAutoShownRef.current) return
    if (!initialMessages || initialMessages.length === 0) return

    const t = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        ...initialMessages.filter((m) => m.trim()).map((m) => ({ role: "bot" as const, content: m })),
      ])
      hasAutoShownRef.current = true
    }, Math.max(0, autoShowDelaySec) * 1000)

    return () => clearTimeout(t)
  }, [isExpanded, autoShowInitial, autoShowDelaySec, initialMessages])

  const handleStarterQuestionClick = (question: string) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", content: question },
      { role: "bot", content: "This is a sample response to your question." },
    ])
    setHasUserMessaged(true)
  }

  const IconComponent = () =>
    customIcon ? (
      <img src={customIcon || "/placeholder.svg"} alt="Custom icon" className="w-8 h-8" />
    ) : (
      selectedIcon
    )

  const HeaderIconComponent = () =>
    customIcon ? (
      <img src={customIcon || "/placeholder.svg"} alt="Custom icon" className="w-10 h-10" />
    ) : (
      selectedIcon
    )

  return (
    <div
      className={`w-[450px] h-[600px] border rounded-xl bg-white dark:bg-gray-800 overflow-hidden relative ${displayStyle}`}
    >
      {/* Chat Window */}
      {isExpanded && (
        <div className="relative h-full">
          {/* Header */}
          <div className="p-4 flex items-center justify-between" style={{ backgroundColor: color }}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-full">
                <HeaderIconComponent />
              </div>
              <h3 className="font-medium text-white">{HeaderText}</h3>
            </div>
            <button onClick={() => setIsExpanded(false)} className="text-white/80 hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Chat Area */}
          <div className="h-[460px] overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {/* Dismissible Notice */}
            {!!dismissibleNoticeText && !hasUserMessaged && (
              <div className="rounded-lg border bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200 border-amber-200 dark:border-amber-700 p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <div className="text-sm whitespace-pre-wrap">{dismissibleNoticeText}</div>
              </div>
            )}
            {/* Starter Questions (Improved UI) */}
            {starterQuestions.filter((q) => q.trim()).length > 0 && (!hasUserMessaged || keepShowingSuggested) && (
              <div className="p-3 mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm">
                <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Suggested Questions:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {starterQuestions
                    .filter((q) => q.trim())
                    .map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleStarterQuestionClick(question)}
                        className="px-3 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-full transition transform hover:scale-105 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        {question}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Bot Welcome Message */}
            <div className="flex gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: color }}
              >
                <IconComponent />
              </div>
              <div className="max-w-[80%]">
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none p-3 shadow-sm">
                  <p className="text-sm">{welcomeMessage}</p>
                </div>
                {collectFeedback && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>Was this helpful?</span>
                    <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Thumbs up">
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Thumbs down">
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
              >
                {message.role === "bot" && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    <IconComponent />
                  </div>
                )}
                <div className="max-w-[80%]">
                  <div
                    className={`rounded-2xl p-3 ${
                      message.role === "user"
                        ? "rounded-tr-none text-white"
                        : "rounded-tl-none bg-white dark:bg-gray-800 shadow-sm"
                    }`}
                    style={message.role === "user" ? { backgroundColor: color } : {}}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  {message.role === "bot" && collectFeedback && (
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>Feedback:</span>
                      <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Thumbs up">
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Thumbs down">
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {allowRegenerate && message.role === "bot" && index === messages.length - 1 && (
                    <div className="mt-2">
                      <button
                        className="inline-flex items-center gap-2 px-2 py-1 text-xs rounded-md border bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() =>
                          setMessages((prev) => [
                            ...prev,
                            { role: "bot", content: "Here is an alternative response for preview purposes." },
                          ])
                        }
                      >
                        <RefreshCw className="w-3 h-3" /> Regenerate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-white dark:bg-gray-800">
            {/* Footer Content */}
            {footerText && (
              <div className="mb-2 text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{footerText}</div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={inputPlaceholder}
                className="flex-1 px-4 py-2 rounded-full border text-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                style={{ "--tw-ring-color": color } as React.CSSProperties}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    const value = (e.target as HTMLInputElement).value.trim()
                    if (value) {
                      setMessages((prev) => [...prev, { role: "user", content: value }])
                      setHasUserMessaged(true)
                      ;(e.target as HTMLInputElement).value = ""
                    }
                  }
                }}
              />
              <button className="p-2 rounded-full" style={{ backgroundColor: color }}
                onClick={() => {
                  const input = (document.activeElement as HTMLInputElement)
                  if (input && input.tagName === 'INPUT') {
                    const value = input.value.trim()
                    if (value) {
                      setMessages((prev) => [...prev, { role: "user", content: value }])
                      setHasUserMessaged(true)
                      input.value = ""
                    }
                  }
                }}
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={() => setIsExpanded(true)}
        className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-transform hover:scale-105 ${
          !isExpanded ? "absolute bottom-0" : "hidden"
        } ${buttonAlignment === "right" ? "right-0" : "left-0"}`}
        style={{ backgroundColor: color }}
      >
        <IconComponent />
        {showButtonText && <span className="text-white font-medium">{buttonText}</span>}
      </button>
      {/* Disabled overlay */}
      {!widgetEnabled && (
        <div className="absolute inset-0 bg-white/70 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center text-center p-6">
          <div className="text-gray-700 dark:text-gray-200">
            <p className="font-medium">Chat widget is disabled</p>
            <p className="text-sm opacity-80">Enable it from settings to see the live preview here.</p>
          </div>
        </div>
      )}
    </div>
  )
}
