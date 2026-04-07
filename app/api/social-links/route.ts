// app/api/social-links/route.ts
import { NextResponse } from "next/server"
import { scanTable, putItem, updateItem, deleteItem, TABLES } from "@/lib/dynamodb"
import { validateAdminAuth } from "@/lib/auth"

export async function GET() {
  try {
    const links = await scanTable(TABLES.SOCIAL)
    return NextResponse.json({ links })
  } catch {
    return NextResponse.json({ error: "Failed to fetch social links" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!await validateAdminAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json()
  const link = await putItem(TABLES.SOCIAL, body)
  return NextResponse.json({ link }, { status: 201 })
}

export async function PUT(request: Request) {
  if (!await validateAdminAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id, ...updates } = await request.json()
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  const link = await updateItem(TABLES.SOCIAL, id, updates)
  return NextResponse.json({ link })
}

export async function DELETE(request: Request) {
  if (!await validateAdminAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  await deleteItem(TABLES.SOCIAL, id)
  return NextResponse.json({ success: true })
}
