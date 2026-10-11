// components/apps/about-modal.tsx
// "About This Mac"-style dialog for the AWS SBG NMIET chapter

"use client"

import React from "react"
import Image from "next/image"
import { windowActions } from "@/lib/aws-store"
import { CLUB } from "@/lib/club-content"

export function AboutModal() {
  const rows = [
    ["Chapter", CLUB.chapter],
    ["College", CLUB.collegeShort],
    ["Location", CLUB.city],
    ["Founded", CLUB.foundedShort],
    ["SBG Leader", CLUB.leader],
    ["Region", CLUB.region],
  ]

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-4 bg-(--win-bg) p-6 text-center text-(--os-text)">
      <div className="relative size-20">
        <Image src="/logo-full.png" alt="AWS SBG NMIET" width={96} height={96} className="h-full w-full object-contain" unoptimized />
      </div>

      <div>
        <h2 className="text-lg font-extrabold tracking-tight">{CLUB.name}</h2>
        <p className="text-xs text-(--os-text-dim)">{CLUB.chapter} · Official AWS Student Builder Group</p>
      </div>

      <div className="w-full max-w-xs divide-y divide-(--win-divider) rounded-xl border border-(--win-divider) bg-black/5 text-[11px] dark:bg-white/5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 px-3 py-2">
            <span className="text-(--os-text-dim)">{label}</span>
            <span className="truncate font-semibold">{value}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => windowActions.open("about")}
          className="rounded-lg bg-[#7940ea] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#8c4bff]"
        >
          About Us…
        </button>
        <button
          onClick={() => windowActions.open("team")}
          className="rounded-lg border border-(--win-divider) bg-black/5 px-3 py-1.5 text-xs font-semibold text-(--os-text) transition-colors hover:bg-black/10 dark:bg-white/10"
        >
          Meet the Team
        </button>
      </div>
    </div>
  )
}
