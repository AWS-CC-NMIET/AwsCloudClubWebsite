"use client"

import { useState, useCallback, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Home, Cloud, Users, Calendar, FolderOpen,
  BookOpen, Share2, Mail, Trophy, Terminal, Sparkles, UserCircle, ShieldCheck
} from "lucide-react"
import Image from "next/image"
import { Window } from "./window"
import { Taskbar } from "./taskbar"
import { DesktopIcon } from "./desktop-icon"
import { StartMenu } from "./start-menu"
import { HomeApp } from "../apps/home-app"
import { AboutApp } from "../apps/about-app"
import { TeamApp } from "../apps/team-app"
import { EventsApp } from "../apps/events-app"
import { ProjectsApp } from "../apps/projects-app"
import { ResourcesApp } from "../apps/resources-app"
import { SocialApp } from "../apps/social-app"
import { ContactApp } from "../apps/contact-app"
import { AchievementsApp } from "../apps/achievements-app"
import { TerminalApp } from "../apps/terminal-app"
import { ProfileApp } from "../apps/profile-app"
import { AdminApp } from "../apps/admin-app"
import { getAccessToken, parseJwtPayload } from "@/lib/auth-client"

type AppId =
  | "home" | "about" | "team" | "events" | "projects"
  | "resources" | "social" | "contact" | "achievements" | "terminal"
  | "profile" | "admin"

interface WindowState {
  id: AppId
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
}

const desktopApps: { id: AppId; label: string; icon: React.ReactNode; gradient: string }[] = [
  { id: "home",         label: "Home",         icon: <Home className="h-6 w-6" />,       gradient: "linear-gradient(135deg,#6B4FE8,#8B6FFF)" },
  { id: "about",        label: "About Us",     icon: <Cloud className="h-6 w-6" />,      gradient: "linear-gradient(135deg,#B8A4FF,#8B6FFF)" },
  { id: "team",         label: "Team",         icon: <Users className="h-6 w-6" />,      gradient: "linear-gradient(135deg,#5BA8D8,#4B90C8)" },
  { id: "events",       label: "Events",       icon: <Calendar className="h-6 w-6" />,   gradient: "linear-gradient(135deg,#FF9900,#E88800)" },
  { id: "projects",     label: "Projects",     icon: <FolderOpen className="h-6 w-6" />, gradient: "linear-gradient(135deg,#50C88A,#3AAA72)" },
  { id: "resources",    label: "Resources",    icon: <BookOpen className="h-6 w-6" />,   gradient: "linear-gradient(135deg,#6B4FE8,#5B3FD8)" },
  { id: "social",       label: "Social",       icon: <Share2 className="h-6 w-6" />,     gradient: "linear-gradient(135deg,#E85580,#C83565)" },
  { id: "contact",      label: "Contact",      icon: <Mail className="h-6 w-6" />,       gradient: "linear-gradient(135deg,#5BA8D8,#3B88C0)" },
  { id: "achievements", label: "Achievements", icon: <Trophy className="h-6 w-6" />,     gradient: "linear-gradient(135deg,#FFB800,#E89800)" },
  { id: "terminal",     label: "Terminal",     icon: <Terminal className="h-6 w-6" />,   gradient: "linear-gradient(135deg,#2D1B8A,#1E1060)" },
]

const appTitles: Record<AppId, string> = {
  home: "Introduction", about: "About Us", team: "Team",
  events: "Events", projects: "Projects", resources: "Resources",
  social: "Social Media", contact: "Contact Us",
  achievements: "Achievements", terminal: "Terminal", profile: "My Profile",
  admin: "Admin Panel",
}

const appIcons: Record<AppId, React.ReactNode> = {
  home: <Home className="h-4 w-4" />, about: <Cloud className="h-4 w-4" />,
  team: <Users className="h-4 w-4" />, events: <Calendar className="h-4 w-4" />,
  projects: <FolderOpen className="h-4 w-4" />, resources: <BookOpen className="h-4 w-4" />,
  social: <Share2 className="h-4 w-4" />, contact: <Mail className="h-4 w-4" />,
  achievements: <Trophy className="h-4 w-4" />, terminal: <Terminal className="h-4 w-4" />,
  profile: <UserCircle className="h-4 w-4" />, admin: <ShieldCheck className="h-4 w-4" />,
}


