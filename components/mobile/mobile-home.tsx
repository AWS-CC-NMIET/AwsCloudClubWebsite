"use client"

import { lazy, Suspense, useState, useEffect } from "react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import {
  Home, Calendar, Mail, Cloud, Users, FolderOpen,
  BookOpen, Share2, Trophy, Terminal, ImageIcon, ShieldCheck,
  ArrowLeft, Wifi, Signal, Battery, UserCircle,
} from "lucide-react"
import Image from "next/image"
import { WeatherWidget }    from "@/components/os/weather-widget"
import { CalendarWidget }   from "@/components/os/calendar-widget"
import { InteractiveCanvas } from "@/components/os/interactive-canvas"
import { AuthGateModal }    from "@/components/os/auth-gate-modal"
import { MeetupProvider }   from "@/lib/meetup-context"
import { signOut, isSessionValid } from "@/lib/auth-client"
import type { AppId }       from "@/lib/types"

// ── Lazy-loaded app components ────────────────────────────────────────────────
const HomeApp         = lazy(() => import("../apps/home-app").then(m => ({ default: m.HomeApp })))
const AboutApp        = lazy(() => import("../apps/about-app").then(m => ({ default: m.AboutApp })))
const TeamApp         = lazy(() => import("../apps/team-app").then(m => ({ default: m.TeamApp })))
const EventsApp       = lazy(() => import("../apps/events-app").then(m => ({ default: m.EventsApp })))
const ProjectsApp     = lazy(() => import("../apps/projects-app").then(m => ({ default: m.ProjectsApp })))
const ResourcesApp    = lazy(() => import("../apps/resources-app").then(m => ({ default: m.ResourcesApp })))
const SocialApp       = lazy(() => import("../apps/social-app").then(m => ({ default: m.SocialApp })))
const ContactApp      = lazy(() => import("../apps/contact-app").then(m => ({ default: m.ContactApp })))
const AchievementsApp = lazy(() => import("../apps/achievements-app").then(m => ({ default: m.AchievementsApp })))
const TerminalApp     = lazy(() => import("../apps/terminal-app").then(m => ({ default: m.TerminalApp })))
const ProfileApp      = lazy(() => import("../apps/profile-app").then(m => ({ default: m.ProfileApp })))
const AdminApp        = lazy(() => import("../apps/admin-app").then(m => ({ default: m.AdminApp })))
const GalleryApp      = lazy(() => import("../apps/gallery-app").then(m => ({ default: m.GalleryApp })))

const appTitles: Record<AppId, string> = {
  home: "Introduction", about: "About Us", team: "Team",
  events: "Events", projects: "Projects", resources: "Resources",
  social: "Social Media", contact: "Contact Us",
  achievements: "Achievements", terminal: "Terminal",
  profile: "My Profile", admin: "Admin Panel", gallery: "Gallery",
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function AppSkeleton() {
  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center" style={{ background: "#D4CEFF" }}>
      <motion.div
        className="h-12 w-12 rounded-2xl"
        style={{ background: "linear-gradient(135deg,#6B4FE8,#8B6FFF)" }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )
}

// ── Icon types ────────────────────────────────────────────────────────────────
interface IconMeta {
  id: AppId
  label: string
  icon: React.ReactNode
  bg: string
}

// ── Grid icon — consistent design with gloss overlay ─────────────────────────
function GridIcon({ icon, label, bg, onClick }: IconMeta & { onClick: () => void }) {
  return (
    <motion.button
      className="flex flex-col items-center gap-1.5"
      onClick={onClick}
      whileTap={{ scale: 0.84 }}
    >
      <div
        className="relative flex items-center justify-center rounded-[20px] text-white overflow-hidden flex-shrink-0"
        style={{
          width: 58,
          height: 58,
          background: bg,
          boxShadow: "0 4px 14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.16)",
        }}
      >
        {/* Top gloss */}
        <div
          className="absolute inset-x-0 top-0 pointer-events-none rounded-t-[20px]"
          style={{ height: "48%", background: "linear-gradient(to bottom, rgba(255,255,255,0.12), transparent)" }}
        />
        <div className="relative z-10">{icon}</div>
      </div>
      <span
        className="text-center leading-tight"
        style={{ fontSize: 10, color: "rgba(210,200,255,0.80)", maxWidth: 66, fontWeight: 500 }}
      >
        {label}
      </span>
    </motion.button>
  )
}

// ── Dock icon — slightly larger, same design language ────────────────────────
function DockIcon({ icon, bg, onClick }: IconMeta & { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.84 }}
      className="relative flex items-center justify-center rounded-[22px] text-white overflow-hidden flex-shrink-0"
      style={{
        width: 62,
        height: 62,
        background: bg,
        boxShadow: "0 6px 20px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.18)",
      }}
    >
      {/* Top gloss */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none rounded-t-[22px]"
        style={{ height: "48%", background: "linear-gradient(to bottom, rgba(255,255,255,0.13), transparent)" }}
      />
      <div className="relative z-10">{icon}</div>
    </motion.button>
  )
}

