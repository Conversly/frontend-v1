"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface PositiveFeedbackData {
  issue: string
}

interface PositiveFeedbackFormProps {
  onSubmit: (data: PositiveFeedbackData) => void
  onCancel?: () => void
  appearance?: "light" | "dark"
}

export function PositiveFeedbackForm({ 
  onSubmit, 
  onCancel,
  appearance = "light" 
}: PositiveFeedbackFormProps) {
  const [issue, setIssue] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ issue })
    setIssue("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="positive-feedback" className={cn(
          "text-xs mb-1.5 block",
          appearance === "dark" ? "text-gray-300" : "text-gray-700"
        )}>
          What did you like? (optional)
        </Label>
        <Input
          id="positive-feedback"
          type="text"
          placeholder="Tell us what worked well..."
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          className={cn(
            "text-xs h-8",
            appearance === "dark" 
              ? "bg-gray-800 border-gray-700" 
              : "bg-white border-gray-200"
          )}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-7 text-xs"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          className="h-7 text-xs"
        >
          Submit
        </Button>
      </div>
    </form>
  )
}

export interface NegativeFeedbackData {
  issue: string
  incorrect: boolean
  irrelevant: boolean
  unaddressed: boolean
}

interface NegativeFeedbackFormProps {
  onSubmit: (data: NegativeFeedbackData) => void
  onCancel?: () => void
  appearance?: "light" | "dark"
}

export function NegativeFeedbackForm({ 
  onSubmit, 
  onCancel,
  appearance = "light" 
}: NegativeFeedbackFormProps) {
  const [issue, setIssue] = useState("")
  const [incorrect, setIncorrect] = useState(false)
  const [irrelevant, setIrrelevant] = useState(false)
  const [unaddressed, setUnaddressed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ issue, incorrect, irrelevant, unaddressed })
    // Reset form
    setIssue("")
    setIncorrect(false)
    setIrrelevant(false)
    setUnaddressed(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="negative-feedback" className={cn(
          "text-xs mb-1.5 block",
          appearance === "dark" ? "text-gray-300" : "text-gray-700"
        )}>
          What went wrong? (optional)
        </Label>
        <Input
          id="negative-feedback"
          type="text"
          placeholder="Tell us what could be better..."
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          className={cn(
            "text-xs h-8",
            appearance === "dark" 
              ? "bg-gray-800 border-gray-700" 
              : "bg-white border-gray-200"
          )}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="incorrect"
            checked={incorrect}
            onCheckedChange={(checked: boolean) => setIncorrect(checked === true)}
          />
          <Label
            htmlFor="incorrect"
            className={cn(
              "text-xs cursor-pointer",
              appearance === "dark" ? "text-gray-300" : "text-gray-700"
            )}
          >
            Incorrect information
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="irrelevant"
            checked={irrelevant}
            onCheckedChange={(checked: boolean) => setIrrelevant(checked === true)}
          />
          <Label
            htmlFor="irrelevant"
            className={cn(
              "text-xs cursor-pointer",
              appearance === "dark" ? "text-gray-300" : "text-gray-700"
            )}
          >
            Irrelevant response
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="unaddressed"
            checked={unaddressed}
            onCheckedChange={(checked: boolean) => setUnaddressed(checked === true)}
          />
          <Label
            htmlFor="unaddressed"
            className={cn(
              "text-xs cursor-pointer",
              appearance === "dark" ? "text-gray-300" : "text-gray-700"
            )}
          >
            Question not fully addressed
          </Label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-7 text-xs"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          className="h-7 text-xs"
        >
          Submit
        </Button>
      </div>
    </form>
  )
}
