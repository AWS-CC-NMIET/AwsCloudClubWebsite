// components/apps/about-app.tsx
// About Us — a Finder window with Quick Look previews of the club's documents

"use client"

import React, { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Award,
  Calendar,
  ChevronRight,
  Eye,
  FileDown,
  FileText,
  Folder,
  FolderOpen,
  Globe,
  Heart,
  Image as ImageIcon,
  Maximize,
  Pause,
  Play,
  Target,
  Users,
  Video,
  Volume2,
  type LucideIcon,
} from "lucide-react"
import { windowActions } from "@/lib/aws-store"
import { ABOUT, CLUB } from "@/lib/club-content"
import { useMemberCount } from "@/lib/club-data"
import { AppShell, BackButton, Sidebar, SidebarItem, SidebarSection, Toolbar } from "./shared/mac-ui"
import { cn } from "@/lib/utils"

type FileId = "intro" | "mission" | "vision" | "whatwedo" | "values"

const FILES: { id: FileId; name: string; kind: string; size: string; icon: LucideIcon; color: string }[] = [
  { id: "intro", name: "Introduction.rtf", kind: "Rich Text Document", size: "1.8 KB", icon: FileText, color: "text-blue-500" },
  { id: "mission", name: "Our_Mission.png", kind: "PNG Image", size: "542 KB", icon: ImageIcon, color: "text-emerald-500" },
  { id: "vision", name: "Our_Vision.mp4", kind: "MPEG-4 Movie", size: "12.4 MB", icon: Video, color: "text-purple-500" },
  { id: "whatwedo", name: "What_We_Do.pdf", kind: "PDF Document", size: "3.1 MB", icon: FileDown, color: "text-rose-500" },
  { id: "values", name: "Core_Values.txt", kind: "Plain Text", size: "382 bytes", icon: FileText, color: "text-amber-500" },
]

const WHAT_WE_DO_ICONS = [Award, Target, Heart, Eye]

