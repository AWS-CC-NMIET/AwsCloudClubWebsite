// lib/auth.ts
// Server-side auth for API routes.
//
// Access tokens are verified locally with aws-jwt-verify (signature against the
// user pool's JWKS, expiry, token use and app client id) — no IAM credentials
// and no Cognito round-trip per request. Admin rights come from the token's
// `cognito:groups` claim, which Cognito signs, so it cannot be forged.

import { NextResponse } from "next/server"
import { CognitoJwtVerifier } from "aws-jwt-verify"
import {
  CognitoIdentityProviderClient,
  GetUserCommand,
  ListUsersInGroupCommand,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  ListUsersCommand,
  type UserType,
} from "@aws-sdk/client-cognito-identity-provider"
import { awsClientConfig } from "@/lib/aws-clients"

export const ADMIN_GROUP = "admins"

const USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID
const COGNITO_REGION = process.env.NEXT_PUBLIC_COGNITO_REGION || USER_POOL_ID?.split("_")[0]

const verifier =
  USER_POOL_ID && CLIENT_ID
    ? CognitoJwtVerifier.create({ userPoolId: USER_POOL_ID, tokenUse: "access", clientId: CLIENT_ID })
    : null

const cognitoClient = new CognitoIdentityProviderClient(awsClientConfig(COGNITO_REGION))

export interface AuthUser {
  sub: string
  username: string
  groups: string[]
  isAdmin: boolean
  /** The raw access token, for calls that act as the user (e.g. GetUser). */
  accessToken: string
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null
  const token = authHeader.slice(7).trim()
  return token || null
}

export async function verifyAccessToken(accessToken: string): Promise<AuthUser | null> {
  if (!verifier) {
    console.error("Auth misconfigured: NEXT_PUBLIC_COGNITO_USER_POOL_ID / NEXT_PUBLIC_COGNITO_CLIENT_ID missing")
    return null
  }
  try {
    const payload = await verifier.verify(accessToken)
    const groups = Array.isArray(payload["cognito:groups"]) ? (payload["cognito:groups"] as string[]) : []
    return {
      sub: payload.sub,
      username: String(payload.username ?? payload.sub),
      groups,
      isAdmin: groups.includes(ADMIN_GROUP),
      accessToken,
    }
  } catch {
    return null
  }
}

/** Signed-in user for this request, or null. */
export async function validateAuth(request: Request): Promise<AuthUser | null> {
  const token = extractBearerToken(request.headers.get("Authorization"))
  return token ? verifyAccessToken(token) : null
}

/** Signed-in admin for this request, or null. */
export async function validateAdminAuth(request: Request): Promise<AuthUser | null> {
  const user = await validateAuth(request)
  return user?.isAdmin ? user : null
}

/**
 * Guard for admin-only routes. Returns the admin, or a ready-to-return response:
 * 401 when not signed in, 403 when signed in without admin rights.
 */
export async function requireAdmin(request: Request): Promise<AuthUser | NextResponse> {
  const user = await validateAuth(request)
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401, headers: { "Cache-Control": "no-store" } })
  if (!user.isAdmin) return NextResponse.json({ error: "Admins only" }, { status: 403, headers: { "Cache-Control": "no-store" } })
  return user
}

/** Guard for routes that need any signed-in user. */
export async function requireUser(request: Request): Promise<AuthUser | NextResponse> {
  const user = await validateAuth(request)
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401, headers: { "Cache-Control": "no-store" } })
  return user
}

/** Cognito profile attributes (email, name) for the token's owner. Needs no IAM credentials. */
export async function getUserAttributes(accessToken: string): Promise<Record<string, string>> {
  try {
    const res = await cognitoClient.send(new GetUserCommand({ AccessToken: accessToken }))
    return Object.fromEntries((res.UserAttributes ?? []).map(a => [a.Name ?? "", a.Value ?? ""]))
  } catch {
    return {}
  }
}

// ── Admin user management (these calls use the server's IAM role) ────────────

async function listAll<T>(fetchPage: (token?: string) => Promise<{ items: T[]; next?: string }>) {
  const out: T[] = []
  let token: string | undefined
  do {
    const page = await fetchPage(token)
    out.push(...page.items)
    token = page.next
  } while (token)
  return out
}

export async function listAllUsers(): Promise<UserType[]> {
  return listAll(async PaginationToken => {
    const res = await cognitoClient.send(new ListUsersCommand({ UserPoolId: USER_POOL_ID, Limit: 60, PaginationToken }))
    return { items: res.Users ?? [], next: res.PaginationToken }
  })
}

export async function listAdminUsers(): Promise<UserType[]> {
  return listAll(async NextToken => {
    const res = await cognitoClient.send(new ListUsersInGroupCommand({ UserPoolId: USER_POOL_ID, GroupName: ADMIN_GROUP, NextToken }))
    return { items: res.Users ?? [], next: res.NextToken }
  })
}

export async function promoteToAdmin(username: string) {
  await cognitoClient.send(new AdminAddUserToGroupCommand({ UserPoolId: USER_POOL_ID, Username: username, GroupName: ADMIN_GROUP }))
}

export async function demoteFromAdmin(username: string) {
  await cognitoClient.send(new AdminRemoveUserFromGroupCommand({ UserPoolId: USER_POOL_ID, Username: username, GroupName: ADMIN_GROUP }))
}
