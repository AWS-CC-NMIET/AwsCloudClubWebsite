// components/apps/team-app.tsx
// Team — the club roster as F1-style driver cards, grouped by team
// ("constructor"), with a broadcast-style profile view.

"use client"

import React, { useEffect, useMemo, useState } from "react"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"
import {
  Activity,
  ArchiveRestore,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Box,
  BrainCircuit,
  Cloud,
  Container,
  Cpu,
  Crown,
  Cylinder,
  Database,
  Eye,
  FileCode,
  Flag,
  Gauge,
  GitCommitHorizontal,
  GitMerge,
  Github,
  Globe,
  Grid3x3,
  Key,
  KeyRound,
  Layers,
  Linkedin,
  Lock,
  Mail,
  MemoryStick,
  Network,
  Route,
  ScanSearch,
  Search,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  Waves,
  Webhook,
  Workflow,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { TEAM_GROUPS, TEAM_LIVERY, isLeadRole, teamGroupOf, type TeamGroup, type TeamMember } from "@/lib/club-content"
import { useTeam } from "@/lib/club-data"
import { cn, sanitizeUrl } from "@/lib/utils"
import { GlowCard } from "./shared/motion"

// ── AWS service "sponsors" ───────────────────────────────────────────────────

const SERVICE_ICONS: Record<string, LucideIcon> = {
  "AWS Cloud": Cloud,
  "Amazon EC2": Server,
  "Amazon S3": Database,
  "AWS Lambda": Zap,
  "Amazon DynamoDB": Layers,
  "Amazon RDS": Cylinder,
  "AWS Cognito": Shield,
  "Amazon CloudFront": Globe,
  "Amazon Route 53": Route,
  "AWS IAM": KeyRound,
  "Amazon ECS": Box,
  "Amazon EKS": Grid3x3,
  "AWS Amplify": Sparkles,
  "AWS CodePipeline": GitCommitHorizontal,
  "Amazon SageMaker": Cpu,
  "Amazon EventBridge": Activity,
  "Amazon SNS": Bell,
  "Amazon SQS": Mail,
  "AWS CloudTrail": Eye,
  "Amazon CloudWatch": Gauge,
  "AWS Secrets Manager": Lock,
  "Amazon VPC": Network,
  "AWS CloudFormation": FileCode,
  "Amazon Aurora": Database,
  "Amazon Redshift": BarChart3,
  "AWS Step Functions": GitMerge,
  "AWS KMS": Key,
  "Amazon API Gateway": Webhook,
  "AWS Fargate": Container,
  "Amazon Bedrock": BrainCircuit,
  "Amazon Kinesis": Waves,
  "AWS Glue": Workflow,
  "Amazon Athena": ScanSearch,
  "AWS WAF": ShieldCheck,
  "Amazon ElastiCache": MemoryStick,
  "AWS Backup": ArchiveRestore,
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function splitName(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return { first: "", last: parts[0] }
  return { first: parts[0], last: parts[parts.length - 1] }
}

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(p => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

const carNumber = (m: TeamMember) => String(m.order ?? 0).padStart(2, "0")

interface Driver {
  member: TeamMember
  team: TeamGroup
  lead: boolean
}

type Filter = "All" | TeamGroup

// ── App ──────────────────────────────────────────────────────────────────────

export function TeamApp({ payload }: { payload?: { focusId?: string } }) {
  const team = useTeam()
  const [filter, setFilter] = useState<Filter>("All")
  const [query, setQuery] = useState("")
  const [openId, setOpenId] = useState<string | null>(null)

  const drivers = useMemo<Driver[]>(
    () => team.data.map(member => ({ member, team: teamGroupOf(member.role), lead: isLeadRole(member.role) })),
    [team.data]
  )

  const teams = useMemo(
    () =>
      TEAM_GROUPS.map(g => ({ id: g, drivers: drivers.filter(d => d.team === g) })).filter(t => t.drivers.length > 0),
    [drivers]
  )

  const q = query.trim().toLowerCase()
  const matches = (d: Driver) =>
    !q ||
    d.member.name.toLowerCase().includes(q) ||
    d.member.role.toLowerCase().includes(q) ||
    d.member.skills.some(s => s.toLowerCase().includes(q))

  const visibleTeams = teams
    .filter(t => filter === "All" || t.id === filter)
    .map(t => ({ ...t, drivers: t.drivers.filter(matches) }))
    .filter(t => t.drivers.length > 0)

  const ordered = visibleTeams.flatMap(t => t.drivers)
  const openIndex = ordered.findIndex(d => d.member.id === openId)
  const open = openIndex >= 0 ? ordered[openIndex] : drivers.find(d => d.member.id === openId)

  // Opened from Spotlight with a specific person.
  useEffect(() => {
    if (payload?.focusId) {
      setFilter("All")
      setQuery("")
      setOpenId(payload.focusId)
    }
  }, [payload?.focusId])

  const step = (dir: 1 | -1) => {
    if (!ordered.length) return
    const i = openIndex < 0 ? 0 : (openIndex + dir + ordered.length) % ordered.length
    setOpenId(ordered[i].member.id)
  }

  return (
    <div className="@container relative flex h-full w-full flex-col overflow-hidden text-(--os-text)">
      <LayoutGroup>
        <div className="flex-1 overflow-y-auto">
          <GridHeader total={drivers.length} teams={teams.length} />

          {/* ── Filters ───────────────────────────────────────────────────── */}
          <div className="sticky top-0 z-20 border-b border-(--win-divider) bg-(--toolbar-bg) px-4 py-2.5 backdrop-blur-xl backdrop-saturate-150 @2xl:px-6">
            <div className="flex flex-col gap-2.5 @2xl:flex-row @2xl:items-center">
              <div className="relative @2xl:w-64">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-(--os-text-dim)" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search name, role or skill"
                  aria-label="Search the team"
                  className="w-full rounded-full border border-(--win-divider) bg-white/50 py-1.5 pl-8 pr-3 text-[13px] outline-none backdrop-blur placeholder:text-(--os-text-dim) focus:border-(--accent) dark:bg-white/[0.06]"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 @3xl:flex-wrap">
                <TeamChip label="All" count={drivers.length} active={filter === "All"} onClick={() => setFilter("All")} />
                {teams.map(t => (
                  <TeamChip
                    key={t.id}
                    label={TEAM_LIVERY[t.id].name}
                    color={TEAM_LIVERY[t.id].color}
                    count={t.drivers.length}
                    active={filter === t.id}
                    onClick={() => setFilter(t.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Grid ──────────────────────────────────────────────────────── */}
          <div className="space-y-10 px-4 pb-10 pt-6 @2xl:px-6">
            {visibleTeams.length === 0 && (
              <p className="py-16 text-center text-sm text-(--os-text-dim)">No one matches “{query}”.</p>
            )}
            {visibleTeams.map(t => (
              <section key={t.id}>
                <ConstructorHeader team={t.id} drivers={t.drivers} />
                <motion.div
                  className={cn(
                    "mt-4 grid gap-4",
                    t.id === "Captain" ? "max-w-3xl grid-cols-1" : "grid-cols-2 @2xl:grid-cols-3 @4xl:grid-cols-4 @6xl:grid-cols-5"
                  )}
                  initial="hidden"
                  animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.045 } } }}
                >
                  {t.drivers.map(d => (
                    <motion.div
                      key={d.member.id}
                      variants={{
                        hidden: { opacity: 0, y: 30, rotate: -2, scale: 0.94 },
                        show: { opacity: 1, y: 0, rotate: 0, scale: 1, transition: { type: "spring", stiffness: 240, damping: 22 } },
                      }}
                    >
                      <DriverCard
                        driver={d}
                        hero={t.id === "Captain"}
                        tagline={t.id === "Captain" ? `Leading ${drivers.length - 1} builders across ${teams.length - 1} teams` : undefined}
                        onOpen={() => setOpenId(d.member.id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {open && <DriverProfile key="profile" driver={open} onClose={() => setOpenId(null)} onStep={step} />}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  )
}

// ── Header ───────────────────────────────────────────────────────────────────

function GridHeader({ total, teams }: { total: number; teams: number }) {
  return (
    <div className="relative overflow-hidden px-5 pb-6 pt-7 @2xl:px-6">
      {/* Speed lines */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60">
        {[18, 34, 52, 70].map((top, i) => (
          <motion.span
            key={top}
            className="absolute h-px w-1/2 bg-gradient-to-r from-transparent via-[#FF9900] to-transparent"
            style={{ top: `${top}%` }}
            initial={{ x: "-60%", opacity: 0 }}
            animate={{ x: "220%", opacity: [0, 1, 0] }}
            transition={{ duration: 2.4 + i * 0.5, repeat: Infinity, delay: i * 0.7, ease: "easeInOut" }}
          />
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[#FF9900]"
      >
        <Flag className="size-3.5" /> AWS SBG NMIET
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 14, skewX: -8 }}
        animate={{ opacity: 1, y: 0, skewX: -8 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative mt-1 text-4xl font-black uppercase italic leading-none tracking-tight @2xl:text-6xl"
      >
        The 2026 Grid
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="relative mt-2 text-[13px] text-(--os-text-dim)"
      >
        {total} builders across {teams} teams — pick a card for the driver profile.
      </motion.p>
      {/* Checkered strip */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-1.5 opacity-80"
        style={{
          backgroundImage: "linear-gradient(45deg, currentColor 25%, transparent 25%, transparent 75%, currentColor 75%), linear-gradient(45deg, currentColor 25%, transparent 25%, transparent 75%, currentColor 75%)",
          backgroundSize: "12px 12px",
          backgroundPosition: "0 0, 6px 6px",
          color: "var(--os-text)",
          maskImage: "linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent)",
        }}
      />
    </div>
  )
}

function TeamChip({ label, count, color, active, onClick }: { label: string; count: number; color?: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex shrink-0 items-center gap-1.5 overflow-hidden rounded-full px-3 py-1 text-[12px] font-bold uppercase italic tracking-wide transition-colors",
        active ? "text-white" : "bg-black/[0.05] text-(--os-text) hover:bg-black/10 dark:bg-white/[0.07] dark:hover:bg-white/[0.12]"
      )}
    >
      {active && (
        <motion.span
          layoutId="team-chip-active"
          className="absolute inset-0 rounded-full"
          style={{ background: color ?? "var(--accent)" }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      {color && !active && <span className="relative size-2 rounded-full" style={{ background: color }} />}
      <span className="relative">{label}</span>
      <span className="relative opacity-70 tabular-nums">{count}</span>
    </button>
  )
}

function ConstructorHeader({ team, drivers }: { team: TeamGroup; drivers: Driver[] }) {
  const livery = TEAM_LIVERY[team]
  const lead = drivers.find(d => d.lead)
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="flex items-end gap-3"
    >
      <span className="h-9 w-1.5 -skew-x-12 rounded-sm" style={{ background: livery.color }} />
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl font-black uppercase italic leading-none tracking-tight">
          {team === "Captain" ? "Team Captain" : `${livery.name} Team`}
        </h2>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-(--os-text-dim)">
          {drivers.length} {drivers.length === 1 ? "member" : "members"}
          {lead && team !== "Captain" && <> · Lead: {lead.member.name}</>}
        </p>
      </div>
    </motion.div>
  )
}

// ── Driver card ──────────────────────────────────────────────────────────────

function Livery({ team }: { team: TeamGroup }) {
  const livery = TEAM_LIVERY[team]
  return (
    <>
      <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${livery.color} 0%, ${livery.deep} 58%, #09090d 100%)` }} />
      <div
        className="absolute inset-0 opacity-25 mix-blend-overlay"
        style={{
          backgroundImage: "repeating-linear-gradient(115deg, rgba(255,255,255,0.5) 0 2px, transparent 2px 18px)",
          animation: "livery-drift 6s linear infinite",
        }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: "radial-gradient(rgba(0,0,0,0.6) 1px, transparent 1.2px)", backgroundSize: "5px 5px" }}
      />
    </>
  )
}

function Portrait({ member, team, large = false }: { member: TeamMember; team: TeamGroup; large?: boolean }) {
  if (member.photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={member.photoUrl}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-x-0 bottom-0 h-[86%] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
        style={{ maskImage: "linear-gradient(to bottom, #000 62%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, #000 62%, transparent 100%)" }}
      />
    )
  }
  return (
    <div className="absolute inset-0 flex items-center justify-center pb-[22%]">
      <span
        className={cn("font-black italic tracking-tighter text-white/90 drop-shadow-[0_6px_20px_rgba(0,0,0,0.45)]", large ? "text-8xl" : "text-6xl @2xl:text-7xl")}
        style={{ textShadow: `0 0 40px ${TEAM_LIVERY[team].color}` }}
      >
        {initials(member.name)}
      </span>
    </div>
  )
}

function DriverCard({ driver, hero = false, tagline, onOpen }: { driver: Driver; hero?: boolean; tagline?: string; onOpen: () => void }) {
  const { member, team, lead } = driver
  const livery = TEAM_LIVERY[team]
  const { first, last } = splitName(member.name)
  const Sponsor = SERVICE_ICONS[member.awsService ?? ""] ?? Cloud

  return (
    <GlowCard tilt={hero ? 4 : true} className="group rounded-2xl">
      <motion.button
        layoutId={`driver-${member.id}`}
        onClick={onOpen}
        aria-label={`${member.name}, ${member.role}`}
        className={cn(
          "relative block w-full overflow-hidden rounded-2xl text-left text-white outline-none ring-white/70 focus-visible:ring-2",
          hero ? "aspect-[5/4] @xl:aspect-[16/7]" : "aspect-[4/5]"
        )}
        style={{ boxShadow: `0 20px 44px -22px ${livery.color}` }}
      >
        <Livery team={team} />

        {/* Race number watermark */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute -right-2 -top-3 select-none font-black italic leading-none text-transparent transition-transform duration-500 group-hover:-translate-x-2",
            hero ? "text-[7.5rem] @xl:right-[40%] @xl:top-auto @xl:-bottom-8 @xl:text-[13rem]" : "text-[7.5rem]"
          )}
          style={{ WebkitTextStroke: "2px rgba(255,255,255,0.28)" }}
        >
          {carNumber(member)}
        </span>

        <div className={cn("absolute inset-0", hero && "@xl:left-auto @xl:w-[48%]")}>
          <Portrait member={member} team={team} large={hero} />
        </div>

        {/* Light sweep on hover */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 group-hover:opacity-100 group-hover:[animation:shine-sweep_0.9s_ease-out]"
        />

        {/* Top row */}
        <div className="absolute left-3 right-3 top-3 flex items-start justify-between">
          <span className="rounded-md bg-black/35 px-1.5 py-0.5 text-[11px] font-black italic tracking-wider backdrop-blur-sm">
            #{carNumber(member)}
          </span>
          {lead && (
            <span className="flex items-center gap-1 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-black uppercase italic tracking-wider text-black">
              {team === "Captain" ? <Crown className="size-3 text-[#F5B700]" /> : <Flag className="size-3" />}
              {team === "Captain" ? "Captain" : "Lead"}
            </span>
          )}
        </div>

        {/* Name plate */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent px-3 pb-3 pt-8",
            hero && "@xl:right-auto @xl:top-0 @xl:flex @xl:w-[60%] @xl:flex-col @xl:justify-end @xl:bg-gradient-to-r @xl:from-black/60 @xl:via-black/25 @xl:p-7"
          )}
        >
          <span className={cn("mb-1.5 block h-0.5 w-8 -skew-x-12", hero && "@xl:mb-3 @xl:h-1 @xl:w-14")} style={{ background: livery.color }} />
          {first && <p className={cn("truncate text-[12px] font-semibold leading-tight text-white/80", hero && "@xl:text-lg")}>{first}</p>}
          <p
            className={cn(
              "truncate font-black uppercase italic leading-none tracking-tight",
              last.length > 9 ? "text-base @2xl:text-xl" : "text-xl @2xl:text-2xl",
              hero && "@xl:text-6xl"
            )}
          >
            {last}
          </p>
          <p className={cn("mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65", hero && "@xl:mt-2 @xl:text-[12px]")}>{member.role}</p>
          {tagline && <p className="mt-1 hidden text-[12px] text-white/70 @xl:block">{tagline}</p>}
          <p className="mt-1.5 flex items-center gap-1 truncate text-[10px] text-white/55">
            <Sponsor className="size-3 shrink-0" /> {member.awsService || "AWS Cloud"}
          </p>
        </div>
      </motion.button>
    </GlowCard>
  )
}

// ── Profile ──────────────────────────────────────────────────────────────────

function DriverProfile({ driver, onClose, onStep }: { driver: Driver; onClose: () => void; onStep: (dir: 1 | -1) => void }) {
  const { member, team, lead } = driver
  const livery = TEAM_LIVERY[team]
  const { first, last } = splitName(member.name)
  const Sponsor = SERVICE_ICONS[member.awsService ?? ""] ?? Cloud
  const github = member.github ? sanitizeUrl(member.github) : ""
  const linkedin = member.linkedin ? sanitizeUrl(member.linkedin.startsWith("http") ? member.linkedin : `https://${member.linkedin}`) : ""

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowRight") onStep(1)
      else if (e.key === "ArrowLeft") onStep(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, onStep])

  return (
    <motion.div
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/45 p-4 backdrop-blur-md @2xl:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${member.name} profile`}
    >
      <div className="relative flex max-h-full w-full max-w-3xl flex-col gap-5 overflow-y-auto @2xl:flex-row" onClick={e => e.stopPropagation()}>
        {/* Card (shared-element transition from the grid) */}
        <motion.div
          layoutId={`driver-${member.id}`}
          className="relative aspect-[4/5] w-full max-w-[13rem] shrink-0 self-center overflow-hidden rounded-3xl text-white shadow-2xl @2xl:max-w-[19rem] @2xl:self-start"
        >
          <Livery team={team} />
          <span
            aria-hidden="true"
            className="absolute -right-3 -top-4 select-none text-[10rem] font-black italic leading-none text-transparent"
            style={{ WebkitTextStroke: "2px rgba(255,255,255,0.3)" }}
          >
            {carNumber(member)}
          </span>
          <Portrait member={member} team={team} large />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-4 pb-4 pt-10">
            <p className="text-sm font-semibold text-white/80">{first}</p>
            <p className="text-3xl font-black uppercase italic leading-none tracking-tight">{last}</p>
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.05 }}
          className="glass-strong rim flex-1 rounded-3xl p-5 text-(--os-text) @2xl:p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: livery.color }}>
                <span className="h-3 w-1 -skew-x-12" style={{ background: livery.color }} />
                {team === "Captain" ? "Team Captain" : `${livery.name} Team`}
                {lead && team !== "Captain" && " · Lead"}
              </p>
              <h2 className="mt-1.5 text-2xl font-black leading-tight">{member.name}</h2>
              <p className="text-[13px] text-(--os-text-dim)">{member.role}</p>
            </div>
            <button onClick={onClose} aria-label="Close profile" className="rounded-full bg-black/5 p-1.5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20">
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <Stat label="Car no." value={`#${carNumber(member)}`} />
            <Stat label="Constructor" value={livery.name} />
            <div className="col-span-2 flex items-center gap-2.5 rounded-xl bg-black/[0.04] px-3 py-2.5 dark:bg-white/[0.06]">
              <Sponsor className="size-4 shrink-0" style={{ color: livery.color }} />
              <div className="min-w-0 leading-tight">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-(--os-text-dim)">Powered by</p>
                <p className="truncate text-[13px] font-semibold">{member.awsService || "AWS Cloud"}</p>
              </div>
            </div>
          </div>

          {member.skills.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-(--os-text-dim)">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {member.skills.map((s, i) => (
                  <motion.span
                    key={s}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + i * 0.05 }}
                    className="rounded-md px-2 py-0.5 text-[12px] font-semibold text-white"
                    style={{ background: livery.color }}
                  >
                    {s}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {member.email && <ProfileLink href={`mailto:${member.email}`} icon={Mail} label="Email" />}
            {linkedin && linkedin !== "#" && <ProfileLink href={linkedin} icon={Linkedin} label="LinkedIn" />}
            {github && github !== "#" && <ProfileLink href={github} icon={Github} label="GitHub" />}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-(--win-divider) pt-4">
            <button onClick={() => onStep(-1)} className="flex items-center gap-1 text-[12px] font-semibold text-(--os-text-dim) hover:text-(--os-text)">
              <ArrowLeft className="size-4" /> Previous
            </button>
            <span className="hidden text-[11px] text-(--os-text-dim) @lg:inline">Use ← → to browse</span>
            <button onClick={() => onStep(1)} className="flex items-center gap-1 text-[12px] font-semibold text-(--os-text-dim) hover:text-(--os-text)">
              Next <ArrowRight className="size-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/[0.04] px-3 py-2.5 dark:bg-white/[0.06]">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-(--os-text-dim)">{label}</p>
      <p className="text-lg font-black italic leading-tight">{value}</p>
    </div>
  )
}

function ProfileLink({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <a
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 rounded-full bg-black/[0.05] px-3 py-1.5 text-[12px] font-semibold transition-colors hover:bg-(--accent) hover:text-white dark:bg-white/[0.08]"
    >
      <Icon className="size-3.5" /> {label}
    </a>
  )
}
