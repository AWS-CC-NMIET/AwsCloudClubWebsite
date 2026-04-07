# AWS Cloud Club NMIET — Full Backend Integration Plan

## Goal

Transform the current all-mock OS-themed website into a fully functional, production-ready application with real authentication, database-driven content, file storage, a complete admin panel, and secure API layer — all hosted on AWS.

---

## User Review Required

> [!IMPORTANT]
> This plan covers the **entire backend architecture**. Please review all sections carefully before approving execution, since some choices (like Cognito user pool region, DynamoDB table names, S3 bucket naming) will be permanent infrastructure decisions.

> [!WARNING]
> **Amplify vs. manual AWS setup**: I recommend using **AWS Amplify Gen 2** as the orchestrator because it integrates directly with Next.js, generates TypeScript types from your schema, and handles Cognito + DynamoDB + S3 + AppSync automatically. The alternative (manual setup via AWS Console) takes much longer and is more error-prone. Please confirm this approach.

> [!CAUTION]
> The current login screen (`login-screen.tsx`) has **no real auth** — any password works. After this integration, only real Cognito accounts will be able to log in. The sign-in/register flows will become real. Confirm that this is intended.

---

## Feature → Backend Mapping

Here's every feature in the current UI that needs a real backend:

| Feature | Currently | Needs |
|---|---|---|
| Login/Register | Fake, any password works | **Cognito** user pool + JWT sessions |
| Admin-only access | None | **Cognito group** `admins` + protected routes |
| Home stats (members, events, etc.) | Hardcoded numbers | DynamoDB aggregated query |
| About text | Hardcoded strings | DynamoDB `SiteConfig` table |
| Team members | Fake names (Alex Chen etc.) | DynamoDB `TeamMembers` table |
| Events | 4 fake past events | DynamoDB `Events` table + S3 images |
| Event images | Placeholder icons | S3 bucket + CloudFront URL |
| Projects | 6 fake projects | DynamoDB `Projects` table |
| Resources | Hardcoded links | DynamoDB `Resources` table |
| Social links | All `href="#"` | DynamoDB `SocialLinks` table |
| Achievements | Hardcoded data | DynamoDB `Achievements` table |
| Contact form | Shows success instantly, no email | Lambda → **Amazon SES** |
| Profile | Fake "Cloud User" | Cognito user attributes + DynamoDB `UserProfiles` |
| Admin panel | Does not exist | New admin app window + API routes |
| File uploads | None | S3 presigned URLs via Lambda |
| Sessions | None | Cognito JWT + Next.js middleware |

---

## Proposed AWS Architecture

```
Browser (Next.js on Vercel/Amplify Hosting)
  │
  ├── Cognito User Pool ──────── Auth (Sign In / Register / Sessions)
  │     ├── Group: admins
  │     └── Group: members
  │
  ├── AWS AppSync (GraphQL API) ─ All CRUD for content
  │     ├── DynamoDB resolvers
  │     └── Lambda resolvers (for complex ops)
  │
  ├── DynamoDB Tables
  │     ├── Events
  │     ├── TeamMembers
  │     ├── Projects
  │     ├── Resources
  │     ├── Achievements
  │     ├── SocialLinks
  │     ├── SiteConfig
  │     ├── ContactSubmissions
  │     └── UserProfiles
  │
  ├── S3 Bucket ─────────────── Event photos, team photos, project screenshots
  │     └── CloudFront CDN
  │
  └── Lambda Functions
        ├── sendContactEmail  (→ SES)
        └── getPresignedUploadUrl
```

---

## Proposed Changes

### Component 1 — AWS Amplify Setup & Backend Schema

#### [NEW] `amplify/` directory (Amplify Gen 2 backend)
- `amplify/auth/resource.ts` — Cognito user pool config with `admins` & `members` groups
- `amplify/data/resource.ts` — AppSync GraphQL schema defining all DynamoDB models
- `amplify/storage/resource.ts` — S3 bucket for media uploads
- `amplify/functions/sendContactEmail/` — Lambda + SES email handler
- `amplify/functions/getPresignedUrl/` — Lambda for S3 presigned upload URLs
- `amplify/backend.ts` — Root backend definition

