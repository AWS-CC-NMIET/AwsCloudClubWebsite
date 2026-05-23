"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMeetup } from "@/lib/meetup-context"

const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"]
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]

interface CalendarWidgetProps {
  onEventDateClick?: () => void
}

export function CalendarWidget({ onEventDateClick }: CalendarWidgetProps) {
  const now   = new Date()
  const [viewYear,  setViewYear]  = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

  const todayY = now.getFullYear()
  const todayM = now.getMonth()
  const todayD = now.getDate()

  // Pull events from the already-fetched Meetup context (no extra API call)
  const { events } = useMeetup()

  const eventDays = useMemo(() => {
    const days = new Set<string>()
    events.forEach((ev) => {
      if (!ev.dateTime) return
      const d = new Date(ev.dateTime) // full ISO with tz offset — parses correctly
      if (!isNaN(d.getTime())) {
        days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
      }
    })
    return days
  }, [events])

  const firstDow    = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let i = 1; i <= daysInMonth; i++) cells.push(i)
  while (cells.length % 7 !== 0) cells.push(null)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const darkCard: React.CSSProperties = {
    background: "rgba(10, 6, 24, 0.92)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(168,85,247,0.22)",
    boxShadow: "0 8px 28px rgba(107,79,232,0.28)",
  }

  return (
    <motion.div className="rounded-2xl overflow-hidden"
      style={darkCard}
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65, type: "spring", stiffness: 260 }}>

      <div className="px-4 py-3">
        {/* Month header + nav */}
        <div className="flex items-center justify-between mb-3">
          <motion.button
            onClick={prevMonth}
            className="flex h-6 w-6 items-center justify-center rounded-lg"
            style={{ background: "rgba(168,85,247,0.12)", color: "#A855F7" }}
            whileTap={{ scale: 0.88 }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </motion.button>

          <span className="text-xs font-bold tracking-wide" style={{ color: "#C4B5FD" }}>
            {MONTHS[viewMonth]} {viewYear}
          </span>

          <motion.button
            onClick={nextMonth}
            className="flex h-6 w-6 items-center justify-center rounded-lg"
            style={{ background: "rgba(168,85,247,0.12)", color: "#A855F7" }}
            whileTap={{ scale: 0.88 }}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </motion.button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(day => (
            <div key={day} className="text-center text-[10px] font-semibold" style={{ color: "rgba(168,85,247,0.55)" }}>{day}</div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((cell, i) => {
            const isToday    = cell === todayD && viewMonth === todayM && viewYear === todayY
            const isEventDay = cell !== null && eventDays.has(`${viewYear}-${viewMonth}-${cell}`)
            const isPast     = cell !== null && new Date(viewYear, viewMonth, cell) < new Date(todayY, todayM, todayD)

            return (
              <div key={i} className="flex items-center justify-center" style={{ height: 24 }}>
                {cell && (
                  <motion.button
                    onClick={isEventDay ? onEventDateClick : undefined}
                    className="flex items-center justify-center rounded-full text-xs relative"
                    style={{
                      width: 22, height: 22,
                      background: isToday
                        ? "linear-gradient(135deg, #7C3AED, #A855F7)"
                        : isEventDay
                        ? "rgba(239,68,68,0.18)"
                        : "transparent",
                      color: isToday
                        ? "#ffffff"
                        : isEventDay
                        ? "#FCA5A5"
                        : isPast
                        ? "rgba(167,139,250,0.35)"
                        : "rgba(196,181,253,0.85)",
                      fontWeight: isToday || isEventDay ? 700 : 400,
                      boxShadow: isToday
                        ? "0 0 10px rgba(168,85,247,0.50)"
                        : isEventDay
                        ? "0 0 8px rgba(239,68,68,0.30)"
                        : "none",
                      border: isEventDay && !isToday ? "1px solid rgba(239,68,68,0.45)" : "none",
                      cursor: isEventDay ? "pointer" : "default",
                    }}
                    whileHover={isEventDay ? { scale: 1.2 } : {}}
                    whileTap={isEventDay ? { scale: 0.92 } : {}}
                  >
                    {cell}
                    {/* Event dot */}
                    {isEventDay && !isToday && (
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full"
                        style={{ background: "#F87171" }} />
                    )}
                  </motion.button>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        {eventDays.size > 0 && (
          <div className="mt-2.5 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: "#EF4444" }} />
            <span className="text-[10px]" style={{ color: "rgba(167,139,250,0.65)" }}>Event day — click to view</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
