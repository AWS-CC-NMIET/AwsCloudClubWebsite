"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Github, Linkedin, Mail, Server, Users, Loader2 } from "lucide-react"
import { api } from "@/lib/api-client"

interface TeamMember {
  id: string
  name: string
  role: string
  skills: string[]
  bio?: string
  email?: string
  linkedin?: string
  github?: string
  photoUrl?: string
  status: "running" | "stopped"
  order: number
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } } }

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export function TeamApp() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.team.list()
      .then(({ members: m }) => {
        const sorted = (m as TeamMember[]).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        setMembers(sorted)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const running = members.filter((m) => m.status === "running").length

  if (loading) return (
    <div className="flex h-60 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#6B4FE8" }} />
    </div>
  )

  return (
    <motion.div className="space-y-5" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="neu-raised rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold" style={{ color: "#1E1060" }}>Cloud Instances</h2>
            <p className="text-sm" style={{ color: "#7B6FC0" }}>Our team members powering the cloud</p>
          </div>
          <div className="neu-inset-sm flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span style={{ color: "#7B6FC0" }}>{running} Running</span>
          </div>
        </div>
      </motion.div>

      {members.length === 0 ? (
        <motion.div variants={item} className="neu-raised-sm rounded-2xl p-12 text-center">
          <Users className="mx-auto mb-3 h-12 w-12 opacity-30" style={{ color: "#6B4FE8" }} />
          <p className="font-medium" style={{ color: "#7B6FC0" }}>No team members yet</p>
          <p className="text-sm mt-1" style={{ color: "#9B8FC8" }}>Add team members via the Admin panel.</p>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              variants={item}
              className="neu-raised-sm rounded-2xl p-5"
              whileHover={{ y: -5, boxShadow: "8px 8px 22px #C2BAF0, -8px -8px 22px #FFFFFF" }}
              transition={{ type: "spring" as const, stiffness: 300 }}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {member.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.photoUrl} alt={member.name}
                      className="h-12 w-12 rounded-2xl object-cover"
                      style={{ boxShadow: "4px 4px 12px rgba(107,79,232,0.30)" }} />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold text-white"
                      style={{ background: "linear-gradient(135deg,#6B4FE8,#B8A4FF)", boxShadow: "4px 4px 12px rgba(107,79,232,0.30)" }}>
                      {initials(member.name)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-sm" style={{ color: "#1E1060" }}>{member.name}</h3>
                    <p className="text-xs font-medium" style={{ color: "#6B4FE8" }}>{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{
                    background: member.status === "running" ? "rgba(80,200,138,0.12)" : "rgba(255,153,0,0.12)",
                    color: member.status === "running" ? "#3AAA72" : "#E88800",
                  }}>
                  <span className="h-1.5 w-1.5 rounded-full"
                    style={{ background: member.status === "running" ? "#50C88A" : "#FF9900" }} />
                  {member.status}
                </div>
              </div>

              <div className="neu-inset-sm mb-3 flex items-center gap-2 rounded-xl px-3 py-1.5">
                <Server className="h-3.5 w-3.5" style={{ color: "#9B8FC8" }} />
                <code className="text-xs" style={{ color: "#9B8FC8" }}>i-{member.id.slice(0, 8)}</code>
              </div>

              {member.skills?.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {member.skills.map((skill) => (
                    <span key={skill} className="neu-tag rounded-lg px-2 py-0.5 text-xs font-medium" style={{ color: "#6B4FE8" }}>
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2 border-t pt-3" style={{ borderColor: "#D0C8F0" }}>
                {member.github && (
                  <motion.a href={member.github} target="_blank" rel="noopener noreferrer"
                    className="neu-btn flex h-8 w-8 items-center justify-center rounded-xl"
                    whileHover={{ scale: 1.12, y: -2 }} whileTap={{ scale: 0.92 }}>
                    <Github className="h-4 w-4" style={{ color: "#7B6FC0" }} />
                  </motion.a>
                )}
                {member.linkedin && (
                  <motion.a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                    className="neu-btn flex h-8 w-8 items-center justify-center rounded-xl"
                    whileHover={{ scale: 1.12, y: -2 }} whileTap={{ scale: 0.92 }}>
                    <Linkedin className="h-4 w-4" style={{ color: "#7B6FC0" }} />
                  </motion.a>
                )}
                {member.email && (
                  <motion.a href={`mailto:${member.email}`}
                    className="neu-btn flex h-8 w-8 items-center justify-center rounded-xl"
                    whileHover={{ scale: 1.12, y: -2 }} whileTap={{ scale: 0.92 }}>
                    <Mail className="h-4 w-4" style={{ color: "#7B6FC0" }} />
                  </motion.a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
