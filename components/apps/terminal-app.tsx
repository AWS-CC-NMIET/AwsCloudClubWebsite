"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useMeetup } from "@/lib/meetup-context"

interface TerminalLine {
  type: "input" | "output" | "error"
  content: string
}

const awsFacts = [
  "AWS has over 200 fully featured services from data centers globally.",
  "The first AWS service was S3, launched in March 2006.",
  "AWS operates in 33 geographic regions with 105 Availability Zones.",
  "Lambda was the first mainstream FaaS (serverless compute) service, launched in 2014.",
  "EC2 stands for Elastic Compute Cloud — it launched in August 2006.",
  "AWS accounts for roughly 31% of the global cloud market share.",
  "Amazon S3 stores over 100 trillion objects worldwide.",
  "AWS CloudFront has over 600 Points of Presence worldwide.",
  "Amazon DynamoDB can handle over 10 trillion requests per day.",
  "AWS was the first cloud provider to offer a managed Kubernetes service (EKS) in 2018.",
  "Amazon Route 53 performs over 100 billion DNS queries daily.",
  "AWS re:Invent 2023 had over 52,000 in-person attendees in Las Vegas.",
]

export function TerminalApp() {
  const { memberCount } = useMeetup()
  const m = memberCount ?? 299
  const [isHacking, setIsHacking] = useState(false)

  const commandRegistry = useMemo<Record<string, string>>(() => ({
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
║  👥 ${m} Members   🌐 Student Builder Groups ║
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
     meetup.com/aws-cloud-club-at-nutan-…
  2. Attend our next workshop or event
  3. Connect with us on social media
  4. Create an account on this portal → click
     the lock icon on the login screen

📧 Email: aws.studentbuildersgroup.nmiet@gmail.com

Type 'events' to see upcoming activities!`,

  events: `
📅 Events:

  ┌─────────────────────────────────────────────┐
  │ 🚀 AWS Student Builder Group Intro Event    │
  │    📅 April 8, 2026  10:00 AM – 12:00 PM   │
  │    📍 In-person at NMIET, Pune              │
  │    👥 236 RSVPs  (Open to all!)             │
  │    Covers: AWS fundamentals, career paths,  │
  │    upcoming workshops & hands-on projects.  │
  └─────────────────────────────────────────────┘

More events coming! Check the Events app or
visit meetup.com/aws-cloud-club-at-nutan-… to RSVP.`,

  team: `
👥 Core Team — AWS Student Builder Group NMIET:

  Neha Sharma     [SBG Leader]  🟢 Running
  ──────────────────────────────────────────────────
  ${m} members strong and growing!

  Interested in a leadership role?
  Email: aws.studentbuildersgroup.nmiet@gmail.com
  or open the Team app for the full roster.`,

  skills: `
☁️  Technologies & AWS Services we work with:

  AWS Core        ████████████████░░░░  80%
  Serverless      ███████████████░░░░░  75%
  DevOps / CI-CD  ██████████████░░░░░░  70%
  Cloud Security  ███████████████░░░░░  75%
  Machine Learning████████████░░░░░░░░  60%
  IaC (CDK/CFN)   ████████████░░░░░░░░  60%

  Key services: EC2, S3, Lambda, DynamoDB,
  API Gateway, Cognito, CloudFront, SES, IAM`,

  achievements: `
🏆 Group Highlights:

  ★ Official AWS Student Builder Group (est. Feb 2026)
  ★ ${m} Members on Meetup & Growing Fast
  ★ 236+ RSVPs for Our Very First Event
  ★ Part of AWS Student Builder Groups Global Network
  ★ Open Community — Anyone Can Join!

Type 'about' for more info.`,

  contact: `
📬 Contact AWS Student Builder Group NMIET:

  📧 Email   : aws.studentbuildersgroup.nmiet@gmail.com
  🌐 Meetup  : meetup.com/aws-cloud-club-at-nutan-…
  📍 Location: NMIET, Talegaon Dabhade, Pune

  Or use the Contact app on the desktop
  to send us a message directly!`,
  }), [m])

  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "output", content: "AWS Student Builder Group NMIET — Terminal v1.0" },
    { type: "output", content: "Nutan Maharashtra Institute of Engineering & Technology" },
    { type: "output", content: '─────────────────────────────────────────────────────' },
    { type: "output", content: 'Type "help" for available commands.\n' },
  ])
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [lines])

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim()
    const lower = trimmed.toLowerCase()
    const parts = lower.split(" ")
    const command = parts[0]
    const args = parts.slice(1).join(" ")

    setLines((prev) => [...prev, { type: "input", content: `$ ${trimmed}` }])

    if (command === "clear") {
      setLines([])
      return
    }

    if (command === "echo") {
      setLines((prev) => [...prev, { type: "output", content: args || "" }])
      return
    }

    if (command === "date") {
      setLines((prev) => [...prev, { type: "output", content: new Date().toString() }])
      return
    }

    if (command === "aws") {
      const fact = awsFacts[Math.floor(Math.random() * awsFacts.length)]
      setLines((prev) => [...prev, { type: "output", content: `☁️  AWS Fun Fact:\n\n"${fact}"` }])
      return
    }

    // Easter Egg Intercepts
    if (lower === "whoami") {
      setLines((prev) => [...prev, { type: "output", content: "a curious builder 👀" }])
      return
    }

    if (lower === "sudo join") {
      setLines((prev) => [...prev, { type: "output", content: "Permission granted. DM us on Instagram 😄" }])
      return
    }

    if (lower === "aws free tier") {
      setLines((prev) => [...prev, { type: "output", content: "Free Tier fan detected 🫡" }])
      return
    }

    if (lower === "hack") {
      setIsHacking(true)
      setTimeout(() => {
        setIsHacking(false)
        setLines((prev) => [...prev, { type: "output", content: "nice try 😂" }])
      }, 2000)
      return
    }

    if (commandRegistry[command]) {
      setLines((prev) => [...prev, { type: "output", content: commandRegistry[command] }])
    } else if (command) {
      setLines((prev) => [
        ...prev,
        { type: "error", content: `Command not found: ${command}. Type "help" for available commands.` },
      ])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      handleCommand(input)
      setInput("")
    }
  }

  return (
    <div
      className={`flex h-full flex-col rounded-lg font-mono text-sm transition-all duration-200 ${
        isHacking ? "bg-red-950/90 text-white animate-pulse" : "bg-[#110d2a]"
      }`}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal Header */}
      <div className="flex items-center gap-2 border-b border-purple-900/50 px-4 py-2">
        <div className="h-2 w-2 rounded-full bg-[#7C6FFF]/60" />
        <span className="text-xs text-purple-300/60">aws-sbg-nmiet — bash</span>
      </div>

      {/* Terminal Content */}
      <div ref={containerRef} className="custom-scrollbar flex-1 overflow-auto p-4">
        {lines.map((line, idx) => (
          <div
            key={idx}
            className={`whitespace-pre-wrap leading-relaxed ${
              line.type === "input"
                ? "text-[#a78bfa]"
                : line.type === "error"
                ? "text-red-400"
                : "text-gray-300"
            }`}
          >
            {line.content}
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-purple-900/50 p-3">
        <span className="text-[#a78bfa]">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent text-gray-200 outline-none placeholder:text-purple-800"
          placeholder="Type a command..."
          autoFocus
        />
      </form>
    </div>
  )
}
