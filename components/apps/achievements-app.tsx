"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trophy, Medal, Star, Award, Target, Zap, Loader2 } from "lucide-react"
import { api } from "@/lib/api-client"

interface Achievement {
  id: string
  title: string
  date: string
  description: string
  type: string
  iconName: string
  color: string
  order: number
}

const iconMap: Record<string, React.ElementType> = {
  Trophy, Medal, Star, Award, Target, Zap,
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } } }

export function AchievementsApp() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    api.achievements.list()
      .then(({ achievements: a }) => {
        const sorted = (a as Achievement[]).sort((x, y) => (x.order ?? 0) - (y.order ?? 0))
        setAchievements(sorted)
      })
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

      {achievements.length === 0 ? (
        <motion.div variants={item} className="neu-raised-sm rounded-2xl p-12 text-center">
          <Trophy className="mx-auto mb-3 h-12 w-12 opacity-30" style={{ color: "#6B4FE8" }} />
          <p className="font-medium" style={{ color: "#7B6FC0" }}>No achievements yet</p>
          <p className="text-sm mt-1" style={{ color: "#9B8FC8" }}>Add achievements via the Admin panel.</p>
        </motion.div>
      ) : (
        <>
          {/* Timeline */}
          <motion.div variants={item}>
            <h2 className="mb-4 text-lg font-bold" style={{ color: "#1E1060" }}>Achievement Timeline</h2>
            <div className="space-y-3">
              {achievements.map((ach, i) => {
                const Icon = iconMap[ach.iconName] || Trophy
                return (
                  <motion.div key={ach.id}
                    className="relative flex gap-4 neu-raised-sm rounded-2xl p-4"
                    whileHover={{ y: -3 }}
                    transition={{ type: "spring" as const, stiffness: 300 }}>
                    <div
                      className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-white"
                      style={{ background: `linear-gradient(135deg, ${ach.color}, ${ach.color}BB)`, boxShadow: `4px 4px 12px ${ach.color}40` }}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-sm" style={{ color: "#1E1060" }}>{ach.title}</h3>
                        <span className="neu-tag rounded-lg px-2 py-0.5 text-[10px] font-medium" style={{ color: "#7B6FC0" }}>{ach.type}</span>
                      </div>
                      <p className="text-sm" style={{ color: "#7B6FC0" }}>{ach.description}</p>
                      <span className="text-xs font-semibold mt-1 inline-block" style={{ color: ach.color }}>{ach.date}</span>
                    </div>
                    {i < achievements.length - 1 && (
                      <div className="absolute left-[2.25rem] top-[4.75rem] h-3 w-0.5 rounded-full" style={{ background: "#C2BAF0" }} />
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </>
      )}

      {/* Featured badge */}
      <motion.div variants={item}
        className="rounded-2xl p-6 text-center"
        style={{ background: "linear-gradient(135deg, rgba(107,79,232,0.10), rgba(184,164,255,0.07))", border: "1px solid rgba(194,186,240,0.50)" }}>
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full text-white"
          style={{ background: "linear-gradient(135deg,#6B4FE8,#B8A4FF)", boxShadow: "5px 5px 16px rgba(107,79,232,0.35)" }}>
          <Trophy className="h-8 w-8" />
        </div>
        <h3 className="mb-1 text-lg font-bold" style={{ color: "#1E1060" }}>AWS Cloud Club Excellence</h3>
        <p className="text-sm" style={{ color: "#7B6FC0" }}>
          Committed to innovation, learning, and building the future of cloud computing.
        </p>
      </motion.div>
    </motion.div>
  )
}
