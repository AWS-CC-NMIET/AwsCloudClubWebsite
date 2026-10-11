// lib/aws-store.ts
// State management for AWS Cloud OS windows, dock, audio, and system preferences

"use client"

import { useSyncExternalStore } from "react"
import { APPS_META, type AppId } from "./aws-apps"

export interface WindowBounds {
  x: number
  y: number
  w: number
  h: number
}

export interface WindowInstance {
  appId: AppId
  status: "open" | "minimized"
  bounds: WindowBounds
  isMaximized: boolean
  restoreBounds: WindowBounds | null
  openedAt: number
  payload?: unknown
}

export type WallpaperId = "dynamic" | "ember" | "violet" | "slate" | "dawn" | "midnight"

/**
 * Wallpapers: a deep (dark) or softly tinted (light) base, a few restrained
 * colour fields and a vignette, so glass stays the brightest thing on screen.
 * `accent` tints the logo emblem's halo.
 */
export const WALLPAPER_STYLES: Record<
  WallpaperId,
  { dark: string; light: string; name: string; emoji: string; accent: string }
> = {
  dynamic: {
    name: "Dynamic",
    emoji: "🟠",
    accent: "#a855f7",
    dark: "radial-gradient(ellipse 120% 90% at 50% 45%, transparent 55%, rgba(0, 0, 0, 0.45) 100%), radial-gradient(70rem 50rem at 88% -8%, rgba(255, 122, 48, 0.30), transparent 62%), radial-gradient(65rem 50rem at -5% 45%, rgba(121, 64, 234, 0.36), transparent 60%), radial-gradient(60rem 45rem at 55% 118%, rgba(37, 78, 180, 0.32), transparent 62%), linear-gradient(160deg, #0e0c16 0%, #121020 55%, #09090f 100%)",
    light: "radial-gradient(ellipse 120% 90% at 50% 45%, transparent 60%, rgba(40, 30, 70, 0.10) 100%), radial-gradient(70rem 50rem at 90% -10%, rgba(255, 138, 76, 0.40), transparent 62%), radial-gradient(65rem 50rem at -5% 40%, rgba(146, 104, 240, 0.36), transparent 60%), radial-gradient(60rem 45rem at 55% 118%, rgba(86, 128, 230, 0.30), transparent 62%), linear-gradient(160deg, #ebe6f1 0%, #ded7ea 100%)",
  },
  ember: {
    name: "Ember",
    emoji: "🔥",
    accent: "#f97316",
    dark: "radial-gradient(ellipse 120% 90% at 50% 45%, transparent 55%, rgba(0, 0, 0, 0.45) 100%), radial-gradient(70rem 50rem at 90% -10%, rgba(234, 88, 12, 0.30), transparent 62%), radial-gradient(65rem 50rem at -5% 50%, rgba(153, 27, 27, 0.40), transparent 60%), radial-gradient(55rem 40rem at 50% 118%, rgba(180, 83, 9, 0.22), transparent 62%), linear-gradient(160deg, #160c0a 0%, #120a09 55%, #0a0606 100%)",
    light: "radial-gradient(ellipse 120% 90% at 50% 45%, transparent 60%, rgba(40, 30, 70, 0.10) 100%), radial-gradient(70rem 50rem at 90% -10%, rgba(249, 115, 22, 0.36), transparent 62%), radial-gradient(65rem 50rem at -5% 45%, rgba(239, 68, 68, 0.22), transparent 60%), radial-gradient(55rem 40rem at 50% 118%, rgba(251, 191, 36, 0.26), transparent 62%), linear-gradient(160deg, #f1e6df 0%, #e6d5ca 100%)",
  },
  violet: {
    name: "Violet",
    emoji: "🟣",
    accent: "#8b5cf6",
    dark: "radial-gradient(ellipse 120% 90% at 50% 45%, transparent 55%, rgba(0, 0, 0, 0.45) 100%), radial-gradient(70rem 50rem at 88% -8%, rgba(124, 58, 237, 0.40), transparent 62%), radial-gradient(65rem 50rem at -5% 45%, rgba(168, 85, 247, 0.26), transparent 60%), radial-gradient(60rem 45rem at 55% 118%, rgba(37, 99, 235, 0.28), transparent 62%), linear-gradient(160deg, #110c1f 0%, #0d0a18 55%, #07060e 100%)",
    light: "radial-gradient(ellipse 120% 90% at 50% 45%, transparent 60%, rgba(40, 30, 70, 0.10) 100%), radial-gradient(70rem 50rem at 88% -10%, rgba(139, 92, 246, 0.38), transparent 62%), radial-gradient(65rem 50rem at -5% 45%, rgba(192, 132, 252, 0.32), transparent 60%), radial-gradient(60rem 45rem at 55% 118%, rgba(99, 102, 241, 0.24), transparent 62%), linear-gradient(160deg, #ebe5f6 0%, #dfd5ef 100%)",
  },
  slate: {
    name: "Slate",
    emoji: "🔘",
    accent: "#94a3b8",
    dark: "radial-gradient(ellipse 120% 90% at 50% 45%, transparent 55%, rgba(0, 0, 0, 0.45) 100%), radial-gradient(70rem 50rem at 85% -10%, rgba(148, 163, 184, 0.20), transparent 62%), radial-gradient(65rem 50rem at -5% 55%, rgba(71, 85, 105, 0.30), transparent 60%), linear-gradient(160deg, #1b1d23 0%, #14161b 55%, #0b0c0f 100%)",
    light: "radial-gradient(ellipse 120% 90% at 50% 45%, transparent 60%, rgba(40, 30, 70, 0.10) 100%), radial-gradient(70rem 50rem at 85% -10%, rgba(148, 163, 184, 0.38), transparent 62%), radial-gradient(65rem 50rem at -5% 55%, rgba(203, 213, 225, 0.55), transparent 60%), linear-gradient(160deg, #e6e8ee 0%, #d6dae3 100%)",
  },
  dawn: {
    name: "Dawn",
    emoji: "🌅",
    accent: "#f472b6",
    dark: "radial-gradient(ellipse 120% 90% at 50% 45%, transparent 55%, rgba(0, 0, 0, 0.45) 100%), radial-gradient(70rem 50rem at 90% -10%, rgba(249, 115, 22, 0.26), transparent 62%), radial-gradient(65rem 50rem at -5% 40%, rgba(219, 39, 119, 0.30), transparent 60%), radial-gradient(55rem 40rem at 50% 118%, rgba(245, 158, 11, 0.18), transparent 62%), linear-gradient(160deg, #1a0f17 0%, #140b12 55%, #0c070b 100%)",
    light: "radial-gradient(ellipse 120% 90% at 50% 45%, transparent 60%, rgba(40, 30, 70, 0.10) 100%), radial-gradient(70rem 50rem at 90% -10%, rgba(251, 146, 60, 0.34), transparent 62%), radial-gradient(65rem 50rem at -5% 40%, rgba(244, 114, 182, 0.32), transparent 60%), radial-gradient(55rem 40rem at 50% 118%, rgba(253, 186, 116, 0.26), transparent 62%), linear-gradient(160deg, #f2e8e6 0%, #e8d7d6 100%)",
  },
  midnight: {
    name: "Midnight",
    emoji: "🌌",
    accent: "#3b82f6",
    dark: "radial-gradient(ellipse 120% 90% at 50% 45%, transparent 55%, rgba(0, 0, 0, 0.45) 100%), radial-gradient(70rem 50rem at 92% -10%, rgba(37, 99, 235, 0.36), transparent 62%), radial-gradient(60rem 45rem at 20% 118%, rgba(109, 40, 217, 0.30), transparent 62%), radial-gradient(45rem 35rem at 60% 35%, rgba(6, 182, 212, 0.12), transparent 62%), linear-gradient(160deg, #080b16 0%, #070912 55%, #04050a 100%)",
    light: "radial-gradient(ellipse 120% 90% at 50% 45%, transparent 60%, rgba(40, 30, 70, 0.10) 100%), radial-gradient(70rem 50rem at 92% -10%, rgba(59, 130, 246, 0.34), transparent 62%), radial-gradient(60rem 45rem at 20% 118%, rgba(139, 92, 246, 0.26), transparent 62%), radial-gradient(45rem 35rem at 60% 35%, rgba(34, 211, 238, 0.18), transparent 62%), linear-gradient(160deg, #e5ebf6 0%, #d6dff0 100%)",
  },
}