export function AboutApp() {
  const [selected, setSelected] = useState<FileId>("intro")
  const [previewOpen, setPreviewOpen] = useState(false)
  const file = FILES.find(f => f.id === selected) ?? FILES[0]

  const open = (id: FileId) => {
    setSelected(id)
    setPreviewOpen(true)
  }

  return (
    <AppShell>
      <Sidebar hideOnNarrow>
        <SidebarSection title="Favorites">
          <SidebarItem icon={FolderOpen} label="About Us" active />
          <SidebarItem icon={Users} label="Team" onClick={() => windowActions.open("team")} />
          <SidebarItem icon={Folder} label="Projects" onClick={() => windowActions.open("finder")} />
          <SidebarItem icon={Calendar} label="Events" onClick={() => windowActions.open("calendar")} />
        </SidebarSection>
        <SidebarSection title="Chapter">
          <div className="space-y-1 px-2.5 text-[11px] leading-relaxed text-(--os-text-dim)">
            <p className="font-semibold text-(--os-text)">{CLUB.shortName}</p>
            <p>Founded {CLUB.foundedShort}</p>
            <p>{CLUB.city}</p>
          </div>
        </SidebarSection>
      </Sidebar>

      <div className="flex min-w-0 flex-1">
        {/* ── File list ─────────────────────────────────────────────────────── */}
        <div
          className={cn(
            "min-w-0 flex-col border-(--win-divider) @3xl:flex @3xl:w-64 @3xl:flex-none @3xl:border-r",
            previewOpen ? "hidden" : "flex flex-1"
          )}
        >
          <Toolbar title="About Us" subtitle={`${FILES.length} items`} />
          <div className="flex-1 space-y-0.5 overflow-y-auto p-2">
            {FILES.map(f => {
              const active = f.id === selected
              return (
                <button
                  key={f.id}
                  onClick={() => open(f.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                    active ? "bg-(--accent) text-white" : "hover:bg-black/5 dark:hover:bg-white/10"
                  )}
                >
                  <f.icon className={cn("size-5 shrink-0", active ? "text-white" : f.color)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">{f.name}</p>
                    <p className={cn("text-[11px]", active ? "text-white/75" : "text-(--os-text-dim)")}>
                      {f.kind} · {f.size}
                    </p>
                  </div>
                  <ChevronRight className="size-3.5 shrink-0 opacity-50 @3xl:hidden" />
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Quick Look preview ────────────────────────────────────────────── */}
        <div className={cn("min-w-0 flex-1 flex-col @3xl:flex", previewOpen ? "flex" : "hidden")}>
          <Toolbar
            left={
              <span className="@3xl:hidden">
                <BackButton onClick={() => setPreviewOpen(false)} label="About Us" />
              </span>
            }
            title={file.name}
            subtitle={file.kind}
          />
          <div className="flex-1 overflow-y-auto bg-black/[0.03] p-5 dark:bg-black/20">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="mx-auto w-full max-w-2xl"
              >
                <Preview id={selected} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function Preview({ id }: { id: FileId }) {
  const { display: members } = useMemberCount()
  const [playing, setPlaying] = useState(false)

  if (id === "intro") {
    const [first, ...rest] = ABOUT.intro
    const [before, after] = first.split(CLUB.name)
    return (
      <article className="rounded-xl border border-(--win-divider) bg-white p-6 shadow-sm dark:bg-[#202027]">
        <header className="mb-4 border-b border-(--win-divider) pb-4 text-center">
          <h1 className="text-xl font-bold text-(--os-text)">{ABOUT.introTitle}</h1>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-(--os-text-dim)">Official Document</p>
        </header>
        <div className="space-y-4 text-sm leading-relaxed text-(--os-text)">
          <p>
            {before}
            <strong>{CLUB.name}</strong>
            {after}
          </p>
          {rest.map(p => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-(--win-divider) pt-4 text-[11px] text-(--os-text-dim)">
          <span className="flex items-center gap-1.5"><Calendar className="size-3.5" /> Founded {CLUB.foundedShort}</span>
          <span className="flex items-center gap-1.5"><Globe className="size-3.5" /> AWS Student Builder Groups Global Network</span>
        </footer>
      </article>
    )
  }

  if (id === "mission") {
    return (
      <div className="relative overflow-hidden rounded-xl border border-(--win-divider) bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md">
          <Target className="size-8" />
        </div>
        <h2 className="text-lg font-bold text-(--os-text)">OUR MISSION</h2>
        <div className="mx-auto mb-4 mt-2 h-1 w-10 rounded-full bg-emerald-500" />
        <p className="mx-auto max-w-md text-sm font-medium leading-relaxed text-(--os-text)">&ldquo;{ABOUT.mission}&rdquo;</p>
        <p className="absolute bottom-2 right-3 text-[9px] font-semibold text-(--os-text-dim)">Our_Mission.png (542 × 380)</p>
      </div>
    )
  }

  if (id === "vision") {
    return (
      <div className="relative flex aspect-video w-full flex-col justify-between overflow-hidden rounded-xl bg-[#1a1240] p-4 shadow-md">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-purple-950/80 to-indigo-900/60" />
        <div className="relative z-10 flex items-center justify-between font-mono text-[10px] text-white/60">
          <span>{playing ? "00:16" : "00:00"} / 02:40</span>
          <span className="flex items-center gap-1"><span className="size-1.5 animate-pulse rounded-full bg-red-500" /> 1080p HD</span>
        </div>
        <div className="relative z-10 px-6 text-center">
          {playing ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300">
                <Eye className="size-5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Our Vision</h3>
              <p className="mx-auto max-w-sm text-sm font-medium leading-relaxed text-purple-100/90">{ABOUT.vision}</p>
            </motion.div>
          ) : (
            <button onClick={() => setPlaying(true)} className="mx-auto flex flex-col items-center gap-3">
              <span className="flex size-14 items-center justify-center rounded-full bg-white/95 text-indigo-950 shadow-md transition-transform hover:scale-110">
                <Play className="ml-1 size-6 fill-current" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/60">Play Vision Video</span>
            </button>
          )}
        </div>
        <div className="relative z-10 flex items-center gap-3 rounded-lg bg-black/40 p-2 text-white backdrop-blur-md">
          <button onClick={() => setPlaying(p => !p)} aria-label={playing ? "Pause" : "Play"}>
            {playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
          </button>
          <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/20">
            <div className="absolute inset-y-0 left-0 rounded-full bg-purple-500 transition-all" style={{ width: playing ? "35%" : "4%" }} />
          </div>
          <Volume2 className="size-4 text-white/80" />
          <Maximize className="size-4 text-white/80" />
        </div>
      </div>
    )
  }

  if (id === "whatwedo") {
    return (
      <article className="rounded-xl border border-(--win-divider) bg-white p-5 shadow-sm dark:bg-[#202027]">
        <header className="mb-4 flex items-center justify-between border-b border-(--win-divider) pb-3">
          <span className="rounded bg-(--accent)/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-(--accent)">Page 1 of 1</span>
          <span className="text-xs font-semibold text-(--os-text)">What We Do</span>
        </header>
        <div className="grid gap-3 @2xl:grid-cols-2">
          {ABOUT.whatWeDo.map((card, i) => {
            const Icon = WHAT_WE_DO_ICONS[i] ?? Award
            return (
              <div key={card.title} className="rounded-lg border border-(--win-divider) bg-black/[0.02] p-3.5 dark:bg-white/[0.03]">
                <div className="mb-2 flex size-7 items-center justify-center rounded-lg" style={{ background: `${card.color}1f` }}>
                  <Icon className="size-4" style={{ color: card.color }} />
                </div>
                <h4 className="mb-1 text-xs font-bold text-(--os-text)">{card.title}</h4>
                <p className="text-[11px] leading-relaxed text-(--os-text-dim)">{card.desc}</p>
              </div>
            )
          })}
        </div>
      </article>
    )
  }

  // Core_Values.txt
  const lines: { text: string; cls?: string; name?: string }[] = [
    { text: "# AWS Student Builder Group Values", cls: "font-bold text-indigo-300" },
    { text: "" },
    ...ABOUT.values.map(v => ({ name: v.name, text: v.text.replace("{members}", members) })),
    { text: "" },
    { text: "~ [End of File]", cls: "text-slate-500" },
  ]
  return (
    <div className="rounded-xl border border-white/10 bg-[#1A1A24] p-4 font-mono text-xs text-slate-300 shadow-sm">
      <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2 text-slate-400">
        <span>Core_Values.txt</span>
        <span className="text-[10px]">UTF-8</span>
      </div>
      <div className="flex gap-3 leading-relaxed">
        <div className="flex select-none flex-col border-r border-white/5 pr-2 text-right text-slate-600">
          {lines.map((_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          {lines.map((line, i) => (
            <p key={i} className={cn("min-h-[1.5em] whitespace-pre-wrap", line.cls)}>
              {line.name ? (
                <>
                  <span className="font-bold text-amber-500">{i - 1}. {line.name}</span> — {line.text}
                </>
              ) : (
                line.text
              )}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
