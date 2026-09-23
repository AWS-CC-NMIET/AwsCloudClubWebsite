// lib/aws-apps.ts
// App registry and metadata following AWS Cloud Club OS architecture

export type AppId =
  | "aws"
  | "finder"
  | "safari"
  | "appstore"
  | "notes"
  | "calendar"
  | "mail"
  | "music"
  | "photos"
  | "messages"
  | "terminal"
  | "settings"
  | "about"
  | "trash"
  | "assistant"
  | "admin"
  | "profile"

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
  name: string
  subtitle?: string
  defaultSize: { w: number; h: number }
  minSize: { w: number; h: number }
  inDock: boolean
  inSpringboard: boolean
  springboardLabel?: string
  icon?: string
  spotlight: {
    keywords: string[]
    description: string
  }
  seo: {
    title: string
    description: string
  }
  menus: AppMenu[]
}

const standardMenus = (appName: string, extra: AppMenu[] = []): AppMenu[] => [
  {
    title: "File",
    items: [
      { label: "New Window", shortcut: "⌘N", disabled: true },
      { label: "Close Window", shortcut: "⌘W", command: "close", separatorAfter: true },
      { label: "Print…", shortcut: "⌘P", disabled: true },
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
      { label: "Zoom", command: "zoom", separatorAfter: true },
      { label: `Bring ${appName} to Front`, disabled: true },
    ],
  },
  {
    title: "Help",
    items: [
      { label: `${appName} Guide`, command: "open:notes" },
      { label: "Contact Leads", command: "open:mail" },
    ],
  },
]

