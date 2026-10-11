// components/os/wallpaper-emblem.tsx
// The club mark on the desktop wallpaper: logo on a glass tile with a halo in
// the current wallpaper's accent colour, and the wordmark underneath.

"use client"

import React from "react"
import Image from "next/image"
import { useSystemStore, WALLPAPER_STYLES } from "@/lib/aws-store"

export function WallpaperEmblem() {
  const wallpaper = useSystemStore(s => s.wallpaper)
  const accent = (WALLPAPER_STYLES[wallpaper] ?? WALLPAPER_STYLES.dynamic).accent

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-[40%] select-none flex-col items-center gap-5 opacity-90"
    >
      <div className="relative">
        {/* Halo */}
        <span
          className="absolute -inset-14 rounded-full opacity-60 blur-3xl transition-[background] duration-700 dark:opacity-45"
          style={{ background: `radial-gradient(circle, ${accent}, transparent 68%)` }}
        />
        <div className="glass rim relative flex size-28 items-center justify-center rounded-[30px]">
          <Image
            src="/logo-full.png"
            alt=""
            width={160}
            height={160}
            className="size-[72px] object-contain drop-shadow-[0_4px_14px_rgba(124,58,237,0.45)]"
            unoptimized
          />
        </div>
      </div>
      <div className="text-center leading-none">
        <p className="text-[13px] font-semibold tracking-[0.42em] text-(--os-text) opacity-75 [text-shadow:0_1px_12px_rgba(0,0,0,0.15)]">
          AWS STUDENT BUILDER GROUP
        </p>
        <p className="mt-2 text-[10px] font-semibold tracking-[0.6em] text-(--os-text) opacity-45">NMIET CHAPTER</p>
      </div>
    </div>
  )
}
