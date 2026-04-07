// app/api/config/route.ts — Site config (About text, highlights, etc.)
import { NextResponse } from "next/server"
import { scanTable, setConfig, TABLES } from "@/lib/dynamodb"
import { validateAdminAuth } from "@/lib/auth"

export async function GET() {
  try {
    const items = await scanTable(TABLES.CONFIG)
    const config: Record<string, string> = {}
    items.forEach((item: Record<string, unknown>) => {
      config[item.key as string] = item.value as string
    })
    return NextResponse.json({ config })
  } catch {
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!await validateAdminAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { key, value, type } = await request.json()
    if (!key || value === undefined) return NextResponse.json({ error: "key and value required" }, { status: 400 })
    await setConfig(key, value, type || "text")
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to update config" }, { status: 500 })
  }
}
