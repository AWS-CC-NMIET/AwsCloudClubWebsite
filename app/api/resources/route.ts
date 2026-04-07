// app/api/resources/route.ts
import { NextResponse } from "next/server"
import { scanTable, putItem, TABLES } from "@/lib/dynamodb"
import { validateAdminAuth } from "@/lib/auth"

export async function GET() {
  try {
    const resources = await scanTable(TABLES.RESOURCES)
    resources.sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
      (Number(a.order) || 0) - (Number(b.order) || 0)
    )
    return NextResponse.json({ resources })
  } catch {
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!await validateAdminAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json()
  const resource = await putItem(TABLES.RESOURCES, body)
  return NextResponse.json({ resource }, { status: 201 })
}
