// app/api/meetup/route.ts
// Fetches live member count + events from Meetup's public GraphQL API.
// No API key required — works for public groups.

import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const MEETUP_URLNAME = "aws-sbg-at-nutan-maharashtra-inst-of-engineering-and-tech"
export const MEETUP_GROUP_URL = `https://www.meetup.com/${MEETUP_URLNAME}/`

const QUERY = `{
  groupByUrlname(urlname: "${MEETUP_URLNAME}") {
    name
    memberships { totalCount }
    events {
      edges {
        node {
          id
          title
          dateTime
          description
          eventUrl
          status
          going { totalCount }
          venue { name address city }
        }
      }
    }
  }
}`

export async function GET() {
  // Allow manual override via env var if the Meetup API returns an incorrect count
  const memberCountOverride = process.env.MEETUP_MEMBER_COUNT
    ? parseInt(process.env.MEETUP_MEMBER_COUNT, 10)
    : null

  try {
    const res = await fetch("https://www.meetup.com/gql2", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ query: QUERY }),
      cache:   "no-store", // always fetch live data
    })

    const json = await res.json()
    const group = json.data?.groupByUrlname

    if (!group) {
      return NextResponse.json({ error: "Meetup group not found" }, { status: 502 })
    }

    const events = group.events.edges.map(
      ({ node }: {
        node: {
          id: string; title: string; dateTime: string; description: string
          eventUrl: string; status: string
          going: { totalCount: number }
          venue: { name: string; address: string; city: string } | null
        }
      }) => ({
        id:          node.id,
        title:       node.title,
        date:        new Date(node.dateTime).toLocaleDateString("en-IN", {
          day: "numeric", month: "long", year: "numeric",
        }),
        dateTime:    node.dateTime,
        location:    node.venue
          ? `${node.venue.name}${node.venue.city ? ", " + node.venue.city : ""}`
          : "Online / TBA",
        attendees:   node.going.totalCount,
        description: node.description,
        eventUrl:    node.eventUrl,
        isPast:      node.status !== "ACTIVE",
      })
    )

    // Sort: upcoming first, then past by most recent
    events.sort((a: { isPast: boolean; dateTime: string }, b: { isPast: boolean; dateTime: string }) => {
      if (a.isPast !== b.isPast) return a.isPast ? 1 : -1
      return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    })

    return NextResponse.json({
      memberCount: memberCountOverride ?? group.memberships.totalCount,
      groupUrl:    MEETUP_GROUP_URL,
      events,
    })
  } catch (err) {
    console.error("Meetup fetch error:", err)
    return NextResponse.json({ error: "Failed to fetch Meetup data" }, { status: 500 })
  }
}
