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

      {/* Ambient gradient orbs — enhanced for dark theme */}
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.22) 0%, rgba(107,79,232,0.10) 40%, transparent 65%)" }} />
      <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(91,63,216,0.20) 0%, rgba(107,79,232,0.08) 45%, transparent 65%)" }} />
      <div className="absolute top-1/2 -translate-y-1/2 -right-32 h-80 w-80 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.16) 0%, transparent 60%)" }} />
      <div className="absolute bottom-24 left-1/4 h-72 w-72 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,153,0,0.10) 0%, transparent 60%)" }} />
      <div className="absolute top-16 right-1/4 h-56 w-56 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(196,181,253,0.12) 0%, transparent 60%)" }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(107,79,232,0.08) 0%, transparent 55%)" }} />

      {/* ── Center Logo (hidden when home is maximized) ── */}
      {!hideCenter && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Glow halos — enhanced purple */}
          <div className="absolute rounded-full blur-3xl"
            style={{ width: 420, height: 420, background: "radial-gradient(circle, rgba(168,85,247,0.30) 0%, rgba(107,79,232,0.14) 40%, transparent 70%)" }} />
          <div className="absolute rounded-full blur-2xl"
            style={{ width: 300, height: 300, background: "radial-gradient(circle, rgba(255,153,0,0.14) 0%, transparent 70%)" }} />
          <div className="absolute rounded-full blur-[80px]"
            style={{ width: 500, height: 500, background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 65%)" }} />

          {/* Pulse rings */}
          {[320, 430, 555].map((r, i) => (
            <motion.div
              key={r}
              className="absolute rounded-full"
              style={{
                width: r, height: r,
                border: `${i === 0 ? 2 : 1.5}px solid rgba(168,85,247,${0.42 - i * 0.12})`,
                boxShadow: i === 0 ? "0 0 28px rgba(168,85,247,0.22), inset 0 0 14px rgba(168,85,247,0.10)" : "none",
              }}
              animate={{ scale: [1, 1.14, 1], opacity: [1, 0.25, 1] }}
              transition={{ duration: 4 + i * 1.8, delay: i * 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}

          {/* Accent rings */}
          <motion.div className="absolute rounded-full"
            style={{ width: 490, height: 490, border: "1px solid rgba(255,153,0,0.14)" }}
            animate={{ scale: [1, 1.06, 1], opacity: [0.7, 0.18, 0.7] }}
            transition={{ duration: 7, delay: 2, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="absolute rounded-full"
            style={{ width: 370, height: 370, border: "1.5px dashed rgba(168,85,247,0.22)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }} />
          <motion.div className="absolute rounded-full"
            style={{ width: 460, height: 460, border: "1px dashed rgba(255,153,0,0.12)" }}
            animate={{ rotate: -360 }}
            transition={{ duration: 45, repeat: Infinity, ease: "linear" }} />

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

          {/* Logo + branding */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            animate={{
              y: [-8, 8],
              rotate: [-3, 3]
            }}
            transition={{
              y: { duration: 6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
              rotate: { duration: 8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
            }}
          >
            {/* Logo container with glow ring scoped to it */}
            <div className="relative">
              {/* Pulsing neon purple outer ring — scoped to logo box */}
              <div className="absolute inset-0 rounded-3xl animate-glow-neon-purple" style={{ margin: "-12px" }} />

              <div
                className="relative flex items-center justify-center rounded-3xl overflow-hidden"
                style={{
                  width: 280, height: 280,
                  background: "rgba(8, 4, 20, 0.45)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(168, 85, 247, 0.28)",
                  opacity: 0.97,
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
                {/* Text overlay in the hollow center of the logo */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                  style={{ gap: 4 }}
                >
                  <span style={{
                    color: "#FFFFFF",
                    fontSize: "18px",
                    fontWeight: 900,
                    letterSpacing: "0.20em",
                    textTransform: "uppercase",
                    textShadow: "0 0 16px rgba(168,85,247,1), 0 0 32px rgba(168,85,247,0.7)",
                    lineHeight: 1,
                  }}>AWS</span>
                  <span style={{
                    color: "#DDD6FE",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textAlign: "center",
                    lineHeight: 1.5,
                    textShadow: "0 0 10px rgba(168,85,247,0.90)",
                  }}>Student Builder</span>
                  <span style={{
                    color: "#DDD6FE",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textAlign: "center",
                    lineHeight: 1,
                    textShadow: "0 0 10px rgba(168,85,247,0.90)",
                  }}>Group</span>
                </div>
              </div>
            </div>

            {/* NMIET Chapter label below logo */}
            <div className="mt-4 relative z-10 flex items-center gap-2">
              <div style={{ width: 24, height: 1, background: "rgba(168,85,247,0.50)" }} />
              <span style={{
                color: "rgba(196,181,253,0.95)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.30em",
                textTransform: "uppercase",
                textShadow: "0 0 18px rgba(168,85,247,0.75), 0 0 36px rgba(168,85,247,0.35)",
              }}>NMIET Chapter</span>
              <div style={{ width: 24, height: 1, background: "rgba(168,85,247,0.50)" }} />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
