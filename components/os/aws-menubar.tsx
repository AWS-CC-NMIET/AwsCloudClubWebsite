// components/os/aws-menubar.tsx
// Top macOS glass menu bar featuring AWS SBG NMIET logo, reactive app menus, and interactive Control Center

"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import {
  Wifi,
  Search,
  Sliders,
  Volume2,
  VolumeX,
  Check,
  Lock,
} from "lucide-react"
import {
  useWindowStore,
  useSystemStore,
  useAudioStore,
  windowActions,
  systemActions,
  audioActions,
  selectFocusedApp,
} from "@/lib/aws-store"
import { APPS_META, type AppId } from "@/lib/aws-apps"
import { ControlCenter } from "./control-center"

export function AwsMenuBar({ onLockScreen }: { onLockScreen?: () => void }) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [wifiMenuOpen, setWifiMenuOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")
  const containerRef = useRef<HTMLElement>(null)

  const windows = useWindowStore(s => s.windows)
  const zOrder = useWindowStore(s => s.zOrder)
  const focusedAppId = selectFocusedApp({ windows, zOrder }) || "aws"
  const focusedMeta = APPS_META[focusedAppId] || APPS_META.aws

  const controlCenterOpen = useSystemStore(s => s.controlCenterOpen)
  const spotlightOpen = useSystemStore(s => s.spotlightOpen)

  const isAudioPlaying = useAudioStore(s => s.isPlaying)
  const isAudioMuted = useAudioStore(s => s.muted)

  // macOS Live Clock formatting
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      )
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Close menus on click outside or escape
  useEffect(() => {
    if (!activeDropdown && !wifiMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
        setWifiMenuOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null)
        setWifiMenuOpen(false)
      }
    }
    window.addEventListener("pointerdown", handleClickOutside)
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("pointerdown", handleClickOutside)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [activeDropdown, wifiMenuOpen])

  const executeCommand = (command?: string) => {
    setActiveDropdown(null)
    setWifiMenuOpen(false)
    if (!command) return

    if (command === "open:settings:wallpaper") {
      windowActions.open("settings", { pane: "wallpaper" })
    } else if (command.startsWith("open:")) {
      const targetApp = command.replace("open:", "") as AppId
      windowActions.open(targetApp)
    } else if (command === "close") {
      if (focusedAppId) windowActions.close(focusedAppId)
    } else if (command === "minimize") {
      if (focusedAppId) windowActions.minimize(focusedAppId)
    } else if (command === "zoom") {
      if (focusedAppId) windowActions.toggleMaximize(focusedAppId)
    } else if (command === "music:toggle") {
      audioActions.togglePlay()
    } else if (command === "music:next") {
      audioActions.nextTrack()
    } else if (command === "music:prev") {
      audioActions.prevTrack()
    } else if (command === "restart") {
      windowActions.closeAll()
      windowActions.open("aws")
      systemActions.showToast("AWS SBG NMIET OS Restarted")
    } else if (command === "shutdown" || command === "lock") {
      onLockScreen?.()
    } else if (command === "simplified") {
      windowActions.closeAll()
    } else if (command.startsWith("link:")) {
      window.open(command.replace("link:", ""), "_blank")
    }
  }

  // AWS Cloud Club authentic Apple / AWS System Menu
  const systemMenuItems = [
    { label: "About AWS SBG NMIET", command: "open:about", separatorAfter: true },
    { label: "System Settings…", command: "open:settings", shortcut: "⌘," },
    { label: "App Store…", command: "open:appstore", separatorAfter: true },
    { label: "Restart…", command: "restart" },
    { label: "Shut Down…", command: "shutdown", separatorAfter: true },
    { label: "Simplified View", command: "simplified", separatorAfter: true },
    { label: "Log Out Visitor…", command: "shutdown" },
  ]

  // Active App Menu items
  const appMenuItems = [
    { label: `About ${focusedMeta.name}`, command: `open:${focusedAppId}` },
    { label: "Settings…", command: "open:settings", shortcut: "⌘,", separatorAfter: true },
    { label: `Hide ${focusedMeta.name}`, command: "minimize", shortcut: "⌘H" },
    { label: "Hide Others", command: "hide-others", shortcut: "⌥⌘H", disabled: true },
    { label: "Show All", command: "show-all", disabled: true, separatorAfter: true },
    { label: `Quit ${focusedMeta.name}`, command: "close", shortcut: "⌘Q" },
  ]

  const itemClass = (isOpen: boolean) =>
    `flex h-full items-center rounded px-2.5 text-[13px] font-medium transition-colors ${
      isOpen ? "bg-[#7940ea] text-white" : "text-(--os-text) hover:bg-black/5 dark:hover:bg-white/10"
    }`

  const handlePointerEnterMenu = (menuId: string) => {
    if (activeDropdown && activeDropdown !== menuId) {
      setActiveDropdown(menuId)
    }
  }

  return (
    <>
      <header
        ref={containerRef}
        className="fixed inset-x-0 top-0 z-[950] flex h-7 items-stretch justify-between border-b border-black/5 bg-(--menubar-bg) px-1.5 text-(--os-text) backdrop-blur-2xl dark:border-white/5 select-none"
      >
        {/* ── Left Menus ────────────────────────────────────────────────────────── */}
        <div className="flex items-stretch gap-0.5">
          {/* AWS SBG NMIET Mark Dropdown */}
          <div className="relative flex items-stretch">
            <button
              onClick={() => setActiveDropdown(activeDropdown === "logo-menu" ? null : "logo-menu")}
              onPointerEnter={() => handlePointerEnterMenu("logo-menu")}
              className={itemClass(activeDropdown === "logo-menu")}
              aria-label="AWS SBG NMIET menu"
            >
              <Image
                src="/logo-full.png"
                alt="AWS SBG NMIET"
                width={16}
                height={16}
                className="h-3.5 w-3.5 object-contain filter drop-shadow(0 1px 2px rgba(0,0,0,0.5))"
                unoptimized
              />
            </button>

            {activeDropdown === "logo-menu" && (
              <div className="absolute left-0 top-full mt-1 min-w-60 rounded-lg border border-black/10 bg-(--menu-bg) p-1 shadow-2xl backdrop-blur-2xl dark:border-white/10 animate-in fade-in zoom-in-95 duration-100 z-[960]">
                {systemMenuItems.map((item, i) => (
                  <React.Fragment key={i}>
                    <button
                      onClick={() => executeCommand(item.command)}
                      className="flex w-full items-center justify-between gap-8 rounded-[5px] px-2.5 py-[3px] text-left text-[13px] text-(--os-text) hover:bg-[#7940ea] hover:text-white transition-colors"
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="text-xs tracking-wide opacity-50 font-mono">{item.shortcut}</span>
                      )}
                    </button>
                    {item.separatorAfter && <div className="mx-2.5 my-1 h-px bg-black/10 dark:bg-white/15" role="separator" />}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Active App Title & App Dropdown */}
          <div className="relative flex items-stretch">
            <button
              onClick={() => setActiveDropdown(activeDropdown === "app-menu" ? null : "app-menu")}
              onPointerEnter={() => handlePointerEnterMenu("app-menu")}
              className={`flex h-full items-center rounded px-2 text-[13px] font-bold tracking-tight transition-colors ${
                activeDropdown === "app-menu"
                  ? "bg-[#7940ea] text-white"
                  : "text-(--os-text) hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              {focusedMeta.name}
            </button>

            {activeDropdown === "app-menu" && (
              <div className="absolute left-0 top-full mt-1 min-w-60 rounded-lg border border-black/10 bg-(--menu-bg) p-1 shadow-2xl backdrop-blur-2xl dark:border-white/10 animate-in fade-in zoom-in-95 duration-100 z-[960]">
                {appMenuItems.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <button
                      disabled={item.disabled}
                      onClick={() => executeCommand(item.command)}
                      className={`flex w-full items-center justify-between gap-8 rounded-[5px] px-2.5 py-[3px] text-left text-[13px] transition-colors ${
                        item.disabled
                          ? "cursor-default text-(--os-text-dim) opacity-40"
                          : "text-(--os-text) hover:bg-[#7940ea] hover:text-white"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="text-xs tracking-wide opacity-50 font-mono">{item.shortcut}</span>
                      )}
                    </button>
                    {item.separatorAfter && <div className="mx-2.5 my-1 h-px bg-black/10 dark:bg-white/15" role="separator" />}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic App Context Menus (File, Edit, View, Window, Help) */}
          <div className="hidden items-stretch md:flex">
            {focusedMeta.menus.map(menu => (
              <div key={menu.title} className="relative flex items-stretch">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === menu.title ? null : menu.title)}
                  onPointerEnter={() => handlePointerEnterMenu(menu.title)}
                  className={itemClass(activeDropdown === menu.title)}
                >
                  {menu.title}
                </button>

                {activeDropdown === menu.title && (
                  <div className="absolute left-0 top-full mt-1 min-w-60 rounded-lg border border-black/10 bg-(--menu-bg) p-1 shadow-2xl backdrop-blur-2xl dark:border-white/10 animate-in fade-in zoom-in-95 duration-100 z-[960]">
                    {menu.items.map((item, idx) => (
                      <React.Fragment key={idx}>
                        <button
                          disabled={item.disabled}
                          onClick={() => executeCommand(item.command)}
                          className={`flex w-full items-center justify-between gap-8 rounded-[5px] px-2.5 py-[3px] text-left text-[13px] transition-colors ${
                            item.disabled
                              ? "cursor-default text-(--os-text-dim) opacity-40"
                              : "text-(--os-text) hover:bg-[#7940ea] hover:text-white"
                          }`}
                        >
                          <span>{item.label}</span>
                          {item.shortcut && (
                            <span className="text-xs tracking-wide opacity-50 font-mono">{item.shortcut}</span>
                          )}
                        </button>
                        {item.separatorAfter && <div className="mx-2.5 my-1 h-px bg-black/10 dark:bg-white/15" role="separator" />}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Status Area ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1">
          {/* AWS Cloud Health Pill */}
          <button
            onClick={() => windowActions.open("aws")}
            className="hidden items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-neutral-200 hover:bg-[#7940ea]/30 transition-colors sm:flex"
            title="AWS SBG NMIET Chapter Status"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="font-mono text-[11px] font-semibold tracking-wide">AWS SBG NMIET Active</span>
          </button>

          {/* Music Player Toggle */}
          <button
            onClick={() => audioActions.togglePlay()}
            className={itemClass(isAudioPlaying)}
            aria-label={isAudioPlaying ? "Mute Lo-Fi Music" : "Play Lo-Fi Music"}
            title={isAudioPlaying ? "AWS SBG Radio (Playing)" : "AWS SBG Radio (Paused)"}
          >
            {isAudioMuted || !isAudioPlaying ? (
              <VolumeX className="h-3.5 w-3.5 text-neutral-400" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-[#8c4bff] animate-pulse" />
            )}
          </button>

          {/* Wi-Fi Glyph and Interactive Popover */}
          <div className="relative flex items-stretch">
            <button
              onClick={() => setWifiMenuOpen(!wifiMenuOpen)}
              className={itemClass(wifiMenuOpen)}
              aria-label="Wi-Fi Networks"
              title="Wi-Fi: Connected to AWS-SBG-NMIET-5G"
            >
              <Wifi className="h-3.5 w-3.5 text-neutral-200" />
            </button>

            {wifiMenuOpen && (
              <div className="absolute right-0 top-full mt-1 min-w-[240px] rounded-xl border border-black/10 bg-(--menu-bg) p-2 text-[13px] text-(--os-text) shadow-2xl backdrop-blur-3xl dark:border-white/10 animate-in fade-in zoom-in-95 duration-100 z-[960]">
                <div className="flex items-center justify-between px-2 py-1 border-b border-black/10 dark:border-white/10 mb-1">
                  <span className="font-semibold text-xs">Wi-Fi</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Connected</span>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#7940ea]/20 text-[#7940ea] dark:text-[#c084fc] font-semibold text-xs">
                    <div className="flex items-center gap-2">
                      <Wifi className="size-3.5 text-[#7940ea]" />
                      <span>AWS-SBG-NMIET-5G</span>
                    </div>
                    <Check className="size-3.5 text-emerald-400" />
                  </div>
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-lg text-(--os-text-dim) hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-xs">
                    <div className="flex items-center gap-2">
                      <Wifi className="size-3.5 opacity-50" />
                      <span>NMIET-Campus-WiFi</span>
                    </div>
                    <Lock className="size-3 opacity-50" />
                  </div>
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-lg text-(--os-text-dim) hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-xs">
                    <div className="flex items-center gap-2">
                      <Wifi className="size-3.5 opacity-50" />
                      <span>AWS-Guest</span>
                    </div>
                    <Lock className="size-3 opacity-50" />
                  </div>
                </div>
                <div className="border-t border-black/10 dark:border-white/10 mt-1.5 pt-1">
                  <button
                    onClick={() => {
                      windowActions.open("settings")
                      setWifiMenuOpen(false)
                    }}
                    className="w-full text-left px-2 py-1 rounded text-xs text-(--os-text) hover:bg-[#7940ea] hover:text-white transition-colors"
                  >
                    Wi-Fi Settings…
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Spotlight Search Toggle */}
          <button
            onClick={() => systemActions.setSpotlightOpen(!spotlightOpen)}
            className={itemClass(spotlightOpen)}
            aria-label="Spotlight Search (Cmd+K)"
            title="Spotlight Search (⌘K)"
          >
            <Search className="h-3.5 w-3.5 text-neutral-200" />
          </button>

          {/* Control Center Toggle */}
          <button
            data-control-center-toggle="true"
            onClick={() => systemActions.setControlCenterOpen(!controlCenterOpen)}
            className={itemClass(controlCenterOpen)}
            aria-label="Control Center"
            title="Control Center"
          >
            <Sliders className="h-3.5 w-3.5 text-neutral-200" />
          </button>

          {/* Date and Time */}
          <div className="flex items-center gap-1.5 px-2 text-[13px] font-medium text-neutral-100 tracking-tight">
            <span className="hidden sm:inline text-neutral-300">{currentDate}</span>
            <span>{currentTime}</span>
          </div>
        </div>
      </header>

      {/* ── Control Center Popover (Toggled by Menubar Sliders Button) ──────── */}
      <ControlCenter />
    </>
  )
}
