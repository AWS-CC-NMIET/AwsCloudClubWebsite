// components/apps/assistant-app.tsx
// Interactive Cloud Concierge powered by generative AWS knowledge

"use client"

import React, { useState } from "react"
import { Sparkles, Send, Bot, ArrowRight, CornerDownLeft } from "lucide-react"
import { AnimatedOrb } from "@/components/os/app-icon"
import { windowActions } from "@/lib/aws-store"

interface ChatMsg {
  sender: "user" | "bot"
  text: string
  actionApp?: string
  actionLabel?: string
}

export function AssistantApp() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      sender: "bot",
      text: "Hello! I am the AWS Cloud Club Concierge. Ask me anything about our upcoming workshops, certification study roadmaps, cloud projects, or leadership team.",
    },
  ])
  const [inputVal, setInputVal] = useState("")

  const handleSend = (textToSend?: string) => {
    const q = (textToSend || inputVal).trim()
    if (!q) return

    const newMsgs: ChatMsg[] = [...messages, { sender: "user", text: q }]
    setMessages(newMsgs)
    setInputVal("")

    setTimeout(() => {
      const lower = q.toLowerCase()
      let reply: ChatMsg = {
        sender: "bot",
        text: "I can help with that! AWS Cloud Club SBG hosts hands-on sessions covering EC2, Lambda, Bedrock, and DynamoDB. Check out our study guides or attend the next workshop!",
      }

      if (lower.includes("cert") || lower.includes("exam") || lower.includes("clf") || lower.includes("saa")) {
        reply = {
          sender: "bot",
          text: "We have dedicated 4-week to 6-week study tracks for AWS Certified Cloud Practitioner (CLF-C02) and Solutions Architect Associate (SAA-C03). Would you like to read the guide?",
          actionApp: "notes",
          actionLabel: "Open Certification Notes",
        }
      } else if (lower.includes("workshop") || lower.includes("event") || lower.includes("meetup")) {
        reply = {
          sender: "bot",
          text: "Our next major session is the 'AWS GenAI & Bedrock Hands-on Bootcamp' on Sep 28, 2026. RSVP is open now!",
          actionApp: "calendar",
          actionLabel: "View Calendar & RSVP",
        }
      } else if (lower.includes("project") || lower.includes("repo") || lower.includes("code")) {
        reply = {
          sender: "bot",
          text: "Our students have deployed several production cloud architectures, including the Campus Serverless Portal, Cloud Resume Challenge, and Rekognition Attendance system.",
          actionApp: "finder",
          actionLabel: "Browse in Finder",
        }
      } else if (lower.includes("join") || lower.includes("apply") || lower.includes("contact")) {
        reply = {
          sender: "bot",
          text: "Membership is completely free for all university students. Send a quick note directly to the student leadership team!",
          actionApp: "mail",
          actionLabel: "Compose in Mail",
        }
      }

      setMessages(prev => [...prev, reply])
    }, 450)
  }

  return (
    <div className="flex h-full w-full flex-col bg-(--win-bg) text-(--os-text)">
      {/* ── Assistant Header with Orb ────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-(--win-divider) bg-(--titlebar-bg)/50 p-4">
        <div className="size-8 shrink-0">
          <AnimatedOrb size={32} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-(--os-text)">Cloud Concierge</h2>
          <p className="text-[11px] text-(--os-text-dim)">Built-in assistant for AWS Cloud Club</p>
        </div>
      </div>

      {/* ── Chat Messages Stream ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs md:text-sm leading-relaxed ${
                m.sender === "user"
                  ? "bg-(--accent) text-white rounded-br-xs"
                  : "bg-black/5 dark:bg-white/10 text-(--os-text) rounded-bl-xs border border-(--win-divider)"
              }`}
            >
              {m.text}

              {m.actionApp && (
                <button
                  onClick={() => windowActions.open(m.actionApp as any)}
                  className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-(--accent) px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:opacity-90"
                >
                  <span>{m.actionLabel}</span>
                  <ArrowRight className="size-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Chips ──────────────────────────────────────────────────────── */}
      <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto border-t border-(--win-divider)">
        {[
          "Upcoming workshops?",
          "How to get AWS certified?",
          "Show top student projects",
          "How do I join?",
        ].map(chip => (
          <button
            key={chip}
            onClick={() => handleSend(chip)}
            className="whitespace-nowrap rounded-full border border-(--win-divider) bg-black/5 dark:bg-white/5 px-2.5 py-1 text-[11px] hover:border-(--accent) text-(--os-text) transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* ── Chat Input ───────────────────────────────────────────────────────── */}
      <div className="p-3 border-t border-(--win-divider) bg-(--titlebar-bg)">
        <form
          onSubmit={e => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2 rounded-xl border border-(--win-divider) bg-black/5 dark:bg-white/5 px-3 py-2"
        >
          <input
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder="Ask Cloud Concierge..."
            className="w-full bg-transparent text-xs text-(--os-text) outline-none placeholder:text-(--os-text-dim)"
          />
          <button
            type="submit"
            className="p-1 rounded bg-(--accent) text-white hover:opacity-90 transition-opacity"
          >
            <Send className="size-3.5" />
          </button>
        </form>
      </div>
    </div>
  )
}