#### Data Models (AppSync Schema)
```graphql
type Event @model @auth(rules: [{allow: public, operations: [read]}, {allow: groups, groups: ["admins"]}]) {
  id: ID!
  title: String!
  date: String!
  location: String!
  description: String
  attendees: Int
  imageUrls: [String]
  isPast: Boolean!
  tags: [String]
}

type TeamMember @model @auth(rules: [{allow: public, operations: [read]}, {allow: groups, groups: ["admins"]}]) {
  id: ID!
  name: String!
  role: String!
  skills: [String]!
  bio: String
  email: String
  linkedin: String
  github: String
  photoUrl: String
  status: String!
  order: Int!
}

type Project @model @auth(rules: [{allow: public, operations: [read]}, {allow: groups, groups: ["admins"]}]) {
  id: ID!
  title: String!
  description: String!
  stack: [String]!
  author: String!
  status: String!
  githubUrl: String
  liveUrl: String
  imageUrl: String
}

type Achievement @model @auth(rules: [{allow: public, operations: [read]}, {allow: groups, groups: ["admins"]}]) {
  id: ID!
  title: String!
  date: String!
  description: String!
  type: String!
  iconName: String!
  color: String!
  order: Int!
}

type Resource @model @auth(rules: [{allow: public, operations: [read]}, {allow: groups, groups: ["admins"]}]) {
  id: ID!
  name: String!
  category: String!
  type: String!
  url: String!
  featured: Boolean!
  order: Int!
}

type SocialLink @model @auth(rules: [{allow: public, operations: [read]}, {allow: groups, groups: ["admins"]}]) {
  id: ID!
  name: String!
  url: String!
  followers: String
  platform: String!
}

type SiteConfig @model @auth(rules: [{allow: public, operations: [read]}, {allow: groups, groups: ["admins"]}]) {
  id: ID!
  key: String!
  value: String!
  type: String!
}

type ContactSubmission @model @auth(rules: [{allow: public, operations: [create]}, {allow: groups, groups: ["admins"]}]) {
  id: ID!
  name: String!
  email: String!
  subject: String!
  message: String!
  submittedAt: AWSDateTime!
  isRead: Boolean!
}

type UserProfile @model @auth(rules: [{allow: owner}, {allow: groups, groups: ["admins"]}]) {
  id: ID!
  owner: String!
  displayName: String!
  bio: String
  avatarUrl: String
  linkedinUrl: String
  githubUrl: String
  skills: [String]
  joinedAt: AWSDateTime!
}
```

---

### Component 2 — Authentication (Login Screen Overhaul)

#### [MODIFY] `components/os/login-screen.tsx`
- Wire Sign In form to `signIn()` from `aws-amplify/auth`
- Wire Register form to `signUp()` + `confirmSignUp()` (add OTP verification step)
- Add forgot password flow using `resetPassword()` + `confirmResetPassword()`
- Display real Cognito error messages (wrong password, user not found, etc.)
- JWT tokens stored in `localStorage` via Amplify's built-in session management
- Redirect to desktop only on successful auth

#### [NEW] `middleware.ts` (Next.js middleware)
- Protect `/admin/*` routes — redirect to login if no valid Cognito session
- Check user group (`admins`) for admin access

#### [NEW] `lib/auth.ts`
- Helper functions: `getCurrentUser()`, `isAdmin()`, `signOutUser()`
- Server-side session validation for API routes

---

### Component 3 — API Layer (Next.js Route Handlers)

#### [NEW] `app/api/` directory

| Route | Method | Auth | Action |
|---|---|---|---|
| `/api/events` | GET | Public | List all events from DynamoDB |
| `/api/events` | POST | Admin | Create event |
| `/api/events/[id]` | PUT | Admin | Update event |
| `/api/events/[id]` | DELETE | Admin | Delete event |
| `/api/team` | GET | Public | List team members |
| `/api/team` | POST | Admin | Add team member |
| `/api/team/[id]` | PUT/DELETE | Admin | Update/delete member |
| `/api/projects` | GET | Public | List projects |
| `/api/projects` | POST/PUT/DELETE | Admin | CRUD |
| `/api/achievements` | GET | Public | List achievements |
| `/api/achievements` | POST/PUT/DELETE | Admin | CRUD |
| `/api/resources` | GET | Public | List resources |
| `/api/resources` | POST/PUT/DELETE | Admin | CRUD |
| `/api/social-links` | GET | Public | List social links |
| `/api/social-links` | POST/PUT/DELETE | Admin | CRUD |
| `/api/contact` | POST | Public | Save submission + send SES email |
| `/api/upload` | POST | Admin | Get S3 presigned upload URL |
| `/api/profile` | GET/PUT | Authenticated | Get/update profile |
| `/api/admin/stats` | GET | Admin | Dashboard statistics |

All routes will use the AppSync client **or** DynamoDB SDK directly via server-side Lambda/API routes with IAM authorization.

