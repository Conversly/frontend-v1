"use client"

import { X } from "lucide-react"
import type { UIConfigInput } from "@/types/customization"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ChatHeaderProps {
  config: UIConfigInput
  onClose: () => void
}

export function ChatHeader({ config, onClose }: ChatHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-6 py-2 border-b",
        config.appearance === "dark" ? "border-gray-800" : "border-gray-200"
      )}
      style={{ backgroundColor: config.primaryColor }}
    >
      <div className="flex items-center gap-3">
        {config.PrimaryIcon && (
          <img 
            src={config.PrimaryIcon} 
            alt={config.DisplayName}
            className="w-14 h-14 rounded-full"
          />
        )}
        <h2 className="text-lg font-semibold text-white">
          {config.DisplayName}
        </h2>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="text-white hover:bg-white/20 h-8 w-8"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  )
}
