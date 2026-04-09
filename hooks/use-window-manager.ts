"use client"

import { useState, useCallback, useEffect } from "react"
import type { AppId, WindowState } from "@/lib/types"

// ─────────────────────────────────────────────────────────────────────────────
// useWindowManager
//
// Encapsulates all window-management state so Desktop and future components
// can share it without prop-drilling.
// ─────────────────────────────────────────────────────────────────────────────

interface UseWindowManagerReturn {
  windows: WindowState[]
  isMobileDesktop: boolean
  openApp: (id: AppId) => void
  closeApp: (id: AppId) => void
  minimizeApp: (id: AppId) => void
  maximizeApp: (id: AppId) => void
  focusApp: (id: AppId) => void
  getActiveApp: () => AppId | null
}

export function useWindowManager(): UseWindowManagerReturn {
  const [windows, setWindows] = useState<WindowState[]>([
    { id: "home", isMinimized: false, isMaximized: false, zIndex: 60 },
  ])
  const [highestZIndex, setHighestZIndex] = useState(60)

  // Sync mobile detection — no hydration flash
  const [isMobileDesktop, setIsMobileDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  )
  useEffect(() => {
    const check = () => setIsMobileDesktop(window.innerWidth < 768)
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const openApp = useCallback((appId: AppId) => {
    // Mobile: tapping "Home" = minimize all windows → shows the homepage background
    if (isMobileDesktop && appId === "home") {
      setWindows((prev) => prev.map((w) => ({ ...w, isMinimized: true })))
      return
    }

    setWindows((prev) => {
      const existing = prev.find((w) => w.id === appId)
      if (existing) {
        if (existing.isMinimized) {
          setHighestZIndex((z) => z + 1)
          return prev.map((w) =>
            w.id === appId ? { ...w, isMinimized: false, zIndex: highestZIndex + 1 } : w
          )
        }
        setHighestZIndex((z) => z + 1)
        return prev.map((w) =>
          w.id === appId ? { ...w, zIndex: highestZIndex + 1 } : w
        )
      }
      setHighestZIndex((z) => z + 1)
      return [...prev, { id: appId, isMinimized: false, isMaximized: false, zIndex: highestZIndex + 1 }]
    })
  }, [highestZIndex, isMobileDesktop])

  const closeApp = useCallback((id: AppId) =>
    setWindows((p) => p.filter((w) => w.id !== id)), [])

  const minimizeApp = useCallback((id: AppId) =>
    setWindows((p) => p.map((w) => w.id === id ? { ...w, isMinimized: true } : w)), [])

  const maximizeApp = useCallback((id: AppId) =>
    setWindows((p) => p.map((w) => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)), [])

  const focusApp = useCallback((id: AppId) => {
    setHighestZIndex((z) => z + 1)
    setWindows((p) => p.map((w) => w.id === id ? { ...w, zIndex: highestZIndex + 1 } : w))
  }, [highestZIndex])

  const getActiveApp = useCallback((): AppId | null => {
    const visible = windows.filter((w) => !w.isMinimized)
    if (!visible.length) return null
    return visible.reduce((a, b) => (a.zIndex > b.zIndex ? a : b)).id
  }, [windows])

  return {
    windows,
    isMobileDesktop,
    openApp,
    closeApp,
    minimizeApp,
    maximizeApp,
    focusApp,
    getActiveApp,
  }
}