---

### Component 4 — Client Data Layer

#### [NEW] `lib/api.ts`
- Typed fetch wrappers for all API routes
- React Query / SWR hooks for data fetching with caching
- Auto-attach Cognito Auth header to every request

#### [NEW] `lib/amplify-config.ts`
- Client-side Amplify configuration (pulled from env vars)

---

### Component 5 — Updated App Windows (Live Data)

#### [MODIFY] `components/apps/events-app.tsx`
- Fetch events from `/api/events` (replace hardcoded array)
- Real event images from S3/CloudFront URLs
- Remove fake "Admin" panel from inside — move to dedicated Admin window

#### [MODIFY] `components/apps/team-app.tsx`
- Fetch team members from `/api/team`
- Real photos from S3 (avatar images), real LinkedIn/GitHub links

#### [MODIFY] `components/apps/projects-app.tsx`
- Fetch projects from `/api/projects`
- Real GitHub and Live Demo URLs

#### [MODIFY] `components/apps/home-app.tsx`
- Fetch stats from `/api/admin/stats` (real counts)
- Highlights from `SiteConfig` table

#### [MODIFY] `components/apps/about-app.tsx`
- Mission/Vision text from `SiteConfig` DynamoDB
- Editable by admin

#### [MODIFY] `components/apps/achievements-app.tsx`
- Fetch achievements from `/api/achievements`

#### [MODIFY] `components/apps/resources-app.tsx`
- Fetch resources from `/api/resources`
- Real URLs to AWS docs, courses, etc.

#### [MODIFY] `components/apps/social-app.tsx`
- Fetch social links from `/api/social-links`
- Real follower counts (or manual entry via admin)

#### [MODIFY] `components/apps/contact-app.tsx`
- POST to `/api/contact` → saves to DynamoDB `ContactSubmissions` + sends SES email
- Real NMIET address, email, phone

#### [MODIFY] `components/apps/profile-app.tsx`
- Show real Cognito user info + DynamoDB `UserProfile`
- Save profile changes → PUT `/api/profile`
- Real photo upload → presigned S3 URL

---

### Component 6 — Admin Panel (New App Window)

#### [NEW] `components/apps/admin-app.tsx`
A fully featured admin dashboard accessible only to Cognito `admins` group users.

**Admin Panel Sections:**
1. **Dashboard** — Live stats: total members, events, projects, contact submissions (read/unread)
2. **Events Manager** — Full CRUD: add/edit/delete events, upload multiple photos to S3, set past/upcoming status
3. **Team Manager** — Add/edit/delete team members, upload profile photos, set order/status
4. **Projects Manager** — Add/edit/delete projects, set status badges, links
5. **Achievements Manager** — Add/edit/delete achievements with icon picker
6. **Resources Manager** — Manage learning resources by category
7. **Social Links Manager** — Update all social URLs + follower counts
8. **Site Config Editor** — Edit About page text, home page highlights, stats
9. **Contact Inbox** — View all contact form submissions, mark as read
10. **User Management** — View registered users (Cognito list), promote/demote to admin group

#### [MODIFY] `components/os/desktop.tsx`
- Add `"admin"` to `AppId` type
- Admin icon visible only to users in `admins` Cognito group
- Import `AdminApp`

#### [MODIFY] `components/os/start-menu.tsx`
- Show Admin app only for `admins` group users

---

### Component 7 — Security & Sessions

#### [NEW] `middleware.ts`
```typescript
// Protects /admin routes server-side
// Validates Cognito JWT on every request to protected routes
// Redirects unauthenticated users to login
```

#### [NEW] `.env.local` (template — values from AWS Console)
```env
NEXT_PUBLIC_AWS_REGION=ap-south-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-south-1_XXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_APPSYNC_ENDPOINT=https://XXXXX.appsync-api.ap-south-1.amazonaws.com/graphql
NEXT_PUBLIC_S3_BUCKET=aws-cloud-club-nmiet-media
NEXT_PUBLIC_CLOUDFRONT_URL=https://XXXXX.cloudfront.net
AWS_ACCESS_KEY_ID=XXXXXXXXXX        # Server-side only (API routes)
AWS_SECRET_ACCESS_KEY=XXXXXXXXXX    # Server-side only
SES_FROM_EMAIL=noreply@awscloudclubNMIET.in
CONTACT_EMAIL=club@nmiet.edu.in
```

---

### Component 8 — Data Seeding

