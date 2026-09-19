// components/apps/messages-app.tsx
// iMessage-style testimonials from student builders and alumni

"use client"

import React, { useState } from "react"
import { CheckCheck, MessageSquare, Sparkles, User } from "lucide-react"

interface TestimonialThread {
  id: string
  name: string
  role: string
  time: string
  avatarColor: string
  messages: {
    fromMe?: boolean
    text: string
    time: string
  }[]
}

const THREADS: TestimonialThread[] = [
  {
    id: "t1",
    name: "Aarav Mehta",
    role: "Cloud Engineer @ Deloitte · Club Alumni",
    time: "Yesterday",
    avatarColor: "bg-blue-600",
    messages: [
      {
        text: "Hey everyone! Just wanted to share that the AWS Cloud Club workshops on IAM and VPCs were directly asked in my technical interviews. Cleared AWS Solutions Architect Associate in my 3rd year thanks to the club cohort!",
        time: "10:14 AM",
      },
      {
        fromMe: true,
        text: "That's incredible Aarav! Huge congratulations from the entire SBG builder community! 🚀",
        time: "10:18 AM",
      },
    ],
  },
  {
    id: "t2",
    name: "Dr. Sunita Kulkarni",
    role: "Faculty Advisor & Dept Coordinator",
    time: "Sep 18",
    avatarColor: "bg-emerald-600",
    messages: [
      {
        text: "The student participation in the recent Bedrock Generative AI bootcamp was phenomenal. Seeing 150+ students deploy their own models in one afternoon proves how effective hands-on peer learning is.",
        time: "3:40 PM",
      },
    ],
  },
  {
    id: "t3",
    name: "Rohan Patil",
    role: "3rd Year CS · Hackathon Winner",
    time: "Sep 12",
    avatarColor: "bg-purple-600",
    messages: [
      {
        text: "Building our project on DynamoDB and Lambda for the 36-hour cloud hackathon was a game changer. The mentors were literally with us at 2 AM debugging our EventBridge rules!",
        time: "9:05 PM",
      },
    ],
  },
]

export function MessagesApp() {
  const [activeThread, setActiveThread] = useState<TestimonialThread>(THREADS[0])

  return (
    <div className="flex h-full w-full flex-col md:flex-row bg-(--win-bg) text-(--os-text)">
      {/* ── Left Sidebar Conversations ───────────────────────────────────────── */}
      <aside className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-(--win-divider) bg-black/[0.02] dark:bg-white/[0.02] p-2 space-y-1 overflow-y-auto">
        <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-(--os-text-dim)">
          Testimonials & Reviews
        </p>

        {THREADS.map(thread => {
          const isSelected = activeThread.id === thread.id
          return (
            <button
              key={thread.id}
              onClick={() => setActiveThread(thread)}
              className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors ${
                isSelected
                  ? "bg-(--accent) text-white"
                  : "hover:bg-black/5 dark:hover:bg-white/5 text-(--os-text)"
              }`}
            >
              <div
                className={`size-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${thread.avatarColor}`}
              >
                {thread.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-xs font-semibold">{thread.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">{thread.time}</span>
                </div>
                <p
                  className={`truncate text-[11px] ${
                    isSelected ? "text-white/80" : "text-(--os-text-dim)"
                  }`}
                >
                  {thread.role}
                </p>
              </div>
            </button>
          )
        })}
      </aside>

      {/* ── Right Chat Window ────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-h-0 bg-neutral-50 dark:bg-neutral-900/30">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-(--win-divider) px-6 py-3 bg-(--win-bg)">
          <div>
            <h3 className="text-sm font-bold text-(--os-text)">{activeThread.name}</h3>
            <p className="text-xs text-(--os-text-dim)">{activeThread.role}</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-[10px] font-mono">
            <CheckCheck className="size-3" /> Verified Student Builder
          </span>
        </div>

        {/* Chat Bubbles */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeThread.messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.fromMe ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-md rounded-2xl px-4 py-2.5 text-xs md:text-sm leading-relaxed shadow-sm ${
                  msg.fromMe
                    ? "bg-(--accent) text-white rounded-br-xs"
                    : "bg-white dark:bg-neutral-800 text-(--os-text) rounded-bl-xs border border-(--win-divider)"
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] font-mono text-(--os-text-dim) mt-1 px-1">
                {msg.time}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
