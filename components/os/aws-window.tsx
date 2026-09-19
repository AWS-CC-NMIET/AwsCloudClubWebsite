// components/os/aws-window.tsx
// Authentic macOS Ventura/Sonoma window chrome with traffic lights and pointer drag

"use client"

import React, { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  useWindowStore,
  windowActions,
  getDockIconRect,
  type WindowBounds,
  type WindowInstance,
} from "@/lib/aws-store"
import { APPS_META, type AppId } from "@/lib/aws-apps"
import { AppErrorBoundary } from "@/components/app-error-boundary"

interface AppWindowProps {
  id: AppId
  zIndex: number
  focused: boolean
  children: React.ReactNode
}

export function AppWindow({ id, zIndex, focused, children }: AppWindowProps) {
  const windowInstance = useWindowStore(s => s.windows[id])
  const meta = APPS_META[id]
  const windowRef = useRef<HTMLDivElement>(null)

  // Local drag/resize state
  const [bounds, setBounds] = useState<WindowBounds>(
    windowInstance?.bounds || { x: 80, y: 80, w: 900, h: 600 }
  )

  useEffect(() => {
    if (windowInstance?.bounds) {
      setBounds(windowInstance.bounds)
    }
  }, [windowInstance?.bounds])

  if (!windowInstance || windowInstance.status === "minimized") {
    return null
  }

  // ── Drag Logic via Pointer Capture ──────────────────────────────────────────
  const handleTitlePointerDown = (e: React.PointerEvent) => {
    if (windowInstance.isMaximized) return
    const target = e.target as HTMLElement
    if (target.closest("button, a, input, textarea, select, [data-no-drag]")) return
    if (e.button !== 0) return

    e.preventDefault()
    windowActions.focus(id)

    const element = windowRef.current
    if (!element) return

    element.setPointerCapture(e.pointerId)
    element.style.willChange = "transform"

    const startX = e.clientX - bounds.x
    const startY = e.clientY - bounds.y

    let currentX = bounds.x
    let currentY = bounds.y

    const onPointerMove = (moveEvt: PointerEvent) => {
      const vw = window.innerWidth
      currentX = Math.min(vw - 80, Math.max(80 - bounds.w, moveEvt.clientX - startX))
      currentY = Math.max(28, moveEvt.clientY - startY)

      setBounds(prev => ({ ...prev, x: currentX, y: currentY }))
    }

    const onPointerUp = (upEvt: PointerEvent) => {
      element.releasePointerCapture(upEvt.pointerId)
      element.style.willChange = ""
      element.removeEventListener("pointermove", onPointerMove)
      element.removeEventListener("pointerup", onPointerUp)
      element.removeEventListener("pointercancel", onPointerUp)

      windowActions.commitBounds(id, {
        x: currentX,
        y: currentY,
        w: bounds.w,
        h: bounds.h,
      })
    }

    element.addEventListener("pointermove", onPointerMove)
    element.addEventListener("pointerup", onPointerUp)
    element.addEventListener("pointercancel", onPointerUp)
  }

  // ── Resize Logic ────────────────────────────────────────────────────────────
  const handleResizePointerDown = (e: React.PointerEvent) => {
    if (windowInstance.isMaximized || e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    windowActions.focus(id)

    const startX = e.clientX
    const startY = e.clientY
    const startW = bounds.w
    const startH = bounds.h

    let currentW = startW
    let currentH = startH

    const onMove = (moveEvt: PointerEvent) => {
      const minW = meta?.minSize.w || 400
      const minH = meta?.minSize.h || 300
      currentW = Math.max(minW, startW + (moveEvt.clientX - startX))
      currentH = Math.max(minH, startH + (moveEvt.clientY - startY))

      setBounds(prev => ({ ...prev, w: currentW, h: currentH }))
    }

    const onUp = () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      windowActions.commitBounds(id, {
        x: bounds.x,
        y: bounds.y,
        w: currentW,
        h: currentH,
      })
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }

  return (
    <motion.div
      ref={windowRef}
      role="dialog"
      aria-label={meta?.name || id}
      onPointerDownCapture={() => !focused && windowActions.focus(id)}
      initial={{ scale: 0.94, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.94, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{
        position: "fixed",
        left: bounds.x,
        top: bounds.y,
        width: bounds.w,
        height: bounds.h,
        zIndex,
        boxShadow: focused
          ? "0 22px 70px 4px rgba(0,0,0,0.45), 0 0 1px rgba(0,0,0,0.3)"
          : "0 10px 30px 2px rgba(0,0,0,0.25), 0 0 1px rgba(0,0,0,0.3)",
      }}
      className="pointer-events-auto flex flex-col overflow-hidden rounded-[10px] bg-[#f6f6f8] dark:bg-[#1e1e24] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/10 dark:border-white/15 shadow-2xl backdrop-blur-3xl select-none"
    >
      {/* ── Titlebar Chrome ─────────────────────────────────────────────────── */}
      <div
        onPointerDown={handleTitlePointerDown}
        onDoubleClick={() => windowActions.toggleMaximize(id)}
        className="relative flex h-10 shrink-0 items-center justify-between border-b border-black/10 dark:border-white/10 bg-[#eaebee] dark:bg-[#282830] px-3 cursor-default"
      >
        {/* macOS Traffic Lights */}
        <div className="group flex items-center gap-2" data-no-drag>
          {/* Close Button */}
          <button
            onClick={() => windowActions.close(id)}
            aria-label="Close window"
            className={`relative flex size-3 items-center justify-center rounded-full transition-colors ${
              focused ? "bg-[#ff5f57]" : "bg-[#c9c9cd] dark:bg-[#444448] group-hover:bg-[#ff5f57]"
            } ring-1 ring-inset ring-black/15`}
          >
            <svg
              viewBox="0 0 10 10"
              className="size-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            >
              <path d="M2 2 L8 8 M8 2 L2 8" stroke="#7d1d17" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          {/* Minimize Button */}
          <button
            onClick={() => windowActions.minimize(id)}
            aria-label="Minimize window"
            className={`relative flex size-3 items-center justify-center rounded-full transition-colors ${
              focused ? "bg-[#febc2e]" : "bg-[#c9c9cd] dark:bg-[#444448] group-hover:bg-[#febc2e]"
            } ring-1 ring-inset ring-black/15`}
          >
            <svg
              viewBox="0 0 10 10"
              className="size-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            >
              <path d="M1.5 5 L8.5 5" stroke="#8d5a10" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          {/* Zoom / Maximize Button */}
          <button
            onClick={() => windowActions.toggleMaximize(id)}
            aria-label="Zoom window"
            className={`relative flex size-3 items-center justify-center rounded-full transition-colors ${
              focused ? "bg-[#28c840]" : "bg-[#c9c9cd] dark:bg-[#444448] group-hover:bg-[#28c840]"
            } ring-1 ring-inset ring-black/15`}
          >
            <svg
              viewBox="0 0 10 10"
              className="size-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            >
              <path
                d="M2.5 5.5 L2.5 2.5 L5.5 2.5 M7.5 4.5 L7.5 7.5 L4.5 7.5"
                stroke="#0d5e1c"
                strokeWidth="1.4"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Centered Window Title */}
        <div className="absolute inset-x-0 flex items-center justify-center pointer-events-none">
          <span className="text-[13px] font-semibold tracking-tight text-neutral-800 dark:text-neutral-100 truncate max-w-[50%]">
            {meta?.name || id}
          </span>
        </div>

        {/* Right Title Spacer */}
        <div className="w-12" />
      </div>

      {/* ── Window Content ──────────────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0 overflow-auto selectable bg-[#ffffff] dark:bg-[#16161b] text-neutral-900 dark:text-neutral-100">
        <AppErrorBoundary>
          {children}
        </AppErrorBoundary>
      </div>

      {/* ── Bottom Right Resize Handle ──────────────────────────────────────── */}
      {!windowInstance.isMaximized && (
        <div
          onPointerDown={handleResizePointerDown}
          className="absolute bottom-0 right-0 size-4 cursor-se-resize select-none"
          aria-hidden="true"
        />
      )}
    </motion.div>
  )
}
