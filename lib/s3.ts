// lib/s3.ts
// S3 helper for presigned upload URLs and delete

import { S3Client, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { v4 as uuidv4 } from "uuid"

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_S3_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.APP_ACCESS_KEY_ID!,
    secretAccessKey: process.env.APP_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET || "acc-nmiet-media"
const CDN_URL = process.env.NEXT_PUBLIC_CLOUDFRONT_URL || `https://${BUCKET}.s3.ap-south-1.amazonaws.com`

// ── Generate presigned upload URL (expires in 5 min) ─────────
export async function getPresignedUploadUrl(
  folder: string,
  fileType: string,
  fileName?: string
): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {
  const ext = fileType.split("/")[1] || "jpg"
  const key = `${folder}/${fileName || uuidv4()}.${ext}`

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: fileType,
  })

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 })
  const fileUrl = `${CDN_URL}/${key}`

  return { uploadUrl, fileUrl, key }
}

// ── Delete file from S3 ───────────────────────────────────────
export async function deleteS3Object(key: string) {
  await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

// ── Get public URL for a key ──────────────────────────────────
export function getPublicUrl(key: string): string {
  return `${CDN_URL}/${key}`
}
