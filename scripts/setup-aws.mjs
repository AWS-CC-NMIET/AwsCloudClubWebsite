#!/usr/bin/env node
// scripts/setup-aws.mjs
// Run this ONCE to create all DynamoDB tables and seed initial data
// Usage: node scripts/setup-aws.mjs
// Requires: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION set in .env.local

import { readFileSync } from "fs"
import { createRequire } from "module"

// Load .env.local manually — no dotenv dependency needed
try {
  const envFile = readFileSync(".env.local", "utf-8")
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIdx = trimmed.indexOf("=")
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "")
    if (key && !(key in process.env)) process.env[key] = val
  }
} catch {
  console.warn("⚠️  .env.local not found — using environment variables directly")
}

const require = createRequire(import.meta.url)
const { DynamoDBClient, CreateTableCommand, DescribeTableCommand, waitUntilTableExists } = require("@aws-sdk/client-dynamodb")
const { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } = require("@aws-sdk/lib-dynamodb")

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})
const doc = DynamoDBDocumentClient.from(client)

const TABLES = {
  EVENTS:       process.env.DYNAMODB_EVENTS_TABLE       || "acc-nmiet-events",
  TEAM:         process.env.DYNAMODB_TEAM_TABLE         || "acc-nmiet-team",
  PROJECTS:     process.env.DYNAMODB_PROJECTS_TABLE     || "acc-nmiet-projects",
  ACHIEVEMENTS: process.env.DYNAMODB_ACHIEVEMENTS_TABLE || "acc-nmiet-achievements",
  RESOURCES:    process.env.DYNAMODB_RESOURCES_TABLE    || "acc-nmiet-resources",
  SOCIAL:       process.env.DYNAMODB_SOCIAL_TABLE       || "acc-nmiet-social-links",
  CONFIG:       process.env.DYNAMODB_CONFIG_TABLE       || "acc-nmiet-site-config",
  CONTACTS:     process.env.DYNAMODB_CONTACTS_TABLE     || "acc-nmiet-contact-submissions",
  PROFILES:     process.env.DYNAMODB_PROFILES_TABLE     || "acc-nmiet-user-profiles",
}

async function tableExists(name) {
  try {
    await client.send(new DescribeTableCommand({ TableName: name }))
    return true
  } catch {
    return false
  }
}

async function createTable(name) {
  if (await tableExists(name)) {
    console.log(`  ✓ Table "${name}" already exists, skipping.`)
    return
  }
  await client.send(new CreateTableCommand({
    TableName: name,
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
    BillingMode: "PAY_PER_REQUEST",
  }))
  console.log(`  ⟳ Creating table "${name}"...`)
  await waitUntilTableExists({ client, maxWaitTime: 60 }, { TableName: name })
  console.log(`  ✓ Table "${name}" created.`)
}

async function putItem(tableName, item) {
  await doc.send(new PutCommand({ TableName: tableName, Item: item }))
}

// ── Seed data ─────────────────────────────────────────────────
const now = new Date().toISOString()

const socialLinks = [
  { id: "sl-1", name: "LinkedIn",  platform: "linkedin",  url: "https://www.linkedin.com/company/aws-cloud-club-nmiet", followers: "TBD", color: "#0077B5",  createdAt: now },
  { id: "sl-2", name: "GitHub",    platform: "github",    url: "https://github.com/aws-cloud-club-nmiet",               followers: "TBD", color: "#24292e",  createdAt: now },
  { id: "sl-3", name: "Instagram", platform: "instagram", url: "https://www.instagram.com/awscloudclub.nmiet",          followers: "TBD", color: "#E1306C",  createdAt: now },
  { id: "sl-4", name: "YouTube",   platform: "youtube",   url: "https://www.youtube.com/@awscloudclubNMIET",            followers: "TBD", color: "#FF0000",  createdAt: now },
  { id: "sl-5", name: "Discord",   platform: "discord",   url: "https://discord.gg/awscloudclub-nmiet",                 followers: "TBD", color: "#5865F2",  createdAt: now },
]

