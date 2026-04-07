"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BookOpen, Video, FileText, Code, ExternalLink, Star, Loader2 } from "lucide-react"
import { api } from "@/lib/api-client"

interface Resource {
  id: string
  name: string
  category: string
  type: "Course" | "Video" | "Document" | "Tool"
  url: string
  featured: boolean
  order: number
}

const typeIcon = (type: string) => {
  if (type === "Course")   return <BookOpen className="h-3.5 w-3.5" />
  if (type === "Video")    return <Video className="h-3.5 w-3.5" />
  if (type === "Document") return <FileText className="h-3.5 w-3.5" />
  return <Code className="h-3.5 w-3.5" />
}

const categoryColors: Record<string, string> = {
  "AWS Fundamentals":     "#6B4FE8",
  "Compute & Serverless": "#FF9900",
  "Database & Storage":   "#5BA8D8",
  "DevOps & CI/CD":       "#50C88A",
}
const defaultColor = "#6B4FE8"

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } } }

export function ResourcesApp() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    api.resources.list()
      .then(({ resources: r }) => {
        const sorted = (r as Resource[]).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        setResources(sorted)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Group by category
  const grouped = resources.reduce<Record<string, Resource[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = []
    acc[r.category].push(r)
    return acc
  }, {})

  if (loading) return (
    <div className="flex h-60 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#6B4FE8" }} />
    </div>
  )

  return (
    <motion.div className="space-y-5" variants={container} initial="hidden" animate="show">

      {resources.length === 0 ? (
        <motion.div variants={item} className="neu-raised-sm rounded-2xl p-12 text-center">
          <BookOpen className="mx-auto mb-3 h-12 w-12 opacity-30" style={{ color: "#6B4FE8" }} />
          <p className="font-medium" style={{ color: "#7B6FC0" }}>No resources yet</p>
          <p className="text-sm mt-1" style={{ color: "#9B8FC8" }}>Add learning resources via the Admin panel.</p>
        </motion.div>
      ) : (
        <motion.div variants={item}>
          <h2 className="mb-3 text-lg font-bold" style={{ color: "#1E1060" }}>Learning Resources</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(grouped).map(([category, items]) => {
              const color = categoryColors[category] || defaultColor
              return (
                <div key={category} className="neu-raised-sm rounded-2xl p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${color}12` }}>
                      <BookOpen className="h-5 w-5" style={{ color }} />
                    </div>
                    <h3 className="font-semibold text-sm" style={{ color: "#1E1060" }}>{category}</h3>
                  </div>
                  <div className="space-y-2">
                    {items.map((res) => (
                      <motion.a key={res.id} href={res.url} target="_blank" rel="noopener noreferrer"
                        className="group flex items-center justify-between rounded-xl px-3 py-2.5 neu-inset-sm"
                        whileHover={{ x: 3 }} transition={{ type: "spring" as const, stiffness: 300 }}>
                        <div className="flex items-center gap-2 min-w-0">
                          {res.featured && <Star className="h-3 w-3 flex-shrink-0" style={{ color: "#FFB800", fill: "#FFB800" }} />}
                          <span className="text-sm truncate" style={{ color: "#1E1060" }}>{res.name}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs" style={{ background: `${color}12`, color }}>
                            {typeIcon(res.type)} {res.type}
                          </span>
                          <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "#7B6FC0" }} />
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Quick Links */}
      <motion.div variants={item}
        className="rounded-2xl p-5"
        style={{ background: "linear-gradient(135deg, rgba(107,79,232,0.07), rgba(184,164,255,0.05))", border: "1px solid rgba(194,186,240,0.50)" }}>
        <h3 className="mb-3 font-semibold text-sm" style={{ color: "#1E1060" }}>Quick Links</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "AWS Documentation", url: "https://docs.aws.amazon.com" },
            { label: "AWS Blog",          url: "https://aws.amazon.com/blogs" },
            { label: "AWS Samples",       url: "https://github.com/aws-samples" },
            { label: "AWS Training",      url: "https://aws.amazon.com/training" },
            { label: "AWS Free Tier",     url: "https://aws.amazon.com/free" },
          ].map(({ label, url }) => (
            <motion.a key={label} href={url} target="_blank" rel="noopener noreferrer"
              className="neu-raised-sm inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium"
              style={{ color: "#1E1060" }} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
              {label}
              <ExternalLink className="h-3 w-3" style={{ color: "#9B8FC8" }} />
            </motion.a>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
