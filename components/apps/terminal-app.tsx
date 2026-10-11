// components/apps/terminal-app.tsx
// Terminal — the club's interactive shell (original command set + easter eggs)

"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { windowActions, systemActions } from "@/lib/aws-store"
import { APPS_META, type AppId } from "@/lib/aws-apps"
import { AWS_FACTS, CLUB, TEAM_MEMBERS, isLeadRole } from "@/lib/club-content"
import { useClubFacts, useEvents } from "@/lib/club-data"
import { cn } from "@/lib/utils"

interface Line {
  type: "input" | "output" | "error"
  content: string
}

const BANNER: Line[] = [
  { type: "output", content: "AWS Student Builder Group NMIET — Terminal v1.0" },
  { type: "output", content: "Nutan Maharashtra Institute of Engineering & Technology" },
  { type: "output", content: "─────────────────────────────────────────────────────" },
  { type: "output", content: 'Type "help" for available commands.\n' },
]

/** Friendly names → app ids for `open <app>`. */
const OPEN_ALIASES: Record<string, AppId> = {
  home: "aws",
  about: "about",
  team: "team",
  events: "calendar",
  calendar: "calendar",
  projects: "finder",
  finder: "finder",
  resources: "safari",
  safari: "safari",
  gallery: "photos",
  photos: "photos",
  achievements: "achievements",
  social: "social",
  contact: "mail",
  mail: "mail",
  notes: "notes",
  music: "music",
  settings: "settings",
  trash: "trash",
  assistant: "assistant",
  profile: "profile",
  admin: "admin",
}

