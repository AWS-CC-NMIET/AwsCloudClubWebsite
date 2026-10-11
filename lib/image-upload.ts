// lib/image-upload.ts
// Shrink photos in the browser before uploading: phone photos are often
// 5–10 MB; resized WebP at ≤2400px is usually 300–800 KB with no visible loss.

"use client"

import { uploadFileToS3 } from "@/lib/api-client"

const MAX_EDGE = 2400
const QUALITY = 0.85

async function compress(file: File): Promise<File> {
  // GIFs may be animated; small files aren't worth re-encoding.
  if (file.type === "image/gif" || file.size < 600_000) return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", QUALITY))
    if (!blob || blob.size >= file.size) return file
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" })
  } catch {
    return file
  }
}

export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif"

/** Validate, compress and upload an image; returns the URL to store. */
export async function uploadImage(folder: "events" | "team" | "projects" | "general", file: File): Promise<string> {
  if (!ACCEPTED_IMAGE_TYPES.split(",").includes(file.type)) throw new Error("Please choose a JPG, PNG, WebP or GIF image")
  if (file.size > 25 * 1024 * 1024) throw new Error("That image is larger than 25 MB")
  return uploadFileToS3(folder, await compress(file))
}
