// app/api/profile/route.ts
import { NextResponse } from "next/server"
import { validateAuth } from "@/lib/auth"
import { scanTable, putItem, updateItem, TABLES } from "@/lib/dynamodb"

// GET current user's profile
export async function GET(request: Request) {
  const user = await validateAuth(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const sub = user.UserAttributes?.find((a) => a.Name === "sub")?.Value
  if (!sub) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  try {
    const profiles = await scanTable(TABLES.PROFILES)
    const profile = profiles.find((p: Record<string, unknown>) => p.sub === sub)
    return NextResponse.json({ profile: profile || null })
  } catch {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

// POST — create profile (called after first login)
export async function POST(request: Request) {
  const user = await validateAuth(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const sub = user.UserAttributes?.find((a) => a.Name === "sub")?.Value
  const email = user.UserAttributes?.find((a) => a.Name === "email")?.Value

  try {
    const body = await request.json()
    const profile = await putItem(TABLES.PROFILES, {
      sub,
      email,
      displayName: body.displayName || email?.split("@")[0] || "Cloud User",
      bio: body.bio || "",
      avatarUrl: body.avatarUrl || "",
      linkedinUrl: body.linkedinUrl || "",
      githubUrl: body.githubUrl || "",
      skills: body.skills || [],
      joinedAt: new Date().toISOString(),
    })
    return NextResponse.json({ profile }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
  }
}

// PUT — update profile
export async function PUT(request: Request) {
  const user = await validateAuth(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const sub = user.UserAttributes?.find((a) => a.Name === "sub")?.Value

  try {
    const body = await request.json()
    const profiles = await scanTable(TABLES.PROFILES)
    const existing = profiles.find((p: Record<string, unknown>) => p.sub === sub) as Record<string, unknown> | undefined

    if (!existing) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

    const { displayName, bio, avatarUrl, linkedinUrl, githubUrl, skills } = body
    const updated = await updateItem(TABLES.PROFILES, existing.id as string, {
      displayName, bio, avatarUrl, linkedinUrl, githubUrl, skills,
    })
    return NextResponse.json({ profile: updated })
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
