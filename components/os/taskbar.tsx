"use client"

import { useNotifications } from "@/lib/notifications-context"
import { NotificationCenter } from "./notification-center"
import type { AppId } from "@/lib/types"

interface TaskbarProps {
  openApps: AppId[]
  activeApp: AppId | null
  onAppClick: (appId: AppId) => void
  onStartClick: () => void
  onMobileMenuClick?: () => void
}

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  Bell, Wifi, Volume2, Battery, Search,
  Home, Cloud, Users, Calendar, FolderOpen,
  BookOpen, Share2, Mail, Trophy, Terminal, X, LayoutGrid, ImageIcon
} from "lucide-react"

const taskbarApps: { id: AppId; icon: React.ReactNode; label: string }[] = [
  { id: "home",         icon: <Home className="h-4 w-4 sm:h-5 sm:w-5" />,       label: "Home" },
  { id: "about",        icon: <Cloud className="h-4 w-4 sm:h-5 sm:w-5" />,      label: "About" },
  { id: "team",         icon: <Users className="h-4 w-4 sm:h-5 sm:w-5" />,      label: "Team" },
  { id: "events",       icon: <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />,   label: "Events" },
  { id: "projects",     icon: <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5" />, label: "Projects" },
  { id: "resources",    icon: <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />,   label: "Resources" },
  { id: "social",       icon: <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />,     label: "Social" },
  { id: "contact",      icon: <Mail className="h-4 w-4 sm:h-5 sm:w-5" />,       label: "Contact" },
  { id: "achievements", icon: <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />,     label: "Achievements" },
  { id: "gallery",      icon: <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />,  label: "Gallery" },
  { id: "terminal",     icon: <Terminal className="h-4 w-4 sm:h-5 sm:w-5" />,   label: "Terminal" },
]

const searchableApps: { id: AppId; label: string; icon: React.ElementType; gradient: string }[] = [
  { id: "home",         label: "Home",         icon: Home,       gradient: "linear-gradient(135deg,#6B4FE8,#8B6FFF)" },
  { id: "about",        label: "About Us",     icon: Cloud,      gradient: "linear-gradient(135deg,#B8A4FF,#8B6FFF)" },
  { id: "team",         label: "Team",         icon: Users,      gradient: "linear-gradient(135deg,#5BA8D8,#4B90C8)" },
  { id: "events",       label: "Events",       icon: Calendar,   gradient: "linear-gradient(135deg,#FF9900,#E88800)" },
  { id: "projects",     label: "Projects",     icon: FolderOpen, gradient: "linear-gradient(135deg,#50C88A,#3AAA72)" },
  { id: "resources",    label: "Resources",    icon: BookOpen,   gradient: "linear-gradient(135deg,#6B4FE8,#5B3FD8)" },
  { id: "social",       label: "Social",       icon: Share2,     gradient: "linear-gradient(135deg,#E85580,#C83565)" },
  { id: "contact",      label: "Contact",      icon: Mail,       gradient: "linear-gradient(135deg,#5BA8D8,#3B88C0)" },
  { id: "achievements", label: "Achievements", icon: Trophy,     gradient: "linear-gradient(135deg,#FFB800,#E89800)" },
  { id: "gallery",      label: "Gallery",      icon: ImageIcon,  gradient: "linear-gradient(135deg,#E85580,#B83060)" },
  { id: "terminal",     label: "Terminal",     icon: Terminal,   gradient: "linear-gradient(135deg,#2D1B8A,#1E1060)" },
]

export function Taskbar({ openApps, activeApp, onAppClick, onStartClick, onMobileMenuClick }: TaskbarProps) {
  const { unreadCount } = useNotifications()
  const [time, setTime]                   = useState<Date | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [query, setQuery]                 = useState("")
  const [searchOpen, setSearchOpen]       = useState(false)
  const [showMidnightPopup, setShowMidnightPopup] = useState(false)
  const searchRef                         = useRef<HTMLDivElement>(null)
  const inputRef                          = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleClockClick = () => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    if (hours === 0 && minutes === 0) {
      setShowMidnightPopup(true)
      setTimeout(() => setShowMidnightPopup(false), 4000)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const trimmed = query.trim()
  const results = trimmed
    ? searchableApps.filter((a) =>
        a.label.toLowerCase().includes(trimmed.toLowerCase())
      )
    : searchableApps

  const handleSelect = (id: AppId) => {
    onAppClick(id)
    setQuery("")
    setSearchOpen(false)
    inputRef.current?.blur()
  }

  return (
    <div className="neu-taskbar fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-between px-2">

      {/* Start Button */}
      <motion.button
        onClick={onStartClick}
        className="flex h-10 items-center gap-1.5 sm:gap-2 rounded-xl px-2 sm:px-3 font-semibold text-white flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, #7C3AED, #A855F7)",
          boxShadow: "0 0 16px rgba(168,85,247,0.50), 0 4px 12px rgba(107,79,232,0.40)",
          border: "1px solid rgba(168,85,247,0.40)",
        }}
        whileHover={{ y: -2, boxShadow: "0 0 24px rgba(168,85,247,0.65), 0 6px 16px rgba(107,79,232,0.50)" }}
        whileTap={{ scale: 0.94 }}
      >
        <Image src="/logo-icon.png" alt="Start" width={20} height={20} className="object-contain brightness-0 invert" unoptimized />
        <span className="hidden text-sm sm:inline">Start</span>
      </motion.button>

      {/* ── All Apps button — mobile only, sits right next to Start in taskbar ── */}
      <motion.button
        onClick={onMobileMenuClick}
        className="sm:hidden flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ml-1.5"
        style={{
          background: "rgba(107,79,232,0.15)",
          boxShadow: "3px 3px 8px rgba(107,79,232,0.20), -3px -3px 8px rgba(255,255,255,0.60)",
          color: "#6B4FE8",
        }}
        whileTap={{ scale: 0.90 }}
        title="All Apps"
      >
        <LayoutGrid className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
      </motion.button>


      {/* ── Taskbar Search Bar — hidden on mobile, visible md+ ── */}
      <div ref={searchRef} className="relative mx-2 hidden md:block">
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{
            minWidth: "160px",
            width: searchOpen ? "220px" : "160px",
            transition: "width 0.2s ease",
            background: "rgba(168,85,247,0.10)",
            border: "1px solid rgba(168,85,247,0.20)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <Search className="h-4 w-4 flex-shrink-0" style={{ color: "#9775FA" }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearchOpen(true) }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search apps..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#6B5FA0]"
            style={{ color: "#DDD6FE", fontSize: "16px" /* prevent iOS zoom */ }}
          />
          {query && (
            <button onClick={() => { setQuery(""); inputRef.current?.focus() }}>
              <X className="h-3.5 w-3.5" style={{ color: "#9775FA" }} />
            </button>
          )}
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              className="neu-panel absolute bottom-12 left-0 z-50 w-56 overflow-hidden rounded-2xl py-2"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ type: "spring" as const, stiffness: 340, damping: 26 }}
            >
              {/* Label */}
              <p className="px-3 pb-1.5 pt-0.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#9B8FC8" }}>
                {trimmed.toLowerCase() === "easter egg"
                  ? "Secret Found!"
                  : trimmed
                  ? results.length > 0 ? `${results.length} app${results.length > 1 ? "s" : ""}` : "No results"
                  : "All Apps"}
              </p>

              {trimmed.toLowerCase() === "easter egg" ? (
                <div className="px-3.5 py-3 text-xs font-semibold text-purple-300">
                  👀 you already found one
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-0.5 px-2">
                  {results.map((app, i) => {
                    const Icon = app.icon
                    return (
                      <motion.button
                        key={app.id}
                        onClick={() => handleSelect(app.id)}
                        className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left"
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03, type: "spring" as const, stiffness: 340, damping: 24 }}
                        whileHover={{ background: "rgba(168,85,247,0.12)", x: 2 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <div
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-white"
                          style={{ background: app.gradient, boxShadow: "2px 2px 8px rgba(107,79,232,0.35)" }}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium" style={{ color: "#DDD6FE" }}>{app.label}</span>
                        {openApps.includes(app.id) && (
                          <span className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: "#A855F7" }} />
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              ) : (
                <p className="px-3 py-3 text-sm" style={{ color: "#9B8FC8" }}>
                  No apps match &quot;{trimmed}&quot;
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Open Apps — hidden on mobile, shown sm+ in a scrollable row */}
      <div className="hidden sm:flex flex-1 items-center justify-center gap-0.5 overflow-x-auto px-1">
        {taskbarApps.map((app) => {
          const isOpen   = openApps.includes(app.id)
          const isActive = activeApp === app.id

          return (
            <motion.button
              key={app.id}
              onClick={() => onAppClick(app.id)}
              className="relative flex h-9 min-w-9 items-center justify-center rounded-xl px-1.5 sm:px-3 transition-colors"
              style={{
                background: isActive
                  ? "rgba(168,85,247,0.18)"
                  : isOpen
                  ? "rgba(168,85,247,0.10)"
                  : "transparent",
                color: isActive ? "#C084FC" : isOpen ? "#A78BFA" : "#6B5FA0",
                boxShadow: isActive
                  ? "inset 0 1px 0 rgba(168,85,247,0.30), 0 0 12px rgba(168,85,247,0.15)"
                  : isOpen
                  ? "0 0 0 1px rgba(168,85,247,0.15)"
                  : "none",
              }}
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              title={app.label}
            >
              {app.icon}

              {isOpen && (
                <motion.div
                  className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full"
                  style={{ background: isActive ? "#A855F7" : "#7C3AED" }}
                  animate={{ width: isActive ? 20 : 6, height: 3 }}
                  transition={{ type: "spring" as const, stiffness: 400, damping: 28 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* ── Mobile center: scrollable open-apps row ── */}
      <div className="flex sm:hidden flex-1 items-center overflow-hidden px-1 gap-1">

        {/* ── Persistent Home button — always visible, tapping = go back to homepage ── */}
        <motion.button
          onClick={() => onAppClick("home")}
          className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl"
          style={{
            background: activeApp === "home"
              ? "rgba(107,79,232,0.14)"
              : "rgba(107,79,232,0.08)",
            color: "#6B4FE8",
            boxShadow: "2px 2px 6px rgba(107,79,232,0.15), -2px -2px 6px rgba(255,255,255,0.50)",
          }}
          whileTap={{ scale: 0.90 }}
          title="Home"
        >
          <Home className="h-4 w-4" />
        </motion.button>

        {/* Thin divider */}
        <div className="h-6 w-px flex-shrink-0" style={{ background: "rgba(107,79,232,0.18)" }} />

        {/* Scrollable open apps (excluding home — it's always shown above) */}
        <div className="flex flex-1 items-center gap-0.5 overflow-x-auto hide-scrollbar">
          {taskbarApps
            .filter((app) => app.id !== "home" && openApps.includes(app.id))
            .map((app) => {
              const isActive = activeApp === app.id
              return (
                <motion.button
                  key={app.id}
                  onClick={() => onAppClick(app.id)}
                  className="relative flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{
                    background: isActive
                      ? "rgba(168,85,247,0.18)"
                      : "rgba(168,85,247,0.08)",
                    color: isActive ? "#C084FC" : "#7C6FAA",
                    boxShadow: isActive
                      ? "inset 0 1px 0 rgba(168,85,247,0.30)"
                      : "0 0 0 1px rgba(168,85,247,0.12)",
                  }}
                  whileTap={{ scale: 0.92 }}
                  title={app.label}
                >
                  {app.icon}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full"
                      style={{ background: "#A855F7", width: 14, height: 3 }}
                      layoutId="mobile-active-dot"
                    />
                  )}
                </motion.button>
              )
            })}
          {openApps.filter(id => id !== "home").length === 0 && (
            <span className="text-[11px] px-1 whitespace-nowrap" style={{ color: "#6B5FA0" }}>
              Tap ⊞ to open apps
            </span>
          )}
        </div>
      </div>

      {/* System Tray */}
      <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
        <motion.button
          onClick={() => setShowNotifications((v) => !v)}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ color: showNotifications ? "#A855F7" : "#9775FA" }}
          whileHover={{ scale: 1.1, y: -1 }}
          whileTap={{ scale: 0.93 }}
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span
              className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full text-[9px] font-bold text-white px-0.5"
              style={{ background: "#6B4FE8" }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </motion.button>

        <div
          className="hidden items-center gap-2 rounded-xl px-3 py-2 sm:flex"
          style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.15)" }}
        >
          <Wifi    className="h-4 w-4" style={{ color: "#9775FA" }} />
          <Volume2 className="h-4 w-4" style={{ color: "#9775FA" }} />
          <Battery className="h-4 w-4" style={{ color: "#9775FA" }} />
        </div>

        <motion.div
          onClick={handleClockClick}
          className="flex flex-col items-end rounded-xl px-2 sm:px-3 py-1.5 cursor-pointer hover:bg-white/10"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="text-xs sm:text-sm font-semibold tabular-nums" style={{ color: "#EDE9FE" }}>
            {time ? time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
          </span>
          <span className="hidden sm:block text-[11px]" style={{ color: "#9775FA" }}>
            {time ? time.toLocaleDateString([], { month: "short", day: "numeric" }) : "---"}
          </span>
        </motion.div>
      </div>

      {/* Notification Center — real functional panel */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Midnight Building Easter Egg Popup */}
      <AnimatePresence>
        {showMidnightPopup && (
          <motion.div
            className="absolute bottom-16 right-4 z-50 rounded-xl px-4 py-3 text-xs font-semibold text-white shadow-lg text-center"
            style={{
              background: "linear-gradient(135deg, #1E1060, #6B4FE8)",
              border: "1px solid rgba(168, 85, 247, 0.4)",
              boxShadow: "0 8px 32px rgba(107, 79, 232, 0.4)",
            }}
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
          >
            Still building at midnight? You belong here 🌙
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
