// components/os/app-icon.tsx
// Authentic macOS & iOS squircle app icons for AWS Cloud OS

"use client"

import React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ShieldCheck, UserCircle, Terminal as TerminalIcon, MessageSquare } from "lucide-react"
import { useSystemStore } from "@/lib/aws-store"
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
      {/* Outer Rotating Conic Glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, #ff9900, #ffc06a, #8c4bff, #ff9900)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
      />
      {/* Inner Breathing Core */}
      <div
        className="absolute inset-[13%] rounded-full"
        style={{
          background: "radial-gradient(circle at 35% 28%, #ffe1b5, #ff9900 52%, #6b21a8)",
        }}
      />
      {/* Surface Light Specular */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle at 32% 24%, rgba(255,255,255,0.65), transparent 45%)",
        }}
      />
    </motion.div>
  )
}

// ── Flagship AWS App Icon ─────────────────────────────────────────────────────
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
      {/* Amber Cloud Glow Backing */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(circle at 75% 20%, #ff9900, transparent 65%)",
        }}
      />
      {/* Top Gloss */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: "45%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)",
        }}
      />
      {/* Official AWS SBG NMIET Logo */}
      <div className="relative z-10 flex h-full w-full items-center justify-center p-[15%]">
        <Image
          src="/logo-full.png"
          alt="AWS SBG NMIET"
          width={120}
          height={120}
          className="h-full w-full object-contain filter drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
          unoptimized
        />
      </div>
    </div>
  )
}

export function AppIcon({ id, size = 48, className = "" }: AppIconProps) {
  const trashedCount = useSystemStore(s => s.trashedItems.length)

  if (id === "aws") {
    return <AwsFlagshipIcon size={size} className={className} />
  }

  if (id === "assistant") {
    return <AnimatedOrb size={size} className={className} />
  }

  // App PNG icons map
  const pngIcons: Record<string, string> = {
    finder: "/icons/finder.png",
    safari: "/icons/safari.png",
    appstore: "/icons/appstore.png",
    notes: "/icons/notes.png",
    calendar: "/icons/calendar.png",
    mail: "/icons/mail.png",
    music: "/icons/music.png",
    photos: "/icons/photos.png",
    settings: "/icons/settings.png",
    trash: "/icons/trash-full.png",
  }

  if (pngIcons[id]) {
    return (
      <div
        className={`relative select-none ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={pngIcons[id]}
          alt={id}
          width={128}
          height={128}
          className="h-full w-full object-contain filter drop-shadow(0 3px 6px rgba(0,0,0,0.3))"
          unoptimized
        />
      </div>
    )
  }

  // Custom styled squircles for additional apps
  if (id === "terminal") {
    return (
      <div
        className={`relative flex items-center justify-center rounded-[22%] bg-neutral-900 text-neutral-100 shadow-md ${className}`}
        style={{
          width: size,
          height: size,
          boxShadow: "0 4px 14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      >
        <div
          className="absolute inset-x-0 top-0 pointer-events-none rounded-t-[22%]"
          style={{ height: "45%", background: "linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)" }}
        />
        <TerminalIcon className="relative z-10 text-emerald-400" style={{ width: "52%", height: "52%" }} />
      </div>
    )
  }

  if (id === "messages") {
    return (
      <div
        className={`relative flex items-center justify-center rounded-[22%] bg-gradient-to-b from-emerald-400 to-green-600 text-white shadow-md ${className}`}
        style={{
          width: size,
          height: size,
          boxShadow: "0 4px 14px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
        }}
      >
        <div
          className="absolute inset-x-0 top-0 pointer-events-none rounded-t-[22%]"
          style={{ height: "45%", background: "linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)" }}
        />
        <MessageSquare className="relative z-10 fill-white text-transparent" style={{ width: "52%", height: "52%" }} />
      </div>
    )
  }

  if (id === "admin") {
    return (
      <div
        className={`relative flex items-center justify-center rounded-[22%] bg-gradient-to-b from-amber-500 to-orange-600 text-white shadow-md ${className}`}
        style={{
          width: size,
          height: size,
          boxShadow: "0 4px 14px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
        }}
      >
        <div
          className="absolute inset-x-0 top-0 pointer-events-none rounded-t-[22%]"
          style={{ height: "45%", background: "linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)" }}
        />
        <ShieldCheck className="relative z-10 text-white" style={{ width: "55%", height: "55%" }} />
      </div>
    )
  }

  if (id === "profile") {
    return (
      <div
        className={`relative flex items-center justify-center rounded-[22%] bg-gradient-to-b from-sky-400 to-blue-600 text-white shadow-md ${className}`}
        style={{
          width: size,
          height: size,
          boxShadow: "0 4px 14px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
        }}
      >
        <div
          className="absolute inset-x-0 top-0 pointer-events-none rounded-t-[22%]"
          style={{ height: "45%", background: "linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)" }}
        />
        <UserCircle className="relative z-10 text-white" style={{ width: "58%", height: "58%" }} />
      </div>
    )
  }

  return (
    <div
      className={`flex items-center justify-center rounded-[22%] bg-neutral-700 text-white ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="text-xs font-bold uppercase">{id.slice(0, 2)}</span>
    </div>
  )
}
