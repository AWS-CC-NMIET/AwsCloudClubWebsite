// components/apps/admin/sections.tsx
// Admin sections that aren't plain collections: Overview, Messages,
// Members & Admins, and Health.

"use client"

import React, { useState } from "react"
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  FolderOpen,
  Inbox,
  Mail,
  MailOpen,
  RotateCw,
  Shield,
  ShieldCheck,
  Trash2,
  Trophy,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react"
import { api, type HealthReport } from "@/lib/api-client"
import { getAccessToken } from "@/lib/auth-client"
import { systemActions } from "@/lib/aws-store"
import { cn } from "@/lib/utils"
import { useLoad } from "@/lib/use-load"
import { BackButton, EmptyState, LoadingState, MacButton, Toolbar } from "../shared/mac-ui"
import type { Row } from "./collection"

export type SectionId = string

// ── Overview ─────────────────────────────────────────────────────────────────

const fetchStats = () => api.admin.stats().then(r => r.stats as Record<string, number | null>)

export function OverviewSection({ go }: { go: (section: SectionId) => void }) {
  const { data: stats, error, reload } = useLoad(fetchStats)

  const cards: { label: string; value: number | null | undefined; sub?: string; icon: LucideIcon; color: string; section: SectionId }[] = [
    { label: "Events", value: stats?.totalEvents, sub: stats ? `${stats.upcomingEvents ?? 0} upcoming` : undefined, icon: CalendarDays, color: "#e8590c", section: "events" },
    { label: "Team", value: stats?.teamMembers, icon: Users, color: "#b07a4f", section: "team" },
    { label: "Projects", value: stats?.totalProjects, icon: FolderOpen, color: "#0ea5e9", section: "projects" },
    { label: "Achievements", value: stats?.achievements, icon: Trophy, color: "#d97706", section: "achievements" },
    { label: "Messages", value: stats?.totalContacts, sub: stats ? `${stats.unreadContacts ?? 0} unread` : undefined, icon: Inbox, color: "#7940ea", section: "messages" },
    { label: "Members", value: stats?.totalUsers, sub: "signed-up accounts", icon: Shield, color: "#10b981", section: "users" },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Toolbar
        title="Overview"
        subtitle="Everything on the website at a glance"
        right={
          <button onClick={() => reload()} aria-label="Refresh" className="rounded-md p-1.5 text-(--os-text-dim) hover:bg-black/5 dark:hover:bg-white/10">
            <RotateCw className="size-4" />
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-5">
        {error && (
          <p className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-700 dark:text-amber-300">
            <AlertTriangle className="size-4 shrink-0" /> Some numbers couldn’t load ({error}). Check System → Health.
          </p>
        )}
        <div className="grid grid-cols-2 gap-3 @2xl:grid-cols-3">
          {cards.map(c => (
            <button
              key={c.label}
              onClick={() => go(c.section)}
              className="glass-card rim interactive flex flex-col items-start gap-2 p-4 text-left"
            >
              <span className="flex size-8 items-center justify-center rounded-lg" style={{ background: `${c.color}1f` }}>
                <c.icon className="size-4" style={{ color: c.color }} />
              </span>
              <span className="text-2xl font-bold tabular-nums">{stats ? (c.value ?? "—") : "…"}</span>
              <span className="text-[12px] font-medium text-(--os-text)">{c.label}</span>
              {c.sub && <span className="text-[11px] text-(--os-text-dim)">{c.sub}</span>}
            </button>
          ))}
        </div>
        <p className="mt-6 text-[12px] leading-relaxed text-(--os-text-dim)">
          Changes you make here go live on the website within about a minute (public pages are cached at the edge for 60 seconds).
        </p>
      </div>
    </div>
  )
}

// ── Messages (contact form inbox) ────────────────────────────────────────────

const fetchMessages = () => api.contact.list().then(r => r.submissions as Row[])

export function MessagesSection() {
  const { data, error, reload, mutate } = useLoad(fetchMessages)
  const messages = data ?? []
  const status = data ? "ready" : error ? "error" : "loading"
  const setMessages = (update: (list: Row[]) => Row[]) => mutate(list => update(list ?? []))
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = messages.find(m => m.id === selectedId)

  const open = async (m: Row) => {
    setSelectedId(String(m.id))
    if (!m.isRead) {
      setMessages(list => list.map(x => (x.id === m.id ? { ...x, isRead: true } : x)))
      api.contact.markRead(String(m.id), true).catch(() => {})
    }
  }

  const markUnread = async (m: Row) => {
    setMessages(list => list.map(x => (x.id === m.id ? { ...x, isRead: false } : x)))
    setSelectedId(null)
    await api.contact.markRead(String(m.id), false).catch(() => {})
  }

  const remove = async (m: Row) => {
    try {
      await api.contact.delete(String(m.id))
      setMessages(list => list.filter(x => x.id !== m.id))
      setSelectedId(null)
      systemActions.showToast("Message deleted")
    } catch (err) {
      systemActions.showToast((err as Error).message)
    }
  }

  const unread = messages.filter(m => !m.isRead).length

  return (
    <div className="flex min-h-0 min-w-0 flex-1">
      <div className={cn("min-w-0 flex-col border-(--win-divider) @4xl:flex @4xl:w-80 @4xl:flex-none @4xl:border-r", selected ? "hidden" : "flex flex-1")}>
        <Toolbar
          title="Inbox"
          subtitle={`${messages.length} messages${unread ? ` · ${unread} unread` : ""}`}
          right={
            <button onClick={() => reload()} aria-label="Refresh" className="rounded-md p-1.5 text-(--os-text-dim) hover:bg-black/5 dark:hover:bg-white/10">
              <RotateCw className="size-4" />
            </button>
          }
        />
        <div className="flex-1 overflow-y-auto">
          {status === "loading" ? (
            <LoadingState />
          ) : status === "error" ? (
            <EmptyState icon={AlertTriangle} title="Couldn't load messages" action={<MacButton onClick={() => reload()}>Try Again</MacButton>} />
          ) : messages.length === 0 ? (
            <EmptyState icon={Inbox} title="No messages yet" message="Messages sent from the Contact app appear here." />
          ) : (
            messages.map(m => (
              <button
                key={String(m.id)}
                onClick={() => open(m)}
                className={cn(
                  "flex w-full gap-2.5 border-b border-(--win-divider) px-4 py-3 text-left transition-colors",
                  m.id === selectedId ? "bg-(--accent) text-white" : "hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                )}
              >
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", m.isRead ? "bg-transparent" : m.id === selectedId ? "bg-white" : "bg-(--accent)")} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className={cn("truncate text-[13px]", !m.isRead && "font-bold")}>{String(m.name)}</span>
                    <span className={cn("shrink-0 text-[11px]", m.id === selectedId ? "text-white/75" : "text-(--os-text-dim)")}>
                      {formatShortDate(String(m.submittedAt))}
                    </span>
                  </span>
                  <span className="block truncate text-[12px] font-medium">{String(m.subject)}</span>
                  <span className={cn("block truncate text-[12px]", m.id === selectedId ? "text-white/75" : "text-(--os-text-dim)")}>{String(m.message)}</span>
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className={cn("min-w-0 flex-1 flex-col @4xl:flex", selected ? "flex" : "hidden")}>
        {selected ? (
          <>
            <Toolbar
              left={
                <span className="@4xl:hidden">
                  <BackButton onClick={() => setSelectedId(null)} label="Inbox" />
                </span>
              }
              right={
                <>
                  <button onClick={() => markUnread(selected)} aria-label="Mark as unread" title="Mark as unread" className="rounded-md p-1.5 text-(--os-text-dim) hover:bg-black/5 dark:hover:bg-white/10">
                    <MailOpen className="size-4" />
                  </button>
                  <button onClick={() => remove(selected)} aria-label="Delete message" title="Delete" className="rounded-md p-1.5 text-red-500 hover:bg-red-500/10">
                    <Trash2 className="size-4" />
                  </button>
                  <MacButton
                    variant="primary"
                    className="px-2.5 py-1.5"
                    href={`mailto:${String(selected.email)}?subject=${encodeURIComponent(`Re: ${String(selected.subject)}`)}`}
                  >
                    <Mail className="size-3.5" /> Reply
                  </MacButton>
                </>
              }
            />
            <div className="flex-1 overflow-y-auto p-6">
              <h2 className="text-lg font-bold">{String(selected.subject)}</h2>
              <p className="mt-1 text-[12px] text-(--os-text-dim)">
                From <span className="font-semibold text-(--os-text)">{String(selected.name)}</span> &lt;{String(selected.email)}&gt; ·{" "}
                {new Date(String(selected.submittedAt)).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </p>
              <p className="mt-5 whitespace-pre-wrap text-[13px] leading-relaxed select-text">{String(selected.message)}</p>
            </div>
          </>
        ) : (
          <EmptyState icon={Mail} title="No message selected" />
        )}
      </div>
    </div>
  )
}

function formatShortDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const today = new Date()
  return d.toDateString() === today.toDateString()
    ? d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

// ── Members & Admins ─────────────────────────────────────────────────────────

interface UserRow {
  username: string
  email?: string
  name?: string
  status?: string
  enabled?: boolean
  createdAt?: string
  isAdmin: boolean
  isYou?: boolean
}

const fetchUsers = () =>
  api.admin.users
    .list()
    .then(r => (r.users as UserRow[]).sort((a, b) => Number(b.isAdmin) - Number(a.isAdmin) || (a.email ?? "").localeCompare(b.email ?? "")))

export function UsersSection() {
  const [busy, setBusy] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const { data, error, reload } = useLoad(fetchUsers)
  const users = data ?? []
  const status = data ? "ready" : error ? "error" : "loading"

  const toggleAdmin = async (u: UserRow) => {
    setBusy(u.username)
    try {
      if (u.isAdmin) await api.admin.users.demote(u.username)
      else await api.admin.users.promote(u.username)
      systemActions.showToast(u.isAdmin ? `${u.email ?? u.username} is no longer an admin` : `${u.email ?? u.username} is now an admin`)
      await reload()
    } catch (err) {
      systemActions.showToast((err as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const q = query.trim().toLowerCase()
  const visible = users.filter(u => !q || `${u.email} ${u.name} ${u.username}`.toLowerCase().includes(q))

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Toolbar
        title="Members & Admins"
        subtitle={`${users.length} accounts · ${users.filter(u => u.isAdmin).length} admins`}
        right={
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search members"
            className="w-36 rounded-md border border-(--win-divider) bg-white px-2.5 py-1 text-[12px] outline-none focus:border-(--accent) dark:bg-white/[0.06]"
          />
        }
      />
      <p className="border-b border-(--win-divider) px-5 py-2.5 text-[11px] leading-relaxed text-(--os-text-dim)">
        Admins can edit everything on the website. Changes apply the next time that person signs in.
      </p>
      <div className="flex-1 overflow-y-auto">
        {status === "loading" ? (
          <LoadingState />
        ) : status === "error" ? (
          <EmptyState icon={AlertTriangle} title="Couldn't load members" message="Check System → Health." action={<MacButton onClick={() => reload()}>Try Again</MacButton>} />
        ) : (
          visible.map(u => (
            <div key={u.username} className="flex items-center gap-3 border-b border-(--win-divider) px-5 py-2.5">
              <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white", u.isAdmin ? "bg-(--accent)" : "bg-neutral-400 dark:bg-neutral-600")}>
                {(u.name || u.email || "?").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">
                  {u.name || u.email || u.username}
                  {u.isYou && <span className="ml-1.5 text-[11px] text-(--os-text-dim)">(you)</span>}
                </p>
                <p className="truncate text-[11px] text-(--os-text-dim)">
                  {u.email} {u.status && u.status !== "CONFIRMED" && `· ${u.status.toLowerCase().replace(/_/g, " ")}`}
                </p>
              </div>
              {u.isAdmin && (
                <span className="hidden items-center gap-1 rounded-full bg-(--accent)/12 px-2 py-0.5 text-[10px] font-bold uppercase text-(--accent) @lg:inline-flex">
                  <ShieldCheck className="size-3" /> Admin
                </span>
              )}
              <MacButton
                className="px-2.5 py-1"
                disabled={busy === u.username || (u.isAdmin && u.isYou)}
                onClick={() => toggleAdmin(u)}
              >
                {busy === u.username ? "…" : u.isAdmin ? "Remove admin" : "Make admin"}
              </MacButton>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── Health ───────────────────────────────────────────────────────────────────

async function fetchHealth(): Promise<HealthReport> {
  try {
    const res = await fetch("/api/health", { headers: { Authorization: `Bearer ${getAccessToken() ?? ""}` }, cache: "no-store" })
    return (await res.json()) as HealthReport
  } catch {
    return { ok: false }
  }
}

export function HealthSection() {

  const { data: report, loading, reload } = useLoad(fetchHealth)

  const rows: { name: string; ok: boolean; detail?: string }[] = report?.services
    ? [
        ...Object.values(report.services.dynamodb).map(t => ({ name: `DynamoDB · ${t.table}`, ok: t.ok, detail: t.detail })),
        { name: `S3 · ${report.services.s3.bucket}`, ok: report.services.s3.ok, detail: report.services.s3.detail },
        { name: "SES · contact email", ok: report.services.ses.ok, detail: report.services.ses.detail },
        { name: "Cognito · admin user management", ok: report.services.cognitoAdminApi.ok, detail: report.services.cognitoAdminApi.detail },
      ]
    : []

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Toolbar
        title="Health"
        subtitle="Live checks of every AWS service the website uses"
        right={
          <button onClick={() => reload()} aria-label="Run checks again" className="rounded-md p-1.5 text-(--os-text-dim) hover:bg-black/5 dark:hover:bg-white/10">
            <RotateCw className={cn("size-4", loading && "animate-spin")} />
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-5">
        {loading && !report ? (
          <LoadingState label="Running checks…" />
        ) : (
          <div className="mx-auto max-w-2xl space-y-5">
            <div className={cn("flex items-center gap-3 rounded-xl border p-4", report?.ok ? "border-emerald-500/30 bg-emerald-500/10" : "border-red-500/30 bg-red-500/10")}>
              {report?.ok ? <CheckCircle2 className="size-6 text-emerald-500" /> : <XCircle className="size-6 text-red-500" />}
              <div>
                <p className="text-[13px] font-bold">{report?.ok ? "All systems operational" : "Something needs attention"}</p>
                <p className="text-[12px] text-(--os-text-dim)">
                  {report?.ok ? "Every service responded." : "See the failing checks below — usually a missing IAM permission or environment variable."}
                </p>
              </div>
            </div>

            {rows.length > 0 && (
              <div className="glass-card rim divide-y divide-(--win-divider)">
                {rows.map(r => (
                  <div key={r.name} className="flex items-start gap-3 px-4 py-2.5">
                    {r.ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-red-500" />}
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium">{r.name}</p>
                      {r.detail && <p className="break-words font-mono text-[11px] text-(--os-text-dim)">{r.detail}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {report?.config && (
              <div className="glass-card rim divide-y divide-(--win-divider) text-[12px]">
                {Object.entries(report.config).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-3 px-4 py-2">
                    <span className="text-(--os-text-dim)">{key}</span>
                    <span className={cn("font-medium", value === false && "text-red-500")}>
                      {value === true ? "set" : value === false ? "missing" : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
