// components/apps/aws-flagship-app.tsx
// Home — the AWS Student Builder Group NMIET welcome window

"use client"

import React, { useRef, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Calendar, Cloud, MapPin, Rocket, Sparkles, Star, Users, Zap } from "lucide-react"
import { windowActions, systemActions } from "@/lib/aws-store"
import { APPS_META, type AppId } from "@/lib/aws-apps"
import { CLUB, HIGHLIGHTS, WHAT_WE_DO, type PillarIcon } from "@/lib/club-content"
import { fillFacts, useClubFacts, useEvents, useMemberCount, useProjects, useTeam } from "@/lib/club-data"
import { AppIcon } from "@/components/os/app-icon"
import { MacButton } from "./shared/mac-ui"
import { CountUp, GlowCard, Reveal, Stagger, StaggerItem } from "./shared/motion"

const PILLAR_ICONS: Record<PillarIcon, React.ElementType> = { cloud: Cloud, rocket: Rocket, sparkles: Sparkles }

const EXPLORE: AppId[] = ["about", "team", "calendar", "finder", "safari", "photos", "achievements", "social", "mail"]

/** The stack we teach in sessions and that runs this website. */
const STACK = ["Amazon EC2", "Amazon S3", "AWS IAM", "Amazon VPC", "AWS Lambda", "Amazon API Gateway", "Amazon DynamoDB", "AWS Amplify", "Amazon Cognito", "Amazon SES"]

const CONFETTI_COLORS = ["#FF9900", "#6B4FE8", "#B8A4FF", "#50C88A", "#5BA8D8", "#FF3E3E"]

