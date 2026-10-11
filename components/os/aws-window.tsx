// components/os/aws-window.tsx
// macOS window chrome with traffic lights, drag, resize and minimize-to-dock.
//
// Performance: dragging/resizing mutates the window element's style directly
// and commits bounds to the store once on pointer-up, so the app inside the
// window does not re-render on every pointer move.

"use client"

import React, { useRef } from "react"
import { motion } from "framer-motion"
import {
  useWindowStore,
  windowActions,
  getDockIconRect,
  MENUBAR_HEIGHT,
  type WindowBounds,
} from "@/lib/aws-store"
import { APPS_META, windowTitleOf, type AppId } from "@/lib/aws-apps"
import { AppErrorBoundary } from "@/components/app-error-boundary"

interface AppWindowProps {
  id: AppId
  zIndex: number
  focused: boolean
  children: React.ReactNode
}

type ResizeDir = "e" | "s" | "se"

export function AppWindow({ id, zIndex, focused, children }: AppWindowProps) {
  const win = useWindowStore(s => s.windows[id])
  const meta = APPS_META[id]
  const frameRef = useRef<HTMLDivElement>(null)

  if (!win) return null

  const minimized = win.status === "minimized"
  const { bounds } = win

  // Where the window shrinks to when minimized (its dock icon, if known).
  const dock = getDockIconRect(id)
  const minimizeTarget = dock
    ? {
        x: dock.x + dock.width / 2 - (bounds.x + bounds.w / 2),
        y: dock.y + dock.height / 2 - (bounds.y + bounds.h / 2),
      }
    : { x: 0, y: 200 }

  const minW = Math.min(meta?.minSize.w ?? 400, typeof window !== "undefined" ? window.innerWidth - 16 : 400)
  const minH = Math.min(meta?.minSize.h ?? 300, typeof window !== "undefined" ? window.innerHeight - 120 : 300)

  // ── Drag ──────────────────────────────────────────────────────────────────
  const handleTitlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (win.isMaximized || e.button !== 0) return
    if ((e.target as HTMLElement).closest("button, a, input, textarea, select, [data-no-drag]")) return
    const el = frameRef.current
    if (!el) return

    e.preventDefault()
    windowActions.focus(id)

    const handle = e.currentTarget
    handle.setPointerCapture(e.pointerId)
    const offsetX = e.clientX - bounds.x
    const offsetY = e.clientY - bounds.y
    let next: WindowBounds = { ...bounds }

    const onMove = (ev: PointerEvent) => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      next = {
        ...next,
        x: Math.min(vw - 80, Math.max(80 - bounds.w, ev.clientX - offsetX)),
        y: Math.min(vh - 60, Math.max(MENUBAR_HEIGHT, ev.clientY - offsetY)),
      }
      el.style.left = `${next.x}px`
      el.style.top = `${next.y}px`
    }

    const onUp = (ev: PointerEvent) => {
      handle.releasePointerCapture(ev.pointerId)
      handle.removeEventListener("pointermove", onMove)
      handle.removeEventListener("pointerup", onUp)
      handle.removeEventListener("pointercancel", onUp)
      if (next.x !== bounds.x || next.y !== bounds.y) windowActions.commitBounds(id, next)
    }

    handle.addEventListener("pointermove", onMove)
    handle.addEventListener("pointerup", onUp)
    handle.addEventListener("pointercancel", onUp)
  }

  // ── Resize ────────────────────────────────────────────────────────────────
  const startResize = (dir: ResizeDir) => (e: React.PointerEvent<HTMLDivElement>) => {
    if (win.isMaximized || e.button !== 0) return
    const el = frameRef.current
    if (!el) return

    e.preventDefault()
    e.stopPropagation()
    windowActions.focus(id)

    const handle = e.currentTarget
    handle.setPointerCapture(e.pointerId)
    const startX = e.clientX
    const startY = e.clientY
    let next: WindowBounds = { ...bounds }

    const onMove = (ev: PointerEvent) => {
      const maxW = window.innerWidth - bounds.x - 4
      const maxH = window.innerHeight - bounds.y - 4
      if (dir !== "s") next.w = Math.min(maxW, Math.max(minW, bounds.w + ev.clientX - startX))
      if (dir !== "e") next.h = Math.min(maxH, Math.max(minH, bounds.h + ev.clientY - startY))
      el.style.width = `${next.w}px`
      el.style.height = `${next.h}px`
    }

    const onUp = (ev: PointerEvent) => {
      handle.releasePointerCapture(ev.pointerId)
      handle.removeEventListener("pointermove", onMove)
      handle.removeEventListener("pointerup", onUp)
      handle.removeEventListener("pointercancel", onUp)
      if (next.w !== bounds.w || next.h !== bounds.h) windowActions.commitBounds(id, next)
    }

    handle.addEventListener("pointermove", onMove)
    handle.addEventListener("pointerup", onUp)
    handle.addEventListener("pointercancel", onUp)
  }

  return (
    <div
      ref={frameRef}
      role="dialog"
      aria-label={windowTitleOf(id)}
      aria-hidden={minimized || undefined}
      onPointerDownCapture={() => !focused && windowActions.focus(id)}
      style={{
        position: "fixed",
        left: bounds.x,
        top: bounds.y,
        width: bounds.w,
        height: bounds.h,
        zIndex,
        pointerEvents: minimized ? "none" : "auto",
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 14 }}
        animate={
          minimized
            ? { scale: 0.12, opacity: 0, x: minimizeTarget.x, y: minimizeTarget.y, transitionEnd: { visibility: "hidden" } }
            : { scale: 1, opacity: 1, x: 0, y: 0, visibility: "visible" }
        }
        exit={{ scale: 0.94, opacity: 0, y: 8, transition: { duration: 0.15 } }}
        transition={
          minimized
            ? { duration: 0.32, ease: [0.16, 1, 0.3, 1] }
            : { type: "spring", stiffness: 380, damping: 30, mass: 0.8 }
        }
        className="window-material rim flex h-full w-full flex-col overflow-hidden rounded-[14px] text-[#1d1d1f] dark:text-[#f5f5f7]"
        style={{
          boxShadow: focused
            ? "0 30px 80px -6px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(0,0,0,0.25)"
            : "0 12px 34px -4px rgba(0,0,0,0.28), 0 0 0 0.5px rgba(0,0,0,0.2)",
        }}
      >
        {/* ── Title bar ─────────────────────────────────────────────────────── */}
        <div
          onPointerDown={handleTitlePointerDown}
          onDoubleClick={e => {
            if (!(e.target as HTMLElement).closest("button")) windowActions.toggleMaximize(id)
          }}
          className="relative flex h-10 shrink-0 cursor-default select-none items-center justify-between border-b border-(--win-divider) bg-(--titlebar-bg) px-3 touch-none"
        >
          <div className="group relative z-10 flex items-center gap-2" data-no-drag>
            <TrafficLight color="#ff5f57" focused={focused} label="Close window" onClick={() => windowActions.close(id)}>
              <path d="M2 2 L8 8 M8 2 L2 8" stroke="#7d1d17" strokeWidth="1.5" strokeLinecap="round" />
            </TrafficLight>
            <TrafficLight color="#febc2e" focused={focused} label="Minimize window" onClick={() => windowActions.minimize(id)}>
              <path d="M1.5 5 L8.5 5" stroke="#8d5a10" strokeWidth="1.8" strokeLinecap="round" />
            </TrafficLight>
            <TrafficLight color="#28c840" focused={focused} label="Zoom window" onClick={() => windowActions.toggleMaximize(id)}>
              <path d="M2.5 5.5 L2.5 2.5 L5.5 2.5 M7.5 4.5 L7.5 7.5 L4.5 7.5" stroke="#0d5e1c" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            </TrafficLight>
          </div>

          <div className="pointer-events-none absolute inset-x-0 flex items-center justify-center">
            <span
              className={`max-w-[55%] truncate text-[13px] font-semibold tracking-tight ${
                focused ? "text-neutral-800 dark:text-neutral-100" : "text-neutral-400 dark:text-neutral-500"
              }`}
            >
              {windowTitleOf(id)}
            </span>
          </div>
          <div className="w-12" />
        </div>

        {/* ── Content ───────────────────────────────────────────────────────── */}
        <div className="selectable relative min-h-0 flex-1 overflow-auto text-neutral-900 dark:text-neutral-100">
          <AppErrorBoundary>{children}</AppErrorBoundary>
        </div>
      </motion.div>

      {/* ── Resize handles ──────────────────────────────────────────────────── */}
      {!win.isMaximized && !minimized && (
        <>
          <div onPointerDown={startResize("e")} className="absolute -right-1 top-3 bottom-3 w-2 cursor-ew-resize touch-none" aria-hidden="true" />
          <div onPointerDown={startResize("s")} className="absolute -bottom-1 left-3 right-3 h-2 cursor-ns-resize touch-none" aria-hidden="true" />
          <div onPointerDown={startResize("se")} className="absolute -bottom-1 -right-1 size-4 cursor-nwse-resize touch-none" aria-hidden="true" />
        </>
      )}
    </div>
  )
}

function TrafficLight({
  color,
  focused,
  label,
  onClick,
  children,
}: {
  color: string
  focused: boolean
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="relative flex size-3 items-center justify-center rounded-full ring-1 ring-inset ring-black/15 transition-colors"
      style={{ background: focused ? color : undefined }}
    >
      {!focused && <span className="absolute inset-0 rounded-full bg-[#c9c9cd] group-hover:hidden dark:bg-[#4a4a50]" />}
      {!focused && <span className="absolute inset-0 hidden rounded-full group-hover:block" style={{ background: color }} />}
      <svg viewBox="0 0 10 10" className="pointer-events-none relative size-1.5 opacity-0 transition-opacity group-hover:opacity-100">
        {children}
      </svg>
    </button>
  )
}
