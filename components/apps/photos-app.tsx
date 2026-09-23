// components/apps/photos-app.tsx
// Authentic macOS Photos library for AWS Cloud Club hackathons and workshops

"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Image as ImageIcon, Sparkles, X, ChevronLeft, ChevronRight, Layers } from "lucide-react"

interface PhotoItem {
  id: string
  title: string
  album: string
  date: string
  description: string
  aspectRatio: "video" | "square"
  color: string
}

const PHOTOS: PhotoItem[] = [
  {
    id: "p1",
    title: "AWS Cloud Day 2026 Keynote",
    album: "events",
    date: "Aug 2026",
    description: "Opening keynote introducing cloud architecture principles and student builder opportunities.",
    aspectRatio: "video",
    color: "from-orange-600 to-amber-700",
  },
  {
    id: "p2",
    title: "GenAI Bedrock Hands-on Lab",
    album: "workshops",
    date: "Sep 2026",
    description: "Students experimenting with prompt engineering and Claude 3.5 Sonnet on AWS Bedrock.",
    aspectRatio: "square",
    color: "from-purple-700 to-indigo-800",
  },
  {
    id: "p3",
    title: "36-Hour Cloud Hackathon Demo Day",
    album: "hackathons",
    date: "May 2026",
    description: "Finalist teams presenting serverless prototypes and computer vision architectures to the jury.",
    aspectRatio: "video",
    color: "from-blue-700 to-cyan-800",
  },
  {
    id: "p4",
    title: "Core Student Leadership Team",
    album: "team",
    date: "July 2026",
    description: "AWS Cloud Club SBG core leads planning the autumn workshop curriculum.",
    aspectRatio: "square",
    color: "from-emerald-700 to-teal-800",
  },
  {
    id: "p5",
    title: "AWS Certifications Celebration",
    album: "events",
    date: "Jul 2026",
    description: "Celebrating 30+ students who cleared AWS Certified Cloud Practitioner and Solutions Architect.",
    aspectRatio: "video",
    color: "from-rose-700 to-pink-800",
  },
  {
    id: "p6",
    title: "Serverless Microservices Workshop",
    album: "workshops",
    date: "Jun 2026",
    description: "Live coding session connecting API Gateway, Lambda, and DynamoDB.",
    aspectRatio: "square",
    color: "from-amber-600 to-yellow-700",
  },
]

export function PhotosApp() {
  const [selectedAlbum, setSelectedAlbum] = useState<string>("all")
  const [activePhoto, setActivePhoto] = useState<PhotoItem | null>(null)

  const filteredPhotos = PHOTOS.filter(
    p => selectedAlbum === "all" || p.album === selectedAlbum
  )

  return (
    <div className="flex h-full w-full flex-col md:flex-row bg-(--win-bg) text-(--os-text)">
      {/* ── Left Albums Sidebar ──────────────────────────────────────────────── */}
      <aside className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-(--win-divider) bg-black/[0.02] dark:bg-white/[0.02] p-3 space-y-3">
        <p className="px-2 text-[11px] font-semibold text-(--os-text-dim) uppercase tracking-wider">
          Albums
        </p>

        <div className="space-y-0.5 text-xs">
          {[
            { id: "all", label: "All Library", count: PHOTOS.length },
            { id: "events", label: "Cloud Days & Keynotes", count: 2 },
            { id: "workshops", label: "Hands-on Workshops", count: 2 },
            { id: "hackathons", label: "Hackathon Sprints", count: 1 },
            { id: "team", label: "Core Leads", count: 1 },
          ].map(album => (
            <button
              key={album.id}
              onClick={() => setSelectedAlbum(album.id)}
              className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 font-medium transition-colors ${
                selectedAlbum === album.id
                  ? "bg-(--accent) text-white"
                  : "text-(--os-text) hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <span>{album.label}</span>
              <span className="text-[10px] opacity-75">{album.count}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main Photo Grid ──────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredPhotos.map(photo => (
            <button
              key={photo.id}
              onClick={() => setActivePhoto(photo)}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-(--win-divider) bg-black/5 text-left transition-transform hover:scale-[1.02] focus:outline-none"
            >
              {/* Photo Simulation Container */}
              <div
                className={`w-full aspect-4/3 bg-gradient-to-br ${photo.color} relative flex items-center justify-center p-4 text-white shadow-inner`}
              >
                <div className="text-center space-y-1">
                  <ImageIcon className="size-8 mx-auto opacity-70 group-hover:scale-110 transition-transform" />
                  <p className="text-[11px] font-semibold tracking-wide uppercase opacity-90">
                    {photo.title}
                  </p>
                </div>

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>

              {/* Caption */}
              <div className="p-2.5 bg-(--win-bg)">
                <p className="text-xs font-semibold text-(--os-text) truncate">{photo.title}</p>
                <p className="text-[10px] text-(--os-text-dim) font-mono mt-0.5">{photo.date}</p>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* ── Lightbox Modal ───────────────────────────────────────────────────── */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative max-w-2xl w-full rounded-2xl overflow-hidden bg-neutral-900 text-white shadow-2xl border border-white/10"
          >
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 z-10 size-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80"
            >
              <X className="size-4" />
            </button>

            <div
              className={`w-full aspect-video bg-gradient-to-br ${activePhoto.color} flex items-center justify-center p-8`}
            >
              <div className="text-center space-y-2">
                <ImageIcon className="size-12 mx-auto text-white/80" />
                <h3 className="text-xl font-bold">{activePhoto.title}</h3>
              </div>
            </div>

            <div className="p-5 space-y-1.5 bg-neutral-900 border-t border-neutral-800">
              <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                <span>{activePhoto.date}</span>
                <span className="uppercase">{activePhoto.album}</span>
              </div>
              <p className="text-sm text-neutral-200">{activePhoto.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
