"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  Home, Cloud, Users, Calendar, FolderOpen,
  BookOpen, Share2, Mail, Trophy, Terminal,
  Settings, Power, Search, ShieldCheck
} from "lucide-react"

type AppId =
  | "home" | "about" | "team" | "events" | "projects"
  | "resources" | "social" | "contact" | "achievements" | "terminal"
  | "profile" | "admin"

interface StartMenuProps {
  onAppClick: (appId: AppId) => void
  onClose: () => void
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
  { id: "achievements", name: "Awards",       icon: Trophy,      gradient: "linear-gradient(135deg,#FFB800,#E89800)" },
  { id: "terminal",     name: "Terminal",     icon: Terminal,    gradient: "linear-gradient(135deg,#2D1B8A,#1E1060)" },
  { id: "admin",        name: "Admin Panel",  icon: ShieldCheck, gradient: "linear-gradient(135deg,#E85555,#C83030)", adminOnly: true },
]

export function StartMenu({ onAppClick, onClose, isAdmin = false }: StartMenuProps) {
  const [query, setQuery] = useState("")

  const visibleApps = apps.filter((a) => !a.adminOnly || isAdmin)
  const filtered = query.trim()
    ? visibleApps.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()))
    : visibleApps

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
            <Image src="/logo-full.png" alt="Logo" width={36} height={36} className="rounded-lg object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-tight truncate">AWS Cloud Club</p>
            <p className="text-xs text-white/70">NMIET Chapter</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/70">Online</span>
          </div>
        </div>

        <div className="p-4">
          {/* Search */}
          <div className="neu-inset mb-4 flex items-center gap-2 rounded-xl px-3 py-2.5">
            <Search className="h-4 w-4 flex-shrink-0" style={{ color: "#9B8FC8" }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search applications..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "#1E1060" }}
              autoFocus
            />
          </div>

          {/* Apps grid */}
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#9B8FC8" }}>
            Applications
          </p>

          <div className="mb-4 grid grid-cols-5 gap-1">
            <AnimatePresence mode="popLayout">
              {filtered.map((app, i) => (
                <motion.button
                  key={app.id}
                  onClick={() => { onAppClick(app.id); onClose() }}
                  className="group flex flex-col items-center gap-1 rounded-xl p-1.5"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: i * 0.03, type: "spring" as const, stiffness: 300, damping: 22 }}
                  whileHover={{ y: -3, scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                    style={{
                      background: app.gradient,
                      boxShadow: "3px 3px 8px #C2BAF0, -3px -3px 8px #FFFFFF",
                    }}
                  >
                    <app.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[9px] font-medium leading-tight text-center" style={{ color: "#7B6FC0" }}>
                    {app.name}
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div className="mb-3 h-px" style={{ background: "linear-gradient(90deg,transparent,#C2BAF0,transparent)" }} />

          {/* Quick Actions */}
          <div className="flex items-center justify-between">
            <motion.button
              className="neu-btn flex h-9 items-center gap-2 rounded-xl px-3"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => { onAppClick("profile"); onClose() }}
              title="My Profile"
            >
              <Settings className="h-4 w-4" style={{ color: "#7B6FC0" }} />
              <span className="text-xs font-medium" style={{ color: "#7B6FC0" }}>Profile</span>
            </motion.button>

            <motion.button
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
              style={{
                background: "rgba(232,85,85,0.10)",
                color: "#E85555",
                boxShadow: "3px 3px 8px rgba(232,85,85,0.08), -3px -3px 8px #FFFFFF",
              }}
              whileHover={{ scale: 1.04 }}
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
