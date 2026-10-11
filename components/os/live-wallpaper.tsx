// components/os/live-wallpaper.tsx
// Slowly drifting colour fields layered over the static wallpaper gradient —
// the "living" background behind every glass surface. Pure CSS animation on
// transforms (GPU-composited); disabled when the OS asks for reduced motion.

"use client"

import React from "react"
import { useSystemStore, type WallpaperId } from "@/lib/aws-store"

const PALETTES: Record<WallpaperId, { dark: [string, string, string]; light: [string, string, string] }> = {
  dynamic: { dark: ["#f3350c", "#7940ea", "#1c4fbf"], light: ["#ff8a5c", "#c3a6ff", "#8fb4ff"] },
  ember: { dark: ["#f3350c", "#b91c1c", "#d97706"], light: ["#ff9b73", "#fdba74", "#fca5a5"] },
  violet: { dark: ["#7c3aed", "#9333ea", "#2563eb"], light: ["#c4b5fd", "#e9d5ff", "#a5b4fc"] },
  slate: { dark: ["#64748b", "#475569", "#334155"], light: ["#cbd5e1", "#e2e8f0", "#c7d2fe"] },
  dawn: { dark: ["#f97316", "#ec4899", "#f59e0b"], light: ["#fdba74", "#f9a8d4", "#fde68a"] },
  midnight: { dark: ["#2563eb", "#7c3aed", "#06b6d4"], light: ["#93c5fd", "#c4b5fd", "#a5f3fc"] },
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
