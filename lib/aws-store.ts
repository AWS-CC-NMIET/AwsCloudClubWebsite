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

export const WALLPAPER_STYLES: Record<
  WallpaperId,
  { dark: string; light: string; name: string; emoji: string }
> = {
  dynamic: {
    name: "Dynamic",
    emoji: "🟠",
    dark: "radial-gradient(90rem 60rem at 110% -10%, rgba(243, 53, 12, 0.55), transparent 60%), radial-gradient(70rem 50rem at -10% 40%, rgba(121, 64, 234, 0.52), transparent 55%), radial-gradient(60rem 50rem at 50% 125%, rgba(28, 56, 114, 0.5), transparent 65%), linear-gradient(160deg, #101014 0%, #17141f 100%)",
    light: "radial-gradient(90rem 60rem at 110% -10%, rgba(243, 53, 12, 0.35), transparent 60%), radial-gradient(80rem 50rem at -20% 30%, rgba(255, 168, 138, 0.45), transparent 55%), radial-gradient(70rem 60rem at 50% 120%, rgba(94, 58, 140, 0.25), transparent 60%), linear-gradient(160deg, #f3f0ee 0%, #e3dcd7 100%)",
  },
  ember: {
    name: "Ember",
    emoji: "🔥",
    dark: "radial-gradient(90rem 60rem at 110% -10%, rgba(243, 53, 12, 0.65), transparent 60%), radial-gradient(70rem 50rem at -10% 40%, rgba(153, 27, 27, 0.6), transparent 55%), radial-gradient(60rem 50rem at 50% 120%, rgba(217, 119, 6, 0.5), transparent 60%), linear-gradient(160deg, #2a0f08 0%, #120a08 100%)",
    light: "radial-gradient(90rem 60rem at 110% -10%, rgba(243, 53, 12, 0.45), transparent 60%), radial-gradient(70rem 50rem at -10% 40%, rgba(251, 146, 60, 0.5), transparent 55%), linear-gradient(160deg, #fdf1ea 0%, #f4dcd2 100%)",
  },
  violet: {
    name: "Violet",
    emoji: "🟣",
    dark: "radial-gradient(90rem 60rem at 110% -10%, rgba(121, 64, 234, 0.7), transparent 60%), radial-gradient(70rem 50rem at -10% 40%, rgba(147, 51, 234, 0.7), transparent 55%), radial-gradient(60rem 50rem at 50% 125%, rgba(37, 99, 235, 0.7), transparent 65%), linear-gradient(160deg, #181126 0%, #0d0a18 100%)",
    light: "radial-gradient(90rem 60rem at 110% -10%, rgba(121, 64, 234, 0.4), transparent 60%), radial-gradient(70rem 50rem at -10% 40%, rgba(192, 132, 252, 0.5), transparent 55%), linear-gradient(160deg, #f8f2fd 0%, #ece0f8 100%)",
  },
  slate: {
    name: "Slate",
    emoji: "🔘",
    dark: "radial-gradient(80rem 60rem at 80% 0%, rgba(120, 122, 130, 0.4), transparent 60%), radial-gradient(60rem 50rem at 20% 60%, rgba(75, 85, 99, 0.35), transparent 55%), linear-gradient(160deg, #2c2c33 0%, #0d0d0f 100%)",
    light: "radial-gradient(80rem 60rem at 80% 0%, rgba(190, 200, 220, 0.5), transparent 60%), linear-gradient(160deg, #f2f3f7 0%, #dcdfe8 100%)",
  },
  dawn: {
    name: "Dawn",
    emoji: "🌅",
    dark: "radial-gradient(90rem 60rem at 110% -10%, rgba(249, 115, 22, 0.55), transparent 60%), radial-gradient(80rem 50rem at -10% 30%, rgba(236, 72, 153, 0.5), transparent 55%), radial-gradient(60rem 50rem at 50% 110%, rgba(251, 191, 36, 0.45), transparent 60%), linear-gradient(160deg, #26131c 0%, #130a0f 100%)",
    light: "radial-gradient(90rem 60rem at 110% -10%, rgba(243, 53, 12, 0.22), transparent 60%), radial-gradient(80rem 50rem at -10% 30%, rgba(255, 184, 138, 0.45), transparent 55%), linear-gradient(160deg, #fbf4ef 0%, #f0dccf 100%)",
  },
  midnight: {
    name: "Midnight",
    emoji: "🌌",
    dark: "radial-gradient(80rem 60rem at 100% -10%, rgba(37, 99, 235, 0.7), transparent 60%), radial-gradient(60rem 50rem at 30% 120%, rgba(121, 64, 234, 0.7), transparent 60%), radial-gradient(50rem 40rem at 60% 30%, rgba(6, 182, 212, 0.5), transparent 60%), linear-gradient(160deg, #0a0c16 0%, #06070e 100%)",
    light: "radial-gradient(80rem 60rem at 100% -10%, rgba(40, 80, 160, 0.4), transparent 60%), radial-gradient(60rem 50rem at 30% 120%, rgba(86, 38, 118, 0.4), transparent 60%), linear-gradient(160deg, #f0f4ff 0%, #dde5fc 100%)",
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
  {
    title: "Cloud Architect Beats",
    artist: "Lo-Fi Builder",
    art: "/audio/art/sentimental-jazzy.webp",
    src: "/audio/sentimental-jazzy.mp3",
    duration: "3:12",
  },
  {
    title: "Serverless Midnight",
    artist: "Deep Aurora",
    art: "/audio/art/sentimental-jazzy.webp",
    src: "/audio/sentimental-jazzy.mp3",
    duration: "2:58",
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

function calculateInitialBounds(appId: AppId): WindowBounds {
  if (typeof window === "undefined") {
    return { x: 80, y: 80, w: 900, h: 600 }
  }

  const meta = APPS_META[appId] || { defaultSize: { w: 900, h: 600 } }
  const vw = window.innerWidth
  const vh = window.innerHeight

  const w = Math.min(meta.defaultSize.w, vw - 32)
  const h = Math.min(meta.defaultSize.h, vh - 28 - 72 - 32)

  const offset = (windowSequence++ % 6) * 28
  const x = Math.max(16, Math.round((vw - w) / 2) + offset - 40)
  const y = Math.max(36, Math.round((vh - 72 - h) / 2) + offset - 20)

  return { x, y, w, h }
}

export const windowActions = {
  open: (appId: AppId, payload?: unknown) => {
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
            bounds: {
              x: 0,
              y: 28,
              w: window.innerWidth,
              h: window.innerHeight - 28 - 72,
            },
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

  reflow: () => {
    if (typeof window === "undefined") return
    const vw = window.innerWidth
    const vh = window.innerHeight

    windowStore.set(prev => {
      const nextWindows = { ...prev.windows }
      let changed = false

      Object.entries(nextWindows).forEach(([id, win]) => {
        if (!win) return
        if (win.isMaximized) {
          win.bounds = { x: 0, y: 28, w: vw, h: vh - 28 - 72 }
          changed = true
        } else {
          const clampedW = Math.min(win.bounds.w, vw - 24)
          const clampedH = Math.min(win.bounds.h, vh - 28 - 72 - 12)
          const clampedX = Math.min(Math.max(8, win.bounds.x), vw - 80)
          const clampedY = Math.min(Math.max(28, win.bounds.y), vh - 80)

          if (
            clampedW !== win.bounds.w ||
            clampedH !== win.bounds.h ||
            clampedX !== win.bounds.x ||
            clampedY !== win.bounds.y
          ) {
            win.bounds = { x: clampedX, y: clampedY, w: clampedW, h: clampedH }
            changed = true
          }
        }
      })

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

