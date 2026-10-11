// app/api/contact/[id]/route.ts — admin: mark read/unread, delete

import { NextResponse } from "next/server"
import { updateItem, deleteItem, ItemNotFoundError, TABLES } from "@/lib/dynamodb"
import { requireAdmin } from "@/lib/auth"
import { jsonError, NO_STORE, parseBody, serverError } from "@/lib/http"
import { contactUpdateSchema } from "@/lib/validation"

type IdContext = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: IdContext) {
  const { id } = await params
  const admin = await requireAdmin(request)
  if (admin instanceof NextResponse) return admin
  const parsed = await parseBody(request, contactUpdateSchema)
  if (parsed.error) return parsed.error
  try {
    const submission = await updateItem(TABLES.CONTACTS, id, parsed.data)
    return NextResponse.json({ submission }, { headers: NO_STORE })
  } catch (err) {
    if (err instanceof ItemNotFoundError) return jsonError("Not found", 404)
    return serverError("PUT contact", err, "Failed to update submission")
  }
}

export async function DELETE(request: Request, { params }: IdContext) {
  const { id } = await params
  const admin = await requireAdmin(request)
  if (admin instanceof NextResponse) return admin
  try {
    await deleteItem(TABLES.CONTACTS, id)
    return NextResponse.json({ success: true }, { headers: NO_STORE })
  } catch (err) {
    return serverError("DELETE contact", err, "Failed to delete submission")
  }
}
