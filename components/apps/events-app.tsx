"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, MapPin, Users, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { api } from "@/lib/api-client"

interface Event {
  id: string
  title: string
  date: string
  location: string
  attendees: number
  imageUrls?: string[]
  isPast?: boolean
  description?: string
  tags?: string[]
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } } }

export function EventsApp() {
  const [events, setEvents]     = useState<Event[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<Event | null>(null)

  useEffect(() => {
    api.events.list()
      .then(({ events: e }) => setEvents(e as Event[]))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex h-60 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#6B4FE8" }} />
    </div>
  )

  return (
    <motion.div className="space-y-5" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#1E1060" }}>Events</h2>
          <p className="text-sm" style={{ color: "#7B6FC0" }}>Memories from our cloud journey</p>
        </div>
        <div className="neu-inset-sm rounded-xl px-3 py-1.5 text-sm" style={{ color: "#7B6FC0" }}>
          {events.length} events
        </div>
      </motion.div>

      {events.length === 0 ? (
        <motion.div variants={item} className="neu-raised-sm rounded-2xl p-12 text-center">
          <Calendar className="mx-auto mb-3 h-12 w-12 opacity-30" style={{ color: "#6B4FE8" }} />
          <p className="font-medium" style={{ color: "#7B6FC0" }}>No events yet</p>
          <p className="text-sm mt-1" style={{ color: "#9B8FC8" }}>Events added via the Admin panel will appear here.</p>
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <motion.div
              key={event.id}
              variants={item}
              className="neu-raised-sm cursor-pointer rounded-2xl p-4"
              whileHover={{ y: -5, boxShadow: "8px 8px 22px #C2BAF0, -8px -8px 22px #FFFFFF" }}
              transition={{ type: "spring" as const, stiffness: 300 }}
              onClick={() => setSelected(event)}
            >
              {/* Image grid */}
              <div className="mb-3 grid h-28 grid-cols-3 gap-1 overflow-hidden rounded-xl">
                {[0, 1, 2].map((idx) => {
                  const imgs = event.imageUrls || []
                  const src = imgs[idx]
                  const hidden = idx >= imgs.length && imgs.length !== 3
                  if (hidden) return null
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-center rounded-lg overflow-hidden ${
                        idx === 0 && imgs.length === 1 ? "col-span-3" :
                        idx === 0 && imgs.length === 2 ? "col-span-2" : ""
                      }`}
                      style={{ background: "linear-gradient(135deg, rgba(107,79,232,0.15), rgba(184,164,255,0.12))" }}
                    >
                      {src
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={src} alt={event.title} className="h-full w-full object-cover" />
                        : <ImageIcon className="h-7 w-7" style={{ color: "rgba(107,79,232,0.30)" }} />
                      }
                    </div>
                  )
                })}
                {(event.imageUrls?.length ?? 0) === 0 && (
                  <div className="col-span-3 flex items-center justify-center rounded-lg"
                    style={{ background: "linear-gradient(135deg, rgba(107,79,232,0.15), rgba(184,164,255,0.12))" }}>
                    <ImageIcon className="h-7 w-7" style={{ color: "rgba(107,79,232,0.30)" }} />
                  </div>
                )}
              </div>

              <div className="mb-1 flex items-center gap-2">
                <h3 className="font-semibold text-sm flex-1 min-w-0 truncate" style={{ color: "#1E1060" }}>{event.title}</h3>
                {event.isPast !== undefined && (
                  <span className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      background: event.isPast ? "rgba(155,143,200,0.12)" : "rgba(80,200,138,0.12)",
                      color: event.isPast ? "#9B8FC8" : "#3AAA72",
                    }}>
                    {event.isPast ? "Past" : "Upcoming"}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3 text-xs" style={{ color: "#9B8FC8" }}>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{event.date}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{event.location}</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{event.attendees}</span>
              </div>
            </motion.div>
          ))}
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
              <div className="flex items-center justify-between border-b p-4" style={{ borderColor: "#D0C8F0" }}>
                <h3 className="font-bold" style={{ color: "#1E1060" }}>{selected.title}</h3>
                <motion.button onClick={() => setSelected(null)}
                  className="neu-btn flex h-8 w-8 items-center justify-center rounded-xl"
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}>
                  <X className="h-4 w-4" style={{ color: "#7B6FC0" }} />
                </motion.button>
              </div>
              <div className="p-5 space-y-4">
                {(selected.imageUrls?.length ?? 0) > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {selected.imageUrls!.map((src, idx) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={idx} src={src} alt={selected.title}
                        className="h-36 w-full rounded-2xl object-cover" />
                    ))}
                  </div>
                )}
                {selected.description && (
                  <p className="text-sm leading-relaxed" style={{ color: "#7B6FC0" }}>{selected.description}</p>
                )}
                <div className="flex flex-wrap gap-3 text-sm">
                  {[
                    { icon: Calendar, text: selected.date },
                    { icon: MapPin,   text: selected.location },
                    { icon: Users,    text: `${selected.attendees} attendees` },
                  ].map(({ icon: Icon, text }) => (
                    <span key={text} className="neu-inset-sm flex items-center gap-2 rounded-xl px-3 py-2" style={{ color: "#7B6FC0" }}>
                      <Icon className="h-4 w-4" style={{ color: "#6B4FE8" }} /> {text}
                    </span>
                  ))}
                </div>
                {selected.tags && selected.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selected.tags.map((tag) => (
                      <span key={tag} className="neu-tag rounded-lg px-2 py-0.5 text-xs font-medium" style={{ color: "#6B4FE8" }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
