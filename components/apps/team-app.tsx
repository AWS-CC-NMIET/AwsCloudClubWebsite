// components/apps/team-app.tsx
// Team — a Contacts.app-style roster of the AWS SBG NMIET core team

"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  Activity,
  BarChart3,
  Bell,
  Box,
  ChevronRight,
  Cloud,
  Cpu,
  Cylinder,
  Database,
  Eye,
  FileCode,
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
  Network,
  Route,
  Search,
  Server,
  Shield,
  Sparkles,
  Users,
  UsersRound,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { TEAM_GROUPS, teamGroupOf, type TeamGroup, type TeamMember } from "@/lib/club-content"
import { useTeam } from "@/lib/club-data"
import { sanitizeUrl, cn } from "@/lib/utils"
import { AppShell, BackButton, ChipBar, EmptyState, Sidebar, SidebarItem, SidebarSection, Toolbar } from "./shared/mac-ui"

// ── AWS-service avatars (each member is "running" as an AWS service) ─────────

const SERVICE_STYLES: Record<string, { colors: [string, string]; icon: LucideIcon }> = {
  "AWS Cloud": { colors: ["#f97316", "#f59e0b"], icon: Cloud },
  "Amazon EC2": { colors: ["#ea580c", "#d97706"], icon: Server },
  "Amazon S3": { colors: ["#ef4444", "#f97316"], icon: Database },
  "AWS Lambda": { colors: ["#f59e0b", "#eab308"], icon: Zap },
  "Amazon DynamoDB": { colors: ["#2563eb", "#06b6d4"], icon: Layers },
  "Amazon RDS": { colors: ["#3b82f6", "#6366f1"], icon: Cylinder },
  "AWS Cognito": { colors: ["#9333ea", "#4f46e5"], icon: Shield },
  "Amazon CloudFront": { colors: ["#06b6d4", "#3b82f6"], icon: Globe },
  "Amazon Route 53": { colors: ["#4f46e5", "#2563eb"], icon: Route },
  "AWS IAM": { colors: ["#dc2626", "#f43f5e"], icon: KeyRound },
  "Amazon ECS": { colors: ["#f97316", "#ef4444"], icon: Box },
  "Amazon EKS": { colors: ["#ea580c", "#dc2626"], icon: Grid3x3 },
  "AWS Amplify": { colors: ["#f59e0b", "#f97316"], icon: Sparkles },
  "AWS CodePipeline": { colors: ["#f43f5e", "#ef4444"], icon: GitCommitHorizontal },
  "Amazon SageMaker": { colors: ["#14b8a6", "#06b6d4"], icon: Cpu },
  "Amazon EventBridge": { colors: ["#ec4899", "#f43f5e"], icon: Activity },
  "Amazon SNS": { colors: ["#a855f7", "#ec4899"], icon: Bell },
  "Amazon SQS": { colors: ["#9333ea", "#db2777"], icon: Mail },
  "AWS CloudTrail": { colors: ["#2563eb", "#9333ea"], icon: Eye },
  "Amazon CloudWatch": { colors: ["#10b981", "#14b8a6"], icon: Gauge },
  "AWS Secrets Manager": { colors: ["#059669", "#22c55e"], icon: Lock },
  "Amazon VPC": { colors: ["#6366f1", "#a855f7"], icon: Network },
  "AWS CloudFormation": { colors: ["#f97316", "#eab308"], icon: FileCode },
  "Amazon Aurora": { colors: ["#3b82f6", "#22d3ee"], icon: Database },
  "Amazon Redshift": { colors: ["#4f46e5", "#0891b2"], icon: BarChart3 },
  "AWS Step Functions": { colors: ["#db2777", "#9333ea"], icon: GitMerge },
  "AWS KMS": { colors: ["#e11d48", "#fb7185"], icon: Key },
}

function serviceStyle(service?: string) {
  return SERVICE_STYLES[service || "AWS Cloud"] ?? SERVICE_STYLES["AWS Cloud"]
}

