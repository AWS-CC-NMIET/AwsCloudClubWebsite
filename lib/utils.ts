import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely sanitizes an external URL to prevent DOM XSS and script execution.
 * Only allows http:, https:, and mailto: protocols.
 */
export function sanitizeUrl(url?: string | null, fallback: string = "#"): string {
  if (!url) return fallback
  const trimmed = url.trim()
  if (!trimmed) return fallback

  // Allow relative URLs starting with / (excluding // which is protocol-relative)
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed
  }

  // Allow only http, https, and mailto schemes
  try {
    const parsed = new URL(trimmed)
    if (["http:", "https:", "mailto:"].includes(parsed.protocol)) {
      return trimmed
    }
  } catch {
    // If not a full URL, but doesn't contain a colon (no custom scheme), prepend https://
    if (!trimmed.includes(":")) {
      return `https://${trimmed}`
    }
  }

  return fallback
}

/**
 * In-memory fallback for environments where localStorage is blocked or throws
 * (e.g. Private/Incognito browsing mode with strict partitioning, quota exhaustion).
 */
const memoryStorage: Record<string, string> = {}

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key)
      }
    } catch {
      // Fall through to memory storage
    }
    return memoryStorage[key] ?? null
  },

  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value)
        return true
      }
    } catch {
      // Fall through to memory storage
    }
    memoryStorage[key] = value
    return true
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key)
      }
    } catch {
      // Ignore
    }
    delete memoryStorage[key]
  },
}
