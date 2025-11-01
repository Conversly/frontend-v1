import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Calculate dynamic chat height based on message count
 * Increases height by 15% when message count reaches threshold
 * @param baseHeight - Base height string (e.g., "600px")
 * @param messageCount - Current number of messages
 * @param threshold - Message count threshold to trigger expansion (default: 3)
 * @returns Calculated height string
 */
export function calculateDynamicHeight(
  baseHeight: string,
  messageCount: number,
  threshold: number = 3
): string {
  if (messageCount < threshold) {
    return baseHeight
  }

  // Parse the height value and unit
  const match = baseHeight.match(/^(\d+(?:\.\d+)?)(px|rem|em|vh|%)$/)
  if (!match) {
    return baseHeight // Return original if format is unexpected
  }

  const [, value, unit] = match
  const numericValue = parseFloat(value)
  const increasedValue = numericValue * 1.15 // 15% increase

  return `${increasedValue}${unit}`
}
