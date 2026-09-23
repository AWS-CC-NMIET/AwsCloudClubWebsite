// lib/aws-widgets.ts
// Desktop widgets registry, store and grid geometry for AWS SBG NMIET AWS Cloud OS

"use client"

import React, { useSyncExternalStore } from "react"
import { type AppId } from "./aws-apps"

export type WidgetId =
  | "aws-status"
  | "clock-cities"
  | "calendar"
  | "now-playing"
  | "portfolio"
  | "certifications"

export type WidgetSize = "small" | "medium" | "large"

export interface WidgetInstance {
  id: WidgetId
  size: WidgetSize
  x: number
  y: number
}

export interface WidgetDefinition {
  id: WidgetId
  name: string
  description: string
  sizes: WidgetSize[]
  defaultSize: WidgetSize
}

export const WIDGET_GRID_SIZE = {
  small: { cols: 1, rows: 1 },
  medium: { cols: 2, rows: 1 },
  large: { cols: 2, rows: 2 },
}

export const WIDGET_PX = {
  colWidth: 160,
  rowHeight: 160,
  gap: 14,
}

export function widgetPxSize(size: WidgetSize): { w: number; h: number } {
  const { cols, rows } = WIDGET_GRID_SIZE[size]
  return {
    w: cols * WIDGET_PX.colWidth + (cols - 1) * WIDGET_PX.gap,
    h: rows * WIDGET_PX.rowHeight + (rows - 1) * WIDGET_PX.gap,
  }
}

export const WIDGET_DEFINITIONS: Record<WidgetId, WidgetDefinition> = {
  "aws-status": {
    id: "aws-status",
    name: "AWS Cloud Status",
    description: "Live operational telemetry for ap-south-1 & us-east-1 regions.",
    sizes: ["medium"],
    defaultSize: "medium",
  },
  "clock-cities": {
    id: "clock-cities",
    name: "Builder Clocks",
    description: "Dual clocks for Mumbai (Campus) & Seattle (AWS HQ).",
    sizes: ["small", "medium"],
    defaultSize: "medium",
  },
  calendar: {
    id: "calendar",
    name: "Chapter Calendar",
    description: "Today's date and upcoming cloud bootcamps. Opens Calendar.",
    sizes: ["small"],
    defaultSize: "small",
  },
  "now-playing": {
    id: "now-playing",
    name: "AWS SBG Radio",
    description: "Lo-Fi Beats to Architect To, wired to real player audio.",
    sizes: ["medium"],
    defaultSize: "medium",
  },
  portfolio: {
    id: "portfolio",
    name: "Cloud Architectures",
    description: "Member projects, deployed serverless apps and repos. Opens Finder.",
    sizes: ["small", "medium"],
    defaultSize: "small",
  },
  certifications: {
    id: "certifications",
    name: "Certifications & Awards",
    description: "AWS certification badges, hackathon wins and member stats.",
    sizes: ["medium"],
    defaultSize: "medium",
  },
}

export const DEFAULT_WIDGETS: WidgetInstance[] = [
  { id: "aws-status", size: "medium", x: 0, y: 0 },
  { id: "calendar", size: "small", x: 348, y: 0 },
  { id: "clock-cities", size: "medium", x: 0, y: 174 },
  { id: "portfolio", size: "small", x: 348, y: 174 },
  { id: "now-playing", size: "medium", x: 0, y: 348 },
]

// ── Widget Store ───────────────────────────────────────────────────────────────

interface WidgetStoreState {
  widgets: WidgetInstance[]
  editorOpen: boolean
}

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

const STORAGE_KEY = "aws-os:widgets"

const widgetStore = createStore<WidgetStoreState>({
  widgets: DEFAULT_WIDGETS,
  editorOpen: false,
})

// Initialize from localStorage in browser
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        widgetStore.set({ widgets: parsed })
      }
    }
  } catch {}
}

function persistWidgets(widgets: WidgetInstance[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets))
  } catch {}
}

export const widgetActions = {
  add: (id: WidgetId, size: WidgetSize = "medium") => {
    const state = widgetStore.get()
    if (state.widgets.some(w => w.id === id)) return

    // Find next available position
    const maxY = state.widgets.reduce((acc, w) => Math.max(acc, w.y + 174), 0)
    const nextWidgets: WidgetInstance[] = [...state.widgets, { id, size, x: 0, y: maxY }]
    widgetStore.set({ widgets: nextWidgets })
    persistWidgets(nextWidgets)
  },

  remove: (id: WidgetId) => {
    const nextWidgets = widgetStore.get().widgets.filter(w => w.id !== id)
    widgetStore.set({ widgets: nextWidgets })
    persistWidgets(nextWidgets)
  },

  setSize: (id: WidgetId, size: WidgetSize) => {
    const nextWidgets = widgetStore.get().widgets.map(w =>
      w.id === id ? { ...w, size } : w
    )
    widgetStore.set({ widgets: nextWidgets })
    persistWidgets(nextWidgets)
  },

  setPosition: (id: WidgetId, x: number, y: number) => {
    const nextWidgets = widgetStore.get().widgets.map(w =>
      w.id === id ? { ...w, x, y } : w
    )
    widgetStore.set({ widgets: nextWidgets })
    persistWidgets(nextWidgets)
  },

  setEditorOpen: (editorOpen: boolean) => {
    widgetStore.set({ editorOpen })
  },
}

// ── Grid-aware drop position ──────────────────────────────────────────────────

/** How many grid columns fit in a given pixel width */
export function colsForWidth(containerWidth: number): number {
  const { colWidth, gap } = WIDGET_PX
  return Math.max(1, Math.floor((containerWidth + gap) / (colWidth + gap)))
}

/** Snap a free-form (x, y) to the nearest grid cell, avoiding overlap */
export function resolveDropPosition(
  allWidgets: WidgetInstance[],
  draggedId: WidgetId,
  rawX: number,
  rawY: number,
  _maxCols?: number
): { x: number; y: number } {
  const { colWidth, rowHeight, gap } = WIDGET_PX
  const cellW = colWidth + gap
  const cellH = rowHeight + gap

  // Snap to nearest grid cell
  const col = Math.max(0, Math.round(rawX / cellW))
  const row = Math.max(0, Math.round(rawY / cellH))

  return { x: col * cellW, y: row * cellH }
}

export function useWidgetStore<T>(selector: (state: WidgetStoreState) => T): T {
  return useSyncExternalStore(
    widgetStore.subscribe,
    () => selector(widgetStore.get()),
    () => selector(widgetStore.get())
  )
}
useWidgetStore.getState = () => widgetStore.get()
