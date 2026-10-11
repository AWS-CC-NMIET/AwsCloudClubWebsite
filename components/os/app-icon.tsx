// components/os/app-icon.tsx
// macOS & iOS squircle app icons for the AWS SBG NMIET Cloud OS

"use client"

import React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Info,
  ShieldCheck,
  Share2,
  Terminal as TerminalIcon,
  Trophy,
  UserCircle,
  UsersRound,
  type LucideIcon,
} from "lucide-react"
import type { AppId } from "@/lib/aws-apps"

interface AppIconProps {
  id: AppId
  size?: number | string
  className?: string
}

// ── Animated Assistant Orb ────────────────────────────────────────────────────
export function AnimatedOrb({ size = "100%", className = "" }: { size?: number | string; className?: string }) {
  return (
    <motion.div
      aria-hidden="true"
      className={`relative select-none ${className}`}
      style={{ width: size, height: size }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: "conic-gradient(from 0deg, #ff9900, #ffc06a, #8c4bff, #ff9900)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
      />
      <div
        className="absolute inset-[13%] rounded-full"
        style={{ background: "radial-gradient(circle at 35% 28%, #ffe1b5, #ff9900 52%, #6b21a8)" }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle at 32% 24%, rgba(255,255,255,0.65), transparent 45%)" }}
      />
    </motion.div>
  )
}

// ── Flagship AWS SBG Icon ─────────────────────────────────────────────────────
export function AwsFlagshipIcon({ size = 48, className = "" }: { size?: number | string; className?: string }) {
  return (
    <div
      className={`relative select-none overflow-hidden rounded-[22%] ${className}`}
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #1f2937 0%, #0f172a 100%)",
        boxShadow: "0 4px 14px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.22)",
      }}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{ background: "radial-gradient(circle at 75% 20%, #ff9900, transparent 65%)" }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{ height: "45%", background: "linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)" }}
      />
      <div className="relative z-10 flex h-full w-full items-center justify-center p-[15%]">
        <Image src="/logo-full.png" alt="AWS SBG NMIET" width={120} height={120} className="h-full w-full object-contain" unoptimized />
      </div>
    </div>
  )
}

// ── Glyph squircle (lucide icon on a gradient) ────────────────────────────────
function GlyphIcon({
  icon: Icon,
  gradient,
  glyphClassName = "text-white",
  glyphScale = 0.55,
  size,
  className = "",
}: {
  icon: LucideIcon
  gradient: string
  glyphClassName?: string
  glyphScale?: number
  size: number | string
  className?: string
}) {
  return (
    <div
      className={`relative flex select-none items-center justify-center overflow-hidden rounded-[22%] ${className}`}
      style={{
        width: size,
        height: size,
        background: gradient,
        boxShadow: "0 4px 14px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{ height: "45%", background: "linear-gradient(to bottom, rgba(255,255,255,0.22), transparent)" }}
      />
      <Icon
        className={`relative z-10 ${glyphClassName}`}
        style={{ width: `${glyphScale * 100}%`, height: `${glyphScale * 100}%` }}
      />
    </div>
  )
}

const PNG_ICONS: Partial<Record<AppId, string>> = {
  finder: "/icons/finder.png",
  safari: "/icons/safari.png",
  notes: "/icons/notes.png",
  calendar: "/icons/calendar.png",
  mail: "/icons/mail.png",
  music: "/icons/music.png",
  photos: "/icons/photos.png",
  settings: "/icons/settings.png",
  trash: "/icons/trash-full.png",
}

const GLYPH_ICONS: Partial<Record<AppId, { icon: LucideIcon; gradient: string; glyphClassName?: string; glyphScale?: number }>> = {
  about: { icon: Info, gradient: "linear-gradient(180deg, #8b5cf6 0%, #5b21b6 100%)" },
  team: { icon: UsersRound, gradient: "linear-gradient(180deg, #d6a77a 0%, #8b5a33 100%)" },
  achievements: { icon: Trophy, gradient: "linear-gradient(180deg, #fcd34d 0%, #d97706 100%)" },
  social: { icon: Share2, gradient: "linear-gradient(180deg, #fb7185 0%, #be185d 100%)", glyphScale: 0.5 },
  terminal: {
    icon: TerminalIcon,
    gradient: "linear-gradient(180deg, #2a2a2e 0%, #0b0b0d 100%)",
    glyphClassName: "text-emerald-400",
    glyphScale: 0.52,
  },
  profile: { icon: UserCircle, gradient: "linear-gradient(180deg, #38bdf8 0%, #2563eb 100%)", glyphScale: 0.58 },
  admin: { icon: ShieldCheck, gradient: "linear-gradient(180deg, #f59e0b 0%, #ea580c 100%)" },
}

export function AppIcon({ id, size = 48, className = "" }: AppIconProps) {
  if (id === "aws" || id === "about-system") return <AwsFlagshipIcon size={size} className={className} />
  if (id === "assistant") return <AnimatedOrb size={size} className={className} />

  const png = PNG_ICONS[id]
  if (png) {
    return (
      <div className={`relative select-none ${className}`} style={{ width: size, height: size }}>
        <Image src={png} alt="" width={128} height={128} className="h-full w-full object-contain" unoptimized />
      </div>
    )
  }

  const glyph = GLYPH_ICONS[id]
  if (glyph) return <GlyphIcon {...glyph} size={size} className={className} />

  return (
    <div
      className={`flex items-center justify-center rounded-[22%] bg-neutral-700 text-white ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="text-xs font-bold uppercase">{id.slice(0, 2)}</span>
    </div>
  )
}
