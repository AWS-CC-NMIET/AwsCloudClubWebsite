"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  Bell, Wifi, Volume2, Battery, Search,
  Home, Cloud, Users, Calendar, FolderOpen,
  BookOpen, Share2, Mail, Trophy, Terminal, UserCircle, ShieldCheck
} from "lucide-react"

type AppId =
  | "home" | "about" | "team" | "events" | "projects"
  | "resources" | "social" | "contact" | "achievements" | "terminal"
  | "profile" | "admin"

interface TaskbarProps {
  openApps: AppId[]
  activeApp: AppId | null
  onAppClick: (appId: AppId) => void
  onStartClick: () => void
}

const taskbarApps: { id: AppId; icon: React.ReactNode; label: string }[] = [
  { id: "home",         icon: <Home className="h-5 w-5" />,       label: "Home" },
  { id: "about",        icon: <Cloud className="h-5 w-5" />,      label: "About" },
  { id: "team",         icon: <Users className="h-5 w-5" />,      label: "Team" },
  { id: "events",       icon: <Calendar className="h-5 w-5" />,   label: "Events" },
  { id: "projects",     icon: <FolderOpen className="h-5 w-5" />, label: "Projects" },
  { id: "resources",    icon: <BookOpen className="h-5 w-5" />,   label: "Resources" },
  { id: "social",       icon: <Share2 className="h-5 w-5" />,     label: "Social" },
  { id: "contact",      icon: <Mail className="h-5 w-5" />,       label: "Contact" },
  { id: "achievements", icon: <Trophy className="h-5 w-5" />,     label: "Achievements" },
  { id: "terminal",     icon: <Terminal className="h-5 w-5" />,   label: "Terminal" },
]

export function Taskbar({ openApps, activeApp, onAppClick, onStartClick }: TaskbarProps) {
  const [time, setTime] = useState<Date | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div
      className="neu-taskbar fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-between px-2"
    >
      {/* Start Button */}
      <motion.button
        onClick={onStartClick}
        className="flex h-10 items-center gap-2 rounded-xl px-3 font-semibold text-white"
        style={{
          background: "linear-gradient(135deg, #6B4FE8, #8B6FFF)",
          boxShadow: "4px 4px 12px rgba(107,79,232,0.40), -3px -3px 8px rgba(255,255,255,0.60)",
        }}
        whileHover={{ y: -2, boxShadow: "6px 6px 16px rgba(107,79,232,0.50), -3px -3px 10px rgba(255,255,255,0.70)" }}
        whileTap={{ scale: 0.94 }}
      >
        <Image
          src="/logo-icon.png"
          alt="Start"
          width={22}
          height={22}
          className="object-contain"
        />
        <span className="hidden text-sm sm:inline">Start</span>
      </motion.button>

      {/* Search Bar */}
      <div
        className="neu-inset mx-2 hidden items-center gap-2 rounded-xl px-3 py-2 md:flex"
        style={{ minWidth: "160px" }}
      >
        <Search className="h-4 w-4 flex-shrink-0" style={{ color: "#9B8FC8" }} />
        <input
          type="text"
          placeholder="Search apps..."
          className="w-32 bg-transparent text-sm outline-none lg:w-44"
          style={{ color: "#1E1060" }}
        />
      </div>

      {/* Open Apps */}
      <div className="flex flex-1 items-center justify-center gap-0.5 overflow-x-auto px-2">
        {taskbarApps.map((app) => {
          const isOpen   = openApps.includes(app.id)
          const isActive = activeApp === app.id

          return (
            <motion.button
              key={app.id}
              onClick={() => onAppClick(app.id)}
              className="relative flex h-10 min-w-10 items-center justify-center rounded-xl px-3 transition-colors"
              style={{
                background: isActive
                  ? "rgba(107,79,232,0.12)"
                  : isOpen
                  ? "rgba(194,186,240,0.25)"
                  : "transparent",
                color: isActive ? "#6B4FE8" : isOpen ? "#3D2A90" : "#9B8FC8",
                boxShadow: isActive
                  ? "inset 3px 3px 8px #C2BAF0, inset -3px -3px 8px #FFFFFF"
                  : isOpen
                  ? "3px 3px 8px #C2BAF0, -3px -3px 8px #FFFFFF"
                  : "none",
              }}
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              title={app.label}
            >
              {app.icon}

              {/* Active indicator dot */}
              {isOpen && (
                <motion.div
                  className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full"
                  style={{ background: isActive ? "#6B4FE8" : "#B8A4FF" }}
                  animate={{ width: isActive ? 20 : 6, height: 3 }}
                  transition={{ type: "spring" as const, stiffness: 400, damping: 28 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* System Tray */}
      <div className="flex items-center gap-1">
        {/* Notification bell */}
        <motion.button
          onClick={() => setShowNotifications((v) => !v)}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ color: "#7B6FC0" }}
          whileHover={{ scale: 1.1, y: -1 }}
          whileTap={{ scale: 0.93 }}
        >
          <Bell className="h-4 w-4" />
          <motion.span
            className="absolute right-2 top-2 h-2 w-2 rounded-full"
            style={{ background: "#6B4FE8" }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>

        {/* System icons */}
        <div
          className="hidden items-center gap-2 rounded-xl px-3 py-2 sm:flex neu-inset-sm"
        >
          <Wifi    className="h-4 w-4" style={{ color: "#9B8FC8" }} />
          <Volume2 className="h-4 w-4" style={{ color: "#9B8FC8" }} />
          <Battery className="h-4 w-4" style={{ color: "#9B8FC8" }} />
        </div>

        {/* Time & Date */}
        <motion.div
          className="flex flex-col items-end rounded-xl px-3 py-1.5 cursor-default"
          whileHover={{ scale: 1.03 }}
        >
          <span className="text-sm font-semibold tabular-nums" style={{ color: "#1E1060" }}>
            {time ? time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
          </span>
          <span className="text-[11px]" style={{ color: "#7B6FC0" }}>
            {time ? time.toLocaleDateString([], { month: "short", day: "numeric" }) : "---"}
          </span>
        </motion.div>
      </div>

      {/* Notification panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            className="neu-panel absolute bottom-16 right-4 w-80 rounded-2xl p-4"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}
          >
            <h3 className="mb-3 font-semibold" style={{ color: "#1E1060" }}>Notifications</h3>
            <div className="space-y-2">
              <div className="neu-inset-sm rounded-xl p-3">
                <p className="text-sm font-medium" style={{ color: "#1E1060" }}>
                  Welcome to AWS Cloud Club NMIET!
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#7B6FC0" }}>
                  Explore our cloud-powered workspace
                </p>
              </div>
              <div className="neu-inset-sm rounded-xl p-3">
                <p className="text-sm font-medium" style={{ color: "#1E1060" }}>
                  Upcoming: Cloud Workshop
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#7B6FC0" }}>
                  Check out our Events section
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
