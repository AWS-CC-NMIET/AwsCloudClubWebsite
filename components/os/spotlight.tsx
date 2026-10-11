// components/os/spotlight.tsx
// Spotlight (⌘K): search apps, team members, events and projects

"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { CalendarDays, FileText, Search, User } from "lucide-react"
import { systemActions, windowActions } from "@/lib/aws-store"
import { APPS_META, windowTitleOf, type AppId } from "@/lib/aws-apps"
import { useEvents, useProjects, useTeam } from "@/lib/club-data"
import { AppIcon } from "./app-icon"
import { useSession } from "@/lib/session"
import { isAppVisible } from "@/lib/open-guard"

interface Result {
  key: string
  title: string
  subtitle: string
  kind: "App" | "Team" | "Event" | "Project"
  appId: AppId
  payload?: { focusId: string }
  icon?: React.ReactNode
}

const HIDDEN_FROM_SEARCH: AppId[] = ["about-system"]

export function Spotlight() {
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const team = useTeam()
  const events = useEvents()
  const projects = useProjects()
  const { isAdmin } = useSession()

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase()
    const apps: Result[] = (Object.values(APPS_META) as (typeof APPS_META)[AppId][])
      .filter(m => !HIDDEN_FROM_SEARCH.includes(m.id) && isAppVisible(m.id, isAdmin))
      .filter(
        m =>
          !q ||
          windowTitleOf(m.id).toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.spotlight.description.toLowerCase().includes(q) ||
          m.spotlight.keywords.some(k => k.includes(q))
      )
      .map(m => ({
        key: `app-${m.id}`,
        title: windowTitleOf(m.id),
        subtitle: m.spotlight.description,
        kind: "App" as const,
        appId: m.id,
        icon: <AppIcon id={m.id} size={28} />,
      }))

    if (q.length < 2) return apps.slice(0, 8)

    const people: Result[] = team.data
      .filter(m => m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q))
      .slice(0, 5)
      .map(m => ({ key: `team-${m.id}`, title: m.name, subtitle: m.role, kind: "Team", appId: "team", payload: { focusId: m.id }, icon: <User className="size-5 text-[#b07a4f]" /> }))

    const evts: Result[] = events.data
      .filter(e => e.title.toLowerCase().includes(q))
      .slice(0, 4)
      .map(e => ({ key: `event-${e.id}`, title: e.title, subtitle: `${e.date} · ${e.location}`, kind: "Event", appId: "calendar", payload: { focusId: e.id }, icon: <CalendarDays className="size-5 text-[#e8590c]" /> }))

    const projs: Result[] = projects.data
      .filter(p => p.title.toLowerCase().includes(q) || p.author?.toLowerCase().includes(q))
      .slice(0, 4)
      .map(p => ({ key: `project-${p.id}`, title: p.title, subtitle: `by ${p.author}`, kind: "Project", appId: "finder", icon: <FileText className="size-5 text-red-500" /> }))

    return [...apps.slice(0, 5), ...people, ...evts, ...projs]
  }, [query, team.data, events.data, projects.data, isAdmin])

  useEffect(() => setActive(0), [query])

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" })
  }, [active])

  const close = () => systemActions.setSpotlightOpen(false)
  const choose = (r?: Result) => {
    if (!r) return
    windowActions.open(r.appId, r.payload)
    close()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault()
      close()
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive(i => Math.min(results.length - 1, i + 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive(i => Math.max(0, i - 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      choose(results[active])
    }
  }

  return (
    <div onClick={close} className="pointer-events-auto fixed inset-0 z-[1200] flex items-start justify-center bg-black/40 px-4 pt-24 backdrop-blur-sm">
      <motion.div
        onClick={e => e.stopPropagation()}
        initial={{ scale: 0.96, opacity: 0, y: -10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: -10 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-black/10 bg-white/95 text-neutral-900 shadow-2xl backdrop-blur-2xl dark:border-white/15 dark:bg-[#1e1e26]/97 dark:text-white"
        role="dialog"
        aria-label="Spotlight Search"
      >
        <div className="flex items-center gap-3 border-b border-black/10 px-4 py-3 dark:border-white/10">
          <Search className="size-5 shrink-0 text-neutral-400" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search apps, team, events, projects…"
            aria-label="Spotlight search"
            className="w-full bg-transparent text-base outline-none placeholder:text-neutral-400"
          />
          <kbd className="rounded border border-black/10 bg-black/5 px-1.5 py-0.5 font-mono text-[11px] text-neutral-500 dark:border-white/20 dark:bg-white/10 dark:text-neutral-300">
            esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-80 overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-neutral-500">No results for “{query}”</p>
          ) : (
            results.map((r, i) => (
              <button
                key={r.key}
                data-index={i}
                onMouseMove={() => setActive(i)}
                onClick={() => choose(r)}
                className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left ${
                  i === active ? "bg-[#7940ea] text-white" : ""
                }`}
              >
                <span className="flex size-7 shrink-0 items-center justify-center">{r.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{r.title}</span>
                  <span className={`block truncate text-xs ${i === active ? "text-white/75" : "text-neutral-500 dark:text-neutral-400"}`}>
                    {r.subtitle}
                  </span>
                </span>
                <span className={`shrink-0 text-[10px] font-semibold uppercase ${i === active ? "text-white/70" : "text-neutral-400"}`}>
                  {r.kind}
                </span>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}
