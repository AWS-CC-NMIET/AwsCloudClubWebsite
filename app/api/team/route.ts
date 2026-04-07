// app/api/team/route.ts
import { NextResponse } from "next/server"
import { scanTable, putItem, TABLES } from "@/lib/dynamodb"
import { validateAdminAuth } from "@/lib/auth"

export async function GET() {
  try {
    const members = await scanTable(TABLES.TEAM)
    members.sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
      (Number(a.order) || 0) - (Number(b.order) || 0)
    )
    return NextResponse.json({ members })
  } catch {
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const admin = await validateAdminAuth(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const { name, role, skills, bio, email, linkedin, github, photoUrl, status, order } = body
    if (!name || !role) return NextResponse.json({ error: "name and role required" }, { status: 400 })

    const member = await putItem(TABLES.TEAM, {
      name, role,
      skills: skills || [],
      bio: bio || "",
      email: email || "",
      linkedin: linkedin || "",
      github: github || "",
      photoUrl: photoUrl || "",
      status: status || "running",
      order: Number(order) || 0,
    })
    return NextResponse.json({ member }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 })
  }
}
