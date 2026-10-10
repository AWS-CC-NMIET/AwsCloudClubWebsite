# macOS UI + Real Content Migration — Design

Date: 2026-10-10 · Branch: `feat/macos-content-migration`

## Goal

Keep the macOS desktop / iOS mobile shell introduced by PR #3, but replace its fabricated
content with the club's real content from commit `4c899fc`, fix the shell's bugs and
performance problems, and make the site deployable and resilient.

**Success criteria**

1. Every app shows only real AWS Student Builder Group NMIET content (from `4c899fc` or live
   APIs). No fabricated people, stats, URLs, specs, testimonials or events remain.
2. All original content is reachable: Home, About, Team, Events, Projects, Resources,
   Achievements, Gallery, Social, Contact, Terminal, Profile, Admin.
3. The site renders useful content even when the AWS backend is unavailable.
4. Desktop (≥768px) and mobile (<768px) both work in light and dark mode.
5. `tsc --noEmit` and `next build` pass.

**Non-goals**

- Backend/API changes. `app/api/*`, `lib/dynamodb.ts`, `lib/s3.ts`, `lib/ses.ts`, `lib/auth.ts`
  and `components/apps/admin-app.tsx` are unchanged since `4c899fc` and stay as they are
  (admin gets only a container-level dark-mode readability check).
- Recovering the AWS account (owner is handling it; account closed when the Free plan ended
  on 2026-10-07, recoverable by upgrading within 90 days).

## Decisions (agreed)

- **App mapping:** Mac metaphors with real data (table below). App Store and Messages are deleted.
- **Auth:** public showcase. Only My Profile and Admin require sign-in.
- **Naming:** "AWS Student Builder Group · NMIET" everywhere. "aws-cloud-club" survives only in
  the Meetup URL slug, which cannot change.

## Architecture

### `lib/club-content.ts` — static real content (single source of truth)

Exports, all copied verbatim from `4c899fc`:

- `CLUB` — name, short name (`AWS SBG NMIET`), chapter, college (Nutan Maharashtra Institute of
  Engineering and Technology), location (Talegaon Dabhade, Pune, Maharashtra 410507), founded
  (Feb 16, 2026), email (`aws.studentbuildersgroup.nmiet@gmail.com`), tagline, `meetupUrl`,
  `youtubeUrl` (`@AWSStudentBuildersGroupNMIET`), `discordUrl` (`discord.gg/BydTcjm8g`),
  SBG Leader (Neha Sharma).
- `WHAT_WE_DO` (Learn / Build / Connect), `HIGHLIGHTS` (4 items), `ABOUT` (intro paragraphs,
  mission, vision, what-we-do cards, core values), `OFFICE_HOURS`.
- `TEAM_MEMBERS` — the 27-member roster with a derived `group`:
  Leadership (SBG Leader + team leads/head), Tech, Design, Social Media, Events, Onsite.
- `FALLBACK_RESOURCES` — the 17 links in 5 categories.
- `FALLBACK_SOCIAL_LINKS` — Meetup, YouTube, Discord only (no invented URLs).
- `AWS_FACTS` — terminal fun facts.

### `lib/club-data.ts` — shared, cached data hooks

One module-level cache per resource (stale-while-revalidate, also persisted to localStorage
with a TTL, same idea as the old `meetup-context`). Every hook returns:

```ts
type Resource<T> = { data: T; status: "loading" | "ready" | "error"; fromFallback: boolean }
```

| Hook | Source | Fallback when API fails / empty |
|---|---|---|
| `useMeetup()` | `/api/meetup` → `memberCount`, events | `memberCount: null` (UI shows "299+") |
| `useEvents()` | Meetup + `/api/events` merged, de-duplicated by title, upcoming first (old logic) | `[]` + empty state linking to Meetup |
| `useTeam()` | `TEAM_MEMBERS` merged with `/api/team` by email (old logic) | `TEAM_MEMBERS` |
| `useProjects()` | `/api/projects` | `[]` + "coming back soon" state |
| `useResources()` | `/api/resources` sorted by `order` | `FALLBACK_RESOURCES` |
| `useAchievements()` | `/api/achievements` sorted by `order` | `[]` + "coming back soon" state |
| `useGallery()` | albums derived from `useEvents()` items with `imageUrls` | `[]` + empty state |
| `useSocialLinks()` | `/api/social-links` with YouTube/Discord URL overrides (old logic) | `FALLBACK_SOCIAL_LINKS` |

A request is made at most once per page load per resource, shared by apps and widgets.

### `components/apps/shared/mac-ui.tsx` — shared macOS building blocks

`Sidebar`, `SidebarSection`, `SidebarItem`, `Toolbar`, `ListRow`, `LoadingState`,
`EmptyState`, `ErrorState`, `useNarrow()` (container-width check). All use the existing CSS
tokens (`--os-text`, `--win-bg`, `--win-divider`, `--accent`) so light/dark both work. On
narrow containers (iOS sheet) sidebar layouts collapse to list → detail with a back button.

### App registry (`lib/aws-apps.ts`)

