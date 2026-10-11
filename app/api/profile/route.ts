// app/api/profile/route.ts — the signed-in member's own profile

import { NextResponse } from "next/server"
import { requireUser, getUserAttributes } from "@/lib/auth"
import { scanTable, putItem, updateItem, TABLES } from "@/lib/dynamodb"
import { jsonError, NO_STORE, parseBody, serverError } from "@/lib/http"
import { profileSchema } from "@/lib/validation"

async function findProfile(sub: string) {
  const profiles = await scanTable(TABLES.PROFILES)
  return profiles.find(p => p.sub === sub) ?? null
}

export async function GET(request: Request) {
  const user = await requireUser(request)
  if (user instanceof NextResponse) return user
  try {
    return NextResponse.json({ profile: await findProfile(user.sub) }, { headers: NO_STORE })
  } catch (err) {
    return serverError("GET profile", err, "Failed to fetch profile")
  }
}

// Create the profile on first sign-in (idempotent: returns the existing one).
export async function POST(request: Request) {
  const user = await requireUser(request)
  if (user instanceof NextResponse) return user
  const parsed = await parseBody(request, profileSchema.partial())
  if (parsed.error) return parsed.error
  try {
    const existing = await findProfile(user.sub)
    if (existing) return NextResponse.json({ profile: existing }, { headers: NO_STORE })

    const attributes = await getUserAttributes(user.accessToken)
    const email = attributes.email ?? ""
    const profile = await putItem(TABLES.PROFILES, {
      sub: user.sub,
      email,
      displayName: parsed.data.displayName || attributes.name || email.split("@")[0] || "Cloud Builder",
      bio: parsed.data.bio ?? "",
      avatarUrl: parsed.data.avatarUrl ?? "",
      linkedinUrl: parsed.data.linkedinUrl ?? "",
      githubUrl: parsed.data.githubUrl ?? "",
      skills: parsed.data.skills ?? [],
      joinedAt: new Date().toISOString(),
    })
    return NextResponse.json({ profile }, { status: 201, headers: NO_STORE })
  } catch (err) {
    return serverError("POST profile", err, "Failed to create profile")
  }
}

export async function PUT(request: Request) {
  const user = await requireUser(request)
  if (user instanceof NextResponse) return user
  const parsed = await parseBody(request, profileSchema.partial())
  if (parsed.error) return parsed.error
  try {
    const existing = await findProfile(user.sub)
    if (!existing) return jsonError("Profile not found", 404)
    const profile = await updateItem(TABLES.PROFILES, String(existing.id), parsed.data)
    return NextResponse.json({ profile }, { headers: NO_STORE })
  } catch (err) {
    return serverError("PUT profile", err, "Failed to update profile")
  }
}
