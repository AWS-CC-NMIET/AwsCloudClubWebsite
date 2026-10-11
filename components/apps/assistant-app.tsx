// components/apps/assistant-app.tsx
// Assistant — a simple guide that answers common questions with real club data
// and points visitors to the right app. (Keyword-based; no AI model involved.)

"use client"

import React, { useEffect, useRef, useState } from "react"
import { ArrowRight, Send } from "lucide-react"
import { AnimatedOrb } from "@/components/os/app-icon"
import { windowActions } from "@/lib/aws-store"
import type { AppId } from "@/lib/aws-apps"
import { CLUB, TEAM_MEMBERS } from "@/lib/club-content"
import { useEvents, useMemberCount, type ClubEvent } from "@/lib/club-data"

interface ChatMsg {
  sender: "user" | "bot"
  text: string
  action?: { app?: AppId; href?: string; label: string }
}

const CHIPS = ["Next event?", "Who's on the team?", "How do I join?", "Where can I learn AWS?", "Show projects"]

function answer(q: string, ctx: { members: string; nextEvent?: ClubEvent }): ChatMsg {
  const t = q.toLowerCase()
  const has = (...words: string[]) => words.some(w => t.includes(w))

  if (has("event", "workshop", "meetup", "session", "rsvp", "next")) {
    return ctx.nextEvent
      ? {
          sender: "bot",
          text: `Our next event is “${ctx.nextEvent.title}” on ${ctx.nextEvent.date} at ${ctx.nextEvent.location}. RSVP on Meetup to save your spot!`,
          action: { app: "calendar", label: "Open Events" },
        }
      : {
          sender: "bot",
          text: "No upcoming event is announced yet — new sessions land on our Meetup page first. You can browse past events in the Events app.",
          action: { app: "calendar", label: "Open Events" },
        }
  }
  if (has("team", "lead", "who", "people", "neha")) {
    return {
      sender: "bot",
      text: `The group is led by ${CLUB.leader} (SBG Leader), with a core team of ${TEAM_MEMBERS.length} across tech, design, social media, events and onsite.`,
      action: { app: "team", label: "Meet the Team" },
    }
  }
  if (has("join", "member", "apply", "sign up", "register")) {
    return {
      sender: "bot",
      text: `Joining is free and open to everyone — ${ctx.members} members already have. Join our Meetup group, then come to the next event!`,
      action: { href: CLUB.meetupUrl, label: "Join on Meetup" },
    }
  }
  if (has("learn", "resource", "course", "cert", "exam", "study", "practitioner", "architect")) {
    return {
      sender: "bot",
      text: "Start with AWS Skill Builder and Cloud Practitioner Essentials — we've collected courses, docs, labs and videos in Resources, and study guides in Notes.",
      action: { app: "safari", label: "Open Resources" },
    }
  }
  if (has("project", "build", "repo", "github", "code")) {
    return { sender: "bot", text: "Projects built by our members live in Finder.", action: { app: "finder", label: "Browse Projects" } }
  }
  if (has("photo", "gallery", "picture")) {
    return { sender: "bot", text: "Event photos are in the Photos app.", action: { app: "photos", label: "Open Gallery" } }
  }
  if (has("achievement", "award", "win", "trophy")) {
    return { sender: "bot", text: "Our milestones are on display in the Trophy Room.", action: { app: "achievements", label: "Open Achievements" } }
  }
  if (has("contact", "email", "mail", "reach", "message")) {
    return { sender: "bot", text: `You can email us at ${CLUB.email} or send a message right here.`, action: { app: "mail", label: "Contact Us" } }
  }
  if (has("about", "mission", "vision", "what", "nmiet", "where", "location")) {
    return {
      sender: "bot",
      text: `We're the ${CLUB.name} at ${CLUB.college}, ${CLUB.city} — founded ${CLUB.founded}. We learn, build and connect on AWS.`,
      action: { app: "about", label: "Read About Us" },
    }
  }
  if (has("discord", "youtube", "instagram", "linkedin", "social", "follow")) {
    return {
      sender: "bot",
      text: "We're on Instagram (@aws.sbg_nmiet), LinkedIn and YouTube — and events are on Meetup. All links are in the Social app.",
      action: { app: "social", label: "Open Social" },
    }
  }
  return {
    sender: "bot",
    text: "I can help you find events, the team, projects, learning resources, photos or how to contact us. Try one of the suggestions below!",
  }
}

export function AssistantApp() {
  const { display: members } = useMemberCount()
  const events = useEvents()
  const nextEvent = events.data.find(e => !e.isPast)
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      sender: "bot",
      text: `Hi! I'm the ${CLUB.shortName} assistant. Ask me about events, the team, projects, learning resources or how to join.`,
    },
  ])
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages])

  const send = (text?: string) => {
    const q = (text ?? input).trim()
    if (!q) return
    setMessages(prev => [...prev, { sender: "user", text: q }])
    setInput("")
    setTimeout(() => setMessages(prev => [...prev, answer(q, { members, nextEvent })]), 350)
  }

  return (
    <div className="flex h-full w-full flex-col text-(--os-text)">
      <div className="flex items-center gap-3 border-b border-(--win-divider) p-4">
        <div className="size-8 shrink-0">
          <AnimatedOrb size={32} />
        </div>
        <div>
          <h2 className="text-sm font-bold">Assistant</h2>
          <p className="text-[11px] text-(--os-text-dim)">Your guide to {CLUB.shortName}</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-[85%] select-text rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                m.sender === "user"
                  ? "rounded-br-sm bg-(--accent) text-white"
                  : "rounded-bl-sm border border-(--win-divider) bg-black/5 text-(--os-text) dark:bg-white/10"
              }`}
            >
              {m.text}
              {m.action &&
                (m.action.href ? (
                  <a
                    href={m.action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5 flex w-fit items-center gap-1.5 rounded-lg bg-[#FF9900] px-3 py-1.5 text-xs font-semibold text-[#1a1206] hover:brightness-105"
                  >
                    {m.action.label} <ArrowRight className="size-3" />
                  </a>
                ) : (
                  <button
                    onClick={() => m.action?.app && windowActions.open(m.action.app)}
                    className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-(--accent) px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                  >
                    {m.action.label} <ArrowRight className="size-3" />
                  </button>
                ))}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto border-t border-(--win-divider) px-4 py-2">
        {CHIPS.map(chip => (
          <button
            key={chip}
            onClick={() => send(chip)}
            className="whitespace-nowrap rounded-full border border-(--win-divider) bg-black/5 px-2.5 py-1 text-[11px] text-(--os-text) transition-colors hover:border-(--accent) dark:bg-white/5"
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="border-t border-(--win-divider) bg-(--titlebar-bg) p-3">
        <form
          onSubmit={e => {
            e.preventDefault()
            send()
          }}
          className="flex items-center gap-2 rounded-xl border border-(--win-divider) bg-black/5 px-3 py-2 dark:bg-white/5"
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a question…"
            aria-label="Ask the assistant"
            className="w-full bg-transparent text-[13px] text-(--os-text) outline-none placeholder:text-(--os-text-dim)"
          />
          <button type="submit" aria-label="Send" className="rounded bg-(--accent) p-1 text-white transition-opacity hover:opacity-90">
            <Send className="size-3.5" />
          </button>
        </form>
      </div>
    </div>
  )
}
