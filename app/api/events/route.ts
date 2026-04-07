// app/api/events/route.ts
import { NextResponse } from "next/server"
import { scanTable, putItem, TABLES } from "@/lib/dynamodb"
import { validateAdminAuth } from "@/lib/auth"

// GET /api/events — public, returns all events sorted by date
export async function GET() {
  try {
    const events = await scanTable(TABLES.EVENTS)
    events.sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
      new Date(b.date as string).getTime() - new Date(a.date as string).getTime()
    )
    return NextResponse.json({ events })
  } catch (err) {
    console.error("GET /api/events error:", err)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

// POST /api/events — admin only
export async function POST(request: Request) {
  const admin = await validateAdminAuth(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const { title, date, location, description, attendees, imageUrls, isPast, tags } = body

    if (!title || !date || !location) {
      return NextResponse.json({ error: "title, date, location are required" }, { status: 400 })
    }

    const event = await putItem(TABLES.EVENTS, {
      title,
      date,
      location,
      description: description || "",
      attendees: Number(attendees) || 0,
      imageUrls: imageUrls || [],
      isPast: Boolean(isPast),
      tags: tags || [],
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (err) {
    console.error("POST /api/events error:", err)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
