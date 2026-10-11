# AWS Student Builder Group — NMIET

The website of the **AWS Student Builder Group at Nutan Maharashtra Institute of Engineering and Technology** (Talegaon Dabhade, Pune), built as a macOS-style desktop on laptops and an iOS-style home screen on phones.

**Live:** [awscloudclubsnmiet.org](https://www.awscloudclubsnmiet.org) · **Meetup:** [AWS SBG at NMIET](https://www.meetup.com/aws-sbg-at-nutan-maharashtra-inst-of-engineering-and-tech/) · **Instagram:** [@aws.sbg_nmiet](https://www.instagram.com/aws.sbg_nmiet/) · **LinkedIn:** [AWS Student Builder Group NMIET](https://www.linkedin.com/company/aws-student-builder-group-nmiet/) · **YouTube:** [@AWSStudentBuildersGroupNMIET](https://www.youtube.com/@AWSStudentBuildersGroupNMIET)

## What's inside

| App | What it shows |
| --- | --- |
| Welcome | Club intro, live member count, next event, highlights |
| About Us | Mission, vision, what we do, values |
| Team | The 2026 grid — F1-style driver cards per team, with profiles |
| Events | Live from Meetup: upcoming and past sessions with RSVPs |
| Projects · Resources · Gallery · Achievements | Club content, editable in Admin |
| Social · Contact Us | Our channels, and a contact form (Amazon SES) |
| Terminal · Study Guides · Music · Assistant | Extras and easter eggs |
| My Profile · Admin Panel | Member accounts; admin-only content management |

Both the desktop and the phone UI use the same apps. Everything renders from built-in content when the backend is unreachable, so the site never shows an empty page.

## Tech

- **Next.js 16** (App Router) · **React 19** · **TypeScript** · **Tailwind CSS 4** · **Framer Motion**
- **AWS:** Amplify Hosting (SSR, IAM compute role — no access keys), Cognito (sign-in; `admins` group), DynamoDB (content), S3 (uploads), SES (contact form)
- **Meetup GraphQL** for events and the member count

## Run it locally

Requires Node.js 20.9 or newer.

```bash
npm install
cp .env.local.example .env.local   # fill in the values (see docs/setup.md)
npm run dev                         # http://localhost:3000
```

The site runs without any AWS setup — content falls back to the built-in data and sign-in is unavailable.

| Command | |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |

## Project layout

```
app/
  page.tsx            Boot → login → desktop (≥ 768 px) or phone home screen
  layout.tsx          Metadata, SEO, PWA
  api/                Route handlers: content CRUD, auth, upload, contact, Meetup, health
components/
  os/                 Desktop shell: menu bar, dock, windows, widgets, Spotlight, login
  mobile/             Phone shell: lock screen, home screen, app sheets
  apps/               The apps (shared by both shells); admin/ = Admin Panel
lib/
  club-content.ts     Built-in content: club facts, team roster, resources, links
  club-data.ts        Data hooks: API data with built-in fallbacks and caching
  aws-apps.ts         App registry (names, icons, sizes, Spotlight keywords)
  auth.ts             Server-side token verification (admins = Cognito group)
public/team/          Team portraits (generated, see below)
scripts/              setup-aws.mjs (create tables), team-photo.mjs (portraits)
docs/                 AWS setup and deployment
```

## Updating content

- **Day to day:** sign in with an account in the Cognito `admins` group and use the **Admin Panel**: events, team, projects, resources, achievements, social links, messages, members and a health check.
- **Built-in content** (shown before anything is in the database, and as the offline fallback) lives in [`lib/club-content.ts`](lib/club-content.ts).
- **Team portraits:** cut the person out (a transparent PNG makes the best card), then
  ```bash
  node scripts/team-photo.mjs m-<member-id> photo.png [--focus x,y] [--enhance]
  ```
  This writes `public/team/<id>.webp` and updates `lib/team-photos.ts`. Run the script without arguments for help.

## Deploying

Pushing to `main` deploys through AWS Amplify. Setting up AWS from scratch (Cognito, DynamoDB, S3, SES, Amplify) is covered in [docs/setup.md](docs/setup.md); the keyless IAM role for the server is in [docs/aws/amplify-compute-role.md](docs/aws/amplify-compute-role.md).

## Security

- No AWS keys in the app: the server uses the Amplify compute role.
- Admin routes verify the Cognito access token's signature and the `admins` group on the server.
- Every API input is validated (zod); the contact form is rate-limited and has a honeypot.
- Strict security headers and a content security policy ([`next.config.mjs`](next.config.mjs)).
- Never commit `.env.local` or the members' form exports (both are gitignored).

---

Built by the AWS Student Builder Group NMIET tech team.
