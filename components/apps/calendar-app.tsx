// components/apps/calendar-app.tsx
// Events — macOS Calendar with real Meetup + admin-managed events

"use client"

import React, { useMemo, useState } from "react"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  MapPin,
  Users,
} from "lucide-react"
import { CLUB } from "@/lib/club-content"
import { useEvents, type ClubEvent } from "@/lib/club-data"
import { sanitizeUrl, cn } from "@/lib/utils"
import {
  AppShell,
  BackButton,
  ChipBar,
  EmptyState,
  LoadingState,
  MacButton,
  OfflineNotice,
  Sidebar,
  SidebarItem,
  SidebarSection,
  Toolbar,
} from "./shared/mac-ui"
import { Stagger, StaggerItem } from "./shared/motion"

type Filter = "all" | "upcoming" | "past"

const IST = "Asia/Kolkata"
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"]

function dayKey(d: Date) {
  return d.toLocaleDateString("en-CA", { timeZone: IST }) // YYYY-MM-DD
}

function parseEventDate(e: ClubEvent) {
  const d = new Date(e.dateTime)
  return Number.isNaN(d.getTime()) ? null : d
}

function hasTime(e: ClubEvent) {
  return !/T00:00:00(?:\.000)?$/.test(e.dateTime)
}

function formatTime(e: ClubEvent) {
  const d = parseEventDate(e)
  if (!d || !hasTime(e)) return null
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: IST })
}

function formatLongDate(e: ClubEvent) {
  const d = parseEventDate(e)
  if (!d) return e.date
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: IST })
}

