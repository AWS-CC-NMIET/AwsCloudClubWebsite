// components/apps/profile-app.tsx
// My Profile — an Apple Account–style page for a signed-in member.

"use client"

import React, { useEffect, useRef, useState } from "react"
import {
  AlertTriangle,
  CalendarDays,
  Camera,
  ChevronRight,
  Github,
  Linkedin,
  Loader2,
  LogOut,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"
import { api } from "@/lib/api-client"
import { getStoredUsername, signOut } from "@/lib/auth-client"
import { ACCEPTED_IMAGE_TYPES, uploadImage } from "@/lib/image-upload"
import { useSession } from "@/lib/session"
import { systemActions, windowActions } from "@/lib/aws-store"
import { CLUB } from "@/lib/club-content"
import { sanitizeUrl, cn } from "@/lib/utils"
import { AppShell, LoadingState, MacButton } from "./shared/mac-ui"
import { FormField, type FieldDef } from "./admin/fields"

interface Profile {
  id?: string
  displayName: string
  email: string
  bio?: string
  avatarUrl?: string
  linkedinUrl?: string
  githubUrl?: string
  skills?: string[]
  joinedAt?: string
}

const EDIT_FIELDS: FieldDef[] = [
  { key: "displayName", label: "Name", type: "text", required: true },
  { key: "bio", label: "About you", type: "textarea", placeholder: "What are you learning or building on AWS?" },
  { key: "skills", label: "Skills", type: "tags", placeholder: "e.g. Lambda, Terraform" },
  { key: "linkedinUrl", label: "LinkedIn", type: "url", placeholder: "https://www.linkedin.com/in/…" },
  { key: "githubUrl", label: "GitHub", type: "url", placeholder: "https://github.com/…" },
]

export function ProfileApp({ onLogout }: { onLogout: () => void }) {
  const session = useSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [offline, setOffline] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState(false)
  const avatarInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const { profile: existing } = (await api.profile.get()) as { profile: Profile | null }
        const p = existing ?? ((await api.profile.create({})) as { profile: Profile }).profile
        if (active) setProfile(p)
      } catch {
        if (!active) return
        const email = getStoredUsername() ?? ""
        setProfile({ displayName: email.split("@")[0] || "Cloud Builder", email })
        setOffline(true)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const startEditing = () => {
    setForm({
      displayName: profile?.displayName ?? "",
      bio: profile?.bio ?? "",
      skills: profile?.skills ?? [],
      linkedinUrl: profile?.linkedinUrl ?? "",
      githubUrl: profile?.githubUrl ?? "",
    })
    setError("")
    setEditing(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const { profile: updated } = (await api.profile.update(form)) as { profile: Profile }
      setProfile(updated)
      setEditing(false)
      systemActions.showToast("Profile saved")
    } catch (err) {
      setError((err as Error).message || "Couldn't save your profile")
    } finally {
      setSaving(false)
    }
  }

  const changeAvatar = async (file?: File) => {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage("general", file)
      const { profile: updated } = (await api.profile.update({ avatarUrl: url })) as { profile: Profile }
      setProfile(updated)
    } catch (err) {
      systemActions.showToast((err as Error).message || "Couldn't update your photo")
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <AppShell>
        <LoadingState label="Loading your profile…" />
      </AppShell>
    )
  }

  const initials = (profile?.displayName || "?")
    .split(/\s+/)
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  const memberSince = profile?.joinedAt
    ? new Date(profile.joinedAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : null

  return (
    <AppShell className="flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-xl space-y-6 px-5 py-8">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center">
          <button
            onClick={() => !offline && avatarInput.current?.click()}
            disabled={offline || uploading}
            aria-label="Change profile photo"
            className="group relative size-24 overflow-hidden rounded-full bg-gradient-to-b from-sky-400 to-blue-600 text-3xl font-bold text-white shadow-lg"
          >
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center">{initials}</span>
            )}
            {!offline && (
              <span className="absolute inset-x-0 bottom-0 flex h-7 items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
              </span>
            )}
          </button>
          <input ref={avatarInput} type="file" accept={ACCEPTED_IMAGE_TYPES} className="hidden" onChange={e => changeAvatar(e.target.files?.[0])} />
          <h1 className="mt-3 text-xl font-bold">{profile?.displayName}</h1>
          <p className="text-[13px] text-(--os-text-dim)">{profile?.email}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2 text-[11px]">
            {session.isAdmin && (
              <span className="inline-flex items-center gap-1 rounded-full bg-(--accent)/12 px-2 py-0.5 font-semibold text-(--accent)">
                <ShieldCheck className="size-3" /> Club admin
              </span>
            )}
            {memberSince && <span className="rounded-full bg-black/5 px-2 py-0.5 text-(--os-text-dim) dark:bg-white/10">Member since {memberSince}</span>}
          </div>
        </div>

        {offline && (
          <p className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-[12px] text-amber-700 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            Your profile can’t be loaded right now, so editing is paused. Please try again later.
          </p>
        )}

        {/* ── Profile details ─────────────────────────────────────────────── */}
        {editing ? (
          <form onSubmit={save} className="space-y-4 rounded-2xl border border-(--win-divider) bg-white p-5 dark:bg-white/[0.04]">
            {EDIT_FIELDS.map(field => (
              <FormField key={field.key} field={field} value={form[field.key]} onChange={v => setForm(f => ({ ...f, [field.key]: v }))} />
            ))}
            {error && <p className="text-[12px] text-red-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <MacButton onClick={() => setEditing(false)}>Cancel</MacButton>
              <MacButton variant="primary" type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </MacButton>
            </div>
          </form>
        ) : (
          <Group title="Profile" action={!offline && <button onClick={startEditing} className="text-[12px] font-semibold text-(--accent) hover:underline">Edit</button>}>
            <Row label="About">{profile?.bio || <span className="text-(--os-text-dim)">Add a short bio</span>}</Row>
            <Row label="Skills">
              {profile?.skills?.length ? (
                <span className="flex flex-wrap gap-1">
                  {profile.skills.map(s => (
                    <span key={s} className="rounded-md bg-black/5 px-1.5 py-0.5 text-[11px] font-medium dark:bg-white/10">
                      {s}
                    </span>
                  ))}
                </span>
              ) : (
                <span className="text-(--os-text-dim)">None yet</span>
              )}
            </Row>
            <LinkRow icon={Linkedin} label="LinkedIn" url={profile?.linkedinUrl} />
            <LinkRow icon={Github} label="GitHub" url={profile?.githubUrl} />
          </Group>
        )}

        {/* ── Club ────────────────────────────────────────────────────────── */}
        <Group title="Club">
          <NavRow icon={CalendarDays} label="Upcoming events" onClick={() => windowActions.open("calendar")} />
          <NavRow icon={CalendarDays} label="RSVP on Meetup" href={CLUB.meetupUrl} />
          {session.isAdmin && <NavRow icon={ShieldCheck} label="Admin Panel" onClick={() => windowActions.open("admin")} />}
        </Group>

        <button
          onClick={() => {
            signOut()
            onLogout()
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-(--win-divider) bg-white py-2.5 text-[13px] font-semibold text-red-500 hover:bg-red-500/5 dark:bg-white/[0.04]"
        >
          <LogOut className="size-4" /> Sign Out
        </button>
      </div>
    </AppShell>
  )
}

function Group({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-1.5 flex items-center justify-between px-1">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-(--os-text-dim)">{title}</h2>
        {action}
      </div>
      <div className="divide-y divide-(--win-divider) overflow-hidden rounded-2xl border border-(--win-divider) bg-white dark:bg-white/[0.04]">
        {children}
      </div>
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 px-4 py-3 text-[13px]">
      <span className="w-16 shrink-0 text-(--os-text-dim)">{label}</span>
      <span className="min-w-0 flex-1 break-words">{children}</span>
    </div>
  )
}

function LinkRow({ icon: Icon, label, url }: { icon: LucideIcon; label: string; url?: string }) {
  const safe = url ? sanitizeUrl(url) : ""
  return (
    <div className="flex items-center gap-3 px-4 py-3 text-[13px]">
      <Icon className="size-4 shrink-0 text-(--os-text-dim)" />
      {safe && safe !== "#" ? (
        <a href={safe} target="_blank" rel="noopener noreferrer" className="truncate text-(--accent) hover:underline">
          {safe.replace(/^https?:\/\/(www\.)?/, "")}
        </a>
      ) : (
        <span className="text-(--os-text-dim)">Add your {label}</span>
      )}
    </div>
  )
}

function NavRow({ icon: Icon, label, onClick, href }: { icon: LucideIcon; label: string; onClick?: () => void; href?: string }) {
  const cls = "flex w-full items-center gap-3 px-4 py-3 text-left text-[13px] hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
  const inner = (
    <>
      <span className="flex size-7 items-center justify-center rounded-lg bg-(--accent)/12">
        <Icon className="size-4 text-(--accent)" />
      </span>
      <span className="flex-1">{label}</span>
      <ChevronRight className={cn("size-4 text-(--os-text-dim)")} />
    </>
  )
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  )
}
