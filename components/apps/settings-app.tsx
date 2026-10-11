// components/apps/settings-app.tsx
// System Settings — appearance, wallpaper and information about this site

"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import {
  Palette,
  Image as ImageIcon,
  Info,
  Search,
  Check,
  ChevronRight,
  Sun,
} from "lucide-react"
import {
  useSystemStore,
  systemActions,
  windowActions,
  type WallpaperId,
  WALLPAPER_STYLES,
} from "@/lib/aws-store"
import { CLUB } from "@/lib/club-content"

interface WallpaperOption {
  id: WallpaperId
  name: string
  category: string
  description: string
  previewStyle: React.CSSProperties
}

const WALLPAPERS: WallpaperOption[] = [
  {
    id: "dynamic",
    name: "Dynamic",
    category: "Signature Mesh",
    description: "Signature vermilion flame, purple nebula & deep sapphire",
    previewStyle: {
      background:
        "radial-gradient(circle at 90% 10%, #f3350c 0%, transparent 65%), radial-gradient(circle at 10% 40%, #7940ea 0%, transparent 60%), radial-gradient(circle at 55% 95%, #1c5ad2 0%, transparent 65%), #101018",
    },
  },
  {
    id: "ember",
    name: "Ember",
    category: "AWS Studio",
    description: "Fiery vermilion embers on espresso obsidian",
    previewStyle: {
      background:
        "radial-gradient(circle at 85% 15%, #f3350c 0%, transparent 65%), radial-gradient(circle at 15% 45%, #dc2626 0%, transparent 60%), radial-gradient(circle at 60% 90%, #d97706 0%, transparent 65%), #240c06",
    },
  },
  {
    id: "violet",
    name: "Violet",
    category: "AWS Studio",
    description: "Deep space ultraviolet and cosmic indigo",
    previewStyle: {
      background:
        "radial-gradient(circle at 85% 15%, #7940ea 0%, transparent 65%), radial-gradient(circle at 15% 45%, #9333ea 0%, transparent 60%), radial-gradient(circle at 50% 90%, #2563eb 0%, transparent 65%), #130d22",
    },
  },
  {
    id: "slate",
    name: "Slate",
    category: "AWS Studio",
    description: "Studio graphite metallic and titanium",
    previewStyle: {
      background:
        "radial-gradient(circle at 80% 15%, #b4bed7 0%, transparent 65%), radial-gradient(circle at 20% 60%, #6e7d96 0%, transparent 60%), radial-gradient(circle at 60% 85%, #414b5f 0%, transparent 65%), #1e2028",
    },
  },
  {
    id: "dawn",
    name: "Dawn",
    category: "AWS Studio",
    description: "Morning peach, apricot and warm daylight",
    previewStyle: {
      background:
        "radial-gradient(circle at 85% 15%, #ff8c3c 0%, transparent 65%), radial-gradient(circle at 15% 40%, #f472b6 0%, transparent 60%), radial-gradient(circle at 60% 85%, #fbbf24 0%, transparent 65%), #221218",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    category: "AWS Studio",
    description: "Cosmic deep oceanic sapphire and plum",
    previewStyle: {
      background:
        "radial-gradient(circle at 85% 15%, #2563eb 0%, transparent 65%), radial-gradient(circle at 20% 70%, #7940ea 0%, transparent 60%), radial-gradient(circle at 50% 25%, #0ea5e9 0%, transparent 65%), #060814",
    },
  },
]

type SettingsPaneId = "appearance" | "wallpaper" | "about"

interface PaneMeta {
  id: SettingsPaneId
  label: string
  icon: React.ComponentType<{ className?: string }>
  badgeBg: string
  badgeText: string
}

const PANES: PaneMeta[] = [
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
    badgeBg: "bg-[#7940ea]",
    badgeText: "text-white",
  },
  {
    id: "wallpaper",
    label: "Desktop & Wallpaper",
    icon: ImageIcon,
    badgeBg: "bg-[#2563eb]",
    badgeText: "text-white",
  },
  {
    id: "about",
    label: "About This Site",
    icon: Info,
    badgeBg: "bg-[#64748b]",
    badgeText: "text-white",
  },
]

