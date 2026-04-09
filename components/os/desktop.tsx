"use client"

import { lazy, Suspense, useState, useCallback, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Home, Cloud, Users, Calendar, FolderOpen,
  BookOpen, Share2, Mail, Trophy, Terminal,
  UserCircle, ShieldCheck, ImageIcon, LayoutGrid,
} from "lucide-react"
import Image from "next/image"

// OS chrome — always bundled (tiny, needed immediately)
import { Window }        from "./window"
import { Taskbar }       from "./taskbar"
import { DesktopIcon }   from "./desktop-icon"
import { StartMenu }     from "./start-menu"
import { WeatherWidget } from "./weather-widget"
import { CalendarWidget } from "./calendar-widget"
import { Wallpaper }     from "./wallpaper"
import { QuoteTicker }   from "./quote-ticker"
import { AppDrawer }     from "./app-drawer"

// ── Lazy-loaded app components ────────────────────────────────────────────────
// Each app is split into its own JS chunk and only fetched when the user
// actually opens that window, slashing the initial bundle by ~120 KB.
const HomeApp        = lazy(() => import("../apps/home-app").then(m => ({ default: m.HomeApp })))
const AboutApp       = lazy(() => import("../apps/about-app").then(m => ({ default: m.AboutApp })))
const TeamApp        = lazy(() => import("../apps/team-app").then(m => ({ default: m.TeamApp })))
const EventsApp      = lazy(() => import("../apps/events-app").then(m => ({ default: m.EventsApp })))
const ProjectsApp    = lazy(() => import("../apps/projects-app").then(m => ({ default: m.ProjectsApp })))
const ResourcesApp   = lazy(() => import("../apps/resources-app").then(m => ({ default: m.ResourcesApp })))
const SocialApp      = lazy(() => import("../apps/social-app").then(m => ({ default: m.SocialApp })))
const ContactApp     = lazy(() => import("../apps/contact-app").then(m => ({ default: m.ContactApp })))
const AchievementsApp = lazy(() => import("../apps/achievements-app").then(m => ({ default: m.AchievementsApp })))
const TerminalApp    = lazy(() => import("../apps/terminal-app").then(m => ({ default: m.TerminalApp })))
const ProfileApp     = lazy(() => import("../apps/profile-app").then(m => ({ default: m.ProfileApp })))
const AdminApp       = lazy(() => import("../apps/admin-app").then(m => ({ default: m.AdminApp })))
const GalleryApp     = lazy(() => import("../apps/gallery-app").then(m => ({ default: m.GalleryApp })))

// Auth (server-side helpers — not chunked)
import { getAccessToken, parseJwtPayload, signOut } from "@/lib/auth-client"
import { MeetupProvider } from "@/lib/meetup-context"
import type { AppId, WindowState, AppMeta } from "@/lib/types"

// ── App registry ──────────────────────────────────────────────────────────────
const desktopApps: AppMeta[] = [
  { id: "home",         label: "Home",         icon: <Home className="h-6 w-6" />,        gradient: "linear-gradient(135deg,#6B4FE8,#8B6FFF)" },
  { id: "about",        label: "About Us",     icon: <Cloud className="h-6 w-6" />,       gradient: "linear-gradient(135deg,#B8A4FF,#8B6FFF)" },
  { id: "team",         label: "Team",         icon: <Users className="h-6 w-6" />,       gradient: "linear-gradient(135deg,#5BA8D8,#4B90C8)" },
  { id: "events",       label: "Events",       icon: <Calendar className="h-6 w-6" />,    gradient: "linear-gradient(135deg,#FF9900,#E88800)" },
  { id: "projects",     label: "Projects",     icon: <FolderOpen className="h-6 w-6" />,  gradient: "linear-gradient(135deg,#50C88A,#3AAA72)" },
  { id: "resources",    label: "Resources",    icon: <BookOpen className="h-6 w-6" />,    gradient: "linear-gradient(135deg,#6B4FE8,#5B3FD8)" },
  { id: "social",       label: "Social",       icon: <Share2 className="h-6 w-6" />,      gradient: "linear-gradient(135deg,#E85580,#C83565)" },
  { id: "contact",      label: "Contact",      icon: <Mail className="h-6 w-6" />,        gradient: "linear-gradient(135deg,#5BA8D8,#3B88C0)" },
  { id: "achievements", label: "Achievements", icon: <Trophy className="h-6 w-6" />,      gradient: "linear-gradient(135deg,#FFB800,#E89800)" },
  { id: "gallery",      label: "Gallery",      icon: <ImageIcon className="h-6 w-6" />,   gradient: "linear-gradient(135deg,#E85580,#B83060)" },
  { id: "terminal",     label: "Terminal",     icon: <Terminal className="h-6 w-6" />,    gradient: "linear-gradient(135deg,#2D1B8A,#1E1060)" },
]

