// app/api/team/[id]/route.ts
import { NextResponse } from "next/server"
import { getItem, updateItem, deleteItem, TABLES } from "@/lib/dynamodb"
import { validateAdminAuth } from "@/lib/auth"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const member = await getItem(TABLES.TEAM, id)
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ member })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await validateAdminAuth(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const updates = await request.json()
  const member = await updateItem(TABLES.TEAM, id, updates)
  return NextResponse.json({ member })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await validateAdminAuth(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await deleteItem(TABLES.TEAM, id)
  return NextResponse.json({ success: true })
}
