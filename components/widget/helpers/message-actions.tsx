"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown, RotateCcw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { 
  PositiveFeedbackForm, 
  type PositiveFeedbackData,
  NegativeFeedbackForm,
  type NegativeFeedbackData
} from "./feedback-forms"
import { CopyButton } from "./copy-button"
import { cn } from "@/lib/utils"

interface MessageActionsProps {
  messageId: string
  content: string
  appearance?: "light" | "dark"
  showFeedback?: boolean
  showRegenerate?: boolean
  showCopy?: boolean
  isLastBotMessage?: boolean
  onRating?: (messageId: string, rating: "thumbs-up" | "thumbs-down", feedback?: PositiveFeedbackData | NegativeFeedbackData) => void
  onRegenerate?: () => void
}

export function MessageActions({
  messageId,
  content,
  appearance = "light",
  showFeedback = true,
  showRegenerate = false,
  showCopy = true,
  isLastBotMessage = false,
  onRating,
  onRegenerate,
}: MessageActionsProps) {
  const [activeRating, setActiveRating] = useState<"thumbs-up" | "thumbs-down" | null>(null)
  const [showThankYou, setShowThankYou] = useState(false)
  const [openPopover, setOpenPopover] = useState<"positive" | "negative" | null>(null)

  const handleQuickRating = (rating: "thumbs-up" | "thumbs-down") => {
    setActiveRating(rating)
    onRating?.(messageId, rating)
    
    // Show thank you message
    setShowThankYou(true)
    setTimeout(() => setShowThankYou(false), 2000)
  }

  const handleFeedbackSubmit = (
    rating: "thumbs-up" | "thumbs-down",
    feedback: PositiveFeedbackData | NegativeFeedbackData
  ) => {
    setActiveRating(rating)
    onRating?.(messageId, rating, feedback)
    setOpenPopover(null)
    
    // Show thank you message
    setShowThankYou(true)
    setTimeout(() => setShowThankYou(false), 2000)
  }

  return (
    <div className="flex items-center gap-1 mt-2">
      {/* Thumbs Up - Positive Feedback */}
      {showFeedback && (
        <Popover 
          open={openPopover === "positive"} 
          onOpenChange={(open) => setOpenPopover(open ? "positive" : null)}
        >
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 relative",
                activeRating === "thumbs-up" && "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              )}
              onClick={() => {
                if (activeRating !== "thumbs-up") {
                  setOpenPopover("positive")
                }
              }}
            >
              {showThankYou && activeRating === "thumbs-up" ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <ThumbsUp className={cn(
                  "h-3.5 w-3.5",
                  activeRating === "thumbs-up" && "fill-current"
                )} />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            align="start" 
            className={cn(
              "w-80",
              appearance === "dark" ? "bg-gray-800 border-gray-700" : "bg-white"
            )}
          >
            <div className="space-y-3">
              <div>
                <h4 className={cn(
                  "text-sm font-semibold",
                  appearance === "dark" ? "text-gray-100" : "text-gray-900"
                )}>
                  Glad this was helpful!
                </h4>
                <p className={cn(
                  "text-xs mt-1",
                  appearance === "dark" ? "text-gray-400" : "text-gray-600"
                )}>
                  Help us improve by sharing more details (optional)
                </p>
              </div>
              
              <PositiveFeedbackForm
                appearance={appearance}
                onSubmit={(data) => handleFeedbackSubmit("thumbs-up", data)}
                onCancel={() => {
                  handleQuickRating("thumbs-up")
                  setOpenPopover(null)
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Thumbs Down - Negative Feedback */}
      {showFeedback && (
        <Popover 
          open={openPopover === "negative"} 
          onOpenChange={(open) => setOpenPopover(open ? "negative" : null)}
        >
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 relative",
                activeRating === "thumbs-down" && "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
              )}
              onClick={() => {
                if (activeRating !== "thumbs-down") {
                  setOpenPopover("negative")
                }
              }}
            >
              {showThankYou && activeRating === "thumbs-down" ? (
                <Check className="h-3.5 w-3.5 text-red-600" />
              ) : (
                <ThumbsDown className={cn(
                  "h-3.5 w-3.5",
                  activeRating === "thumbs-down" && "fill-current"
                )} />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            align="start" 
            className={cn(
              "w-80",
              appearance === "dark" ? "bg-gray-800 border-gray-700" : "bg-white"
            )}
          >
            <div className="space-y-3">
              <div>
                <h4 className={cn(
                  "text-sm font-semibold",
                  appearance === "dark" ? "text-gray-100" : "text-gray-900"
                )}>
                  Sorry this wasn't helpful
                </h4>
                <p className={cn(
                  "text-xs mt-1",
                  appearance === "dark" ? "text-gray-400" : "text-gray-600"
                )}>
                  Tell us what went wrong so we can improve
                </p>
              </div>
              
              <NegativeFeedbackForm
                appearance={appearance}
                onSubmit={(data) => handleFeedbackSubmit("thumbs-down", data)}
                onCancel={() => {
                  handleQuickRating("thumbs-down")
                  setOpenPopover(null)
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Copy Button */}
      {showCopy && (
        <CopyButton 
          content={content}
        />
      )}

      {/* Regenerate Button - Only show for last bot message */}
      {showRegenerate && isLastBotMessage && onRegenerate && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={onRegenerate}
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Regenerate
        </Button>
      )}
    </div>
  )
}
