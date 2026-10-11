// components/os/aws-desktop.tsx
// Desktop canvas: wallpaper, watermark, widgets, desktop icons, Spotlight and toasts

"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { AnimatePresence } from "framer-motion"
import { useSystemStore, windowActions, systemActions, WALLPAPER_STYLES } from "@/lib/aws-store"
import { windowTitleOf, type AppId } from "@/lib/aws-apps"
import { widgetActions } from "@/lib/aws-widgets"
import { CLUB } from "@/lib/club-content"
import { DesktopWidgets } from "./desktop-widgets"
import { WidgetEditorModal } from "./widget-editor-modal"
import { AppIcon } from "./app-icon"
import { Spotlight } from "./spotlight"
import { SystemToast } from "./system-toast"

const DESKTOP_ICONS: AppId[] = ["about", "team", "calendar", "finder"]

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"]

export function AwsDesktop({ children }: { children?: React.ReactNode }) {
  const appearance = useSystemStore(s => s.appearance)
  const wallpaper = useSystemStore(s => s.wallpaper)
  const partyMode = useSystemStore(s => s.partyMode)
  const spotlightOpen = useSystemStore(s => s.spotlightOpen)

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [selectedIcon, setSelectedIcon] = useState<AppId | null>(null)

  const background = WALLPAPER_STYLES[wallpaper]?.[appearance] ?? WALLPAPER_STYLES.dynamic.dark

  // ⌘K Spotlight · ⌘/ Assistant · Konami code → party mode
  useEffect(() => {
    let buffer: string[] = []
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault()
        systemActions.setSpotlightOpen(!useSystemStore.getState().spotlightOpen)
        return
      }
      if (mod && e.key === "/") {
        e.preventDefault()
        windowActions.open("assistant")
        return
      }
      if ((e.target as HTMLElement).closest("input, textarea, [contenteditable]")) return

      buffer = [...buffer, e.key.toLowerCase()].slice(-KONAMI.length)
      if (buffer.length === KONAMI.length && buffer.every((k, i) => k === KONAMI[i])) {
        buffer = []
        systemActions.setPartyMode(true)
        systemActions.showToast("🎉 Party Mode activated! Easter egg found.")
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  // Close the context menu on Escape
  useEffect(() => {
    if (!contextMenu) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setContextMenu(null)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [contextMenu])

  const menuItem = (label: string, action: () => void, hint?: string) => (
    <button
      onClick={() => {
        action()
        setContextMenu(null)
      }}
      className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left font-medium text-neutral-800 transition-colors hover:bg-[#7940ea] hover:text-white dark:text-neutral-200"
    >
      <span>{label}</span>
      {hint && <span className="font-mono text-[10px] opacity-60">{hint}</span>}
    </button>
  )

  return (
    <div
      onContextMenu={e => {
        if (e.target === e.currentTarget) {
          e.preventDefault()
          setContextMenu({ x: e.clientX, y: e.clientY })
        }
      }}
      onClick={e => {
        setContextMenu(null)
        if (e.target === e.currentTarget) setSelectedIcon(null)
      }}
      className={`wallpaper fixed inset-0 select-none overflow-hidden ${partyMode ? "party" : ""}`}
      data-wallpaper={wallpaper}
      style={{ background }}
    >
      {/* ── Watermark ────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[115px] left-1/2 flex -translate-x-1/2 select-none flex-col items-center gap-3 opacity-[0.09] dark:opacity-[0.14]"
      >
        <Image src="/logo-full.png" alt="" width={160} height={160} className="size-28 object-contain" unoptimized />
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-(--os-text)">{CLUB.shortName}</span>
      </div>

      <DesktopWidgets />

      {/* ── Desktop icons (right edge, like macOS) ────────────────────────── */}
      <div className="pointer-events-none absolute right-5 top-11 z-[6] flex flex-col items-center gap-2">
        {DESKTOP_ICONS.map(id => (
          <button
            key={id}
            onClick={e => {
              e.stopPropagation()
              setSelectedIcon(id)
            }}
            onDoubleClick={() => windowActions.open(id)}
            onKeyDown={e => e.key === "Enter" && windowActions.open(id)}
            title={`Double-click to open ${windowTitleOf(id)}`}
            className="pointer-events-auto group flex w-24 flex-col items-center gap-1.5 rounded-xl p-2 text-center outline-none"
          >
            <div
              className={`rounded-xl p-0.5 transition-transform group-hover:scale-105 ${
                selectedIcon === id ? "bg-black/25 dark:bg-white/20" : ""
              }`}
            >
              <AppIcon id={id} size={52} />
            </div>
            <span
              className={`rounded px-1.5 text-xs font-medium leading-tight text-neutral-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] dark:text-white dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] ${
                selectedIcon === id ? "bg-[#7940ea] text-white" : ""
              }`}
            >
              {windowTitleOf(id)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Windows layer ────────────────────────────────────────────────── */}
      <div className="pointer-events-none relative z-10 h-full w-full">{children}</div>

      {/* ── Right-click menu ─────────────────────────────────────────────── */}
      {contextMenu && (
        <div
          style={{
            position: "fixed",
            left: Math.min(contextMenu.x, (typeof window !== "undefined" ? window.innerWidth : 9999) - 220),
            top: Math.min(contextMenu.y, (typeof window !== "undefined" ? window.innerHeight : 9999) - 260),
          }}
          onClick={e => e.stopPropagation()}
          className="z-[999] min-w-[210px] rounded-xl border border-black/10 bg-white/90 p-1 text-[13px] shadow-2xl backdrop-blur-2xl dark:border-white/15 dark:bg-[#202028]/95"
        >
          {menuItem("Change Wallpaper…", () => windowActions.open("settings", { pane: "wallpaper" }))}
          {menuItem("Edit Widgets…", () => widgetActions.setEditorOpen(true))}
          {menuItem("Control Center", () => systemActions.setControlCenterOpen(true))}
          <div className="my-1 h-px bg-black/10 dark:bg-white/10" />
          {menuItem("Open Home", () => windowActions.open("aws"))}
          {menuItem("Search…", () => systemActions.setSpotlightOpen(true), "⌘K")}
          {menuItem("About AWS SBG NMIET", () => windowActions.open("about-system"))}
          <div className="my-1 h-px bg-black/10 dark:bg-white/10" />
          {menuItem(partyMode ? "Stop Party Mode" : "🪩 Party Mode", () => systemActions.setPartyMode(!partyMode))}
        </div>
      )}

      <AnimatePresence>{spotlightOpen && <Spotlight />}</AnimatePresence>
      <SystemToast />
      <WidgetEditorModal />
    </div>
  )
}
