"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Cloud, Sparkles, Rocket, Zap, Users, Calendar, ArrowRight, Star } from "lucide-react"

const stats = [
  { label: "Members",   value: "150+", icon: Users,    color: "#6B4FE8" },
  { label: "Events",    value: "25+",  icon: Calendar, color: "#FF9900" },
  { label: "Projects",  value: "40+",  icon: Rocket,   color: "#50C88A" },
  { label: "Workshops", value: "30+",  icon: Zap,      color: "#5BA8D8" },
]

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
  "AWS DeepRacer Regional Champions 2024",
  "AWS Community Builder Recognition",
  "100+ AWS Certifications Collectively",
  "Best Tech Club Award — NMIET",
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden:  { opacity: 0, y: 20 },
  show:    { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } },
}

export function HomeApp() {
  return (
    <motion.div
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* ── Hero ── */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-3xl p-8"
        style={{
          background: "linear-gradient(135deg, #6B4FE8 0%, #8B6FFF 60%, #B8A4FF 100%)",
          boxShadow: "8px 8px 24px rgba(107,79,232,0.30), -6px -6px 18px #FFFFFF",
        }}
      >
        {/* Decorative orbs */}
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)" }} />
        <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%)" }} />

        <div className="relative z-10 flex flex-col items-start gap-5 lg:flex-row lg:items-center">
          {/* Logo */}
          <motion.div
            className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl"
            style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.30)" }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring" as const, stiffness: 300 }}
          >
            <Image
              src="/logo-full.png"
              alt="AWS Cloud Club NMIET"
              width={80}
              height={80}
              className="rounded-xl object-cover"
            />
          </motion.div>

          {/* Text */}
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.90)" }}>
              <Sparkles className="h-3.5 w-3.5" />
              Official Community · NMIET, Navi Mumbai
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
              <motion.button
                className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-[#6B4FE8]"
                style={{ background: "#FFFFFF", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
                whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.16)" }}
                whileTap={{ scale: 0.96 }}
              >
                <Rocket className="h-4 w-4" />
                Join the Club
              </motion.button>
              <motion.button
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
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="neu-raised-sm flex flex-col items-start gap-2 rounded-2xl p-5"
            whileHover={{ y: -4, boxShadow: "7px 7px 20px #C2BAF0, -7px -7px 20px #FFFFFF" }}
            transition={{ type: "spring" as const, stiffness: 300 }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: `${stat.color}18` }}
            >
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
              <div
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: card.lightBg }}
              >
                <card.icon className="h-6 w-6" style={{ color: card.color }} />
              </div>
              <h3 className="mb-2 text-lg font-bold" style={{ color: card.color }}>{card.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#7B6FC0" }}>{card.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Highlights ── */}
      <motion.div
        variants={item}
        className="neu-raised-sm rounded-2xl p-6"
      >
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
              <div
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#6B4FE8,#8B6FFF)" }}
              />
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
        <h3 className="mb-2 text-lg font-bold" style={{ color: "#1E1060" }}>
          Explore the Cloud OS
        </h3>
        <p className="text-sm" style={{ color: "#7B6FC0" }}>
          Use the desktop icons or taskbar to open apps — Team, Events, Projects, Resources, and more.
          Drag windows, resize them, and make this OS your own!
        </p>
      </motion.div>
    </motion.div>
  )
}
