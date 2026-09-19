// components/os/boot-screen.tsx
// AWS Cloud Club-style boot screen featuring AWS Cloud Club SBG logo

"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

export function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // 2.2 second authentic boot progress
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onComplete, 400)
    }, 2200)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#000000] text-white select-none"
        >
          {/* ── AWS Cloud Club SBG Logo ──────────────────────────────────────── */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative size-24 md:size-28">
              <Image
                src="/logo-full.png"
                alt="AWS SBG NMIET"
                width={140}
                height={140}
                className="h-full w-full object-contain filter drop-shadow(0 0 24px rgba(121,64,234,0.4))"
                unoptimized
                priority
              />
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/80">
              AWS SBG NMIET
            </p>
          </motion.div>

          {/* ── Boot Progress Bar ──────────────────────────────── */}
          <div className="mt-12 h-[5px] w-44 overflow-hidden rounded-full bg-white/20">
            <div className="boot-bar-inner h-full rounded-full bg-white" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
