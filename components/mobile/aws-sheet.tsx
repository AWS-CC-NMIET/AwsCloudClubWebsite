// components/mobile/aws-sheet.tsx
// iOS full-screen app sheet. Swipe down on the grabber/header to dismiss —
// the app content itself scrolls normally and never triggers a dismiss.

"use client"

import React from "react"
import { motion, useDragControls, type PanInfo } from "framer-motion"
import { X } from "lucide-react"
import { APPS_META, windowTitleOf, type AppId } from "@/lib/aws-apps"

interface AppSheetProps {
  id: AppId
  origin?: { x: number; y: number } | null
  onClose: () => void
  children: React.ReactNode
}

export function AppSheet({ id, origin, onClose, children }: AppSheetProps) {
  const meta = APPS_META[id]
  const dragControls = useDragControls()

  const originX = origin?.x ?? (typeof window !== "undefined" ? window.innerWidth / 2 : 200)
  const originY = origin?.y ?? (typeof window !== "undefined" ? window.innerHeight / 2 : 400)

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 500) onClose()
  }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={windowTitleOf(id)}
      drag="y"
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.6 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.45, opacity: 0, borderRadius: 44, transformOrigin: `${originX}px ${originY}px` }}
      animate={{ scale: 1, opacity: 1, borderRadius: 0, y: 0 }}
      exit={{
        scale: 0.45,
        opacity: 0,
        borderRadius: 44,
        transformOrigin: `${originX}px ${originY}px`,
        transition: { duration: 0.24, ease: "easeIn" },
      }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="fixed inset-0 z-[1000] flex flex-col overflow-hidden bg-white text-neutral-900 dark:bg-[#16161b] dark:text-neutral-100"
    >
      {/* ── Grabber + navigation header (drag handle) ─────────────────────── */}
      <div
        onPointerDown={e => dragControls.start(e)}
        className="shrink-0 touch-none select-none border-b border-black/10 bg-[#f6f6f8] pt-[env(safe-area-inset-top)] dark:border-white/10 dark:bg-[#1e1e24]"
      >
        <div className="flex justify-center pb-1 pt-2">
          <div className="h-1.5 w-10 rounded-full bg-black/20 dark:bg-white/25" />
        </div>
        <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-0.5">
          <div className="min-w-0">
            <h2 className="truncate text-[17px] font-bold leading-tight text-neutral-900 dark:text-white">{windowTitleOf(id)}</h2>
            {meta?.subtitle && <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{meta.subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            onPointerDown={e => e.stopPropagation()}
            aria-label="Close app"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-black/10 text-neutral-600 transition-colors hover:bg-black/20 dark:bg-white/15 dark:text-neutral-300"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* ── App content ───────────────────────────────────────────────────── */}
      <div className="selectable min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white pb-[env(safe-area-inset-bottom)] dark:bg-[#16161b]">
        {children}
      </div>
    </motion.div>
  )
}
