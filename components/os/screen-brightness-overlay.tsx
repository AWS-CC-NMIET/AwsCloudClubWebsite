// components/os/screen-brightness-overlay.tsx
// Global screen brightness dimming overlay linked to AWS Cloud OS systemStore

"use client"

import React from "react"
import { useSystemStore } from "@/lib/aws-store"

export function ScreenBrightnessOverlay() {
  const brightness = useSystemStore(s => s.brightness)

  // At full brightness (100%), no darkening overlay is applied
  if (brightness >= 1) return null

  // Clamped brightness between 0.2 and 1
  // Smoothly maps [1, 0.3] -> [0, ~0.595] dark overlay
  const overlayOpacity = Math.max(0, Math.min(0.85, (1 - brightness) * 0.85))

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[99999] transition-opacity duration-75"
      style={{
        backgroundColor: "#000000",
        opacity: overlayOpacity,
      }}
      aria-hidden="true"
    />
  )
}
