"use client"
// lib/auth-client.ts
// Client-side auth helpers — call our /api/auth server route so the Cognito
// client secret never touches the browser.  Tokens are kept in localStorage.

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
  if (data.accessToken)  localStorage.setItem(KEYS.access,  data.accessToken)
  if (data.idToken)      localStorage.setItem(KEYS.id,      data.idToken)
  if (data.refreshToken) localStorage.setItem(KEYS.refresh, data.refreshToken)
  if (data.expiresIn)    localStorage.setItem(KEYS.expiry,  String(Date.now() + data.expiresIn * 1000))
  if (username)          localStorage.setItem(KEYS.username, username)
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(KEYS.access)
}

export function getStoredUsername(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(KEYS.username)
}

export function clearTokens() {
  if (typeof window === "undefined") return
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
}

// ── Parse JWT payload without verification ───────────────────
// We trust our own Cognito tokens; full verification happens server-side.
export function parseJwtPayload(token: string): Record<string, unknown> {
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    return JSON.parse(atob(b64))
  } catch {
    return {}
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
