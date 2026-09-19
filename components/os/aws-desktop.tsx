// components/os/aws-desktop.tsx
// Desktop canvas with wallpaper, watermark, desktop icons, and OS widgets

"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  Folder,
  BookOpen,
  Sparkles,
  Sliders,
  CheckCircle2,
  X,
  Play,
  Pause,
  SkipForward,
} from "lucide-react"
import {
  useWindowStore,
  useSystemStore,
  useAudioStore,
  windowActions,
  systemActions,
  audioActions,
  TRACKS,
  WALLPAPER_STYLES,
} from "@/lib/aws-store"
import { APPS_META, type AppId } from "@/lib/aws-apps"
import { DesktopWidgets } from "./desktop-widgets"
import { WidgetEditorModal } from "./widget-editor-modal"
import { widgetActions } from "@/lib/aws-widgets"

interface DesktopIconItem {
  id: string
  appId: AppId
  label: string
  icon: string
  x: number
  y: number
}

const DESKTOP_ICONS: DesktopIconItem[] = [
  { id: "projects", appId: "finder", label: "AWS Projects", icon: "/icons/finder.png", x: 20, y: 50 },
  { id: "notes", appId: "notes", label: "Cert Guides", icon: "/icons/notes.png", x: 20, y: 150 },
  { id: "calendar", appId: "calendar", label: "Club Events", icon: "/icons/calendar.png", x: 20, y: 250 },
  { id: "appstore", appId: "appstore", label: "Dev Starter Kits", icon: "/icons/appstore.png", x: 20, y: 350 },
]

