"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  Cloud, Sparkles, Rocket, Zap, Users, Calendar,
  ArrowRight, Star,
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
  "Official AWS Student Builder Group — est. February 2026",
  "299+ Members on Meetup & Growing",
  "Part of AWS Student Builder Groups Global Network",
  "236+ RSVPs for Our Very First Event",
]


const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } } }

// ─── Mobile Hero — frosted glass, matches desktop style ─────────────────────
function MobileHero({ memberCount, onLearnMore, onLogoClick }: { memberCount: number | null; onLearnMore?: () => void; onLogoClick: () => void }) {
  const stats = [
    { label: "Members",  value: memberCount !== null ? `${memberCount}+` : "299+", icon: Users,    color: "#6B4FE8" },
    { label: "Events",   value: "1+",  icon: Calendar, color: "#FF9900" },
    { label: "Projects", value: "3+",  icon: Rocket,   color: "#50C88A" },
    { label: "Team",     value: "30+", icon: Zap,      color: "#5BA8D8" },
  ]

  return (
    <motion.div
      className="flex flex-col gap-3 p-3 overflow-y-auto custom-scrollbar"
      variants={container} initial="hidden" animate="show"
    >
      {/* ── Hero card ── */}
      <motion.div variants={item} className="bg-white/35 backdrop-blur-sm border border-white/40 shadow-xs rounded-xl p-4">
        <div className="flex items-start gap-3 mb-3">
          <motion.div
            onClick={onLogoClick}
            className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white/60 border border-white/70 cursor-pointer active:scale-95 transition-transform shadow-sm"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring" as const }}
          >
            <Image src="/logo-full.png" alt="AWS Student Builder Group NMIET" width={52} height={52} className="object-contain" unoptimized />
          </motion.div>
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Official AWS Community
              </span>
            </div>
            <h1 className="text-lg font-bold text-indigo-950 leading-tight">AWS Student Builder Group</h1>
            <p className="text-xs font-medium text-indigo-950/50 mt-0.5">NMIET Chapter · Talegaon, Pune</p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-indigo-950/70 mb-4">
          Empowering the next generation of cloud innovators through hands-on learning, real-world projects, and a thriving community.
        </p>

        <div className="flex gap-2">
          <motion.a
            href={MEETUP_URL} target="_blank" rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 bg-[#6B4FE8] text-white rounded-xl py-2.5 text-xs font-semibold"
            whileTap={{ scale: 0.97 }}
          >
            <Rocket className="h-3.5 w-3.5" /> Join the Group
          </motion.a>
          <motion.button
            onClick={onLearnMore}
            className="flex flex-1 items-center justify-center gap-1.5 bg-white/60 border border-white/70 text-indigo-950 rounded-xl py-2.5 text-xs font-semibold"
            whileTap={{ scale: 0.97 }}
          >
            About Us <ArrowRight className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </motion.div>

      {/* ── Stats 2×2 grid ── */}
      <motion.div variants={item} className="grid grid-cols-2 gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white/35 backdrop-blur-sm border border-white/40 shadow-xs rounded-xl p-3.5 flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${stat.color}18` }}>
              <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-indigo-950 leading-none">{stat.value}</p>
              <p className="text-[11px] text-indigo-950/50 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── What We Do ── */}
      <motion.div variants={item} className="bg-white/35 backdrop-blur-sm border border-white/40 shadow-xs rounded-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/30 bg-white/20 px-4 py-2.5">
          <h2 className="text-xs font-semibold text-indigo-950">What We Do</h2>
          <span className="text-[10px] text-indigo-950/50 bg-white/30 px-2 py-0.5 rounded border border-white/20">3 pillars</span>
        </div>
        <div className="p-3 flex flex-col gap-2">
          {whatWeDo.map((card) => (
            <div key={card.title} className="bg-white/50 border border-white/60 rounded-lg p-3 flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: card.lightBg }}>
                <card.icon className="h-4 w-4" style={{ color: card.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold mb-0.5" style={{ color: card.color }}>{card.title}</h3>
                <p className="text-[11px] leading-relaxed text-indigo-950/60">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Highlights ── */}
      <motion.div variants={item} className="bg-white/35 backdrop-blur-sm border border-white/40 shadow-xs rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/30 bg-white/20 px-4 py-2.5">
          <Star className="h-3.5 w-3.5 text-amber-500" />
          <h2 className="text-xs font-semibold text-indigo-950">Highlights</h2>
        </div>
        <div className="p-3 flex flex-col gap-1.5">
          {highlights.map((h, i) => (
            <motion.div
              key={h}
              className="flex items-center gap-2.5 bg-white/50 border border-white/60 rounded-lg px-3 py-2.5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.07 }}
            >
              <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: "#6B4FE8" }} />
              <span className="text-[11px] font-medium text-indigo-950/75 leading-snug">{h}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Explore tip ── */}
      <motion.div
        variants={item}
        className="flex items-center gap-3 bg-indigo-50/60 border border-indigo-100 rounded-xl px-4 py-3 mb-1"
      >
        <Sparkles className="h-4 w-4 text-indigo-400 flex-shrink-0" />
        <p className="text-[11px] text-indigo-950/60">
          Tap the grid on the home screen to explore <span className="font-semibold text-indigo-950/80">Team, Events, Projects</span> and more.
        </p>
      </motion.div>
    </motion.div>
  )
}

// ─── Desktop content ──────────────────────────────────────────────────────────
function DesktopHome({ memberCount, onLearnMore, onLogoClick }: { memberCount: number | null; onLearnMore?: () => void; onLogoClick: () => void }) {
  const stats = [
    { label: "Members",  value: memberCount !== null ? `${memberCount}+` : "299+", icon: Users,    color: "#6B4FE8" },
    { label: "Events",   value: "1+",   icon: Calendar, color: "#FF9900" },
    { label: "Projects", value: "3+",   icon: Rocket,   color: "#50C88A" },
    { label: "Team",     value: "30+",  icon: Zap,      color: "#5BA8D8" },
  ]

  return (
    <motion.div
      className="flex flex-col gap-4 p-1 overflow-y-auto custom-scrollbar"
      style={{ minHeight: "520px" }}
      variants={container} initial="hidden" animate="show"
    >
      {/* ── Hero header ── */}
      <motion.div variants={item} className="bg-white/35 backdrop-blur-sm border border-white/40 shadow-xs rounded-xl p-6">
        <div className="flex flex-col lg:flex-row items-start gap-5">
          <motion.div
            onClick={onLogoClick}
            className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-white/60 border border-white/70 cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-sm"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring" as const }}
          >
            <Image src="/logo-full.png" alt="AWS Student Builder Group NMIET" width={68} height={68} className="object-contain" unoptimized />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Official AWS Community
              </span>
              <span className="text-[10px] text-indigo-950/40 font-medium">NMIET, Talegaon, Pune</span>
            </div>
            <h1 className="text-2xl font-bold text-indigo-950 leading-tight">
              AWS Student Builder Group
            </h1>
            <p className="text-sm font-medium text-indigo-950/50 mt-0.5">NMIET Chapter</p>
            <p className="mt-2.5 text-sm leading-relaxed text-indigo-950/70 max-w-xl">
              Empowering the next generation of cloud innovators through hands-on learning, real-world projects, and a thriving community.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <motion.a
                href={MEETUP_URL} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#6B4FE8] hover:bg-[#5B3FD8] text-white rounded-lg px-5 py-2 text-sm font-semibold transition-colors"
                whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              >
                <Rocket className="h-4 w-4" /> Join the Group
              </motion.a>
              <motion.button
                onClick={onLearnMore}
                className="inline-flex items-center gap-2 bg-white/60 hover:bg-white/80 border border-white/70 text-indigo-950 rounded-lg px-5 py-2 text-sm font-semibold transition-colors"
                whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              >
                Learn More <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <motion.div variants={item} className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white/35 backdrop-blur-sm border border-white/40 shadow-xs rounded-xl p-4 flex flex-col gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${stat.color}18` }}>
              <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-950 leading-none">{stat.value}</p>
              <p className="text-xs text-indigo-950/50 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── What We Do ── */}
      <motion.div variants={item} className="bg-white/35 backdrop-blur-sm border border-white/40 shadow-xs rounded-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/30 bg-white/20 px-4 py-3">
          <h2 className="text-xs font-semibold text-indigo-950">What We Do</h2>
          <span className="text-[10px] text-indigo-950/50 bg-white/30 px-2 py-0.5 rounded border border-white/20">3 pillars</span>
        </div>
        <div className="p-5 grid gap-4 md:grid-cols-3">
          {whatWeDo.map((card) => (
            <motion.div
              key={card.title}
              className="bg-white/50 border border-white/60 rounded-lg p-4"
              whileHover={{ y: -2 }}
              transition={{ type: "spring" as const, stiffness: 300 }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl mb-3" style={{ background: card.lightBg }}>
                <card.icon className="h-5 w-5" style={{ color: card.color }} />
              </div>
              <h3 className="text-sm font-bold mb-1.5" style={{ color: card.color }}>{card.title}</h3>
              <p className="text-xs leading-relaxed text-indigo-950/60">{card.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Highlights ── */}
      <motion.div variants={item} className="bg-white/35 backdrop-blur-sm border border-white/40 shadow-xs rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/30 bg-white/20 px-4 py-3">
          <Star className="h-3.5 w-3.5 text-amber-500" />
          <h2 className="text-xs font-semibold text-indigo-950">Highlights</h2>
        </div>
        <div className="p-4 grid gap-2 sm:grid-cols-2">
          {highlights.map((h, i) => (
            <motion.div
              key={h}
              className="flex items-center gap-3 bg-white/50 border border-white/60 rounded-lg px-4 py-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.07 }}
            >
              <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: "#6B4FE8" }} />
              <span className="text-xs font-medium text-indigo-950/75 leading-snug">{h}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Explore tip ── */}
      <motion.div
        variants={item}
        className="flex items-center gap-3 bg-indigo-50/60 border border-indigo-100 rounded-xl px-5 py-4"
      >
        <Sparkles className="h-5 w-5 text-indigo-400 flex-shrink-0" />
        <p className="text-xs text-indigo-950/60">
          Open <span className="font-semibold text-indigo-950/80">Team, Events, Projects, Resources</span> and more from the taskbar or desktop icons.
        </p>
      </motion.div>
    </motion.div>
  )
}

// ─── Main export — switches between Mobile and Desktop views ─────────────────
export function HomeApp({ onLearnMore, forceMobileUI }: { onLearnMore?: () => void; forceMobileUI?: boolean }) {
  const { memberCount } = useMeetup()
  const [isMobile, setIsMobile] = useState(() =>
    forceMobileUI || (typeof window !== "undefined" ? window.innerWidth < 768 : false)
  )
  const [clickCount, setClickCount] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleLogoClick = () => {
    const now = Date.now()
    if (now - lastClickTime < 1000) {
      const nextCount = clickCount + 1
      if (nextCount === 5) {
        setShowConfetti(true)
        setShowToast(true)
        setClickCount(0)
        setTimeout(() => setShowConfetti(false), 3000)
        setTimeout(() => setShowToast(false), 5000)
      } else {
        setClickCount(nextCount)
      }
    } else {
      setClickCount(1)
    }
    setLastClickTime(now)
  }

  useEffect(() => {
    if (forceMobileUI) return
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [forceMobileUI])

  const colors = ["#FF9900", "#6B4FE8", "#B8A4FF", "#50C88A", "#5BA8D8", "#FF3E3E"];

  return (
    <>
      {isMobile ? (
        <MobileHero memberCount={memberCount} onLearnMore={onLearnMore} onLogoClick={handleLogoClick} />
      ) : (
        <DesktopHome memberCount={memberCount} onLearnMore={onLearnMore} onLogoClick={handleLogoClick} />
      )}

      {/* Confetti Particle Burst */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {Array.from({ length: 80 }).map((_, i) => {
              const color = colors[i % colors.length];
              const angle = Math.random() * Math.PI * 2;
              const distance = 80 + Math.random() * 250;
              const x = Math.cos(angle) * distance;
              const y = Math.sin(angle) * distance - 100;
              const rotate = Math.random() * 360;
              const scale = 0.4 + Math.random() * 0.8;
              return (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-1/2 w-3 h-3 rounded-xs"
                  style={{ backgroundColor: color }}
                  initial={{ scale: 0, rotate: 0, opacity: 1, x: 0, y: 0 }}
                  animate={{
                    scale: [0, scale, 0],
                    rotate: [0, rotate],
                    opacity: [1, 1, 0],
                    x: x,
                    y: y + 200,
                  }}
                  transition={{
                    duration: 1.5 + Math.random() * 1.5,
                    ease: "easeOut",
                  }}
                />
              )
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] rounded-2xl px-5 py-3.5 text-sm font-semibold text-white shadow-xl text-center"
            style={{
              background: "linear-gradient(135deg, #1E1060, #6B4FE8)",
              border: "1px solid rgba(168, 85, 247, 0.4)",
              boxShadow: "0 8px 32px rgba(107, 79, 232, 0.4)",
            }}
            initial={{ opacity: 0, y: 32, scale: 0.92, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 16, scale: 0.95, x: "-50%" }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
          >
            You found us! True builders are always curious 🚀
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
