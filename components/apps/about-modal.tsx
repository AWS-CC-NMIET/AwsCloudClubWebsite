// components/apps/about-modal.tsx
// Authentic macOS "About This Mac" dialog for AWS Cloud Club SBG

"use client"

import React from "react"
import Image from "next/image"
import { windowActions } from "@/lib/aws-store"

export function AboutModal() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center space-y-4 bg-(--win-bg) text-(--os-text)">
      {/* Official AWS SBG NMIET Logo */}
      <div className="relative size-20">
        <Image
          src="/logo-full.png"
          alt="AWS SBG NMIET"
          width={96}
          height={96}
          className="h-full w-full object-contain filter drop-shadow(0 4px 10px rgba(0,0,0,0.25))"
          unoptimized
        />
      </div>

      <div>
        <h2 className="text-lg font-extrabold tracking-tight">AWS SBG NMIET</h2>
        <p className="text-xs text-(--os-text-dim)">Student Builder Group · NMIET Official Chapter</p>
      </div>

      <div className="w-full max-w-xs divide-y divide-(--win-divider) rounded-xl border border-(--win-divider) bg-black/5 dark:bg-white/5 text-[11px] font-mono">
        <div className="flex items-center justify-between p-2 px-3">
          <span className="text-(--os-text-dim)">Platform</span>
          <span className="font-semibold">Amazon Web Services</span>
        </div>
        <div className="flex items-center justify-between p-2 px-3">
          <span className="text-(--os-text-dim)">Region</span>
          <span className="font-semibold">us-east-1 (N. Virginia)</span>
        </div>
        <div className="flex items-center justify-between p-2 px-3">
          <span className="text-(--os-text-dim)">Chapter Lead</span>
          <span className="font-semibold">Omkar Rane</span>
        </div>
        <div className="flex items-center justify-between p-2 px-3">
          <span className="text-(--os-text-dim)">Framework</span>
          <span className="font-semibold">Next.js 16.2 / React 19</span>
        </div>
        <div className="flex items-center justify-between p-2 px-3">
          <span className="text-(--os-text-dim)">Edition</span>
          <span className="text-[#7940ea] font-semibold">AWS Cloud OS v3.2</span>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={() => windowActions.open("settings")}
          className="rounded-lg border border-(--win-divider) bg-black/5 dark:bg-white/10 px-3 py-1.5 text-xs font-semibold text-(--os-text) hover:bg-[#7940ea] hover:text-white transition-colors"
        >
          System Settings…
        </button>
        <button
          onClick={() => windowActions.open("notes")}
          className="rounded-lg bg-[#7940ea] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#8c4bff] transition-colors"
        >
          Club Charter
        </button>
      </div>
    </div>
  )
}