function ServiceAvatar({ member, size = 40 }: { member: TeamMember; size?: number }) {
  const { colors, icon: Icon } = serviceStyle(member.awsService)
  if (member.photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={member.photoUrl}
        alt=""
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full text-white shadow-sm"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
      title={member.awsService}
    >
      <Icon style={{ width: size * 0.48, height: size * 0.48 }} />
    </div>
  )
}

type GroupFilter = "All" | TeamGroup

export function TeamApp({ payload }: { payload?: { focusId?: string } }) {
  const team = useTeam()
  const [group, setGroup] = useState<GroupFilter>("All")
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string>(team.data[0]?.id ?? "")
  const [detailOpen, setDetailOpen] = useState(false)

  const groups = useMemo(() => {
    const counts = new Map<TeamGroup, number>()
    for (const m of team.data) counts.set(teamGroupOf(m.role), (counts.get(teamGroupOf(m.role)) ?? 0) + 1)
    return TEAM_GROUPS.filter(g => counts.has(g)).map(g => ({ id: g, label: g, count: counts.get(g) ?? 0 }))
  }, [team.data])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return team.data.filter(m => {
      if (group !== "All" && teamGroupOf(m.role) !== group) return false
      if (!q) return true
      return (
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.skills.some(s => s.toLowerCase().includes(q))
      )
    })
  }, [team.data, group, query])

  const selected = team.data.find(m => m.id === selectedId) ?? visible[0] ?? team.data[0]

  const select = (id: string) => {
    setSelectedId(id)
    setDetailOpen(true)
  }

  // Opened from Spotlight with a specific person.
  useEffect(() => {
    if (payload?.focusId) {
      setGroup("All")
      setQuery("")
      select(payload.focusId)
    }
  }, [payload?.focusId])

  const filterOptions = [{ id: "All" as GroupFilter, label: "All", count: team.data.length }, ...groups] as {
    id: GroupFilter
    label: string
    count: number
  }[]

  return (
    <AppShell>
      <Sidebar hideOnNarrow>
        <SidebarSection title="Team">
          <SidebarItem icon={Users} label="All Contacts" count={team.data.length} active={group === "All"} onClick={() => setGroup("All")} />
        </SidebarSection>
        <SidebarSection title="Groups">
          {groups.map(g => (
            <SidebarItem
              key={g.id}
              icon={UsersRound}
              label={g.label}
              count={g.count}
              active={group === g.id}
              onClick={() => setGroup(g.id)}
            />
          ))}
        </SidebarSection>
      </Sidebar>

      <div className="flex min-w-0 flex-1">
        {/* ── Contact list ──────────────────────────────────────────────────── */}
        <div
          className={cn(
            "min-w-0 flex-col border-(--win-divider) @3xl:flex @3xl:w-72 @3xl:flex-none @3xl:border-r",
            detailOpen ? "hidden" : "flex flex-1"
          )}
        >
          <div className="shrink-0 space-y-2 border-b border-(--win-divider) p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-(--os-text-dim)" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search name, role or skill"
                className="w-full rounded-lg border border-(--win-divider) bg-black/[0.04] py-1.5 pl-8 pr-3 text-[13px] text-(--os-text) outline-none placeholder:text-(--os-text-dim) focus:border-(--accent) dark:bg-white/[0.06]"
              />
            </div>
          </div>
          <ChipBar options={filterOptions} value={group} onChange={setGroup} className="border-b border-(--win-divider)" />
          <div className="flex-1 overflow-y-auto p-1.5">
            {visible.length === 0 ? (
              <EmptyState icon={Search} title="No matches" message="Try a different name, role or skill." />
            ) : (
              visible.map(m => {
                const active = selected?.id === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => select(m.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                      active
                        ? "hover:bg-black/5 dark:hover:bg-white/10 @3xl:bg-(--accent) @3xl:text-white @3xl:hover:bg-(--accent)"
                        : "hover:bg-black/5 dark:hover:bg-white/10"
                    )}
                  >
                    <ServiceAvatar member={m} size={34} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold">{m.name}</p>
                      <p className={cn("truncate text-[11px] text-(--os-text-dim)", active && "@3xl:text-white/75")}>{m.role}</p>
                    </div>
                    <ChevronRight className="size-3.5 shrink-0 opacity-40 @3xl:hidden" />
                  </button>
                )
              })
            )}
          </div>
          <p className="shrink-0 border-t border-(--win-divider) px-3 py-1.5 text-center text-[11px] text-(--os-text-dim)">
            {visible.length} {visible.length === 1 ? "contact" : "contacts"}
          </p>
        </div>

        {/* ── Contact card ──────────────────────────────────────────────────── */}
        <div className={cn("min-w-0 flex-1 flex-col @3xl:flex", detailOpen ? "flex" : "hidden")}>
          <Toolbar left={<span className="@3xl:hidden"><BackButton onClick={() => setDetailOpen(false)} label="Team" /></span>} />
          {selected ? <ContactCard member={selected} /> : <EmptyState icon={Users} title="No contact selected" />}
        </div>
      </div>
    </AppShell>
  )
}

