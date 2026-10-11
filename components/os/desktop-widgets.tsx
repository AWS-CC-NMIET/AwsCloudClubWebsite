// components/os/desktop-widgets.tsx
// Desktop widgets for the AWS SBG NMIET Cloud OS (live club data)

"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  useWidgetStore,
  widgetActions,
  widgetPxSize,
  colsForWidth,
  resolveDropPosition,
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
  Calendar as CalendarIcon,
  Play,
  Pause,
  Sun,
  Moon,
  Clock,
  Trash2,
  Sliders,
  MapPin,
  Users,
  Rocket,
  Zap,
} from "lucide-react"
import { useEvents, useMemberCount, useProjects, useTeam } from "@/lib/club-data"

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
          className="z-[999] min-w-[180px] glass-strong rim rounded-xl p-1 text-[13px] text-(--os-text) dark:border-white/15 select-none animate-in fade-in zoom-in-95 duration-100"
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

// ── Drag hook ────────────────────────────────────────────────────────────────

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
      className="pointer-events-auto touch-none select-none overflow-hidden glass rim rounded-[22px] text-(--os-text) cursor-grab active:cursor-grabbing"
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
    case "next-event":
      return <NextEventWidget />
    case "club-stats":
      return <ClubStatsWidget />
    case "clock-cities":
      return <ClockCitiesWidget size={size} />
    case "calendar":
      return <CalendarWidget />
    case "now-playing":
      return <NowPlayingWidget />
    default:
      return null
  }
}

// ── Next Event ──────────────────────────────────────────────────────────────
function NextEventWidget() {
  const events = useEvents()
  const next = events.data.find(e => !e.isPast)
  const latest = events.data.find(e => e.isPast)
  const shown = next ?? latest

  return (
    <div onClick={() => windowActions.open("calendar")} role="button" tabIndex={0} className="flex h-full w-full cursor-pointer flex-col justify-between p-3.5 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="size-3.5 text-[#e8590c]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-(--os-text-dim)">
            {next ? "Next Event" : "Latest Event"}
          </span>
        </div>
        {next && <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">RSVP open</span>}
      </div>
      {shown ? (
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-bold leading-snug text-(--os-text)">{shown.title}</p>
          <p className="mt-1 truncate text-[11px] text-(--os-text-dim)">{shown.date}</p>
          <p className="flex items-center gap-1 truncate text-[11px] text-(--os-text-dim)">
            <MapPin className="size-3 shrink-0" /> {shown.location}
          </p>
        </div>
      ) : (
        <p className="text-xs text-(--os-text-dim)">{events.status === "loading" ? "Loading events…" : "New events are announced on Meetup."}</p>
      )}
      <span className="text-[10px] font-medium text-[#7940ea]">Open Events →</span>
    </div>
  )
}

// ── Club at a Glance ────────────────────────────────────────────────────────
function ClubStatsWidget() {
  const { display: members } = useMemberCount()
  const team = useTeam()
  const projects = useProjects()
  const events = useEvents()
  const stats = [
    { label: "Members", value: members, icon: Users, color: "#7940ea" },
    { label: "Team", value: `${team.data.length}`, icon: Zap, color: "#5BA8D8" },
    { label: "Projects", value: projects.data.length > 0 ? `${projects.data.length}` : "3+", icon: Rocket, color: "#50C88A" },
    { label: "Events", value: events.fromFallback ? "1+" : `${events.data.length}`, icon: CalendarIcon, color: "#FF9900" },
  ]
  return (
    <div onClick={() => windowActions.open("aws")} role="button" tabIndex={0} className="flex h-full w-full cursor-pointer flex-col justify-between p-3.5 text-left">
      <span className="text-[11px] font-bold uppercase tracking-wider text-(--os-text-dim)">AWS SBG NMIET</span>
      <div className="grid grid-cols-4 gap-1.5">
        {stats.map(s => (
          <div key={s.label} className="flex flex-col items-center rounded-xl bg-black/5 p-1.5 text-center dark:bg-white/5">
            <s.icon className="size-3.5" style={{ color: s.color }} />
            <span className="mt-1 text-sm font-extrabold tabular-nums text-(--os-text)">{s.value}</span>
            <span className="text-[9px] font-medium text-(--os-text-dim)">{s.label}</span>
          </div>
        ))}
      </div>
      <span className="text-[10px] font-medium text-[#7940ea]">Open Home →</span>
    </div>
  )
}

// ── World Clock ─────────────────────────────────────────────────────────────
/** Local time, zone abbreviation (PDT/PST follows DST) and day/night for a city. */
function cityTime(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit", timeZoneName: "short" }).formatToParts(now)
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? ""
  const hour24 = Number(new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hourCycle: "h23" }).format(now))
  return {
    time: `${get("hour")}:${get("minute")} ${get("dayPeriod")}`.trim(),
    zone: timeZone === "Asia/Kolkata" ? "IST" : get("timeZoneName"),
    day: hour24 >= 6 && hour24 < 18,
  }
}

function ClockCitiesWidget({ size }: { size: WidgetSize }) {
  const [time, setTime] = useState<{ pune: ReturnType<typeof cityTime>; seattle: ReturnType<typeof cityTime> } | null>(null)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime({ pune: cityTime(now, "Asia/Kolkata"), seattle: cityTime(now, "America/Los_Angeles") })
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
          World Clock
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-(--os-text)">
            {time && !time.pune.day ? <Moon className="size-3 text-indigo-400" /> : <Sun className="size-3 text-amber-400" />}
            <span>Pune ({time?.pune.zone ?? "IST"})</span>
          </div>
          <p className="text-xl font-bold tracking-tight text-(--os-text) tabular-nums mt-0.5">
            {time?.pune.time || "..."}
          </p>
          <p className="text-[10px] text-(--os-text-dim)">NMIET Campus</p>
        </div>

        <div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-(--os-text)">
            {time?.seattle.day ? <Sun className="size-3 text-amber-400" /> : <Moon className="size-3 text-indigo-400" />}
            <span>Seattle{time ? ` (${time.seattle.zone})` : ""}</span>
          </div>
          <p className="text-xl font-bold tracking-tight text-(--os-text) tabular-nums mt-0.5">
            {time?.seattle.time || "..."}
          </p>
          <p className="text-[10px] text-(--os-text-dim)">AWS Headquarters</p>
        </div>
      </div>

    </div>
  )
}

// ── 3. Chapter Calendar Widget ────────────────────────────────────────────────
function CalendarWidget() {
  const events = useEvents()
  const next = events.data.find(e => !e.isPast)
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
        <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-(--os-text)">
          {next ? next.title : "No upcoming events"}
        </p>
        <p className="text-[10px] text-(--os-text-dim)">{next ? next.date : "Check Meetup for news"}</p>
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

        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-(--os-text-dim)">
        <span>Lo-fi while you explore</span>
        <span className="font-mono text-[#7940ea]">{track.duration}</span>
      </div>
    </div>
  )
}
