"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  Cloud, Sparkles, Rocket, Zap, Users, Calendar,
  ArrowRight, Star, ChevronDown, Shield, Globe, Code2,
  Cpu, Database, Trophy, BookOpen, Share2
} from "lucide-react"
import { useMeetup } from "@/lib/meetup-context"

const MEETUP_URL = "https://www.meetup.com/aws-cloud-club-at-nutan-maharashtra-inst-of-eng-tech/"

const whatWeDo = [
  {
    title: "Learn",
    description: "Hands-on workshops and deep-dive sessions on AWS services — EC2, Lambda, S3, DynamoDB and more.",
    color: "#6B4FE8",
    lightBg: "rgba(107,79,232,0.08)",
    icon: Cloud,
  },
  {
    title: "Build",
    description: "Real-world cloud projects that solve actual problems. Build, deploy, and scale on AWS infrastructure.",
    color: "#FF9900",
    lightBg: "rgba(255,153,0,0.08)",
    icon: Rocket,
  },
  {
    title: "Connect",
    description: "Network with industry professionals, AWS heroes, and peers who share your passion for cloud.",
    color: "#50C88A",
    lightBg: "rgba(80,200,138,0.08)",
    icon: Sparkles,
  },
]

const highlights = [
  "Official AWS Cloud Club Chapter — est. February 2026",
  "299+ Members on Meetup & Growing",
  "Part of AWS Cloud Clubs Global Network (616 Groups)",
  "236+ RSVPs for Our Very First Event",
]

// Mobile-only orbit items
const orbitItems = [
  { icon: Cloud,    color: "#6B4FE8", label: "EC2",     angle: 0   },
  { icon: Database, color: "#FF9900", label: "S3",      angle: 72  },
  { icon: Shield,   color: "#50C88A", label: "IAM",     angle: 144 },
  { icon: Code2,    color: "#5BA8D8", label: "Lambda",  angle: 216 },
  { icon: Globe,    color: "#E85580", label: "Route53", angle: 288 },
]

// Floating tech tags for hero
const techTags = [
  { label: "AWS Lambda",  color: "#FF9900", x: "8%",  y: "22%" },
  { label: "EC2",         color: "#6B4FE8", x: "68%", y: "15%" },
  { label: "S3",          color: "#50C88A", x: "75%", y: "72%" },
  { label: "CloudWatch",  color: "#5BA8D8", x: "5%",  y: "78%" },
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } } }

