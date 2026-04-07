// app/api/admin/stats/route.ts
// Dashboard stats for admin panel

import { NextResponse } from "next/server"
import { validateAdminAuth } from "@/lib/auth"
import { scanTable, TABLES } from "@/lib/dynamodb"
import { listAllUsers } from "@/lib/auth"

export async function GET(request: Request) {
  const admin = await validateAdminAuth(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const [events, team, projects, contacts, achievements, resources, users] = await Promise.all([
      scanTable(TABLES.EVENTS),
      scanTable(TABLES.TEAM),
      scanTable(TABLES.PROJECTS),
      scanTable(TABLES.CONTACTS),
      scanTable(TABLES.ACHIEVEMENTS),
      scanTable(TABLES.RESOURCES),
      listAllUsers(),
    ])

    const unreadContacts = contacts.filter((c: Record<string, unknown>) => !c.isRead).length

    return NextResponse.json({
      stats: {
        totalEvents: events.length,
        pastEvents: events.filter((e: Record<string, unknown>) => e.isPast).length,
        upcomingEvents: events.filter((e: Record<string, unknown>) => !e.isPast).length,
        teamMembers: team.length,
        activeMembers: team.filter((t: Record<string, unknown>) => t.status === "running").length,
        totalProjects: projects.length,
        totalAchievements: achievements.length,
        totalResources: resources.length,
        totalContacts: contacts.length,
        unreadContacts,
        registeredUsers: users.length,
      },
    })
  } catch (err) {
    console.error("Stats error:", err)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
