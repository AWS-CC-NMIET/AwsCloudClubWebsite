// components/os/desktop-widgets.tsx
// Desktop widget presentation layer for AWS SBG NMIET AWS Cloud OS

"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  useWidgetStore,
  widgetActions,
  widgetPxSize,
  colsForWidth,
  resolveDropPosition,
  WIDGET_DEFINITIONS,
  type WidgetId,
  type WidgetSize,
} from "@/lib/aws-widgets"
import {
  useAudioStore,
  audioActions,
  windowActions,
  TRACKS,
} from "@/lib/aws-store"
import {
  Wifi,
  Activity,
  Calendar as CalendarIcon,
  Play,
  Pause,
  SkipForward,
  FolderGit2,
  Award,
  Sun,
  Moon,
  Clock,
  MoreHorizontal,
  Trash2,
  Sliders,
} from "lucide-react"

export function DesktopWidgets() {
  const widgets = useWidgetStore(s => s.widgets)
  const [contextMenu, setContextMenu] = useState<{
    id: WidgetId
    x: number
    y: number
  } | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contextMenu) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null)
      }
    }
    window.addEventListener("pointerdown", handleClick)
    return () => window.removeEventListener("pointerdown", handleClick)
  }, [contextMenu])

  // Clamp widgets on window resize so they stay inside
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        const el = containerRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const cols = colsForWidth(rect.width)
        for (const w of useWidgetStore.getState().widgets) {
          const { w: pw, h: ph } = widgetPxSize(w.size)
          if (w.x + pw > rect.width || w.y + ph > rect.height) {
            const cx = Math.max(0, Math.min(w.x, rect.width - pw))
            const cy = Math.max(0, Math.min(w.y, rect.height - ph))
            const pos = resolveDropPosition(
              useWidgetStore.getState().widgets,
              w.id,
              cx,
              cy,
              cols
            )
            widgetActions.setPosition(w.id, pos.x, pos.y)
          }
        }
      }, 150)
    }
    window.addEventListener("resize", onResize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  if (!widgets.length) return null

  return (
    <>
      <div
        ref={containerRef}
        aria-label="Desktop Widgets"
        className="pointer-events-none absolute inset-x-4 top-10 bottom-28 z-[5] hidden lg:block"
      >
        {widgets.map(w => (
          <DraggableWidget
            key={w.id}
            id={w.id}
            size={w.size}
            x={w.x}
            y={w.y}
            containerRef={containerRef}
            onContextMenu={(id, cx, cy) => setContextMenu({ id, x: cx, y: cy })}
          />
        ))}
      </div>

      {/* Widget Context Menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          style={{ position: "fixed", left: contextMenu.x, top: contextMenu.y }}
          className="z-[999] min-w-[180px] rounded-xl border border-black/10 bg-(--menu-bg) p-1 text-[13px] text-(--os-text) shadow-2xl backdrop-blur-3xl dark:border-white/15 select-none animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-(--os-text-dim)">
            Widget Size
          </div>
          <button
            onClick={() => {
              widgetActions.setSize(contextMenu.id, "small")
              setContextMenu(null)
            }}
            className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-xs hover:bg-[#7940ea] hover:text-white transition-colors"
          >
            <span>Small</span>
            <span className="text-[10px] opacity-60">1x1</span>
          </button>
          <button
            onClick={() => {
              widgetActions.setSize(contextMenu.id, "medium")
              setContextMenu(null)
            }}
            className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-xs hover:bg-[#7940ea] hover:text-white transition-colors"
          >
            <span>Medium</span>
            <span className="text-[10px] opacity-60">2x1</span>
          </button>

          <div className="my-1 h-px bg-black/10 dark:bg-white/15" />

          <button
            onClick={() => {
              widgetActions.remove(contextMenu.id)
              setContextMenu(null)
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs text-red-400 hover:bg-red-500 hover:text-white transition-colors"
          >
            <Trash2 className="size-3.5" />
            <span>Remove Widget</span>
          </button>

          <button
            onClick={() => {
              widgetActions.setEditorOpen(true)
              setContextMenu(null)
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs hover:bg-[#7940ea] hover:text-white transition-colors"
          >
            <Sliders className="size-3.5" />
            <span>Edit Widgets…</span>
          </button>
        </div>
      )}
    </>
  )
}

// ── Drag hook (mirrors AWS Cloud Club pattern) ───────────────────────────────

function useMotionValue(initial: number) {
  const ref = useRef(initial)
  const listeners = useRef(new Set<() => void>())
  const mv = useRef({
    get: () => ref.current,
    set: (v: number) => {
      ref.current = v
      listeners.current.forEach(fn => fn())
    },
    on: (_event: string, cb: () => void) => {
      listeners.current.add(cb)
      return () => listeners.current.delete(cb)
    },
  })
  return mv.current
}

interface DragOpts {
  x: ReturnType<typeof useMotionValue>
  y: ReturnType<typeof useMotionValue>
  elRef: React.RefObject<HTMLDivElement | null>
  getBounds: () => { minX: number; minY: number; maxX: number; maxY: number } | null
  onDrop: (x: number, y: number) => void
  threshold?: number
  dragZ?: string
}

function useDrag({ x, y, elRef, getBounds, onDrop, threshold = 5, dragZ = "9" }: DragOpts) {
  const dragging = useRef(false)

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    // Don't drag when clicking interactive elements
    if ((e.target as HTMLElement).closest("[data-no-drag], button, a, input")) return
    const el = elRef.current
    if (!el) return

    const startClientX = e.clientX
    const startClientY = e.clientY
    const offsetX = e.clientX - x.get()
    const offsetY = e.clientY - y.get()
    const bounds = getBounds()

    const onMove = (ev: PointerEvent) => {
      if (!dragging.current) {
        if (Math.abs(ev.clientX - startClientX) < threshold && Math.abs(ev.clientY - startClientY) < threshold) {
          return
        }
        dragging.current = true
        try { el.setPointerCapture(ev.pointerId) } catch {}
        el.style.willChange = "transform"
        el.style.zIndex = dragZ
        el.style.cursor = "grabbing"
      }

      let nx = ev.clientX - offsetX
      let ny = ev.clientY - offsetY

      if (bounds) {
        nx = Math.min(bounds.maxX, Math.max(bounds.minX, nx))
        ny = Math.min(bounds.maxY, Math.max(bounds.minY, ny))
      }

      x.set(nx)
      y.set(ny)
    }

    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)

      if (!dragging.current) return
      dragging.current = false

      try { el.releasePointerCapture(ev.pointerId) } catch {}
      el.style.willChange = ""
      el.style.zIndex = ""
      el.style.cursor = ""

      onDrop(x.get(), y.get())

      // Prevent accidental click after drag
      const blocker = (ce: Event) => { ce.stopPropagation(); ce.preventDefault() }
      el.addEventListener("click", blocker, true)
      setTimeout(() => el.removeEventListener("click", blocker, true), 0)
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
  }

  return { onPointerDown, dragging }
}

// ── Draggable Widget Wrapper ──────────────────────────────────────────────────

function DraggableWidget({
  id,
  size,
  x: targetX,
  y: targetY,
  containerRef,
  onContextMenu,
}: {
  id: WidgetId
  size: WidgetSize
  x: number
  y: number
  containerRef: React.RefObject<HTMLDivElement | null>
  onContextMenu: (id: WidgetId, x: number, y: number) => void
}) {
  const elRef = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(targetX)
  const my = useMotionValue(targetY)
  const { w, h } = widgetPxSize(size)
  const [, forceUpdate] = useState(0)

  const { onPointerDown, dragging } = useDrag({
    x: mx,
    y: my,
    elRef,
    dragZ: "9",
    getBounds: () => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return null
      return {
        minX: 0,
        minY: 0,
        maxX: Math.max(0, rect.width - w),
        maxY: Math.max(0, rect.height - h),
      }
    },
    onDrop: (dropX, dropY) => {
      const rect = containerRef.current?.getBoundingClientRect()
      const cols = rect ? colsForWidth(rect.width) : undefined
      const widgets = useWidgetStore.getState().widgets
      const pos = resolveDropPosition(widgets, id, dropX, dropY, cols)
      widgetActions.setPosition(id, pos.x, pos.y)
    },
  })

  // Subscribe to motion value changes for re-render
  useEffect(() => {
    const unsub1 = mx.on("change", () => forceUpdate(v => v + 1))
    const unsub2 = my.on("change", () => forceUpdate(v => v + 1))
    return () => { unsub1(); unsub2() }
  }, [mx, my])

  // Animate to target position when store changes (not during drag)
  useEffect(() => {
    if (!dragging.current) {
      mx.set(targetX)
      my.set(targetY)
    }
  }, [targetX, targetY, mx, my, dragging])

  return (
    <div
      ref={elRef}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate3d(${mx.get()}px, ${my.get()}px, 0)`,
        width: w,
        height: h,
        transition: dragging.current ? "none" : "transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)",
      }}
      className="pointer-events-auto touch-none select-none overflow-hidden rounded-[18px] border border-black/10 bg-white/60 text-(--os-text) shadow-xl backdrop-blur-2xl hover:shadow-2xl dark:border-white/10 dark:bg-[#202028]/65 cursor-grab active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onContextMenu={e => {
        e.preventDefault()
        e.stopPropagation()
        onContextMenu(id, e.clientX, e.clientY)
      }}
    >
      <WidgetContent id={id} size={size} />
    </div>
  )
}

function WidgetContent({ id, size }: { id: WidgetId; size: WidgetSize }) {
  switch (id) {
    case "aws-status":
      return <AwsStatusWidget />
    case "clock-cities":
      return <ClockCitiesWidget size={size} />
    case "calendar":
      return <CalendarWidget />
    case "now-playing":
      return <NowPlayingWidget />
    case "portfolio":
      return <PortfolioWidget />
    case "certifications":
      return <CertificationsWidget />
    default:
      return null
  }
}

// ── 1. AWS Cloud Status Widget ────────────────────────────────────────────────
function AwsStatusWidget() {
  return (
    <div
      onClick={() => windowActions.open("aws")}
      className="flex h-full w-full flex-col justify-between p-3.5 cursor-pointer text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity className="size-3.5 text-[#7940ea]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-(--os-text-dim)">
            AWS Infrastructure
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Operational</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 py-1">
        <div className="rounded-xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 p-2 leading-tight">
          <p className="text-[10px] font-mono text-(--os-text-dim)">ap-south-1 (Mumbai)</p>
          <p className="text-sm font-bold text-(--os-text) mt-0.5">24ms · 99.99%</p>
          <p className="text-[9px] text-emerald-400 mt-0.5">DynamoDB & S3 Active</p>
        </div>
        <div className="rounded-xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 p-2 leading-tight">
          <p className="text-[10px] font-mono text-(--os-text-dim)">us-east-1 (Virginia)</p>
          <p className="text-sm font-bold text-(--os-text) mt-0.5">182ms · 100%</p>
          <p className="text-[9px] text-emerald-400 mt-0.5">Cognito & SES Active</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-(--os-text-dim)">
        <span>All services healthy</span>
        <span className="text-[#7940ea] font-medium">View Telemetry →</span>
      </div>
    </div>
  )
}

// ── 2. Global Builder Clocks Widget ───────────────────────────────────────────
function ClockCitiesWidget({ size }: { size: WidgetSize }) {
  const [time, setTime] = useState({ mumbai: "", seattle: "" })

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime({
        mumbai: now.toLocaleTimeString("en-US", {
          timeZone: "Asia/Kolkata",
          hour: "numeric",
          minute: "2-digit",
        }),
        seattle: now.toLocaleTimeString("en-US", {
          timeZone: "America/Los_Angeles",
          hour: "numeric",
          minute: "2-digit",
        }),
      })
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex h-full w-full flex-col justify-between p-3.5 text-left">
      <div className="flex items-center gap-1.5">
        <Clock className="size-3.5 text-[#7940ea]" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-(--os-text-dim)">
          Builder Clocks
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-(--os-text)">
            <Sun className="size-3 text-amber-400" />
            <span>Mumbai (IST)</span>
          </div>
          <p className="text-xl font-bold tracking-tight text-(--os-text) tabular-nums mt-0.5">
            {time.mumbai || "..."}
          </p>
          <p className="text-[10px] text-(--os-text-dim)">NMIET Campus</p>
        </div>

        <div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-(--os-text)">
            <Moon className="size-3 text-indigo-400" />
            <span>Seattle (PST)</span>
          </div>
          <p className="text-xl font-bold tracking-tight text-(--os-text) tabular-nums mt-0.5">
            {time.seattle || "..."}
          </p>
          <p className="text-[10px] text-(--os-text-dim)">AWS Headquarters</p>
        </div>
      </div>

      <p className="text-[10px] text-(--os-text-dim)">Coordinated development cycles</p>
    </div>
  )
}

// ── 3. Chapter Calendar Widget ────────────────────────────────────────────────
function CalendarWidget() {
  const [dateInfo, setDateInfo] = useState({ weekday: "", day: 1, month: "" })

  useEffect(() => {
    const now = new Date()
    setDateInfo({
      weekday: now.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      day: now.getDate(),
      month: now.toLocaleDateString("en-US", { month: "short" }),
    })
  }, [])

  return (
    <div
      onClick={() => windowActions.open("calendar")}
      role="button"
      tabIndex={0}
      className="flex h-full w-full flex-col justify-between p-3.5 text-left cursor-pointer transition-transform hover:scale-[1.01]"
    >
      <div>
        <p className="text-[11px] font-bold tracking-wider text-[#7940ea]">
          {dateInfo.weekday || "TODAY"}
        </p>
        <p className="text-4xl font-extrabold text-(--os-text) tracking-tight leading-none mt-1">
          {dateInfo.day}
        </p>
      </div>
      <div>
        <p className="text-[11px] font-semibold text-(--os-text) leading-tight">
          Cloud Bootcamp
        </p>
        <p className="text-[10px] text-(--os-text-dim)">Sat · 4:00 PM</p>
      </div>
    </div>
  )
}

// ── 4. AWS SBG Lo-Fi Radio Widget ─────────────────────────────────────────────
function NowPlayingWidget() {
  const isPlaying = useAudioStore(s => s.isPlaying)
  const currentTrackIndex = useAudioStore(s => s.currentTrackIndex)
  const track = TRACKS[currentTrackIndex] || TRACKS[0]

  return (
    <div className="flex h-full w-full flex-col justify-between p-3.5 text-left">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-(--os-text-dim)">
          AWS SBG Radio
        </span>
        <div className="size-2 rounded-full bg-[#7940ea] animate-pulse" />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-sm bg-neutral-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={track.art} alt={track.title} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-xs font-bold text-(--os-text)">{track.title}</p>
          <p className="truncate text-[11px] text-(--os-text-dim) mt-0.5">{track.artist}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => audioActions.togglePlay()}
            className="flex size-8 items-center justify-center rounded-full bg-[#7940ea] text-white shadow-md hover:bg-[#8c4bff] transition-colors"
          >
            {isPlaying ? (
              <Pause className="size-3.5 fill-current" />
            ) : (
              <Play className="size-3.5 fill-current ml-0.5" />
            )}
          </button>
          <button
            onClick={() => audioActions.nextTrack()}
            className="flex size-7 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-(--os-text) hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
          >
            <SkipForward className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-(--os-text-dim)">
        <span>Lo-Fi Beats to Architect To</span>
        <span className="font-mono text-[#7940ea]">{track.duration}</span>
      </div>
    </div>
  )
}

// ── 5. Student Cloud Architectures Widget ──────────────────────────────────────
function PortfolioWidget() {
  return (
    <div
      onClick={() => windowActions.open("finder")}
      role="button"
      tabIndex={0}
      className="flex h-full w-full flex-col justify-between p-3.5 text-left cursor-pointer transition-transform hover:scale-[1.01]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-(--os-text-dim)">
          Projects
        </span>
        <FolderGit2 className="size-3.5 text-[#7940ea]" />
      </div>

      <div>
        <p className="text-3xl font-extrabold text-(--os-text) leading-none">18</p>
        <p className="text-[11px] font-medium text-(--os-text-dim) mt-1">
          Deployed Stacks
        </p>
      </div>

      <div className="text-[10px] text-(--os-text-dim) truncate">
        Serverless & AI Blueprints →
      </div>
    </div>
  )
}

// ── 6. Certifications & Accreditations Widget ─────────────────────────────────
function CertificationsWidget() {
  return (
    <div
      onClick={() => windowActions.open("notes")}
      className="flex h-full w-full flex-col justify-between p-3.5 text-left cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-(--os-text-dim)">
          Builder Credentials
        </span>
        <div className="flex items-center gap-1 text-[10px] text-(--os-text-dim) font-mono">
          <Award className="size-3 text-amber-400" />
          <span>500+ Members</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 py-1">
        <div className="flex flex-col items-center rounded-xl bg-black/5 dark:bg-white/5 p-2 text-center">
          <span className="text-sm font-bold text-[#7940ea]">12</span>
          <span className="text-[9px] font-semibold text-(--os-text) leading-tight mt-0.5">
            Solutions Architect
          </span>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-black/5 dark:bg-white/5 p-2 text-center">
          <span className="text-sm font-bold text-blue-400">8</span>
          <span className="text-[9px] font-semibold text-(--os-text) leading-tight mt-0.5">
            Developer Assoc.
          </span>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-black/5 dark:bg-white/5 p-2 text-center">
          <span className="text-sm font-bold text-emerald-400">18</span>
          <span className="text-[9px] font-semibold text-(--os-text) leading-tight mt-0.5">
            Cloud Practitioner
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-(--os-text-dim)">
        <span>Explore Certification Roadmaps</span>
        <span className="text-[#7940ea] font-medium">Notes →</span>
      </div>
    </div>
  )
}
