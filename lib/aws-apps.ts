// lib/aws-apps.ts
// App registry and metadata for the AWS Student Builder Group NMIET Cloud OS

export type AppId =
  | "aws"
  | "about"
  | "team"
  | "calendar"
  | "finder"
  | "safari"
  | "photos"
  | "achievements"
  | "social"
  | "mail"
  | "terminal"
  | "notes"
  | "music"
  | "settings"
  | "trash"
  | "assistant"
  | "about-system"
  | "profile"
  | "admin"

export interface AppMenuItem {
  label: string
  shortcut?: string
  command?: string
  disabled?: boolean
  separatorAfter?: boolean
}

export interface AppMenu {
  title: string
  items: AppMenuItem[]
}

export interface AppMeta {
  id: AppId
  /** App name — shown in the menu bar and dock tooltip. */
  name: string
  /** Window title when it differs from the app name (e.g. Finder → "Projects"). */
  windowTitle?: string
  subtitle?: string
  defaultSize: { w: number; h: number }
  minSize: { w: number; h: number }
  springboardLabel?: string
  /** Opening this app requires a signed-in session. */
  requiresAuth?: boolean
  /** Opening this app requires the Cognito "admins" group (also hidden from everyone else). */
  requiresAdmin?: boolean
  spotlight: {
    keywords: string[]
    description: string
  }
  menus: AppMenu[]
}

const standardMenus = (appName: string, extra: AppMenu[] = []): AppMenu[] => [
  {
    title: "File",
    items: [
      { label: "New Window", shortcut: "⌘N", disabled: true },
      { label: "Close Window", shortcut: "⌘W", command: "close" },
    ],
  },
  {
    title: "Edit",
    items: [
      { label: "Undo", shortcut: "⌘Z", disabled: true },
      { label: "Redo", shortcut: "⇧⌘Z", disabled: true, separatorAfter: true },
      { label: "Cut", shortcut: "⌘X", disabled: true },
      { label: "Copy", shortcut: "⌘C", disabled: true },
      { label: "Paste", shortcut: "⌘V", disabled: true },
    ],
  },
  ...extra,
  {
    title: "Window",
    items: [
      { label: "Minimize", shortcut: "⌘M", command: "minimize" },
      { label: "Zoom", command: "zoom" },
    ],
  },
  {
    title: "Help",
    items: [
      { label: `${appName} Help`, command: "open:assistant" },
      { label: "Contact the Club", command: "open:mail" },
    ],
  },
]

const goMenu: AppMenu = {
  title: "Go",
  items: [
    { label: "Home", command: "open:aws" },
    { label: "About Us", command: "open:about" },
    { label: "Team", command: "open:team" },
    { label: "Events", command: "open:calendar" },
    { label: "Projects", command: "open:finder" },
    { label: "Resources", command: "open:safari" },
    { label: "Gallery", command: "open:photos" },
    { label: "Achievements", command: "open:achievements" },
    { label: "Social", command: "open:social" },
    { label: "Contact", command: "open:mail" },
  ],
}