export function CalendarApp({ payload }: { payload?: { focusId?: string } }) {
  const events = useEvents()
  const [filter, setFilter] = useState<Filter>("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const upcoming = events.data.filter(e => !e.isPast)
  const past = events.data.filter(e => e.isPast)
  const visible = filter === "upcoming" ? upcoming : filter === "past" ? past : events.data
  const selected = events.data.find(e => e.id === selectedId) ?? upcoming[0] ?? events.data[0] ?? null

  // Jump the mini calendar to the selected event's month.
  const selectedDate = selected ? parseEventDate(selected) : null
  const selectedMonthKey = selectedDate?.toISOString().slice(0, 7)
  const [shownMonthKey, setShownMonthKey] = useState<string | undefined>()
  if (selectedMonthKey !== shownMonthKey) {
    setShownMonthKey(selectedMonthKey)
    if (selectedDate) setMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
  }

  const eventsByDay = useMemo(() => {
    const map = new Map<string, ClubEvent[]>()
    for (const e of events.data) {
      const d = parseEventDate(e)
      if (!d) continue
      const key = dayKey(d)
      map.set(key, [...(map.get(key) ?? []), e])
    }
    return map
  }, [events.data])

  const select = (id: string) => {
    setSelectedId(id)
    setDetailOpen(true)
  }

  // Opened from Spotlight with a specific event.
  const [focusedId, setFocusedId] = useState<string | undefined>()
  if (payload?.focusId && payload.focusId !== focusedId) {
    setFocusedId(payload.focusId)
    setFilter("all")
    select(payload.focusId)
  }

  const filterOptions = [
    { id: "all" as Filter, label: "All Events", count: events.data.length },
    { id: "upcoming" as Filter, label: "Upcoming", count: upcoming.length },
    { id: "past" as Filter, label: "Past", count: past.length },
  ]

  const isLoading = events.status === "loading" && events.data.length === 0

  return (
    <AppShell>
      <Sidebar hideOnNarrow>
        <MiniCalendar
          month={month}
          onMonthChange={setMonth}
          eventsByDay={eventsByDay}
          selected={selected}
          onSelectDay={list => select(list[0].id)}
        />
        <SidebarSection title="Calendars">
          {filterOptions.map(f => (
            <SidebarItem
              key={f.id}
              icon={CalendarDays}
              iconClassName={f.id === "upcoming" ? "text-emerald-500" : f.id === "past" ? "text-neutral-400" : "text-[#FF9900]"}
              label={f.label}
              count={isLoading ? "—" : f.count}
              active={filter === f.id}
              onClick={() => setFilter(f.id)}
            />
          ))}
        </SidebarSection>
        <MacButton variant="aws" href={CLUB.meetupUrl} className="mt-auto">
          <ExternalLink className="size-3.5" /> View on Meetup
        </MacButton>
      </Sidebar>

      <div className="flex min-w-0 flex-1">
        {/* ── Agenda ────────────────────────────────────────────────────────── */}
        <div
          className={cn(
            "min-w-0 flex-col border-(--win-divider) @3xl:flex @3xl:w-80 @3xl:flex-none @3xl:border-r",
            detailOpen ? "hidden" : "flex flex-1"
          )}
        >
          <Toolbar
            title={filterOptions.find(f => f.id === filter)?.label}
            subtitle={isLoading ? "Loading…" : `${visible.length} ${visible.length === 1 ? "event" : "events"}`}
            right={
              <a
                href={CLUB.meetupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-(--accent) hover:underline @xl:hidden"
              >
                Meetup ↗
              </a>
            }
          />
          <ChipBar options={filterOptions} value={filter} onChange={setFilter} className="border-b border-(--win-divider)" />
          <OfflineNotice show={events.status === "error" && !events.fromFallback} />
          <div className="flex-1 overflow-y-auto p-2">
            {isLoading ? (
              <LoadingState label="Loading events…" />
            ) : visible.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title={filter === "upcoming" ? "No upcoming events yet" : "No events found"}
                message="New sessions are announced on Meetup first."
                action={<MacButton variant="aws" href={CLUB.meetupUrl}>Follow on Meetup</MacButton>}
              />
            ) : (
              <Stagger key={filter} className="space-y-1">
                {visible.map((e, i) => {
                  const showHeader = filter === "all" && (i === 0 || visible[i - 1].isPast !== e.isPast)
                  return (
                    <React.Fragment key={e.id}>
                      {showHeader && (
                        <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-(--os-text-dim)">
                          {e.isPast ? "Past" : "Upcoming"}
                        </p>
                      )}
                      <StaggerItem>
                        <EventRow event={e} active={selected?.id === e.id} onClick={() => select(e.id)} />
                      </StaggerItem>
                    </React.Fragment>
                  )
                })}
              </Stagger>
            )}
          </div>
        </div>

        {/* ── Event detail ──────────────────────────────────────────────────── */}
        <div className={cn("min-w-0 flex-1 flex-col @3xl:flex", detailOpen ? "flex" : "hidden")}>
          <Toolbar left={<span className="@3xl:hidden"><BackButton onClick={() => setDetailOpen(false)} label="Events" /></span>} />
          {selected ? (
            <EventDetail event={selected} />
          ) : isLoading ? (
            <LoadingState />
          ) : (
            <EmptyState icon={CalendarDays} title="No event selected" />
          )}
        </div>
      </div>
    </AppShell>
  )
}

function EventRow({ event, active, onClick }: { event: ClubEvent; active: boolean; onClick: () => void }) {
  const d = parseEventDate(event)
  const time = formatTime(event)
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-colors",
        active ? "bg-(--accent)/12 ring-1 ring-(--accent)/40" : "hover:bg-black/5 dark:hover:bg-white/10"
      )}
    >
      <div
        className={cn(
          "flex w-11 shrink-0 flex-col items-center overflow-hidden rounded-lg border text-center",
          event.isPast ? "border-(--win-divider) opacity-70" : "border-[#FF9900]/40"
        )}
      >
        <span className={cn("w-full py-0.5 text-[9px] font-bold uppercase text-white", event.isPast ? "bg-neutral-400 dark:bg-neutral-600" : "bg-[#e8590c]")}>
          {d ? d.toLocaleDateString("en-IN", { month: "short", timeZone: IST }) : "—"}
        </span>
        <span className="py-0.5 text-lg font-bold leading-tight text-(--os-text)">
          {d ? d.toLocaleDateString("en-IN", { day: "numeric", timeZone: IST }) : "?"}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-(--os-text)">{event.title}</p>
        <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-(--os-text-dim)">
          {time && <span className="flex items-center gap-1"><Clock className="size-3" /> {time}</span>}
          <span className="flex min-w-0 items-center gap-1"><MapPin className="size-3 shrink-0" /> <span className="truncate">{event.location}</span></span>
          {event.attendees > 0 && <span className="flex items-center gap-1"><Users className="size-3" /> {event.attendees}</span>}
        </p>
      </div>
    </button>
  )
}

