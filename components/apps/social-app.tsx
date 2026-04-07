"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Github, Linkedin, Instagram, Twitter, Youtube, MessageCircle, Share2, Loader2, ExternalLink } from "lucide-react"
import { api } from "@/lib/api-client"

interface SocialLink {
  id: string
  name: string
  url: string
  followers?: string
  platform: string
  color: string
}

const platformIcons: Record<string, React.ElementType> = {
  LinkedIn:  Linkedin,
  GitHub:    Github,
  Instagram: Instagram,
  Twitter:   Twitter,
  YouTube:   Youtube,
  Discord:   MessageCircle,
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, scale: 0.92 }, show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 280, damping: 22 } } }

export function SocialApp() {
  const [links, setLinks]   = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.social.list()
      .then(({ links: l }) => setLinks(l as SocialLink[]))
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
      <motion.div variants={item} className="text-center">
        <h2 className="text-xl font-bold" style={{ color: "#1E1060" }}>Connect With Us</h2>
        <p className="text-sm mt-1" style={{ color: "#7B6FC0" }}>Follow us on social media for the latest updates</p>
      </motion.div>

      {links.length === 0 ? (
        <motion.div variants={item} className="neu-raised-sm rounded-2xl p-12 text-center">
          <Share2 className="mx-auto mb-3 h-12 w-12 opacity-30" style={{ color: "#6B4FE8" }} />
          <p className="font-medium" style={{ color: "#7B6FC0" }}>No social links yet</p>
          <p className="text-sm mt-1" style={{ color: "#9B8FC8" }}>Add social links via the Admin panel.</p>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((s) => {
            const Icon = platformIcons[s.platform] || platformIcons[s.name] || ExternalLink
            return (
              <motion.a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                variants={item}
                className="neu-raised-sm group block rounded-2xl p-5"
                whileHover={{ y: -5, boxShadow: "8px 8px 22px #C2BAF0, -8px -8px 22px #FFFFFF" }}
                transition={{ type: "spring" as const, stiffness: 300 }}>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                    style={{ background: s.color, boxShadow: `4px 4px 14px ${s.color}50` }}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: "#1E1060" }}>{s.name}</h3>
                    {s.followers && (
                      <p className="text-xs" style={{ color: "#7B6FC0" }}>{s.followers} followers</p>
                    )}
                  </div>
                </div>
                <span className="text-xs font-semibold" style={{ color: "#6B4FE8" }}>Follow →</span>
              </motion.a>
            )
          })}
        </div>
      )}

      {/* Newsletter */}
      <motion.div variants={item}
        className="rounded-2xl p-6 text-center"
        style={{ background: "linear-gradient(135deg, rgba(107,79,232,0.08), rgba(184,164,255,0.06))", border: "1px solid rgba(194,186,240,0.50)" }}>
        <h3 className="mb-1 text-lg font-bold" style={{ color: "#1E1060" }}>Stay Updated</h3>
        <p className="mb-5 text-sm" style={{ color: "#7B6FC0" }}>
          Subscribe to our newsletter for the latest cloud computing news
        </p>
        <div className="mx-auto flex max-w-md gap-3">
          <input type="email" placeholder="Enter your email"
            className="neu-input flex-1 rounded-xl px-4 py-2.5 text-sm" />
          <motion.button className="neu-btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold"
            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            Subscribe
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
