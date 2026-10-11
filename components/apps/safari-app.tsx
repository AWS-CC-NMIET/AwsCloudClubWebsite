// components/apps/safari-app.tsx
// Resources — a Safari "Favorites" start page of curated AWS learning links

"use client"

import React, { useMemo, useState } from "react"
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Code,
  FileText,
  Lock,
  RotateCw,
  Search,
  Star,
  Video,
  type LucideIcon,
} from "lucide-react"
import type { LearningResource, ResourceType } from "@/lib/club-content"
import { useResources } from "@/lib/club-data"
import { sanitizeUrl, cn } from "@/lib/utils"
import { AppShell, ChipBar, EmptyState, OfflineNotice, Sidebar, SidebarItem, SidebarSection } from "./shared/mac-ui"
import { Stagger, StaggerItem } from "./shared/motion"

const TYPE_STYLE: Record<ResourceType, { icon: LucideIcon; bg: string; label: string }> = {
  Course: { icon: BookOpen, bg: "linear-gradient(135deg,#10b981,#047857)", label: "Course" },
  Video: { icon: Video, bg: "linear-gradient(135deg,#6366f1,#4338ca)", label: "Video" },
  Document: { icon: FileText, bg: "linear-gradient(135deg,#ef4444,#b91c1c)", label: "Docs" },
  Tool: { icon: Code, bg: "linear-gradient(135deg,#f59e0b,#b45309)", label: "Lab" },
}

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

export function SafariApp() {
  const resources = useResources()
  const [category, setCategory] = useState<string>("All")
  const [query, setQuery] = useState("")

  const categories = useMemo(() => Array.from(new Set(resources.data.map(r => r.category))), [resources.data])

  const filtered = resources.data.filter(r => {
    if (category === "Featured" && !r.featured) return false
    if (category !== "All" && category !== "Featured" && r.category !== category) return false
    const q = query.trim().toLowerCase()
    return !q || r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q) || hostOf(r.url).includes(q)
  })

  const grouped = useMemo(() => {
    const map = new Map<string, LearningResource[]>()
    for (const r of filtered) map.set(r.category, [...(map.get(r.category) ?? []), r])
    return Array.from(map.entries())
  }, [filtered])

  const address = category === "All" ? "favorites" : `favorites/${category.toLowerCase().replace(/\s+/g, "-")}`
  const chipOptions = ["All", "Featured", ...categories].map(c => ({ id: c, label: c }))

  return (
    <AppShell className="flex-col">
      {/* ── Browser chrome ───────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center gap-2 border-b border-(--win-divider) bg-(--titlebar-bg) px-3 py-2">
        <div className="hidden items-center gap-0.5 text-(--os-text-dim) @lg:flex">
          <ChevronLeft className="size-4 opacity-40" />
          <ChevronRight className="size-4 opacity-40" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-(--win-divider) bg-black/[0.05] px-3 py-1 dark:bg-white/[0.07]">
          {query ? <Search className="size-3.5 shrink-0 text-(--os-text-dim)" /> : <Lock className="size-3 shrink-0 text-emerald-500" />}
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={`sbg://${address}`}
            aria-label="Search resources"
            className="min-w-0 flex-1 bg-transparent text-center text-xs text-(--os-text) outline-none placeholder:text-(--os-text) focus:text-left focus:placeholder:text-(--os-text-dim)"
          />
        </div>
        <button onClick={() => setQuery("")} aria-label="Clear search" className="rounded p-1 text-(--os-text-dim) hover:bg-black/5 dark:hover:bg-white/10">
          <RotateCw className="size-3.5" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        <Sidebar hideOnNarrow>
          <SidebarSection title="Favorites">
            <SidebarItem icon={Star} iconClassName="text-amber-500" label="All Resources" count={resources.data.length} active={category === "All"} onClick={() => setCategory("All")} />
            <SidebarItem icon={Star} iconClassName="text-amber-500" label="Featured" count={resources.data.filter(r => r.featured).length} active={category === "Featured"} onClick={() => setCategory("Featured")} />
          </SidebarSection>
          <SidebarSection title="Categories">
            {categories.map(c => (
              <SidebarItem
                key={c}
                icon={BookOpen}
                label={c}
                count={resources.data.filter(r => r.category === c).length}
                active={category === c}
                onClick={() => setCategory(c)}
              />
            ))}
          </SidebarSection>
        </Sidebar>

        <div className="flex min-w-0 flex-1 flex-col">
          <ChipBar options={chipOptions} value={category} onChange={setCategory} className="border-b border-(--win-divider)" />
          <OfflineNotice show={resources.status === "error" && !resources.fromFallback} />
          <div className="flex-1 overflow-y-auto px-5 py-6 @2xl:px-8">
            {filtered.length === 0 ? (
              <EmptyState icon={Search} title="No results" message={`Nothing matches “${query}”.`} />
            ) : (
              <div className="mx-auto max-w-3xl space-y-8">
                <div>
                  <h1 className="text-2xl font-bold text-(--os-text)">Favorites</h1>
                  <p className="mt-1 text-xs text-(--os-text-dim)">
                    Hand-picked AWS courses, docs, labs and videos. Links open in a new tab.
                  </p>
                </div>
                {grouped.map(([cat, items]) => (
                  <section key={cat}>
                    <h2 className="mb-3 text-[13px] font-bold text-(--os-text)">{cat}</h2>
                    <Stagger className="grid grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-x-3 gap-y-5">
                      {items.map(r => (
                        <StaggerItem key={r.id}>
                          <FavoriteTile resource={r} />
                        </StaggerItem>
                      ))}
                    </Stagger>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function FavoriteTile({ resource }: { resource: LearningResource }) {
  const style = TYPE_STYLE[resource.type] ?? TYPE_STYLE.Tool
  const Icon = style.icon
  return (
    <a
      href={sanitizeUrl(resource.url)}
      target="_blank"
      rel="noopener noreferrer"
      title={`${resource.name} — ${hostOf(resource.url)}`}
      className="group flex flex-col items-center gap-1.5 text-center"
    >
      <div className="relative">
        <div
          className="flex size-16 items-center justify-center rounded-2xl text-white shadow-md transition-transform group-hover:-translate-y-0.5 group-hover:shadow-lg"
          style={{ background: style.bg }}
        >
          <Icon className="size-7" />
        </div>
        {resource.featured && (
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-amber-400 shadow">
            <Star className="size-3 fill-white text-white" />
          </span>
        )}
      </div>
      <span className="line-clamp-2 text-[11px] font-medium leading-tight text-(--os-text)">{resource.name}</span>
      <span className={cn("max-w-full truncate text-[10px] text-(--os-text-dim)")}>{style.label} · {hostOf(resource.url)}</span>
    </a>
  )
}
