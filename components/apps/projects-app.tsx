"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Github, ExternalLink, ChevronRight, X, FolderOpen, Loader2 } from "lucide-react"
import { api } from "@/lib/api-client"

interface Project {
  id: string
  title: string
  description: string
  stack: string[]
  author: string
  status: "Production" | "Development" | "Beta"
  githubUrl?: string
  liveUrl?: string
  imageUrl?: string
}

const statusConfig: Record<string, { bg: string; color: string }> = {
  Production:  { bg: "rgba(80,200,138,0.12)",  color: "#3AAA72" },
  Development: { bg: "rgba(255,153,0,0.12)",   color: "#E88800" },
  Beta:        { bg: "rgba(91,168,216,0.12)",  color: "#4A90C0" },
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } } }

export function ProjectsApp() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<Project | null>(null)

  useEffect(() => {
    api.projects.list()
      .then(({ projects: p }) => setProjects(p as Project[]))
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
      <motion.div variants={item}>
        <h2 className="text-xl font-bold" style={{ color: "#1E1060" }}>Projects Showcase</h2>
        <p className="text-sm mt-0.5" style={{ color: "#7B6FC0" }}>Built by our talented team members</p>
      </motion.div>

      {projects.length === 0 ? (
        <motion.div variants={item} className="neu-raised-sm rounded-2xl p-12 text-center">
          <FolderOpen className="mx-auto mb-3 h-12 w-12 opacity-30" style={{ color: "#6B4FE8" }} />
          <p className="font-medium" style={{ color: "#7B6FC0" }}>No projects yet</p>
          <p className="text-sm mt-1" style={{ color: "#9B8FC8" }}>Add projects via the Admin panel.</p>
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => {
            const s = statusConfig[p.status] || statusConfig.Development
            return (
              <motion.div key={p.id} variants={item}
                className="neu-raised-sm rounded-2xl p-5"
                whileHover={{ y: -5, boxShadow: "8px 8px 22px #C2BAF0, -8px -8px 22px #FFFFFF" }}
                transition={{ type: "spring" as const, stiffness: 300 }}>
                {p.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.title} className="mb-3 h-28 w-full rounded-xl object-cover" />
                )}
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm" style={{ color: "#1E1060" }}>{p.title}</h3>
                    <p className="text-xs mt-0.5" style={{ color: "#9B8FC8" }}>by {p.author}</p>
                  </div>
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold flex-shrink-0"
                    style={{ background: s.bg, color: s.color }}>{p.status}</span>
                </div>
                <p className="mb-3 text-sm line-clamp-2" style={{ color: "#7B6FC0" }}>{p.description}</p>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {p.stack.map((t) => (
                    <span key={t} className="neu-tag rounded-lg px-2 py-0.5 text-xs font-medium" style={{ color: "#6B4FE8" }}>{t}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: "#D0C8F0" }}>
                  <div className="flex gap-2">
                    {p.githubUrl && (
                      <motion.a href={p.githubUrl} target="_blank" rel="noopener noreferrer"
                        className="neu-btn flex h-8 w-8 items-center justify-center rounded-xl"
                        whileHover={{ scale: 1.12, y: -2 }} whileTap={{ scale: 0.92 }}>
                        <Github className="h-4 w-4" style={{ color: "#7B6FC0" }} />
                      </motion.a>
                    )}
                    {p.liveUrl && (
                      <motion.a href={p.liveUrl} target="_blank" rel="noopener noreferrer"
                        className="neu-btn flex h-8 w-8 items-center justify-center rounded-xl"
                        whileHover={{ scale: 1.12, y: -2 }} whileTap={{ scale: 0.92 }}>
                        <ExternalLink className="h-4 w-4" style={{ color: "#7B6FC0" }} />
                      </motion.a>
                    )}
                  </div>
                  <motion.button onClick={() => setSelected(p)}
                    className="flex items-center gap-1 text-sm font-semibold"
                    style={{ color: "#6B4FE8" }} whileHover={{ x: 3 }}>
                    Details <ChevronRight className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(30,16,96,0.20)", backdropFilter: "blur(6px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}>
            <motion.div
              className="neu-panel w-full max-w-lg overflow-auto rounded-2xl"
              style={{ maxHeight: "80vh" }}
              initial={{ scale: 0.90, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring" as const, stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b p-4" style={{ borderColor: "#D0C8F0" }}>
                <h3 className="font-bold" style={{ color: "#1E1060" }}>{selected.title}</h3>
                <motion.button onClick={() => setSelected(null)}
                  className="neu-btn flex h-8 w-8 items-center justify-center rounded-xl"
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}>
                  <X className="h-4 w-4" style={{ color: "#7B6FC0" }} />
                </motion.button>
              </div>
              <div className="p-5 space-y-4">
                {selected.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selected.imageUrl} alt={selected.title} className="h-40 w-full rounded-2xl object-cover" />
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "#7B6FC0" }}>by {selected.author}</span>
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{ background: (statusConfig[selected.status] || statusConfig.Development).bg, color: (statusConfig[selected.status] || statusConfig.Development).color }}>
                    {selected.status}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#7B6FC0" }}>{selected.description}</p>
                <div>
                  <h4 className="mb-2 text-sm font-semibold" style={{ color: "#1E1060" }}>Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {selected.stack.map((t) => (
                      <span key={t} className="neu-tag rounded-xl px-3 py-1 text-sm font-medium" style={{ color: "#6B4FE8" }}>{t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  {selected.githubUrl && (
                    <motion.a href={selected.githubUrl} target="_blank" rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-2 neu-btn rounded-xl py-2.5 text-sm font-semibold"
                      style={{ color: "#1E1060" }} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                      <Github className="h-4 w-4" /> View Code
                    </motion.a>
                  )}
                  {selected.liveUrl && (
                    <motion.a href={selected.liveUrl} target="_blank" rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-2 neu-btn-primary rounded-xl py-2.5 text-sm font-semibold"
                      whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                      <ExternalLink className="h-4 w-4" /> Live Demo
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
