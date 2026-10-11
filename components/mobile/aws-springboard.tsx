// components/mobile/aws-springboard.tsx
// iOS SpringBoard: status bar, search, app grid, dock and full-screen app sheets

"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Battery, Search, Signal, Wifi } from "lucide-react"
import { useWindowStore, useSystemStore, windowActions, selectFocusedApp, WALLPAPER_STYLES } from "@/lib/aws-store"
import { APPS_META, SPRINGBOARD_DOCK, SPRINGBOARD_GRID, windowTitleOf, type AppId } from "@/lib/aws-apps"
import { AppIcon } from "@/components/os/app-icon"
import { SystemToast } from "@/components/os/system-toast"
import { AppErrorBoundary } from "@/components/app-error-boundary"
import { AppSheet } from "./aws-sheet"

const ALL_APPS = [...SPRINGBOARD_DOCK, ...SPRINGBOARD_GRID]

export function SpringBoard({ renderAppContent }: { renderAppContent: (appId: AppId) => React.ReactNode }) {
  const [currentTime, setCurrentTime] = useState("")
  const [touchOrigin, setTouchOrigin] = useState<{ x: number; y: number } | null>(null)
  const [query, setQuery] = useState("")

  const windows = useWindowStore(s => s.windows)
  const zOrder = useWindowStore(s => s.zOrder)
  const activeAppId = selectFocusedApp({ windows, zOrder })
  const appearance = useSystemStore(s => s.appearance)
  const wallpaper = useSystemStore(s => s.wallpaper)
  const background = WALLPAPER_STYLES[wallpaper]?.[appearance] ?? WALLPAPER_STYLES.dynamic.dark

  useEffect(() => {
    const update = () => setCurrentTime(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }))
    update()
    const timer = setInterval(update, 10_000)
    return () => clearInterval(timer)
  }, [])

  const openApp = (id: AppId, rect?: DOMRect) => {
    setTouchOrigin(rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null)
    windowActions.open(id)
  }

  const q = query.trim().toLowerCase()
  const grid = q
    ? ALL_APPS.filter(id => {
        const meta = APPS_META[id]
        return (
          windowTitleOf(id).toLowerCase().includes(q) ||
          (meta.springboardLabel ?? "").toLowerCase().includes(q) ||
          meta.spotlight.keywords.some(k => k.includes(q))
        )
      })
    : SPRINGBOARD_GRID

  return (
    <div
      className="wallpaper fixed inset-0 flex select-none flex-col overflow-hidden"
      data-wallpaper={wallpaper}
      style={{ background }}
    >
      {/* ── Status bar ───────────────────────────────────────────────────── */}
      <div className="z-50 flex shrink-0 items-center justify-between px-6 pb-1 pt-[max(0.5rem,env(safe-area-inset-top))] text-white">
        <span className="text-sm font-semibold tracking-tight [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">{currentTime}</span>
        <div className="flex h-5 w-24 items-center justify-center rounded-full bg-black/80">
          <span className="mr-2 size-2 animate-pulse rounded-full bg-emerald-500/80" />
          <span className="font-mono text-[10px] text-white/70">AWS SBG</span>
        </div>
        <div className="flex items-center gap-1.5 [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
          <Signal className="size-3.5" />
          <Wifi className="size-3.5" />
          <Battery className="size-4" />
        </div>
      </div>

      {/* ── Search ───────────────────────────────────────────────────────── */}
      <div className="px-5 pb-1 pt-3">
        <label className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/20 px-3 py-2 text-white shadow-sm backdrop-blur-xl">
          <Search className="size-4 opacity-75" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search AWS SBG NMIET"
            aria-label="Search apps"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/65"
          />
        </label>
      </div>

      {/* ── App grid ─────────────────────────────────────────────────────── */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2 pt-5">
        <div className="mx-auto grid max-w-md grid-cols-4 content-start gap-x-3 gap-y-6">
          {grid.map(id => (
            <SpringBoardItem key={id} id={id} onOpen={rect => openApp(id, rect)} />
          ))}
        </div>
        {grid.length === 0 && <p className="pt-10 text-center text-sm text-white/70">No apps match “{query}”</p>}
      </div>

      {/* ── Dock ─────────────────────────────────────────────────────────── */}
      <div className="mt-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
        <div className="mx-auto flex max-w-md items-center justify-around rounded-[28px] border border-white/25 bg-white/30 px-3 py-3 shadow-2xl backdrop-blur-2xl dark:bg-white/15">
          {SPRINGBOARD_DOCK.map(id => (
            <SpringBoardItem key={id} id={id} hideLabel onOpen={rect => openApp(id, rect)} />
          ))}
        </div>
      </div>

      <SystemToast placement="top-center" />

      {/* ── Full-screen app sheet ────────────────────────────────────────── */}
      <AnimatePresence>
        {activeAppId && (
          <AppSheet key={activeAppId} id={activeAppId} origin={touchOrigin} onClose={() => windowActions.close(activeAppId)}>
            <AppErrorBoundary>{renderAppContent(activeAppId)}</AppErrorBoundary>
          </AppSheet>
        )}
      </AnimatePresence>
    </div>
  )
}

function SpringBoardItem({ id, hideLabel = false, onOpen }: { id: AppId; hideLabel?: boolean; onOpen: (rect?: DOMRect) => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const label = APPS_META[id]?.springboardLabel ?? windowTitleOf(id)

  return (
    <motion.button
      ref={ref}
      onClick={() => onOpen(ref.current?.getBoundingClientRect())}
      whileTap={{ scale: 0.88, opacity: 0.7 }}
      className="flex select-none flex-col items-center gap-1.5 outline-none"
      aria-label={`Open ${label}`}
    >
      <div className="size-[58px] shrink-0 drop-shadow-[0_3px_5px_rgba(0,0,0,0.35)]">
        <AppIcon id={id} size={58} />
      </div>
      {!hideLabel && (
        <span className="max-w-[76px] truncate text-[11px] font-medium tracking-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.85)]">
          {label}
        </span>
      )}
    </motion.button>
  )
}
