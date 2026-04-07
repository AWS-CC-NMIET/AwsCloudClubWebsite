// app/api/admin/users/route.ts
// List users and manage admin group

import { NextResponse } from "next/server"
import { validateAdminAuth, listAllUsers, listAdminUsers, promoteToAdmin, demoteFromAdmin } from "@/lib/auth"

export async function GET(request: Request) {
  if (!await validateAdminAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [allUsers, adminUsers] = await Promise.all([listAllUsers(), listAdminUsers()])
  const adminUsernames = new Set(adminUsers.map((u) => u.Username))

  const users = allUsers.map((u) => ({
    username: u.Username,
    email: u.Attributes?.find((a) => a.Name === "email")?.Value,
    name: u.Attributes?.find((a) => a.Name === "name")?.Value,
    status: u.UserStatus,
    createdAt: u.UserCreateDate,
    isAdmin: adminUsernames.has(u.Username!),
  }))

  return NextResponse.json({ users })
}

export async function PUT(request: Request) {
  if (!await validateAdminAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { username, action } = await request.json()
  if (!username || !action) return NextResponse.json({ error: "username and action required" }, { status: 400 })

  if (action === "promote") {
    await promoteToAdmin(username)
    return NextResponse.json({ success: true, message: `${username} promoted to admin` })
  } else if (action === "demote") {
    await demoteFromAdmin(username)
    return NextResponse.json({ success: true, message: `${username} removed from admin` })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
