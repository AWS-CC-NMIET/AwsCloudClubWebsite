// components/os/live-wallpaper.tsx
// Slowly drifting colour fields layered over the static wallpaper gradient —
// the "living" background behind every glass surface. Pure CSS animation on
// transforms (GPU-composited); disabled when the OS asks for reduced motion.

"use client"

import React from "react"
import { useSystemStore, type WallpaperId } from "@/lib/aws-store"

const PALETTES: Record<WallpaperId, { dark: [string, string, string]; light: [string, string, string] }> = {
  dynamic: { dark: ["#c2410c", "#6d28d9", "#1e40af"], light: ["#fdba74", "#c4b5fd", "#93c5fd"] },
  ember: { dark: ["#c2410c", "#7f1d1d", "#92400e"], light: ["#fdba74", "#fca5a5", "#fde68a"] },
  violet: { dark: ["#6d28d9", "#7e22ce", "#1e40af"], light: ["#c4b5fd", "#e9d5ff", "#a5b4fc"] },
  slate: { dark: ["#475569", "#334155", "#1e293b"], light: ["#cbd5e1", "#e2e8f0", "#c7d2fe"] },
  dawn: { dark: ["#c2410c", "#9d174d", "#a16207"], light: ["#fdba74", "#f9a8d4", "#fde68a"] },
  midnight: { dark: ["#1d4ed8", "#5b21b6", "#0e7490"], light: ["#93c5fd", "#c4b5fd", "#a5f3fc"] },
}

export function LiveWallpaper({ forceDark = false }: { forceDark?: boolean }) {
  const appearance = useSystemStore(s => s.appearance)
  const wallpaper = useSystemStore(s => s.wallpaper)
  const palette = PALETTES[wallpaper] ?? PALETTES.dynamic
  const colors = forceDark || appearance === "dark" ? palette.dark : palette.light

  return (
    <div aria-hidden="true" className="live-wallpaper">
      {colors.map(c => (
        <span key={c} style={{ background: `radial-gradient(circle at center, ${c}, transparent 65%)` }} />
      ))}
    </div>
  )
}
