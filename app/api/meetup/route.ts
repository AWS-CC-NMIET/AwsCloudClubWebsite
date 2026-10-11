// app/api/meetup/route.ts
// Live member count + upcoming and past events from Meetup's public GraphQL API.
// No API key needed for public groups. Cached for 5 minutes (in memory and at
// the CDN) so a traffic spike never hammers Meetup.

import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const MEETUP_URLNAME = "aws-sbg-at-nutan-maharashtra-inst-of-engineering-and-tech"
const MEETUP_GROUP_URL = `https://www.meetup.com/${MEETUP_URLNAME}/`
const CACHE_TTL_MS = 5 * 60 * 1000

const EVENT_FIELDS = `id title dateTime endTime description eventUrl status
  going { totalCount }
  venue { name city }
  featuredEventPhoto { highResUrl }`

const QUERY = `{
  groupByUrlname(urlname: "${MEETUP_URLNAME}") {
    memberships { totalCount }
    upcoming: events(first: 20) { edges { node { ${EVENT_FIELDS} } } }
    past: events(status: PAST, first: 50) { edges { node { ${EVENT_FIELDS} } } }
  }
}`

interface MeetupNode {
  id: string
  title: string
  dateTime: string
  endTime?: string
  description?: string
  eventUrl: string
  status: string
  going?: { totalCount: number }
  venue?: { name?: string; city?: string } | null
  featuredEventPhoto?: { highResUrl?: string } | null
}

interface MeetupPayload {
  memberCount: number
  groupUrl: string
  events: ReturnType<typeof toEvent>[]
}

let cached: { at: number; payload: MeetupPayload } | null = null

function toEvent(node: MeetupNode, isPast: boolean) {
  const venue = node.venue?.name
    ? `${node.venue.name}${node.venue.city && !node.venue.name.includes(node.venue.city) ? ", " + node.venue.city : ""}`
    : isPast
      ? "Venue not listed"
      : "Venue to be announced"
  return {
    id: node.id,
    title: node.title,
    date: new Date(node.dateTime).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }),
    dateTime: node.dateTime,
    endTime: node.endTime ?? null,
    location: venue,
    attendees: node.going?.totalCount ?? 0,
    description: node.description ?? "",
    eventUrl: node.eventUrl,
    imageUrl: node.featuredEventPhoto?.highResUrl ?? null,
    isPast,
  }
}

const CACHE_HEADERS = { "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=1800" }

export async function GET() {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return NextResponse.json(cached.payload, { headers: CACHE_HEADERS })
  }

  try {
    const res = await fetch("https://www.meetup.com/gql2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: QUERY }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    })
    const json = await res.json()
    const group = json.data?.groupByUrlname
    if (!group) throw new Error(json.errors?.[0]?.message ?? "Meetup group not found")

    const seen = new Set<string>()
    const events = [
      ...group.upcoming.edges.map(({ node }: { node: MeetupNode }) => toEvent(node, false)),
      ...group.past.edges.map(({ node }: { node: MeetupNode }) => toEvent(node, true)),
    ].filter(e => !seen.has(e.id) && seen.add(e.id))

    // Upcoming soonest-first, then past most-recent-first.
    events.sort((a, b) => {
      if (a.isPast !== b.isPast) return a.isPast ? 1 : -1
      const diff = new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      return a.isPast ? -diff : diff
    })

    const payload = { memberCount: group.memberships.totalCount, groupUrl: MEETUP_GROUP_URL, events }
    cached = { at: Date.now(), payload }
    return NextResponse.json(payload, { headers: CACHE_HEADERS })
  } catch (err) {
    console.error("[api] Meetup fetch error:", err)
    // Serve the last good copy rather than nothing.
    if (cached) return NextResponse.json(cached.payload, { headers: { "Cache-Control": "no-store" } })
    return NextResponse.json({ error: "Failed to fetch Meetup data" }, { status: 502, headers: { "Cache-Control": "no-store" } })
  }
}