export interface SystemState {
  appearance: "light" | "dark"
  wallpaper: WallpaperId
  brightness: number
  spotlightOpen: boolean
  controlCenterOpen: boolean
  partyMode: boolean
  toast: string | null
  trashHot: boolean
  trashedItems: string[]
}

export interface AudioState {
  isPlaying: boolean
  volume: number
  muted: boolean
  currentTrackIndex: number
}

export const TRACKS = [
  {
    title: "Sentimental Jazzy",
    artist: "AWS SBG NMIET Radio",
    art: "/audio/art/sentimental-jazzy.webp",
    src: "/audio/sentimental-jazzy.mp3",
    duration: "2:45",
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Reactive Store Pattern (Zero External Dependencies)
// ─────────────────────────────────────────────────────────────────────────────

type Listener = () => void

function createStore<T>(initialState: T) {
  let state = initialState
  const listeners = new Set<Listener>()

  return {
    get: () => state,
    set: (updater: Partial<T> | ((prev: T) => T)) => {
      const next = typeof updater === "function" ? (updater as (prev: T) => T)(state) : { ...state, ...updater }
      if (next !== state) {
        state = next
        listeners.forEach(fn => fn())
      }
    },
    subscribe: (listener: Listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

// ── Window Store ──────────────────────────────────────────────────────────────

interface WindowStoreState {
  windows: Partial<Record<AppId, WindowInstance>>
  zOrder: AppId[]
}

const windowStore = createStore<WindowStoreState>({
  windows: {},
  zOrder: [],
})

let windowSequence = 0

/** Height of the menu bar and the space kept free for the dock. */
export const MENUBAR_HEIGHT = 28
export const DOCK_RESERVE = 84

/**
 * Optional gate consulted before a window opens (e.g. sign-in-only apps).
 * Return false to cancel the open.
 */
let openGuard: ((appId: AppId) => boolean) | null = null

export function setOpenGuard(fn: (appId: AppId) => boolean) {
  openGuard = fn
  return () => {
    if (openGuard === fn) openGuard = null
  }
}

function maximizedBounds(): WindowBounds {
  return {
    x: 0,
    y: MENUBAR_HEIGHT,
    w: window.innerWidth,
    h: window.innerHeight - MENUBAR_HEIGHT - DOCK_RESERVE,
  }
}

function calculateInitialBounds(appId: AppId): WindowBounds {
  if (typeof window === "undefined") {
    return { x: 80, y: 80, w: 900, h: 600 }
  }

  const meta = APPS_META[appId] || { defaultSize: { w: 900, h: 600 } }
  const vw = window.innerWidth
  const vh = window.innerHeight

  const w = Math.min(meta.defaultSize.w, vw - 32)
  const h = Math.min(meta.defaultSize.h, vh - MENUBAR_HEIGHT - DOCK_RESERVE - 24)

  const offset = (windowSequence++ % 6) * 28
  const x = Math.min(Math.max(16, Math.round((vw - w) / 2) + offset - 40), Math.max(16, vw - w - 16))
  const y = Math.min(
    Math.max(MENUBAR_HEIGHT + 8, Math.round((vh - DOCK_RESERVE - h) / 2) + offset - 20),
    Math.max(MENUBAR_HEIGHT + 8, vh - DOCK_RESERVE - h)
  )

  return { x, y, w, h }
}

export const windowActions = {
  open: (appId: AppId, payload?: unknown) => {
    if (!APPS_META[appId]) return
    if (openGuard && !openGuard(appId)) return
    windowStore.set(prev => {
      const existing = prev.windows[appId]
      const nextZ = [...prev.zOrder.filter(id => id !== appId), appId]

      if (existing) {
        return {
          zOrder: nextZ,
          windows: {
            ...prev.windows,
            [appId]: {
              ...existing,
              status: "open",
              payload: payload !== undefined ? payload : existing.payload,
            },
          },
        }
      }

      const bounds = calculateInitialBounds(appId)
      return {
        zOrder: nextZ,
        windows: {
          ...prev.windows,
          [appId]: {
            appId,
            status: "open",
            bounds,
            isMaximized: false,
            restoreBounds: null,
            openedAt: Date.now(),
            payload,
          },
        },
      }
    })
  },

  close: (appId: AppId) => {
    windowStore.set(prev => {
      const nextWindows = { ...prev.windows }
      delete nextWindows[appId]
      return {
        windows: nextWindows,
        zOrder: prev.zOrder.filter(id => id !== appId),
      }
    })
  },

  focus: (appId: AppId) => {
    windowStore.set(prev => {
      if (!prev.windows[appId] || prev.zOrder[prev.zOrder.length - 1] === appId) {
        return prev
      }
      return {
        ...prev,
        zOrder: [...prev.zOrder.filter(id => id !== appId), appId],
      }
    })
  },

  minimize: (appId: AppId) => {
    windowStore.set(prev => {
      const target = prev.windows[appId]
      if (!target) return prev
      return {
        windows: {
          ...prev.windows,
          [appId]: { ...target, status: "minimized" },
        },
        zOrder: [appId, ...prev.zOrder.filter(id => id !== appId)],
      }
    })
  },

  toggleMaximize: (appId: AppId) => {
    windowStore.set(prev => {
      const target = prev.windows[appId]
      if (!target || typeof window === "undefined") return prev

      if (target.isMaximized) {
        return {
          ...prev,
          windows: {
            ...prev.windows,
            [appId]: {
              ...target,
              isMaximized: false,
              bounds: target.restoreBounds || calculateInitialBounds(appId),
              restoreBounds: null,
            },
          },
        }
      }

      return {
        ...prev,
        windows: {
          ...prev.windows,
          [appId]: {
            ...target,
            isMaximized: true,
            restoreBounds: { ...target.bounds },
            bounds: maximizedBounds(),
          },
        },
      }
    })
  },

  commitBounds: (appId: AppId, bounds: WindowBounds) => {
    windowStore.set(prev => {
      const target = prev.windows[appId]
      if (!target) return prev
      return {
        ...prev,
        windows: {
          ...prev.windows,
          [appId]: { ...target, bounds },
        },
      }
    })
  },

  closeAll: () => {
    windowStore.set({ windows: {}, zOrder: [] })
  },

  /** Keep every window on-screen after the browser is resized. */
  reflow: () => {
    if (typeof window === "undefined") return
    const vw = window.innerWidth
    const vh = window.innerHeight

    windowStore.set(prev => {
      let changed = false
      const nextWindows: WindowStoreState["windows"] = {}

      for (const [id, win] of Object.entries(prev.windows) as [AppId, WindowInstance | undefined][]) {
        if (!win) continue
        let bounds = win.bounds
        if (win.isMaximized) {
          bounds = maximizedBounds()
        } else {
          // Shrink to fit, then slide back so the whole window is visible.
          const w = Math.min(win.bounds.w, vw - 16)
          const h = Math.min(win.bounds.h, vh - MENUBAR_HEIGHT - DOCK_RESERVE - 8)
          const x = Math.max(8, Math.min(win.bounds.x, vw - w - 8))
          const y = Math.max(MENUBAR_HEIGHT + 4, Math.min(win.bounds.y, vh - DOCK_RESERVE - h))
          bounds = { x, y, w, h }
        }
        const same =
          bounds.x === win.bounds.x && bounds.y === win.bounds.y && bounds.w === win.bounds.w && bounds.h === win.bounds.h
        nextWindows[id] = same ? win : { ...win, bounds }
        if (!same) changed = true
      }

      return changed ? { ...prev, windows: nextWindows } : prev
    })
  },
}

export function useWindowStore<T>(selector: (state: WindowStoreState) => T): T {
  return useSyncExternalStore(
    windowStore.subscribe,
    () => selector(windowStore.get()),
    () => selector(windowStore.get())
  )
}
useWindowStore.getState = () => windowStore.get()

export function selectFocusedApp(state: WindowStoreState): AppId | null {
  for (let i = state.zOrder.length - 1; i >= 0; i--) {
    const id = state.zOrder[i]
    if (state.windows[id]?.status === "open") return id
  }
  return null
}

// ── Dock Coordinates Registry (for minimize animation) ────────────────────────

const dockIconRects: Record<string, { x: number; y: number; width: number; height: number }> = {}

export function registerDockIconRect(id: string, rect: DOMRect) {
  dockIconRects[id] = {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
  }
}

export function getDockIconRect(id: string) {
  return dockIconRects[id] || null
}

// ── System Store ──────────────────────────────────────────────────────────────

const systemStore = createStore<SystemState>({
  appearance: "dark",
  wallpaper: "dynamic",
  brightness: 1,
  spotlightOpen: false,
  controlCenterOpen: false,
  partyMode: false,
  toast: null,
  trashHot: false,
  trashedItems: [],
})

// Initialize from localStorage in browser
if (typeof window !== "undefined") {
  try {
    const savedAppearance = localStorage.getItem("aws-os:appearance") as "light" | "dark" | null
    if (savedAppearance === "light" || savedAppearance === "dark") {
      systemStore.set({ appearance: savedAppearance })
    }
    const savedWallpaper = localStorage.getItem("aws-os:wallpaper") as WallpaperId | null
    if (savedWallpaper) {
      systemStore.set({ wallpaper: savedWallpaper })
    }
    const savedBrightness = localStorage.getItem("aws-os:brightness")
    if (savedBrightness) {
      const b = parseFloat(savedBrightness)
      if (!isNaN(b)) {
        systemStore.set({ brightness: Math.min(1, Math.max(0.2, b)) })
      }
    }
  } catch {}
}

export const systemActions = {
  setAppearance: (appearance: "light" | "dark") => {
    systemStore.set({ appearance })
    try {
      localStorage.setItem("aws-os:appearance", appearance)
    } catch {}
    if (typeof document !== "undefined") {
      if (appearance === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  },
  toggleAppearance: () => {
    const current = systemStore.get().appearance
    const next = current === "dark" ? "light" : "dark"
    systemActions.setAppearance(next)
  },
  setWallpaper: (wallpaper: WallpaperId) => {
    systemStore.set({ wallpaper })
    try {
      localStorage.setItem("aws-os:wallpaper", wallpaper)
    } catch {}
  },
  setBrightness: (brightness: number) => {
    const clamped = Math.min(1, Math.max(0.2, brightness))
    systemStore.set({ brightness: clamped })
    try {
      localStorage.setItem("aws-os:brightness", clamped.toString())
    } catch {}
  },
  setSpotlightOpen: (spotlightOpen: boolean) => systemStore.set({ spotlightOpen }),
  setControlCenterOpen: (controlCenterOpen: boolean) => systemStore.set({ controlCenterOpen }),
  setPartyMode: (partyMode: boolean) => systemStore.set({ partyMode }),
  setTrashHot: (trashHot: boolean) => systemStore.set({ trashHot }),
  showToast: (msg: string) => {
    systemStore.set({ toast: msg })
    setTimeout(() => {
      if (systemStore.get().toast === msg) {
        systemStore.set({ toast: null })
      }
    }, 3200)
  },
}

export function useSystemStore<T>(selector: (state: SystemState) => T): T {
  return useSyncExternalStore(
    systemStore.subscribe,
    () => selector(systemStore.get()),
    () => selector(systemStore.get())
  )
}
useSystemStore.getState = () => systemStore.get()

// ── Audio Store ───────────────────────────────────────────────────────────────

const audioStore = createStore<AudioState>({
  isPlaying: false,
  volume: 0.8,
  muted: false,
  currentTrackIndex: 0,
})

let globalAudio: HTMLAudioElement | null = null

function getAudioElement(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null
  if (!globalAudio) {
    globalAudio = new Audio("/audio/sentimental-jazzy.mp3")
    globalAudio.loop = true
    globalAudio.volume = audioStore.get().volume
  }
  return globalAudio
}

export const audioActions = {
  togglePlay: () => {
    const current = audioStore.get().isPlaying
    const next = !current
    audioStore.set({ isPlaying: next })
    const audio = getAudioElement()
    if (audio) {
      if (next) {
        audio.play().catch(err => {
          console.warn("Audio autoplay blocked:", err)
        })
      } else {
        audio.pause()
      }
    }
  },
  play: () => {
    audioStore.set({ isPlaying: true })
    const audio = getAudioElement()
    if (audio) {
      audio.play().catch(err => console.warn("Audio play blocked:", err))
    }
  },
  pause: () => {
    audioStore.set({ isPlaying: false })
    const audio = getAudioElement()
    if (audio) {
      audio.pause()
    }
  },
  nextTrack: () => {
    const nextIdx = (audioStore.get().currentTrackIndex + 1) % TRACKS.length
    audioStore.set({ currentTrackIndex: nextIdx, isPlaying: true })
    const audio = getAudioElement()
    if (audio) {
      const track = TRACKS[nextIdx]
      if (track?.src) audio.src = track.src
      audio.play().catch(err => console.warn("Audio play blocked:", err))
    }
  },
  prevTrack: () => {
    const prevIdx = (audioStore.get().currentTrackIndex - 1 + TRACKS.length) % TRACKS.length
    audioStore.set({ currentTrackIndex: prevIdx, isPlaying: true })
    const audio = getAudioElement()
    if (audio) {
      const track = TRACKS[prevIdx]
      if (track?.src) audio.src = track.src
      audio.play().catch(err => console.warn("Audio play blocked:", err))
    }
  },
  setVolume: (volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume))
    audioStore.set({ volume: clamped, muted: clamped === 0 })
    const audio = getAudioElement()
    if (audio) {
      audio.volume = clamped
      audio.muted = clamped === 0
    }
  },
  toggleMuted: () => {
    const nextMuted = !audioStore.get().muted
    audioStore.set({ muted: nextMuted })
    const audio = getAudioElement()
    if (audio) {
      audio.muted = nextMuted
    }
  },
}

export function useAudioStore<T>(selector: (state: AudioState) => T): T {
  return useSyncExternalStore(
    audioStore.subscribe,
    () => selector(audioStore.get()),
    () => selector(audioStore.get())
  )
}
useAudioStore.getState = () => audioStore.get()

