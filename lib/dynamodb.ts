// lib/dynamodb.ts
// DynamoDB client + typed table helpers for all content

import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb"
import { v4 as uuidv4 } from "uuid"

// ── Client Setup ─────────────────────────────────────────────
const client = new DynamoDBClient({
  region: process.env.APP_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.APP_ACCESS_KEY_ID!,
    secretAccessKey: process.env.APP_SECRET_ACCESS_KEY!,
  },
})

export const db = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
})

// ── Table Names (from env vars) ───────────────────────────────
export const TABLES = {
  EVENTS:       process.env.DYNAMODB_EVENTS_TABLE       || "acc-nmiet-events",
  TEAM:         process.env.DYNAMODB_TEAM_TABLE         || "acc-nmiet-team",
  PROJECTS:     process.env.DYNAMODB_PROJECTS_TABLE     || "acc-nmiet-projects",
  ACHIEVEMENTS: process.env.DYNAMODB_ACHIEVEMENTS_TABLE || "acc-nmiet-achievements",
  RESOURCES:    process.env.DYNAMODB_RESOURCES_TABLE    || "acc-nmiet-resources",
  SOCIAL:       process.env.DYNAMODB_SOCIAL_TABLE       || "acc-nmiet-social-links",
  CONFIG:       process.env.DYNAMODB_CONFIG_TABLE       || "acc-nmiet-site-config",
  CONTACTS:     process.env.DYNAMODB_CONTACTS_TABLE     || "acc-nmiet-contact-submissions",
  PROFILES:     process.env.DYNAMODB_PROFILES_TABLE     || "acc-nmiet-user-profiles",
} as const

// ── TypeScript Interfaces ─────────────────────────────────────

export interface Event {
  id: string
  title: string
  date: string
  location: string
  description?: string
  attendees: number
  imageUrls: string[]
  isPast: boolean
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  skills: string[]
  bio?: string
  email?: string
  linkedin?: string
  github?: string
  photoUrl?: string
  status: "running" | "stopped"
  order: number
  createdAt: string
}

export interface Project {
  id: string
  title: string
  description: string
  stack: string[]
  author: string
  status: "Production" | "Development" | "Beta"
  githubUrl?: string
  liveUrl?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Achievement {
  id: string
  title: string
  date: string
  description: string
  type: string
  iconName: string
  color: string
  order: number
  createdAt: string
}

export interface Resource {
  id: string
  name: string
  category: string
  type: "Course" | "Video" | "Document" | "Tool"
  url: string
  featured: boolean
  order: number
  createdAt: string
}

export interface SocialLink {
  id: string
  name: string
  url: string
  followers?: string
  platform: string
  color: string
  createdAt: string
}

export interface SiteConfig {
  id: string
  key: string
  value: string
  type: string
  updatedAt: string
}

export interface ContactSubmission {
  id: string
  name: string
  email: string
  subject: string
  message: string
  submittedAt: string
  isRead: boolean
}

export interface UserProfile {
  id: string
  sub: string           // Cognito user sub (unique ID)
  displayName: string
  email: string
  bio?: string
  avatarUrl?: string
  linkedinUrl?: string
  githubUrl?: string
  skills?: string[]
  joinedAt: string
  updatedAt: string
}

// ── Generic CRUD Helpers ──────────────────────────────────────

export async function putItem(tableName: string, item: Record<string, unknown>) {
  const now = new Date().toISOString()
  const enriched = {
    ...item,
    id: item.id || uuidv4(),
    createdAt: item.createdAt || now,
    updatedAt: now,
  }
  await db.send(new PutCommand({ TableName: tableName, Item: enriched }))
  return enriched
}

export async function getItem(tableName: string, id: string) {
  const result = await db.send(new GetCommand({ TableName: tableName, Key: { id } }))
  return result.Item || null
}

export async function scanTable(tableName: string) {
  const result = await db.send(new ScanCommand({ TableName: tableName }))
  return result.Items || []
}

export async function deleteItem(tableName: string, id: string) {
  await db.send(new DeleteCommand({ TableName: tableName, Key: { id } }))
}

export async function updateItem(
  tableName: string,
  id: string,
  updates: Record<string, unknown>
) {
  const now = new Date().toISOString()
  const updateData: Record<string, unknown> = { ...updates, updatedAt: now }
  delete updateData.id // Can't update the key

  const keys = Object.keys(updateData)
  const expr = keys.map((k) => `#${k} = :${k}`).join(", ")
  const names: Record<string, string> = {}
  const values: Record<string, unknown> = {}
  keys.forEach((k) => {
    names[`#${k}`] = k
    values[`:${k}`] = updateData[k]
  })

  const result = await db.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { id },
      UpdateExpression: `SET ${expr}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: "ALL_NEW",
    })
  )
  return result.Attributes
}

// ── SiteConfig helpers ────────────────────────────────────────

export async function getConfig(key: string): Promise<string | null> {
  const items = await scanTable(TABLES.CONFIG)
  const found = items.find((i: Record<string, unknown>) => i.key === key)
  return found ? (found.value as string) : null
}

export async function setConfig(key: string, value: string, type = "text") {
  const existing = await scanTable(TABLES.CONFIG)
  const found = existing.find((i: Record<string, unknown>) => i.key === key) as Record<string, unknown> | undefined
  if (found) {
    await updateItem(TABLES.CONFIG, found.id as string, { value, type })
  } else {
    await putItem(TABLES.CONFIG, { key, value, type })
  }
}
