"use client"

import { motion } from "framer-motion"
import Image from "next/image"

// ─── Static data ──────────────────────────────────────────────────────────────
const bgFloaters = [
  { w: 280, h: 280, left: "3%",  top: "6%",  dur: 7,   delay: 0,   color: "rgba(107,79,232,0.28)" },
  { w: 200, h: 200, left: "86%", top: "4%",  dur: 5.5, delay: 1.2, color: "rgba(91,63,216,0.22)"  },
  { w: 320, h: 320, left: "72%", top: "52%", dur: 8,   delay: 0.5, color: "rgba(184,164,255,0.20)"},
  { w: 150, h: 150, left: "16%", top: "70%", dur: 4.5, delay: 0.8, color: "rgba(107,79,232,0.26)" },
  { w: 220, h: 220, left: "52%", top: "12%", dur: 6,   delay: 0.3, color: "rgba(255,153,0,0.14)"  },
  { w: 170, h: 170, left: "90%", top: "32%", dur: 6.5, delay: 1.5, color: "rgba(107,79,232,0.22)" },
  { w: 250, h: 250, left: "36%", top: "76%", dur: 5.5, delay: 0.7, color: "rgba(91,63,216,0.20)"  },
  { w: 140, h: 140, left: "1%",  top: "42%", dur: 4,   delay: 1.0, color: "rgba(80,200,138,0.16)" },
]

const bgSparkles = [
  { top: "6%",  left: "20%", delay: 0,   size: 14, dur: 3,   color: "rgba(107,79,232,0.7)"  },
  { top: "13%", left: "66%", delay: 0.6, size: 10, dur: 2.5, color: "rgba(255,153,0,0.8)"   },
  { top: "26%", left: "86%", delay: 1.2, size: 16, dur: 3.5, color: "rgba(184,164,255,0.7)" },
  { top: "40%", left: "4%",  delay: 0.4, size: 11, dur: 2.8, color: "rgba(107,79,232,0.6)"  },
  { top: "56%", left: "76%", delay: 1.8, size: 18, dur: 4,   color: "rgba(91,63,216,0.7)"   },
  { top: "68%", left: "40%", delay: 0.9, size: 10, dur: 3.2, color: "rgba(255,153,0,0.65)"  },
  { top: "80%", left: "12%", delay: 0.2, size: 12, dur: 2.6, color: "rgba(107,79,232,0.65)" },
  { top: "86%", left: "83%", delay: 1.4, size: 15, dur: 3.8, color: "rgba(80,200,138,0.7)"  },
  { top: "20%", left: "34%", delay: 0.7, size: 8,  dur: 2.4, color: "rgba(232,85,128,0.65)" },
  { top: "63%", left: "58%", delay: 1.1, size: 17, dur: 3.6, color: "rgba(107,79,232,0.7)"  },
  { top: "48%", left: "92%", delay: 0.5, size: 9,  dur: 2.9, color: "rgba(255,153,0,0.7)"   },
  { top: "33%", left: "50%", delay: 1.6, size: 11, dur: 3.1, color: "rgba(184,164,255,0.6)" },
]

const bgDots = [
  { left: "10%", top: "18%", dur: 4,   delay: 0,   size: 9,  color: "#6B4FE8" },
  { left: "76%", top: "10%", dur: 5,   delay: 0.7, size: 8,  color: "#FF9900" },
  { left: "43%", top: "66%", dur: 3.5, delay: 1.2, size: 10, color: "#B8A4FF" },
  { left: "86%", top: "43%", dur: 6,   delay: 0.3, size: 8,  color: "#6B4FE8" },
  { left: "20%", top: "83%", dur: 4.5, delay: 0.9, size: 9,  color: "#50C88A" },
  { left: "58%", top: "36%", dur: 5.5, delay: 1.5, size: 7,  color: "#5BA8D8" },
  { left: "4%",  top: "58%", dur: 3.8, delay: 0.4, size: 8,  color: "#6B4FE8" },
  { left: "68%", top: "76%", dur: 4.8, delay: 1.1, size: 8,  color: "#FF9900" },
  { left: "33%", top: "46%", dur: 5.2, delay: 0.6, size: 7,  color: "#B8A4FF" },
  { left: "88%", top: "66%", dur: 4.2, delay: 1.8, size: 10, color: "#E85580" },
  { left: "48%", top: "90%", dur: 3.6, delay: 0.2, size: 8,  color: "#6B4FE8" },
  { left: "14%", top: "48%", dur: 5.8, delay: 1.3, size: 7,  color: "#FF9900" },
]

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

      {/* Dot grid */}
      <svg className="absolute inset-0 h-full w-full opacity-20">
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

      {/* Floating blobs */}
      {bgFloaters.map((f, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: f.w, height: f.h, left: f.left, top: f.top,
            background: `radial-gradient(circle, ${f.color} 0%, transparent 70%)`,
          }}
          animate={{ y: [0, -24, 0], scale: [1, 1.10, 1] }}
          transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Sparkle stars */}
      {bgSparkles.map((s, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: s.top, left: s.left }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], rotate: [0, 180, 360] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill="none">
            <path d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z" fill={s.color} />
          </svg>
        </motion.div>
      ))}

      {/* Colored floating dots */}
      {bgDots.map((d, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: d.left, top: d.top,
            width: d.size, height: d.size,
            background: d.color,
            boxShadow: `0 0 ${d.size * 2}px ${d.color}`,
          }}
          animate={{ y: [0, -18, 0], opacity: [0.6, 1, 0.6], scale: [1, 1.4, 1] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

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
            animate={{ y: [0, -16, 0], rotate: [0, 1.5, -1.5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 rounded-3xl"
              style={{ background: "radial-gradient(circle, rgba(107,79,232,0.45) 0%, rgba(91,63,216,0.22) 40%, transparent 70%)", margin: "-40px", filter: "blur(20px)" }} />
            <div className="absolute inset-0 rounded-3xl"
              style={{ background: "radial-gradient(circle at 70% 30%, rgba(255,153,0,0.18) 0%, transparent 60%)", margin: "-20px", filter: "blur(12px)" }} />
            <div style={{ opacity: 0.92, filter: "saturate(1.4) brightness(1.05) drop-shadow(0 0 20px rgba(107,79,232,0.5))" }}>
              <Image
                src="/logo-full.png"
                alt="AWS Cloud Club NMIET"
                width={280}
                height={280}
                className="rounded-3xl select-none"
                draggable={false}
                priority
                sizes="280px"
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
