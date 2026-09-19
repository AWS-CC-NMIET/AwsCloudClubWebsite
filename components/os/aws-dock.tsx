// components/os/aws-dock.tsx
// Authentic macOS floating dock with smooth magnification, bounce, and active dots

"use client"

import React, { useRef, useState, useEffect } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import {
  useWindowStore,
  windowActions,
  registerDockIconRect,
} from "@/lib/aws-store"
import { DOCK_APPS, APPS_META, type AppId } from "@/lib/aws-apps"
import { AppIcon } from "./app-icon"

export function AwsDock() {
  const mouseX = useMotionValue(Infinity)

  return (
    <nav
      aria-label="Dock"
      className="fixed inset-x-0 bottom-2 z-[900] flex justify-center pointer-events-none select-none"
    >
      <motion.div
        onPointerMove={e => mouseX.set(e.clientX)}
        onPointerLeave={() => mouseX.set(Infinity)}
        className="pointer-events-auto flex items-end gap-1.5 rounded-2xl border border-white/30 bg-white/40 px-2 pb-1.5 pt-1 shadow-[0_16px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl dark:border-white/15 dark:bg-[#1a1a24]/75"
        style={{ height: 68 }}
      >
        {DOCK_APPS.map(appId => (
          <React.Fragment key={appId}>
            {appId === "trash" && (
              <span
                className="mx-1 mb-1 h-10 w-px self-end bg-black/15 dark:bg-white/20"
                aria-hidden="true"
              />
            )}
            <DockItem id={appId} mouseX={mouseX} />
          </React.Fragment>
        ))}
      </motion.div>
    </nav>
  )
}

function DockItem({ id, mouseX }: { id: AppId; mouseX: any }) {
  const itemRef = useRef<HTMLButtonElement>(null)
  const [bouncing, setBouncing] = useState(false)
  const meta = APPS_META[id]

  const windows = useWindowStore(s => s.windows)
  const isOpen = !!windows[id]

  // Proximity magnification physics
  const distance = useTransform(mouseX, (val: number) => {
    if (val === Infinity || !itemRef.current) return 120
    const bounds = itemRef.current.getBoundingClientRect()
    const center = bounds.x + bounds.width / 2
    return Math.abs(val - center)
  })

  // Magnify width from 50px up to 72px within 120px cursor range
  const widthTransform = useTransform(distance, [0, 120], [70, 50])
  const width = useSpring(widthTransform, { stiffness: 400, damping: 28 })

  // Register bounding rect for minimize window coordinates
  useEffect(() => {
    const updateRect = () => {
      if (itemRef.current) {
        registerDockIconRect(id, itemRef.current.getBoundingClientRect())
      }
    }
    updateRect()
    window.addEventListener("resize", updateRect)
    return () => window.removeEventListener("resize", updateRect)
  }, [id])

  const handleClick = () => {
    setBouncing(true)
    setTimeout(() => setBouncing(false), 700)
    windowActions.open(id)
  }

  return (
    <motion.button
      ref={itemRef}
      onClick={handleClick}
      style={{ width }}
      animate={bouncing ? { y: [0, -24, 0, -10, 0] } : { y: 0 }}
      transition={bouncing ? { duration: 0.65, ease: "easeOut" } : undefined}
      className="group relative aspect-square shrink-0 outline-none flex flex-col items-center justify-end"
      aria-label={`Open ${meta?.name || id}`}
    >
      {/* Icon */}
      <div className="relative h-full w-full flex items-center justify-center filter drop-shadow-md transition-transform duration-150 group-hover:scale-105">
        <AppIcon id={id} size="100%" />
      </div>

      {/* Floating Hover Tooltip */}
      <span className="pointer-events-none absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/15 bg-[#202028]/95 px-2.5 py-1 text-xs font-semibold text-white opacity-0 shadow-2xl backdrop-blur-2xl transition-opacity group-hover:opacity-100 z-50">
        {meta?.name || id}
      </span>

      {/* Running Active Dot */}
      <span
        className={`absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-black/70 dark:bg-white/80 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />
    </motion.button>
  )
}
