// app/api/health/route.ts
// Deployment health check.
//   • Everyone: { ok } — is the content database reachable?
//   • Admins:   per-service status (DynamoDB tables, S3, SES, Cognito, config),
//               to confirm the Amplify compute role and env vars after a deploy.
// Never returns secret values — only whether they are set.

import { NextResponse } from "next/server"
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb"
import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3"
import { SESClient, GetSendQuotaCommand } from "@aws-sdk/client-ses"
import { AWS_REGION, awsClientConfig, awsCredentials } from "@/lib/aws-clients"
import { TABLES } from "@/lib/dynamodb"
import { BUCKET } from "@/lib/s3"
import { listAllUsers, validateAdminAuth } from "@/lib/auth"
import { NO_STORE } from "@/lib/http"

type Check = { ok: boolean; detail?: string }

async function check(fn: () => Promise<unknown>): Promise<Check> {
  try {
    await fn()
    return { ok: true }
  } catch (err) {
    const e = err as { name?: string; message?: string }
    return { ok: false, detail: `${e.name ?? "Error"}: ${(e.message ?? "").slice(0, 160)}` }
  }
}

export async function GET(request: Request) {
  const ddb = new DynamoDBClient(awsClientConfig())
  const admin = await validateAdminAuth(request)

  if (!admin) {
    const db = await check(() => ddb.send(new ScanCommand({ TableName: TABLES.EVENTS, Limit: 1 })))
    return NextResponse.json({ ok: db.ok }, { status: db.ok ? 200 : 503, headers: NO_STORE })
  }

  const tableEntries = await Promise.all(
    Object.entries(TABLES).map(async ([name, table]) => [
      name,
      { table, ...(await check(() => ddb.send(new ScanCommand({ TableName: table, Limit: 1 })))) },
    ])
  )
  const s3 = new S3Client(awsClientConfig(process.env.NEXT_PUBLIC_S3_REGION || AWS_REGION))
  const ses = new SESClient(awsClientConfig(process.env.SES_REGION || AWS_REGION))

  const [bucket, email, cognito] = await Promise.all([
    check(() => s3.send(new HeadBucketCommand({ Bucket: BUCKET }))),
    check(() => ses.send(new GetSendQuotaCommand({}))),
    check(() => listAllUsers()),
  ])

  const services = {
    dynamodb: Object.fromEntries(tableEntries),
    s3: { bucket: BUCKET, ...bucket },
    ses: { from: Boolean(process.env.SES_FROM_EMAIL), ...email },
    cognitoAdminApi: cognito,
  }

  const config = {
    region: AWS_REGION,
    credentials: awsCredentials() ? "access keys (APP_*)" : "default chain (Amplify compute role / local env)",
    cognitoUserPool: Boolean(process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID),
    cognitoClient: Boolean(process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID),
    cognitoClientSecret: Boolean(process.env.COGNITO_CLIENT_SECRET),
    sesFromEmail: Boolean(process.env.SES_FROM_EMAIL),
    sesToEmail: Boolean(process.env.SES_TO_EMAIL),
  }

  const ok =
    Object.values(services.dynamodb).every(t => (t as Check).ok) && bucket.ok && email.ok && cognito.ok
  return NextResponse.json({ ok, services, config }, { headers: NO_STORE })
}