const siteConfig = [
  { id: "cfg-1", key: "mission",     value: "To democratize cloud computing education and empower students with the skills needed to build scalable, innovative solutions using AWS technologies at NMIET.", type: "text", updatedAt: now },
  { id: "cfg-2", key: "vision",      value: "To become the leading student-driven cloud computing community in Maharashtra, producing industry-ready cloud professionals.", type: "text", updatedAt: now },
  { id: "cfg-3", key: "memberCount", value: "150+",  type: "stat", updatedAt: now },
  { id: "cfg-4", key: "eventCount",  value: "25+",   type: "stat", updatedAt: now },
  { id: "cfg-5", key: "projectCount",value: "40+",   type: "stat", updatedAt: now },
  { id: "cfg-6", key: "workshopCount",value: "30+",  type: "stat", updatedAt: now },
  { id: "cfg-7", key: "contactEmail",value: "awscloudclub.nmiet@gmail.com", type: "contact", updatedAt: now },
  { id: "cfg-8", key: "location",    value: "NMIET Campus, Talegaon Dabhade, Pune, Maharashtra 410507", type: "contact", updatedAt: now },
  { id: "cfg-9", key: "phone",       value: "Update this in admin panel", type: "contact", updatedAt: now },
  { id: "cfg-10", key: "clubHours",  value: JSON.stringify([{day:"Mon – Fri",time:"10:00 AM – 6:00 PM"},{day:"Saturday",time:"12:00 PM – 4:00 PM"},{day:"Sunday",time:"Closed"}]), type: "json", updatedAt: now },
]

const certifications = [
  { id: "res-cert-1", name: "AWS Cloud Practitioner", category: "Certifications", type: "Course", url: "https://aws.amazon.com/certification/certified-cloud-practitioner/", featured: true, order: 1, createdAt: now },
  { id: "res-cert-2", name: "AWS Solutions Architect – Associate", category: "Certifications", type: "Course", url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/", featured: true, order: 2, createdAt: now },
  { id: "res-cert-3", name: "AWS Developer – Associate", category: "Certifications", type: "Course", url: "https://aws.amazon.com/certification/certified-developer-associate/", featured: false, order: 3, createdAt: now },
  { id: "res-cert-4", name: "AWS DevOps Engineer – Professional", category: "Certifications", type: "Course", url: "https://aws.amazon.com/certification/certified-devops-engineer-professional/", featured: false, order: 4, createdAt: now },
  { id: "res-1", name: "AWS Cloud Practitioner Essentials", category: "AWS Fundamentals", type: "Course", url: "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/", featured: true, order: 10, createdAt: now },
  { id: "res-2", name: "AWS Well-Architected Framework", category: "AWS Fundamentals", type: "Document", url: "https://aws.amazon.com/architecture/well-architected/", featured: true, order: 11, createdAt: now },
  { id: "res-3", name: "AWS Free Tier Overview", category: "AWS Fundamentals", type: "Document", url: "https://aws.amazon.com/free/", featured: false, order: 12, createdAt: now },
  { id: "res-4", name: "Lambda Best Practices", category: "Compute & Serverless", type: "Document", url: "https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html", featured: true, order: 20, createdAt: now },
  { id: "res-5", name: "AWS CDK Workshop", category: "DevOps & CI/CD", type: "Course", url: "https://cdkworkshop.com/", featured: true, order: 30, createdAt: now },
  { id: "res-6", name: "DynamoDB Deep Dive", category: "Database & Storage", type: "Course", url: "https://aws.amazon.com/dynamodb/getting-started/", featured: true, order: 40, createdAt: now },
]

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log("\n🚀 AWS Cloud Club NMIET — DynamoDB Setup Script")
  console.log("━".repeat(50))
  console.log(`\nRegion: ${process.env.AWS_REGION || "ap-south-1"}`)
  console.log("")

  // Create all tables
  console.log("📋 Creating DynamoDB tables...")
  for (const [key, name] of Object.entries(TABLES)) {
    await createTable(name)
  }

  console.log("\n🌱 Seeding initial data...")

  // Seed Social Links
  console.log("  Social links...")
  for (const link of socialLinks) await putItem(TABLES.SOCIAL, link)

  // Seed Site Config
  console.log("  Site config...")
  for (const cfg of siteConfig) await putItem(TABLES.CONFIG, cfg)

  // Seed Resources
  console.log("  Resources...")
  for (const res of certifications) await putItem(TABLES.RESOURCES, res)

  console.log("\n✅ Setup complete!")
  console.log("━".repeat(50))
  console.log("\nNext steps:")
  console.log("  1. Open the admin panel in the website")
  console.log("  2. Add your real team members")
  console.log("  3. Add your real events with photos")
  console.log("  4. Add your projects and achievements")
  console.log("  5. Update social media follower counts")
  console.log("")
}

main().catch((err) => {
  console.error("❌ Setup failed:", err)
  process.exit(1)
})
