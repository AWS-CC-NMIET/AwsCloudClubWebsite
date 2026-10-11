// app/api/config/route.ts — key/value site configuration

import { NextResponse } from "next/server"
import { z } from "zod"
import { scanTable, setConfig, TABLES } from "@/lib/dynamodb"
import { requireAdmin } from "@/lib/auth"
import { NO_STORE, parseBody, readCacheHeaders, serverError } from "@/lib/http"

const configSchema = z.object({
  key: z.string().trim().regex(/^[A-Za-z][A-Za-z0-9_]{0,63}$/, "must be a simple identifier"),
  value: z.string().max(5000),
  type: z.string().trim().max(20).default("text"),
})

export async function GET(request: Request) {
  try {
    const items = await scanTable(TABLES.CONFIG)
    const config: Record<string, string> = {}
    for (const item of items) config[String(item.key)] = String(item.value ?? "")
    return NextResponse.json({ config }, { headers: readCacheHeaders(request) })
  } catch (err) {
    return serverError("GET config", err, "Failed to fetch config")
  }
}

export async function PUT(request: Request) {
  const admin = await requireAdmin(request)
  if (admin instanceof NextResponse) return admin
  const parsed = await parseBody(request, configSchema)
  if (parsed.error) return parsed.error
  try {
    await setConfig(parsed.data.key, parsed.data.value, parsed.data.type)
    return NextResponse.json({ success: true }, { headers: NO_STORE })
  } catch (err) {
    return serverError("PUT config", err, "Failed to update config")
  }
}
