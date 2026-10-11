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
  FALLBACK_EVENTS,
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
      imageUrls: [],
      source: "meetup",
    }))

    const meetupTitles = new Map(meetupEvents.map(e => [e.title.toLowerCase().trim(), e]))
    const dbEvents: ClubEvent[] = []

    for (const e of db.data) {
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
        imageUrls,
        source: "db",
      })
    }

    const merged = sortEvents([...meetupEvents, ...dbEvents])
    const status = combinedStatus(meetup.status, db.status)

    if (merged.length === 0 && status !== "loading") {
      return {
        data: FALLBACK_EVENTS.map(e => ({ ...e, source: "fallback" as const })),
        status,
        fromFallback: true,
      }
    }
    return { data: merged, status, fromFallback: meetup.fromFallback && db.fromFallback }
  }, [meetup, db])
}

/** Static roster merged with any extra members added through the admin panel. */
export function useTeam(): Resource<TeamMember[]> {
  const db = teamResource.use()

  return useMemo(() => {
    const combined = [...TEAM_MEMBERS]
    for (const member of db.data) {
      const name = member.name?.trim().toLowerCase()
      const email = member.email?.trim().toLowerCase()
      const duplicate =
        name === "neha sharma" ||
        combined.some(m => (email && m.email?.trim().toLowerCase() === email) || m.name.trim().toLowerCase() === name)
      if (!duplicate) {
        combined.push({
          ...member,
          skills: Array.isArray(member.skills) ? member.skills : [],
          awsService: member.awsService || "AWS Cloud",
          status: member.status || "running",
          order: Number(member.order) || 99,
        })
      }
    }
    combined.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
    return { data: combined, status: db.status === "loading" ? "loading" : "ready", fromFallback: db.fromFallback }
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

/** Social links with the canonical YouTube/Discord URLs enforced. */
export function useSocialLinks(): Resource<SocialLink[]> {
  const res = socialResource.use()
  return useMemo(() => {
    if (res.data.length === 0) {
      return { data: FALLBACK_SOCIAL_LINKS, status: res.status, fromFallback: true }
    }
    const links = res.data
      .map(link => {
        const key = `${link.platform} ${link.name}`.toLowerCase()
        if (key.includes("youtube")) return { ...link, url: CLUB.youtubeUrl }
        if (key.includes("discord")) return { ...link, url: CLUB.discordUrl }
        return link
      })
      // The Meetup card is always shown separately.
      .filter(link => !`${link.platform} ${link.name}`.toLowerCase().includes("meetup"))
    return { ...res, data: links }
  }, [res])
}

/** Photo albums built from event photos uploaded by admins. */
export function useGallery(): Resource<Album[]> {
  const events = useEvents()
  return useMemo(() => {
    const albums: Album[] = events.data
      .filter(e => e.imageUrls.length > 0)
      .map(e => ({
        id: e.id,
        title: e.title,
        date: e.date,
        cover: e.imageUrls[0],
        photos: e.imageUrls.map((src, i) => ({ id: `${e.id}-${i}`, src, caption: `${e.title} — Photo ${i + 1}` })),
      }))
    return { data: albums, status: events.status, fromFallback: events.fromFallback }
  }, [events])
}
