import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function merge(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getContrastTextColor(hexColor: string): "light" | "dark" {
  const hex = hexColor.replace("#", "");

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance > 150 ? "dark" : "light";
}
