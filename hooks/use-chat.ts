import { useEffect, useRef, useState } from "react"

type Role = "user" | "assistant" | "system"

export type ChatMessage = {
  id: string
  role: Role
  content: string
}

type Status = "idle" | "submitted" | "streaming"

// Minimal, safe dummy useChat hook so the app can run locally.
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", content: "Hello — this is a dummy chat. Start typing below." },
  ])

  const [input, setInput] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
  }

  // Accept either a minimal user message shape (used by PromptSuggestions)
  // or a full ChatMessage with an id.
  function append(message: { role: "user"; content: string } | ChatMessage) {
    const toAppend: ChatMessage =
      "id" in message
        ? message
        : {
            id: String(Date.now()) + Math.random().toString(36).slice(2),
            role: message.role,
            content: message.content,
          }

    setMessages((s) => [...s, toAppend])
  }

  function stop() {
    setStatus("idle")
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  function handleSubmit(
    event?: { preventDefault?: () => void },
    options?: { experimental_attachments?: FileList }
  ) {
    if (event?.preventDefault) event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return

    const userMessage: ChatMessage = {
      id: String(Date.now()) + Math.random().toString(36).slice(2),
      role: "user",
      content: trimmed,
    }

    setMessages((s) => [...s, userMessage])
    setInput("")
    setStatus("submitted")

    // simulate a short streaming response
    timeoutRef.current = window.setTimeout(() => {
      setStatus("streaming")
      const assistantMessage: ChatMessage = {
        id: String(Date.now() + 1) + Math.random().toString(36).slice(2),
        role: "assistant",
        content: "(dummy reply) " + userMessage.content,
      }
      setMessages((s) => [...s, assistantMessage])
      setStatus("idle")
      timeoutRef.current = null
    }, 600)
  }

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    status,
    stop,
  }
}
