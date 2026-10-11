// components/apps/admin-app.tsx
// Admin — a macOS System Settings–style console for everything on the site.
// Only rendered inside <AdminGate>, after the server confirms admin rights.

"use client"

import React, { useMemo, useState } from "react"
import {
  Activity,
  BookOpen,
  CalendarDays,
  FolderOpen,
  Images,
  Inbox,
  LayoutDashboard,
  Share2,
  ShieldCheck,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react"
import { api } from "@/lib/api-client"
import { systemActions } from "@/lib/aws-store"
import { MacButton } from "./shared/mac-ui"
import { useSession } from "@/lib/session"
import { cn } from "@/lib/utils"
import { AppShell, BackButton, Sidebar, SidebarItem, SidebarSection } from "./shared/mac-ui"
import { CollectionManager, type CollectionConfig, type Row } from "./admin/collection"
import { HealthSection, MessagesSection, OverviewSection, UsersSection } from "./admin/sections"

const GALLERY_TAG = "gallery-album"
const isGalleryAlbum = (e: Row) =>
  (Array.isArray(e.tags) && (e.tags as string[]).includes(GALLERY_TAG)) || e.description === "Gallery Album"

const AWS_SERVICES = [
  "AWS Cloud", "Amazon EC2", "Amazon S3", "AWS Lambda", "Amazon DynamoDB", "Amazon RDS", "AWS Cognito",
  "Amazon CloudFront", "Amazon Route 53", "AWS IAM", "Amazon ECS", "Amazon EKS", "AWS Amplify",
  "AWS CodePipeline", "Amazon SageMaker", "Amazon EventBridge", "Amazon SNS", "Amazon SQS", "AWS CloudTrail",
  "Amazon CloudWatch", "AWS Secrets Manager", "Amazon VPC", "AWS CloudFormation", "Amazon Aurora",
  "Amazon Redshift", "AWS Step Functions", "AWS KMS",
]

const COLLECTIONS: Record<string, CollectionConfig> = {
  events: {
    title: "Events",
    noun: "event",
    icon: CalendarDays,
    listKey: "events",
    list: api.events.list,
    create: api.events.create,
    update: api.events.update,
    remove: api.events.delete,
    filter: e => !isGalleryAlbum(e),
    primary: e => String(e.title ?? ""),
    secondary: e => `${String(e.date ?? "")} · ${String(e.location ?? "")}`,
    thumbnail: e => (Array.isArray(e.imageUrls) ? (e.imageUrls[0] as string) : undefined),
    fields: [
      { key: "title", label: "Title", type: "text", required: true, wide: true },
      { key: "date", label: "Date", type: "date", required: true },
      { key: "location", label: "Location", type: "text", required: true, placeholder: "NMIET, Talegaon" },
      { key: "attendees", label: "Attendees", type: "number", hint: "Events also on Meetup show Meetup's live RSVP count instead." },
      { key: "isPast", label: "Past event", type: "toggle" },
      { key: "description", label: "Description", type: "textarea", wide: true },
      { key: "tags", label: "Tags", type: "tags", wide: true },
      { key: "imageUrls", label: "Photos", type: "images", folder: "events", wide: true, hint: "Photos also appear in the Gallery." },
    ],
  },
  gallery: {
    title: "Gallery Albums",
    noun: "album",
    icon: Images,
    listKey: "events",
    list: api.events.list,
    create: api.events.create,
    update: api.events.update,
    remove: api.events.delete,
    filter: isGalleryAlbum,
    fixedValues: { tags: [GALLERY_TAG], isPast: true, location: "NMIET Campus" },
    primary: e => String(e.title ?? ""),
    secondary: e => `${String(e.date ?? "")} · ${Array.isArray(e.imageUrls) ? e.imageUrls.length : 0} photos`,
    thumbnail: e => (Array.isArray(e.imageUrls) ? (e.imageUrls[0] as string) : undefined),
    fields: [
      { key: "title", label: "Album title", type: "text", required: true, wide: true },
      { key: "date", label: "Date", type: "date", required: true },
      { key: "imageUrls", label: "Photos", type: "images", folder: "events", wide: true, hint: "Large photos are resized automatically before upload." },
    ],
  },
  team: {
    title: "Team",
    noun: "member",
    icon: Users,
    listKey: "members",
    list: api.team.list,
    create: api.team.create,
    update: api.team.update,
    remove: api.team.delete,
    primary: m => String(m.name ?? ""),
    secondary: m => String(m.role ?? ""),
    thumbnail: m => (m.photoUrl as string) || undefined,
    banner: (items, reload) =>
      items.some(m => m.source === "roster-seed") ? null : <ImportRosterBanner reload={reload} />,
    fields: [
      { key: "name", label: "Full name", type: "text", required: true },
      { key: "role", label: "Role", type: "text", required: true, placeholder: "Tech Team Member" },
      { key: "order", label: "Display order", type: "number", hint: "Lower numbers appear first." },
      { key: "status", label: "Status", type: "select", options: ["running", "stopped"] },
      { key: "awsService", label: "Avatar service", type: "select", options: AWS_SERVICES },
      { key: "photoUrl", label: "Photo", type: "image", folder: "team", hint: "Optional — replaces the service avatar." },
      { key: "skills", label: "Skills", type: "tags", wide: true },
      { key: "bio", label: "Short bio", type: "textarea", wide: true },
      { key: "email", label: "Email", type: "email" },
      { key: "linkedin", label: "LinkedIn URL", type: "url" },
      { key: "github", label: "GitHub URL", type: "url" },
    ],
  },
  projects: {
    title: "Projects",
    noun: "project",
    icon: FolderOpen,
    listKey: "projects",
    list: api.projects.list,
    create: api.projects.create,
    update: api.projects.update,
    remove: api.projects.delete,
    primary: p => String(p.title ?? ""),
    secondary: p => `by ${String(p.author ?? "—")} · ${String(p.status ?? "")}`,
    thumbnail: p => (p.imageUrl as string) || undefined,
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "author", label: "Built by", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Production", "Beta", "Development"] },
      { key: "imageUrl", label: "Screenshot", type: "image", folder: "projects" },
      { key: "description", label: "Description", type: "textarea", required: true, wide: true },
      { key: "stack", label: "Tech stack", type: "tags", wide: true },
      { key: "githubUrl", label: "GitHub URL", type: "url" },
      { key: "liveUrl", label: "Live demo URL", type: "url" },
    ],
  },
  achievements: {
    title: "Achievements",
    noun: "achievement",
    icon: Trophy,
    listKey: "achievements",
    list: api.achievements.list,
    create: api.achievements.create,
    update: api.achievements.update,
    remove: api.achievements.delete,
    primary: a => String(a.title ?? ""),
    secondary: a => `${String(a.type ?? "")} · ${String(a.date ?? "")}`,
    fields: [
      { key: "title", label: "Title", type: "text", required: true, wide: true },
      { key: "date", label: "When", type: "text", placeholder: "April 2026" },
      { key: "type", label: "Type", type: "select", options: ["Milestone", "Competition", "Hackathon", "Recognition"] },
      { key: "iconName", label: "Icon", type: "select", options: ["Trophy", "Award", "Star", "Medal", "Target", "Zap"] },
      { key: "color", label: "Colour", type: "color" },
      { key: "order", label: "Display order", type: "number" },
      { key: "description", label: "Description", type: "textarea", wide: true },
    ],
  },
  resources: {
    title: "Resources",
    noun: "resource",
    icon: BookOpen,
    listKey: "resources",
    list: api.resources.list,
    create: api.resources.create,
    update: api.resources.update,
    remove: api.resources.delete,
    primary: r => String(r.name ?? ""),
    secondary: r => `${String(r.category ?? "")} · ${String(r.type ?? "")}`,
    fields: [
      { key: "name", label: "Name", type: "text", required: true, wide: true },
      { key: "url", label: "Link", type: "url", required: true, wide: true },
      { key: "category", label: "Category", type: "text", required: true, placeholder: "Getting Started" },
      { key: "type", label: "Type", type: "select", options: ["Course", "Video", "Document", "Tool"] },
      { key: "order", label: "Display order", type: "number" },
      { key: "featured", label: "Featured", type: "toggle" },
    ],
  },
  social: {
    title: "Social Links",
    noun: "link",
    icon: Share2,
    listKey: "links",
    list: api.social.list,
    create: api.social.create,
    update: (id, data) => api.social.update({ id, ...data }),
    remove: id => api.social.delete(id),
    primary: s => String(s.name ?? ""),
    secondary: s => String(s.url ?? ""),
    fields: [
      { key: "name", label: "Name", type: "text", required: true, placeholder: "Instagram" },
      { key: "platform", label: "Platform", type: "select", options: ["instagram", "linkedin", "youtube", "discord", "github", "twitter", "whatsapp"] },
      { key: "url", label: "Link", type: "url", required: true, wide: true, hint: "For Discord, use an invite set to never expire." },
      { key: "followers", label: "Followers (optional)", type: "text", placeholder: "1.2K" },
      { key: "color", label: "Brand colour", type: "color" },
    ],
  },
}

