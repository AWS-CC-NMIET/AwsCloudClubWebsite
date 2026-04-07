"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

interface DesktopIconProps {
  icon: ReactNode
  label: string
  onClick: () => void
  gradient?: string
}

export function DesktopIcon({ icon, label, onClick, gradient }: DesktopIconProps) {
  return (
    <motion.button
      onClick={onClick}
      onDoubleClick={onClick}
      className="group flex w-[72px] flex-col items-center gap-1.5 rounded-2xl p-1.5"
      whileHover={{ y: -4, scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring" as const, stiffness: 380, damping: 22 }}
    >
      {/* Icon square */}
      <motion.div
        className="flex h-14 w-14 items-center justify-center rounded-2xl text-white"
        style={{
          background: gradient ?? "linear-gradient(135deg,#6B4FE8,#8B6FFF)",
          boxShadow: "5px 5px 14px #C2BAF0, -5px -5px 14px #FFFFFF",
        }}
        whileHover={{
          boxShadow: "7px 7px 20px #C2BAF0, -7px -7px 20px #FFFFFF",
        }}
        transition={{ duration: 0.2 }}
      >
        {icon}
      </motion.div>

      {/* Label */}
      <span
        className="max-w-full truncate rounded-lg px-1.5 py-0.5 text-center text-[11px] font-medium backdrop-blur-sm"
        style={{ color: "#1E1060", background: "rgba(234,230,255,0.70)" }}
      >
        {label}
      </span>
    </motion.button>
  )
}