const appTitles: Record<AppId, string> = {
  home: "Introduction", about: "About Us", team: "Team",
  events: "Events", projects: "Projects", resources: "Resources",
  social: "Social Media", contact: "Contact Us",
  achievements: "Achievements", terminal: "Terminal",
  profile: "My Profile", admin: "Admin Panel", gallery: "Gallery",
}

const appIcons: Record<AppId, React.ReactNode> = {
  home:         <Home className="h-4 w-4" />,
  about:        <Cloud className="h-4 w-4" />,
  team:         <Users className="h-4 w-4" />,
  events:       <Calendar className="h-4 w-4" />,
  projects:     <FolderOpen className="h-4 w-4" />,
  resources:    <BookOpen className="h-4 w-4" />,
  social:       <Share2 className="h-4 w-4" />,
  contact:      <Mail className="h-4 w-4" />,
  achievements: <Trophy className="h-4 w-4" />,
  terminal:     <Terminal className="h-4 w-4" />,
  profile:      <UserCircle className="h-4 w-4" />,
  admin:        <ShieldCheck className="h-4 w-4" />,
  gallery:      <ImageIcon className="h-4 w-4" />,
}

// ── Loading skeleton shown while lazy chunk fetches ───────────────────────────
function AppLoadingSkeleton() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          className="h-14 w-14 rounded-2xl"
          style={{ background: "linear-gradient(135deg,#6B4FE8,#8B6FFF)" }}
          animate={{ scale: [1, 1.10, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <p className="text-sm font-medium" style={{ color: "#7B6FC0" }}>Loading…</p>
      </div>
    </div>
  )
}

// ── Helper ────────────────────────────────────────────────────────────────────
function getInitialPosition(id: AppId) {
  const offsets: Partial<Record<AppId, { x: number; y: number }>> = {
    home: { x: 80, y: 40 }, about: { x: 100, y: 50 }, team: { x: 120, y: 60 },
  }
  return offsets[id] ?? { x: 80 + Math.random() * 60, y: 40 + Math.random() * 40 }
}

// ── Desktop component ─────────────────────────────────────────────────────────
export function Desktop({ onLogout }: { onLogout: () => void }) {
  const [windows, setWindows]       = useState<WindowState[]>([
    { id: "home", isMinimized: false, isMaximized: false, zIndex: 60 },
  ])
  const [highestZIndex, setHighestZIndex] = useState(60)
  const [showStartMenu, setShowStartMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isAdmin, setIsAdmin]             = useState(false)

  // Sync mobile detection — no hydration flash
  const [isMobileDesktop, setIsMobileDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  )
  useEffect(() => {
    const check = () => setIsMobileDesktop(window.innerWidth < 768)
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      const payload = parseJwtPayload(token)
      const groups = (payload["cognito:groups"] as string[]) || []
      setIsAdmin(groups.includes("admins"))
    }
  }, [])

  // ── Window management ──────────────────────────────────────────────────────
  const openApp = useCallback((appId: AppId) => {
    if (isMobileDesktop && appId === "home") {
      setWindows((prev) => prev.map((w) => ({ ...w, isMinimized: true })))
      return
    }
    setWindows((prev) => {
      const existing = prev.find((w) => w.id === appId)
      if (existing) {
        if (existing.isMinimized) {
          setHighestZIndex((z) => z + 1)
          return prev.map((w) => w.id === appId ? { ...w, isMinimized: false, zIndex: highestZIndex + 1 } : w)
        }
        setHighestZIndex((z) => z + 1)
        return prev.map((w) => w.id === appId ? { ...w, zIndex: highestZIndex + 1 } : w)
      }
      setHighestZIndex((z) => z + 1)
      return [...prev, { id: appId, isMinimized: false, isMaximized: false, zIndex: highestZIndex + 1 }]
    })
  }, [highestZIndex, isMobileDesktop])

  const closeApp    = useCallback((id: AppId) => setWindows((p) => p.filter((w) => w.id !== id)), [])
  const minimizeApp = useCallback((id: AppId) => setWindows((p) => p.map((w) => w.id === id ? { ...w, isMinimized: true } : w)), [])
  const maximizeApp = useCallback((id: AppId) => setWindows((p) => p.map((w) => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)), [])
  const focusApp    = useCallback((id: AppId) => {
    setHighestZIndex((z) => z + 1)
    setWindows((p) => p.map((w) => w.id === id ? { ...w, zIndex: highestZIndex + 1 } : w))
  }, [highestZIndex])

  const getActiveApp = useCallback((): AppId | null => {
    const visible = windows.filter((w) => !w.isMinimized)
    if (!visible.length) return null
    return visible.reduce((a, b) => (a.zIndex > b.zIndex ? a : b)).id
  }, [windows])

  const introIsMaximized = !!windows.find((w) => w.id === "home" && w.isMaximized && !w.isMinimized)

  // ── Lazy app content map ───────────────────────────────────────────────────
  const appContent: Record<AppId, React.ReactNode> = {
    home:         <Suspense fallback={<AppLoadingSkeleton />}><HomeApp onLearnMore={() => openApp("about")} /></Suspense>,
    about:        <Suspense fallback={<AppLoadingSkeleton />}><AboutApp /></Suspense>,
    team:         <Suspense fallback={<AppLoadingSkeleton />}><TeamApp /></Suspense>,
    events:       <Suspense fallback={<AppLoadingSkeleton />}><EventsApp /></Suspense>,
    projects:     <Suspense fallback={<AppLoadingSkeleton />}><ProjectsApp /></Suspense>,
    resources:    <Suspense fallback={<AppLoadingSkeleton />}><ResourcesApp /></Suspense>,
    social:       <Suspense fallback={<AppLoadingSkeleton />}><SocialApp /></Suspense>,
    contact:      <Suspense fallback={<AppLoadingSkeleton />}><ContactApp /></Suspense>,
    achievements: <Suspense fallback={<AppLoadingSkeleton />}><AchievementsApp /></Suspense>,
    terminal:     <Suspense fallback={<AppLoadingSkeleton />}><TerminalApp /></Suspense>,
    profile:      <Suspense fallback={<AppLoadingSkeleton />}><ProfileApp onLogout={onLogout} /></Suspense>,
    admin:        <Suspense fallback={<AppLoadingSkeleton />}><AdminApp /></Suspense>,
    gallery:      <Suspense fallback={<AppLoadingSkeleton />}><GalleryApp /></Suspense>,
  }

  return (
    <MeetupProvider>
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{
        background: isMobileDesktop
          ? "linear-gradient(160deg, #2A1580 0%, #4B2FA8 50%, #6B4FE8 100%)"
          : "linear-gradient(145deg, #EDE8FF 0%, #E8E3FF 30%, #EAE6FF 60%, #E5E0FF 100%)"
      }}
    >
      {/* ── Desktop wallpaper (sm+ only) ── */}
      <Wallpaper hideCenter={introIsMaximized} />

      {/* ── Quote ticker (desktop only) ── */}
      {!introIsMaximized && !isMobileDesktop && <QuoteTicker />}

      {/* ── Mobile background: HomeApp rendered as wallpaper ── */}
      {isMobileDesktop && (
        <div
          className="sm:hidden absolute inset-x-0 top-0 bottom-14 overflow-y-auto hide-scrollbar"
          style={{ zIndex: 1 }}
        >
          <Suspense fallback={<AppLoadingSkeleton />}>
            <HomeApp onLearnMore={() => openApp("about")} />
          </Suspense>
        </div>
      )}

      {/* ── Right sidebar widgets (desktop lg+) ── */}
      {!introIsMaximized && (
        <div className="absolute right-4 top-4 hidden w-64 lg:flex flex-col gap-3 z-10">
          <WeatherWidget />
          <CalendarWidget />
        </div>
      )}

      {/* ── DESKTOP: 2-col icon grid (left sidebar) ── */}
      <div
        className="hidden sm:grid absolute left-4 top-4 grid-cols-2 gap-2 z-10 hide-scrollbar"
        style={{ paddingBottom: "72px", maxHeight: "calc(100dvh - 20px)", overflowY: "auto" }}
      >
        {desktopApps.map((app, i) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, type: "spring" as const, stiffness: 260, damping: 22 }}
          >
            <DesktopIcon
              icon={app.icon}
              label={app.label}
              gradient={app.gradient}
              onClick={() => openApp(app.id)}
            />
          </motion.div>
        ))}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: desktopApps.length * 0.04, type: "spring" as const, stiffness: 260, damping: 22 }}
          >
            <DesktopIcon
              icon={<ShieldCheck className="h-6 w-6" />}
              label="Admin"
              gradient="linear-gradient(135deg,#1E1060,#2D1B8A)"
              onClick={() => openApp("admin")}
            />
          </motion.div>
        )}
      </div>

      {/* ── Windows ── */}
      <AnimatePresence>
        {windows
          .filter((win) => !(isMobileDesktop && win.id === "home"))
          .map((win) => (
            <Window
              key={win.id}
              id={win.id}
              title={appTitles[win.id]}
              icon={appIcons[win.id]}
              isActive={getActiveApp() === win.id}
              isMinimized={win.isMinimized}
              isMaximized={win.isMaximized}
              initialPosition={getInitialPosition(win.id)}
              initialSize={
                typeof window !== "undefined"
                  ? win.id === "terminal"
                    ? { width: Math.min(640, window.innerWidth - 16), height: Math.min(440, window.innerHeight - 100) }
                    : win.id === "profile"
                    ? { width: Math.min(520, window.innerWidth - 16), height: Math.min(640, window.innerHeight - 100) }
                    : { width: Math.min(840, window.innerWidth - 16), height: Math.min(620, window.innerHeight - 100) }
                  : win.id === "terminal" ? { width: 640, height: 440 }
                  : win.id === "profile"  ? { width: 520, height: 640 }
                  :                         { width: 840, height: 620 }
              }
              onClose={() => closeApp(win.id)}
              onMinimize={() => minimizeApp(win.id)}
              onMaximize={() => maximizeApp(win.id)}
              onFocus={() => focusApp(win.id)}
              zIndex={win.zIndex}
            >
              {appContent[win.id]}
            </Window>
          ))}
      </AnimatePresence>

      {/* ── Start Menu ── */}
      <AnimatePresence>
        {showStartMenu && (
          <StartMenu
            onAppClick={(id) => { openApp(id as AppId); setShowStartMenu(false) }}
            onClose={() => setShowStartMenu(false)}
            onShutdown={() => { signOut(); onLogout() }}
            isAdmin={isAdmin}
          />
        )}
      </AnimatePresence>

      {/* ── Taskbar ── */}
      <Taskbar
        openApps={windows.map((w) => w.id)}
        activeApp={getActiveApp()}
        onAppClick={openApp}
        onStartClick={() => setShowStartMenu((v) => !v)}
        onMobileMenuClick={() => setShowMobileMenu(true)}
      />

      {/* ── Mobile App Drawer ── */}
      <AppDrawer
        apps={desktopApps}
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        onAppClick={openApp}
      />
    </div>
    </MeetupProvider>
  )
}
