// lib/club-data.ts
// Shared, cached data hooks for every app and widget.
//
// Each resource is fetched at most once per page load and shared by all
// consumers. The last good response is persisted to localStorage so returning
// visitors see real content instantly — and still see it if the AWS backend is
// unreachable. When nothing is cached, hooks fall back to lib/club-content.ts.

"use client"

import { useEffect, useMemo, useSyncExternalStore } from "react"
import { api } from "@/lib/api-client"
import {
  CLUB,
  DEAD_LINKS,
  FALLBACK_EVENTS,
  FIRST_EVENT_RSVPS,
  FALLBACK_RESOURCES,
  FALLBACK_SOCIAL_LINKS,
  TEAM_MEMBERS,
  type LearningResource,
  type SocialLink,
  type TeamMember,
} from "@/lib/club-content"

export type ResourceStatus = "loading" | "ready" | "error"

export interface Resource<T> {
  data: T
  status: ResourceStatus
  /** true when `data` is the built-in fallback rather than a server response */
  fromFallback: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Tiny cached-resource primitive
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_PREFIX = "sbg-cache:v1:"
const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // a week-old copy beats an empty screen

function createResource<T>(key: string, fetcher: () => Promise<T>, fallback: T) {
  let state: Resource<T> = { data: fallback, status: "loading", fromFallback: true }
  let started = false
  let hydrated = false
  const listeners = new Set<() => void>()

  const emit = (next: Resource<T>) => {
    state = next
    listeners.forEach(fn => fn())
  }

  const hydrate = () => {
    if (hydrated || typeof window === "undefined") return
    hydrated = true
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key)
      if (!raw) return
      const cached = JSON.parse(raw) as { ts: number; data: T }
      if (Date.now() - cached.ts < CACHE_MAX_AGE) {
        state = { data: cached.data, status: "loading", fromFallback: false }
      }
    } catch {
      /* corrupt cache — ignore */
    }
  }

  const load = () => {
    if (started) return
    started = true
    fetcher()
      .then(data => {
        emit({ data, status: "ready", fromFallback: false })
        try {
          localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ ts: Date.now(), data }))
        } catch {
          /* quota / private mode — ignore */
        }
      })
      .catch(() => emit({ ...state, status: "error" }))
  }

  const subscribe = (fn: () => void) => {
    listeners.add(fn)
    return () => listeners.delete(fn)
  }

  const getSnapshot = () => {
    hydrate()
    return state
  }

  return {
    subscribe,
    getSnapshot,
    load,
    use(): Resource<T> {
      const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
      useEffect(load, [])
      return snapshot
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ClubEvent {
  id: string
  title: string
  /** Human readable, e.g. "8 April 2026" */
  date: string
  /** ISO timestamp used for sorting and the calendar grid */
  dateTime: string
  location: string
  attendees: number
  description: string
  eventUrl: string
  isPast: boolean
  /** Event banner (from Meetup), if any */
  imageUrl: string | null
  /** Photos uploaded by admins */
  imageUrls: string[]
  source: "meetup" | "db" | "fallback"
}

export interface Project {
  id: string
  title: string
  description: string
  stack: string[]
  author: string
  status: "Production" | "Development" | "Beta"
  githubUrl?: string
  liveUrl?: string
  imageUrl?: string
  createdAt: string
  updatedAt?: string
}

export interface Achievement {
  id: string
  title: string
  date: string
  description: string
  type: string
  iconName: string
  color: string
  order: number
}

export interface Album {
  id: string
  title: string
  date: string
  cover: string
  photos: { id: string; src: string; caption: string }[]
}

interface RawMeetupEvent {
  id: string
  title: string
  date: string
  dateTime: string
  location: string
  attendees: number
  description?: string
  eventUrl: string
  imageUrl?: string | null
  isPast: boolean
}

interface RawDbEvent {
  id: string
  title: string
  date: string
  location: string
  attendees: number | string
  description?: string
  imageUrls?: string[]
  isPast: boolean | string
  tags?: string[]
}

/** Photo-only albums created in Admin → Gallery (not real events). */
const isGalleryAlbum = (e: RawDbEvent) =>
  (Array.isArray(e.tags) && e.tags.includes("gallery-album")) || e.description === "Gallery Album"

function formatAlbumDate(date: string) {
  const d = new Date(`${date}T00:00:00`)
  return Number.isNaN(d.getTime()) ? date : d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
}

// ─────────────────────────────────────────────────────────────────────────────
// Resources
// ─────────────────────────────────────────────────────────────────────────────

const meetupResource = createResource(
  "meetup",
  async () => {
    const res = await api.meetup.data()
    return {
      memberCount: typeof res.memberCount === "number" ? res.memberCount : null,
      events: (res.events || []) as RawMeetupEvent[],
    }
  },
  { memberCount: null as number | null, events: [] as RawMeetupEvent[] }
)

const dbEventsResource = createResource(
  "events",
  async () => ((await api.events.list()).events || []) as RawDbEvent[],
  [] as RawDbEvent[]
)

const teamResource = createResource(
  "team",
  async () => ((await api.team.list()).members || []) as TeamMember[],
  [] as TeamMember[]
)

const projectsResource = createResource(
  "projects",
  async () => ((await api.projects.list()).projects || []) as Project[],
  [] as Project[]
)

const achievementsResource = createResource(
  "achievements",
  async () => ((await api.achievements.list()).achievements || []) as Achievement[],
  [] as Achievement[]
)

const learningResource = createResource(
  "resources",
  async () => ((await api.resources.list()).resources || []) as LearningResource[],
  [] as LearningResource[]
)

const socialResource = createResource(
  "social",
  async () => ((await api.social.list()).links || []) as SocialLink[],
  [] as SocialLink[]
)

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function combinedStatus(...statuses: ResourceStatus[]): ResourceStatus {
  if (statuses.some(s => s === "ready")) return "ready"
  if (statuses.some(s => s === "loading")) return "loading"
  return "error"
}

function formatDbDate(date: string) {
  try {
    const d = new Date(date + "T00:00:00")
    if (Number.isNaN(d.getTime())) return date
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
  } catch {
    return date
  }
}

function sortEvents(events: ClubEvent[]) {
  return [...events].sort((a, b) => {
    if (a.isPast !== b.isPast) return a.isPast ? 1 : -1
    const ta = new Date(a.dateTime).getTime()
    const tb = new Date(b.dateTime).getTime()
    // Upcoming: soonest first. Past: most recent first.
    return a.isPast ? tb - ta : ta - tb
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Public hooks
// ─────────────────────────────────────────────────────────────────────────────

/** Live Meetup member count (null until known). */
export function useMemberCount(): { memberCount: number | null; display: string } {
  const meetup = meetupResource.use()
  const count = meetup.data.memberCount
  return {
    memberCount: count,
    display: count !== null ? `${count}+` : `${CLUB.fallbackMemberCount}+`,
  }
}

/** Meetup + DynamoDB events, de-duplicated by title, upcoming first. */
export function useEvents(): Resource<ClubEvent[]> {
  const meetup = meetupResource.use()
  const db = dbEventsResource.use()

  return useMemo(() => {
    const meetupEvents: ClubEvent[] = meetup.data.events.map(e => ({
      id: `meetup-${e.id}`,
      title: e.title,
      date: e.date,
      dateTime: e.dateTime,
      location: e.location,
      attendees: Number(e.attendees) || 0,
      description: e.description || "",
      eventUrl: e.eventUrl || CLUB.meetupUrl,
      isPast: Boolean(e.isPast),
      imageUrl: e.imageUrl ?? null,
      imageUrls: [],
      source: "meetup",
    }))

    const meetupTitles = new Map(meetupEvents.map(e => [e.title.toLowerCase().trim(), e]))
    const dbEvents: ClubEvent[] = []

    for (const e of db.data) {
      if (isGalleryAlbum(e)) continue
      const isPast = e.isPast === true || e.isPast === "true"
      const imageUrls = Array.isArray(e.imageUrls) ? e.imageUrls.filter(Boolean) : []
      const twin = meetupTitles.get(String(e.title).toLowerCase().trim())
      if (twin) {
        // Same event exists on Meetup — keep Meetup's details but attach admin photos.
        twin.imageUrls = imageUrls
        continue
      }
      dbEvents.push({
        id: `db-${e.id}`,
        title: e.title,
        date: formatDbDate(e.date),
        dateTime: `${e.date}T00:00:00`,
        location: e.location,
        attendees: Number(e.attendees) || 0,
        description: e.description || "",
        eventUrl: CLUB.meetupUrl,
        isPast,
        imageUrl: null,
        imageUrls,
        source: "db",
      })
    }

    const merged = sortEvents([...meetupEvents, ...dbEvents])
    const status = combinedStatus(meetup.status, db.status)

    if (merged.length === 0 && status !== "loading") {
      return {
        data: FALLBACK_EVENTS.map(e => ({ ...e, description: "", imageUrls: [], source: "fallback" as const })),
        status,
        fromFallback: true,
      }
    }
    return { data: merged, status, fromFallback: meetup.fromFallback && db.fromFallback }
  }, [meetup, db])
}

/**
 * Team roster. Once Admin → Team → Import roster has copied the roster into DynamoDB,
 * the database is the single source of truth (admins add, edit and remove
 * members). Until then — or if the API is unreachable — the built-in roster is
 * shown, with any database edits applied on top (matched by email or name).
 */
export function useTeam(): Resource<TeamMember[]> {
  const db = teamResource.use()

  return useMemo(() => {
    const norm = (v?: string) => v?.trim().toLowerCase() || ""
    // Database entries without a photo (e.g. imported before photos existed)
    // fall back to the member's built-in portrait, matched by email or name.
    const builtInPhoto = (m: TeamMember) =>
      TEAM_MEMBERS.find(b => (m.email && norm(b.email) === norm(m.email)) || norm(b.name) === norm(m.name))?.photoUrl
    const clean = (m: TeamMember): TeamMember => ({
      ...m,
      photoUrl: m.photoUrl || builtInPhoto(m),
      skills: Array.isArray(m.skills) ? m.skills : [],
      awsService: m.awsService || "AWS Cloud",
      status: m.status || "running",
      order: Number(m.order) || 99,
    })
    const byOrder = (a: TeamMember, b: TeamMember) => (a.order ?? 99) - (b.order ?? 99)

    if (db.data.some(m => m.source === "roster-seed")) {
      return { data: db.data.map(clean).sort(byOrder), status: db.status, fromFallback: false }
    }

    const key = (m: TeamMember) => (m.email?.trim().toLowerCase() || m.name.trim().toLowerCase())
    const merged = new Map(TEAM_MEMBERS.map(m => [key(m), m]))
    for (const m of db.data) {
      const existing = merged.get(key(m)) ?? [...merged.values()].find(s => s.name.trim().toLowerCase() === m.name?.trim().toLowerCase())
      if (existing) merged.set(key(existing), { ...existing, ...clean(m), id: existing.id })
      else merged.set(key(m), clean(m))
    }
    return {
      data: [...merged.values()].sort(byOrder),
      status: db.status === "loading" ? "loading" : "ready",
      fromFallback: db.fromFallback,
    }
  }, [db])
}

export function useProjects(): Resource<Project[]> {
  return projectsResource.use()
}

export function useAchievements(): Resource<Achievement[]> {
  const res = achievementsResource.use()
  return useMemo(
    () => ({ ...res, data: [...res.data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) }),
    [res]
  )
}

/** Learning resources from the API, falling back to the curated list. */
export function useResources(): Resource<LearningResource[]> {
  const res = learningResource.use()
  return useMemo(() => {
    if (res.data.length === 0 && res.status !== "loading") {
      return { data: FALLBACK_RESOURCES, status: res.status, fromFallback: true }
    }
    if (res.data.length === 0) {
      return { data: FALLBACK_RESOURCES, status: "loading", fromFallback: true }
    }
    return { ...res, data: [...res.data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) }
  }, [res])
}

const isDeadLink = (url: string) => DEAD_LINKS.some(dead => url.includes(dead))

const labelOf = (link: SocialLink) => `${link.platform} ${link.name}`.toLowerCase()
const officialFor = (link: SocialLink) => FALLBACK_SOCIAL_LINKS.find(o => labelOf(link).includes(o.platform))

/**
 * Our official channels first (Instagram, LinkedIn, YouTube — always the
 * verified URLs, with follower counts from the admin panel when set), then any
 * other channels added in Admin. Dead links and Meetup (shown separately) are dropped.
 */
export function useSocialLinks(): Resource<SocialLink[]> {
  const res = socialResource.use()
  return useMemo(() => {
    if (res.data.length === 0) {
      return { data: FALLBACK_SOCIAL_LINKS, status: res.status, fromFallback: true }
    }
    const official = FALLBACK_SOCIAL_LINKS.map(o => {
      const followers = res.data.find(l => officialFor(l) === o)?.followers
      return followers && /\d/.test(followers) ? { ...o, followers } : o
    })
    const others = res.data.filter(
      link => !officialFor(link) && link.url && !isDeadLink(link.url) && !labelOf(link).includes("meetup")
    )
    return { ...res, data: [...official, ...others] }
  }, [res])
}

/** Photo albums built from event photos uploaded by admins. */
export function useGallery(): Resource<Album[]> {
  const events = useEvents()
  const db = dbEventsResource.use()
  return useMemo(() => {
    const toAlbum = (id: string, title: string, date: string, urls: string[], sortKey: string) => ({
      id,
      title,
      date,
      cover: urls[0],
      sortKey,
      photos: urls.map((src, i) => ({ id: `${id}-${i}`, src, caption: `${title} — Photo ${i + 1}` })),
    })
    const fromEvents = events.data
      .filter(e => e.imageUrls.length > 0)
      .map(e => toAlbum(e.id, e.title, e.date, e.imageUrls, e.dateTime))
    const albumsOnly = db.data
      .filter(e => isGalleryAlbum(e) && Array.isArray(e.imageUrls) && e.imageUrls.length > 0)
      .map(e => toAlbum(`album-${e.id}`, e.title, formatAlbumDate(e.date), e.imageUrls!.filter(Boolean), `${e.date}T00:00:00`))
    const albums: Album[] = [...fromEvents, ...albumsOnly]
      .sort((a, b) => new Date(b.sortKey).getTime() - new Date(a.sortKey).getTime())
      .map(({ sortKey, ...album }) => album)
    return { data: albums, status: events.status, fromFallback: events.fromFallback && db.fromFallback }
  }, [events, db])
}

/** Live numbers for copy like "{members} Members on Meetup". */
export function useClubFacts() {
  const { display: members } = useMemberCount()
  const events = useEvents()
  return useMemo(() => {
    const firstMeetup = events.data
      .filter(e => e.isPast && e.source === "meetup")
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0]
    return { members, firstEventRsvps: String(firstMeetup?.attendees ?? FIRST_EVENT_RSVPS) }
  }, [members, events.data])
}

export function fillFacts(template: string, facts: { members: string; firstEventRsvps: string }) {
  return template.replace("{members}", facts.members).replace("{firstEventRsvps}", facts.firstEventRsvps)
}