export function AwsFlagshipApp() {
  const { display: members } = useMemberCount()
  const events = useEvents()
  const projects = useProjects()
  const team = useTeam()
  const facts = useClubFacts()

  const nextEvent = events.data.find(e => !e.isPast)

  const stats = [
    { label: "Members", value: members, icon: Users, color: "#6B4FE8" },
    {
      label: "Events",
      value: events.status === "ready" && !events.fromFallback && events.data.length > 0 ? `${events.data.length}` : "1+",
      icon: Calendar,
      color: "#FF9900",
    },
    {
      label: "Projects",
      value: projects.status === "ready" && projects.data.length > 0 ? `${projects.data.length}` : "3+",
      icon: Rocket,
      color: "#50C88A",
    },
    { label: "Team", value: `${team.data.length}`, icon: Zap, color: "#5BA8D8" },
  ]

  // ── Easter egg: click the logo 5 times quickly ─────────────────────────────
  const clicks = useRef({ count: 0, last: 0 })
  const [confetti, setConfetti] = useState<{ id: number; pieces: ConfettiPiece[] } | null>(null)
  const handleLogoClick = () => {
    const now = Date.now()
    clicks.current.count = now - clicks.current.last < 1000 ? clicks.current.count + 1 : 1
    clicks.current.last = now
    if (clicks.current.count >= 5) {
      clicks.current.count = 0
      setConfetti({ id: now, pieces: makeConfetti() })
      systemActions.showToast("You found us! True builders are always curious 🚀")
    }
  }

  return (
    <div className="@container relative min-h-full w-full overflow-hidden text-neutral-800 dark:text-neutral-100">
      {/* Aurora behind the hero */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[52rem] -translate-x-1/2 opacity-70 dark:opacity-60">
        <motion.div
          className="absolute inset-0 rounded-full blur-3xl"
          style={{ background: "conic-gradient(from 90deg at 50% 50%, #FF990055, #7940ea55, #50C88A40, #5BA8D850, #FF990055)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl space-y-10 px-5 py-8 @2xl:px-10 @2xl:py-10">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <Stagger className="flex flex-col gap-5 @2xl:flex-row @2xl:items-start">
          <StaggerItem className="shrink-0">
            <motion.button
              onClick={handleLogoClick}
              aria-label="AWS Student Builder Group logo"
              whileHover={{ scale: 1.06, rotate: -3 }}
              whileTap={{ scale: 0.94 }}
              className="glass-card rim relative flex size-20 items-center justify-center rounded-3xl"
            >
              <span aria-hidden="true" className="absolute -inset-2 -z-10 rounded-[2rem] bg-gradient-to-br from-[#FF9900]/40 to-[#7940ea]/40 blur-xl" />
              <Image src="/logo-full.png" alt="" width={64} height={64} className="size-16 object-contain" unoptimized />
            </motion.button>
          </StaggerItem>

          <StaggerItem className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#7940ea]/30 bg-[#7940ea]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#7940ea] dark:text-[#c4b5fd]">
                Official AWS Community
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                <MapPin className="size-3" /> {CLUB.collegeShort}, {CLUB.city}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 @2xl:text-4xl dark:text-white">
                {CLUB.name}
              </h1>
              <p className="mt-0.5 text-base font-semibold text-neutral-500 dark:text-neutral-400">{CLUB.chapter}</p>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-neutral-600 @2xl:text-base dark:text-neutral-300">
              {CLUB.tagline}
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <MacButton variant="aws" href={CLUB.meetupUrl}>
                <Rocket className="size-3.5" /> Join the Group
              </MacButton>
              <MacButton onClick={() => windowActions.open("about")}>
                Learn More <ArrowRight className="size-3.5" />
              </MacButton>
              <MacButton onClick={() => windowActions.open("calendar")}>
                <Calendar className="size-3.5" /> Events
              </MacButton>
            </div>
          </StaggerItem>
        </Stagger>

        {/* ── Stack marquee ────────────────────────────────────────────────── */}
        <div
          role="list"
          aria-label="AWS services we learn and build with"
          className="relative -mx-5 overflow-hidden py-1 @2xl:-mx-10"
          style={{
            maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
            WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
          }}
        >
          <div className="flex w-max gap-2" style={{ animation: "marquee 38s linear infinite" }}>
            {[...STACK, ...STACK].map((name, i) => (
              <span
                key={i}
                role={i < STACK.length ? "listitem" : undefined}
                aria-hidden={i >= STACK.length || undefined}
                className="glass-card flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300"
              >
                <Cloud className="size-3 text-[#FF9900]" /> {name}
              </span>
            ))}
          </div>
        </div>

        {/* ── Stats ────────────────────────────────────────────────────────── */}
        <Stagger className="grid grid-cols-2 gap-3 @2xl:grid-cols-4">
          {stats.map(stat => (
            <StaggerItem key={stat.label}>
              <GlowCard className="glass-card rim interactive flex h-full flex-col gap-2 p-4">
                <div className="flex size-8 items-center justify-center rounded-lg" style={{ background: `${stat.color}1f` }}>
                  <stat.icon className="size-4" style={{ color: stat.color }} />
                </div>
                <div>
                  <CountUp value={stat.value} className="block text-2xl font-extrabold leading-none text-neutral-900 dark:text-white" />
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{stat.label}</p>
                </div>
                <span aria-hidden="true" className="absolute -bottom-6 -right-6 size-20 rounded-full opacity-25 blur-2xl" style={{ background: stat.color }} />
              </GlowCard>
            </StaggerItem>
          ))}
        </Stagger>

        {/* ── Next event ───────────────────────────────────────────────────── */}
        {nextEvent && (
          <Reveal className="glass-card rim relative flex flex-col gap-4 overflow-hidden bg-gradient-to-br from-[#FF9900]/15 to-transparent p-5 @2xl:flex-row @2xl:items-center">
            <span aria-hidden="true" className="absolute right-4 top-4 flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#FF9900] opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-[#FF9900]" />
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#c2410c] dark:text-[#FF9900]">Next event</p>
              <h2 className="text-lg font-bold leading-snug text-neutral-900 dark:text-white">{nextEvent.title}</h2>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-600 dark:text-neutral-300">
                <span className="flex items-center gap-1"><Calendar className="size-3.5" /> {nextEvent.date}</span>
                <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {nextEvent.location}</span>
                {nextEvent.attendees > 0 && (
                  <span className="flex items-center gap-1"><Users className="size-3.5" /> {nextEvent.attendees} going</span>
                )}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <MacButton variant="aws" href={nextEvent.eventUrl}>RSVP on Meetup</MacButton>
              <MacButton onClick={() => windowActions.open("calendar")}>All events</MacButton>
            </div>
          </Reveal>
        )}

        {/* ── What we do ───────────────────────────────────────────────────── */}
        <Reveal className="space-y-4">
          <SectionTitle eyebrow="What we do" title="Learn. Build. Connect." />
          <div className="grid gap-3 @2xl:grid-cols-3">
            {WHAT_WE_DO.map(card => {
              const Icon = PILLAR_ICONS[card.icon]
              return (
                <GlowCard key={card.title} tilt className="glass-card rim interactive p-5">
                  <div className="mb-3 flex size-10 items-center justify-center rounded-xl" style={{ background: `${card.color}1a` }}>
                    <Icon className="size-5" style={{ color: card.color }} />
                  </div>
                  <h3 className="mb-1 text-sm font-bold" style={{ color: card.color }}>{card.title}</h3>
                  <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">{card.description}</p>
                </GlowCard>
              )
            })}
          </div>
        </Reveal>

        {/* ── Highlights ───────────────────────────────────────────────────── */}
        <Reveal className="space-y-4">
          <SectionTitle eyebrow="Highlights" title="Where we are so far" icon={Star} />
          <div className="grid gap-2 @2xl:grid-cols-2">
            {HIGHLIGHTS.map(template => fillFacts(template, facts)).map(h => (
              <div
                key={h}
                className="glass-card flex items-center gap-3 rounded-xl px-4 py-3"
              >
                <span className="size-2 shrink-0 rounded-full bg-[#7940ea] shadow-[0_0_10px_#7940ea]" />
                <span className="text-xs font-medium leading-snug text-neutral-700 dark:text-neutral-200">{h}</span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ── Explore ──────────────────────────────────────────────────────── */}
        <Reveal className="space-y-4 pb-2">
          <SectionTitle eyebrow="Explore" title="Open an app to dive in" />
          <div className="grid grid-cols-3 gap-3 @lg:grid-cols-5 @2xl:grid-cols-9">
            {EXPLORE.map(id => (
              <button
                key={id}
                onClick={() => windowActions.open(id)}
                className="group flex flex-col items-center gap-1.5 rounded-xl p-2 transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              >
                <div className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-active:scale-95">
                  <AppIcon id={id} size={44} />
                </div>
                <span className="text-center text-[11px] font-medium leading-tight text-neutral-600 dark:text-neutral-300">
                  {APPS_META[id].springboardLabel ?? APPS_META[id].name}
                </span>
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      <AnimatePresence>{confetti && <Confetti key={confetti.id} pieces={confetti.pieces} onDone={() => setConfetti(null)} />}</AnimatePresence>
    </div>
  )
}

function SectionTitle({ eyebrow, title, icon: Icon }: { eyebrow: string; title: string; icon?: React.ElementType }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#7940ea] dark:text-[#a78bfa]">
        {Icon && <Icon className="size-3.5 text-amber-500" />} {eyebrow}
      </p>
      <h2 className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">{title}</h2>
    </div>
  )
}

interface ConfettiPiece {
  color: string
  x: number
  y: number
  rotate: number
  scale: number
  duration: number
}

function makeConfetti(): ConfettiPiece[] {
  return Array.from({ length: 80 }, (_, i) => {
    const angle = Math.random() * Math.PI * 2
    const distance = 80 + Math.random() * 250
    return {
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance + 100,
      rotate: Math.random() * 360,
      scale: 0.4 + Math.random() * 0.8,
      duration: 1.5 + Math.random() * 1.5,
    }
  })
}

function Confetti({ pieces, onDone }: { pieces: ConfettiPiece[]; onDone: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {pieces.map((p, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 size-3 rounded-xs"
          style={{ backgroundColor: p.color }}
          initial={{ scale: 0, rotate: 0, opacity: 1, x: 0, y: 0 }}
          animate={{ scale: [0, p.scale, 0], rotate: [0, p.rotate], opacity: [1, 1, 0], x: p.x, y: p.y }}
          transition={{ duration: p.duration, ease: "easeOut" }}
          onAnimationComplete={i === 0 ? () => setTimeout(onDone, 1500) : undefined}
        />
      ))}
    </div>
  )
}
