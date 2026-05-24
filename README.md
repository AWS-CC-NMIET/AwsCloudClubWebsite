# AWS Student Builder Group — NMIET Chapter

> An OS-themed interactive website for the AWS Student Builder Group at Nutan Maharashtra Institute of Engineering and Technology (NMIET), Talegaon Dabhade, Pune.

---

## Overview

This is not your typical club website. It's a fully interactive operating system experience built on the web — complete with a **desktop OS** (for laptops and PCs) and a **mobile OS** (for phones and tablets), both powered by the same Next.js application.

Visitors boot into a startup screen, log in with their credentials, and are dropped into a windowed desktop environment (or a swipe-based mobile home screen) where they can explore everything the club has to offer — events, projects, team, resources, gallery, achievements, and more.

---

## About the Club

**AWS Student Builder Group — NMIET** is the AWS-affiliated student community at NMIET, Talegaon Dabhade, Pune, Maharashtra (410507). We are a group of students passionate about cloud computing, AWS services, and modern software development.

Our mission is to help students learn, build, and grow through hands-on workshops, hackathons, cloud certifications, and real-world projects — all under the AWS Student Programs umbrella.

- **Email:** aws.studentbuildersgroup.nmiet@gmail.com
- **Location:** NMIET Campus, Talegaon Dabhade, Pune, Maharashtra 410507
- **Meetup:** [AWS Cloud Club at NMIET](https://www.meetup.com/aws-cloud-club-at-nutan-maharashtra-inst-of-eng-tech/)

---

## Features

### Desktop Experience (≥ 768 px)
- Animated boot screen with the AWS Student Builder Group branding
- Cognito-authenticated login with sign-up, verification, and forgot-password flows
- Draggable, resizable, focusable windows — full window manager
- Taskbar with clock, open apps, and system tray
- Live weather widget (Open-Meteo API), calendar widget, and quote ticker
- Interactive particle canvas wallpaper

### Mobile Experience (< 768 px)
- Swipe-to-unlock lockscreen
- App grid with page swipe and dock bar
- Full-screen sliding app panels with native-feel spring animations
- iOS-inspired icon design with consistent gradient palette

### Apps (13 modules, shared across both UIs)
| App | Description |
|-----|-------------|
| **Home** | Club introduction, stats, highlights, and mission |
| **About Us** | File manager–style explorer for club information |
| **Team** | Member roster with AWS service avatars |
| **Events** | Live Meetup.com integration — upcoming and past events |
| **Projects** | Showcase of club projects with folder-style cards |
| **Resources** | Curated AWS learning resources and certification paths |
| **Social** | All social media and community links |
| **Contact** | Contact form backed by AWS SES |
| **Achievements** | Trophy cabinet of club milestones and awards |
| **Gallery** | Photo gallery with S3-backed admin upload |
| **Profile** | User profile management |
| **Terminal** | Interactive terminal Easter egg |
| **Admin** | Admin-only panel for managing site content |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2 (App Router) + React 19 |
| Language | TypeScript 5.7 (strict) |
| Styling | Tailwind CSS v4 + Shadcn/ui (new-york) + Radix UI |
| Animations | Framer Motion 12 |
| Auth | AWS Cognito (User Pools + secret-hash flow) |
| Database | AWS DynamoDB (via `@aws-sdk/lib-dynamodb`) |
| Storage | AWS S3 + CloudFront (media, presigned uploads) |
| Email | AWS SES (contact form submissions) |
| Hosting | AWS Amplify |
| External APIs | Meetup.com (events), Open-Meteo (weather) |
| State | React Context + localStorage (no Redux/Zustand) |
| Icons | Lucide React |
| Charts | Recharts |
| Forms | React Hook Form + Zod |

---

## Project Structure

```
├── app/
│   ├── page.tsx              # Entry — Boot → Login → Desktop / MobileOS
│   ├── layout.tsx            # Root layout (Amplify + Notifications providers)
│   └── api/                  # 20 REST API routes
│       ├── auth/             # Cognito sign-in/up/verify/forgot
│       ├── events/           # DynamoDB CRUD
│       ├── team/
│       ├── projects/
│       ├── resources/
│       ├── achievements/
│       ├── social-links/
│       ├── contact/          # SES email dispatch
│       ├── profile/
│       ├── gallery/
│       ├── admin/
│       ├── meetup/           # Meetup.com proxy
│       ├── upload/           # S3 presigned URL generator
│       └── config/           # Site config
│
├── components/
│   ├── os/                   # Desktop OS chrome
│   │   ├── desktop.tsx       # Window manager + wallpaper
│   │   ├── window.tsx        # Draggable/resizable window
│   │   ├── taskbar.tsx       # Bottom bar + system tray
│   │   ├── boot-screen.tsx
│   │   ├── login-screen.tsx
│   │   ├── weather-widget.tsx
│   │   ├── calendar-widget.tsx
│   │   └── interactive-canvas.tsx
│   ├── mobile/               # Mobile OS chrome
│   │   ├── mobile-os.tsx     # Stage manager
│   │   ├── mobile-lockscreen.tsx
│   │   └── mobile-home.tsx   # App grid + dock
│   └── apps/                 # 13 lazy-loaded app modules
│       ├── home-app.tsx
│       ├── about-app.tsx
│       ├── team-app.tsx
│       ├── events-app.tsx
│       ├── projects-app.tsx
│       ├── resources-app.tsx
│       ├── social-app.tsx
│       ├── contact-app.tsx
│       ├── achievements-app.tsx
│       ├── gallery-app.tsx
│       ├── profile-app.tsx
│       ├── admin-app.tsx
│       └── terminal-app.tsx
│
├── hooks/
│   ├── use-window-manager.ts # Desktop window state (open/close/minimize/focus)
│   └── use-mobile.ts         # Viewport detection (< 768px = mobile)
│
├── lib/
│   ├── auth-client.ts        # Client-side Cognito helpers + token storage
│   ├── api-client.ts         # Typed fetch wrapper with auto-auth headers
│   ├── dynamodb.ts           # DynamoDB DocumentClient
│   ├── s3.ts                 # S3 client
│   ├── ses.ts                # SES client
│   ├── meetup-context.tsx    # Stale-while-revalidate Meetup data
│   ├── notifications-context.tsx
│   └── types.ts              # AppId, WindowState, and shared types
│
└── public/
    ├── logo-full.png
    ├── logo-icon.png
    ├── manifest.json         # PWA manifest
    └── sw.js                 # Service worker
```

---

## Getting Started

### Prerequisites

- **Node.js** 20 or later
- **npm** (or pnpm / yarn)
- An **AWS account** with the following services configured:
  - Cognito User Pool (with app client + secret)
  - DynamoDB tables (see table names in `.env.local.example`)
  - S3 bucket + CloudFront distribution
  - SES with a verified sender email

### 1. Clone the repository

```bash
git clone https://github.com/your-org/aws-student-builder-group-nmiet.git
cd aws-student-builder-group-nmiet
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in your AWS values (see the [Environment Variables](#environment-variables) section below).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You will see the boot screen.

---

## Environment Variables

All variables live in `.env.local` (never commit this file).

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_COGNITO_REGION` | AWS region (e.g. `ap-south-1`) |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | Cognito User Pool ID |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | Cognito App Client ID |
| `COGNITO_CLIENT_SECRET` | App Client secret (server-side only) |
| `DYNAMODB_EVENTS_TABLE` | DynamoDB events table name |
| `DYNAMODB_TEAM_TABLE` | DynamoDB team table name |
| `DYNAMODB_PROJECTS_TABLE` | DynamoDB projects table name |
| `DYNAMODB_ACHIEVEMENTS_TABLE` | DynamoDB achievements table name |
| `DYNAMODB_RESOURCES_TABLE` | DynamoDB resources table name |
| `DYNAMODB_SOCIAL_TABLE` | DynamoDB social links table name |
| `DYNAMODB_CONFIG_TABLE` | DynamoDB site config table name |
| `DYNAMODB_CONTACTS_TABLE` | DynamoDB contact submissions table name |
| `DYNAMODB_PROFILES_TABLE` | DynamoDB user profiles table name |
| `NEXT_PUBLIC_S3_BUCKET` | S3 bucket name for media |
| `NEXT_PUBLIC_S3_REGION` | S3 bucket region |
| `NEXT_PUBLIC_CLOUDFRONT_URL` | CloudFront distribution URL |
| `SES_REGION` | SES region |
| `SES_FROM_EMAIL` | Verified SES sender address |
| `SES_TO_EMAIL` | Contact form recipient address |
| `APP_ACCESS_KEY_ID` | IAM access key (server-side API routes only) |
| `APP_SECRET_ACCESS_KEY` | IAM secret key (server-side API routes only) |
| `APP_REGION` | AWS region for server-side SDK calls |
| `NEXT_PUBLIC_APP_URL` | Public URL of the deployed app |
| `MEETUP_MEMBER_COUNT` | Manual override for Meetup member count |

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create an optimized production build |
| `npm run start` | Serve the production build locally |
| `npm run lint` | Run ESLint across the codebase |

---

## Deployment

This project is configured for **AWS Amplify** hosting. See [AMPLIFY_DEPLOY.md](AMPLIFY_DEPLOY.md) for the full step-by-step guide covering:

1. Pushing code to GitHub
2. Creating an Amplify app and connecting the repo
3. Configuring build settings
4. Adding environment variables in the Amplify console
5. Setting up a custom domain
6. Fixing Cognito callback URLs and S3 CORS after first deploy

---

## Design System

The UI uses a custom **neumorphic + frosted glass** design language:

- **Desktop background:** Lavender `#D4CEFF`
- **Mobile background:** Deep space `#050310`
- **Primary accent:** Purple `#6B4FE8`
- **AWS orange:** `#FF9900`
- **Frosted glass panels:** `bg-white/35 backdrop-blur-sm border border-white/40`
- **Neumorphic classes:** `neu-raised`, `neu-raised-sm`, `neu-inset`, `neu-btn` (defined in `globals.css`)
- **Animations:** Spring physics via Framer Motion throughout

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request against `main`

Please follow the existing code style — no new comments unless the *why* is non-obvious, no feature flags, no unused exports.

---

## License

This project is private and maintained by the AWS Student Builder Group — NMIET Chapter. Unauthorized redistribution is not permitted.

---

## Contact

**AWS Student Builder Group — NMIET**  
NMIET Campus, Talegaon Dabhade, Pune, Maharashtra 410507  
aws.studentbuildersgroup.nmiet@gmail.com  
[Meetup Community](https://www.meetup.com/aws-cloud-club-at-nutan-maharashtra-inst-of-eng-tech/)
