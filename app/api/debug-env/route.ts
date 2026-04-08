// Temporary debug route — DELETE after diagnosing env var issue
import { NextResponse } from "next/server"

export async function GET() {
  const vars = [
    "COGNITO_CLIENT_SECRET",
    "NEXT_PUBLIC_COGNITO_CLIENT_ID",
    "NEXT_PUBLIC_COGNITO_USER_POOL_ID",
    "APP_ACCESS_KEY_ID",
    "APP_SECRET_ACCESS_KEY",
    "APP_REGION",
  ]

  const result: Record<string, string> = {}
  for (const v of vars) {
    result[v] = process.env[v] ? "SET" : "MISSING"
  }

  return NextResponse.json(result)
}