// Fixed positions for background particles — no random in render
const bgFloaters = [
  { w: 180, h: 180, left: "5%",  top: "8%",  dur: 6,   delay: 0,   opacity: 0.06 },
  { w: 120, h: 120, left: "88%", top: "6%",  dur: 5,   delay: 1.2, opacity: 0.07 },
  { w: 200, h: 200, left: "75%", top: "55%", dur: 7,   delay: 0.5, opacity: 0.05 },
  { w: 90,  h: 90,  left: "18%", top: "72%", dur: 4.5, delay: 0.8, opacity: 0.08 },
  { w: 140, h: 140, left: "55%", top: "15%", dur: 5.5, delay: 0.3, opacity: 0.06 },
  { w: 100, h: 100, left: "92%", top: "35%", dur: 6.5, delay: 1.5, opacity: 0.07 },
  { w: 160, h: 160, left: "38%", top: "78%", dur: 5,   delay: 0.7, opacity: 0.05 },
  { w: 80,  h: 80,  left: "2%",  top: "45%", dur: 4,   delay: 1.0, opacity: 0.09 },
  { w: 110, h: 110, left: "65%", top: "88%", dur: 6,   delay: 0.2, opacity: 0.06 },
  { w: 130, h: 130, left: "28%", top: "30%", dur: 7,   delay: 1.8, opacity: 0.05 },
]

const bgSparkles = [
  { top: "8%",  left: "22%",  delay: 0,   size: 12, dur: 3   },
  { top: "15%", left: "68%",  delay: 0.6, size: 8,  dur: 2.5 },
  { top: "28%", left: "88%",  delay: 1.2, size: 14, dur: 3.5 },
  { top: "42%", left: "6%",   delay: 0.4, size: 10, dur: 2.8 },
  { top: "58%", left: "78%",  delay: 1.8, size: 16, dur: 4   },
  { top: "70%", left: "42%",  delay: 0.9, size: 9,  dur: 3.2 },
  { top: "82%", left: "14%",  delay: 0.2, size: 11, dur: 2.6 },
  { top: "88%", left: "85%",  delay: 1.4, size: 13, dur: 3.8 },
  { top: "22%", left: "36%",  delay: 0.7, size: 7,  dur: 2.4 },
  { top: "65%", left: "60%",  delay: 1.1, size: 15, dur: 3.6 },
  { top: "50%", left: "94%",  delay: 0.5, size: 8,  dur: 2.9 },
  { top: "35%", left: "52%",  delay: 1.6, size: 10, dur: 3.1 },
]

// Floating dots scattered across desktop
const bgDots = [
  { left: "12%", top: "20%", dur: 4,   delay: 0,   size: 5 },
  { left: "78%", top: "12%", dur: 5,   delay: 0.7, size: 4 },
  { left: "45%", top: "68%", dur: 3.5, delay: 1.2, size: 6 },
  { left: "88%", top: "45%", dur: 6,   delay: 0.3, size: 4 },
  { left: "22%", top: "85%", dur: 4.5, delay: 0.9, size: 5 },
  { left: "60%", top: "38%", dur: 5.5, delay: 1.5, size: 3 },
  { left: "5%",  top: "60%", dur: 3.8, delay: 0.4, size: 5 },
  { left: "70%", top: "78%", dur: 4.8, delay: 1.1, size: 4 },
  { left: "35%", top: "48%", dur: 5.2, delay: 0.6, size: 3 },
  { left: "90%", top: "68%", dur: 4.2, delay: 1.8, size: 6 },
  { left: "50%", top: "92%", dur: 3.6, delay: 0.2, size: 4 },
  { left: "15%", top: "50%", dur: 5.8, delay: 1.3, size: 3 },
]

