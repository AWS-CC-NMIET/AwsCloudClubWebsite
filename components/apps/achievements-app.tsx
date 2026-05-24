"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Trophy, Medal, Star, Award, Target, Zap, Loader2, 
  ArrowLeft, Calendar 
} from "lucide-react"
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

// Clean utility to remove quotes and replace em-dashes with a comma
const cleanText = (str: string) => {
  if (!str) return ""
  return str.replace(/"/g, "").replace(/—/g, ",").replace(/\s+/g, " ").trim()
}

export function AchievementsApp() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading]           = useState(true)
  const [selectedId, setSelectedId]     = useState<string | null>(null)

  useEffect(() => {
    api.achievements.list()
      .then(({ achievements: a }) => {
        const sorted = (a as Achievement[]).sort((x, y) => (x.order ?? 0) - (y.order ?? 0))
        setAchievements(sorted)
        if (sorted.length > 0) {
          setSelectedId(sorted[0].id)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const selectedAch = achievements.find((a) => a.id === selectedId)

  if (loading) return (
    <div className="flex h-60 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#6B4FE8" }} />
    </div>
  )

  // Group achievements for shelves:
  const tier1 = achievements.filter((_, idx) => idx % 3 === 0)
  const tier2 = achievements.filter((_, idx) => idx % 3 === 1)
  const tier3 = achievements.filter((_, idx) => idx % 3 === 2)

  return (
    <div className="flex h-full flex-col lg:flex-row gap-4 p-1 overflow-hidden" style={{ minHeight: "520px" }}>
      
      {/* ── Left Pane: The Virtual Trophy Cabinet (Shelves) ── */}
      <div className={`w-full lg:w-[48%] flex flex-col gap-3 ${selectedId && "hidden lg:flex" || "flex"}`}>
        <div className="bg-white/30 backdrop-blur-xs border border-white/40 shadow-2xs rounded-xl p-3 flex-shrink-0">
          <h2 className="text-sm font-bold text-indigo-950/80 uppercase tracking-wider px-1">Trophy Room</h2>
          <p className="text-[10px] text-indigo-950/50 px-1 mt-0.5">Click any collectible on the shelf to inspect its details</p>
        </div>

        {/* The Cabinet Container */}
        <div className="bg-[#1E1060]/5 border border-indigo-950/10 shadow-xs rounded-xl p-4 flex-1 flex flex-col justify-around gap-6 overflow-y-auto custom-scrollbar">
          
          {/* Shelf 1 */}
          <div className="relative pt-6 pb-2">
            <div className="flex justify-around items-end gap-2 px-2 z-10 relative">
              {tier1.map((ach) => {
                const Icon = iconMap[ach.iconName] || Trophy
                const isSelected = selectedId === ach.id
                return (
                  <TrophyItem 
                    key={ach.id} 
                    ach={ach} 
                    Icon={Icon} 
                    isSelected={isSelected} 
                    onClick={() => setSelectedId(ach.id)} 
                  />
                )
              })}
            </div>
            {/* Wooden/Glass Shelf line */}
            <div className="h-2.5 w-full bg-linear-to-r from-amber-700 via-amber-800 to-amber-900 rounded-lg shadow-sm border-t border-amber-600 mt-1 relative z-0" />
            <div className="h-3 w-[96%] mx-auto bg-black/10 blur-xs rounded-full mt-0.5" />
          </div>

          {/* Shelf 2 */}
          <div className="relative pt-6 pb-2">
            <div className="flex justify-around items-end gap-2 px-2 z-10 relative">
              {tier2.map((ach) => {
                const Icon = iconMap[ach.iconName] || Trophy
                const isSelected = selectedId === ach.id
                return (
                  <TrophyItem 
                    key={ach.id} 
                    ach={ach} 
                    Icon={Icon} 
                    isSelected={isSelected} 
                    onClick={() => setSelectedId(ach.id)} 
                  />
                )
              })}
            </div>
            {/* Wooden/Glass Shelf line */}
            <div className="h-2.5 w-full bg-linear-to-r from-amber-700 via-amber-800 to-amber-900 rounded-lg shadow-sm border-t border-amber-600 mt-1 relative z-0" />
            <div className="h-3 w-[96%] mx-auto bg-black/10 blur-xs rounded-full mt-0.5" />
          </div>

          {/* Shelf 3 */}
          <div className="relative pt-6 pb-2">
            <div className="flex justify-around items-end gap-2 px-2 z-10 relative">
              {tier3.map((ach) => {
                const Icon = iconMap[ach.iconName] || Trophy
                const isSelected = selectedId === ach.id
                return (
                  <TrophyItem 
                    key={ach.id} 
                    ach={ach} 
                    Icon={Icon} 
                    isSelected={isSelected} 
                    onClick={() => setSelectedId(ach.id)} 
                  />
                )
              })}
            </div>
            {/* Wooden/Glass Shelf line */}
            <div className="h-2.5 w-full bg-linear-to-r from-amber-700 via-amber-800 to-amber-900 rounded-lg shadow-sm border-t border-amber-600 mt-1 relative z-0" />
            <div className="h-3 w-[96%] mx-auto bg-black/10 blur-xs rounded-full mt-0.5" />
          </div>

        </div>
      </div>

      {/* ── Right Pane: Clean Minimal Details Card ── */}
      <div className={`flex-1 flex flex-col min-w-0 bg-white/35 backdrop-blur-xs border border-white/40 shadow-xs rounded-xl overflow-hidden ${
        selectedId ? "flex" : "hidden lg:flex"
      }`}>
        {selectedAch ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header Control */}
            <div className="flex items-center justify-between border-b border-white/30 bg-[#1E1060]/10 px-4 py-2.5 flex-shrink-0 text-indigo-950">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectedId(null)} 
                  className="lg:hidden flex items-center gap-1 text-xs font-bold text-indigo-950 bg-white/40 border border-white/50 rounded-lg px-2 py-1 mr-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
                <Trophy className="h-4.5 w-4.5 text-amber-500" />
                <h3 className="text-xs font-semibold text-indigo-950">
                  Inspect Achievement
                </h3>
              </div>
              <span className="text-[9px] font-bold text-[#6B4FE8] bg-[#6B4FE8]/10 border border-[#6B4FE8]/25 px-2 py-0.5 rounded-full uppercase">
                {selectedAch.type}
              </span>
            </div>

            {/* Content Space */}
            <div className="flex-1 p-5 overflow-y-auto bg-slate-900/5 custom-scrollbar flex items-center justify-center">
              
              {/* Minimalist Details Card with matching accent side-border */}
              <div 
                className="w-full max-w-md bg-white/80 backdrop-blur-xs border border-slate-200/60 shadow-md rounded-2xl p-6 relative flex flex-col select-text"
                style={{ borderLeft: `5px solid ${selectedAch.color}` }}
              >
                {/* Header Icon visual */}
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${selectedAch.color}15` }}
                  >
                    {(() => {
                      const IconComponent = iconMap[selectedAch.iconName] || Trophy
                      return <IconComponent className="h-5 w-5" style={{ color: selectedAch.color }} />
                    })()}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{cleanText(selectedAch.date)}</span>
                  </div>
                </div>

                {/* Achievement Title */}
                <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-tight mb-2 text-left">
                  {cleanText(selectedAch.title)}
                </h2>

                {/* Achievement Description */}
                <p className="text-xs md:text-sm leading-relaxed text-slate-600 font-sans text-left">
                  {cleanText(selectedAch.description)}
                </p>

                {/* Sub-footer detail */}
                <div className="mt-6 pt-3 border-t border-slate-100 text-[8px] text-slate-400 font-mono tracking-tight flex justify-between">
                  <span>AWS STUDENT BUILDER GROUP NMIET</span>
                  <span>RECORD: ACC-NMIET-{selectedAch.id.slice(4).toUpperCase()}</span>
                </div>

              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 py-16 opacity-35">
            <Trophy className="h-12 w-12 text-[#6B4FE8] mb-2" />
            <p className="text-xs font-semibold text-indigo-950">Select an achievement to inspect</p>
          </div>
        )}
      </div>

    </div>
  )
}

// ── Secondary component: TrophyItem ──
function TrophyItem({
  ach,
  Icon,
  isSelected,
  onClick,
}: {
  ach: Achievement
  Icon: React.ElementType
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      className="flex flex-col items-center gap-1 cursor-pointer select-none group relative"
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 350, damping: 20 }}
    >
      
      {/* Floating Trophy Ring/Sphere container */}
      <div 
        className={`h-14 w-14 rounded-full flex items-center justify-center border transition-all ${
          isSelected 
            ? "scale-110 shadow-lg border-white/60 bg-white" 
            : "bg-white/70 border-white/30 hover:bg-white/90"
        }`}
        style={{
          boxShadow: isSelected 
            ? `0 -4px 14px ${ach.color}50, 4px 4px 10px rgba(10, 6, 40, 0.15)` 
            : "2px 2px 6px rgba(10, 6, 40, 0.08)",
          borderColor: isSelected ? ach.color : undefined
        }}
      >
        <Icon 
          className="h-7 w-7 transition-transform group-hover:scale-110" 
          style={{ color: ach.color }} 
        />
      </div>

      {/* Selected Indicator Halo */}
      {isSelected && (
        <span className="absolute -top-1 right-0 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: ach.color }} />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: ach.color }} />
        </span>
      )}

      {/* Mini Title below Trophy */}
      <span 
        className={`text-[9px] font-semibold tracking-tight text-center max-w-[76px] truncate ${
          isSelected ? "text-[#1E1060] font-bold" : "text-[#7B6FC0]"
        }`}
      >
        {cleanText(ach.title).split(" ")[0]} {cleanText(ach.title).split(" ")[1] || ""}
      </span>

    </motion.button>
  )
}