// ─── Mobile Hero — full immersive landing ───────────────────────────────────
function MobileHero({ memberCount, onLearnMore }: { memberCount: number | null; onLearnMore?: () => void }) {
  const [activeTag, setActiveTag] = useState(0)
  const tags = ["Cloud Computing", "AWS Services", "DevOps", "Serverless", "Cloud Security"]

  useEffect(() => {
    const t = setInterval(() => setActiveTag(i => (i + 1) % tags.length), 2200)
    return () => clearInterval(t)
  }, [tags.length])

  return (
    <div className="relative flex flex-col items-center overflow-hidden" style={{ minHeight: "calc(100dvh - 56px)" }}>

      {/* ── Animated gradient background ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(160deg, #2A1580 0%, #4B2FA8 35%, #6B4FE8 65%, #8B6FFF 100%)",
        }}
      />

      {/* Animated blobs */}
      {[
        { w: 300, h: 300, x: "-20%", y: "-10%", color: "rgba(107,79,232,0.35)", dur: 8 },
        { w: 250, h: 250, x: "60%",  y: "50%",  color: "rgba(255,153,0,0.15)", dur: 10 },
        { w: 200, h: 200, x: "20%",  y: "70%",  color: "rgba(80,200,138,0.12)", dur: 7 },
      ].map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: b.w, height: b.h, left: b.x, top: b.y,
            background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
            filter: "blur(40px)",
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Dot grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
        <defs>
          <pattern id="mdot" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="14" cy="14" r="1" fill="rgba(255,255,255,0.8)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mdot)" />
      </svg>

      {/* Floating tech tags */}
      {techTags.map((tag, i) => (
        <motion.div
          key={tag.label}
          className="absolute pointer-events-none"
          style={{ left: tag.x, top: tag.y }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
        >
          <div
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
            style={{
              background: `${tag.color}33`,
              border: `1px solid ${tag.color}55`,
              backdropFilter: "blur(6px)",
            }}
          >
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: tag.color }} />
            {tag.label}
          </div>
        </motion.div>
      ))}

      {/* ── Hero content ── */}
      <div className="relative z-10 flex flex-col items-center pt-14 pb-8 px-5 text-center w-full">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.22)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
          <span className="text-xs font-semibold text-white tracking-wide">Official AWS Cloud Club · NMIET</span>
        </motion.div>

        {/* Logo with orbit */}
        <motion.div
          className="relative mb-6"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 22 }}
        >
          {/* Pulse rings */}
          {[120, 160, 200].map((r, i) => (
            <motion.div
              key={r}
              className="absolute rounded-full"
              style={{
                width: r, height: r,
                left: "50%", top: "50%",
                transform: "translate(-50%, -50%)",
                border: `1.5px solid rgba(255,255,255,${0.20 - i * 0.06})`,
              }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.8, 0.2, 0.8] }}
              transition={{ duration: 3 + i * 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
            />
          ))}

          {/* Rotating orbit */}
          <motion.div
            className="absolute"
            style={{
              width: 180, height: 180,
              left: "50%", top: "50%",
              transform: "translate(-50%, -50%)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            {orbitItems.map((o, i) => {
              const rad = (o.angle * Math.PI) / 180
              const r = 88
              return (
                <motion.div
                  key={i}
                  className="absolute flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{
                    left: `calc(50% + ${Math.cos(rad) * r}px - 16px)`,
                    top:  `calc(50% + ${Math.sin(rad) * r}px - 16px)`,
                    background: `${o.color}28`,
                    border: `1px solid ${o.color}50`,
                    backdropFilter: "blur(6px)",
                  }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <o.icon className="h-4 w-4" style={{ color: o.color }} />
                </motion.div>
              )
            })}
          </motion.div>

          {/* Logo */}
          <div
            className="relative flex h-24 w-24 items-center justify-center rounded-3xl"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1.5px solid rgba(255,255,255,0.30)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 0 40px rgba(107,79,232,0.50), 0 0 80px rgba(107,79,232,0.25)",
            }}
          >
            <Image src="/logo-full.png" alt="AWS Cloud Club NMIET" width={80} height={80} className="rounded-2xl object-cover" priority />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-4xl font-black text-white mb-1 leading-tight tracking-tight"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          AWS Cloud Club
        </motion.h1>
        <motion.p
          className="text-lg font-semibold mb-3"
          style={{ color: "rgba(196,181,253,0.90)" }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.5 }}
        >
          NMIET Chapter
        </motion.p>

        {/* Cycling tech tags */}
        <motion.div
          className="mb-5 h-8 flex items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={activeTag}
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#C4B5FD",
                border: "1px solid rgba(196,181,253,0.30)",
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <Cpu className="h-3.5 w-3.5" />
              {tags[activeTag]}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        <motion.p
          className="text-[15px] leading-relaxed mb-6 max-w-xs"
          style={{ color: "rgba(255,255,255,0.72)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          Empowering the next generation of cloud innovators through hands-on learning, real-world projects &amp; community.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="flex gap-3 w-full max-w-xs"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62 }}
        >
          <motion.a
            href={MEETUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-[#6B4FE8]"
            style={{ background: "#FFFFFF", boxShadow: "0 6px 20px rgba(0,0,0,0.25)" }}
            whileTap={{ scale: 0.94 }}
          >
            <Rocket className="h-4 w-4" />
            Join Club
          </motion.a>
          <motion.button
            onClick={onLearnMore}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white"
            style={{
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.28)",
              backdropFilter: "blur(8px)",
            }}
            whileTap={{ scale: 0.94 }}
          >
            About Us
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </motion.div>

        {/* Member count live badge */}
        {memberCount !== null && (
          <motion.div
            className="mt-5 flex items-center gap-2 rounded-full px-4 py-2"
            style={{
              background: "rgba(80,200,138,0.18)",
              border: "1px solid rgba(80,200,138,0.35)",
            }}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.75, type: "spring" }}
          >
            <motion.div
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: "#50C88A", boxShadow: "0 0 8px #50C88A" }}
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-sm font-bold text-white">{memberCount}+ Members</span>
            <span className="text-xs" style={{ color: "rgba(80,200,138,0.8)" }}>& growing 🚀</span>
          </motion.div>
        )}
      </div>

      {/* ── Stats row ── */}
      <motion.div
        className="relative z-10 w-full px-4 mb-5"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
      >
        <div
          className="grid grid-cols-3 gap-2 rounded-2xl p-4"
          style={{
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.16)",
            backdropFilter: "blur(16px)",
          }}
        >
          {[
            { value: "1+",   label: "Events",   icon: Calendar, color: "#FF9900" },
            { value: "3+",   label: "Projects", icon: Rocket,   color: "#50C88A" },
            { value: "30+",  label: "Team",     icon: Users,    color: "#5BA8D8" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="flex flex-col items-center gap-1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.80 + i * 0.08, type: "spring" }}
            >
              <s.icon className="h-5 w-5 mb-0.5" style={{ color: s.color }} />
              <span className="text-xl font-extrabold text-white">{s.value}</span>
              <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>{s.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── What We Do — horizontal scroll cards ── */}
      <div className="relative z-10 w-full mb-5">
        <p className="px-5 mb-3 text-sm font-bold tracking-widest uppercase" style={{ color: "rgba(196,181,253,0.70)" }}>
          What We Do
        </p>
        <div className="flex gap-3 overflow-x-auto px-5 pb-2 hide-scrollbar">
          {whatWeDo.map((card, i) => (
            <motion.div
              key={card.title}
              className="flex-shrink-0 rounded-2xl p-4"
              style={{
                width: 170,
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.14)",
                backdropFilter: "blur(14px)",
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85 + i * 0.1 }}
              whileTap={{ scale: 0.96 }}
            >
              <div
                className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: card.lightBg, border: `1px solid ${card.color}30` }}
              >
                <card.icon className="h-5 w-5" style={{ color: card.color }} />
              </div>
              <h3 className="text-base font-bold text-white mb-1">{card.title}</h3>
              <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Highlights ── */}
      <div className="relative z-10 w-full px-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Star className="h-4 w-4 text-yellow-300" />
          <span className="text-sm font-bold text-white tracking-wide">Highlights</span>
        </div>
        <div className="space-y-2">
          {highlights.map((h, i) => (
            <motion.div
              key={h}
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + i * 0.06 }}
            >
              <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg,#6B4FE8,#8B6FFF)" }} />
              <span className="text-[12px] font-medium text-white leading-tight">{h}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Quick app links ── */}
      <div className="relative z-10 w-full px-4 mb-8">
        <p className="mb-3 text-sm font-bold tracking-widest uppercase" style={{ color: "rgba(196,181,253,0.70)" }}>
          Explore
        </p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Team",    icon: Users,    color: "#5BA8D8", gradient: "linear-gradient(135deg,#5BA8D8,#4B90C8)" },
            { label: "Events",  icon: Calendar, color: "#FF9900", gradient: "linear-gradient(135deg,#FF9900,#E88800)" },
            { label: "Awards",  icon: Trophy,   color: "#FFB800", gradient: "linear-gradient(135deg,#FFB800,#E89800)" },
            { label: "Docs",    icon: BookOpen, color: "#6B4FE8", gradient: "linear-gradient(135deg,#6B4FE8,#5B3FD8)" },
          ].map((q, i) => (
            <motion.div
              key={q.label}
              className="flex flex-col items-center gap-1.5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95 + i * 0.07 }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                style={{ background: q.gradient, boxShadow: `0 4px 14px ${q.color}40` }}
              >
                <q.icon className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-semibold text-white/70">{q.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-1 pb-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Tap grid icon in taskbar to explore apps</span>
        <motion.div animate={{ y: [0, 4, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
          <ChevronDown className="h-4 w-4" style={{ color: "rgba(255,255,255,0.25)" }} />
        </motion.div>
      </motion.div>
    </div>
  )
}

// ─── Desktop content (unchanged) ─────────────────────────────────────────────
function DesktopHome({ memberCount, onLearnMore }: { memberCount: number | null; onLearnMore?: () => void }) {
  const stats = [
    { label: "Members",  value: memberCount !== null ? `${memberCount}` : "...", icon: Users,    color: "#6B4FE8" },
    { label: "Events",   value: "1+",   icon: Calendar, color: "#FF9900" },
    { label: "Projects", value: "3+",   icon: Rocket,   color: "#50C88A" },
    { label: "Team",     value: "30+",  icon: Zap,      color: "#5BA8D8" },
  ]

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
      {/* ── Hero ── */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-3xl p-8"
        style={{
          background: "linear-gradient(135deg, #6B4FE8 0%, #8B6FFF 60%, #B8A4FF 100%)",
          boxShadow: "8px 8px 24px rgba(107,79,232,0.30), -6px -6px 18px #FFFFFF",
        }}
      >
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)" }} />
        <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%)" }} />

        <div className="relative z-10 flex flex-col items-start gap-5 lg:flex-row lg:items-center">
          <motion.div
            className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl"
            style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.30)" }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring" as const, stiffness: 300 }}
          >
            <Image src="/logo-full.png" alt="AWS Cloud Club NMIET" width={80} height={80} className="rounded-xl object-cover" />
          </motion.div>

          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.90)" }}>
              <Sparkles className="h-3.5 w-3.5" />
              Official Community · NMIET, Talegaon, Pune
            </div>
            <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-white leading-tight">
              AWS Cloud Club
              <span className="block text-2xl font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>
                NMIET Chapter
              </span>
            </h1>
            <p className="mb-5 max-w-lg text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.80)" }}>
              Empowering the next generation of cloud innovators through hands-on learning,
              real-world projects, and a thriving community.
            </p>
            <div className="flex flex-wrap gap-3">
              <motion.a
                href={MEETUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-[#6B4FE8]"
                style={{ background: "#FFFFFF", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
                whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.16)" }}
                whileTap={{ scale: 0.96 }}
              >
                <Rocket className="h-4 w-4" />
                Join the Club
              </motion.a>
              <motion.button
                onClick={onLearnMore}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-2.5 text-sm font-semibold text-white"
                style={{ background: "rgba(255,255,255,0.12)" }}
                whileHover={{ background: "rgba(255,255,255,0.22)", y: -1 }}
                whileTap={{ scale: 0.96 }}
              >
                Learn More
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            className="neu-raised-sm flex flex-col items-start gap-2 rounded-2xl p-5"
            whileHover={{ y: -4, boxShadow: "7px 7px 20px #C2BAF0, -7px -7px 20px #FFFFFF" }}
            transition={{ type: "spring" as const, stiffness: 300 }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${stat.color}18` }}>
              <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-3xl font-extrabold" style={{ color: "#1E1060" }}>{stat.value}</p>
              <p className="text-sm font-medium" style={{ color: "#7B6FC0" }}>{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── What We Do ── */}
      <motion.div variants={item}>
        <h2 className="mb-4 text-xl font-bold" style={{ color: "#1E1060" }}>What We Do</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {whatWeDo.map((card, i) => (
            <motion.div
              key={card.title}
              className="neu-raised-sm rounded-2xl p-5"
              whileHover={{ y: -4 }}
              transition={{ type: "spring" as const, stiffness: 300, delay: i * 0.05 }}
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: card.lightBg }}>
                <card.icon className="h-6 w-6" style={{ color: card.color }} />
              </div>
              <h3 className="mb-2 text-lg font-bold" style={{ color: card.color }}>{card.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#7B6FC0" }}>{card.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Highlights ── */}
      <motion.div variants={item} className="neu-raised-sm rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5" style={{ color: "#FFB800" }} />
          <h2 className="text-xl font-bold" style={{ color: "#1E1060" }}>Our Highlights</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {highlights.map((h, i) => (
            <motion.div
              key={h}
              className="neu-inset-sm flex items-center gap-3 rounded-xl px-4 py-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              <div className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#6B4FE8,#8B6FFF)" }} />
              <span className="text-sm font-medium" style={{ color: "#1E1060" }}>{h}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Quick Start ── */}
      <motion.div
        variants={item}
        className="rounded-2xl p-6 text-center"
        style={{
          background: "linear-gradient(135deg, rgba(107,79,232,0.08), rgba(184,164,255,0.06))",
          border: "1px solid rgba(194,186,240,0.50)",
        }}
      >
        <Sparkles className="mx-auto mb-3 h-8 w-8" style={{ color: "#6B4FE8" }} />
        <h3 className="mb-2 text-lg font-bold" style={{ color: "#1E1060" }}>Explore the Cloud OS</h3>
        <p className="text-sm" style={{ color: "#7B6FC0" }}>
          Use the desktop icons or taskbar to open apps — Team, Events, Projects, Resources, and more.
          Drag windows, resize them, and make this OS your own!
        </p>
      </motion.div>
    </motion.div>
  )
}

// ─── Main export — switches between Mobile and Desktop views ─────────────────
export function HomeApp({ onLearnMore }: { onLearnMore?: () => void }) {
  const { memberCount } = useMeetup()
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  )

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  if (isMobile) {
    return <MobileHero memberCount={memberCount} onLearnMore={onLearnMore} />
  }

  return <DesktopHome memberCount={memberCount} onLearnMore={onLearnMore} />
}
