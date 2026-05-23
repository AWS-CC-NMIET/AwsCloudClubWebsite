"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, MapPin, Users, X, ExternalLink, Loader2 } from "lucide-react"
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
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } } }

const MEETUP_URL = "https://www.meetup.com/aws-cloud-club-at-nutan-maharashtra-inst-of-eng-tech/"

export function EventsApp() {
  const [events, setEvents]     = useState<MeetupEvent[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<MeetupEvent | null>(null)

  useEffect(() => {
    api.meetup.data()
      .then((d) => setEvents(d.events as MeetupEvent[]))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const upcoming = events.filter((e) => !e.isPast)
  const past     = events.filter((e) =>  e.isPast)

  if (loading) return (
    <div className="flex h-60 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#6B4FE8" }} />
    </div>
  )

  return (
    <motion.div className="space-y-5" variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#1E1060" }}>Events</h2>
          <p className="text-sm" style={{ color: "#7B6FC0" }}>From our Meetup community</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="neu-inset-sm rounded-xl px-3 py-1.5 text-sm" style={{ color: "#7B6FC0" }}>
            {events.length} events
          </div>
          <motion.a
            href={MEETUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#E83030,#FF5555)", boxShadow: "4px 4px 12px rgba(232,48,48,0.30)" }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Meetup
          </motion.a>
        </div>
      </motion.div>

      {events.length === 0 ? (
        <motion.div variants={item} className="neu-raised-sm rounded-2xl p-12 text-center">
          <Calendar className="mx-auto mb-3 h-12 w-12 opacity-30" style={{ color: "#6B4FE8" }} />
          <p className="font-medium" style={{ color: "#7B6FC0" }}>No events found</p>
          <p className="text-sm mt-1" style={{ color: "#9B8FC8" }}>Check back soon or view on Meetup.</p>
          <a href={MEETUP_URL} target="_blank" rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium"
            style={{ color: "#6B4FE8" }}>
            <ExternalLink className="h-3.5 w-3.5" /> View on Meetup
          </a>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: "#9B8FC8" }}>
                Upcoming
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {upcoming.map((event) => (
                  <EventCard key={event.id} event={event} onSelect={setSelected} />
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: "#9B8FC8" }}>
                Past Events
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {past.map((event) => (
                  <EventCard key={event.id} event={event} onSelect={setSelected} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(30,16,96,0.20)", backdropFilter: "blur(6px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="neu-panel w-full max-w-2xl overflow-auto rounded-2xl"
              style={{ maxHeight: "80vh" }}
              initial={{ scale: 0.90, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring" as const, stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b p-4" style={{ borderColor: "rgba(107,79,232,0.22)" }}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold flex-shrink-0"
                    style={{
                      background: selected.isPast ? "rgba(155,143,200,0.12)" : "rgba(80,200,138,0.12)",
                      color: selected.isPast ? "#9B8FC8" : "#3AAA72",
                    }}>
                    {selected.isPast ? "Past" : "Upcoming"}
                  </span>
                  <h3 className="font-bold truncate" style={{ color: "#1E1060" }}>{selected.title}</h3>
                </div>
                <motion.button onClick={() => setSelected(null)}
                  className="neu-btn ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}>
                  <X className="h-4 w-4" style={{ color: "#7B6FC0" }} />
                </motion.button>
              </div>

              <div className="p-5 space-y-4">
                {selected.description && (
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#7B6FC0" }}>
                    {selected.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 text-sm">
                  {[
                    { icon: Calendar, text: selected.date },
                    { icon: MapPin,   text: selected.location },
                    { icon: Users,    text: `${selected.attendees} going` },
                  ].map(({ icon: Icon, text }) => (
                    <span key={text} className="neu-inset-sm flex items-center gap-2 rounded-xl px-3 py-2" style={{ color: "#7B6FC0" }}>
                      <Icon className="h-4 w-4" style={{ color: "#6B4FE8" }} /> {text}
                    </span>
                  ))}
                </div>

                <motion.a
                  href={selected.eventUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg,#E83030,#FF5555)", boxShadow: "4px 4px 12px rgba(232,48,48,0.25)" }}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <ExternalLink className="h-4 w-4" />
                  {selected.isPast ? "View on Meetup" : "RSVP on Meetup"}
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function EventCard({ event, onSelect }: { event: MeetupEvent; onSelect: (e: MeetupEvent) => void }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } } }}
      className="neu-raised-sm cursor-pointer rounded-2xl p-4"
      whileHover={{ y: -5, boxShadow: "8px 8px 22px rgba(107,79,232,0.26), -6px -6px 16px rgba(255,255,255,0.72)" }}
      transition={{ type: "spring" as const, stiffness: 300 }}
      onClick={() => onSelect(event)}
    >
      {/* Status + date header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
          style={{
            background: event.isPast ? "rgba(155,143,200,0.12)" : "rgba(80,200,138,0.12)",
            color: event.isPast ? "#9B8FC8" : "#3AAA72",
          }}>
          {event.isPast ? "Past" : "Upcoming"}
        </span>
        <span className="text-xs" style={{ color: "#B8A4FF" }}>{event.date}</span>
      </div>

      <h3 className="mb-2 font-semibold text-sm leading-snug" style={{ color: "#1E1060" }}>{event.title}</h3>

      {event.description && (
        <p className="mb-3 text-xs leading-relaxed line-clamp-2" style={{ color: "#9B8FC8" }}>
          {event.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 text-xs" style={{ color: "#9B8FC8" }}>
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>
        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{event.attendees} going</span>
      </div>
    </motion.div>
  )
}
