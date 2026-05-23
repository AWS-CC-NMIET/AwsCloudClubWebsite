"use client"

import { lazy, Suspense, useState, useEffect } from "react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import {
  Home, Calendar, Mail, Cloud, Users, FolderOpen,
  BookOpen, Share2, Trophy, Terminal, ImageIcon, ShieldCheck,
  ArrowLeft, Wifi, Signal, Battery, UserCircle,
} from "lucide-react"
import { WeatherWidget }   from "@/components/os/weather-widget"
import { CalendarWidget }  from "@/components/os/calendar-widget"
import { InteractiveCanvas } from "@/components/os/interactive-canvas"
import { MeetupProvider }  from "@/lib/meetup-context"
import { signOut }         from "@/lib/auth-client"
import type { AppId }      from "@/lib/types"

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

// ── Small helpers ─────────────────────────────────────────────────────────────
function AppSkeleton() {
  return (
    <div
      className="flex h-full min-h-[50vh] items-center justify-center"
      style={{ background: "#050310" }}
    >
      <motion.div
        className="h-14 w-14 rounded-2xl"
        style={{ background: "linear-gradient(135deg,#6B4FE8,#8B6FFF)" }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )
}

interface IconMeta {
  id: AppId
  label: string
  icon: React.ReactNode
  gradient: string
}

function GridIcon({ icon, label, gradient, onClick }: IconMeta & { onClick: () => void }) {
  return (
    <motion.button
      className="flex flex-col items-center gap-1.5"
      onClick={onClick}
      whileTap={{ scale: 0.82 }}
    >
      <div
        className="flex items-center justify-center rounded-[18px] text-white"
        style={{
          width: 62,
          height: 62,
          background: gradient,
          boxShadow: "0 6px 20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.10)",
        }}
      >
        {icon}
      </div>
      <span
        className="text-center leading-tight"
        style={{
          fontSize: 10,
          color: "rgba(220,210,255,0.88)",
          maxWidth: 68,
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </motion.button>
  )
}

function DockIcon({ icon, gradient, onClick }: IconMeta & { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.82 }}
      className="flex items-center justify-center rounded-[20px] text-white"
      style={{
        width: 66,
        height: 66,
        background: gradient,
        boxShadow: "0 6px 24px rgba(107,79,232,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
      }}
    >
      {icon}
    </motion.button>
  )
}

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
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 flex items-center gap-3 px-4 pb-3"
        style={{
          background: "rgba(10,6,28,0.97)",
          borderBottom: "1px solid rgba(168,85,247,0.18)",
          paddingTop: "env(safe-area-inset-top, 48px)",
          minHeight: 88,
        }}
      >
        <motion.button
          onClick={onClose}
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ width: 38, height: 38, background: "rgba(168,85,247,0.16)", color: "#A855F7" }}
          whileTap={{ scale: 0.88 }}
        >
          <ArrowLeft className="h-4 w-4" />
        </motion.button>
        <span className="font-semibold text-sm" style={{ color: "#EDE9FE" }}>
          {appTitles[appId]}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function MobileHome({ onLogout, isAdmin }: { onLogout: () => void; isAdmin: boolean }) {
  const [activeApp, setActiveApp] = useState<AppId | null>(null)
  const [gridPage,  setGridPage]  = useState(0)
  const [statusTime, setStatusTime] = useState("")

  // Live status bar clock
  useEffect(() => {
    const upd = () => {
      const n = new Date()
      setStatusTime(`${n.getHours().toString().padStart(2,"0")}:${n.getMinutes().toString().padStart(2,"0")}`)
    }
    upd()
    const id = setInterval(upd, 10000)
    return () => clearInterval(id)
  }, [])

  const openApp = (id: AppId) => setActiveApp(id)
  const closeApp = () => setActiveApp(null)

  // ── Dock: 3 priority apps ─────────────────────────────────────────────────
  const dockApps: IconMeta[] = [
    { id: "home",    label: "Home",    icon: <Home className="h-7 w-7" />,     gradient: "linear-gradient(135deg,#6B4FE8,#8B6FFF)" },
    { id: "events",  label: "Events",  icon: <Calendar className="h-7 w-7" />, gradient: "linear-gradient(135deg,#FF9900,#E88800)" },
    { id: "contact", label: "Contact", icon: <Mail className="h-7 w-7" />,     gradient: "linear-gradient(135deg,#5BA8D8,#3B88C0)" },
  ]

  // ── Grid: all other apps ──────────────────────────────────────────────────
  const gridApps: IconMeta[] = [
    { id: "about",        label: "About Us",     icon: <Cloud className="h-6 w-6" />,      gradient: "linear-gradient(135deg,#B8A4FF,#8B6FFF)" },
    { id: "team",         label: "Team",         icon: <Users className="h-6 w-6" />,      gradient: "linear-gradient(135deg,#5BA8D8,#4B90C8)" },
    { id: "projects",     label: "Projects",     icon: <FolderOpen className="h-6 w-6" />, gradient: "linear-gradient(135deg,#50C88A,#3AAA72)" },
    { id: "resources",    label: "Resources",    icon: <BookOpen className="h-6 w-6" />,   gradient: "linear-gradient(135deg,#6B4FE8,#5B3FD8)" },
    { id: "social",       label: "Social",       icon: <Share2 className="h-6 w-6" />,     gradient: "linear-gradient(135deg,#E85580,#C83565)" },
    { id: "achievements", label: "Achievements", icon: <Trophy className="h-6 w-6" />,     gradient: "linear-gradient(135deg,#FFB800,#E89800)" },
    { id: "gallery",      label: "Gallery",      icon: <ImageIcon className="h-6 w-6" />,  gradient: "linear-gradient(135deg,#E85580,#B83060)" },
    { id: "terminal",     label: "Terminal",     icon: <Terminal className="h-6 w-6" />,   gradient: "linear-gradient(135deg,#2D1B8A,#1E1060)" },
    { id: "profile",      label: "Profile",      icon: <UserCircle className="h-6 w-6" />, gradient: "linear-gradient(135deg,#7C3AED,#A855F7)" },
    ...(isAdmin ? [{ id: "admin" as AppId, label: "Admin", icon: <ShieldCheck className="h-6 w-6" />, gradient: "linear-gradient(135deg,#1E1060,#2D1B8A)" }] : []),
  ]

  // Chunk into pages of 8
  const APPS_PER_PAGE = 8
  const pages: IconMeta[][] = []
  for (let i = 0; i < gridApps.length; i += APPS_PER_PAGE) {
    pages.push(gridApps.slice(i, i + APPS_PER_PAGE))
  }

  // Swipe left/right on the grid to change pages
  const handleGridDragEnd = (_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (info.offset.x < -50 && gridPage < pages.length - 1) setGridPage(p => p + 1)
    else if (info.offset.x > 50 && gridPage > 0) setGridPage(p => p - 1)
  }

  // ── App content map ───────────────────────────────────────────────────────
  const appContent: Partial<Record<AppId, React.ReactNode>> = {
    home:         <Suspense fallback={<AppSkeleton />}><HomeApp onLearnMore={() => openApp("about")} /></Suspense>,
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

        {/* ── Status bar ─────────────────────────────────────────────────── */}
        <div
          className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5"
          style={{
            height: 44,
            background: "rgba(5,3,16,0.80)",
            paddingTop: "env(safe-area-inset-top, 0px)",
          }}
        >
          <span
            className="text-xs font-semibold tabular-nums"
            style={{ color: "rgba(196,181,253,0.88)" }}
          >
            {statusTime}
          </span>
          <div className="flex items-center gap-2" style={{ color: "rgba(196,181,253,0.60)" }}>
            <Wifi className="h-3.5 w-3.5" />
            <Signal className="h-3.5 w-3.5" />
            <Battery className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* ── Scrollable main content ─────────────────────────────────────── */}
        <div
          className="absolute inset-x-0 overflow-y-auto z-10 space-y-4"
          style={{
            top: 44,
            bottom: 100,
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 14,
            paddingBottom: 20,
          }}
        >
          {/* Weather */}
          <WeatherWidget />

          {/* Calendar */}
          <CalendarWidget onEventDateClick={() => openApp("events")} />

          {/* ── App grid (page-swiped) ──────────────────────────────────── */}
          <div>
            {/* Subtle section label */}
            <p
              className="text-[10px] font-semibold mb-3 tracking-widest uppercase"
              style={{ color: "rgba(168,85,247,0.55)" }}
            >
              Apps
            </p>

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

            {/* Page dots */}
            {pages.length > 1 && (
              <div className="flex justify-center gap-2 mt-5">
                {pages.map((_, pi) => (
                  <motion.button
                    key={pi}
                    onClick={() => setGridPage(pi)}
                    animate={{ width: pi === gridPage ? 22 : 6 }}
                    className="rounded-full flex-shrink-0"
                    style={{
                      height: 6,
                      background:
                        pi === gridPage
                          ? "#A855F7"
                          : "rgba(168,85,247,0.32)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Dock ───────────────────────────────────────────────────────── */}
        <div
          className="absolute inset-x-0 bottom-0 z-20 flex justify-around items-center px-8"
          style={{
            background: "rgba(6,3,18,0.90)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            borderTop: "1px solid rgba(168,85,247,0.20)",
            boxShadow: "0 -6px 32px rgba(107,79,232,0.15)",
            paddingTop: 16,
            paddingBottom: "max(20px, env(safe-area-inset-bottom, 20px))",
          }}
        >
          {dockApps.map(app => (
            <DockIcon key={app.id} {...app} onClick={() => openApp(app.id)} />
          ))}
        </div>

        {/* ── App panels ─────────────────────────────────────────────────── */}
        <AnimatePresence>
          {activeApp && appContent[activeApp] && (
            <AppPanel key={activeApp} appId={activeApp} onClose={closeApp}>
              {appContent[activeApp]}
            </AppPanel>
          )}
        </AnimatePresence>
      </div>
    </MeetupProvider>
  )
}
