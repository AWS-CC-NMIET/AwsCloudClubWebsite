// components/apps/social-app.tsx
// Social — Meetup community card plus the group's social channels

"use client"

import React from "react"
import { motion } from "framer-motion"
import {
  ExternalLink,
  Github,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Twitter,
  Users,
  Youtube,
  type LucideIcon,
} from "lucide-react"
import { CLUB, type SocialLink } from "@/lib/club-content"
import { useMemberCount, useSocialLinks } from "@/lib/club-data"
import { sanitizeUrl } from "@/lib/utils"
import { AppShell, MacButton } from "./shared/mac-ui"
import { Stagger, staggerChild } from "./shared/motion"

function MeetupIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.98 17.13c-.86 0-1.6-.3-2.2-.9-.6-.6-.9-1.33-.9-2.2l.02-.24 1.27-6.68c.1-.53.36-.97.78-1.31.42-.34.9-.51 1.45-.51.47 0 .9.14 1.28.42.38.28.65.65.8 1.1l1.6 4.86 1.6-4.86c.15-.45.42-.82.8-1.1.38-.28.81-.42 1.28-.42.55 0 1.03.17 1.45.51.42.34.68.78.78 1.31l1.27 6.68.02.24c0 .87-.3 1.6-.9 2.2-.6.6-1.34.9-2.2.9-.79 0-1.47-.26-2.04-.78-.57-.52-.9-1.17-.98-1.94l-.11-1.23-1.13 3.4c-.13.38-.35.68-.67.9-.32.22-.67.33-1.06.33s-.74-.11-1.06-.33c-.32-.22-.54-.52-.67-.9l-1.13-3.4-.11 1.23c-.08.77-.41 1.42-.98 1.94-.57.52-1.25.78-2.04.78z" />
    </svg>
  )
}

const PLATFORM_ICONS: Record<string, LucideIcon> = {
  linkedin: Linkedin,
  github: Github,
  instagram: Instagram,
  twitter: Twitter,
  x: Twitter,
  youtube: Youtube,
  discord: MessageCircle,
  community: Users,
}

function iconFor(link: SocialLink): LucideIcon {
  const key = `${link.platform}`.toLowerCase()
  return PLATFORM_ICONS[key] ?? PLATFORM_ICONS[link.name.toLowerCase()] ?? ExternalLink
}

export function SocialApp() {
  const { memberCount, display } = useMemberCount()
  const links = useSocialLinks()

  return (
    <AppShell className="flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl space-y-5 p-5 @2xl:p-8">
        <div className="text-center">
          <h1 className="text-xl font-bold text-(--os-text)">Connect With Us</h1>
          <p className="mt-1 text-xs text-(--os-text-dim)">Follow us for the latest workshops, events and updates</p>
        </div>

        {/* ── Meetup — our primary community hub ─────────────────────────── */}
        <motion.a
          href={CLUB.meetupUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          className="glass-card rim interactive block p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#ED1C40]/10 text-[#ED1C40]">
                <MeetupIcon className="size-7" />
              </div>
              <div>
                <h2 className="text-base font-bold text-(--os-text)">Meetup Community</h2>
                <p className="text-xs text-(--os-text-dim)">
                  {memberCount !== null ? `${memberCount} members` : `${display} members`} · Official group
                </p>
              </div>
            </div>
            <span className="rounded-lg bg-[#ED1C40] px-3 py-1.5 text-xs font-semibold text-white shadow-sm">Join Free →</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-(--os-text-dim)">
            RSVP to events, get notified about workshops, and connect with {display} cloud enthusiasts at NMIET. Our primary community hub.
          </p>
        </motion.a>

        {/* ── Other channels ─────────────────────────────────────────────── */}
        {links.data.length > 0 && (
          <Stagger className="grid gap-3 @lg:grid-cols-2 @3xl:grid-cols-3">
            {links.data.map(link => {
              const Icon = iconFor(link)
              return (
                <motion.a
                  key={link.id}
                  href={sanitizeUrl(link.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={staggerChild}
                  whileHover={{ y: -3 }}
                  className="glass-card rim interactive group block p-4"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className="flex size-10 items-center justify-center rounded-xl text-white shadow-sm"
                      style={{ background: link.color || "#7940ea" }}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-(--os-text)">{link.name}</h3>
                      {(link.handle || link.followers) && (
                        <p className="truncate text-xs text-(--os-text-dim)">
                          {[link.handle, link.followers && `${link.followers} followers`].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-(--accent)">Follow →</span>
                </motion.a>
              )
            })}
          </Stagger>
        )}

        {/* ── Email ──────────────────────────────────────────────────────── */}
        <div className="glass-card rim bg-gradient-to-br from-(--accent)/12 to-transparent p-6 text-center">
          <h3 className="mb-1 text-base font-bold text-(--os-text)">Drop Us an Email</h3>
          <p className="mb-4 text-xs text-(--os-text-dim)">Have questions or want to collaborate? Reach out directly.</p>
          <MacButton variant="primary" href={`mailto:${CLUB.email}`} className="max-w-full break-all">
            <Mail className="size-3.5 shrink-0" /> {CLUB.email}
          </MacButton>
        </div>
      </div>
    </AppShell>
  )
}
