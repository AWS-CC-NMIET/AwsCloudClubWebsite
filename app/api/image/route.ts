// app/api/image/route.ts
// Server-side image proxy — generates a presigned S3 GET URL and redirects.
// This avoids needing public-read ACL on the bucket; our IAM credentials do the auth.

import { NextRequest, NextResponse } from "next/server"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_S3_REGION || "ap-south-1",
  credentials: {
    accessKeyId:     process.env.APP_ACCESS_KEY_ID!,
    secretAccessKey: process.env.APP_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET || "acc-nmiet-media"

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 })

  // Basic sanity — prevent path traversal
  if (key.includes("..")) return NextResponse.json({ error: "Invalid key" }, { status: 400 })

  try {
    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: BUCKET, Key: key }),
      { expiresIn: 3600 }, // 1 hour — browser caches for this long
    )

    return NextResponse.redirect(url, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=300",
      },
    })
  } catch (err) {
    console.error("Image proxy error:", err)
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}
