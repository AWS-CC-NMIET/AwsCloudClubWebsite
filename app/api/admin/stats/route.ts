// app/api/admin/stats/route.ts — dashboard numbers (admin only)

import { NextResponse } from "next/server"
import { listAllUsers, requireAdmin } from "@/lib/auth"
import { scanTable, TABLES } from "@/lib/dynamodb"
import { NO_STORE } from "@/lib/http"

export async function GET(request: Request) {
  const admin = await requireAdmin(request)
  if (admin instanceof NextResponse) return admin

  // One failing source shouldn't blank the whole dashboard.
  const settle = async <T,>(p: Promise<T[]>) => {
    try {
      return await p
    } catch (err) {
      console.error("[api] admin stats source failed:", err)
      return null
    }
  }

  const [events, team, projects, contacts, achievements, resources, users] = await Promise.all([
    settle(scanTable(TABLES.EVENTS)),
    settle(scanTable(TABLES.TEAM)),
    settle(scanTable(TABLES.PROJECTS)),
    settle(scanTable(TABLES.CONTACTS)),
    settle(scanTable(TABLES.ACHIEVEMENTS)),
    settle(scanTable(TABLES.RESOURCES)),
    settle(listAllUsers()),
  ])

  return NextResponse.json(
    {
      stats: {
        totalEvents: events?.length ?? null,
        pastEvents: events ? events.filter(e => e.isPast === true || e.isPast === "true").length : null,
        upcomingEvents: events ? events.filter(e => !(e.isPast === true || e.isPast === "true")).length : null,
        teamMembers: team?.length ?? null,
        totalProjects: projects?.length ?? null,
        totalContacts: contacts?.length ?? null,
        unreadContacts: contacts ? contacts.filter(c => !c.isRead).length : null,
        achievements: achievements?.length ?? null,
        resources: resources?.length ?? null,
        totalUsers: users?.length ?? null,
      },
    },
    { headers: NO_STORE }
  )
}
