/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  // ── Image optimization ──────────────────────────────────────────────────────
  // Re-enabled: Next.js auto-converts PNG → WebP/AVIF, serves correct sizes.
  // logo-full.png (2MB) → ~150KB WebP automatically.
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // 24 hours
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },

  // ── Security headers ────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Clickjacking protection
          { key: 'X-Frame-Options', value: 'DENY' },
          // MIME sniffing protection
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Referrer policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Permissions policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.amazonaws.com https://secure.meetupstatic.com",
              "connect-src 'self' https://*.amazonaws.com https://api.meetup.com https://nominatim.openstreetmap.org https://api.open-meteo.com https://ipapi.co",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          // HSTS (enable once HTTPS confirmed on production)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },

  // Amplify Hosting does not expose console env vars to the SSR runtime, so the
  // server-side config the API routes need is baked in at build time.
  // AWS credentials are deliberately NOT listed: in production the SDK uses the
  // Amplify SSR compute role; locally it reads AWS_* from .env.local at runtime.
  // (APP_* keys remain supported for setups that still use an access key.)
  env: {
    COGNITO_CLIENT_SECRET:       process.env.COGNITO_CLIENT_SECRET,
    APP_ACCESS_KEY_ID:           process.env.APP_ACCESS_KEY_ID,
    APP_SECRET_ACCESS_KEY:       process.env.APP_SECRET_ACCESS_KEY,
    APP_REGION:                  process.env.APP_REGION,
    SES_REGION:                  process.env.SES_REGION,
    SES_FROM_EMAIL:              process.env.SES_FROM_EMAIL,
    SES_TO_EMAIL:                process.env.SES_TO_EMAIL,
    DYNAMODB_EVENTS_TABLE:       process.env.DYNAMODB_EVENTS_TABLE,
    DYNAMODB_TEAM_TABLE:         process.env.DYNAMODB_TEAM_TABLE,
    DYNAMODB_PROJECTS_TABLE:     process.env.DYNAMODB_PROJECTS_TABLE,
    DYNAMODB_ACHIEVEMENTS_TABLE: process.env.DYNAMODB_ACHIEVEMENTS_TABLE,
    DYNAMODB_RESOURCES_TABLE:    process.env.DYNAMODB_RESOURCES_TABLE,
    DYNAMODB_SOCIAL_TABLE:       process.env.DYNAMODB_SOCIAL_TABLE,
    DYNAMODB_CONFIG_TABLE:       process.env.DYNAMODB_CONFIG_TABLE,
    DYNAMODB_CONTACTS_TABLE:     process.env.DYNAMODB_CONTACTS_TABLE,
    DYNAMODB_PROFILES_TABLE:     process.env.DYNAMODB_PROFILES_TABLE,
  },
}

export default nextConfig
