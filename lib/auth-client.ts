"use client"
// lib/auth-client.ts
// Client-side auth helpers — call our /api/auth server route so the Cognito
// client secret never touches the browser.  Tokens are kept in localStorage.

import { safeStorage } from "@/lib/utils"

const KEYS = {
  access:   "cc_access_token",
  id:       "cc_id_token",
  refresh:  "cc_refresh_token",
  expiry:   "cc_token_expiry",
  username: "cc_username",
}

// ── Internal fetch helper ────────────────────────────────────
async function authPost(action: string, data: Record<string, string>) {
  const res = await fetch("/api/auth", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ action, ...data }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || "Auth failed")
  return json
}

// ── Token storage ────────────────────────────────────────────
function saveTokens(data: {
  accessToken?: string
  idToken?: string
  refreshToken?: string
  expiresIn?: number
}, username?: string) {
  if (data.accessToken)  safeStorage.setItem(KEYS.access,  data.accessToken)
  if (data.idToken)      safeStorage.setItem(KEYS.id,      data.idToken)
  if (data.refreshToken) safeStorage.setItem(KEYS.refresh, data.refreshToken)
  if (data.expiresIn)    safeStorage.setItem(KEYS.expiry,  String(Date.now() + data.expiresIn * 1000))
  if (username)          safeStorage.setItem(KEYS.username, username)
}

export function getAccessToken(): string | null {
  return safeStorage.getItem(KEYS.access)
}

export function getStoredUsername(): string | null {
  return safeStorage.getItem(KEYS.username)
}

export function clearTokens() {
  Object.values(KEYS).forEach((k) => safeStorage.removeItem(k))
}

// ── Parse JWT payload without verification ───────────────────
// We trust our own Cognito tokens; full verification happens server-side.
export function parseJwtPayload(token: string): Record<string, unknown> {
  try {
    const parts = token.split(".")
    if (parts.length < 2) return {}
    let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    while (b64.length % 4) {
      b64 += "="
    }
    const jsonStr = decodeURIComponent(
      atob(b64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(jsonStr)
  } catch {
    try {
      const b64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/") || ""
      return JSON.parse(atob(b64))
    } catch {
      return {}
    }
  }
}

// ── Public auth functions ────────────────────────────────────
export async function signIn(username: string, password: string) {
  const data = await authPost("signin", { username, password })
  saveTokens(data, username)
  return data
}

export async function signUp(username: string, password: string, name: string) {
  await authPost("signup", { username, password, name })
}

export async function confirmSignUp(username: string, code: string) {
  await authPost("confirm", { username, code })
}

export async function resendCode(username: string) {
  await authPost("resend", { username })
}

export async function forgotPassword(username: string) {
  await authPost("forgot-password", { username })
}

export async function resetPassword(username: string, code: string, newPassword: string) {
  await authPost("reset-password", { username, code, newPassword })
}

export function signOut() {
  clearTokens()
}

// ── Session helpers ──────────────────────────────────────────
export function isSessionValid(): boolean {
  const token  = safeStorage.getItem(KEYS.access)
  const expiry = safeStorage.getItem(KEYS.expiry)
  if (!token || !expiry) return false
  // 60 s buffer so we don't use a token that's about to expire
  return Date.now() < Number(expiry) - 60_000
}

export async function refreshSession(): Promise<boolean> {
  const refreshToken = safeStorage.getItem(KEYS.refresh)
  const username     = safeStorage.getItem(KEYS.username)
  if (!refreshToken || !username) return false
  try {
    const data = await authPost("refresh", { refreshToken, username })
    saveTokens(data)
    return true
  } catch {
    clearTokens()
    return false
  }
}
