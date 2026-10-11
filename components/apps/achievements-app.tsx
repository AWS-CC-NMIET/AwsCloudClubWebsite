// components/apps/achievements-app.tsx
// Achievements — a trophy cabinet of the group's real milestones

"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Award, Calendar, Medal, Star, Target, Trophy, Zap, type LucideIcon } from "lucide-react"
import { useAchievements, type Achievement } from "@/lib/club-data"
import { cn } from "@/lib/utils"
import { AppShell, BackButton, EmptyState, LoadingState, OfflineNotice, Toolbar } from "./shared/mac-ui"

const ICONS: Record<string, LucideIcon> = { Trophy, Medal, Star, Award, Target, Zap }

/** Strip stray quotes and em-dashes that come from pasted admin content. */
const cleanText = (str: string) => (str ? str.replace(/"/g, "").replace(/—/g, ",").replace(/\s+/g, " ").trim() : "")

export function AchievementsApp() {
  const achievements = useAchievements()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const items = achievements.data
  const selected = items.find(a => a.id === selectedId) ?? items[0]
  const shelves = [0, 1, 2].map(s => items.filter((_, i) => i % 3 === s)).filter(s => s.length > 0)

  const select = (id: string) => {
    setSelectedId(id)
    setDetailOpen(true)
  }

  if (achievements.status === "loading" && items.length === 0) {
    return (
      <AppShell>
        <LoadingState label="Loading achievements…" />
      </AppShell>
    )
  }

  if (items.length === 0) {
    return (
      <AppShell className="flex-col">
        <EmptyState
          icon={Trophy}
          title={achievements.status === "error" ? "Achievements are coming back soon" : "The trophy cabinet is being stocked"}
          message={
            achievements.status === "error"
              ? "We couldn't reach the achievements list right now. Please check back in a little while."
              : "Milestones and wins will appear here as the team adds them."
          }
        />
      </AppShell>
    )
  }

  return (
    <AppShell>
      {/* ── Trophy cabinet ──────────────────────────────────────────────────── */}
      <div className={cn("min-w-0 flex-1 flex-col @3xl:flex @3xl:max-w-[50%]", detailOpen ? "hidden" : "flex")}>
        <Toolbar title="Trophy Room" subtitle="Select a trophy to inspect it" />
        <OfflineNotice show={achievements.status === "error" && !achievements.fromFallback} />
        <div className="flex flex-1 flex-col justify-around gap-6 overflow-y-auto bg-gradient-to-b from-black/[0.02] to-black/[0.06] p-5 dark:from-white/[0.02] dark:to-black/30">
          {shelves.map((shelf, s) => (
            <div key={s} className="pt-4">
              <div className="relative z-10 flex flex-wrap items-end justify-around gap-3 px-2">
                {shelf.map(a => (
                  <TrophyItem key={a.id} achievement={a} selected={selected?.id === a.id} onClick={() => select(a.id)} />
                ))}
              </div>
              <div className="mt-1 h-2.5 w-full rounded-md border-t border-amber-600 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 shadow-sm" />
              <div className="mx-auto mt-0.5 h-3 w-[96%] rounded-full bg-black/10 blur-xs" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Detail ──────────────────────────────────────────────────────────── */}
      <div className={cn("min-w-0 flex-1 flex-col border-(--win-divider) @3xl:flex @3xl:border-l", detailOpen ? "flex" : "hidden")}>
        <Toolbar
          left={<span className="@3xl:hidden"><BackButton onClick={() => setDetailOpen(false)} label="Trophies" /></span>}
          title="Inspect Achievement"
          right={
            selected && (
              <span className="rounded-full border border-(--accent)/25 bg-(--accent)/10 px-2 py-0.5 text-[10px] font-bold uppercase text-(--accent)">
                {selected.type}
              </span>
            )
          }
        />
        {selected && <AchievementCard achievement={selected} />}
      </div>
    </AppShell>
  )
}

function TrophyItem({ achievement, selected, onClick }: { achievement: Achievement; selected: boolean; onClick: () => void }) {
  const Icon = ICONS[achievement.iconName] ?? Trophy
  const color = achievement.color || "#FF9900"
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 350, damping: 20 }}
      className="group relative flex flex-col items-center gap-1"
      aria-label={cleanText(achievement.title)}
    >
      <div
        className={cn(
          "flex size-14 items-center justify-center rounded-full border bg-white transition-all dark:bg-[#2a2a32]",
          selected ? "scale-110 shadow-lg" : "border-black/10 opacity-90 dark:border-white/10"
        )}
        style={selected ? { borderColor: color, boxShadow: `0 -4px 14px ${color}55` } : undefined}
      >
        <Icon className="size-7 transition-transform group-hover:scale-110" style={{ color }} />
      </div>
      {selected && (
        <span className="absolute -top-1 right-0 flex size-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: color }} />
          <span className="relative inline-flex size-2.5 rounded-full" style={{ background: color }} />
        </span>
      )}
      <span className="max-w-[88px] truncate text-[10px] font-semibold text-(--os-text-dim)">{cleanText(achievement.title)}</span>
    </motion.button>
  )
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const Icon = ICONS[achievement.iconName] ?? Trophy
  const color = achievement.color || "#FF9900"
  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto p-5">
      <div
        className="relative w-full max-w-md select-text rounded-2xl border border-(--win-divider) bg-white p-6 shadow-md dark:bg-[#22222a]"
        style={{ borderLeft: `5px solid ${color}` }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex size-10 items-center justify-center rounded-xl" style={{ background: `${color}1f` }}>
            <Icon className="size-5" style={{ color }} />
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-(--os-text-dim)">
            <Calendar className="size-3.5" /> {cleanText(achievement.date)}
          </span>
        </div>
        <h2 className="mb-2 text-base font-extrabold uppercase tracking-tight text-(--os-text)">{cleanText(achievement.title)}</h2>
        <p className="text-sm leading-relaxed text-(--os-text-dim)">{cleanText(achievement.description)}</p>
        <div className="mt-6 flex justify-between border-t border-(--win-divider) pt-3 font-mono text-[8px] tracking-tight text-(--os-text-dim)">
          <span>AWS STUDENT BUILDER GROUP NMIET</span>
          <span>RECORD: {achievement.id.slice(0, 8).toUpperCase()}</span>
        </div>
      </div>
    </div>
  )
}