export function Desktop({ onLogout }: { onLogout: () => void }) {
  const [windows, setWindows] = useState<WindowState[]>([
    { id: "home", isMinimized: false, isMaximized: true, zIndex: 10 },
  ])
  const [showStartMenu, setShowStartMenu] = useState(false)
  const [highestZIndex, setHighestZIndex] = useState(11)
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if current user belongs to Cognito "admins" group
  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      const payload = parseJwtPayload(token)
      const groups = (payload["cognito:groups"] as string[]) || []
      setIsAdmin(groups.includes("admins"))
    }
  }, [])

  const appContent: Record<AppId, React.ReactNode> = {
    home: <HomeApp />, about: <AboutApp />, team: <TeamApp />,
    events: <EventsApp />, projects: <ProjectsApp />, resources: <ResourcesApp />,
    social: <SocialApp />, contact: <ContactApp />,
    achievements: <AchievementsApp />, terminal: <TerminalApp />,
    profile: <ProfileApp onLogout={onLogout} />,
    admin: <AdminApp />,
  }

  const openApp = useCallback((appId: AppId) => {
    setWindows((prev) => {
      const existing = prev.find((w) => w.id === appId)
      if (existing) {
        if (existing.isMinimized) {
          return prev.map((w) =>
            w.id === appId ? { ...w, isMinimized: false, zIndex: highestZIndex + 1 } : w
          )
        }
        setHighestZIndex((z) => z + 1)
        return prev.map((w) =>
          w.id === appId ? { ...w, zIndex: highestZIndex + 1 } : w
        )
      }
      setHighestZIndex((z) => z + 1)
      return [...prev, { id: appId, isMinimized: false, isMaximized: false, zIndex: highestZIndex + 1 }]
    })
  }, [highestZIndex])

  const closeApp    = useCallback((id: AppId) => setWindows((p) => p.filter((w) => w.id !== id)), [])
  const minimizeApp = useCallback((id: AppId) => setWindows((p) => p.map((w) => w.id === id ? { ...w, isMinimized: true } : w)), [])
  const maximizeApp = useCallback((id: AppId) => setWindows((p) => p.map((w) => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)), [])

  const focusApp = useCallback((id: AppId) => {
    setHighestZIndex((z) => z + 1)
    setWindows((p) => p.map((w) => w.id === id ? { ...w, zIndex: highestZIndex + 1 } : w))
  }, [highestZIndex])

  const getActiveApp = () => {
    const visible = windows.filter((w) => !w.isMinimized)
    if (!visible.length) return null
    return visible.reduce((a, b) => (a.zIndex > b.zIndex ? a : b)).id
  }

  const getInitialPosition = (appId: AppId) => {
    const index = desktopApps.findIndex((a) => a.id === appId)
    const i = index < 0 ? 0 : index
    return { x: 200 + (i % 4) * 40, y: 60 + (i % 5) * 24 }
  }

  const introIsMaximized = !!windows.find((w) => w.id === "home" && w.isMaximized && !w.isMinimized)

  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: "#EAE6FF" }}>

      {/* ══════════════════════════════════════════
          LIVE WALLPAPER — always visible behind windows
          ══════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        {/* Subtle dot grid */}
        <svg className="absolute inset-0 h-full w-full opacity-25">
          <defs>
            <pattern id="dot" width="36" height="36" patternUnits="userSpaceOnUse">
              <circle cx="18" cy="18" r="0.9" fill="#C2BAF0" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot)" />
        </svg>

        {/* Large corner gradient orbs */}
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(107,79,232,0.12) 0%, transparent 65%)" }} />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(184,164,255,0.14) 0%, transparent 65%)" }} />
        <div className="absolute top-1/2 -translate-y-1/2 -right-24 h-72 w-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(91,168,216,0.08) 0%, transparent 65%)" }} />
        <div className="absolute bottom-16 left-1/4 h-56 w-56 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,153,0,0.05) 0%, transparent 65%)" }} />

        {/* Floating blobs */}
        {bgFloaters.map((f, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: f.w, height: f.h, left: f.left, top: f.top,
              background: `radial-gradient(circle, rgba(107,79,232,${f.opacity}) 0%, transparent 70%)`,
            }}
            animate={{ y: [0, -20, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        {/* Sparkle stars scattered */}
        {bgSparkles.map((s, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ top: s.top, left: s.left }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], rotate: [0, 180, 360] }}
            transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z"
                fill="rgba(107,79,232,0.55)"
              />
            </svg>
          </motion.div>
        ))}

        {/* Floating purple dots */}
        {bgDots.map((d, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: d.left, top: d.top,
              width: d.size, height: d.size,
              background: "rgba(107,79,232,0.22)",
            }}
            animate={{ y: [0, -14, 0], opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        {/* ── CENTRE LOGO — large, crisp, animated ── */}
        {!introIsMaximized && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Pulse rings */}
            {[340, 460, 590].map((r, i) => (
              <motion.div
                key={r}
                className="absolute rounded-full"
                style={{
                  width: r, height: r,
                  border: `1.5px solid rgba(107,79,232,${0.12 - i * 0.03})`,
                }}
                animate={{ scale: [1, 1.10, 1], opacity: [0.7, 0.2, 0.7] }}
                transition={{ duration: 4 + i * 1.8, delay: i * 1.4, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}

            {/* Slow rotating dashed ring */}
            <motion.div
              className="absolute rounded-full"
              style={{ width: 390, height: 390, border: "1px dashed rgba(107,79,232,0.12)" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            />
            {/* Counter-rotating ring */}
            <motion.div
              className="absolute rounded-full"
              style={{ width: 460, height: 460, border: "1px dashed rgba(184,164,255,0.09)" }}
              animate={{ rotate: -360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            />

            {/* Orbiting accent dots */}
            {[0, 60, 120, 180, 240, 300].map((angle, i) => {
              const rad = (angle * Math.PI) / 180
              const r = 200
              return (
                <motion.div
                  key={angle}
                  className="absolute rounded-full"
                  style={{
                    width: 7, height: 7,
                    background: i % 2 === 0 ? "rgba(107,79,232,0.35)" : "rgba(184,164,255,0.45)",
                    x: Math.cos(rad) * r,
                    y: Math.sin(rad) * r,
                  }}
                  animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2.5, delay: i * 0.42, repeat: Infinity, ease: "easeInOut" }}
                />
              )
            })}

            {/* The logo */}
            <motion.div
              className="relative z-10"
              animate={{ y: [0, -18, 0], rotate: [0, 1.8, -1.8, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Glow behind logo */}
              <div
                className="absolute inset-0 rounded-3xl blur-2xl"
                style={{
                  background: "radial-gradient(circle, rgba(107,79,232,0.25) 0%, transparent 70%)",
                  margin: "-30px",
                }}
              />
              <div
                style={{
                  opacity: 0.28,
                  filter: "saturate(1.2) brightness(0.95)",
                }}
              >
                <Image
                  src="/logo-full.png"
                  alt=""
                  width={300}
                  height={300}
                  className="rounded-3xl select-none"
                  draggable={false}
                  priority
                />
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* ── Desktop Icons — 2-col, above taskbar ── */}
      <div
        className="absolute left-4 top-4 grid grid-cols-2 gap-2 z-10"
        style={{ paddingBottom: "72px", maxHeight: "calc(100vh - 20px)", overflowY: "auto" }}
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
      </div>

      {/* ── Welcome widget (top-right) ── */}
      {!introIsMaximized && (
        <motion.div
          className="neu-raised absolute right-4 top-4 hidden w-68 overflow-hidden rounded-2xl lg:block z-10"
          initial={{ opacity: 0, y: -16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" as const, stiffness: 260 }}
        >
          <div
            className="px-4 py-3"
            style={{ background: "linear-gradient(135deg, rgba(107,79,232,0.12), rgba(184,164,255,0.08))" }}
          >
            <div className="mb-1 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium" style={{ color: "#7B6FC0" }}>System Status: Online</span>
            </div>
            <div className="flex items-center gap-2">
              <Image src="/logo-full.png" alt="Logo" width={30} height={30} className="rounded-lg object-cover" />
              <div>
                <h3 className="text-sm font-bold" style={{ color: "#1E1060" }}>Cloud OS</h3>
                <p className="text-xs font-medium" style={{ color: "#6B4FE8" }}>AWS Cloud Club NMIET</p>
              </div>
            </div>
          </div>
          <div className="p-3">
            <p className="mb-2 text-xs" style={{ color: "#7B6FC0" }}>
              Click icons to open apps. Drag windows to move them.
            </p>
            <div className="neu-inset-sm flex items-center gap-2 rounded-xl px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#6B4FE8" }} />
              <span className="text-xs font-medium" style={{ color: "#6B4FE8" }}>
                Double-click to maximize
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Windows ── */}
      <AnimatePresence>
        {windows.map((win) => (
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
              win.id === "terminal" ? { width: 640, height: 440 } :
              win.id === "profile"  ? { width: 520, height: 640 } :
              { width: 840, height: 620 }
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
      />
    </div>
  )
}
