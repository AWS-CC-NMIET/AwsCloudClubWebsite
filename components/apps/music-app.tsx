// components/apps/music-app.tsx
// AWS Cloud Radio music player

"use client"

import React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
} from "lucide-react"
import {
  useAudioStore,
  audioActions,
  TRACKS,
} from "@/lib/aws-store"

export function MusicApp() {
  const isPlaying = useAudioStore(s => s.isPlaying)
  const trackIndex = useAudioStore(s => s.currentTrackIndex)
  const volume = useAudioStore(s => s.volume)
  const isMuted = useAudioStore(s => s.muted)
  const currentTrack = TRACKS[trackIndex]

  return (
    <div className="flex h-full w-full flex-col md:flex-row bg-(--win-bg) text-(--os-text)">
      {/* ── Left Artwork & Visualizer ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 space-y-6">
        <motion.div
          animate={isPlaying ? { scale: [1, 1.02, 1] } : { scale: 1 }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative size-48 md:size-64 overflow-hidden rounded-2xl border border-white/20 shadow-2xl"
        >
          <Image
            src={currentTrack.art}
            alt={currentTrack.title}
            width={256}
            height={256}
            className="h-full w-full object-cover"
            unoptimized
          />

          {/* Equalizer Visualizer Bars Overlay */}
          {isPlaying && (
            <div className="absolute bottom-3 right-3 flex items-end gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg">
              {[0.6, 1.2, 0.8, 1.4, 0.9, 1.1].map((delay, idx) => (
                <motion.div
                  key={idx}
                  className="w-1 bg-(--accent) rounded-full"
                  animate={{ height: ["4px", "18px", "6px", "14px", "4px"] }}
                  transition={{ duration: delay, repeat: Infinity, ease: "easeInOut" }}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Track Title */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-(--os-text)">{currentTrack.title}</h2>
          <p className="text-sm text-(--os-text-dim)">{currentTrack.artist}</p>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => audioActions.prevTrack()}
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <SkipBack className="size-5 text-(--os-text)" />
          </button>

          <button
            onClick={() => audioActions.togglePlay()}
            className="flex size-12 items-center justify-center rounded-full bg-(--accent) text-white shadow-lg hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="size-6" />
            ) : (
              <Play className="size-6 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => audioActions.nextTrack()}
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <SkipForward className="size-5 text-(--os-text)" />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-3 w-48 text-(--os-text-dim)">
          <button onClick={() => audioActions.toggleMuted()}>
            {isMuted || volume === 0 ? (
              <VolumeX className="size-4" />
            ) : (
              <Volume2 className="size-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={e => audioActions.setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-black/20 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-(--accent)"
          />
        </div>
      </div>

      {/* ── Right Playlist Sidebar ───────────────────────────────────────────── */}
      <div className="w-full md:w-72 shrink-0 border-t md:border-t-0 md:border-l border-(--win-divider) bg-black/[0.02] dark:bg-white/[0.02] p-4 space-y-3 overflow-y-auto">
        <div className="flex items-center gap-2 pb-2 border-b border-(--win-divider)">
          <Radio className="size-4 text-(--accent)" />
          <span className="text-xs font-bold uppercase tracking-wider text-(--os-text)">
            AWS Cloud Radio Playlist
          </span>
        </div>

        <div className="space-y-1">
          {TRACKS.map((track, idx) => {
            const isCurrent = idx === trackIndex
            return (
              <button
                key={track.title}
                onClick={() => {
                  if (!isCurrent) audioActions.nextTrack()
                }}
                className={`flex w-full items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                  isCurrent
                    ? "bg-(--accent)/15 border border-(--accent)/30"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <div className="min-w-0 pr-2">
                  <p className={`text-xs font-semibold truncate ${isCurrent ? "text-(--accent)" : "text-(--os-text)"}`}>
                    {track.title}
                  </p>
                  <p className="text-[11px] text-(--os-text-dim) truncate">{track.artist}</p>
                </div>
                <span className="text-[10px] font-mono text-(--os-text-dim)">{track.duration}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
