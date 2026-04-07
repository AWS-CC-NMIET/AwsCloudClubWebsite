// app/api/achievements/[id]/route.ts
import { NextResponse } from "next/server"
import { getItem, updateItem, deleteItem, TABLES } from "@/lib/dynamodb"
import { validateAdminAuth } from "@/lib/auth"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await validateAdminAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const updates = await request.json()
  const achievement = await updateItem(TABLES.ACHIEVEMENTS, id, updates)
  return NextResponse.json({ achievement })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await validateAdminAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await deleteItem(TABLES.ACHIEVEMENTS, id)
  return NextResponse.json({ success: true })
}