function EventDetail({ event }: { event: ClubEvent }) {
  const time = formatTime(event)
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl space-y-6 p-6 @2xl:p-8">
        {event.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.imageUrl}
            alt=""
            loading="lazy"
            className="aspect-[2/1] w-full rounded-xl border border-(--win-divider) object-cover shadow-sm"
          />
        )}
        <div className="space-y-3">
          <span
            className={cn(
              "inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
              event.isPast
                ? "bg-neutral-500/10 text-neutral-500 dark:text-neutral-400"
                : "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
            )}
          >
            {event.isPast ? "Past event" : "Upcoming"}
          </span>
          <h1 className="text-2xl font-bold leading-snug text-(--os-text)">{event.title}</h1>
          <div className="grid gap-2 text-[13px] text-(--os-text)">
            <p className="flex items-center gap-2">
              <CalendarDays className="size-4 shrink-0 text-(--accent)" />
              {formatLongDate(event)}
              {time && <span className="text-(--os-text-dim)">· {time} IST</span>}
            </p>
            <p className="flex items-center gap-2"><MapPin className="size-4 shrink-0 text-(--accent)" /> {event.location}</p>
            {event.attendees > 0 && (
              <p className="flex items-center gap-2">
                <Users className="size-4 shrink-0 text-(--accent)" /> {event.attendees} {event.isPast ? "attended / RSVP'd" : "going"}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <MacButton variant={event.isPast ? "secondary" : "aws"} href={sanitizeUrl(event.eventUrl, CLUB.meetupUrl)}>
            <ExternalLink className="size-3.5" /> {event.isPast ? "View on Meetup" : "RSVP on Meetup"}
          </MacButton>
        </div>

        {event.description && (
          <div className="border-t border-(--win-divider) pt-5">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-(--os-text-dim)">About this event</h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-(--os-text)">{event.description}</p>
          </div>
        )}

        {event.imageUrls.length > 0 && (
          <div className="border-t border-(--win-divider) pt-5">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-(--os-text-dim)">Photos</h3>
            <div className="grid grid-cols-3 gap-2">
              {event.imageUrls.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url + i} src={url} alt={`${event.title} photo ${i + 1}`} loading="lazy" className="aspect-square w-full rounded-lg object-cover" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MiniCalendar({
  month,
  onMonthChange,
  eventsByDay,
  selected,
  onSelectDay,
}: {
  month: Date
  onMonthChange: (d: Date) => void
  eventsByDay: Map<string, ClubEvent[]>
  selected: ClubEvent | null
  onSelectDay: (events: ClubEvent[]) => void
}) {
  const year = month.getFullYear()
  const m = month.getMonth()
  const firstWeekday = new Date(year, m, 1).getDay()
  const daysInMonth = new Date(year, m + 1, 0).getDate()
  const todayKey = dayKey(new Date())
  const selectedKey = selected ? (parseEventDate(selected) ? dayKey(parseEventDate(selected)!) : null) : null

  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  return (
    <div className="rounded-xl border border-(--win-divider) bg-white/60 p-2.5 dark:bg-white/[0.04]">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[13px] font-semibold text-(--os-text)">
          {month.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </span>
        <div className="flex">
          <button onClick={() => onMonthChange(new Date(year, m - 1, 1))} aria-label="Previous month" className="rounded p-0.5 text-(--os-text-dim) hover:bg-black/5 dark:hover:bg-white/10">
            <ChevronLeft className="size-4" />
          </button>
          <button onClick={() => onMonthChange(new Date(year, m + 1, 1))} aria-label="Next month" className="rounded p-0.5 text-(--os-text-dim) hover:bg-black/5 dark:hover:bg-white/10">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-0.5 text-center text-[11px]">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="pb-1 font-semibold text-(--os-text-dim)">{d}</span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`b${i}`} />
          const key = `${year}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          const dayEvents = eventsByDay.get(key)
          const isToday = key === todayKey
          const isSelected = key === selectedKey
          return (
            <button
              key={key}
              disabled={!dayEvents}
              onClick={() => dayEvents && onSelectDay(dayEvents)}
              className={cn(
                "relative mx-auto flex size-6 items-center justify-center rounded-full tabular-nums transition-colors",
                isSelected
                  ? "bg-(--accent) font-bold text-white"
                  : isToday
                    ? "font-bold text-[#e8590c]"
                    : "text-(--os-text)",
                dayEvents && !isSelected && "cursor-pointer hover:bg-black/5 dark:hover:bg-white/10",
                !dayEvents && "cursor-default"
              )}
            >
              {day}
              {dayEvents && !isSelected && <span className="absolute bottom-0 size-1 rounded-full bg-[#e8590c]" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
