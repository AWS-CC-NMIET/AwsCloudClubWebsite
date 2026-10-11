// app/api/image/route.ts
// Image proxy: redirects to a short-lived presigned S3 URL, so the bucket can
// stay private. Only keys inside the site's upload folders are served.

import { NextRequest, NextResponse } from "next/server"
import { getPresignedReadUrl, isServableKey } from "@/lib/s3"
import { jsonError } from "@/lib/http"

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") ?? ""
  if (!isServableKey(key)) return jsonError("Invalid key", 400)

  try {
    const url = await getPresignedReadUrl(key)
    // The presigned URL lives for an hour; let browsers and the CDN reuse the redirect for 50 minutes.
    return NextResponse.redirect(url, { headers: { "Cache-Control": "public, max-age=3000, s-maxage=3000" } })
  } catch (err) {
    console.error("[api] image proxy error:", err)
    return jsonError("Not found", 404)
  }
}
