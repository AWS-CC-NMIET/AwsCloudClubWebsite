// app/api/contact/route.ts
// Saves contact submission to DynamoDB and sends SES email

import { NextResponse } from "next/server"
import { putItem, TABLES } from "@/lib/dynamodb"
import { sendContactEmail } from "@/lib/ses"

export async function GET(request: Request) {
  // Admin-only: list all contact submissions
  const { validateAdminAuth } = await import("@/lib/auth")
  const admin = await validateAdminAuth(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { scanTable } = await import("@/lib/dynamodb")
  try {
    const submissions = await scanTable(TABLES.CONTACTS)
    submissions.sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
      new Date(b.submittedAt as string).getTime() - new Date(a.submittedAt as string).getTime()
    )
    return NextResponse.json({ submissions })
  } catch {
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json()

    // Validate all fields
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    // Rate limit: max 500 chars for message
    if (message.length > 2000) {
      return NextResponse.json({ error: "Message too long (max 2000 chars)" }, { status: 400 })
    }

    // Save to DynamoDB
    const submission = await putItem(TABLES.CONTACTS, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      submittedAt: new Date().toISOString(),
      isRead: false,
    })

    // Send email via SES (non-blocking: don't fail if email fails)
    try {
      await sendContactEmail({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() })
    } catch (emailErr) {
      console.error("SES email failed (submission still saved):", emailErr)
    }

    return NextResponse.json({ success: true, id: submission.id }, { status: 201 })
  } catch (err) {
    console.error("POST /api/contact error:", err)
    return NextResponse.json({ error: "Failed to submit message" }, { status: 500 })
  }
}
