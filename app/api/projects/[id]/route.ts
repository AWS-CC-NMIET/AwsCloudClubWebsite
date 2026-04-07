// app/api/projects/[id]/route.ts
import { NextResponse } from "next/server"
import { getItem, updateItem, deleteItem, TABLES } from "@/lib/dynamodb"
import { validateAdminAuth } from "@/lib/auth"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await getItem(TABLES.PROJECTS, id)
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ project })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await validateAdminAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const updates = await request.json()
  const project = await updateItem(TABLES.PROJECTS, id, updates)
  return NextResponse.json({ project })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await validateAdminAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await deleteItem(TABLES.PROJECTS, id)
  return NextResponse.json({ success: true })
}