function ContactCard({ member }: { member: TeamMember }) {
  const { icon: ServiceIcon } = serviceStyle(member.awsService)
  const linkedin = member.linkedin ? sanitizeUrl(member.linkedin.startsWith("http") ? member.linkedin : `https://${member.linkedin}`) : null
  const github = member.github ? sanitizeUrl(member.github) : null

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-lg px-6 py-8">
        <div className="flex flex-col items-center text-center">
          <ServiceAvatar member={member} size={96} />
          <h2 className="mt-4 text-2xl font-bold text-(--os-text)">{member.name}</h2>
          <p className="mt-0.5 text-sm font-medium text-(--accent)">{member.role}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px]">
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 font-semibold capitalize text-emerald-600 dark:text-emerald-400">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              {member.status}
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-(--win-divider) bg-black/[0.03] px-2.5 py-0.5 font-medium text-(--os-text-dim) dark:bg-white/[0.05]">
              <ServiceIcon className="size-3" /> {member.awsService || "AWS Cloud"}
            </span>
          </div>

          {/* Quick actions, like Contacts.app */}
          <div className="mt-6 flex gap-3">
            {member.email && <QuickAction href={`mailto:${member.email}`} icon={Mail} label="mail" />}
            {linkedin && linkedin !== "#" && <QuickAction href={linkedin} icon={Linkedin} label="linkedin" />}
            {github && github !== "#" && <QuickAction href={github} icon={Github} label="github" />}
          </div>
        </div>

        <div className="mt-8 divide-y divide-(--win-divider) rounded-xl border border-(--win-divider) bg-white text-[13px] dark:bg-white/[0.04]">
          <Row label="team">{teamGroupOf(member.role)}</Row>
          {member.email && (
            <Row label="email">
              <a href={`mailto:${member.email}`} className="break-all text-(--accent) hover:underline">{member.email}</a>
            </Row>
          )}
          {linkedin && linkedin !== "#" && (
            <Row label="linkedin">
              <a href={linkedin} target="_blank" rel="noopener noreferrer" className="break-all text-(--accent) hover:underline">
                {linkedin.replace(/^https?:\/\/(www\.)?/, "").split("?")[0]}
              </a>
            </Row>
          )}
          {github && github !== "#" && (
            <Row label="github">
              <a href={github} target="_blank" rel="noopener noreferrer" className="break-all text-(--accent) hover:underline">
                {github.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            </Row>
          )}
          {member.bio && <Row label="note">{member.bio}</Row>}
        </div>

        {member.skills.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-(--os-text-dim)">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {member.skills.map(skill => (
                <span
                  key={skill}
                  className="rounded-md border border-(--win-divider) bg-black/[0.03] px-2 py-0.5 text-xs font-medium text-(--os-text) dark:bg-white/[0.05]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <a
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel="noopener noreferrer"
      className="flex w-16 flex-col items-center gap-1 rounded-xl bg-black/[0.04] py-2 text-(--accent) transition-colors hover:bg-black/[0.08] dark:bg-white/[0.07] dark:hover:bg-white/[0.12]"
    >
      <Icon className="size-4" />
      <span className="text-[10px] font-medium">{label}</span>
    </a>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 px-4 py-2.5">
      <span className="w-16 shrink-0 text-right text-xs text-(--os-text-dim)">{label}</span>
      <span className="min-w-0 flex-1 text-(--os-text)">{children}</span>
    </div>
  )
}
