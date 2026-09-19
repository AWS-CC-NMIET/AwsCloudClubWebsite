// components/apps/calendar-app.tsx
// Authentic macOS Calendar view for AWS workshops, hackathons, and Meetups

"use client"

import React, { useState, useEffect } from "react"
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
} from "lucide-react"
import { api } from "@/lib/api-client"
import { sanitizeUrl } from "@/lib/utils"

interface ClubEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  type: "workshop" | "hackathon" | "meetup" | "cert"
  description: string
  speaker: string
  rsvpUrl?: string
}

const FALLBACK_EVENTS: ClubEvent[] = [
  {
    id: "evt-1",
    title: "AWS GenAI & Bedrock Hands-on Bootcamp",
    date: "Sep 28, 2026",
    time: "2:00 PM – 5:00 PM IST",
    location: "Campus Audi 2 & Live Stream",
    type: "workshop",
    description: "Build a production RAG application with AWS Bedrock, Claude 3.5, and OpenSearch Serverless. Cloud credits provided.",
    speaker: "Omkar Rane · AWS Community Builder",
    rsvpUrl: "https://meetup.com/aws-cloud-club-sbg",
  },
  {
    id: "evt-2",
    title: "Cloud Resume Challenge Sprint",
    date: "Oct 05, 2026",
    time: "4:00 PM – 6:30 PM IST",
    location: "Cloud Computing Lab 402",
    type: "workshop",
    description: "Hands-on walkthrough configuring S3 static hosting, Route 53, CloudFront edge caching, and GitHub Actions automation.",
    speaker: "DevOps & Cloud Leads",
    rsvpUrl: "https://meetup.com/aws-cloud-club-sbg",
  },
  {
    id: "evt-3",
    title: "AWS Cloud Practitioner (CLF-C02) Study Circle",
    date: "Oct 12, 2026",
    time: "6:00 PM – 7:30 PM IST",
    location: "Online (Google Meet)",
    type: "cert",
    description: "Review IAM security principles, Well-Architected Framework questions, and practice quiz simulation with cert mentors.",
    speaker: "Certified Student Mentors",
    rsvpUrl: "https://meetup.com/aws-cloud-club-sbg",
  },
  {
    id: "evt-4",
    title: "AWS Cloud Hackathon 2026",
    date: "Nov 02 – Nov 03, 2026",
    time: "36 Hours Non-Stop",
    location: "Main Innovation Center",
    type: "hackathon",
    description: "Annual campus cloud hackathon. $2,500 in AWS cloud credits, swags, and internship interview opportunities with partner firms.",
    speaker: "AWS Student Ambassadors & Jury",
    rsvpUrl: "https://meetup.com/aws-cloud-club-sbg",
  },
]

export function CalendarApp() {
  const [events, setEvents] = useState<ClubEvent[]>(FALLBACK_EVENTS)
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent>(FALLBACK_EVENTS[0])
  const [rsvpd, setRsvpd] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let active = true
    // Attempt to load from DynamoDB API
    api.events
      .list()
      .then(res => {
        if (!active) return
        if (res.events && res.events.length > 0) {
          setEvents(res.events as ClubEvent[])
          setSelectedEvent(res.events[0] as ClubEvent)
        }
      })
      .catch(() => {
        // Use fallback static events gracefully
      })
    return () => {
      active = false
    }
  }, [])

  const handleRsvp = (id: string) => {
    setRsvpd(prev => ({ ...prev, [id]: true }))
  }

  return (
    <div className="flex h-full w-full flex-col md:flex-row bg-(--win-bg) text-(--os-text)">
      {/* ── Left Events Agenda List ─────────────────────────────────────────── */}
      <aside className="w-full md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-(--win-divider) bg-black/[0.02] dark:bg-white/[0.02] p-4 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-(--win-divider)">
          <div>
            <h2 className="text-sm font-bold text-(--os-text)">Upcoming Schedule</h2>
            <p className="text-[11px] text-(--os-text-dim)">AWS Cloud Club SBG</p>
          </div>
          <span className="rounded-full bg-(--accent)/10 text-(--accent) px-2 py-0.5 text-xs font-mono font-medium">
            {events.length} Events
          </span>
        </div>

        <div className="space-y-2">
          {events.map(evt => {
            const isSelected = selectedEvent.id === evt.id
            const isRegistered = rsvpd[evt.id]

            return (
              <button
                key={evt.id}
                onClick={() => setSelectedEvent(evt)}
                className={`flex w-full flex-col rounded-xl p-3 text-left transition-all border ${
                  isSelected
                    ? "border-(--accent) bg-(--accent)/10 shadow-xs"
                    : "border-(--win-divider) bg-black/[0.01] hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-[10px] uppercase font-semibold text-(--accent)">
                    {evt.date}
                  </span>
                  {isRegistered && (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-500 font-medium">
                      <Check className="size-3" /> RSVP&apos;d
                    </span>
                  )}
                </div>

                <h3 className="text-xs font-bold text-(--os-text) mt-1 line-clamp-1">
                  {evt.title}
                </h3>

                <div className="mt-2 flex items-center gap-3 text-[10px] text-(--os-text-dim)">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" /> {evt.time.split("–")[0]}
                  </span>
                  <span className="truncate">{evt.type}</span>
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      {/* ── Right Event Detailed View ────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6">
        {selectedEvent && (
          <div className="max-w-2xl space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-(--accent)/10 border border-(--accent)/20 text-(--accent) px-2.5 py-0.5 text-[11px] font-mono uppercase">
                  {selectedEvent.type}
                </span>
                <span className="text-xs text-(--os-text-dim) font-mono">
                  {selectedEvent.date}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-(--os-text) leading-snug">
                {selectedEvent.title}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-(--os-text-dim)">
                  <Clock className="size-4 text-(--accent)" />
                  <span>{selectedEvent.time}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-(--os-text-dim)">
                  <MapPin className="size-4 text-(--accent)" />
                  <span>{selectedEvent.location}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-(--os-text-dim) sm:col-span-2">
                  <Users className="size-4 text-(--accent)" />
                  <span>Speaker: {selectedEvent.speaker}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-(--win-divider) pt-4 space-y-2">
              <h3 className="text-xs font-semibold text-(--os-text-dim) uppercase tracking-wider">
                Session Agenda & Details
              </h3>
              <p className="text-sm leading-relaxed text-(--os-text)">
                {selectedEvent.description}
              </p>
            </div>

            {/* RSVP Button */}
            <div className="pt-4 flex flex-wrap gap-3">
              {rsvpd[selectedEvent.id] ? (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm">
                  <Check className="size-4" />
                  <span>You are Registered for this Event!</span>
                </div>
              ) : (
                <button
                  onClick={() => handleRsvp(selectedEvent.id)}
                  className="flex items-center gap-2 rounded-lg bg-(--accent) px-5 py-2.5 text-xs font-semibold text-white hover:opacity-90 shadow-md transition-opacity"
                >
                  <Sparkles className="size-4" />
                  <span>RSVP for Workshop</span>
                </button>
              )}

              {selectedEvent.rsvpUrl && (
                <a
                  href={sanitizeUrl(selectedEvent.rsvpUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-(--win-divider) bg-black/5 dark:bg-white/10 px-4 py-2.5 text-xs font-semibold text-(--os-text) hover:bg-black/10 dark:hover:bg-white/15 transition-colors"
                >
                  <span>Meetup Event Link</span>
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
