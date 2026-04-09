"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { api } from "@/lib/api-client"

export interface MeetupEvent {
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

interface MeetupData {
  memberCount: number | null
  events: MeetupEvent[]
  loading: boolean
}

const MeetupContext = createContext<MeetupData>({
  memberCount: null,
  events: [],
  loading: true,
})

// ─── Cache helpers ────────────────────────────────────────────────────────────
const CACHE_KEY = "meetup_cache"
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

interface CacheEntry {
  memberCount: number | null
  events: MeetupEvent[]
  ts: number
}

function readCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const entry: CacheEntry = JSON.parse(raw)
    if (Date.now() - entry.ts > CACHE_TTL) return null
    return entry
  } catch {
    return null
  }
}

function writeCache(data: { memberCount: number | null; events: MeetupEvent[] }) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, ts: Date.now() }))
  } catch { /* quota exceeded — ignore */ }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function MeetupProvider({ children }: { children: ReactNode }) {
  const [memberCount, setMemberCount] = useState<number | null>(null)
  const [events, setEvents]           = useState<MeetupEvent[]>([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    // 1. Serve from cache immediately (no loading flash on return visits)
    const cached = readCache()
    if (cached) {
      setMemberCount(cached.memberCount)
      setEvents(cached.events)
      setLoading(false)
    }

    // 2. Revalidate in background (stale-while-revalidate)
    api.meetup.data()
      .then((d) => {
        const fresh = { memberCount: d.memberCount, events: d.events as MeetupEvent[] }
        setMemberCount(fresh.memberCount)
        setEvents(fresh.events)
        writeCache(fresh)
      })
      .catch(() => { /* network failure — cached data stays */ })
      .finally(() => setLoading(false))
  }, [])

  return (
    <MeetupContext.Provider value={{ memberCount, events, loading }}>
      {children}
    </MeetupContext.Provider>
  )
}

export function useMeetup() {
  return useContext(MeetupContext)
}
