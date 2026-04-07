# 🚀 AWS Cloud Club NMIET — Complete Setup Guide

> **Follow this guide from top to bottom.** Every step is required before the website works in production.  
> Estimated time: **45–60 minutes** (mostly waiting for AWS resources to provision)

---

## 📋 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Create an IAM User](#2-create-an-iam-user-programmatic-access)
3. [Create Cognito User Pool](#3-create-cognito-user-pool-authentication)
4. [Create S3 Bucket for Media](#4-create-s3-bucket-for-media-storage)
5. [Verify Email in SES](#5-verify-email-in-ses-contact-form)
6. [Set Up Environment Variables](#6-set-up-environment-variables)
7. [Create DynamoDB Tables (Auto Script)](#7-create-dynamodb-tables--seed-data)
8. [Run the Website Locally](#8-run-the-website-locally)
9. [First Login & Make Yourself Admin](#9-first-login--make-yourself-admin)
10. [Seed Real Data via Admin Panel](#10-seed-real-data-via-admin-panel)
11. [Deploy to AWS Amplify](#11-deploy-to-aws-amplify-hosting)
12. [Post-Deployment Checklist](#12-post-deployment-checklist)
13. [Architecture Overview](#13-architecture-overview)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Prerequisites

Before starting, make sure you have:

| Requirement | Check |
|---|---|
| Node.js v18+ installed | `node --version` |
| npm installed | `npm --version` |
| AWS Account (Free Tier is fine) | [aws.amazon.com](https://aws.amazon.com) |
| Git installed | `git --version` |
| A GitHub account | For Amplify hosting |

> **AWS Free Tier covers everything we use** — Cognito (50,000 MAU free), DynamoDB (25 GB free), S3 (5 GB free), SES (62,000 emails/month free from EC2, limited from local).

---

## 2. Create an IAM User (Programmatic Access)

This gives the website server-side access to AWS services (DynamoDB, S3, SES, Cognito).

### Step-by-step:

1. Go to **AWS Console** → Search **IAM** → Open **IAM**
2. Click **Users** in the left sidebar → Click **Create user**
3. **Username:** `acc-nmiet-app-user` → Click **Next**
4. Select **"Attach policies directly"**
5. Search and attach these **4 policies**:
   - ✅ `AmazonDynamoDBFullAccess`
   - ✅ `AmazonS3FullAccess`
   - ✅ `AmazonSESFullAccess`
   - ✅ `AmazonCognitoPowerUser`
6. Click **Next** → Click **Create user**
7. Click the user you just created → Go to **Security credentials** tab
8. Click **Create access key** → Choose **"Application running outside AWS"** → Next
9. **COPY BOTH VALUES** — you'll need them in Step 6:
   - `Access key ID` → this is `AWS_ACCESS_KEY_ID`
   - `Secret access key` → this is `AWS_SECRET_ACCESS_KEY`

> ⚠️ **WARNING:** You can only see the Secret Access Key once! Copy it now.

---

## 3. Create Cognito User Pool (Authentication)

This handles all user sign-up, sign-in, email verification, and password resets.

### Step-by-step:

1. Go to **AWS Console** → Search **Cognito** → Open **Amazon Cognito**
2. Click **"Create user pool"**
3. **Step 1 — Configure sign-in experience:**
   - Cognito user pool sign-in options: ✅ **Email**
   - Click **Next**
4. **Step 2 — Configure security requirements:**
   - Password policy: Keep **Cognito defaults** (8+ chars, uppercase, lowercase, number)
   - MFA: Select **"No MFA"** (for simplicity)
   - Click **Next**
5. **Step 3 — Configure sign-up experience:**
   - Self-service sign-up: ✅ **Enable self-registration**
   - Required attributes: ✅ **email**, ✅ **name**
   - Click **Next**
6. **Step 4 — Configure message delivery:**
   - Select **"Send email with Cognito"** (free, up to 50 emails/day)
   - Click **Next**
7. **Step 5 — Integrate your app:**
   - User pool name: `acc-nmiet-user-pool`
   - Initial app client:
     - App type: **Public client**
     - App client name: `acc-nmiet-web-client`
     - Client secret: **Don't generate** (leave unchecked)
   - Click **Next**
8. **Step 6 — Review and create** → Click **Create user pool**

### After creation — copy these values:

- Go to your new user pool → **User pool overview**
- Copy **User pool ID** → looks like `ap-south-1_AbCdEfGhI`
- Click **App clients** tab → Copy **Client ID** → long alphanumeric string

### Create the "admins" group:

1. Inside your User Pool → Click **Groups** tab
2. Click **Create group**
3. Group name: `admins` → Click **Create group**

---

## 4. Create S3 Bucket (for Media Storage)

Used for team photos, event images, project screenshots.

### Step-by-step:

1. Go to **AWS Console** → Search **S3** → Open **S3**
2. Click **Create bucket**
3. **Bucket name:** `acc-nmiet-media` *(must be globally unique — add your initials if taken)*
4. **Region:** `ap-south-1` (Asia Pacific - Mumbai)
5. **Block Public Access:** Uncheck **"Block all public access"** → Confirm the warning ✅
6. Leave everything else default → Click **Create bucket**

### Configure CORS (so the website can upload directly):

1. Click on your new bucket → Go to **Permissions** tab
2. Scroll to **Cross-origin resource sharing (CORS)** → Click **Edit**
3. Paste this:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://*.amplifyapp.com",
      "https://yourdomain.com"
    ],
    "ExposeHeaders": ["ETag"]
  }
]
```

4. Click **Save changes**

### Get the bucket URL:

The URL format is: `https://acc-nmiet-media.s3.ap-south-1.amazonaws.com`

> **Optional but recommended:** Set up a CloudFront distribution in front of S3 for faster image loading. If skipping CloudFront for now, set `NEXT_PUBLIC_CLOUDFRONT_URL` to the S3 bucket URL above.

---

## 5. Verify Email in SES (Contact Form)

Amazon SES sends emails when someone submits the contact form.

### Step-by-step:

1. Go to **AWS Console** → Search **SES** → Open **Amazon Simple Email Service**
2. In the left panel, click **Verified identities**
3. Click **Create identity**
4. Identity type: **Email address**
5. Email: `awscloudclub.nmiet@gmail.com`
6. Click **Create identity**
7. **Check your Gmail inbox** for a verification email from AWS
8. Click the verification link in that email
9. Status should change to ✅ **Verified**

> **Note:** By default, SES is in **Sandbox mode** — you can only send to verified email addresses. For production, request to move out of sandbox:  
> SES Console → **Account dashboard** → **Request production access** → Fill the form.

---

## 6. Set Up Environment Variables

Now you have all the values needed. Let's create your `.env.local` file.

### Step-by-step:

1. In your project folder (`e:\AwsCloudClubWebsite`), find the file `.env.local.example`
2. **Copy it and rename the copy to `.env.local`**

```bash
# In PowerShell:
Copy-Item .env.local.example .env.local
```

3. Open `.env.local` and fill in every value:

```env
# ── Cognito (from Step 3) ─────────────────────────────────────
NEXT_PUBLIC_COGNITO_REGION=ap-south-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-south-1_YOUR_POOL_ID_HERE
NEXT_PUBLIC_COGNITO_CLIENT_ID=YOUR_APP_CLIENT_ID_HERE

# ── DynamoDB (table names — don't change these) ───────────────
DYNAMODB_EVENTS_TABLE=acc-nmiet-events
DYNAMODB_TEAM_TABLE=acc-nmiet-team
DYNAMODB_PROJECTS_TABLE=acc-nmiet-projects
DYNAMODB_ACHIEVEMENTS_TABLE=acc-nmiet-achievements
DYNAMODB_RESOURCES_TABLE=acc-nmiet-resources
DYNAMODB_SOCIAL_TABLE=acc-nmiet-social-links
DYNAMODB_CONFIG_TABLE=acc-nmiet-site-config
DYNAMODB_CONTACTS_TABLE=acc-nmiet-contact-submissions
DYNAMODB_PROFILES_TABLE=acc-nmiet-user-profiles

# ── S3 (from Step 4) ──────────────────────────────────────────
NEXT_PUBLIC_S3_BUCKET=acc-nmiet-media
NEXT_PUBLIC_S3_REGION=ap-south-1
NEXT_PUBLIC_CLOUDFRONT_URL=https://acc-nmiet-media.s3.ap-south-1.amazonaws.com

# ── SES (Contact Form Emails) ─────────────────────────────────
SES_REGION=ap-south-1
SES_FROM_EMAIL=awscloudclub.nmiet@gmail.com
SES_TO_EMAIL=awscloudclub.nmiet@gmail.com

# ── AWS Credentials (from Step 2) ────────────────────────────
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID_HERE
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY_HERE
AWS_REGION=ap-south-1

# ── App URL ───────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ **IMPORTANT:** `.env.local` is listed in `.gitignore`. **Never commit it to GitHub.**

---

## 7. Create DynamoDB Tables & Seed Data

We have a script that automatically creates all 9 DynamoDB tables and seeds initial data (social links, site config, AWS resources).

### Run the setup script:

```bash
# In your project folder:
node scripts/setup-aws.mjs
```

You should see output like:

```
🚀 AWS Cloud Club NMIET — DynamoDB Setup Script
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Region: ap-south-1

📋 Creating DynamoDB tables...
  ⟳ Creating table "acc-nmiet-events"...
  ✓ Table "acc-nmiet-events" created.
  ⟳ Creating table "acc-nmiet-team"...
  ✓ Table "acc-nmiet-team" created.
  ... (9 tables total)

🌱 Seeding initial data...
  Social links...
  Site config...
  Resources...

✅ Setup complete!
```

> If any table already exists, it prints `✓ Table already exists, skipping.` — that's fine.

### What tables are created:

| Table Name | Purpose |
|---|---|
| `acc-nmiet-events` | Events (past + upcoming) |
| `acc-nmiet-team` | Team member profiles |
| `acc-nmiet-projects` | Club projects showcase |
| `acc-nmiet-achievements` | Awards and milestones |
| `acc-nmiet-resources` | Learning materials |
| `acc-nmiet-social-links` | Social media links |
| `acc-nmiet-site-config` | Editable site content (mission, stats, etc.) |
| `acc-nmiet-contact-submissions` | Contact form submissions |
| `acc-nmiet-user-profiles` | Extended user profile data |

---

## 8. Run the Website Locally

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see:
- ✅ The OS-themed desktop with lock screen
- ✅ A clock showing current time
- ✅ "Click anywhere to sign in" prompt

---

## 9. First Login & Make Yourself Admin

### Sign up for your account:

1. Click the lock screen to open the login panel
2. Click **"New here? Create an account →"**
3. Enter your name, email, and a password (8+ chars, uppercase, lowercase, number)
4. Click **Create Account**
5. Check your email for a 6-digit verification code
6. Enter the code → You'll be automatically signed in

### Promote yourself to admin:

Go to **AWS Console** → **Cognito** → Your User Pool → **Users**

1. Find your username (it'll be your email)
2. Click on it → Scroll to **Group memberships**
3. Click **Add user to group** → Select `admins` → Click **Add**

Now refresh the website — you'll see the **Admin Panel** icon in the Start Menu (bottom-left logo).

---

## 10. Seed Real Data via Admin Panel

Open the **Admin Panel** (🛡️ icon in Start Menu) and fill in your real data:

### Priority order:

#### 1. Site Config (first!)
- Go to **Site Config** tab
- Update: Mission, Vision, Member Count, Event Count, Project Count
- Update: Location address, phone number

#### 2. Team Members
- Go to **Team** tab → Click **Add New**
- Add each team member with: Name, Role, Bio, Skills, Photo, LinkedIn, GitHub

#### 3. Events
- Go to **Events** tab → Click **Add New**
- Add past events first (toggle "Is Past Event" on)
- Then add upcoming events
- Upload event photos

#### 4. Projects
- Go to **Projects** tab → Click **Add New**
- Add club projects with: Title, Description, Tech Stack, GitHub URL, Screenshot

#### 5. Achievements
- Go to **Achievements** tab → Click **Add New**
- Add competition wins, hackathon results, recognition, milestones

#### 6. Social Links
- Go to **Social** tab → Edit each link
- Update follower counts
- Make sure all URLs are correct

---

## 11. Deploy to AWS Amplify Hosting

### Step 1 — Push code to GitHub

```bash
# In your project folder:
git add .
git commit -m "feat: complete AWS backend integration"
git push origin main
```

> Make sure `.env.local` is in `.gitignore` (it already is) — never push secrets!

### Step 2 — Connect to AWS Amplify

1. Go to **AWS Console** → Search **AWS Amplify** → Open it
2. Click **"Create new app"**
3. Select **GitHub** → Authorize AWS Amplify to access your GitHub
4. Select your repository: `AWS-CC-NMIET/AwsCloudClubWebsite`
5. Select branch: `main`
6. Click **Next**

### Step 3 — Configure build settings

Amplify should auto-detect Next.js. Verify the build spec:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
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

### Step 4 — Add environment variables in Amplify Console

This is critical — Amplify needs the same variables as your `.env.local`.

1. In Amplify Console → Click **Hosting** → **Environment variables**
2. Add **every variable** from your `.env.local`:

| Variable | Where to get the value |
|---|---|
| `NEXT_PUBLIC_COGNITO_REGION` | `ap-south-1` |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | Cognito Console → User Pool ID |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | Cognito Console → App clients |
| `AWS_ACCESS_KEY_ID` | From Step 2 (IAM) |
| `AWS_SECRET_ACCESS_KEY` | From Step 2 (IAM) |
| `AWS_REGION` | `ap-south-1` |
| `SES_FROM_EMAIL` | `awscloudclub.nmiet@gmail.com` |
| `SES_TO_EMAIL` | `awscloudclub.nmiet@gmail.com` |
| `SES_REGION` | `ap-south-1` |
| `NEXT_PUBLIC_S3_BUCKET` | `acc-nmiet-media` |
| `NEXT_PUBLIC_S3_REGION` | `ap-south-1` |
| `NEXT_PUBLIC_CLOUDFRONT_URL` | Your S3/CloudFront URL |
| `NEXT_PUBLIC_APP_URL` | Your Amplify domain (after first deploy) |
| All `DYNAMODB_*_TABLE` vars | Copy from `.env.local.example` |

3. Click **Save**

### Step 5 — Deploy

1. Click **Save and deploy**
2. Wait for the build to complete (~5–8 minutes)
3. Your site will be live at: `https://main.XXXXXXXX.amplifyapp.com`

### Step 6 — Update NEXT_PUBLIC_APP_URL

After your first deploy:
1. Copy your Amplify domain URL
2. Go back to **Environment variables** → Update `NEXT_PUBLIC_APP_URL` to your Amplify URL
3. Also update the CORS `AllowedOrigins` in your S3 bucket (Step 4) to include your Amplify URL
4. Trigger a redeploy

---

## 12. Post-Deployment Checklist

Run through this checklist after deploying:

- [ ] Website loads at Amplify URL
- [ ] Lock screen shows correct time
- [ ] Can register a new account (email verification works)
- [ ] Can sign in and sign out
- [ ] Home page shows stats
- [ ] Events page loads (add some via Admin Panel first)
- [ ] Team page loads real team members
- [ ] Contact form submits → you receive email at `awscloudclub.nmiet@gmail.com`
- [ ] Admin Panel works (stats, CRUD for all sections)
- [ ] Photo uploads work (S3)
- [ ] No console errors in DevTools

---

## 13. Architecture Overview

```
Browser (Next.js)
    │
    ├─── AWS Amplify Hosting (CDN + SSR)
    │        │
    │        ├─── Next.js App Router
    │        │       ├─── / (OS Desktop UI)
    │        │       └─── /api/* (Route Handlers)
    │        │
    │        ├─── Amazon Cognito (Auth)
    │        │       ├─── User Pool (sign-up/sign-in)
    │        │       ├─── JWT tokens (session)
    │        │       └─── Groups (admins / members)
    │        │
    │        ├─── Amazon DynamoDB (Database)
    │        │       └─── 9 tables (PAY_PER_REQUEST billing)
    │        │
    │        ├─── Amazon S3 (Media Storage)
    │        │       └─── Images (team, events, projects)
    │        │
    │        ├─── Amazon SES (Email)
    │        │       └─── Contact form notifications
    │        │
    │        └─── IAM (Security)
    │                └─── Least-privilege access keys
    │
    └─── GitHub (Source Control + CI/CD trigger)
```

---

## 14. Troubleshooting

### ❌ "InvalidClientTokenId" or "UnrecognizedClientException"
- **Cause:** Wrong AWS credentials
- **Fix:** Double-check `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in `.env.local`

### ❌ "ResourceNotFoundException" (DynamoDB)
- **Cause:** Tables don't exist yet
- **Fix:** Run `node scripts/setup-aws.mjs` — make sure `.env.local` is filled first

### ❌ "NotAuthorizedException" on login
- **Cause:** Wrong password, or Cognito User Pool ID is incorrect
- **Fix:** Verify `NEXT_PUBLIC_COGNITO_USER_POOL_ID` and `NEXT_PUBLIC_COGNITO_CLIENT_ID`

### ❌ "MessageRejected" (SES email not sending)
- **Cause:** Email not verified in SES, or SES is in sandbox mode
- **Fix:** Verify `awscloudclub.nmiet@gmail.com` in SES Console. Both sender AND recipient must be verified in sandbox mode.

### ❌ S3 upload fails (403 Forbidden)
- **Cause:** Bucket CORS not configured or IAM user lacks S3 permissions
- **Fix:** Re-check CORS config in Step 4 and confirm `AmazonS3FullAccess` is attached to IAM user

### ❌ Admin Panel not visible after login
- **Cause:** Your Cognito account is not in the "admins" group
- **Fix:** AWS Console → Cognito → Your User Pool → Users → your user → Add to `admins` group

### ❌ Build fails on Amplify (`ENOENT` or module not found)
- **Cause:** Environment variables missing in Amplify Console
- **Fix:** Go to Amplify Console → Environment variables → verify all variables are set

### ❌ "User pool client does not exist"
- **Cause:** Wrong `NEXT_PUBLIC_COGNITO_CLIENT_ID`
- **Fix:** Go to Cognito → User Pool → **App clients** tab → copy the correct Client ID

---

## 📞 Support

- **Club Email:** awscloudclub.nmiet@gmail.com
- **GitHub Repo:** AWS-CC-NMIET/AwsCloudClubWebsite
- **AWS Documentation:** [docs.aws.amazon.com](https://docs.aws.amazon.com)

---

*This guide was last updated: April 2026*  
*Built with ❤️ for AWS Cloud Club NMIET*
