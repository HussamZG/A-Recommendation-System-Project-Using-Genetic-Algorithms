// دوال مساعدة عامة: cn تدمج clsx مع tailwind-merge لدمج وفصل فئات Tailwind دون تضاربات
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
