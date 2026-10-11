// lib/aws-clients.ts
// One place that decides how server code authenticates to AWS.
//
//  • Production (Amplify Hosting): no keys are configured, so the SDK's default
//    credential chain picks up the Amplify SSR compute role — no long-lived
//    secrets to leak, rotate or have deactivated.
//  • Local development: AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY in .env.local
//    are found by the same default chain.
//  • Legacy: APP_ACCESS_KEY_ID / APP_SECRET_ACCESS_KEY are still honoured if set
//    (Amplify reserves the AWS_ prefix for its own variables).
//
// Server-only — never import this from a "use client" module.

export const AWS_REGION = process.env.APP_REGION || process.env.AWS_REGION || "ap-south-1"

export function awsCredentials(): { accessKeyId: string; secretAccessKey: string } | undefined {
  const accessKeyId = process.env.APP_ACCESS_KEY_ID
  const secretAccessKey = process.env.APP_SECRET_ACCESS_KEY
  if (accessKeyId && secretAccessKey) return { accessKeyId, secretAccessKey }
  return undefined // → default provider chain (env vars locally, compute role on Amplify)
}

/** Shared constructor options for every AWS SDK client. */
export function awsClientConfig(region: string = AWS_REGION) {
  return { region, credentials: awsCredentials() }
}
