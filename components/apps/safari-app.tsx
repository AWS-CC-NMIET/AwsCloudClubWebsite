// components/apps/safari-app.tsx
// Authentic macOS Safari browser window previewing live club applications

"use client"

import React, { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Share,
  Lock,
  ExternalLink,
  Smartphone,
  Monitor,
  Laptop,
  Globe,
} from "lucide-react"
import { sanitizeUrl } from "@/lib/utils"

interface BrowserBookmark {
  name: string
  url: string
  title: string
  description: string
  badge: string
}

const BOOKMARKS: BrowserBookmark[] = [
  {
    name: "Campus Serverless Portal",
    url: "https://portal.awsclub.edu",
    title: "AWS SBG NMIET Campus Portal",
    description: "Production portal for event check-in, workshop attendance, and cloud certificate downloads.",
    badge: "Live on AWS Lambda & DynamoDB",
  },
  {
    name: "AWS Cloud Resume",
    url: "https://resume.awsclub.edu",
    title: "Serverless Cloud Resume Showcase",
    description: "Cloud-native portfolio with CI/CD deployment through GitHub Actions and Amazon CloudFront CDN.",
    badge: "100 Lighthouse Performance",
  },
  {
    name: "Bedrock AI Study Assistant",
    url: "https://ai.awsclub.edu",
    title: "Bedrock GenAI Campus Engine",
    description: "Conversational RAG assistant trained on computer science and cloud architecture syllabi.",
    badge: "AWS Bedrock Claude 3.5 Sonnet",
  },
]

export function SafariApp() {
  const [currentBookmark, setCurrentBookmark] = useState<BrowserBookmark>(BOOKMARKS[0])
  const [viewportMode, setViewportMode] = useState<"desktop" | "mobile">("desktop")

  return (
    <div className="flex h-full w-full flex-col bg-(--win-bg) text-(--os-text)">
      {/* ── Safari Browser Navigation Chrome ─────────────────────────────────── */}
      <div className="border-b border-(--win-divider) bg-(--titlebar-bg) p-2 space-y-2">
        <div className="flex items-center gap-2 px-1">
          <div className="flex items-center gap-1 text-(--os-text-dim)">
            <button className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              <ChevronLeft className="size-4" />
            </button>
            <button className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              <ChevronRight className="size-4" />
            </button>
          </div>

          <button className="p-1 rounded text-(--os-text-dim) hover:bg-black/5 dark:hover:bg-white/10">
            <RotateCw className="size-3.5" />
          </button>

          {/* Safari URL Pill */}
          <div className="flex-1 mx-2 flex items-center justify-between rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-3 py-1 text-xs">
            <div className="flex items-center gap-2 truncate">
              <Lock className="size-3 text-emerald-500 shrink-0" />
              <span className="font-mono text-[11px] text-(--os-text) truncate">
                {currentBookmark.url}
              </span>
            </div>
            <span className="text-[10px] font-mono text-(--os-text-dim) hidden sm:inline">
              AWS CloudFront SSL
            </span>
          </div>

          {/* Viewport Toggles */}
          <div className="flex items-center gap-1 border border-(--win-divider) rounded-md p-0.5">
            <button
              onClick={() => setViewportMode("desktop")}
              className={`p-1 rounded ${viewportMode === "desktop" ? "bg-white dark:bg-neutral-700 shadow-xs" : "opacity-60"}`}
              title="Desktop Viewport"
            >
              <Monitor className="size-3.5" />
            </button>
            <button
              onClick={() => setViewportMode("mobile")}
              className={`p-1 rounded ${viewportMode === "mobile" ? "bg-white dark:bg-neutral-700 shadow-xs" : "opacity-60"}`}
              title="Mobile Viewport"
            >
              <Smartphone className="size-3.5" />
            </button>
          </div>

          <a
            href={sanitizeUrl(currentBookmark.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded text-(--os-text-dim) hover:bg-black/5 dark:hover:bg-white/10"
            title="Open Live Site in New Tab"
          >
            <ExternalLink className="size-3.5" />
          </a>
        </div>

        {/* Bookmarks Bar */}
        <div className="flex items-center gap-2 px-2 overflow-x-auto text-[11px] text-(--os-text-dim)">
          {BOOKMARKS.map(bm => (
            <button
              key={bm.name}
              onClick={() => setCurrentBookmark(bm)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                currentBookmark.name === bm.name
                  ? "bg-(--accent) text-white font-medium"
                  : "hover:bg-black/5 dark:hover:bg-white/5 text-(--os-text)"
              }`}
            >
              {bm.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Viewport Display Area ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 flex justify-center bg-neutral-100 dark:bg-neutral-900/50">
        <div
          className={`h-full transition-all duration-300 rounded-xl overflow-hidden border border-(--win-divider) bg-(--win-bg) shadow-lg flex flex-col ${
            viewportMode === "mobile" ? "w-[390px] max-w-full" : "w-full"
          }`}
        >
          {/* Simulated App Page */}
          <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-(--win-divider) pb-4">
              <div className="flex items-center gap-2">
                <Globe className="size-5 text-(--accent)" />
                <span className="text-sm font-bold text-(--os-text)">{currentBookmark.title}</span>
              </div>
              <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-mono">
                {currentBookmark.badge}
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-(--os-text)">{currentBookmark.title}</h1>
              <p className="text-sm leading-relaxed text-(--os-text-dim)">
                {currentBookmark.description}
              </p>

              {/* Interactive Sandbox Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="rounded-lg border border-(--win-divider) bg-black/5 dark:bg-white/5 p-4 space-y-1.5">
                  <p className="text-xs font-semibold text-(--os-text)">Cloud Health Check</p>
                  <p className="text-xs font-mono text-emerald-500">200 OK · Latency: 18ms</p>
                  <p className="text-[11px] text-(--os-text-dim)">us-east-1 edge node</p>
                </div>
                <div className="rounded-lg border border-(--win-divider) bg-black/5 dark:bg-white/5 p-4 space-y-1.5">
                  <p className="text-xs font-semibold text-(--os-text)">Security & SSL</p>
                  <p className="text-xs font-mono text-emerald-500">TLS 1.3 · Valid ACM Cert</p>
                  <p className="text-[11px] text-(--os-text-dim)">Automated DNS validation</p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 flex flex-wrap gap-3">
                <a
                  href={sanitizeUrl(currentBookmark.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-(--accent) px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  <span>Open Live Deployment</span>
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
