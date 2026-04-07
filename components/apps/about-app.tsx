"use client"

import { motion } from "framer-motion"
import { Target, Eye, Heart, Award } from "lucide-react"

const container = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } } }

export function AboutApp() {
  return (
    <motion.div className="space-y-5" variants={container} initial="hidden" animate="show">
      {/* Mission */}
      <motion.div variants={item} className="neu-raised rounded-2xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(107,79,232,0.10)" }}>
            <Target className="h-5 w-5" style={{ color: "#6B4FE8" }} />
          </div>
          <h2 className="text-lg font-bold" style={{ color: "#1E1060" }}>Our Mission</h2>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "#7B6FC0" }}>
          To democratize cloud computing education and empower students with the skills needed to build
          scalable, innovative solutions using AWS technologies. We believe in learning by doing, fostering
          a community where knowledge sharing and collaboration drive growth.
        </p>
      </motion.div>

      {/* Vision */}
      <motion.div variants={item} className="neu-raised rounded-2xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(184,164,255,0.12)" }}>
            <Eye className="h-5 w-5" style={{ color: "#B8A4FF" }} />
          </div>
          <h2 className="text-lg font-bold" style={{ color: "#1E1060" }}>Our Vision</h2>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "#7B6FC0" }}>
          To become the leading student-driven cloud computing community, producing industry-ready
          professionals who can leverage AWS to solve real-world problems and contribute to
          technological advancement.
        </p>
      </motion.div>

      {/* What We Do */}
      <motion.div variants={item} className="neu-raised rounded-2xl p-6">
        <h2 className="mb-4 text-lg font-bold" style={{ color: "#1E1060" }}>What We Do</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { title: "Workshops & Training", desc: "Hands-on sessions covering AWS services, cloud architecture, and best practices", icon: Award, color: "#6B4FE8" },
            { title: "Hackathons", desc: "Competitive events to build innovative cloud-powered solutions", icon: Target, color: "#FF9900" },
            { title: "Study Groups", desc: "Collaborative learning environments for AWS certifications", icon: Heart, color: "#E85580" },
            { title: "Industry Connect", desc: "Networking opportunities with AWS professionals and cloud experts", icon: Eye, color: "#5BA8D8" },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              className="neu-inset-sm rounded-xl p-4"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring" as const, stiffness: 300 }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl mb-3" style={{ background: `${card.color}12` }}>
                <card.icon className="h-5 w-5" style={{ color: card.color }} />
              </div>
              <h3 className="mb-1 text-sm font-semibold" style={{ color: "#1E1060" }}>{card.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#7B6FC0" }}>{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Values */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-3">
        {[
          { value: "Innovation", desc: "Pushing boundaries with creative cloud solutions", color: "#6B4FE8" },
          { value: "Community",  desc: "Growing together through collaboration",          color: "#50C88A" },
          { value: "Excellence", desc: "Striving for the highest standards",              color: "#FF9900" },
        ].map((v) => (
          <motion.div
            key={v.value}
            className="neu-raised-sm rounded-2xl p-5 text-center"
            whileHover={{ y: -4 }}
            transition={{ type: "spring" as const, stiffness: 300 }}
          >
            <div className="mx-auto mb-2 h-1.5 w-12 rounded-full" style={{ background: v.color }} />
            <h3 className="mb-1 text-base font-bold" style={{ color: v.color }}>{v.value}</h3>
            <p className="text-sm" style={{ color: "#7B6FC0" }}>{v.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
