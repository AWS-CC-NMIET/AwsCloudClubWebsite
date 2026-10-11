#!/usr/bin/env node
// scripts/setup-aws.mjs
// Create the website's DynamoDB tables (idempotent). The site works with empty
// tables — it falls back to the built-in content in lib/club-content.ts until
// admins add items in the Admin panel (Admin → Team → Import roster copies the
// built-in team).
//
// Credentials come from your AWS CLI profile / SSO / environment — never hardcoded.
//   AWS_PROFILE=sbg node scripts/setup-aws.mjs
//
// Env: AWS_REGION (default ap-south-1) and the DYNAMODB_*_TABLE names (defaults below).

import { createRequire } from "module"

const require = createRequire(import.meta.url)
const { DynamoDBClient, CreateTableCommand, DescribeTableCommand, waitUntilTableExists } = require("@aws-sdk/client-dynamodb")

const region = process.env.AWS_REGION || "ap-south-1"
const client = new DynamoDBClient({ region })

const TABLES = [
  process.env.DYNAMODB_EVENTS_TABLE || "acc-nmiet-events",
  process.env.DYNAMODB_TEAM_TABLE || "acc-nmiet-team",
  process.env.DYNAMODB_PROJECTS_TABLE || "acc-nmiet-projects",
  process.env.DYNAMODB_ACHIEVEMENTS_TABLE || "acc-nmiet-achievements",
  process.env.DYNAMODB_RESOURCES_TABLE || "acc-nmiet-resources",
  process.env.DYNAMODB_SOCIAL_TABLE || "acc-nmiet-social-links",
  process.env.DYNAMODB_CONFIG_TABLE || "acc-nmiet-site-config",
  process.env.DYNAMODB_CONTACTS_TABLE || "acc-nmiet-contact-submissions",
  process.env.DYNAMODB_PROFILES_TABLE || "acc-nmiet-user-profiles",
]

async function exists(name) {
  try {
    await client.send(new DescribeTableCommand({ TableName: name }))
    return true
  } catch (err) {
    if (err.name === "ResourceNotFoundException") return false
    throw err
  }
}

console.log(`DynamoDB tables in ${region}`)
for (const name of TABLES) {
  if (await exists(name)) {
    console.log(`  ✓ ${name} (exists)`)
    continue
  }
  // Every table is keyed by a string `id`; on-demand billing keeps idle cost at zero.
  await client.send(
    new CreateTableCommand({
      TableName: name,
      KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
      AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
      BillingMode: "PAY_PER_REQUEST",
    })
  )
  await waitUntilTableExists({ client, maxWaitTime: 60 }, { TableName: name })
  console.log(`  + ${name} (created)`)
}
console.log("Done. Sign in as an admin and use Admin → Team → Import roster to copy the team.")
