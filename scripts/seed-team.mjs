#!/usr/bin/env node
// scripts/seed-team.mjs
// One-off: copy the team roster from lib/club-content.ts into the DynamoDB
// team table, so the Admin panel becomes the single source of truth.
//
// Idempotent — members whose email (or name) already exists are skipped.
//
// Usage (credentials from your AWS CLI profile / SSO / env — never hardcoded):
//   node scripts/seed-team.mjs            # dry run: shows what would be written
//   node scripts/seed-team.mjs --apply    # writes missing members
//
// Env: AWS_REGION (default ap-south-1), DYNAMODB_TEAM_TABLE (default acc-nmiet-team)

import { readFileSync } from "fs"
import { randomUUID } from "crypto"
import { createRequire } from "module"

const require = createRequire(import.meta.url)
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb")
const { DynamoDBDocumentClient, ScanCommand, PutCommand } = require("@aws-sdk/lib-dynamodb")

const apply = process.argv.includes("--apply")
const region = process.env.AWS_REGION || "ap-south-1"
const table = process.env.DYNAMODB_TEAM_TABLE || "acc-nmiet-team"

// Pull TEAM_MEMBERS out of the TypeScript source without a TS toolchain.
const source = readFileSync(new URL("../lib/club-content.ts", import.meta.url), "utf8")
const block = source.slice(source.indexOf("const ROSTER"), source.indexOf("export const TEAM_MEMBERS"))
const gh = handle => `https://github.com/${handle}`
const li = handle => `https://www.linkedin.com/in/${handle}`
const members = [...block.matchAll(/\{ id: "m-[^}]+\}/g)].map(m => Function("gh", "li", `"use strict"; return (${m[0]})`)(gh, li))
if (members.length === 0) throw new Error("Could not read TEAM_MEMBERS from lib/club-content.ts")

const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), { marshallOptions: { removeUndefinedValues: true } })

const existing = []
let ExclusiveStartKey
do {
  const page = await db.send(new ScanCommand({ TableName: table, ExclusiveStartKey }))
  existing.push(...(page.Items ?? []))
  ExclusiveStartKey = page.LastEvaluatedKey
} while (ExclusiveStartKey)

const norm = v => String(v ?? "").trim().toLowerCase()
const has = m =>
  existing.some(e => (m.email && norm(e.email) === norm(m.email)) || norm(e.name) === norm(m.name))

const missing = members.filter(m => !has(m))
console.log(`Table ${table} (${region}): ${existing.length} existing, ${members.length} in roster, ${missing.length} to add.`)

for (const m of missing) {
  const now = new Date().toISOString()
  const item = {
    id: randomUUID(),
    name: m.name,
    role: m.role,
    skills: m.skills ?? [],
    bio: m.bio ?? "",
    email: m.email ?? "",
    linkedin: m.linkedin ?? "",
    github: m.github ?? "",
    photoUrl: m.photoUrl ?? "",
    awsService: m.awsService ?? "",
    status: m.status ?? "running",
    order: m.order ?? 99,
    // Marks the table as seeded: from now on the site shows exactly what's in DynamoDB.
    source: "roster-seed",
    createdAt: now,
    updatedAt: now,
  }
  console.log(`${apply ? "+ adding" : "· would add"}  ${String(item.order).padStart(2)}  ${item.name} — ${item.role}`)
  if (apply) await db.send(new PutCommand({ TableName: table, Item: item }))
}

if (!apply && missing.length) console.log("\nDry run only. Re-run with --apply to write these members.")