export function TerminalApp() {
  const { members, firstEventRsvps } = useClubFacts()
  const events = useEvents()
  const [lines, setLines] = useState<Line[]>(BANNER)
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const [isHacking, setIsHacking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const commands = useMemo<Record<string, string>>(() => {
    const leads = TEAM_MEMBERS.filter(m => isLeadRole(m.role))
    const pad = Math.max(...leads.map(m => m.name.length)) + 2
    return {
      help: `Available commands:
  help          - Show this help message
  about         - About AWS Student Builder Group NMIET
  mission       - Our mission & vision
  join          - How to join the group
  events        - Our events & activities
  team          - Core team structure
  skills        - Technologies we work with
  achievements  - Group highlights & wins
  contact       - Get in touch with us
  aws           - Random AWS fun fact
  open <app>    - Open an app (e.g. open team)
  theme <mode>  - Switch to dark or light mode
  date          - Show current date
  clear         - Clear terminal
  echo [text]   - Echo back text

🕵️ Hidden Easter Eggs:
  whoami        - Display current user identity
  sudo join     - Gain superuser signup access
  hack          - Execute server penetration test
  aws free tier - Check AWS pricing policies`,

      about: `
╔══════════════════════════════════════════════╗
║    AWS Student Builder Group at NMIET v1.0   ║
║    Nutan Maharashtra Inst. of Eng. & Tech    ║
╠══════════════════════════════════════════════╣
║  Teaching students AWS Cloud use cases:      ║
║  security, AI, business analytics &          ║
║  business transformation.                    ║
║                                              ║
║  📍 Talegaon Dabhade, Pune, Maharashtra      ║
║  📅 Founded: February 16, 2026               ║
║  👥 ${members.padEnd(5)} Members  🌐 Student Builder Groups ║
╚══════════════════════════════════════════════╝`,

      mission: `
🎯 Mission:
   To bridge the gap between academic learning and
   real-world cloud computing by giving students
   hands-on AWS experience and industry exposure.

👁️  Vision:
   Build a thriving cloud community where every
   student can learn, build, and launch on AWS.

💜 Values:
   • Learn by doing — workshops, not just lectures
   • Open community — everyone is welcome
   • Real projects — actual AWS deployments
   • Give back — share knowledge freely`,

      join: `
🚀 Join AWS Student Builder Group NMIET!

Steps to become a member:
  1. Visit our Meetup page and RSVP to events
     meetup.com/aws-sbg-at-nutan-…
  2. Attend our next workshop or event
  3. Connect with us on social media
  4. Create an account on this portal → choose
     "Create a member account" on the lock screen

📧 Email: ${CLUB.email}

Type 'events' to see upcoming activities!`,

      events: (() => {
        const upcoming = events.data.filter(e => !e.isPast)
        const past = events.data.filter(e => e.isPast).slice(0, 6)
        const line = (e: (typeof events.data)[number]) =>
          `  ${e.isPast ? "✔" : "★"} ${e.date.padEnd(18)} ${e.title}${e.attendees ? `  (${e.attendees} RSVPs)` : ""}`
        return `
📅 Events (live from Meetup):

${upcoming.length ? `Upcoming:\n${upcoming.map(line).join("\n")}` : "No upcoming events announced yet."}

${past.length ? `Recent:\n${past.map(line).join("\n")}` : ""}

Type 'open events' or visit meetup.com/aws-sbg-at-nutan-… to RSVP.`
      })(),

      team: `
👥 Core Team — AWS Student Builder Group NMIET:

${leads.map(m => `  ${m.name.padEnd(pad)}[${m.role}]  🟢 Running`).join("\n")}
  ──────────────────────────────────────────────────
  ${TEAM_MEMBERS.length} team members · ${members} community members

  Interested in a leadership role?
  Email: ${CLUB.email}
  or type 'open team' for the full roster.`,

      skills: `
☁️  What we learn and build with:

  • AWS core      — EC2, S3, IAM, VPC
  • Serverless    — Lambda, API Gateway, DynamoDB
  • DevOps        — Git, containers, CI/CD, deploying on AWS
  • Security      — IAM policies, least privilege
  • This website  — Next.js on AWS Amplify, Cognito, DynamoDB, S3, SES`,

      achievements: `
🏆 Group Highlights:

  ★ Official AWS Student Builder Group (est. Feb 2026)
  ★ ${members} Members on Meetup & Growing Fast
  ★ ${firstEventRsvps} RSVPs for Our Very First Event
  ★ Part of AWS Student Builder Groups Global Network
  ★ Open Community — Anyone Can Join!

Type 'about' for more info.`,

      contact: `
📬 Contact AWS Student Builder Group NMIET:

  📧 Email   : ${CLUB.email}
  🌐 Meetup  : meetup.com/aws-sbg-at-nutan-…
  📍 Location: NMIET, Talegaon Dabhade, Pune

  Or type 'open contact' to send us a message!`,
    }
  }, [members, firstEventRsvps, events])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [lines, isHacking])

  const print = (...next: Line[]) => setLines(prev => [...prev, ...next])

  const run = (raw: string) => {
    const trimmed = raw.trim()
    const lower = trimmed.toLowerCase()
    const [command, ...rest] = lower.split(/\s+/)
    const args = trimmed.split(/\s+/).slice(1).join(" ")

    setLines(prev => [...prev, { type: "input", content: `$ ${trimmed}` }])

    if (command === "clear") return setLines([])
    if (command === "echo") return print({ type: "output", content: args })
    if (command === "date") return print({ type: "output", content: new Date().toString() })

    // Easter eggs (checked before `aws` so "aws free tier" wins)
    if (lower === "whoami") return print({ type: "output", content: "a curious builder 👀" })
    if (lower === "sudo join") return print({ type: "output", content: "Permission granted. Your seat is waiting on Meetup 😄 — type 'join'" })
    if (lower === "aws free tier") return print({ type: "output", content: "Free Tier fan detected 🫡" })
    if (lower === "hack") {
      setIsHacking(true)
      setTimeout(() => {
        setIsHacking(false)
        print({ type: "output", content: "nice try 😂" })
      }, 2000)
      return
    }

    if (command === "aws") {
      const fact = AWS_FACTS[Math.floor(Math.random() * AWS_FACTS.length)]
      return print({ type: "output", content: `☁️  AWS Fun Fact:\n\n"${fact}"` })
    }

    if (command === "open") {
      const target = OPEN_ALIASES[rest.join(" ")]
      if (!target) {
        return print({ type: "error", content: `Unknown app: ${rest.join(" ") || "(none)"}. Try: ${Object.keys(OPEN_ALIASES).slice(0, 8).join(", ")}…` })
      }
      windowActions.open(target)
      return print({ type: "output", content: `Opening ${APPS_META[target].windowTitle ?? APPS_META[target].name}…` })
    }

    if (command === "theme") {
      const mode = rest[0]
      if (mode !== "dark" && mode !== "light") return print({ type: "error", content: "Usage: theme dark | theme light" })
      systemActions.setAppearance(mode)
      return print({ type: "output", content: `Appearance switched to ${mode} mode.` })
    }

    if (commands[command]) return print({ type: "output", content: commands[command] })
    if (command) print({ type: "error", content: `Command not found: ${command}. Type "help" for available commands.` })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isHacking) return
    run(input)
    setHistory(h => [...h, input])
    setHistoryIndex(null)
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" && history.length) {
      e.preventDefault()
      const i = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(i)
      setInput(history[i])
    } else if (e.key === "ArrowDown" && historyIndex !== null) {
      e.preventDefault()
      const i = historyIndex + 1
      if (i >= history.length) {
        setHistoryIndex(null)
        setInput("")
      } else {
        setHistoryIndex(i)
        setInput(history[i])
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={cn(
        "flex h-full w-full cursor-text flex-col font-mono text-[13px] transition-colors duration-200",
        isHacking ? "animate-pulse bg-red-950 text-white" : "bg-[#141418] text-neutral-200"
      )}
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {lines.map((line, i) => (
          <div
            key={i}
            className={cn(
              "select-text whitespace-pre-wrap break-words leading-relaxed",
              line.type === "input" ? "text-emerald-400" : line.type === "error" ? "text-red-400" : "text-neutral-300"
            )}
          >
            {line.content}
          </div>
        ))}
        {isHacking && <div className="mt-1 text-red-300">Accessing mainframe… ████████░░ bypassing firewall…</div>}

        <form onSubmit={handleSubmit} className="mt-1 flex items-center gap-2">
          <span className="shrink-0 text-emerald-400">builder@aws-sbg-nmiet ~ %</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Terminal input"
            className="min-w-0 flex-1 bg-transparent text-white caret-emerald-400 outline-none"
          />
        </form>
      </div>
    </div>
  )
}