// ── App panel — slides up with polished header ────────────────────────────────
function AppPanel({
  appId,
  children,
  onClose,
}: {
  appId: AppId
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "#050310" }}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 310, damping: 34 }}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 flex items-center gap-3 px-4"
        style={{
          background: "linear-gradient(to bottom, rgba(8,4,24,0.98), rgba(8,4,24,0.92))",
          borderBottom: "1px solid rgba(107,79,232,0.22)",
          paddingTop: "max(env(safe-area-inset-top, 12px), 44px)",
          paddingBottom: 14,
        }}
      >
        <motion.button
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 flex-shrink-0"
          style={{
            background: "rgba(107,79,232,0.18)",
            border: "1px solid rgba(107,79,232,0.28)",
          }}
          whileTap={{ scale: 0.88 }}
        >
          <ArrowLeft className="h-4 w-4" style={{ color: "#A855F7" }} />
          <span className="text-xs font-semibold" style={{ color: "#A855F7" }}>Back</span>
        </motion.button>
        <span className="font-bold text-sm" style={{ color: "rgba(237,233,254,0.92)" }}>
          {appTitles[appId]}
        </span>
      </div>
      {/* Content — lavender base so frosted-glass apps render correctly */}
      <div className="flex-1 overflow-y-auto" style={{ background: "#D4CEFF" }}>{children}</div>
    </motion.div>
  )
}

// ── Apps that require an authenticated session (mobile) ──────────────────────
const PROTECTED_APPS = new Set<AppId>([
  "gallery", "resources", "achievements", "projects", "profile",
])