const NAV: { title: string; items: { id: string; label: string; icon: LucideIcon }[] }[] = [
  { title: "", items: [{ id: "overview", label: "Overview", icon: LayoutDashboard }] },
  {
    title: "Content",
    items: [
      { id: "events", label: "Events", icon: CalendarDays },
      { id: "gallery", label: "Gallery", icon: Images },
      { id: "team", label: "Team", icon: Users },
      { id: "projects", label: "Projects", icon: FolderOpen },
      { id: "achievements", label: "Achievements", icon: Trophy },
      { id: "resources", label: "Resources", icon: BookOpen },
      { id: "social", label: "Social Links", icon: Share2 },
    ],
  },
  {
    title: "Community",
    items: [
      { id: "messages", label: "Messages", icon: Inbox },
      { id: "users", label: "Members & Admins", icon: ShieldCheck },
    ],
  },
  { title: "System", items: [{ id: "health", label: "Health", icon: Activity }] },
]

export function AdminApp() {
  const session = useSession()
  const [section, setSection] = useState("overview")
  const [inSection, setInSection] = useState(false) // narrow windows: list → section

  const go = (id: string) => {
    setSection(id)
    setInSection(true)
  }

  const label = useMemo(() => NAV.flatMap(g => g.items).find(i => i.id === section)?.label ?? "", [section])

  const content =
    section === "overview" ? (
      <OverviewSection go={go} />
    ) : section === "messages" ? (
      <MessagesSection />
    ) : section === "users" ? (
      <UsersSection />
    ) : section === "health" ? (
      <HealthSection />
    ) : COLLECTIONS[section] ? (
      <CollectionManager key={section} config={COLLECTIONS[section]} />
    ) : null

  return (
    <AppShell>
      <Sidebar hideOnNarrow={inSection} className="@xl:w-60">
        <div className="flex items-center gap-3 rounded-xl border border-(--win-divider) bg-white/60 p-2.5 dark:bg-white/[0.04]">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-(--accent) text-sm font-bold text-white">
            {(session.username ?? "A").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[12px] font-semibold">{session.username ?? "Admin"}</p>
            <p className="flex items-center gap-1 text-[11px] text-(--accent)">
              <ShieldCheck className="size-3" /> Club admin
            </p>
          </div>
        </div>
        {NAV.map(group => (
          <SidebarSection key={group.title || "top"} title={group.title || undefined}>
            {group.items.map(item => (
              <SidebarItem key={item.id} icon={item.icon} label={item.label} active={section === item.id} onClick={() => go(item.id)} />
            ))}
          </SidebarSection>
        ))}
      </Sidebar>

      <div className={cn("min-w-0 flex-1 flex-col @xl:flex", inSection ? "flex" : "hidden")}>
        <div className="flex h-10 shrink-0 items-center border-b border-(--win-divider) px-3 @xl:hidden">
          <BackButton onClick={() => setInSection(false)} label="Admin" />
          <span className="ml-2 truncate text-[13px] font-semibold">{label}</span>
        </div>
        <div className="flex min-h-0 flex-1">{content}</div>
      </div>
    </AppShell>
  )
}

/** Shown until the built-in roster has been copied into DynamoDB. */
function ImportRosterBanner({ reload }: { reload: () => Promise<void> }) {
  const [busy, setBusy] = useState(false)
  const importRoster = async () => {
    setBusy(true)
    try {
      const { added } = await api.team.importRoster()
      systemActions.showToast(added ? `Imported ${added} team members` : "Everyone is already here")
      await reload()
    } catch (err) {
      systemActions.showToast((err as Error).message || "Import failed")
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="m-3 space-y-2 rounded-lg border border-(--accent)/30 bg-(--accent)/8 p-3 text-[12px] leading-relaxed">
      <p>
        The website is showing the built-in team roster. Import it once so you can edit, reorder and remove
        anyone here — after that, this list is exactly what the site shows.
      </p>
      <MacButton variant="primary" onClick={importRoster} disabled={busy} className="px-2.5 py-1.5">
        {busy ? "Importing…" : "Import roster"}
      </MacButton>
    </div>
  )
}
