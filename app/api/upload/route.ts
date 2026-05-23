// app/api/upload/route.ts
// Generate S3 presigned upload URL — admin only

import { NextResponse } from "next/server"
import { validateAdminAuth, validateAuth } from "@/lib/auth"
import { getPresignedUploadUrl } from "@/lib/s3"

export async function POST(request: Request) {
  const { folder, fileType, fileName } = await request.json()

  const validFolders = ["events", "team", "projects", "general"]
  if (!validFolders.includes(folder)) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 })
  }

  // general folder (profile photos) — any authenticated user can upload
  // content folders (events, team, projects) — admins only
  if (folder === "general") {
    const user = await validateAuth(request)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  } else {
    const admin = await validateAdminAuth(request)
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!validTypes.includes(fileType)) {
      return NextResponse.json({ error: "Only image files allowed" }, { status: 400 })
    }

    const { uploadUrl, key } = await getPresignedUploadUrl(folder, fileType, fileName)
    // fileUrl points to our image proxy — avoids needing public-read ACL on the bucket
    const fileUrl = `/api/image?key=${encodeURIComponent(key)}`
    return NextResponse.json({ uploadUrl, fileUrl, key })
  } catch (err) {
    console.error("Upload presign error:", err)
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 })
  }
}
