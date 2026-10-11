// app/api/auth/session/route.ts
// Who is the caller? Used by the UI to decide whether to show the Admin app.
// The answer comes from a verified token, so it can't be spoofed client-side.

import { NextResponse } from "next/server"
import { validateAuth } from "@/lib/auth"
import { NO_STORE } from "@/lib/http"

export async function GET(request: Request) {
  const user = await validateAuth(request)
  return NextResponse.json(
    user ? { signedIn: true, username: user.username, isAdmin: user.isAdmin } : { signedIn: false, isAdmin: false },
    { headers: NO_STORE }
  )
}
