"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, MapPin, Users, X, ExternalLink, Loader2, CornerDownRight } from "lucide-react"
import { api } from "@/lib/api-client"

interface MeetupEvent {
  id: string
  title: string
  date: string
  dateTime: string
  location: string
  attendees: number
  description?: string
  eventUrl: string
  isPast: boolean
  imageUrls?: string[]
}

interface DbEvent {
  id: string
  title: string
  date: string
  location: string
  attendees: number
  description?: string
  imageUrls?: string[]
  isPast: boolean
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } } }

const MEETUP_URL = "https://www.meetup.com/aws-cloud-club-at-nutan-maharashtra-inst-of-eng-tech/"

export function EventsApp() {
  const [events, setEvents]     = useState<MeetupEvent[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<MeetupEvent | null>(null)
  const [filter, setFilter]     = useState<"all" | "upcoming" | "past">("all")

  useEffect(() => {
    const load = async () => {
      const [meetupRes, dbRes] = await Promise.allSettled([
        api.meetup.data(),
        api.events.list(),
      ])

      const meetupEvents: MeetupEvent[] =
        meetupRes.status === "fulfilled"
          ? (meetupRes.value.events as MeetupEvent[])
          : []

      const dbEvents: MeetupEvent[] =
        dbRes.status === "fulfilled"
          ? (dbRes.value.events as DbEvent[]).map((e) => ({
              id:          e.id,
              title:       e.title,
              date:        (() => {
                try { return new Date(e.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) }
                catch { return e.date }
              })(),
              dateTime:    e.date + "T00:00:00",
              location:    e.location,
              attendees:   Number(e.attendees) || 0,
              description: e.description || "",
              eventUrl:    MEETUP_URL,
              isPast:      Boolean(e.isPast),
              imageUrls:   e.imageUrls || [],
            }))
          : []

      // Deduplicate: if the same title already came from Meetup, skip the DB copy
      const meetupTitles = new Set(meetupEvents.map((e) => e.title.toLowerCase().trim()))
      const uniqueDb = dbEvents.filter((e) => !meetupTitles.has(e.title.toLowerCase().trim()))

      const merged = [...meetupEvents, ...uniqueDb]
      merged.sort((a, b) => {
        if (a.isPast !== b.isPast) return a.isPast ? 1 : -1
        return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
      })

      setEvents(merged)
      setLoading(false)
    }
    load()
  }, [])

  const upcoming = events.filter((e) => !e.isPast)
  const past     = events.filter((e) =>  e.isPast)
  const filtered = filter === "upcoming" ? upcoming : filter === "past" ? past : events

  const filterOpts = [
    { id: "all",      label: "All Events",   count: events.length   },
    { id: "upcoming", label: "Upcoming",     count: upcoming.length },
    { id: "past",     label: "Past Events",  count: past.length     },
  ]

  return (
    <div className="flex h-full flex-col md:flex-row gap-2 md:gap-4 p-1 overflow-hidden" style={{ minHeight: "520px" }}>

      {/* ── Mobile-only: compact horizontal filter + meetup strip ── */}
      <div className="flex md:hidden gap-2 flex-shrink-0 overflow-x-auto hide-scrollbar pb-1">
        {filterOpts.map((f) => {
          const isActive = filter === f.id
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as "all" | "upcoming" | "past")}
              className={`flex-shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-[#6B4FE8] text-white shadow-sm"
                  : "bg-white/40 text-indigo-950/60 border border-white/40"
              }`}
            >
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              {f.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/25 text-white" : "bg-indigo-950/5 text-indigo-950/40"}`}>
                {loading ? "—" : f.count}
              </span>
            </button>
          )
        })}
        <motion.a
          href={MEETUP_URL} target="_blank" rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold bg-[#E83030] text-white"
          whileTap={{ scale: 0.96 }}
        >
          <ExternalLink className="h-3.5 w-3.5" /> Meetup
        </motion.a>
      </div>

      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <div className="hidden md:flex w-52 flex-shrink-0 flex-col gap-3">
        {/* Path header */}
        <div className="bg-white/30 backdrop-blur-sm border border-white/40 shadow-2xs rounded-xl p-3">
          <p className="text-[10px] font-bold text-indigo-950/50 uppercase tracking-wider px-2 mb-2">Community</p>
          <div className="flex items-center gap-2 px-2 py-1 bg-white/20 border border-white/30 rounded-lg text-indigo-950 text-xs font-semibold">
            <CornerDownRight className="h-3 w-3 text-indigo-950/60" />
            <span>/root/events</span>
          </div>
        </div>

        {/* Filter list */}
        <div className="bg-white/35 backdrop-blur-sm border border-white/40 shadow-xs rounded-xl p-2 flex flex-col gap-1">
          <p className="text-[9px] font-bold text-indigo-950/40 uppercase tracking-wider px-2.5 py-1.5">Filter</p>
          {filterOpts.map((f) => {
            const isActive = filter === f.id
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as "all" | "upcoming" | "past")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all text-xs ${
                  isActive ? "bg-[#6B4FE8] text-white font-semibold shadow-xs" : "text-indigo-950 hover:bg-white/25"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Calendar className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-white" : "text-[#6B4FE8]"}`} />
                  <span className="truncate">{f.label}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-indigo-950/5 text-indigo-950/50"}`}>
                  {loading ? "—" : f.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Meetup link */}
        <motion.a
          href={MEETUP_URL} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#E83030] hover:bg-[#C82020] text-white rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors"
          whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
        >
          <ExternalLink className="h-3.5 w-3.5" /> View on Meetup
        </motion.a>
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white/35 backdrop-blur-sm border border-white/40 shadow-xs rounded-xl overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-white/30 bg-white/20 px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#6B4FE8]" />
            <h3 className="text-xs font-semibold text-indigo-950">
              {filter === "all" ? "All Events" : filter === "upcoming" ? "Upcoming Events" : "Past Events"}
            </h3>
          </div>
          <span className="text-[10px] text-indigo-950/50 bg-white/30 px-2 py-0.5 rounded border border-white/20">
            {loading ? "loading…" : `${filtered.length} events`}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-[#6B4FE8] opacity-60" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 opacity-40">
              <Calendar className="h-10 w-10 text-[#6B4FE8] mb-2" />
              <p className="text-xs font-medium text-indigo-950">No events found</p>
              <p className="text-[10px] text-indigo-950/60 mt-1">Check back soon or view on Meetup</p>
            </div>
          ) : (
            <motion.div
              className="grid gap-3 md:grid-cols-2"
              variants={container} initial="hidden" animate="show"
            >
              {filtered.map((event) => (
                <EventCard key={event.id} event={event} onSelect={setSelected} />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Event Detail Modal ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(30,16,96,0.15)", backdropFilter: "blur(8px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="bg-white/90 backdrop-blur-sm border border-white/60 shadow-lg w-full max-w-lg overflow-auto rounded-2xl"
              style={{ maxHeight: "80vh" }}
              initial={{ scale: 0.92, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: "spring" as const, stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-indigo-100 px-5 py-3.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold flex-shrink-0"
                    style={{
                      background: selected.isPast ? "rgba(155,143,200,0.15)" : "rgba(80,200,138,0.15)",
                      color: selected.isPast ? "#7B6FC0" : "#2D9A60",
                    }}
                  >
                    {selected.isPast ? "Past" : "Upcoming"}
                  </span>
                  <h3 className="text-sm font-bold text-indigo-950 truncate">{selected.title}</h3>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="ml-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-indigo-950/60" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {selected.description && (
                  <p className="text-sm leading-relaxed text-indigo-950/70 whitespace-pre-line">
                    {selected.description}
                  </p>
                )}

                {/* Event photos (admin-added) */}
                {selected.imageUrls && selected.imageUrls.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {selected.imageUrls.map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={url} alt="" className="h-24 w-24 rounded-xl object-cover border border-indigo-100" />
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2.5">
                  {[
                    { icon: Calendar, text: selected.date },
                    { icon: MapPin,   text: selected.location },
                    { icon: Users,    text: `${selected.attendees} going` },
                  ].map(({ icon: Icon, text }) => (
                    <span
                      key={text}
                      className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-1.5 text-xs text-indigo-950/70"
                    >
                      <Icon className="h-3.5 w-3.5 text-indigo-400" /> {text}
                    </span>
                  ))}
                </div>

                {selected.eventUrl && (
                  <motion.a
                    href={selected.eventUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#6B4FE8] hover:bg-[#5B3FD8] text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
                    whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                  >
                    <ExternalLink className="h-4 w-4" />
                    {selected.isPast ? "View on Meetup" : "RSVP on Meetup"}
                  </motion.a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function EventCard({ event, onSelect }: { event: MeetupEvent; onSelect: (e: MeetupEvent) => void }) {
  return (
    <motion.div
      variants={item}
      className="bg-white/50 border border-white/60 rounded-xl p-4 cursor-pointer"
      whileHover={{ y: -2 }}
      transition={{ type: "spring" as const, stiffness: 300 }}
      onClick={() => onSelect(event)}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[10px] font-semibold rounded-full px-2.5 py-0.5"
          style={{
            background: event.isPast ? "rgba(155,143,200,0.15)" : "rgba(80,200,138,0.15)",
            color: event.isPast ? "#7B6FC0" : "#2D9A60",
          }}
        >
          {event.isPast ? "Past" : "Upcoming"}
        </span>
        <span className="text-[10px] text-indigo-950/40">{event.date}</span>
      </div>

      <h3 className="text-sm font-bold text-indigo-950 mb-2 leading-snug">{event.title}</h3>

      {event.description && (
        <p className="text-xs text-indigo-950/60 leading-relaxed line-clamp-2 mb-3">
          {event.description}
        </p>
      )}

      <div className="flex flex-wrap gap-3 text-[11px] text-indigo-950/50">
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>
        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{event.attendees} going</span>
      </div>
    </motion.div>
  )
}
