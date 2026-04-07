// app/api/events/[id]/route.ts
import { NextResponse } from "next/server"
import { getItem, updateItem, deleteItem, TABLES } from "@/lib/dynamodb"
import { validateAdminAuth } from "@/lib/auth"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const event = await getItem(TABLES.EVENTS, id)
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 })
    return NextResponse.json({ event })
  } catch {
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await validateAdminAuth(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const updates = await request.json()
    const event = await updateItem(TABLES.EVENTS, id, updates)
    return NextResponse.json({ event })
  } catch {
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await validateAdminAuth(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    await deleteItem(TABLES.EVENTS, id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}
