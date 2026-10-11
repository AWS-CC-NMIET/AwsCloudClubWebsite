// lib/crud.ts
// Route-handler factories for the admin-managed collections (events, team,
// projects, achievements, resources). Public reads are CDN-cacheable; every
// write requires an admin token and a body that passes the entity's schema.

import { NextResponse } from "next/server"
import type { z } from "zod"
import { scanTable, putItem, getItem, updateItem, deleteItem, ItemNotFoundError } from "@/lib/dynamodb"
import { requireAdmin } from "@/lib/auth"
import { jsonError, NO_STORE, parseBody, readCacheHeaders, serverError } from "@/lib/http"

type Row = Record<string, unknown>
type IdContext = { params: Promise<{ id: string }> }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ObjectSchema = z.ZodObject<any>

interface CollectionOptions {
  table: string
  schema: ObjectSchema
  /** Response key for lists, e.g. "events". */
  listKey: string
  /** Response key for one item, e.g. "event". */
  itemKey: string
  sort?: (a: Row, b: Row) => number
}

export const byOrder = (a: Row, b: Row) => (Number(a.order) || 0) - (Number(b.order) || 0)
export const byNewest = (field: string) => (a: Row, b: Row) =>
  new Date(String(b[field] ?? "")).getTime() - new Date(String(a[field] ?? "")).getTime()

export function collectionRoutes(opts: CollectionOptions) {
  return {
    async GET(request: Request) {
      try {
        const items = await scanTable(opts.table)
        if (opts.sort) items.sort(opts.sort)
        return NextResponse.json({ [opts.listKey]: items }, { headers: readCacheHeaders(request) })
      } catch (err) {
        return serverError(`GET ${opts.listKey}`, err, `Failed to fetch ${opts.listKey}`)
      }
    },

    async POST(request: Request) {
      const admin = await requireAdmin(request)
      if (admin instanceof NextResponse) return admin
      const parsed = await parseBody(request, opts.schema)
      if (parsed.error) return parsed.error
      try {
        const item = await putItem(opts.table, parsed.data as Row)
        return NextResponse.json({ [opts.itemKey]: item }, { status: 201, headers: NO_STORE })
      } catch (err) {
        return serverError(`POST ${opts.listKey}`, err, `Failed to create ${opts.itemKey}`)
      }
    },
  }
}

export function itemRoutes(opts: CollectionOptions) {
  // Updates may send any subset of fields; defaults must not fill in missing ones.
  const updateSchema = opts.schema.partial()

  return {
    async GET(request: Request, { params }: IdContext) {
      const { id } = await params
      try {
        const item = await getItem(opts.table, id)
        if (!item) return jsonError("Not found", 404)
        return NextResponse.json({ [opts.itemKey]: item }, { headers: readCacheHeaders(request) })
      } catch (err) {
        return serverError(`GET ${opts.itemKey}`, err)
      }
    },

    async PUT(request: Request, { params }: IdContext) {
      const { id } = await params
      const admin = await requireAdmin(request)
      if (admin instanceof NextResponse) return admin
      const parsed = await parseBody(request, updateSchema)
      if (parsed.error) return parsed.error
      try {
        const item = await updateItem(opts.table, id, parsed.data as Row)
        return NextResponse.json({ [opts.itemKey]: item }, { headers: NO_STORE })
      } catch (err) {
        if (err instanceof ItemNotFoundError) return jsonError("Not found", 404)
        return serverError(`PUT ${opts.itemKey}`, err, `Failed to update ${opts.itemKey}`)
      }
    },

    async DELETE(request: Request, { params }: IdContext) {
      const { id } = await params
      const admin = await requireAdmin(request)
      if (admin instanceof NextResponse) return admin
      try {
        await deleteItem(opts.table, id)
        return NextResponse.json({ success: true }, { headers: NO_STORE })
      } catch (err) {
        return serverError(`DELETE ${opts.itemKey}`, err, `Failed to delete ${opts.itemKey}`)
      }
    },
  }
}