// ── Main component ────────────────────────────────────────────────────────────
export function MobileHome({ onLogout, onRequireSignIn, isAdmin }: {
  onLogout: () => void
  onRequireSignIn: () => void
  isAdmin: boolean
}) {
  const [activeApp,   setActiveApp]   = useState<AppId | null>(null)
  const [authGateApp, setAuthGateApp] = useState<AppId | null>(null)
  const [gridPage,    setGridPage]    = useState(0)
  const [statusTime,  setStatusTime]  = useState("")

  useEffect(() => {
    const upd = () => {
      const n = new Date()
      setStatusTime(
        `${n.getHours().toString().padStart(2, "0")}:${n.getMinutes().toString().padStart(2, "0")}`
      )
    }
    upd()
    const id = setInterval(upd, 10000)
    return () => clearInterval(id)
  }, [])

  const openApp  = (id: AppId) => {
    if (PROTECTED_APPS.has(id) && !isSessionValid()) {
      setAuthGateApp(id)
      return
    }
    setActiveApp(id)
  }
  const closeApp = ()          => setActiveApp(null)

  // ── Dock: 3 priority apps — all use same gradient style ──────────────────
  const dockApps: IconMeta[] = [
    { id: "home",    label: "Home",    icon: <Home className="h-7 w-7" />,     bg: "linear-gradient(145deg,#8B70FF,#6B4FE8)" },
    { id: "events",  label: "Events",  icon: <Calendar className="h-7 w-7" />, bg: "linear-gradient(145deg,#FFB840,#FF9900)" },
    { id: "contact", label: "Contact", icon: <Mail className="h-7 w-7" />,     bg: "linear-gradient(145deg,#70B8E8,#4B98C8)" },
  ]

  // ── Grid: consistent 145deg gradient, brand color palette ────────────────
  const gridApps: IconMeta[] = [
    { id: "about",        label: "About Us",     icon: <Cloud className="h-[22px] w-[22px]" />,      bg: "linear-gradient(145deg,#9B72FF,#6B4FE8)" },
    { id: "team",         label: "Team",         icon: <Users className="h-[22px] w-[22px]" />,      bg: "linear-gradient(145deg,#70B8E8,#4B98C8)" },
    { id: "projects",     label: "Projects",     icon: <FolderOpen className="h-[22px] w-[22px]" />, bg: "linear-gradient(145deg,#5ED4A0,#38AA72)" },
    { id: "resources",    label: "Resources",    icon: <BookOpen className="h-[22px] w-[22px]" />,   bg: "linear-gradient(145deg,#8B6FFF,#5B3FD8)" },
    { id: "social",       label: "Social",       icon: <Share2 className="h-[22px] w-[22px]" />,     bg: "linear-gradient(145deg,#F090A8,#E85580)" },
    { id: "achievements", label: "Achievements", icon: <Trophy className="h-[22px] w-[22px]" />,     bg: "linear-gradient(145deg,#FFD060,#FFB800)" },
    { id: "gallery",      label: "Gallery",      icon: <ImageIcon className="h-[22px] w-[22px]" />,  bg: "linear-gradient(145deg,#F08070,#E05040)" },
    { id: "terminal",     label: "Terminal",     icon: <Terminal className="h-[22px] w-[22px]" />,   bg: "linear-gradient(145deg,#5A7AB0,#2A4A80)" },
    { id: "profile",      label: "Profile",      icon: <UserCircle className="h-[22px] w-[22px]" />, bg: "linear-gradient(145deg,#C080FF,#9040E0)" },
    ...(isAdmin
      ? [{ id: "admin" as AppId, label: "Admin", icon: <ShieldCheck className="h-[22px] w-[22px]" />, bg: "linear-gradient(145deg,#5040A8,#2D1B8A)" }]
      : []),
  ]

  const APPS_PER_PAGE = 8
  const pages: IconMeta[][] = []
  for (let i = 0; i < gridApps.length; i += APPS_PER_PAGE) {
    pages.push(gridApps.slice(i, i + APPS_PER_PAGE))
  }

  const handleGridDragEnd = (_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if      (info.offset.x < -50 && gridPage < pages.length - 1) setGridPage(p => p + 1)
    else if (info.offset.x >  50 && gridPage > 0)                setGridPage(p => p - 1)
  }

  const appContent: Partial<Record<AppId, React.ReactNode>> = {
    home:         <Suspense fallback={<AppSkeleton />}><HomeApp onLearnMore={() => openApp("about")} forceMobileUI /></Suspense>,
    about:        <Suspense fallback={<AppSkeleton />}><AboutApp /></Suspense>,
    team:         <Suspense fallback={<AppSkeleton />}><TeamApp /></Suspense>,
    events:       <Suspense fallback={<AppSkeleton />}><EventsApp /></Suspense>,
    projects:     <Suspense fallback={<AppSkeleton />}><ProjectsApp /></Suspense>,
    resources:    <Suspense fallback={<AppSkeleton />}><ResourcesApp /></Suspense>,
    social:       <Suspense fallback={<AppSkeleton />}><SocialApp /></Suspense>,
    contact:      <Suspense fallback={<AppSkeleton />}><ContactApp /></Suspense>,
    achievements: <Suspense fallback={<AppSkeleton />}><AchievementsApp /></Suspense>,
    terminal:     <Suspense fallback={<AppSkeleton />}><TerminalApp /></Suspense>,
    profile:      <Suspense fallback={<AppSkeleton />}><ProfileApp onLogout={() => { signOut(); onLogout() }} /></Suspense>,
    admin:        <Suspense fallback={<AppSkeleton />}><AdminApp /></Suspense>,
    gallery:      <Suspense fallback={<AppSkeleton />}><GalleryApp /></Suspense>,
  }

  return (
    <MeetupProvider>
      <div className="fixed inset-0 overflow-hidden" style={{ background: "#050310" }}>
        <InteractiveCanvas theme="dark" particleCountOverride={45} />

        {/* ── Status bar ───────────────────────────────────────────────────── */}
        <div
          className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5"
          style={{
            height: 44,
            background: "rgba(5,3,16,0.80)",
            backdropFilter: "blur(8px)",
            paddingTop: "env(safe-area-inset-top, 0px)",
          }}
        >
          <span className="text-xs font-semibold tabular-nums" style={{ color: "rgba(196,181,253,0.88)" }}>
            {statusTime}
          </span>
          <div className="flex items-center gap-2" style={{ color: "rgba(196,181,253,0.60)" }}>
            <Wifi className="h-3.5 w-3.5" />
            <Signal className="h-3.5 w-3.5" />
            <Battery className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* ── Scrollable main content ──────────────────────────────────────── */}
        <div
          className="absolute inset-x-0 overflow-y-auto z-10 space-y-4 hide-scrollbar"
          style={{ top: 44, bottom: 106, paddingInline: 16, paddingTop: 14, paddingBottom: 24 }}
        >
          {/* ── Identity / greeting header ── */}
          <motion.div
            className="flex items-center justify-between rounded-2xl px-4 py-3"
            style={{
              background: "rgba(107,79,232,0.10)",
              border: "1px solid rgba(107,79,232,0.22)",
              backdropFilter: "blur(12px)",
            }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <p className="text-[10px] font-medium tracking-wide" style={{ color: "rgba(196,181,253,0.50)" }}>
                AWS Student Builder Group
              </p>
              <p className="text-sm font-bold text-white leading-tight">NMIET Chapter</p>
            </div>
            <motion.button
              onClick={() => openApp("home")}
              className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
              style={{
                background: "rgba(107,79,232,0.25)",
                border: "1px solid rgba(168,85,247,0.32)",
              }}
              whileTap={{ scale: 0.86 }}
            >
              <Image src="/logo-full.png" alt="logo" width={24} height={24} className="object-contain" unoptimized />
            </motion.button>
          </motion.div>

          {/* ── Weather widget ── */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <WeatherWidget />
          </motion.div>

          {/* ── Calendar widget ── */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
            <CalendarWidget onEventDateClick={() => openApp("events")} />
          </motion.div>

          {/* ── App grid ── */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.20 }}>
            {/* Section header with inline page dots */}
            <div className="flex items-center justify-between mb-3.5">
              <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgba(168,85,247,0.60)" }}>
                Apps
              </p>
              {pages.length > 1 && (
                <div className="flex items-center gap-1.5">
                  {pages.map((_, pi) => (
                    <motion.button
                      key={pi}
                      onClick={() => setGridPage(pi)}
                      animate={{ width: pi === gridPage ? 18 : 5 }}
                      className="rounded-full flex-shrink-0"
                      style={{
                        height: 5,
                        background: pi === gridPage ? "#A855F7" : "rgba(168,85,247,0.28)",
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={gridPage}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.10}
                  onDragEnd={handleGridDragEnd}
                  className="grid grid-cols-4 gap-y-5"
                  style={{ columnGap: 0 }}
                  initial={{ opacity: 0, x: gridPage === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: gridPage === 0 ? 20 : -20 }}
                  transition={{ type: "spring", stiffness: 340, damping: 30 }}
                >
                  {pages[gridPage].map(app => (
                    <div key={app.id} className="flex justify-center">
                      <GridIcon {...app} onClick={() => openApp(app.id)} />
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* ── Dock ─────────────────────────────────────────────────────────── */}
        <div
          className="absolute inset-x-0 bottom-0 z-20 flex justify-around items-center"
          style={{
            paddingInline: 40,
            background: "rgba(6,3,18,0.88)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            borderTop: "1px solid rgba(107,79,232,0.18)",
            boxShadow: "0 -4px 28px rgba(107,79,232,0.12)",
            paddingTop: 16,
            paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))",
          }}
        >
          {dockApps.map(app => (
            <DockIcon key={app.id} {...app} onClick={() => openApp(app.id)} />
          ))}
        </div>

        {/* ── App panels ───────────────────────────────────────────────────── */}
        <AnimatePresence>
          {activeApp && appContent[activeApp] && (
            <AppPanel key={activeApp} appId={activeApp} onClose={closeApp}>
              {appContent[activeApp]}
            </AppPanel>
          )}
        </AnimatePresence>

        {/* ── Auth Gate Modal ── */}
        <AuthGateModal
          appId={authGateApp}
          onSignIn={() => { setAuthGateApp(null); onRequireSignIn() }}
          onDismiss={() => setAuthGateApp(null)}
        />
      </div>
    </MeetupProvider>
  )
}
