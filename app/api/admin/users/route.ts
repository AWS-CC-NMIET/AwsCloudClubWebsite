// app/api/admin/users/route.ts — list members and manage the admins group

import { NextResponse } from "next/server"
import { demoteFromAdmin, listAdminUsers, listAllUsers, promoteToAdmin, requireAdmin } from "@/lib/auth"
import { jsonError, NO_STORE, parseBody, serverError } from "@/lib/http"
import { adminUserActionSchema } from "@/lib/validation"

export async function GET(request: Request) {
  const admin = await requireAdmin(request)
  if (admin instanceof NextResponse) return admin
  try {
    const [allUsers, adminUsers] = await Promise.all([listAllUsers(), listAdminUsers()])
    const adminUsernames = new Set(adminUsers.map(u => u.Username))
    const users = allUsers.map(u => ({
      username: u.Username,
      email: u.Attributes?.find(a => a.Name === "email")?.Value,
      name: u.Attributes?.find(a => a.Name === "name")?.Value,
      status: u.UserStatus,
      enabled: u.Enabled,
      createdAt: u.UserCreateDate,
      isAdmin: adminUsernames.has(u.Username),
      isYou: u.Username === admin.username,
    }))
    return NextResponse.json({ users }, { headers: NO_STORE })
  } catch (err) {
    return serverError("GET admin/users", err, "Failed to list users")
  }
}

export async function PUT(request: Request) {
  const admin = await requireAdmin(request)
  if (admin instanceof NextResponse) return admin
  const parsed = await parseBody(request, adminUserActionSchema)
  if (parsed.error) return parsed.error
  const { username, action } = parsed.data

  // Prevent locking yourself out of the admin panel.
  if (action === "demote" && username === admin.username) {
    return jsonError("You can't remove your own admin access", 400)
  }

  try {
    if (action === "promote") await promoteToAdmin(username)
    else await demoteFromAdmin(username)
    return NextResponse.json(
      { success: true, message: action === "promote" ? `${username} is now an admin` : `${username} is no longer an admin` },
      { headers: NO_STORE }
    )
  } catch (err) {
    return serverError("PUT admin/users", err, "Failed to update admin access")
  }
}
