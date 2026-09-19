// components/mobile/aws-sheet.tsx
// Native iOS full-screen sheet with spring expansion and swipe-down dismiss

"use client"

import React, { useRef } from "react"
import { motion, type PanInfo } from "framer-motion"
import { X } from "lucide-react"
import { APPS_META, type AppId } from "@/lib/aws-apps"

interface AppSheetProps {
  id: AppId
  origin?: { x: number; y: number } | null
  onClose: () => void
  children: React.ReactNode
}

export function AppSheet({ id, origin, onClose, children }: AppSheetProps) {
  const meta = APPS_META[id]
  const sheetRef = useRef<HTMLDivElement>(null)

  const originX = origin?.x ?? (typeof window !== "undefined" ? window.innerWidth / 2 : 200)
  const originY = origin?.y ?? (typeof window !== "undefined" ? window.innerHeight / 2 : 400)

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // If dragged down more than 120px or with high downward velocity, dismiss sheet
    if (info.offset.y > 120 || info.velocity.y > 500) {
      onClose()
    }
  }

  return (
    <motion.div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-label={meta?.name || id}
      drag="y"
      dragConstraints={{ top: 0 }}
      dragElastic={{ top: 0, bottom: 0.5 }}
      onDragEnd={handleDragEnd}
      initial={{
        scale: 0.45,
        opacity: 0,
        borderRadius: 44,
        transformOrigin: `${originX}px ${originY}px`,
      }}
      animate={{
        scale: 1,
        opacity: 1,
        borderRadius: 0,
        y: 0,
      }}
      exit={{
        scale: 0.45,
        opacity: 0,
        borderRadius: 44,
        transformOrigin: `${originX}px ${originY}px`,
        transition: { duration: 0.24, ease: "easeIn" },
      }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 32,
      }}
      className="fixed inset-0 z-[1000] flex flex-col overflow-hidden bg-[#ffffff] dark:bg-[#16161b] text-neutral-900 dark:text-neutral-100 touch-none select-none"
    >
      {/* ── Drag Handle Pill ────────────────────────────────────────────────── */}
      <div className="flex shrink-0 justify-center pt-2.5 pb-1">
        <div className="h-1.5 w-10 rounded-full bg-black/20 dark:bg-white/25" />
      </div>

      {/* ── Navigation Header Bar ────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between px-4 pb-3 pt-1 border-b border-black/10 dark:border-white/10 bg-[#f6f6f8] dark:bg-[#1e1e24]">
        <div>
          <h2 className="text-[17px] font-bold text-neutral-900 dark:text-white leading-tight">{meta?.name || id}</h2>
          {meta?.subtitle && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{meta.subtitle}</p>
          )}
        </div>

        <button
          onClick={onClose}
          aria-label="Close app"
          className="flex size-7 items-center justify-center rounded-full bg-black/10 text-neutral-600 hover:bg-black/20 dark:bg-white/15 dark:text-neutral-300 dark:hover:bg-white/25 transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* ── App Content Scroll Area ──────────────────────────────────────────── */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-auto selectable bg-[#ffffff] dark:bg-[#16161b]">
        {children}
      </div>

      {/* ── Bottom iOS Home Indicator ────────────────────────────────────────── */}
      <div className="flex shrink-0 justify-center py-2 bg-[#ffffff] dark:bg-[#16161b]">
        <div className="h-1 w-32 rounded-full bg-black/30 dark:bg-white/30" />
      </div>
    </motion.div>
  )
}
