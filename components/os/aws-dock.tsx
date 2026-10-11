// components/os/aws-dock.tsx
// macOS dock with magnification, launch bounce and running indicators.
// Icon size adapts to the viewport so all apps fit on smaller screens.

"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion"
import { useWindowStore, windowActions, registerDockIconRect } from "@/lib/aws-store"
import { DOCK_APPS, dockLabelOf, type AppId } from "@/lib/aws-apps"
import { AppIcon } from "./app-icon"

const MAX_ICON = 50
const MIN_ICON = 32
const GAP = 6

function useBaseIconSize() {
  const [size, setSize] = useState(MAX_ICON)
  useEffect(() => {
    const update = () => {
      const available = window.innerWidth - 48 - (DOCK_APPS.length + 1) * GAP
      setSize(Math.max(MIN_ICON, Math.min(MAX_ICON, Math.floor(available / DOCK_APPS.length))))
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])
  return size
}

export function AwsDock() {
  const mouseX = useMotionValue(Infinity)
  const base = useBaseIconSize()

  return (
    <nav aria-label="Dock" className="pointer-events-none fixed inset-x-0 bottom-2 z-[900] flex select-none justify-center">
      <motion.div
        onPointerMove={e => e.pointerType === "mouse" && mouseX.set(e.clientX)}
        onPointerLeave={() => mouseX.set(Infinity)}
        className="pointer-events-auto flex items-end rounded-2xl border border-white/30 bg-white/40 px-2 pb-1.5 pt-1 shadow-[0_16px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl dark:border-white/15 dark:bg-[#1a1a24]/75"
        style={{ height: base + 18, gap: GAP }}
      >
        {DOCK_APPS.map(appId => (
          <React.Fragment key={appId}>
            {appId === "trash" && <span className="mx-1 mb-1 w-px self-stretch bg-black/15 dark:bg-white/20" aria-hidden="true" />}
            <DockItem id={appId} mouseX={mouseX} base={base} />
          </React.Fragment>
        ))}
      </motion.div>
    </nav>
  )
}

function DockItem({ id, mouseX, base }: { id: AppId; mouseX: MotionValue<number>; base: number }) {
  const ref = useRef<HTMLButtonElement>(null)
  const [bouncing, setBouncing] = useState(false)
  const isOpen = useWindowStore(s => !!s.windows[id])
  const label = dockLabelOf(id)

  const distance = useTransform(mouseX, (val: number) => {
    if (val === Infinity || !ref.current) return 150
    const rect = ref.current.getBoundingClientRect()
    return Math.abs(val - (rect.x + rect.width / 2))
  })
  const width = useSpring(useTransform(distance, [0, 150], [Math.round(base * 1.45), base]), {
    stiffness: 400,
    damping: 28,
  })

  // Remember where this icon is so windows can minimize into it.
  useEffect(() => {
    const update = () => ref.current && registerDockIconRect(id, ref.current.getBoundingClientRect())
    update()
    const unsubscribe = width.on("animationComplete", update)
    window.addEventListener("resize", update)
    return () => {
      unsubscribe()
      window.removeEventListener("resize", update)
    }
  }, [id, base, width])

  const launch = () => {
    if (!isOpen) {
      setBouncing(true)
      setTimeout(() => setBouncing(false), 700)
    }
    windowActions.open(id)
  }

  return (
    <motion.button
      ref={ref}
      onClick={launch}
      style={{ width }}
      animate={bouncing ? { y: [0, -20, 0, -8, 0] } : { y: 0 }}
      transition={bouncing ? { duration: 0.65, ease: "easeOut" } : undefined}
      className="group relative flex aspect-square shrink-0 flex-col items-center justify-end outline-none"
      aria-label={`Open ${label}`}
    >
      <div className="relative flex h-full w-full items-center justify-center drop-shadow-md">
        <AppIcon id={id} size="100%" />
      </div>

      <span className="pointer-events-none absolute -top-10 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/15 bg-[#202028]/95 px-2.5 py-1 text-xs font-semibold text-white opacity-0 shadow-2xl backdrop-blur-2xl transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        {label}
      </span>

      <span
        className={`absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-black/70 transition-opacity duration-200 dark:bg-white/80 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />
    </motion.button>
  )
}
