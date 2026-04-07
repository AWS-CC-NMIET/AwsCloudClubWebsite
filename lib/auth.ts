// lib/auth.ts
// Server-side auth helpers — uses AWS SDK to validate Cognito tokens
// These run ONLY in API routes and middleware (Node.js runtime)

import {
  CognitoIdentityProviderClient,
  GetUserCommand,
  ListUsersInGroupCommand,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  ListUsersCommand,
  AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider"

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.APP_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.APP_ACCESS_KEY_ID!,
    secretAccessKey: process.env.APP_SECRET_ACCESS_KEY!,
  },
})

const USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!

// ── Get user info from access token ──────────────────────────
export async function getUserFromToken(accessToken: string) {
  try {
    const command = new GetUserCommand({ AccessToken: accessToken })
    const response = await cognitoClient.send(command)
    return response
  } catch {
    return null
  }
}

// ── Extract Bearer token from Authorization header ────────────
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null
  return authHeader.slice(7)
}

// ── Check if user is in admins group ─────────────────────────
export async function isUserAdmin(username: string): Promise<boolean> {
  try {
    const command = new ListUsersInGroupCommand({
      UserPoolId: USER_POOL_ID,
      GroupName: "admins",
    })
    const response = await cognitoClient.send(command)
    const admins = response.Users?.map((u) => u.Username) || []
    return admins.includes(username)
  } catch {
    return false
  }
}

// ── Validate auth + return user (use in every protected API route) ─
export async function validateAuth(request: Request) {
  const authHeader = request.headers.get("Authorization")
  const token = extractBearerToken(authHeader)
  if (!token) return null
  return await getUserFromToken(token)
}

// ── Validate auth and check admin role ───────────────────────
export async function validateAdminAuth(request: Request) {
  const user = await validateAuth(request)
  if (!user) return null
  const username = user.Username!
  const admin = await isUserAdmin(username)
  if (!admin) return null
  return user
}

// ── Admin: List all users ─────────────────────────────────────
export async function listAllUsers() {
  const command = new ListUsersCommand({ UserPoolId: USER_POOL_ID, Limit: 60 })
  const response = await cognitoClient.send(command)
  return response.Users || []
}

// ── Admin: List admin users ────────────────────────────────────
export async function listAdminUsers() {
  const command = new ListUsersInGroupCommand({
    UserPoolId: USER_POOL_ID,
    GroupName: "admins",
  })
  const response = await cognitoClient.send(command)
  return response.Users || []
}

// ── Admin: Promote user to admins group ───────────────────────
export async function promoteToAdmin(username: string) {
  const command = new AdminAddUserToGroupCommand({
    UserPoolId: USER_POOL_ID,
    Username: username,
    GroupName: "admins",
  })
  await cognitoClient.send(command)
}

// ── Admin: Remove user from admins group ──────────────────────
export async function demoteFromAdmin(username: string) {
  const command = new AdminRemoveUserFromGroupCommand({
    UserPoolId: USER_POOL_ID,
    Username: username,
    GroupName: "admins",
  })
  await cognitoClient.send(command)
}
