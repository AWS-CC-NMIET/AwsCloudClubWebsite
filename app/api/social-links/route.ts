// app/api/social-links/route.ts
import { NextResponse } from "next/server"
import { scanTable, putItem, updateItem, deleteItem, TABLES } from "@/lib/dynamodb"
import { validateAdminAuth } from "@/lib/auth"

export async function GET() {
  try {
    const links = await scanTable(TABLES.SOCIAL)
    return NextResponse.json({ links })
  } catch (err) {
    console.error("GET /api/social-links error:", err)
    return NextResponse.json({ error: "Failed to fetch social links" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!await validateAdminAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await request.json()
    const { name, platform, url, followers, color } = body
    if (!name || !platform || !url) {
      return NextResponse.json({ error: "name, platform, and url are required" }, { status: 400 })
    }
    const link = await putItem(TABLES.SOCIAL, { name, platform, url, followers: followers || "", color: color || "" })
    return NextResponse.json({ link }, { status: 201 })
  } catch (err) {
    console.error("POST /api/social-links error:", err)
    return NextResponse.json({ error: "Failed to create social link" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!await validateAdminAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { id, ...updates } = await request.json()
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    const link = await updateItem(TABLES.SOCIAL, id, updates)
    return NextResponse.json({ link })
  } catch (err) {
    console.error("PUT /api/social-links error:", err)
    return NextResponse.json({ error: "Failed to update social link" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!await validateAdminAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    await deleteItem(TABLES.SOCIAL, id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/social-links error:", err)
    return NextResponse.json({ error: "Failed to delete social link" }, { status: 500 })
  }
}
