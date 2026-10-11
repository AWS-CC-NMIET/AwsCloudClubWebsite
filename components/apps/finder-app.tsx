// components/apps/finder-app.tsx
// Projects — a Finder window over the club's real project showcase

"use client"

import React, { useMemo, useState } from "react"
import {
  ExternalLink,
  FileText,
  Folder,
  FolderOpen,
  Github,
  LayoutGrid,
  List,
  Search,
} from "lucide-react"
import { windowActions } from "@/lib/aws-store"
import { useProjects, type Project } from "@/lib/club-data"
import { sanitizeUrl, cn } from "@/lib/utils"
import {
  AppShell,
  ChipBar,
  EmptyState,
  LoadingState,
  MacButton,
  OfflineNotice,
  Sidebar,
  SidebarItem,
  SidebarSection,
  Toolbar,
} from "./shared/mac-ui"
import { Stagger, StaggerItem } from "./shared/motion"

type FolderId = "All" | Project["status"]

const STATUS_COLORS: Record<string, string> = {
  Production: "#3AAA72",
  Development: "#E88800",
  Beta: "#4A90C0",
}

const fileName = (p: Project) => `${p.title.toLowerCase().replace(/\s+/g, "-")}.pdf`

function formatDate(iso?: string) {
  if (!iso) return "—"
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export function FinderApp() {
  const projects = useProjects()
  const [folder, setFolder] = useState<FolderId>("All")
  const [view, setView] = useState<"icons" | "list">("icons")
  const [query, setQuery] = useState("")
  const [active, setActive] = useState<Project | null>(null)

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: projects.data.length }
    for (const p of projects.data) c[p.status] = (c[p.status] ?? 0) + 1
    return c
  }, [projects.data])

  const visible = projects.data.filter(p => {
    if (folder !== "All" && p.status !== folder) return false
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      p.title.toLowerCase().includes(q) ||
      p.author?.toLowerCase().includes(q) ||
      p.stack?.some(s => s.toLowerCase().includes(q))
    )
  })

  const folders: { id: FolderId; label: string }[] = [
    { id: "All", label: "All Projects" },
    { id: "Production", label: "Production" },
    { id: "Beta", label: "Beta" },
    { id: "Development", label: "Development" },
  ]

  const isLoading = projects.status === "loading" && projects.data.length === 0

  return (
    <AppShell>
      <Sidebar hideOnNarrow>
        <SidebarSection title="Projects">
          {folders.map(f => (
            <SidebarItem
              key={f.id}
              icon={folder === f.id ? FolderOpen : Folder}
              iconClassName="text-sky-500"
              label={f.label}
              count={isLoading ? "—" : counts[f.id] ?? 0}
              active={folder === f.id && !active}
              onClick={() => {
                setFolder(f.id)
                setActive(null)
              }}
            />
          ))}
        </SidebarSection>
        <SidebarSection title="Locations">
          <SidebarItem icon={Folder} iconClassName="text-sky-500" label="About Us" onClick={() => windowActions.open("about")} />
          <SidebarItem icon={Folder} iconClassName="text-sky-500" label="Resources" onClick={() => windowActions.open("safari")} />
        </SidebarSection>
      </Sidebar>

      <div className="flex min-w-0 flex-1 flex-col">
        {active ? (
          <ProjectReport project={active} onBack={() => setActive(null)} />
        ) : (
          <>
            <Toolbar
              title={folders.find(f => f.id === folder)?.label}
              subtitle={isLoading ? "Loading…" : `${visible.length} ${visible.length === 1 ? "item" : "items"}`}
              right={
                <>
                  <div className="relative hidden @lg:block">
                    <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-(--os-text-dim)" />
                    <input
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Search"
                      className="w-40 rounded-md border border-(--win-divider) bg-black/[0.04] py-1 pl-7 pr-2 text-xs text-(--os-text) outline-none placeholder:text-(--os-text-dim) focus:border-(--accent) dark:bg-white/[0.06]"
                    />
                  </div>
                  <div className="flex rounded-md border border-(--win-divider) p-0.5">
                    {(["icons", "list"] as const).map(v => {
                      const Icon = v === "icons" ? LayoutGrid : List
                      return (
                        <button
                          key={v}
                          onClick={() => setView(v)}
                          aria-label={`${v} view`}
                          className={cn(
                            "rounded px-1.5 py-0.5",
                            view === v ? "bg-black/10 text-(--os-text) dark:bg-white/15" : "text-(--os-text-dim)"
                          )}
                        >
                          <Icon className="size-3.5" />
                        </button>
                      )
                    })}
                  </div>
                </>
              }
            />
            <ChipBar
              options={folders.map(f => ({ id: f.id, label: f.label, count: counts[f.id] ?? 0 }))}
              value={folder}
              onChange={setFolder}
              className="border-b border-(--win-divider)"
            />
            <OfflineNotice show={projects.status === "error" && !projects.fromFallback} />
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <LoadingState label="Loading projects…" />
              ) : visible.length === 0 ? (
                <EmptyState
                  icon={FolderOpen}
                  title={projects.status === "error" ? "Projects are coming back soon" : query ? "No matches" : "This folder is empty"}
                  message={
                    projects.status === "error"
                      ? "We couldn't reach the project showcase right now. Please check back in a little while."
                      : "Member projects show up here as soon as they're published."
                  }
                />
              ) : view === "icons" ? (
                <Stagger key={folder} className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-x-4 gap-y-6">
                  {visible.map(p => (
                    <StaggerItem key={p.id}>
                    <button
                      onClick={() => setActive(p)}
                      onDoubleClick={() => setActive(p)}
                      className="group flex w-full flex-col items-center gap-2 rounded-lg p-2 text-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                    >
                      <DocIcon project={p} />
                      <div className="w-full">
                        <p className="line-clamp-2 text-xs font-semibold text-(--os-text)">{p.title}</p>
                        <p className="truncate text-[11px] text-(--os-text-dim)">by {p.author}</p>
                      </div>
                    </button>
                    </StaggerItem>
                  ))}
                </Stagger>
              ) : (
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-(--win-divider) text-[11px] text-(--os-text-dim)">
                      <th className="px-2 py-1.5 font-medium">Name</th>
                      <th className="hidden px-2 py-1.5 font-medium @lg:table-cell">Author</th>
                      <th className="px-2 py-1.5 font-medium">Status</th>
                      <th className="hidden px-2 py-1.5 font-medium @2xl:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((p, i) => (
                      <tr
                        key={p.id}
                        onClick={() => setActive(p)}
                        className={cn("cursor-pointer hover:bg-(--accent)/10", i % 2 === 1 && "bg-black/[0.02] dark:bg-white/[0.02]")}
                      >
                        <td className="px-2 py-1.5">
                          <span className="flex items-center gap-2">
                            <FileText className="size-4 shrink-0 text-red-500" />
                            <span className="truncate font-medium text-(--os-text)">{p.title}</span>
                          </span>
                        </td>
                        <td className="hidden px-2 py-1.5 text-(--os-text-dim) @lg:table-cell">{p.author}</td>
                        <td className="px-2 py-1.5">
                          <span className="flex items-center gap-1.5 text-xs text-(--os-text)">
                            <span className="size-2 rounded-full" style={{ background: STATUS_COLORS[p.status] ?? "#999" }} />
                            {p.status}
                          </span>
                        </td>
                        <td className="hidden px-2 py-1.5 text-(--os-text-dim) @2xl:table-cell">{formatDate(p.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}

function DocIcon({ project }: { project: Project }) {
  return (
    <div className="relative flex h-24 w-[72px] flex-col justify-between overflow-hidden rounded-md border border-black/10 bg-white shadow-sm transition-transform group-hover:-translate-y-0.5 group-hover:shadow-md">
      <div className="absolute right-0 top-0 size-4 rounded-bl-sm border-b border-l border-black/10 bg-neutral-100" />
      <div className="space-y-1 p-2">
        <span className="inline-block rounded bg-red-500 px-1 text-[8px] font-extrabold text-white">PDF</span>
        <div className="h-0.5 w-10 rounded-full bg-neutral-200" />
        <div className="h-0.5 w-12 rounded-full bg-neutral-200" />
        <div className="h-0.5 w-8 rounded-full bg-neutral-200" />
      </div>
      <div className="h-1.5 w-full" style={{ background: STATUS_COLORS[project.status] ?? "#999" }} />
    </div>
  )
}

function ProjectReport({ project, onBack }: { project: Project; onBack: () => void }) {
  const github = project.githubUrl ? sanitizeUrl(project.githubUrl) : null
  const live = project.liveUrl ? sanitizeUrl(project.liveUrl) : null
  return (
    <>
      <Toolbar
        left={
          <button
            onClick={onBack}
            className="flex items-center gap-0.5 rounded-md px-1 py-0.5 text-[13px] font-medium text-(--accent) hover:bg-black/5 dark:hover:bg-white/10"
          >
            ‹ Projects
          </button>
        }
        title={<span className="flex items-center gap-1.5"><FileText className="size-3.5 text-red-500" /> {fileName(project)}</span>}
        right={
          <>
            {github && github !== "#" && (
              <MacButton href={github} className="px-2.5 py-1">
                <Github className="size-3.5" /> Code
              </MacButton>
            )}
            {live && live !== "#" && (
              <MacButton variant="primary" href={live} className="px-2.5 py-1">
                <ExternalLink className="size-3.5" /> Demo
              </MacButton>
            )}
          </>
        }
      />
      <div className="flex-1 overflow-y-auto bg-black/[0.04] p-4 @2xl:p-6 dark:bg-black/25">
        <article className="mx-auto flex min-h-[560px] max-w-2xl flex-col rounded-sm border border-black/10 bg-white p-6 text-slate-800 shadow-md @2xl:p-8">
          <div className="mb-5 flex justify-between border-b border-slate-100 pb-2.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">
            <span>AWS Student Builder Group NMIET</span>
            <span className="hidden @lg:inline">Project Report</span>
          </div>
          <h1 className="text-2xl font-bold uppercase leading-tight tracking-tight text-slate-900">{project.title}</h1>
          <p className="mb-5 mt-1 text-[10px] italic text-slate-400">Project Showcase · Doc ID: SBG-PRJ-{project.id.slice(0, 6).toUpperCase()}</p>

          <div className="mb-5 grid grid-cols-2 rounded-sm border border-slate-200 bg-slate-50/60 text-xs">
            <Meta label="Principal Developer" className="border-b border-r">{project.author}</Meta>
            <Meta label="Release Status" className="border-b">
              <span className="inline-flex items-center gap-1">
                <span className="size-2 rounded-full" style={{ background: STATUS_COLORS[project.status] ?? "#999" }} />
                {project.status}
              </span>
            </Meta>
            <Meta label="Report Date" className="border-r">{formatDate(project.createdAt)}</Meta>
            <Meta label="Repository">{github && github !== "#" ? "Open Source (GitHub)" : "Internal"}</Meta>
          </div>

          <div className="mb-5 border-b-2 border-slate-900" />

          <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-900">1. Summary</h2>
          <p className="mb-5 whitespace-pre-line text-sm leading-relaxed text-slate-700">{project.description}</p>

          {project.stack?.length > 0 && (
            <>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-900">2. Tech Stack</h2>
              <div className="mb-5 flex flex-wrap gap-1.5">
                {project.stack.map(t => (
                  <span key={t} className="rounded-sm border border-slate-300 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                    {t}
                  </span>
                ))}
              </div>
            </>
          )}

          {project.imageUrl && (
            <figure className="mb-6 rounded-sm border border-slate-100 bg-slate-50 p-3 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={project.imageUrl} alt={project.title} className="max-h-60 w-full rounded-xs object-cover" />
              <figcaption className="mt-2 text-[10px] italic text-slate-400">Figure 1: Project screenshot.</figcaption>
            </figure>
          )}

          <div className="mt-auto flex justify-between border-t border-slate-100 pt-3 text-[9px] text-slate-400">
            <span>AWS Student Builder Group Showcase</span>
            <span>Page 1 of 1</span>
          </div>
        </article>
      </div>
    </>
  )
}

function Meta({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("border-slate-200 p-2.5", className)}>
      <span className="block text-[10px] font-bold uppercase text-slate-400">{label}</span>
      <span className="font-semibold text-slate-800">{children}</span>
    </div>
  )
}