| AppId | Name | Content |
|---|---|---|
| `aws` | AWS SBG | Home: hero, live stats, Learn/Build/Connect, highlights, logo confetti easter egg |
| `about` | About Us | Finder + Quick Look: Introduction.rtf, Our_Mission.png, Our_Vision.mp4, What_We_Do.pdf, Core_Values.txt |
| `team` | Team | Contacts.app: groups → list → card (AWS-service avatar, role, skills, GitHub/LinkedIn/email) |
| `calendar` | Calendar | Events: mini month grid with dots, All/Upcoming/Past agenda, detail with RSVP / View on Meetup |
| `finder` | Finder | Projects: All/Production/Beta/Development folders, icon/list view, project report Quick Look |
| `safari` | Safari | Resources as a Favorites start page by category, search; links open in a new tab |
| `photos` | Photos | Gallery: Library + Albums (one per event), lightbox with keyboard nav |
| `achievements` | Achievements | Trophy cabinet + detail pane |
| `social` | Social | Meetup card (live member count) + link cards |
| `mail` | Mail | Contact form → `/api/contact`; sidebar with email, address, office hours |
| `terminal` | Terminal | Original `4c899fc` command set + `open <app>` and `theme` |
| `notes` | Notes | AWS certification study guides only (club-claims note removed) |
| `music` | Music | One real track |
| `settings` | System Settings | Appearance, Wallpaper, About this site (real stack); fake SLA/specs/IP-policy panes removed |
| `trash` | Trash | Cloud anti-patterns, reworded as advice |
| `assistant` | Assistant | Keyword router to real apps, answers use live data |
| `about-system` | About This Mac dialog | NMIET, founded, SBG Leader Neha Sharma, region ap-south-1 |
| `profile` / `admin` | My Profile / Admin | Unchanged features behind sign-in |

Desktop dock: aws, about, team, calendar, finder, safari, photos, achievements, social, mail,
terminal, notes, music, settings │ trash.
Mobile dock: aws, calendar, team, mail. Springboard grid: the rest (except trash, about-system).
Desktop right-edge icons: About Us, Team, Events, Projects.

### Widgets

Remove: AWS Infrastructure (fake telemetry), Portfolio ("18 stacks"), Certifications (fake counts).
Add: **Next Event** (from `useEvents()`), **Club at a glance** (members, team, projects, events).
Keep: Builder Clocks (Pune & Seattle), Calendar, Now Playing.

## Sign-in flow

- Desktop: opening `profile` or `admin` without a valid session calls `onRequireSignIn(appId)`
  → `LoginScreen` in `signin` phase → on success, back to the desktop with that app opened.
  A "Back" path returns to the desktop as a guest.
- Mobile: same `LoginScreen` (signin phase) rendered as an overlay above the Springboard.

## Bugs & performance fixes

1. Window drag/resize updates the DOM directly and commits bounds on pointer-up (no React
   re-render of app content per pointer move). Add right, bottom and corner resize handles.
2. Call `windowActions.reflow()` (debounced) on browser resize; make it immutable.
3. Remove `backdrop-blur-3xl` from opaque window bodies.
4. Lazy-load every app except `aws` in `app-dispatcher`.
5. Spotlight: Escape closes, ↑/↓ + Enter open, query resets on open, results include team
   members, events and projects.
6. Mobile sheet drag-to-dismiss only from handle/header (`useDragControls`), not from content.
7. Respect iOS safe-area insets in Springboard and sheets.
8. Boot animation plays once per browser session (`sessionStorage`).
9. Delete dead code: `appstore-app.tsx`, `messages-app.tsx`, `notification-center.tsx`,
   `styles/globals.css`, unused icons (`appstore.png`), duplicate fake `TRACKS` entries.
10. Remove fake Wi-Fi/telemetry claims that present as real club facts (decorative OS chrome
    like the Wi-Fi menu may stay, but must not claim real infrastructure stats).

## Resilience without AWS

- Every content app falls back to `lib/club-content.ts` data or a clean empty state; no app
  throws when an API returns 5xx.
- Contact form: if `/api/contact` fails, show a "Send via email instead" button that opens a
  pre-filled `mailto:` to the club email.
- Meetup data (`/api/meetup`) does not depend on AWS, so events and member count keep working.

## Deploy & cache

- `public/sw.js`: versioned cache names (bumped per release), delete all non-current caches on
  activate, stale-while-revalidate for un-hashed images, keep cache-first only for hashed
  `/_next/static/*`. HTML stays network-first.
- Register with `{ updateViaCache: "none" }`.
- Add `amplify.yml` (Node 20, `npm ci`, `npm run build`, `.next` artifacts, cache
  `node_modules` + `.next/cache`). Env vars keep flowing through `next.config.mjs` `env`,
  exactly as in `4c899fc`.

## Verification

After each migrated app and at the end:

- `npx tsc --noEmit` and `npx next build` pass.
- Headless-browser screenshots (Playwright, scratchpad install): desktop 1440×900 and mobile
  390×844, light and dark, for each app; checked for real content, layout breaks and contrast.
- Simulated AWS outage (API routes returning 500) still shows fallback content.
- Grep gate: no matches for `Omkar`, `awsclub.edu`, `aws-cloud-club/`, `sbg.edu`, `500+`,
  `Graviton`, `Aarav`, `Sunita` in `components/` and `lib/`.