export const APPS_META: Record<AppId, AppMeta> = {
  aws: {
    id: "aws",
    name: "AWS SBG NMIET",
    subtitle: "Student Builder Group · NMIET Official Chapter",
    defaultSize: { w: 920, h: 570 },
    minSize: { w: 600, h: 400 },
    inDock: true,
    inSpringboard: true,
    springboardLabel: "AWS SBG",
    spotlight: {
      keywords: ["aws", "sbg", "nmiet", "cloud", "builders", "community", "overview"],
      description: "Start here: mission, cloud stack, verified results and club tracks",
    },
    seo: {
      title: "AWS SBG NMIET · Student Builder Group",
      description: "Empowering university students to build, architect and certify on Amazon Web Services.",
    },
    menus: standardMenus("AWS SBG NMIET", [
      {
        title: "Explore",
        items: [
          { label: "Open Projects (Finder)", command: "open:finder" },
          { label: "Upcoming Meetups", command: "open:calendar" },
          { label: "Cert Roadmaps (Notes)", command: "open:notes" },
          { label: "Join the Club (Mail)", command: "open:mail" },
        ],
      },
    ]),
  },

  finder: {
    id: "finder",
    name: "Finder",
    subtitle: "Projects, Architectures & Repos",
    defaultSize: { w: 980, h: 630 },
    minSize: { w: 560, h: 400 },
    inDock: true,
    inSpringboard: true,
    springboardLabel: "Finder",
    spotlight: {
      keywords: ["finder", "projects", "work", "portfolio", "cloud architectures", "github", "repos"],
      description: "Browse student projects, cloud blueprints and open source code",
    },
    seo: {
      title: "Projects & Architecture Library · Finder",
      description: "Explore cloud architectures, serverless backends, and AI models built by AWS Cloud Club members.",
    },
    menus: standardMenus("Finder", [
      {
        title: "Go",
        items: [
          { label: "All Projects", command: "open:finder" },
          { label: "Photo Gallery", command: "open:photos" },
          { label: "Trash Bin", command: "open:trash" },
        ],
      },
    ]),
  },

  safari: {
    id: "safari",
    name: "Safari",
    subtitle: "Live Project Deployments",
    defaultSize: { w: 1040, h: 670 },
    minSize: { w: 560, h: 420 },
    inDock: true,
    inSpringboard: true,
    springboardLabel: "Safari",
    spotlight: {
      keywords: ["safari", "browser", "live preview", "deployments", "cloud resume", "web apps"],
      description: "Interactive preview of live websites and cloud applications",
    },
    seo: {
      title: "Live Deployments · Safari",
      description: "Live student deployments and AWS reference architectures.",
    },
    menus: standardMenus("Safari", [
      {
        title: "Bookmarks",
        items: [
          { label: "AWS Cloud Club", command: "link:https://aws.amazon.com" },
          { label: "AWS Educate", command: "link:https://aws.amazon.com/education/awseducate/" },
          { label: "AWS Skill Builder", command: "link:https://explore.skillbuilder.aws" },
        ],
      },
    ]),
  },

  appstore: {
    id: "appstore",
    name: "App Store",
    subtitle: "AWS Developer Kits & Starter Packs",
    defaultSize: { w: 980, h: 640 },
    minSize: { w: 560, h: 420 },
    inDock: true,
    inSpringboard: true,
    springboardLabel: "App Store",
    spotlight: {
      keywords: ["app store", "cdk", "sam", "starter kit", "templates", "cli", "downloads", "tools"],
      description: "Free developer tools, CDK templates, and automation scripts",
    },
    seo: {
      title: "Builder Tools & Starter Kits · App Store",
      description: "Open source AWS starter templates, Lambda boilerplates, and CDK stacks.",
    },
    menus: standardMenus("App Store"),
  },

  notes: {
    id: "notes",
    name: "Notes",
    subtitle: "Cert Guides & Roadmaps",
    defaultSize: { w: 860, h: 600 },
    minSize: { w: 500, h: 400 },
    inDock: true,
    inSpringboard: true,
    springboardLabel: "Notes",
    spotlight: {
      keywords: ["notes", "docs", "certifications", "cloud practitioner", "solutions architect", "guides", "roadmap"],
      description: "AWS certification guides, study roadmaps and club charter",
    },
    seo: {
      title: "Study Guides & Roadmaps · Notes",
      description: "In-depth guides for AWS Certified Cloud Practitioner, Solutions Architect, and Bedrock GenAI.",
    },
    menus: standardMenus("Notes"),
  },

  calendar: {
    id: "calendar",
    name: "Calendar",
    subtitle: "Events, Bootcamps & Workshops",
    defaultSize: { w: 880, h: 620 },
    minSize: { w: 520, h: 440 },
    inDock: true,
    inSpringboard: true,
    springboardLabel: "Calendar",
    spotlight: {
      keywords: ["calendar", "events", "workshops", "meetups", "bootcamps", "rsvp", "schedule"],
      description: "Upcoming AWS workshops, hackathons, and RSVP registration",
    },
    seo: {
      title: "Events & Workshops · Calendar",
      description: "Schedule of upcoming cloud computing sessions, workshops, and speaker meetups.",
    },
    menus: standardMenus("Calendar"),
  },

  mail: {
    id: "mail",
    name: "Mail",
    subtitle: "Join the Club & Contact Leads",
    defaultSize: { w: 880, h: 600 },
    minSize: { w: 540, h: 440 },
    inDock: true,
    inSpringboard: true,
    springboardLabel: "Mail",
    spotlight: {
      keywords: ["mail", "contact", "join", "apply", "speaker", "sponsor", "email"],
      description: "Get in touch with club leadership or apply for membership",
    },
    seo: {
      title: "Contact Club Leads · Mail",
      description: "Send inquiries, apply for club membership, or partner with AWS Cloud Club.",
    },
    menus: standardMenus("Mail"),
  },

  music: {
    id: "music",
    name: "Music",
    subtitle: "AWS Cloud Radio · Coding Lo-Fi",
    defaultSize: { w: 840, h: 560 },
    minSize: { w: 520, h: 380 },
    inDock: true,
    inSpringboard: true,
    springboardLabel: "Music",
    spotlight: {
      keywords: ["music", "radio", "lofi", "ambient", "playlist", "audio", "soundtrack"],
      description: "The AWS Cloud Club coding playlist — ambient lo-fi while you build",
    },
    seo: {
      title: "AWS Cloud Radio · Music",
      description: "Curated ambient and lo-fi soundtrack for cloud builders and students.",
    },
    menus: standardMenus("Music", [
      {
        title: "Controls",
        items: [
          { label: "Play / Pause", shortcut: "Space", command: "music:toggle" },
          { label: "Next Track", shortcut: "⌘→", command: "music:next" },
          { label: "Previous Track", shortcut: "⌘←", command: "music:prev" },
        ],
      },
    ]),
  },

  photos: {
    id: "photos",
    name: "Photos",
    subtitle: "Gallery & Hackathon Memories",
    defaultSize: { w: 980, h: 640 },
    minSize: { w: 540, h: 420 },
    inDock: true,
    inSpringboard: true,
    springboardLabel: "Photos",
    spotlight: {
      keywords: ["photos", "gallery", "hackathons", "images", "albums", "campus", "community"],
      description: "Photographs from workshops, hackathons and campus cloud days",
    },
    seo: {
      title: "Community Photo Gallery · Photos",
      description: "Memories and recap photos from AWS Cloud Club workshops, hackathons, and celebrations.",
    },
    menus: standardMenus("Photos"),
  },

  messages: {
    id: "messages",
    name: "Messages",
    subtitle: "Member Testimonials & Community",
    defaultSize: { w: 760, h: 560 },
    minSize: { w: 480, h: 400 },
    inDock: false,
    inSpringboard: true,
    springboardLabel: "Messages",
    spotlight: {
      keywords: ["messages", "testimonials", "reviews", "chat", "members say", "quotes"],
      description: "What students and alumni say about AWS Cloud Club",
    },
    seo: {
      title: "Testimonials & Reviews · Messages",
      description: "Real reviews and career growth stories from AWS Cloud Club student builders.",
    },
    menus: standardMenus("Messages"),
  },

  terminal: {
    id: "terminal",
    name: "Terminal",
    subtitle: "Interactive Cloud Shell",
    defaultSize: { w: 720, h: 460 },
    minSize: { w: 440, h: 320 },
    inDock: false,
    inSpringboard: true,
    springboardLabel: "Terminal",
    spotlight: {
      keywords: ["terminal", "shell", "cli", "bash", "commands", "hacker", "aws-cli"],
      description: "Command line interface. Type help to get started.",
    },
    seo: {
      title: "Interactive Cloud Shell · Terminal",
      description: "Web terminal with custom AWS Cloud Club commands.",
    },
    menus: standardMenus("Terminal"),
  },

  settings: {
    id: "settings",
    name: "System Settings",
    subtitle: "Preferences & Cloud Infrastructure",
    defaultSize: { w: 880, h: 600 },
    minSize: { w: 540, h: 420 },
    inDock: true,
    inSpringboard: true,
    springboardLabel: "Settings",
    spotlight: {
      keywords: ["settings", "appearance", "dark mode", "wallpapers", "tech stack", "admin", "preferences"],
      description: "Themes, wallpapers, sound toggles, and AWS architecture specs",
    },
    seo: {
      title: "System Settings · Preferences",
      description: "Configure appearance, desktop wallpapers, and view AWS architecture details.",
    },
    menus: standardMenus("System Settings"),
  },

  about: {
    id: "about",
    name: "About AWS SBG NMIET",
    subtitle: "System Specs & Chapter Charter",
    defaultSize: { w: 540, h: 460 },
    minSize: { w: 480, h: 400 },
    inDock: false,
    inSpringboard: false,
    spotlight: {
      keywords: ["about", "system", "specs", "version", "chapter", "leadership"],
      description: "About AWS SBG NMIET Chapter",
    },
    seo: {
      title: "About AWS SBG NMIET",
      description: "Official student builder group affiliated with Amazon Web Services.",
    },
    menus: standardMenus("About"),
  },

  trash: {
    id: "trash",
    name: "Trash",
    subtitle: "Cloud Anti-Patterns & Bad Practices",
    defaultSize: { w: 720, h: 480 },
    minSize: { w: 460, h: 340 },
    inDock: true,
    inSpringboard: false,
    spotlight: {
      keywords: ["trash", "bin", "bad practices", "anti-patterns", "rejected"],
      description: "Cloud architectural mistakes we threw away so you don't make them",
    },
    seo: {
      title: "Cloud Anti-Patterns · Trash",
      description: "Rejected cloud mistakes, hardcoded secrets, and monolith antipatterns.",
    },
    menus: standardMenus("Trash"),
  },

  assistant: {
    id: "assistant",
    name: "Cloud Concierge",
    subtitle: "AI Assistant for AWS Cloud Club",
    defaultSize: { w: 460, h: 620 },
    minSize: { w: 360, h: 440 },
    inDock: true,
    inSpringboard: true,
    springboardLabel: "Assistant",
    spotlight: {
      keywords: ["assistant", "concierge", "ai", "ask", "help", "siri", "chat"],
      description: "Ask the Cloud Concierge about workshops, roadmaps, and club info",
    },
    seo: {
      title: "Cloud Concierge · Assistant",
      description: "Intelligent concierge guiding students through AWS certifications and club events.",
    },
    menus: standardMenus("Cloud Concierge"),
  },

  admin: {
    id: "admin",
    name: "Admin Control",
    subtitle: "Cognito & DynamoDB Management",
    defaultSize: { w: 1040, h: 680 },
    minSize: { w: 640, h: 460 },
    inDock: false,
    inSpringboard: true,
    springboardLabel: "Admin",
    spotlight: {
      keywords: ["admin", "login", "cognito", "dynamodb", "s3", "manage", "events", "team"],
      description: "Administrator console for events, team, projects and media",
    },
    seo: {
      title: "Admin Panel · Cloud Control",
      description: "AWS Cloud Club administrative dashboard powered by Cognito and DynamoDB.",
    },
    menus: standardMenus("Admin Control"),
  },

  profile: {
    id: "profile",
    name: "My Profile",
    subtitle: "Credentials & Cert Badges",
    defaultSize: { w: 780, h: 560 },
    minSize: { w: 480, h: 400 },
    inDock: false,
    inSpringboard: true,
    springboardLabel: "Profile",
    spotlight: {
      keywords: ["profile", "member", "credentials", "badges", "points", "account"],
      description: "Student builder profile, badges, and credentials",
    },
    seo: {
      title: "Member Profile · AWS Cloud Club",
      description: "Student credentials, earned AWS badges, and account status.",
    },
    menus: standardMenus("Member Profile"),
  },
}

export const DOCK_APPS: AppId[] = [
  "aws",
  "finder",
  "safari",
  "appstore",
  "notes",
  "mail",
  "assistant",
  "calendar",
  "photos",
  "music",
  "settings",
  "trash",
]

export const SPRINGBOARD_DOCK: AppId[] = [
  "aws",
  "finder",
  "calendar",
  "mail",
]

export const SPRINGBOARD_GRID: AppId[] = [
  "safari",
  "appstore",
  "notes",
  "music",
  "photos",
  "messages",
  "terminal",
  "settings",
  "assistant",
  "profile",
  "admin",
]
