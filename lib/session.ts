// lib/session.ts
// Reactive view of the signed-in session for the UI.
//
// `isAdmin` here is only a UI hint read from the access token's cognito:groups
// claim — it decides whether to *show* the Admin app. Every admin API verifies
// the token server-side, and the Admin app re-confirms with /api/auth/session
// before rendering anything.

"use client"

import { useSyncExternalStore } from "react"
import { getAccessToken, getStoredUsername, isSessionValid, onAuthChange, parseJwtPayload } from "@/lib/auth-client"

export interface SessionState {
  signedIn: boolean
  isAdmin: boolean
  username: string | null
}

const SIGNED_OUT: SessionState = { signedIn: false, isAdmin: false, username: null }

let snapshot: SessionState = SIGNED_OUT
let snapshotKey = ""

function read(): SessionState {
  if (typeof window === "undefined") return SIGNED_OUT
  const token = getAccessToken()
  const valid = Boolean(token) && isSessionValid()
  const key = valid ? token! : ""
  if (key === snapshotKey) return snapshot

  snapshotKey = key
  if (!valid) {
    snapshot = SIGNED_OUT
  } else {
    const groups = parseJwtPayload(token!)["cognito:groups"]
    snapshot = {
      signedIn: true,
      isAdmin: Array.isArray(groups) && groups.includes("admins"),
      username: getStoredUsername(),
    }
  }
  return snapshot
}

export function getSession(): SessionState {
  return read()
}

export function useSession(): SessionState {
  return useSyncExternalStore(onAuthChange, read, () => SIGNED_OUT)
}

/** Server-confirmed admin check (token signature + group verified on the server). */
export async function confirmAdmin(): Promise<boolean> {
  const token = getAccessToken()
  if (!token) return false
  try {
    const res = await fetch("/api/auth/session", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
    if (!res.ok) return false
    const body = (await res.json()) as { isAdmin?: boolean }
    return body.isAdmin === true
  } catch {
    return false
  }
}
