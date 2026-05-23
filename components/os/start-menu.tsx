"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  Home, Cloud, Users, Calendar, FolderOpen,
  BookOpen, Share2, Mail, Trophy, Terminal,
  Settings, Power, Search, ShieldCheck, UserCircle,
} from "lucide-react"

type AppId =
  | "home" | "about" | "team" | "events" | "projects"
  | "resources" | "social" | "contact" | "achievements" | "terminal"
  | "profile" | "admin"

interface StartMenuProps {
  onAppClick: (appId: AppId) => void
  onClose: () => void
  onShutdown: () => void
  isAdmin?: boolean
}

const apps: { id: AppId; name: string; icon: typeof Home; gradient: string; adminOnly?: boolean }[] = [
  { id: "home",         name: "Home",         icon: Home,        gradient: "linear-gradient(135deg,#6B4FE8,#8B6FFF)" },
  { id: "about",        name: "About",        icon: Cloud,       gradient: "linear-gradient(135deg,#B8A4FF,#8B6FFF)" },
  { id: "team",         name: "Team",         icon: Users,       gradient: "linear-gradient(135deg,#5BA8D8,#4B90C8)" },
  { id: "events",       name: "Events",       icon: Calendar,    gradient: "linear-gradient(135deg,#FF9900,#E88800)" },
  { id: "projects",     name: "Projects",     icon: FolderOpen,  gradient: "linear-gradient(135deg,#50C88A,#3AAA72)" },
  { id: "resources",    name: "Resources",    icon: BookOpen,    gradient: "linear-gradient(135deg,#6B4FE8,#5B3FD8)" },
  { id: "social",       name: "Social",       icon: Share2,      gradient: "linear-gradient(135deg,#E85580,#C83565)" },
  { id: "contact",      name: "Contact",      icon: Mail,        gradient: "linear-gradient(135deg,#5BA8D8,#3B88C0)" },
  { id: "achievements", name: "Achievements", icon: Trophy,      gradient: "linear-gradient(135deg,#FFB800,#E89800)" },
  { id: "terminal",     name: "Terminal",     icon: Terminal,    gradient: "linear-gradient(135deg,#2D1B8A,#1E1060)" },
  { id: "profile",      name: "Profile",      icon: UserCircle,  gradient: "linear-gradient(135deg,#6B4FE8,#B8A4FF)" },
  { id: "admin",        name: "Admin Panel",  icon: ShieldCheck, gradient: "linear-gradient(135deg,#E85555,#C83030)", adminOnly: true },
]

export function StartMenu({ onAppClick, onClose, onShutdown, isAdmin = false }: StartMenuProps) {
  const [query, setQuery] = useState("")

  const visibleApps = apps.filter((a) => !a.adminOnly || isAdmin)
  const trimmed = query.trim()
  const filtered = trimmed
    ? visibleApps.filter((a) => a.name.toLowerCase().includes(trimmed.toLowerCase()))
    : visibleApps

  const handleAppClick = (id: AppId) => {
    onAppClick(id)
    onClose()
  }

  const handleShutdown = () => {
    onClose()
    onShutdown()
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Menu */}
      <motion.div
        className="neu-panel absolute bottom-16 left-2 z-50 w-80 overflow-hidden rounded-2xl"
        initial={{ opacity: 0, y: 16, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.96 }}
        transition={{ type: "spring" as const, stiffness: 320, damping: 26 }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-4"
          style={{ background: "linear-gradient(135deg, #6B4FE8, #8B6FFF)" }}
        >
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ background: "rgba(255,255,255,0.18)" }}
          >
            <Image src="/logo-full.png" alt="Logo" width={36} height={36} className="object-contain" unoptimized />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-tight truncate">AWS Student Builder Group</p>
            <p className="text-xs text-white/70">NMIET Chapter</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/70">Online</span>
          </div>
        </div>

        <div className="p-4">
          {/* Search */}
          <div
            className="mb-4 flex items-center gap-2 rounded-xl px-3 py-2.5"
            style={{ background: "rgba(168,85,247,0.10)", border: "1px solid rgba(168,85,247,0.20)" }}
          >
            <Search className="h-4 w-4 flex-shrink-0" style={{ color: "#9775FA" }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search applications..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#5B4E8A]"
              style={{ color: "#DDD6FE" }}
              autoFocus
            />
            {trimmed && (
              <button
                onClick={() => setQuery("")}
                className="text-xs font-medium"
                style={{ color: "#9775FA" }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Search results (vertical suggestion list) */}
          <AnimatePresence mode="wait">
            {trimmed ? (
              <motion.div
                key="search-results"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="mb-4"
              >
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#9775FA" }}>
                  {filtered.length > 0 ? `${filtered.length} result${filtered.length > 1 ? "s" : ""}` : "No results"}
                </p>
                {filtered.length > 0 ? (
                  <div className="space-y-1">
                    {filtered.map((app, i) => (
                      <motion.button
                        key={app.id}
                        onClick={() => handleAppClick(app.id)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left"
                        style={{ background: "rgba(168,85,247,0.06)" }}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, type: "spring" as const, stiffness: 300, damping: 24 }}
                        whileHover={{ background: "rgba(168,85,247,0.14)", x: 3 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <div
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-white"
                          style={{ background: app.gradient, boxShadow: "2px 2px 8px rgba(107,79,232,0.40)" }}
                        >
                          <app.icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium" style={{ color: "#DDD6FE" }}>{app.name}</span>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-sm" style={{ color: "#9775FA" }}>No apps match &quot;{trimmed}&quot;</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="app-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="mb-4"
              >
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#9775FA" }}>
                  Applications
                </p>
                <div className="grid grid-cols-5 gap-1">
                  {visibleApps.map((app, i) => (
                    <motion.button
                      key={app.id}
                      onClick={() => handleAppClick(app.id)}
                      className="group flex flex-col items-center gap-1 rounded-xl p-1.5"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03, type: "spring" as const, stiffness: 300, damping: 22 }}
                      whileHover={{ y: -3, scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                    >
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                        style={{ background: app.gradient, boxShadow: "3px 3px 10px rgba(107,79,232,0.45)" }}
                      >
                        <app.icon className="h-5 w-5" />
                      </div>
                      <span className="text-[9px] font-medium leading-tight text-center" style={{ color: "#A78BFA" }}>
                        {app.name}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="mb-3 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(168,85,247,0.35),transparent)" }} />

          {/* Quick Actions */}
          <div className="flex items-center justify-between">
            <motion.button
              className="flex h-9 items-center gap-2 rounded-xl px-3"
              style={{ background: "rgba(168,85,247,0.10)", border: "1px solid rgba(168,85,247,0.20)" }}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleAppClick("profile")}
              title="My Profile"
            >
              <Settings className="h-4 w-4" style={{ color: "#A78BFA" }} />
              <span className="text-xs font-medium" style={{ color: "#A78BFA" }}>Profile</span>
            </motion.button>

            <motion.button
              onClick={handleShutdown}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
              style={{
                background: "rgba(232,85,85,0.12)",
                color: "#F87171",
                border: "1px solid rgba(232,85,85,0.20)",
              }}
              whileHover={{ scale: 1.04, background: "rgba(232,85,85,0.22)" }}
              whileTap={{ scale: 0.94 }}
            >
              <Power className="h-4 w-4" />
              Shutdown
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
