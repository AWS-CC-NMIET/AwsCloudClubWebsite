"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { InteractiveCanvas } from "./interactive-canvas"

interface WallpaperProps {
  /** Hide the center logo when the home window is maximized */
  hideCenter?: boolean
}

/**
 * Animated desktop wallpaper — dots, sparkles, floating orbs, center logo.
 * Only rendered on sm+ (desktop); hidden on mobile via `hidden sm:block`.
 */
export function Wallpaper({ hideCenter = false }: WallpaperProps) {
  return (
    <div className="hidden sm:block absolute inset-0 pointer-events-none overflow-hidden">

      {/* Interactive animated canvas background */}
      <InteractiveCanvas theme="dark" />

      {/* Dot grid */}
      <svg className="absolute inset-0 h-full w-full opacity-20 pointer-events-none">
        <defs>
          <pattern id="dot" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="18" cy="18" r="1" fill="#9B8FD8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot)" />
      </svg>

      {/* Ambient gradient orbs */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(107,79,232,0.18) 0%, transparent 60%)" }} />
      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(91,63,216,0.16) 0%, transparent 60%)" }} />
      <div className="absolute top-1/2 -translate-y-1/2 -right-32 h-80 w-80 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(184,164,255,0.14) 0%, transparent 60%)" }} />
      <div className="absolute bottom-24 left-1/3 h-64 w-64 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,153,0,0.08) 0%, transparent 60%)" }} />
      <div className="absolute top-20 right-1/3 h-48 w-48 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(80,200,138,0.07) 0%, transparent 60%)" }} />

      {/* ── Center Logo (hidden when home is maximized) ── */}
      {!hideCenter && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Glow halos */}
          <div className="absolute rounded-full blur-3xl"
            style={{ width: 380, height: 380, background: "radial-gradient(circle, rgba(107,79,232,0.28) 0%, rgba(91,63,216,0.14) 40%, transparent 70%)" }} />
          <div className="absolute rounded-full blur-2xl"
            style={{ width: 280, height: 280, background: "radial-gradient(circle, rgba(255,153,0,0.12) 0%, transparent 70%)" }} />

          {/* Pulse rings */}
          {[320, 430, 555].map((r, i) => (
            <motion.div
              key={r}
              className="absolute rounded-full"
              style={{
                width: r, height: r,
                border: `${i === 0 ? 2.5 : 2}px solid rgba(107,79,232,${0.38 - i * 0.10})`,
                boxShadow: i === 0 ? "0 0 24px rgba(107,79,232,0.18), inset 0 0 12px rgba(107,79,232,0.08)" : "none",
              }}
              animate={{ scale: [1, 1.14, 1], opacity: [1, 0.3, 1] }}
              transition={{ duration: 4 + i * 1.8, delay: i * 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}

          {/* Accent rings */}
          <motion.div className="absolute rounded-full"
            style={{ width: 490, height: 490, border: "1px solid rgba(255,153,0,0.12)" }}
            animate={{ scale: [1, 1.06, 1], opacity: [0.6, 0.15, 0.6] }}
            transition={{ duration: 7, delay: 2, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="absolute rounded-full"
            style={{ width: 370, height: 370, border: "1.5px dashed rgba(107,79,232,0.18)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }} />
          <motion.div className="absolute rounded-full"
            style={{ width: 440, height: 440, border: "1px dashed rgba(255,153,0,0.12)" }}
            animate={{ rotate: -360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }} />

          {/* Orbiting accent dots */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => {
            const rad = (angle * Math.PI) / 180
            const r = 195
            const colors = ["#6B4FE8", "#FF9900", "#B8A4FF", "#50C88A", "#E85580", "#5BA8D8"]
            return (
              <motion.div key={angle} className="absolute rounded-full"
                style={{
                  width: 8, height: 8,
                  background: colors[i],
                  x: Math.cos(rad) * r, y: Math.sin(rad) * r,
                  boxShadow: `0 0 8px ${colors[i]}`,
                }}
                animate={{ scale: [1, 1.8, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, delay: i * 0.42, repeat: Infinity, ease: "easeInOut" }} />
            )
          })}

          {/* Logo */}
          <motion.div
            className="relative z-10"
            animate={{
              y: [-8, 8],
              rotate: [-3, 3]
            }}
            transition={{
              y: { duration: 6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
              rotate: { duration: 8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
            }}
          >
            {/* Pulsing neon purple outer ring */}
            <div className="absolute inset-0 rounded-3xl animate-glow-neon-purple" style={{ margin: "-12px" }} />
            
            <div
              className="relative flex items-center justify-center rounded-3xl"
              style={{
                width: 280, height: 280,
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                opacity: 0.95,
              }}
            >
              <Image
                src="/logo-full.png"
                alt="AWS Student Builder Group NMIET"
                width={260}
                height={260}
                className="object-contain select-none"
                draggable={false}
                priority
                unoptimized
                sizes="260px"
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
