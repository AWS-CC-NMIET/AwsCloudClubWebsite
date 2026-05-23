"use client"

import { motion } from "framer-motion"

const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"]
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]

export function CalendarWidget() {
  const today = new Date()
  const y = today.getFullYear()
  const m = today.getMonth()
  const d = today.getDate()

  const firstDow = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let i = 1; i <= daysInMonth; i++) cells.push(i)
  // pad to full rows
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <motion.div className="rounded-2xl overflow-hidden"
      style={{ background: "#D4CEFF", boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)" }}
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65, type: "spring", stiffness: 260 }}>
      <div className="px-4 py-3"
        style={{ background: "linear-gradient(135deg,rgba(107,79,232,0.06),rgba(184,164,255,0.06))" }}>

        {/* Month + year header */}
        <div className="mb-2.5">
          <span className="text-xs font-semibold" style={{ color: "#6B4FE8" }}>
            {MONTHS[m]} {y}
          </span>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(day => (
            <div key={day} className="text-center text-xs font-medium" style={{ color: "#9B8FC8" }}>{day}</div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((cell, i) => {
            const isToday = cell === d
            return (
              <div key={i} className="flex items-center justify-center" style={{ height: 24 }}>
                {cell && (
                  <div
                    className="flex items-center justify-center rounded-full text-xs"
                    style={{
                      width: 22, height: 22,
                      background: isToday ? "linear-gradient(135deg,#5B3FE0,#7B5FFF)" : "transparent",
                      color: isToday ? "#ffffff" : "#1E1060",
                      fontWeight: isToday ? 700 : 400,
                      boxShadow: isToday ? "2px 2px 6px rgba(107,79,232,0.4)" : "none",
                    }}
                  >
                    {cell}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
