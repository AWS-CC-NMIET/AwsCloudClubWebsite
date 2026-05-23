"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Github, Linkedin, Instagram, Twitter, Youtube, MessageCircle, Share2, Loader2, ExternalLink, Users } from "lucide-react"
import { api } from "@/lib/api-client"
import { useMeetup } from "@/lib/meetup-context"

const MEETUP_URL = "https://www.meetup.com/aws-cloud-club-at-nutan-maharashtra-inst-of-eng-tech/"

interface SocialLink {
  id: string
  name: string
  url: string
  followers?: string
  platform: string
  color: string
}

// Custom Meetup "M" icon as a simple SVG component
function MeetupIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.24 14.53c-.14.28-.31.54-.52.77-.18.2-.39.37-.61.52-.04.34-.17.66-.38.94-.22.28-.5.5-.82.64-.13.34-.34.65-.62.89-.28.24-.62.4-.97.46-.16.3-.39.56-.67.75-.28.19-.6.3-.94.32-.18.28-.44.51-.74.66-.3.15-.63.21-.96.19-.23.24-.52.42-.84.5-.32.09-.65.09-.97.01-.29.18-.62.28-.96.27-.34 0-.67-.1-.96-.29-.27.08-.55.1-.83.06-.27-.04-.53-.14-.76-.29-.35.05-.7-.01-1.01-.17-.31-.16-.57-.41-.74-.72-.35-.04-.68-.17-.96-.38-.28-.21-.5-.49-.64-.81-.32-.08-.62-.24-.86-.47-.24-.23-.41-.52-.5-.83-.26-.12-.5-.3-.68-.53-.18-.23-.3-.5-.34-.79-.21-.16-.38-.37-.5-.6-.11-.23-.17-.49-.17-.75-.16-.22-.26-.47-.3-.73-.04-.26-.02-.53.05-.79-.07-.29-.08-.59-.03-.88.05-.29.17-.57.34-.81.02-.3.11-.59.26-.84.15-.25.37-.46.62-.61.08-.3.23-.57.44-.79.22-.22.49-.39.78-.49.12-.3.31-.57.55-.78.24-.21.53-.36.84-.43.16-.28.39-.52.66-.69.27-.17.58-.27.9-.28.2-.25.46-.45.75-.57.29-.12.61-.16.92-.12.25-.21.54-.35.85-.42.31-.06.64-.04.94.07.28-.14.6-.21.91-.19.31.01.62.11.88.27.3-.08.62-.1.93-.04.31.06.59.19.83.38.33-.01.65.06.94.2.29.15.53.37.69.65.3.05.58.17.82.35.24.18.42.42.53.7.25.11.48.28.65.49.17.22.28.47.3.74.2.16.36.36.46.58.1.23.14.47.12.72.14.25.22.52.22.8s-.08.55-.22.8z" />
    </svg>
  )
}

const platformIcons: Record<string, React.ElementType> = {
  LinkedIn:  Linkedin,
  GitHub:    Github,
  Instagram: Instagram,
  Twitter:   Twitter,
  YouTube:   Youtube,
  Discord:   MessageCircle,
  Meetup:    MeetupIcon,
  Community: Users,
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, scale: 0.92 }, show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 280, damping: 22 } } }

export function SocialApp() {
  const { memberCount } = useMeetup()
  const [links, setLinks]     = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  useEffect(() => {
    api.social.list()
      .then(({ links: l }) => setLinks(l as SocialLink[]))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex h-60 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#6B4FE8" }} />
    </div>
  )

  if (error) return (
    <div className="flex h-60 flex-col items-center justify-center gap-3">
      <Share2 className="h-10 w-10 opacity-20" style={{ color: "#6B4FE8" }} />
      <p className="text-sm" style={{ color: "#9B8FC8" }}>Could not load social links. Please try again later.</p>
    </div>
  )

  return (
    <motion.div className="space-y-5" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="text-center">
        <h2 className="text-xl font-bold" style={{ color: "#1E1060" }}>Connect With Us</h2>
        <p className="text-sm mt-1" style={{ color: "#7B6FC0" }}>Follow us on social media for the latest updates</p>
      </motion.div>

      {/* ── Always-visible Meetup card (primary community hub) ── */}
      <motion.a
        variants={item}
        href={MEETUP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-2xl p-5"
        style={{
          background: "linear-gradient(135deg, #E83030 0%, #FF5555 100%)",
          boxShadow: "6px 6px 18px rgba(232,48,48,0.32)",
        }}
        whileHover={{ y: -4, boxShadow: "8px 8px 24px rgba(232,48,48,0.42)" }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring" as const, stiffness: 300 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "rgba(255,255,255,0.20)" }}>
              <MeetupIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Meetup Community</h3>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.80)" }}>
                {memberCount !== null ? `${memberCount} members` : "Loading…"} · Official group
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.20)", color: "white" }}>
              Join Free →
            </span>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
          RSVP to events, get notified about workshops, and connect with {memberCount ?? 299}+ cloud enthusiasts
          at NMIET. Our primary community hub.
        </p>
      </motion.a>

      {/* ── DB-fetched additional social links ── */}
      {links.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((s) => {
            const Icon = platformIcons[s.platform] || platformIcons[s.name] || ExternalLink
            return (
              <motion.a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                variants={item}
                className="neu-raised-sm group block rounded-2xl p-5"
                whileHover={{ y: -5, boxShadow: "8px 8px 22px rgba(107,79,232,0.26), -6px -6px 16px rgba(255,255,255,0.72)" }}
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

      {links.length === 0 && (
        <motion.div variants={item} className="neu-raised-sm rounded-2xl p-6 text-center">
          <Share2 className="mx-auto mb-2 h-8 w-8 opacity-25" style={{ color: "#6B4FE8" }} />
          <p className="text-sm" style={{ color: "#9B8FC8" }}>More social links coming soon — add via Admin panel.</p>
        </motion.div>
      )}

      {/* Email CTA */}
      <motion.div variants={item}
        className="rounded-2xl p-6 text-center"
        style={{ background: "linear-gradient(135deg, rgba(107,79,232,0.08), rgba(184,164,255,0.06))", border: "1px solid rgba(107,79,232,0.22)" }}>
        <h3 className="mb-1 text-lg font-bold" style={{ color: "#1E1060" }}>Drop Us an Email</h3>
        <p className="mb-3 text-sm" style={{ color: "#7B6FC0" }}>
          Have questions or want to collaborate? Reach out directly.
        </p>
        <motion.a
          href="mailto:awscloudclub.nmiet@gmail.com"
          className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg,#6B4FE8,#8B6FFF)", boxShadow: "4px 4px 14px rgba(107,79,232,0.30)" }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          awscloudclub.nmiet@gmail.com
        </motion.a>
      </motion.div>
    </motion.div>
  )
}
