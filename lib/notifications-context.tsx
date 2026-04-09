"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"

// ─────────────────────────────────────────────────────────────────────────────
// Notification types & context
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationType = "info" | "success" | "warning" | "event"

export interface AppNotification {
  id: string
  title: string
  body: string
  time: number   // Unix ms
  read: boolean
  type: NotificationType
}

interface NotificationsState {
  notifications: AppNotification[]
  unreadCount: number
  addNotification: (n: Omit<AppNotification, "id" | "time" | "read">) => void
  markAllRead: () => void
  clearAll: () => void
}

const NotificationsContext = createContext<NotificationsState>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAllRead: () => {},
  clearAll: () => {},
})

const STORAGE_KEY = "cloudos_notifications"

function load(): AppNotification[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
  } catch { return [] }
}

function save(notifications: AppNotification[]) {
  try {
    // Keep only latest 30
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 30)))
  } catch {}
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    setNotifications(load())
  }, [])

  const persist = useCallback((notifs: AppNotification[]) => {
    setNotifications(notifs)
    save(notifs)
  }, [])

  const addNotification = useCallback((n: Omit<AppNotification, "id" | "time" | "read">) => {
    const newNotif: AppNotification = {
      ...n,
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      time: Date.now(),
      read: false,
    }
    setNotifications((prev) => {
      const updated = [newNotif, ...prev].slice(0, 30)
      save(updated)
      return updated
    })
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }))
      save(updated)
      return updated
    })
  }, [])

  const clearAll = useCallback(() => persist([]), [persist])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, addNotification, markAllRead, clearAll }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationsContext)
}
