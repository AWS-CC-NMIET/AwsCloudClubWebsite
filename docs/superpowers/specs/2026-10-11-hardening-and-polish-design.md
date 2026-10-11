# Security hardening, content validity & macOS polish — Design

Date: 2026-10-11 · Branch: `feat/macos-content-migration`

Follow-up to `2026-10-10-macos-content-migration-design.md`. AWS is active again, but the
site's IAM access key is invalid, so every DynamoDB-backed API returns 500 in production.

## Decisions (agreed)

| Topic | Decision |
|---|---|
| AWS credentials | No long-lived keys. Server code uses the Amplify SSR **compute role** (default credential chain) when no keys are configured; keys remain supported for local dev. |
| Team data | DynamoDB is the source of truth, managed in Admin. A one-off seed script loads the 27-member roster; the hardcoded roster is only an offline fallback. |
| Discord | Hidden until a new non-expiring invite is provided (the old one is "Unknown Invite"). |
| Admin access | Cognito `admins` group, enforced server-side on every admin API and mirrored in the UI. |

## Phase 1 — Security & backend

1. **`lib/aws-clients.ts`** — one place that builds SDK clients. Uses explicit keys only if
   `APP_ACCESS_KEY_ID`/`APP_SECRET_ACCESS_KEY` (or `AWS_*`) are set; otherwise the default
   provider chain (Amplify compute role). `lib/dynamodb.ts`, `lib/s3.ts`, `lib/ses.ts`,
   `lib/auth.ts`, `app/api/image` use it. `next.config.mjs` stops baking secret keys.
2. **Token verification** — `aws-jwt-verify` validates Cognito access tokens locally
   (signature, expiry, client id). Admin = `cognito:groups` contains `admins`. No IAM
   credentials needed for auth checks; no extra Cognito round-trips per request.
   `validateAuth` returns `{ sub, username, groups, isAdmin }`. Non-admin authenticated
   callers on admin routes get 403 (unauthenticated 401).
3. **`GET /api/auth/session`** — returns `{ isAdmin, username }` for the bearer token.
4. **Admin UI gating** — the Admin app is hidden from Dock/Springboard/Spotlight unless the
   session's token has the `admins` group; opening it as a non-admin shows an "Access
   denied" screen; the Admin app confirms with `/api/auth/session` before rendering.
5. **Input validation** — `zod` schemas per entity; admin create/update only accept
   whitelisted fields (no overwriting `id`/`createdAt`); URLs must be http(s).
6. **`/api/image`** — only keys under `events/`, `team/`, `projects/`, `general/`.
7. **Contact** — honeypot field, length limits matched client/server.
8. **Caching** — public GETs send `Cache-Control: public, s-maxage=60,
   stale-while-revalidate=600`; Meetup is fetched with `revalidate: 600`.
9. **`GET /api/health`** — public `{ ok }`; admins get per-service status (DynamoDB tables,
   S3 bucket, SES identity, Cognito config) to verify deployments.
10. **Seed script** — `scripts/seed-team.mjs`, idempotent by email.

## Phase 2 — Content validity

- Member count is live everywhere (no hardcoded "299+"); fallback raised to the
  last-known real figure.
- Remove the dead Discord invite and the 404 GitHub link (Aayush Pawar).
- Re-check AWS facts in the terminal against current sources; drop anything unverifiable.
- Team/Resources/Social: DynamoDB first, curated content as fallback.

## Phase 3 — macOS everywhere

- **Admin** → System Settings–style: sidebar of sections, list + inspector editing, sheets
  for create/edit, macOS form controls, image uploads; mobile uses list → detail.
- **Profile** → Apple Account–style page.
- **Login** → macOS lock screen (blurred wallpaper, avatar, name, password field) and
  matching sign-up / verify / reset sheets; same component on mobile.
- PWA install prompt and error boundary restyled.

## Phase 4 — Performance & polish

- Remove `aws-amplify` (unused at runtime) and the stray `next.js` dependency.
- SEO: metadata, Open Graph image, `robots.ts`, `sitemap.ts`, Organization JSON-LD.
- Accessibility pass (labels, focus, contrast).

## Verification

`tsc`, `next build`, the fake-content grep gate, Playwright screenshots (desktop + mobile,
light + dark) and interaction checks including: non-admin cannot see/open Admin, admin API
returns 401/403 without an admin token, `/api/image` rejects keys outside allowed folders.
