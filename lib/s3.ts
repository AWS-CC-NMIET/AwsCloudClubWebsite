// lib/s3.ts
// S3 helpers: presigned uploads, the image proxy's presigned reads, deletes.

import { S3Client, DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { v4 as uuidv4 } from "uuid"
import { AWS_REGION, awsClientConfig } from "@/lib/aws-clients"

const s3Client = new S3Client(awsClientConfig(process.env.NEXT_PUBLIC_S3_REGION || AWS_REGION))

export const BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET || "acc-nmiet-media"

/** The only prefixes the site writes to — and therefore the only ones it serves. */
export const UPLOAD_FOLDERS = ["events", "team", "projects", "general"] as const
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number]

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
}

/** True for keys like "events/<uuid>.jpg" — no traversal, no other prefixes. */
export function isServableKey(key: string) {
  return /^(events|team|projects|general)\/[A-Za-z0-9._-]{1,200}$/.test(key) && !key.includes("..")
}

/** Presigned PUT for a new, randomly named object (expires in 5 minutes). */
export async function getPresignedUploadUrl(folder: UploadFolder, fileType: string) {
  const key = `${folder}/${uuidv4()}.${EXTENSIONS[fileType] ?? "jpg"}`
  const command = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: fileType })
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 })
  return { uploadUrl, key }
}

/** Presigned GET used by /api/image (expires in 1 hour). */
export async function getPresignedReadUrl(key: string) {
  return getSignedUrl(s3Client, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn: 3600 })
}

export async function deleteS3Object(key: string) {
  await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}
