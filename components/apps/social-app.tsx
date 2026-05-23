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
      .then(({ links: l }) => {
        // Map/override dynamically fetched links to correct YouTube and Discord links
        const updatedLinks = (l as SocialLink[]).map(link => {
          const platform = link.platform.toLowerCase()
          const name = link.name.toLowerCase()
          if (platform === "youtube" || name === "youtube") {
            return { ...link, url: "https://www.youtube.com/@AWSStudentBuildersGroupNMIET" }
          }
          if (platform === "discord" || name === "discord") {
            return { ...link, url: "https://discord.gg/BydTcjm8g" }
          }
          return link
        })
        setLinks(updatedLinks)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex h-60 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    </div>
  )

  if (error) return (
    <div className="flex h-60 flex-col items-center justify-center gap-3">
      <Share2 className="h-10 w-10 opacity-20 text-indigo-600" />
      <p className="text-sm text-indigo-950/60">Could not load social links. Please try again later.</p>
    </div>
  )

  return (
    <motion.div className="space-y-5 p-1" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="text-center">
        <h2 className="text-xl font-bold text-indigo-950">Connect With Us</h2>
        <p className="text-xs md:text-sm mt-1 text-indigo-950/65">Follow us on social media for the latest updates</p>
      </motion.div>

      {/* ── Meetup card redesigned to Finder-style glass layout ── */}
      <motion.a
        variants={item}
        href={MEETUP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl border border-white/40 bg-white/35 backdrop-blur-sm p-5 shadow-xs transition-all hover:bg-white/45"
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring" as const, stiffness: 300 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <MeetupIcon className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-bold text-indigo-950 text-base">Meetup Community</h3>
              <p className="text-xs text-indigo-950/70">
                {memberCount !== null ? `${memberCount} members` : "Loading…"} · Official group
              </p>
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-2xs transition-colors">
              Join Free →
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs md:text-sm leading-relaxed text-indigo-950/75">
          RSVP to events, get notified about workshops, and connect with {memberCount ?? 299}+ cloud enthusiasts
          at NMIET. Our primary community hub.
        </p>
      </motion.a>

      {/* ── DB-fetched additional social links redesigned ── */}
      {links.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((s) => {
            const Icon = platformIcons[s.platform] || platformIcons[s.name] || ExternalLink
            return (
              <motion.a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                variants={item}
                className="group block rounded-xl border border-white/30 bg-white/20 p-5 transition-all hover:bg-white/30 shadow-2xs"
                whileHover={{ y: -3 }}
                transition={{ type: "spring" as const, stiffness: 300 }}>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-2xs"
                    style={{ background: s.color }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-indigo-950">{s.name}</h3>
                    {s.followers && (
                      <p className="text-xs text-indigo-950/60">{s.followers} followers</p>
                    )}
                  </div>
                </div>
                <span className="text-xs font-semibold text-indigo-900/80 hover:text-indigo-950 transition-colors">Follow →</span>
              </motion.a>
            )
          })}
        </div>
      )}

      {links.length === 0 && (
        <motion.div variants={item} className="rounded-xl border border-white/30 bg-white/20 p-6 text-center shadow-2xs">
          <Share2 className="mx-auto mb-2 h-8 w-8 opacity-25 text-indigo-950" />
          <p className="text-sm text-indigo-950/60">More social links coming soon — add via Admin panel.</p>
        </motion.div>
      )}

      {/* Email CTA */}
      <motion.div variants={item}
        className="rounded-xl p-6 text-center border border-white/40 bg-white/35 backdrop-blur-sm shadow-xs">
        <h3 className="mb-1 text-base font-bold text-indigo-950">Drop Us an Email</h3>
        <p className="mb-3 text-xs md:text-sm text-indigo-950/70">
          Have questions or want to collaborate? Reach out directly.
        </p>
        <motion.a
          href="mailto:aws.studentbuildersgroup.nmiet@gmail.com"
          className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-750 transition-colors shadow-2xs"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          aws.studentbuildersgroup.nmiet@gmail.com
        </motion.a>
      </motion.div>
    </motion.div>
  )
}
