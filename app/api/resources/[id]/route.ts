// app/api/resources/[id]/route.ts
import { NextResponse } from "next/server"
import { updateItem, deleteItem, TABLES } from "@/lib/dynamodb"
import { validateAdminAuth } from "@/lib/auth"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await validateAdminAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const updates = await request.json()
  const resource = await updateItem(TABLES.RESOURCES, id, updates)
  return NextResponse.json({ resource })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await validateAdminAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await deleteItem(TABLES.RESOURCES, id)
  return NextResponse.json({ success: true })
}
