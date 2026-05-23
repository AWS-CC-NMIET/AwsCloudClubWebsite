"use client"

import { motion } from "framer-motion"
import { Target, Eye, Heart, Award, Globe, Calendar } from "lucide-react"
import { useMeetup } from "@/lib/meetup-context"

const container = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } } }

export function AboutApp() {
  const { memberCount } = useMeetup()
  return (
    <motion.div className="space-y-5" variants={container} initial="hidden" animate="show">

      {/* Identity card */}
      <motion.div variants={item} className="neu-raised rounded-2xl p-6">
        <div className="flex flex-wrap gap-6 items-start">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold mb-1" style={{ color: "#1E1060" }}>
              AWS Student Builder Group at NMIET
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "#7B6FC0" }}>
              We teach students about the AWS Cloud and its various use cases — including security,
              AI, business analytics, and business transformation. Our hands-on approach bridges
              the gap between academic learning and real-world cloud careers.
            </p>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <div className="neu-inset-sm flex items-center gap-2 rounded-xl px-3 py-2">
              <Calendar className="h-4 w-4 flex-shrink-0" style={{ color: "#6B4FE8" }} />
              <span className="text-xs font-medium" style={{ color: "#1E1060" }}>Founded Feb 16, 2026</span>
            </div>
            <div className="neu-inset-sm flex items-center gap-2 rounded-xl px-3 py-2">
              <Globe className="h-4 w-4 flex-shrink-0" style={{ color: "#FF9900" }} />
              <span className="text-xs font-medium" style={{ color: "#1E1060" }}>AWS Student Builder Groups globally</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mission */}
      <motion.div variants={item} className="neu-raised rounded-2xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(107,79,232,0.10)" }}>
            <Target className="h-5 w-5" style={{ color: "#6B4FE8" }} />
          </div>
          <h2 className="text-lg font-bold" style={{ color: "#1E1060" }}>Our Mission</h2>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "#7B6FC0" }}>
          To democratize cloud computing education at NMIET — empowering every student with
          the practical AWS skills needed to build scalable, innovative solutions. We learn by
          doing: every session involves real AWS accounts, real deployments, real impact.
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
          To become the most active student-driven cloud community in Maharashtra — producing
          AWS-certified, industry-ready professionals who use cloud technology to solve
          real-world problems and contribute to India's digital transformation.
        </p>
      </motion.div>

      {/* What We Do */}
      <motion.div variants={item} className="neu-raised rounded-2xl p-6">
        <h2 className="mb-4 text-lg font-bold" style={{ color: "#1E1060" }}>What We Do</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { title: "Workshops & Training",  desc: "Hands-on AWS sessions — EC2, Lambda, S3, DynamoDB, IAM, and more. Real accounts, real infrastructure.", icon: Award,  color: "#6B4FE8" },
            { title: "Community Events",      desc: "Introductory sessions, networking meetups, guest lectures from AWS professionals and cloud experts.", icon: Target, color: "#FF9900" },
            { title: "Certification Prep",    desc: "Collaborative study groups for AWS Cloud Practitioner, Solutions Architect, and Developer exams.", icon: Heart,  color: "#E85580" },
            { title: "Cloud Projects",        desc: "Building and deploying real AWS-powered projects that solve actual problems for students and the campus.", icon: Eye,    color: "#5BA8D8" },
          ].map((card) => (
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
          { value: "Innovation", desc: "Pushing boundaries with creative cloud solutions on real AWS infrastructure", color: "#6B4FE8" },
          { value: "Community",  desc: `Open to all — ${memberCount ?? 299} members and growing across Pune, Maharashtra`, color: "#50C88A" },
          { value: "Excellence", desc: "Official AWS Student Builder Group, held to AWS global standards",             color: "#FF9900" },
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
