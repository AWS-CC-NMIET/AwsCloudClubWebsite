// app/api/contact/route.ts
// Public: submit a message (saved to DynamoDB + emailed via SES).
// Admin: list submissions.

import { NextResponse } from "next/server"
import { putItem, scanTable, TABLES } from "@/lib/dynamodb"
import { sendContactEmail } from "@/lib/ses"
import { requireAdmin } from "@/lib/auth"
import { rateLimit, getRequestKey, rateLimitResponse } from "@/lib/rate-limit"
import { NO_STORE, parseBody, serverError } from "@/lib/http"
import { byNewest } from "@/lib/crud"
import { contactSchema } from "@/lib/validation"

export async function GET(request: Request) {
  const admin = await requireAdmin(request)
  if (admin instanceof NextResponse) return admin
  try {
    const submissions = await scanTable(TABLES.CONTACTS)
    submissions.sort(byNewest("submittedAt"))
    return NextResponse.json({ submissions }, { headers: NO_STORE })
  } catch (err) {
    return serverError("GET contact", err, "Failed to fetch submissions")
  }
}

export async function POST(request: Request) {
  const rl = rateLimit(getRequestKey(request, "contact"), { limit: 3, windowMs: 60_000 })
  if (!rl.success) return rateLimitResponse(rl.resetAt)

  const parsed = await parseBody(request, contactSchema)
  if (parsed.error) return parsed.error
  const { website, ...message } = parsed.data

  // Bots fill every field, including the hidden honeypot. Pretend it worked.
  if (website) return NextResponse.json({ success: true }, { status: 201, headers: NO_STORE })

  try {
    const submission = await putItem(TABLES.CONTACTS, { ...message, submittedAt: new Date().toISOString(), isRead: false })
    try {
      await sendContactEmail(message)
    } catch (emailErr) {
      console.error("[api] SES email failed (submission still saved):", emailErr)
    }
    return NextResponse.json({ success: true, id: submission.id }, { status: 201, headers: NO_STORE })
  } catch (err) {
    return serverError("POST contact", err, "Failed to submit message")
  }
}
