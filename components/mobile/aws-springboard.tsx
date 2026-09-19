// components/mobile/aws-springboard.tsx
// iOS SpringBoard with status bar, squircle app grid, and floating dock

"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wifi, Battery, Signal, Search } from "lucide-react"
import {
  useWindowStore,
  useSystemStore,
  windowActions,
  selectFocusedApp,
} from "@/lib/aws-store"
import {
  APPS_META,
  SPRINGBOARD_GRID,
  SPRINGBOARD_DOCK,
  type AppId,
} from "@/lib/aws-apps"
import { WALLPAPER_STYLES } from "@/lib/aws-store"
import { AppIcon } from "@/components/os/app-icon"
import { AppSheet } from "./aws-sheet"
import { AppErrorBoundary } from "@/components/app-error-boundary"

export function SpringBoard({
  renderAppContent,
}: {
  renderAppContent: (appId: AppId) => React.ReactNode
}) {
  const [currentTime, setCurrentTime] = useState("")
  const [touchOrigin, setTouchOrigin] = useState<{ x: number; y: number } | null>(null)
  const [searchFilter, setSearchFilter] = useState("")

  const windows = useWindowStore(s => s.windows)
  const zOrder = useWindowStore(s => s.zOrder)
  const activeAppId = selectFocusedApp({ windows, zOrder })
  const appearance = useSystemStore(s => s.appearance)
  const wallpaper = useSystemStore(s => s.wallpaper)

  const activeGradient =
    WALLPAPER_STYLES[wallpaper]?.[appearance] || WALLPAPER_STYLES.dynamic.dark

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleOpenApp = (id: AppId, rect?: DOMRect) => {
    if (rect) {
      setTouchOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      })
    } else {
      setTouchOrigin(null)
    }
    windowActions.open(id)
  }

  const filteredGrid = SPRINGBOARD_GRID.filter(id => {
    if (!searchFilter.trim()) return true
    const meta = APPS_META[id]
    const q = searchFilter.toLowerCase()
    return (
      meta.name.toLowerCase().includes(q) ||
      meta.spotlight.keywords.some(k => k.toLowerCase().includes(q))
    )
  })

  return (
    <div
      className="wallpaper fixed inset-0 flex flex-col overflow-hidden select-none"
      data-wallpaper={wallpaper}
      style={{
        background: activeGradient,
        transition: "background 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* ── Top iOS Status Bar ────────────────────────────────────────────────── */}
      <div className="flex h-11 shrink-0 items-center justify-between px-6 pt-2 text-white z-50">
        <span className="text-sm font-semibold tracking-tight [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
          {currentTime}
        </span>

        {/* Dynamic Island / Notch Pill */}
        <div className="h-5 w-24 rounded-full bg-black/80 backdrop-blur-md flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-emerald-500/80 mr-2 animate-pulse" />
          <span className="text-[10px] font-mono text-white/70">AWS SBG</span>
        </div>

        <div className="flex items-center gap-1.5 [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
          <Signal className="size-3.5" />
          <Wifi className="size-3.5" />
          <Battery className="size-4" />
        </div>
      </div>

      {/* ── Search Bar ───────────────────────────────────────────────────────── */}
      <div className="px-5 pt-3 pb-1">
        <div className="flex items-center gap-2 rounded-xl bg-white/20 px-3 py-2 text-white placeholder:text-white/60 backdrop-blur-xl border border-white/20 shadow-sm">
          <Search className="size-4 opacity-75" />
          <input
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            placeholder="Search AWS SBG NMIET..."
            className="w-full bg-transparent text-sm text-white placeholder:text-white/65 outline-none"
          />
        </div>
      </div>

      {/* ── 4-Column SpringBoard App Icon Grid ───────────────────────────────── */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-2">
        <div className="grid grid-cols-4 gap-x-4 gap-y-6 content-start">
          {filteredGrid.map(appId => (
            <SpringBoardItem
              key={appId}
              id={appId}
              onOpen={rect => handleOpenApp(appId, rect)}
            />
          ))}
        </div>
      </div>

      {/* ── Bottom iOS Floating Dock ─────────────────────────────────────────── */}
      <div className="mt-auto px-4 pb-6 pt-2">
        <div className="flex items-center justify-around rounded-[28px] bg-white/30 px-3 py-3 backdrop-blur-2xl dark:bg-white/15 border border-white/25 shadow-2xl">
          {SPRINGBOARD_DOCK.map(appId => (
            <SpringBoardItem
              key={appId}
              id={appId}
              hideLabel
              onOpen={rect => handleOpenApp(appId, rect)}
            />
          ))}
        </div>

        {/* Bottom Home Bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-36 rounded-full bg-white/40" />
        </div>
      </div>

      {/* ── Full-Screen Native App Sheet ─────────────────────────────────────── */}
      <AnimatePresence>
        {activeAppId && (
          <AppSheet
            id={activeAppId}
            origin={touchOrigin}
            onClose={() => windowActions.close(activeAppId)}
          >
            <AppErrorBoundary>
              {renderAppContent(activeAppId)}
            </AppErrorBoundary>
          </AppSheet>
        )}
      </AnimatePresence>
    </div>
  )
}

function SpringBoardItem({
  id,
  hideLabel = false,
  onOpen,
}: {
  id: AppId
  hideLabel?: boolean
  onOpen: (rect?: DOMRect) => void
}) {
  const itemRef = useRef<HTMLButtonElement>(null)
  const meta = APPS_META[id]

  return (
    <motion.button
      ref={itemRef}
      onClick={() => onOpen(itemRef.current?.getBoundingClientRect())}
      whileTap={{ scale: 0.88, opacity: 0.7 }}
      className="flex flex-col items-center gap-1.5 outline-none select-none"
      aria-label={`Open ${meta?.name || id}`}
    >
      <div className="size-[58px] shrink-0 filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.35)]">
        <AppIcon id={id} size={58} />
      </div>

      {!hideLabel && (
        <span className="max-w-[72px] truncate text-[11px] font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.85)] tracking-tight">
          {meta?.springboardLabel || meta?.name || id}
        </span>
      )}
    </motion.button>
  )
}
