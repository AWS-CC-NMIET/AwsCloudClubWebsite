# 🚀 AWS Amplify Hosting — Deployment Guide
### AWS Cloud Club NMIET Website

> **Pre-requisite:** Your backend is already set up (Cognito, DynamoDB, S3, SES).  
> This guide covers pushing the code to GitHub and connecting it to AWS Amplify for hosting.

---

## Table of Contents

1. [Push Code to GitHub](#1-push-code-to-github)
2. [Create an Amplify App](#2-create-an-amplify-app)
3. [Configure Build Settings](#3-configure-build-settings)
4. [Add Environment Variables](#4-add-environment-variables)
5. [Deploy](#5-deploy)
6. [Update NEXT_PUBLIC_APP_URL](#6-update-next_public_app_url)
7. [Fix Cognito Callback URLs](#7-fix-cognito-callback-urls)
8. [Fix S3 CORS for Image Uploads](#8-fix-s3-cors-for-image-uploads)
9. [Set Up a Custom Domain (Optional)](#9-set-up-a-custom-domain-optional)
10. [Verify Everything Works](#10-verify-everything-works)
11. [Redeploy After Code Changes](#11-redeploy-after-code-changes)

---

## 1. Push Code to GitHub

If you haven't already pushed the repo to GitHub:

```bash
# Inside your project folder
git init                          # (skip if already a git repo)
git add .
git commit -m "feat: deploy AWS Cloud Club NMIET website"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/aws-cloud-club-nmiet.git
git branch -M main
git push -u origin main
```

> **Never commit `.env.local`** — it is already in `.gitignore`. All secrets go into Amplify's env vars (Step 4).

---

## 2. Create an Amplify App

1. Go to **AWS Console** → Search **AWS Amplify** → Click **AWS Amplify**
2. Click **"Create new app"**
3. Choose **"Host your web app"**
4. Select **GitHub** → Click **"Authenticate with GitHub"** → authorize AWS
5. Select your **repository** → select branch **`main`**
6. Click **Next**

---

## 3. Configure Build Settings

Amplify should auto-detect Next.js. Verify the build settings look like this (edit if needed):

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

Under **"App settings"**:
- **Framework:** Next.js - SSR
- **Build command:** `npm run build`
- **Start command:** `node_modules/.bin/next start` *(Amplify fills this automatically)*

Click **Next** — do **not** deploy yet, go to Step 4 first.

---

## 4. Add Environment Variables

On the **"Configure build settings"** page, scroll down to **"Environment variables"** and add **every** variable below.

> **Tip:** Click "Add environment variable" for each row. You can also do this later via  
> Amplify Console → Your App → **Environment variables** → **Manage variables**.

### Cognito (Auth)

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_COGNITO_REGION` | `ap-south-1` |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | Your User Pool ID (e.g. `ap-south-1_AbCdEfGhI`) |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | Your App Client ID |
| `COGNITO_CLIENT_SECRET` | Your App Client Secret *(server-side only)* |

### DynamoDB Table Names

| Variable | Value |
|---|---|
| `DYNAMODB_EVENTS_TABLE` | `acc-nmiet-events` |
| `DYNAMODB_TEAM_TABLE` | `acc-nmiet-team` |
| `DYNAMODB_PROJECTS_TABLE` | `acc-nmiet-projects` |
| `DYNAMODB_ACHIEVEMENTS_TABLE` | `acc-nmiet-achievements` |
| `DYNAMODB_RESOURCES_TABLE` | `acc-nmiet-resources` |
| `DYNAMODB_SOCIAL_TABLE` | `acc-nmiet-social-links` |
| `DYNAMODB_CONFIG_TABLE` | `acc-nmiet-site-config` |
| `DYNAMODB_CONTACTS_TABLE` | `acc-nmiet-contact-submissions` |
| `DYNAMODB_PROFILES_TABLE` | `acc-nmiet-user-profiles` |

### S3 + Media

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_S3_BUCKET` | `acc-nmiet-media` |
| `NEXT_PUBLIC_S3_REGION` | `ap-south-1` |
| `NEXT_PUBLIC_CLOUDFRONT_URL` | Your CloudFront URL (or S3 bucket URL if no CloudFront) |

### SES (Email)

| Variable | Value |
|---|---|
| `SES_REGION` | `ap-south-1` |
| `SES_FROM_EMAIL` | `awscloudclub.nmiet@gmail.com` |
| `SES_TO_EMAIL` | `awscloudclub.nmiet@gmail.com` |

### AWS Server Credentials

| Variable | Value |
|---|---|
| `APP_ACCESS_KEY_ID` | Your IAM access key |
| `APP_SECRET_ACCESS_KEY` | Your IAM secret key |
| `APP_REGION` | `ap-south-1` |

### App Config

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Leave blank for now — fill in after first deploy (Step 6) |
| `MEETUP_MEMBER_COUNT` | `299` |

---

## 5. Deploy

Click **"Save and deploy"**. Amplify will:

1. Clone your repo
2. Run `npm ci` then `npm run build`
3. Deploy the Next.js SSR app

The first build takes **3–6 minutes**. Watch the build logs live in the Amplify console.

**If the build fails** — check the build logs. Most common issues:

| Error | Fix |
|---|---|
| `Module not found` | Run `npm install` locally, commit `package-lock.json`, repush |
| `Environment variable not set` | Double-check Step 4 — add the missing variable |
| TypeScript errors | Already suppressed via `ignoreBuildErrors: true` in `next.config.mjs` |
| Out of memory | Add env var `NODE_OPTIONS=--max-old-space-size=4096` in Amplify |

---

## 6. Update NEXT_PUBLIC_APP_URL

After the first successful deploy, Amplify gives you a URL like:  
`https://main.d1234abcxyz.amplifyapp.com`

1. Go to Amplify Console → Your App → **Environment variables**
2. Edit `NEXT_PUBLIC_APP_URL` → set it to your Amplify URL
3. Click **Save** → Amplify will **automatically redeploy**

---

## 7. Fix Cognito Callback URLs

Your Cognito app client needs to allow the Amplify domain for OAuth redirects.

1. Go to **AWS Console** → **Cognito** → Your User Pool
2. Click **"App clients and analytics"** → click your app client
3. Under **"Hosted UI"** → click **"Edit"**
4. Add your Amplify URL to **"Allowed callback URLs"**:
   ```
   https://main.d1234abcxyz.amplifyapp.com
   https://main.d1234abcxyz.amplifyapp.com/api/auth/callback
   ```
5. Add to **"Allowed sign-out URLs"**:
   ```
   https://main.d1234abcxyz.amplifyapp.com
   ```
6. Click **Save changes**

> If you add a custom domain later, repeat this step with the custom domain too.

---

## 8. Fix S3 CORS for Image Uploads

When admins upload images from the live site, the browser needs to PUT to S3 from your Amplify domain.

1. Go to **AWS Console** → **S3** → `acc-nmiet-media` bucket
2. Click **Permissions** tab → scroll to **"Cross-origin resource sharing (CORS)"**
3. Click **Edit** and paste:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://main.d1234abcxyz.amplifyapp.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

> Replace `main.d1234abcxyz.amplifyapp.com` with your actual Amplify URL.  
> If you add a custom domain, add it to `AllowedOrigins` too.

4. Click **Save changes**

---

## 9. Set Up a Custom Domain (Optional)

If you want `awscloudclub-nmiet.com` instead of the Amplify URL:

1. Go to Amplify Console → Your App → **"Domain management"**
2. Click **"Add domain"**
3. Enter your domain → Amplify will show you DNS records to add
4. Go to your domain registrar (GoDaddy / Namecheap / Route 53) and add the CNAME/ALIAS records
5. SSL certificate is **provisioned automatically** (takes 10–30 min)
6. Once active, go back and update:
   - `NEXT_PUBLIC_APP_URL` → your custom domain
   - Cognito Callback URLs (Step 7) → add your custom domain
   - S3 CORS AllowedOrigins (Step 8) → add your custom domain

---

## 10. Verify Everything Works

After deploy, open your Amplify URL and check each of these:

| Feature | What to test |
|---|---|
| ✅ Boot screen | Loads and animates into Login |
| ✅ Login / Register | Create account, verify email, sign in |
| ✅ Desktop | Opens with Home app maximized, widgets visible |
| ✅ Events app | Shows live data from Meetup API |
| ✅ Home stats | Members count shows 299, Events 1+, Projects 3+ |
| ✅ Search (Start Menu) | Type an app name → suggestions appear |
| ✅ Shutdown button | Signs you out and returns to Login |
| ✅ Team app | Add a member via Admin, verify photo loads |
| ✅ Contact form | Submit form → email arrives at `awscloudclub.nmiet@gmail.com` |
| ✅ Admin panel | Only visible to users in the `admins` Cognito group |
| ✅ Image uploads | Upload a team photo in Admin → verify it appears |
| ✅ Weather widget | Shows live weather (may request location permission) |

---

## 11. Redeploy After Code Changes

Every push to the `main` branch **automatically triggers a new deploy** — no manual steps needed.

```bash
# Make your changes locally, then:
git add .
git commit -m "your change description"
git push origin main
# Amplify picks it up automatically ✅
```

To manually trigger a redeploy without code changes:
- Amplify Console → Your App → `main` branch → **"Redeploy this version"**

---

## Architecture Reference

```
User Browser
    │
    ▼
AWS Amplify (Next.js SSR Hosting)
    │
    ├── /api/auth      → AWS Cognito (User Pool + App Client)
    ├── /api/events    → DynamoDB (acc-nmiet-events)
    ├── /api/team      → DynamoDB (acc-nmiet-team)
    ├── /api/upload    → S3 (acc-nmiet-media) via presigned URL
    ├── /api/image     → S3 (acc-nmiet-media) via presigned GET URL
    ├── /api/contact   → DynamoDB + SES (email notification)
    ├── /api/meetup    → meetup.com GraphQL (live event data)
    └── /api/admin/*   → Cognito admin operations
```

---

> Questions? Email **awscloudclub.nmiet@gmail.com** or open an issue in your GitHub repo.
