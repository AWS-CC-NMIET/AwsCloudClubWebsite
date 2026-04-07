// app/api/contact/[id]/route.ts — Mark contact submission as read/unread
import { NextResponse } from "next/server"
import { updateItem, deleteItem, TABLES } from "@/lib/dynamodb"
import { validateAdminAuth } from "@/lib/auth"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await validateAdminAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const updates = await request.json()
  const submission = await updateItem(TABLES.CONTACTS, id, updates)
  return NextResponse.json({ submission })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await validateAdminAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await deleteItem(TABLES.CONTACTS, id)
  return NextResponse.json({ success: true })
}