export function SettingsApp({ payload }: { payload?: { pane?: string } }) {
  const [activeTab, setActiveTab] = useState<SettingsPaneId>("appearance")
  const [searchQuery, setSearchQuery] = useState("")
  const appearance = useSystemStore(s => s.appearance)
  const currentWallpaper = useSystemStore(s => s.wallpaper)
  const brightness = useSystemStore(s => s.brightness)

  useEffect(() => {
    if (payload?.pane) {
      if (payload.pane === "wallpaper" || payload.pane === "background") setActiveTab("wallpaper")
      else if (payload.pane === "appearance") setActiveTab("appearance")
      else if (payload.pane === "about") setActiveTab("about")
    }
  }, [payload?.pane])

  const filteredPanes = PANES.filter(pane =>
    pane.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderWallpaperGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
      {WALLPAPERS.map(wp => {
        const isCurrent = currentWallpaper === wp.id
        return (
          <button
            key={wp.id}
            onClick={() => {
              systemActions.setWallpaper(wp.id)
              systemActions.showToast(`Wallpaper set to ${wp.name}`)
            }}
            className={`group flex flex-col items-center gap-2 rounded-xl border p-2.5 text-center transition-all ${
              isCurrent
                ? "border-[#7940ea] ring-2 ring-[#7940ea]/40 bg-[#7940ea]/10"
                : "border-black/10 dark:border-white/10 hover:border-[#7940ea]/40 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <div
              style={wp.previewStyle}
              className="relative h-20 w-full rounded-lg shadow-md border border-white/15 overflow-hidden flex items-center justify-center transition-transform group-hover:scale-[1.02]"
            >
              {/* Noise texture overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-25"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")`,
                }}
              />
              {isCurrent && (
                <div className="relative z-10 flex size-7 items-center justify-center rounded-full bg-[#7940ea] text-white border border-white/30 backdrop-blur-md shadow-md">
                  <Check className="size-4 stroke-[2.5]" />
                </div>
              )}
            </div>
            <div className="w-full text-left px-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-(--os-text)">{wp.name}</span>
                <span className="text-[9px] font-mono text-(--os-text-dim)">{wp.category}</span>
              </div>
              <p className="text-[10px] text-(--os-text-dim) truncate mt-0.5">{wp.description}</p>
            </div>
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="flex h-full w-full flex-col md:flex-row bg-(--win-bg) text-(--os-text) select-none">
      {/* ── Left Sidebar ───────────────────────────────────────────────────────── */}
      <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-(--win-divider) bg-black/[0.02] dark:bg-white/[0.02] p-3 flex flex-col gap-3">
        {/* Chapter Profile Card */}
        <div className="flex items-center gap-3 rounded-xl border border-(--win-divider) bg-black/[0.03] dark:bg-white/[0.04] p-2.5">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-sm bg-neutral-900 flex items-center justify-center">
            <Image
              src="/logo-full.png"
              alt="AWS SBG NMIET"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              unoptimized
            />
          </div>
          <div className="min-w-0 flex-1 leading-tight text-left">
            <p className="truncate text-xs font-bold text-(--os-text)">AWS SBG NMIET</p>
            <p className="truncate text-[10px] text-(--os-text-dim)">{CLUB.chapter}</p>
          </div>
        </div>

        {/* Search Field */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-(--os-text-dim)" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search Settings"
            className="w-full rounded-lg border border-(--win-divider) bg-black/5 dark:bg-white/5 py-1.5 pl-8 pr-3 text-xs text-(--os-text) placeholder:text-(--os-text-dim) outline-none focus:border-[#7940ea] focus:ring-1 focus:ring-[#7940ea]"
          />
        </div>

        {/* Panes Navigation List */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto">
          {filteredPanes.map(item => {
            const Icon = item.icon
            const isSelected = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-[#7940ea] text-white shadow-xs"
                    : "hover:bg-black/5 dark:hover:bg-white/5 text-(--os-text)"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex size-6 shrink-0 items-center justify-center rounded-md ${
                      isSelected ? "bg-white/20 text-white" : `${item.badgeBg} ${item.badgeText}`
                    }`}
                  >
                    <Icon className="size-3.5" />
                  </div>
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={`size-3 opacity-40 ${isSelected ? "text-white" : ""}`} />
              </button>
            )
          })}
        </nav>
      </aside>

      {/* ── Right Settings Pane Content ───────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
        {/* ── Appearance Pane ─────────────────────────────────────────────────── */}
        {activeTab === "appearance" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-lg font-bold text-(--os-text)">Appearance</h2>
              <p className="text-xs text-(--os-text-dim)">
                Choose how the AWS SBG NMIET Cloud OS looks.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => systemActions.setAppearance("light")}
                className={`flex flex-col items-center gap-2.5 rounded-xl border p-4 text-center transition-all ${
                  appearance === "light"
                    ? "border-[#7940ea] ring-2 ring-[#7940ea]/30 bg-black/5 dark:bg-white/5"
                    : "border-(--win-divider) hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <div className="h-16 w-full rounded-lg bg-neutral-100 border border-neutral-300 flex items-center justify-center text-xs font-bold text-neutral-800 shadow-inner">
                  Light Theme
                </div>
                <span className="text-xs font-semibold text-(--os-text)">Light</span>
              </button>

              <button
                onClick={() => systemActions.setAppearance("dark")}
                className={`flex flex-col items-center gap-2.5 rounded-xl border p-4 text-center transition-all ${
                  appearance === "dark"
                    ? "border-[#7940ea] ring-2 ring-[#7940ea]/30 bg-black/5 dark:bg-white/5"
                    : "border-(--win-divider) hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <div className="h-16 w-full rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-100 shadow-inner">
                  Dark Theme
                </div>
                <span className="text-xs font-semibold text-(--os-text)">Dark</span>
              </button>
            </div>

            {/* Display Brightness Section */}
            <div className="pt-4 border-t border-(--win-divider) space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-(--os-text)">Display Brightness</h3>
                  <p className="text-[11px] text-(--os-text-dim)">
                    Adjust screen brightness for optimal clarity and comfort.
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold text-(--os-text)">
                  {Math.round(brightness * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Sun className="size-4 text-amber-500 shrink-0" />
                <input
                  type="range"
                  min="0.3"
                  max="1"
                  step="0.01"
                  value={brightness}
                  onChange={e => systemActions.setBrightness(parseFloat(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-black/10 dark:bg-white/20 accent-[#7940ea]"
                />
                <Sun className="size-5 text-amber-500 shrink-0" />
              </div>
            </div>

            {/* Accent Color Selection */}
            <div className="pt-4 border-t border-(--win-divider) space-y-3">
              <h3 className="text-xs font-bold text-(--os-text)">Accent Color</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 rounded-full border border-(--win-divider) bg-black/5 dark:bg-white/5 p-1">
                  <span className="size-5 rounded-full bg-[#7940ea] ring-2 ring-white/50" title="AWS Purple (Active)" />
                  <span className="size-5 rounded-full bg-[#ff9900] opacity-40 cursor-not-allowed" title="Cloud Amber" />
                  <span className="size-5 rounded-full bg-[#2563eb] opacity-40 cursor-not-allowed" title="Sapphire Blue" />
                  <span className="size-5 rounded-full bg-[#10b981] opacity-40 cursor-not-allowed" title="Emerald Green" />
                </div>
                <span className="text-xs text-(--os-text-dim) font-mono">AWS Purple (#7940ea)</span>
              </div>
            </div>

            {/* Wallpapers inside Appearance (macOS Ventura standard) */}
            <div className="pt-4 border-t border-(--win-divider) space-y-4">
              <div>
                <h3 className="text-sm font-bold text-(--os-text)">Desktop Wallpaper</h3>
                <p className="text-xs text-(--os-text-dim)">
                  Pick a wallpaper for your desktop and home screen.
                </p>
              </div>
              {renderWallpaperGrid()}
            </div>
          </div>
        )}

        {/* ── Desktop & Wallpaper Pane (Exclusive primary selector) ────────────── */}
        {activeTab === "wallpaper" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-lg font-bold text-(--os-text)">Desktop & Wallpaper</h2>
              <p className="text-xs text-(--os-text-dim)">
                High-luminance mesh gradients with organic film-grain noise texture.
              </p>
            </div>

            <div className="rounded-xl border border-(--win-divider) bg-black/5 dark:bg-white/5 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-(--os-text)">
                  Active Wallpaper: <span className="text-[#7940ea] font-bold">{WALLPAPER_STYLES[currentWallpaper].name}</span>
                </p>
                <p className="text-[11px] text-(--os-text-dim) mt-0.5">
                  Responsive mesh shaders dynamically tuned for light and dark environments.
                </p>
              </div>
              <span className="text-2xl">{WALLPAPER_STYLES[currentWallpaper].emoji}</span>
            </div>

            {renderWallpaperGrid()}
          </div>
        )}

        {/* ── About This Site ─────────────────────────────────────────────────── */}
        {activeTab === "about" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-lg font-bold text-(--os-text)">About This Site</h2>
              <p className="text-xs text-(--os-text-dim)">The chapter behind it and the stack it runs on.</p>
            </div>

            <div className="rounded-2xl border border-(--win-divider) bg-black/5 dark:bg-white/5 p-6 flex flex-col items-center text-center space-y-4">
              <div className="relative size-20 overflow-hidden rounded-2xl border border-white/20 bg-neutral-950 p-2 shadow-lg flex items-center justify-center">
                <Image src="/logo-full.png" alt="AWS SBG NMIET" width={64} height={64} className="h-16 w-16 object-contain" unoptimized />
              </div>
              <div>
                <h3 className="text-base font-bold text-(--os-text)">{CLUB.name}</h3>
                <p className="text-xs text-(--os-text-dim)">{CLUB.chapter} · {CLUB.city}</p>
              </div>

              <div className="w-full max-w-md divide-y divide-(--win-divider) text-xs text-left">
                {[
                  ["College", CLUB.college],
                  ["Founded", CLUB.founded],
                  ["SBG Leader", CLUB.leader],
                  ["Contact", CLUB.email],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4 py-2">
                    <span className="shrink-0 text-(--os-text-dim)">{label}</span>
                    <span className="min-w-0 break-words text-right font-semibold text-(--os-text)">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-(--os-text-dim)">Built with</h3>
              <div className="divide-y divide-(--win-divider) rounded-xl border border-(--win-divider) text-xs bg-black/[0.02] dark:bg-white/[0.02]">
                {[
                  ["Next.js 16 + React 19", "Frontend & API routes"],
                  ["AWS Amplify Hosting", "Builds, hosting & server-side rendering"],
                  ["Amazon Cognito", "Member sign-in"],
                  ["Amazon DynamoDB", "Events, team, projects & more"],
                  ["Amazon S3", "Event photos & uploads"],
                  ["Amazon SES", "Contact form email"],
                  ["Meetup", "Live member count & events"],
                ].map(([name, role]) => (
                  <div key={name} className="flex items-center justify-between gap-4 p-3">
                    <span className="font-semibold text-(--os-text)">{name}</span>
                    <span className="text-right text-[11px] text-(--os-text-dim)">{role}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-(--os-text-dim)">
                AWS services run in {CLUB.region}. This site uses no advertising or analytics trackers; preferences like
                theme and wallpaper are stored only in your browser.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => windowActions.open("aws")}
                className="rounded-lg bg-[#7940ea] px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#8c4bff] transition-colors"
              >
                Open Home
              </button>
              <button
                onClick={() => windowActions.open("admin")}
                className="rounded-lg border border-(--win-divider) bg-black/5 dark:bg-white/5 px-4 py-1.5 text-xs font-semibold text-(--os-text) hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                Admin Panel
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
