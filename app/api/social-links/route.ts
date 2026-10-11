// app/api/social-links/route.ts
// Social links — public list; admins create/update/delete (id in the body).

import { NextResponse } from "next/server"
import { z } from "zod"
import { scanTable, putItem, updateItem, deleteItem, ItemNotFoundError, TABLES } from "@/lib/dynamodb"
import { requireAdmin } from "@/lib/auth"
import { jsonError, NO_STORE, parseBody, readCacheHeaders, serverError } from "@/lib/http"
import { socialLinkSchema } from "@/lib/validation"

const idSchema = z.object({ id: z.string().trim().min(1).max(64) })

export async function GET(request: Request) {
  try {
    const links = await scanTable(TABLES.SOCIAL)
    return NextResponse.json({ links }, { headers: readCacheHeaders(request) })
  } catch (err) {
    return serverError("GET social-links", err, "Failed to fetch social links")
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request)
  if (admin instanceof NextResponse) return admin
  const parsed = await parseBody(request, socialLinkSchema)
  if (parsed.error) return parsed.error
  try {
    const link = await putItem(TABLES.SOCIAL, parsed.data)
    return NextResponse.json({ link }, { status: 201, headers: NO_STORE })
  } catch (err) {
    return serverError("POST social-links", err, "Failed to create social link")
  }
}

export async function PUT(request: Request) {
  const admin = await requireAdmin(request)
  if (admin instanceof NextResponse) return admin
  const parsed = await parseBody(request, socialLinkSchema.partial().merge(idSchema))
  if (parsed.error) return parsed.error
  const { id, ...updates } = parsed.data
  try {
    const link = await updateItem(TABLES.SOCIAL, id, updates)
    return NextResponse.json({ link }, { headers: NO_STORE })
  } catch (err) {
    if (err instanceof ItemNotFoundError) return jsonError("Not found", 404)
    return serverError("PUT social-links", err, "Failed to update social link")
  }
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin(request)
  if (admin instanceof NextResponse) return admin
  const parsed = await parseBody(request, idSchema)
  if (parsed.error) return parsed.error
  try {
    await deleteItem(TABLES.SOCIAL, parsed.data.id)
    return NextResponse.json({ success: true }, { headers: NO_STORE })
  } catch (err) {
    return serverError("DELETE social-links", err, "Failed to delete social link")
  }
}