export const APPS_META: Record<AppId, AppMeta> = {
  aws: {
    id: "aws",
    name: "AWS SBG NMIET",
    windowTitle: "Welcome",
    subtitle: "AWS Student Builder Group · NMIET Chapter",
    defaultSize: { w: 940, h: 600 },
    minSize: { w: 520, h: 400 },
    springboardLabel: "Home",
    spotlight: {
      keywords: ["home", "aws", "sbg", "nmiet", "student builder group", "overview", "join"],
      description: "Start here — who we are, what we do and how to join",
    },
    menus: standardMenus("AWS SBG NMIET", [goMenu]),
  },
  about: {
    id: "about",
    name: "Finder",
    windowTitle: "About Us",
    subtitle: "Introduction, mission, vision & values",
    defaultSize: { w: 900, h: 580 },
    minSize: { w: 480, h: 380 },
    springboardLabel: "About Us",
    spotlight: {
      keywords: ["about", "mission", "vision", "values", "introduction", "who we are", "founded"],
      description: "Our introduction, mission, vision, what we do and core values",
    },
    menus: standardMenus("Finder", [goMenu]),
  },
  team: {
    id: "team",
    name: "Contacts",
    windowTitle: "Team",
    subtitle: "The people behind AWS SBG NMIET",
    defaultSize: { w: 940, h: 620 },
    minSize: { w: 480, h: 400 },
    springboardLabel: "Team",
    spotlight: {
      keywords: ["team", "members", "leaders", "core team", "people", "contacts", "neha"],
      description: "Meet the core team — leads, tech, design, social, events and onsite",
    },
    menus: standardMenus("Contacts", [goMenu]),
  },
  calendar: {
    id: "calendar",
    name: "Calendar",
    windowTitle: "Events",
    subtitle: "Workshops, sessions & meetups",
    defaultSize: { w: 980, h: 630 },
    minSize: { w: 480, h: 420 },
    springboardLabel: "Events",
    spotlight: {
      keywords: ["events", "calendar", "workshops", "meetup", "rsvp", "sessions", "upcoming"],
      description: "Upcoming and past events — RSVP on Meetup",
    },
    menus: standardMenus("Calendar", [goMenu]),
  },
  finder: {
    id: "finder",
    name: "Finder",
    windowTitle: "Projects",
    subtitle: "Cloud projects built by members",
    defaultSize: { w: 960, h: 620 },
    minSize: { w: 480, h: 400 },
    springboardLabel: "Projects",
    spotlight: {
      keywords: ["projects", "finder", "builds", "github", "showcase", "portfolio"],
      description: "Browse cloud projects built by club members",
    },
    menus: standardMenus("Finder", [goMenu]),
  },
  safari: {
    id: "safari",
    name: "Safari",
    windowTitle: "Resources",
    subtitle: "Curated AWS learning resources",
    defaultSize: { w: 1000, h: 640 },
    minSize: { w: 480, h: 400 },
    springboardLabel: "Resources",
    spotlight: {
      keywords: ["resources", "learn", "courses", "docs", "certification", "skill builder", "videos", "safari"],
      description: "Courses, docs, labs and videos to learn AWS",
    },
    menus: standardMenus("Safari", [goMenu]),
  },
  photos: {
    id: "photos",
    name: "Photos",
    windowTitle: "Gallery",
    subtitle: "Moments from our events",
    defaultSize: { w: 980, h: 640 },
    minSize: { w: 480, h: 400 },
    springboardLabel: "Gallery",
    spotlight: {
      keywords: ["gallery", "photos", "pictures", "albums", "memories"],
      description: "Photos from club events",
    },
    menus: standardMenus("Photos", [goMenu]),
  },
  achievements: {
    id: "achievements",
    name: "Achievements",
    subtitle: "Milestones & wins",
    defaultSize: { w: 900, h: 600 },
    minSize: { w: 480, h: 400 },
    springboardLabel: "Achievements",
    spotlight: {
      keywords: ["achievements", "trophies", "awards", "wins", "milestones"],
      description: "The group's milestones and wins",
    },
    menus: standardMenus("Achievements", [goMenu]),
  },
  social: {
    id: "social",
    name: "Social",
    subtitle: "Follow & connect with us",
    defaultSize: { w: 820, h: 600 },
    minSize: { w: 420, h: 400 },
    springboardLabel: "Social",
    spotlight: {
      keywords: ["social", "meetup", "youtube", "discord", "instagram", "linkedin", "follow", "connect"],
      description: "Meetup, Instagram, LinkedIn and YouTube",
    },
    menus: standardMenus("Social", [goMenu]),
  },
  mail: {
    id: "mail",
    name: "Mail",
    windowTitle: "Contact Us",
    subtitle: "Send the club a message",
    defaultSize: { w: 900, h: 600 },
    minSize: { w: 460, h: 420 },
    springboardLabel: "Contact",
    spotlight: {
      keywords: ["contact", "mail", "email", "message", "reach", "office hours", "location"],
      description: "Send us a message — we'll get back to you soon",
    },
    menus: standardMenus("Mail", [goMenu]),
  },
  terminal: {
    id: "terminal",
    name: "Terminal",
    windowTitle: "aws-sbg-nmiet — bash",
    subtitle: "Type help to get started",
    defaultSize: { w: 740, h: 480 },
    minSize: { w: 420, h: 300 },
    springboardLabel: "Terminal",
    spotlight: {
      keywords: ["terminal", "shell", "bash", "cli", "commands", "easter eggs"],
      description: "Command line — type help to get started",
    },
    menus: standardMenus("Terminal"),
  },
  notes: {
    id: "notes",
    name: "Notes",
    windowTitle: "Study Guides",
    subtitle: "AWS certification study guides",
    defaultSize: { w: 880, h: 600 },
    minSize: { w: 460, h: 380 },
    springboardLabel: "Notes",
    spotlight: {
      keywords: ["notes", "study", "guides", "certification", "cloud practitioner", "solutions architect", "bedrock"],
      description: "Study guides for AWS certifications",
    },
    menus: standardMenus("Notes"),
  },
  music: {
    id: "music",
    name: "Music",
    subtitle: "Lo-fi while you build",
    defaultSize: { w: 820, h: 520 },
    minSize: { w: 420, h: 360 },
    springboardLabel: "Music",
    spotlight: {
      keywords: ["music", "radio", "lofi", "audio", "play"],
      description: "Background music while you explore",
    },
    menus: standardMenus("Music", [
      {
        title: "Controls",
        items: [{ label: "Play / Pause", shortcut: "Space", command: "music:toggle" }],
      },
    ]),
  },
  settings: {
    id: "settings",
    name: "System Settings",
    subtitle: "Appearance, wallpaper & about this site",
    defaultSize: { w: 860, h: 580 },
    minSize: { w: 460, h: 400 },
    springboardLabel: "Settings",
    spotlight: {
      keywords: ["settings", "appearance", "dark mode", "light mode", "wallpaper", "preferences"],
      description: "Dark mode, wallpapers and site information",
    },
    menus: standardMenus("System Settings"),
  },
  trash: {
    id: "trash",
    name: "Trash",
    subtitle: "Cloud anti-patterns to avoid",
    defaultSize: { w: 760, h: 500 },
    minSize: { w: 420, h: 340 },
    spotlight: {
      keywords: ["trash", "bin", "anti-patterns", "mistakes", "best practices"],
      description: "Common cloud mistakes and what to do instead",
    },
    menus: standardMenus("Trash"),
  },
  assistant: {
    id: "assistant",
    name: "Assistant",
    subtitle: "Ask about the club",
    defaultSize: { w: 460, h: 620 },
    minSize: { w: 360, h: 440 },
    springboardLabel: "Assistant",
    spotlight: {
      keywords: ["assistant", "help", "ask", "guide", "chat"],
      description: "Ask where to find events, the team, projects and more",
    },
    menus: standardMenus("Assistant"),
  },
  "about-system": {
    id: "about-system",
    name: "About AWS SBG NMIET",
    subtitle: "Chapter info",
    defaultSize: { w: 420, h: 470 },
    minSize: { w: 380, h: 420 },
    spotlight: {
      keywords: ["about this mac", "system", "version", "chapter"],
      description: "Chapter information",
    },
    menus: standardMenus("About"),
  },
  profile: {
    id: "profile",
    name: "My Profile",
    subtitle: "Your member profile",
    defaultSize: { w: 780, h: 580 },
    minSize: { w: 420, h: 400 },
    springboardLabel: "Profile",
    requiresAuth: true,
    spotlight: {
      keywords: ["profile", "account", "my profile", "sign in", "login"],
      description: "Your member profile (sign-in required)",
    },
    menus: standardMenus("My Profile"),
  },
  admin: {
    id: "admin",
    name: "Admin Panel",
    subtitle: "Manage club content",
    defaultSize: { w: 1040, h: 680 },
    minSize: { w: 560, h: 440 },
    springboardLabel: "Admin",
    requiresAuth: true,
    requiresAdmin: true,
    spotlight: {
      keywords: ["admin", "manage", "dashboard", "panel"],
      description: "Manage events, team, projects and more (admins only)",
    },
    menus: standardMenus("Admin Panel"),
  },
}

/** Window title helper: "Projects" for Finder, otherwise the app name. */
export function windowTitleOf(id: AppId) {
  const meta = APPS_META[id]
  return meta?.windowTitle ?? meta?.name ?? id
}

/** Dock tooltip: content name first, e.g. "Projects — Finder". */
export function dockLabelOf(id: AppId) {
  const meta = APPS_META[id]
  if (!meta) return id
  if (id === "aws") return meta.name
  return meta.windowTitle && meta.windowTitle !== meta.name && !meta.windowTitle.includes("bash")
    ? `${meta.windowTitle} — ${meta.name}`
    : meta.name
}

export const DOCK_APPS: AppId[] = [
  "aws",
  "about",
  "team",
  "calendar",
  "finder",
  "safari",
  "photos",
  "achievements",
  "social",
  "mail",
  "terminal",
  "notes",
  "music",
  "settings",
  "trash",
]

export const SPRINGBOARD_DOCK: AppId[] = ["aws", "calendar", "team", "mail"]

export const SPRINGBOARD_GRID: AppId[] = [
  "about",
  "finder",
  "safari",
  "photos",
  "achievements",
  "social",
  "terminal",
  "notes",
  "music",
  "settings",
  "assistant",
  "profile",
  "admin",
]
