// app/api/team/seed/route.ts
// Admin-only, idempotent: copy the built-in 27-member roster into DynamoDB so
// the Admin panel becomes the single source of truth for the team. Members
// already in the table (matched by email or name) are left untouched.
// Uses the site's own AWS role — no local credentials needed.

import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { putItem, scanTable, TABLES } from "@/lib/dynamodb"
import { NO_STORE, serverError } from "@/lib/http"
import { TEAM_MEMBERS } from "@/lib/club-content"

export async function POST(request: Request) {
  const admin = await requireAdmin(request)
  if (admin instanceof NextResponse) return admin

  try {
    const existing = await scanTable(TABLES.TEAM)
    const norm = (v: unknown) => String(v ?? "").trim().toLowerCase()
    const has = (m: (typeof TEAM_MEMBERS)[number]) =>
      existing.some(e => (m.email && norm(e.email) === norm(m.email)) || norm(e.name) === norm(m.name))

    const missing = TEAM_MEMBERS.filter(m => !has(m))
    for (const m of missing) {
      await putItem(TABLES.TEAM, {
        name: m.name,
        role: m.role,
        skills: m.skills,
        bio: m.bio ?? "",
        email: m.email ?? "",
        linkedin: m.linkedin ?? "",
        github: m.github ?? "",
        photoUrl: m.photoUrl ?? "",
        awsService: m.awsService ?? "",
        status: m.status,
        order: m.order,
        // Marks the table as seeded: from now on the site shows exactly what's in DynamoDB.
        source: "roster-seed",
      })
    }

    return NextResponse.json(
      { added: missing.length, alreadyPresent: TEAM_MEMBERS.length - missing.length },
      { headers: NO_STORE }
    )
  } catch (err) {
    return serverError("POST team/seed", err, "Failed to import the roster")
  }
}