#### [NEW] `scripts/seed-db.ts`
- Seeds DynamoDB with real initial data:
  - Actual team member names, roles, photos
  - Real past events with real photos
  - Actual social media URLs
  - Real contact information
  - Actual achievements

---

## AWS Services Summary

| Service | Purpose | Tier / Cost |
|---|---|---|
| **Amplify Gen 2** | Backend orchestration, hosting | Free tier generous |
| **Amazon Cognito** | Authentication, user pools, groups | 50,000 MAU free |
| **AWS AppSync** | GraphQL API layer | 250K queries/month free |
| **Amazon DynamoDB** | NoSQL database for all content | 25GB free forever |
| **Amazon S3** | Media storage (photos, images) | 5GB free first year |
| **Amazon CloudFront** | CDN for S3 images | 1TB transfer free |
| **AWS Lambda** | Contact email + presigned URLs | 1M requests/month free |
| **Amazon SES** | Contact form emails | 62K emails/month free |

> [!NOTE]
> **Region choice**: `ap-south-1` (Mumbai) is recommended for lowest latency for NMIET (Navi Mumbai). Please confirm.

---

## Implementation Phases

### Phase 1 — AWS Setup & Auth (Days 1-2)
1. Install Amplify CLI + Gen 2 dependencies
2. `amplify init` and configure auth (Cognito user pool)
3. Create `admins` group in Cognito
4. Wire login/register/logout to real Cognito
5. Add Next.js middleware for session protection
6. Test login, registration, password reset flows

### Phase 2 — Database & API (Days 3-5)
1. Define full AppSync GraphQL schema
2. Create all DynamoDB tables via Amplify data
3. Build all Next.js API route handlers (`/api/*`)
4. Set up S3 bucket + CloudFront
5. Build presigned URL Lambda for uploads
6. Build contact email Lambda (SES)

### Phase 3 — Connect UI Windows to Live Data (Days 6-8)
1. Update all 10 app windows to fetch from API
2. Add loading states + skeleton UI
3. Handle errors and empty states gracefully
4. Seed real data into DynamoDB

### Phase 4 — Admin Panel (Days 9-12)
1. Build Admin dashboard window
2. Events CRUD with S3 photo upload
3. Team CRUD with avatar upload
4. Projects, Achievements, Resources, Social links CRUD
5. Contact inbox viewer
6. Site config editor
7. User management panel

### Phase 5 — Polish & Deploy (Days 13-14)
1. Final security audit
2. Add rate limiting to contact form
3. Enable Amplify hosting (or keep Vercel and add env vars)
4. Configure custom domain
5. Set up DynamoDB backups
6. Test all flows end-to-end

---

## Open Questions

> [!IMPORTANT]
> **Q1: Hosting** — Are you deploying on **AWS Amplify Hosting** or keeping **Vercel**? Amplify Hosting integrates more natively with Cognito SSR, but Vercel is simpler. The Vercel Analytics package is already installed.

> [!IMPORTANT]
> **Q2: AWS Account** — Do you already have an AWS account set up? Do you have the AWS CLI configured locally? This is required before we can run `amplify init`.

> [!IMPORTANT]
> **Q3: Real Club Data** — To seed the database with real data, I'll need:
> - Actual team member names, roles, LinkedIn/GitHub URLs, photos
> - Real social media URLs (Instagram, LinkedIn, GitHub, Discord, etc.)
> - Real NMIET contact email and phone
> - Any actual past events with photos
> 
> Should I keep placeholder data for now and let the admin panel handle seeding?

> [!IMPORTANT]
> **Q4: Email Domain** — For SES to send contact form emails, you need a verified domain or email address. Do you have a club email like `awscloudclub@nmiet.edu.in` or a custom domain?

> [!NOTE]
> **Q5: Registration flow** — Should registration be:
> - **Open** (anyone with any email can register)?
> - **Restricted** (only `@nmiet.edu.in` email domains allowed)?
> - **Invite-only** (admin manually adds members in Cognito)?

---

## Verification Plan

### Automated Tests
- `npm run build` — Ensure no TypeScript errors before deploy
- API route unit tests with Jest
- Cognito auth flow test: login → session → API call → logout

### Manual Verification
- Sign up with real email → receive Cognito verification code → confirm account
- Sign in → reach desktop → open apps showing real data
- Admin user: sees Admin window, can create event, upload photo
- Non-admin user: no Admin window visible, cannot hit admin API routes
- Contact form: submit → email arrives in club inbox
- Profile update: changes persist on refresh
- Session: close browser tab → reopen → still logged in (Cognito persistent auth)
- Session expiry: after token expiry → redirected to login screen
