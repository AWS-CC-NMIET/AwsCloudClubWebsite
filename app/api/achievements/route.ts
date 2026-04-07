// app/api/achievements/route.ts
import { NextResponse } from "next/server"
import { scanTable, putItem, TABLES } from "@/lib/dynamodb"
import { validateAdminAuth } from "@/lib/auth"

export async function GET() {
  try {
    const achievements = await scanTable(TABLES.ACHIEVEMENTS)
    achievements.sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
      (Number(a.order) || 0) - (Number(b.order) || 0)
    )
    return NextResponse.json({ achievements })
  } catch {
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!await validateAdminAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await request.json()
    const achievement = await putItem(TABLES.ACHIEVEMENTS, body)
    return NextResponse.json({ achievement }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create achievement" }, { status: 500 })
  }
}
