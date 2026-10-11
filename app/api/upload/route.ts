// app/api/upload/route.ts
// Presigned S3 upload URLs. Profile photos ("general"): any signed-in member.
// Content images (events, team, projects): admins only.

import { NextResponse } from "next/server"
import { requireAdmin, requireUser } from "@/lib/auth"
import { getPresignedUploadUrl } from "@/lib/s3"
import { NO_STORE, parseBody, serverError } from "@/lib/http"
import { rateLimit, getRequestKey, rateLimitResponse } from "@/lib/rate-limit"
import { uploadSchema } from "@/lib/validation"

export async function POST(request: Request) {
  const rl = rateLimit(getRequestKey(request, "upload"), { limit: 30, windowMs: 60_000 })
  if (!rl.success) return rateLimitResponse(rl.resetAt)

  const parsed = await parseBody(request, uploadSchema)
  if (parsed.error) return parsed.error
  const { folder, fileType } = parsed.data

  const guard = folder === "general" ? await requireUser(request) : await requireAdmin(request)
  if (guard instanceof NextResponse) return guard

  try {
    const { uploadUrl, key } = await getPresignedUploadUrl(folder, fileType)
    // Served through our image proxy, so the bucket never needs public access.
    const fileUrl = `/api/image?key=${encodeURIComponent(key)}`
    return NextResponse.json({ uploadUrl, fileUrl, key }, { headers: NO_STORE })
  } catch (err) {
    return serverError("POST upload", err, "Failed to prepare upload")
  }
}
