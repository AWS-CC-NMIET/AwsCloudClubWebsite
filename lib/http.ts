// lib/http.ts
// Small helpers shared by API route handlers.

import { NextResponse } from "next/server"
import type { ZodError, ZodType } from "zod"

/** Public, CDN-cacheable for a minute; stale copies served while refreshing. */
const PUBLIC_CACHE = "public, max-age=0, s-maxage=60, stale-while-revalidate=600"

/**
 * Cache headers for public GET responses. Requests carrying a token (signed-in
 * users, admins) are never cached, so admins always see their latest edits.
 * Amplify's managed cache key includes the Authorization header, so the two
 * kinds of response never mix at the edge.
 */
export function readCacheHeaders(request: Request): Record<string, string> {
  return { "Cache-Control": request.headers.get("Authorization") ? "private, no-store" : PUBLIC_CACHE }
}

export const NO_STORE = { "Cache-Control": "no-store" }

export function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status, headers: NO_STORE })
}

/** Parse a JSON body; returns null for a missing/invalid body. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return null
  }
}

function describeZodError(error: ZodError) {
  const issue = error.issues[0]
  if (!issue) return "Invalid request"
  const field = issue.path.join(".")
  return field ? `${field}: ${issue.message}` : issue.message
}

/** Validate a JSON body against a schema → data, or a 400 response. */
export async function parseBody<T>(
  request: Request,
  schema: ZodType<T>
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  const body = await readJson(request)
  if (body === null || typeof body !== "object") return { error: jsonError("Request body must be JSON", 400) }
  const result = schema.safeParse(body)
  if (!result.success) return { error: jsonError(describeZodError(result.error), 400) }
  return { data: result.data }
}

/** Log a server error and return a generic 500/503 without leaking internals. */
export function serverError(context: string, err: unknown, message = "Something went wrong") {
  const name = (err as { name?: string })?.name ?? ""
  console.error(`[api] ${context}:`, err)
  // Credential / permission problems mean the backend is misconfigured, not a bad request.
  const unavailable = /Credentials|UnrecognizedClient|AccessDenied|ResourceNotFound|ExpiredToken|InvalidClientTokenId/.test(name)
  return jsonError(unavailable ? "Service temporarily unavailable" : message, unavailable ? 503 : 500)
}
