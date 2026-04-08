/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Bake server-side env vars into the Lambda bundle at build time.
  // Amplify injects these during the build phase but NOT into the SSR Lambda runtime,
  // so we pull them from the build environment here.
  env: {
    COGNITO_CLIENT_SECRET:            process.env.COGNITO_CLIENT_SECRET,
    APP_ACCESS_KEY_ID:                process.env.APP_ACCESS_KEY_ID,
    APP_SECRET_ACCESS_KEY:            process.env.APP_SECRET_ACCESS_KEY,
    APP_REGION:                       process.env.APP_REGION,
    SES_REGION:                       process.env.SES_REGION,
    SES_FROM_EMAIL:                   process.env.SES_FROM_EMAIL,
    SES_TO_EMAIL:                     process.env.SES_TO_EMAIL,
    DYNAMODB_EVENTS_TABLE:            process.env.DYNAMODB_EVENTS_TABLE,
    DYNAMODB_TEAM_TABLE:              process.env.DYNAMODB_TEAM_TABLE,
    DYNAMODB_PROJECTS_TABLE:          process.env.DYNAMODB_PROJECTS_TABLE,
    DYNAMODB_ACHIEVEMENTS_TABLE:      process.env.DYNAMODB_ACHIEVEMENTS_TABLE,
    DYNAMODB_RESOURCES_TABLE:         process.env.DYNAMODB_RESOURCES_TABLE,
    DYNAMODB_SOCIAL_TABLE:            process.env.DYNAMODB_SOCIAL_TABLE,
    DYNAMODB_CONFIG_TABLE:            process.env.DYNAMODB_CONFIG_TABLE,
    DYNAMODB_CONTACTS_TABLE:          process.env.DYNAMODB_CONTACTS_TABLE,
    DYNAMODB_PROFILES_TABLE:          process.env.DYNAMODB_PROFILES_TABLE,
    MEETUP_MEMBER_COUNT:              process.env.MEETUP_MEMBER_COUNT,
  },
}

export default nextConfig
