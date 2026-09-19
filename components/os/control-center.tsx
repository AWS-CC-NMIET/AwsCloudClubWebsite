// components/os/control-center.tsx
// Authentic macOS Control Center for AWS SBG NMIET AWS Cloud OS

"use client"

import React, { useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wifi,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  Sparkles,
  Layers,
  Sliders,
} from "lucide-react"
import {
  useSystemStore,
  useAudioStore,
  systemActions,
  audioActions,
  windowActions,
  TRACKS,
} from "@/lib/aws-store"
import { widgetActions } from "@/lib/aws-widgets"

export function ControlCenter() {
  const isOpen = useSystemStore(s => s.controlCenterOpen)
  const appearance = useSystemStore(s => s.appearance)
  const brightness = useSystemStore(s => s.brightness)
  const partyMode = useSystemStore(s => s.partyMode)

  const isAudioPlaying = useAudioStore(s => s.isPlaying)
  const audioVolume = useAudioStore(s => s.volume)
  const isAudioMuted = useAudioStore(s => s.muted)
  const currentTrackIndex = useAudioStore(s => s.currentTrackIndex)
  const currentTrack = TRACKS[currentTrackIndex] || TRACKS[0]

  const containerRef = useRef<HTMLDivElement>(null)

  // Close on click outside or Escape key
  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !target.closest("[data-control-center-toggle]")
      ) {
        systemActions.setControlCenterOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        systemActions.setControlCenterOpen(false)
      }
    }

    window.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -6, transition: { duration: 0.12 } }}
          transition={{ type: "spring", stiffness: 450, damping: 32 }}
          className="fixed right-2 top-8 z-[1100] w-[330px] origin-top-right rounded-2xl border border-white/15 bg-[#1e1e26]/95 p-3 text-white shadow-2xl backdrop-blur-3xl select-none"
          role="dialog"
          aria-label="Control Center"
        >
          {/* ── Top 2x2 Feature Grid ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-2">
            {/* Wi-Fi Tile */}
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2.5 transition-colors">
              <button
                onClick={() => systemActions.showToast("Wi-Fi connected: AWS-SBG-NMIET-5G")}
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#7940ea] text-white shadow-md hover:bg-[#8c4bff] transition-colors"
                aria-label="Wi-Fi Status"
              >
                <Wifi className="size-4" />
              </button>
              <div className="min-w-0 flex-1 text-left leading-tight">
                <p className="text-xs font-semibold text-white">Wi-Fi</p>
                <p className="truncate text-[10px] text-neutral-400 font-mono">AWS-SBG-5G</p>
              </div>
            </div>

            {/* Dark Mode Tile */}
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2.5 transition-colors">
              <button
                onClick={() => systemActions.toggleAppearance()}
                className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-colors shadow-md ${
                  appearance === "dark"
                    ? "bg-[#7940ea] text-white"
                    : "bg-white/15 text-neutral-200 hover:bg-white/20"
                }`}
                aria-label="Toggle Dark Mode"
              >
                {appearance === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
              </button>
              <div className="min-w-0 flex-1 text-left leading-tight">
                <p className="text-xs font-semibold text-white">Dark Mode</p>
                <p className="text-[10px] text-neutral-400 font-mono">
                  {appearance === "dark" ? "On" : "Off"}
                </p>
              </div>
            </div>

            {/* Party Mode Easter Egg Tile */}
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2.5 transition-colors">
              <button
                onClick={() => {
                  const next = !partyMode
                  systemActions.setPartyMode(next)
                  systemActions.showToast(next ? "🎉 Party Mode On!" : "Party Mode Off")
                }}
                className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-colors shadow-md ${
                  partyMode
                    ? "bg-[#ec4899] text-white animate-spin"
                    : "bg-white/15 text-neutral-200 hover:bg-white/20"
                }`}
                aria-label="Toggle Party Mode"
              >
                <Sparkles className="size-4" />
              </button>
              <div className="min-w-0 flex-1 text-left leading-tight">
                <p className="text-xs font-semibold text-white">Party Mode</p>
                <p className="text-[10px] text-neutral-400 font-mono">
                  {partyMode ? "Active" : "Ready"}
                </p>
              </div>
            </div>

            {/* System Info / Settings Tile */}
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2.5 transition-colors">
              <button
                onClick={() => {
                  windowActions.open("settings")
                  systemActions.setControlCenterOpen(false)
                }}
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 hover:bg-[#7940ea] text-white shadow-md transition-colors"
                aria-label="Open Settings"
              >
                <Layers className="size-4" />
              </button>
              <div className="min-w-0 flex-1 text-left leading-tight">
                <p className="text-xs font-semibold text-white">Settings</p>
                <p className="text-[10px] text-neutral-400 font-mono">AWS OS</p>
              </div>
            </div>
          </div>

          {/* ── Display Brightness Slider ────────────────────────────────────── */}
          <div className="mt-2.5 rounded-xl border border-white/10 bg-white/5 p-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-300 mb-1.5">
              <span>Display</span>
              <span className="font-mono text-[10px] text-neutral-400">
                {Math.round(brightness * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="size-4 text-amber-400 shrink-0" />
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.01"
                value={brightness}
                onChange={e => systemActions.setBrightness(parseFloat(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/20 accent-[#7940ea]"
              />
            </div>
          </div>

          {/* ── Sound & Volume Slider ────────────────────────────────────────── */}
          <div className="mt-2.5 rounded-xl border border-white/10 bg-white/5 p-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-300 mb-1.5">
              <span>Sound</span>
              <span className="font-mono text-[10px] text-neutral-400">
                {isAudioMuted ? "0%" : `${Math.round(audioVolume * 100)}%`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => audioActions.toggleMuted()}
                className="text-neutral-400 hover:text-white transition-colors"
                aria-label={isAudioMuted ? "Unmute" : "Mute"}
              >
                {isAudioMuted || audioVolume === 0 ? (
                  <VolumeX className="size-4 text-red-400" />
                ) : (
                  <Volume2 className="size-4 text-[#8c4bff]" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isAudioMuted ? 0 : audioVolume}
                onChange={e => audioActions.setVolume(parseFloat(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/20 accent-[#7940ea]"
              />
            </div>
          </div>

          {/* ── Now Playing Audio Card ───────────────────────────────────────── */}
          <div className="mt-2.5 rounded-xl border border-white/10 bg-white/5 p-2.5">
            <div className="flex items-center gap-3">
              <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-black/40 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentTrack.art}
                  alt={currentTrack.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 leading-tight text-left">
                <p className="truncate text-xs font-semibold text-white">{currentTrack.title}</p>
                <p className="truncate text-[11px] text-neutral-400">{currentTrack.artist}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => audioActions.togglePlay()}
                  className="flex size-8 items-center justify-center rounded-full bg-[#7940ea] hover:bg-[#8c4bff] text-white shadow-md transition-colors"
                  aria-label={isAudioPlaying ? "Pause Audio" : "Play Audio"}
                >
                  {isAudioPlaying ? (
                    <Pause className="size-3.5 fill-current" />
                  ) : (
                    <Play className="size-3.5 fill-current ml-0.5" />
                  )}
                </button>
                <button
                  onClick={() => audioActions.nextTrack()}
                  className="flex size-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors"
                  aria-label="Next Track"
                >
                  <SkipForward className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Quick Actions: System Settings & Edit Widgets ───────────────── */}
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                windowActions.open("settings")
                systemActions.setControlCenterOpen(false)
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 px-2.5 text-xs font-semibold text-neutral-200 hover:bg-[#7940ea] hover:text-white transition-colors shadow-xs"
            >
              <Layers className="size-3.5 text-[#8c4bff]" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => {
                widgetActions.setEditorOpen(true)
                systemActions.setControlCenterOpen(false)
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 px-2.5 text-xs font-semibold text-neutral-200 hover:bg-[#7940ea] hover:text-white transition-colors shadow-xs"
            >
              <Sliders className="size-3.5 text-[#8c4bff]" />
              <span>Edit Widgets</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