export function AwsDesktop({ children }: { children?: React.ReactNode }) {
  const appearance = useSystemStore(s => s.appearance)
  const wallpaper = useSystemStore(s => s.wallpaper)
  const partyMode = useSystemStore(s => s.partyMode)
  const toastMessage = useSystemStore(s => s.toast)
  const spotlightOpen = useSystemStore(s => s.spotlightOpen)
  const controlCenterOpen = useSystemStore(s => s.controlCenterOpen)

  const isAudioPlaying = useAudioStore(s => s.isPlaying)
  const currentTrack = TRACKS[useAudioStore(s => s.currentTrackIndex)]

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const activeGradient =
    WALLPAPER_STYLES[wallpaper]?.[appearance] || WALLPAPER_STYLES.dynamic.dark

  // Global key bindings (Cmd+K for spotlight, Konami code for party mode)
  useEffect(() => {
    const konamiSequence = [
      "arrowup",
      "arrowup",
      "arrowdown",
      "arrowdown",
      "arrowleft",
      "arrowright",
      "arrowleft",
      "arrowright",
      "b",
      "a",
    ]
    let keyBuffer: string[] = []

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K = Spotlight
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        systemActions.setSpotlightOpen(!useSystemStore.getState().spotlightOpen)
        return
      }

      // Cmd/Ctrl + / = Cloud Concierge
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault()
        windowActions.open("assistant")
        return
      }

      if ((e.target as HTMLElement).closest("input, textarea, [contenteditable]")) return

      keyBuffer.push(e.key.toLowerCase())
      if (keyBuffer.length > konamiSequence.length) keyBuffer.shift()

      if (
        keyBuffer.length === konamiSequence.length &&
        keyBuffer.every((k, i) => k === konamiSequence[i])
      ) {
        keyBuffer = []
        systemActions.setPartyMode(true)
        systemActions.showToast("🎉 Party Mode Activated! Easter egg found.")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.preventDefault()
      setContextMenu({ x: e.clientX, y: e.clientY })
    }
  }

  // Filter apps for Spotlight search
  const searchResults = Object.values(APPS_META).filter(meta => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      meta.name.toLowerCase().includes(q) ||
      meta.spotlight.description.toLowerCase().includes(q) ||
      meta.spotlight.keywords.some(k => k.toLowerCase().includes(q))
    )
  })

  return (
    <div
      onContextMenu={handleDesktopContextMenu}
      onClick={() => setContextMenu(null)}
      className={`wallpaper fixed inset-0 overflow-hidden select-none ${partyMode ? "party" : ""}`}
      data-wallpaper={wallpaper}
      style={{
        background: activeGradient,
        transition: "background 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* ── Center Watermark (AWS SBG NMIET Official Logo) ──────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[115px] left-1/2 -translate-x-1/2 select-none opacity-[0.09] dark:opacity-[0.14] transition-opacity duration-300 flex flex-col items-center gap-3"
      >
        <Image
          src="/logo-full.png"
          alt="AWS SBG NMIET"
          width={160}
          height={160}
          className="h-28 w-28 object-contain"
          unoptimized
        />
        <span className="font-mono text-xs uppercase tracking-[0.3em] font-semibold text-(--os-text)">
          AWS SBG NMIET
        </span>
      </div>

      {/* ── Desktop Widgets Layer ────────────────────────────────────────────── */}
      <DesktopWidgets />

      {/* ── Desktop Desktop Icons (macOS Right Edge) ────────────────────────── */}
      <div className="absolute right-6 top-12 pointer-events-none hidden sm:flex flex-col items-center gap-3 z-[30]">
        {DESKTOP_ICONS.map(item => (
          <button
            key={item.id}
            onDoubleClick={() => windowActions.open(item.appId)}
            onClick={() => {}}
            className="pointer-events-auto group flex w-24 flex-col items-center gap-1.5 rounded-xl p-2 text-center transition-colors hover:bg-black/10 dark:hover:bg-white/10 focus:bg-[#7940ea]/30 outline-none"
          >
            <div className="relative size-12 filter drop-shadow-md transition-transform group-hover:scale-105">
              <Image
                src={item.icon}
                alt={item.label}
                width={64}
                height={64}
                className="h-full w-full object-contain"
                unoptimized
              />
            </div>
            <span className="text-xs font-medium leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── Windows Layer ────────────────────────────────────────────────────── */}
      <div className="relative z-10 h-full w-full pointer-events-none">
        {children}
      </div>

      {/* ── Desktop Right-Click Context Menu ─────────────────────────────────── */}
      {contextMenu && (
        <div
          style={{ position: "fixed", left: contextMenu.x, top: contextMenu.y }}
          className="z-[999] min-w-[200px] rounded-xl border border-black/10 dark:border-white/15 bg-white/90 dark:bg-[#202028]/95 p-1 text-[13px] text-neutral-800 dark:text-neutral-200 shadow-2xl backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            onClick={() => {
              windowActions.open("settings", { pane: "wallpaper" })
              setContextMenu(null)
            }}
            className="flex w-full items-center justify-between px-3 py-1.5 text-left rounded-md text-neutral-800 dark:text-neutral-200 hover:bg-[#7940ea] hover:text-white font-medium transition-colors"
          >
            <span>Edit Background…</span>
            <span className="text-[10px] opacity-60 font-mono">⌘,</span>
          </button>

          <button
            onClick={() => {
              systemActions.setControlCenterOpen(true)
              setContextMenu(null)
            }}
            className="flex w-full items-center justify-between px-3 py-1.5 text-left rounded-md text-neutral-800 dark:text-neutral-200 hover:bg-[#7940ea] hover:text-white font-medium transition-colors"
          >
            <span>Control Center</span>
          </button>
          <button
            onClick={() => {
              widgetActions.setEditorOpen(true)
              setContextMenu(null)
            }}
            className="flex w-full items-center justify-between px-3 py-1.5 text-left rounded-md text-neutral-800 dark:text-neutral-200 hover:bg-[#7940ea] hover:text-white font-medium transition-colors"
          >
            <span>Edit Widgets…</span>
          </button>
          <div className="my-1 h-px bg-black/10 dark:bg-white/10" />

          <button
            onClick={() => {
              windowActions.open("finder")
              setContextMenu(null)
            }}
            className="flex w-full items-center px-3 py-1.5 text-left rounded-md text-neutral-800 dark:text-neutral-200 hover:bg-[#7940ea] hover:text-white font-medium transition-colors"
          >
            Open Finder
          </button>
          <button
            onClick={() => {
              windowActions.open("aws")
              setContextMenu(null)
            }}
            className="flex w-full items-center px-3 py-1.5 text-left rounded-md text-neutral-800 dark:text-neutral-200 hover:bg-[#7940ea] hover:text-white font-medium transition-colors"
          >
            About AWS SBG NMIET
          </button>
          <div className="my-1 h-px bg-black/10 dark:bg-white/10" />
          <button
            onClick={() => {
              systemActions.setPartyMode(!partyMode)
              setContextMenu(null)
            }}
            className="flex w-full items-center px-3 py-1.5 text-left rounded-md text-neutral-800 dark:text-neutral-200 hover:bg-[#7940ea] hover:text-white font-medium transition-colors"
          >
            {partyMode ? "Stop Party Mode" : "🪩 Party Mode"}
          </button>
        </div>
      )}

      {/* ── Spotlight Search Modal (Cmd+K) ──────────────────────────────────── */}
      <AnimatePresence>
        {spotlightOpen && (
          <div
            onClick={() => systemActions.setSpotlightOpen(false)}
            className="fixed inset-0 z-[1200] flex items-start justify-center pt-24 bg-black/50 backdrop-blur-md pointer-events-auto"
          >
            <motion.div
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -10 }}
              className="w-full max-w-xl overflow-hidden rounded-2xl border border-black/10 dark:border-white/20 bg-white/95 dark:bg-[#1e1e26]/98 p-3 text-neutral-900 dark:text-white shadow-2xl backdrop-blur-3xl"
            >
              <div className="flex items-center gap-3 border-b border-black/10 dark:border-white/15 pb-2.5 px-2">
                <span className="text-xl">🔍</span>
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search AWS SBG NMIET apps, projects, roadmaps, events..."
                  className="w-full bg-transparent text-base text-neutral-900 dark:text-white outline-none placeholder:text-neutral-400"
                />
                <kbd className="rounded border border-black/10 dark:border-white/20 bg-black/5 dark:bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
                  ESC
                </kbd>
              </div>

              <div className="mt-2 max-h-72 overflow-y-auto divide-y divide-black/5 dark:divide-white/10">
                {searchResults.slice(0, 7).map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      windowActions.open(item.id)
                      systemActions.setSpotlightOpen(false)
                    }}
                    className="flex w-full items-center justify-between rounded-lg p-2.5 text-left hover:bg-black/5 dark:hover:bg-[#7940ea]/20 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.spotlight.description}</p>
                    </div>
                    <span className="text-xs text-[#7940ea] dark:text-[#a855f7] font-semibold">Open</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Toast Notification Banner ────────────────────────────────────────── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            className="fixed top-10 right-6 z-[1000] flex items-center gap-3 rounded-xl border border-white/15 bg-[#202028]/95 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-3xl"
          >
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── Desktop Widgets Editor Modal ────────────────────────────────────── */}
      <WidgetEditorModal />
    </div>
  )
}
