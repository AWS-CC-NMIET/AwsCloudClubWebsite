// components/apps/photos-app.tsx
// Gallery — a Photos.app library of real event photos uploaded by admins

"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Camera, ChevronLeft, ChevronRight, Images, LayoutGrid, X } from "lucide-react"
import { windowActions } from "@/lib/aws-store"
import { useGallery, type Album } from "@/lib/club-data"
import {
  AppShell,
  ChipBar,
  EmptyState,
  LoadingState,
  MacButton,
  OfflineNotice,
  Sidebar,
  SidebarItem,
  SidebarSection,
  Toolbar,
} from "./shared/mac-ui"

type Photo = Album["photos"][number]
type View = "library" | "albums" | string // string = album id

export function PhotosApp() {
  const gallery = useGallery()
  const [view, setView] = useState<View>("library")
  const [lightbox, setLightbox] = useState<{ photos: Photo[]; index: number } | null>(null)

  const allPhotos = useMemo(() => gallery.data.flatMap(a => a.photos), [gallery.data])
  const album = gallery.data.find(a => a.id === view)
  const photos = album ? album.photos : allPhotos
  const title = view === "library" ? "Library" : view === "albums" ? "Albums" : album?.title ?? "Library"

  const isLoading = gallery.status === "loading" && gallery.data.length === 0

  return (
    <AppShell>
      <Sidebar hideOnNarrow>
        <SidebarSection title="Photos">
          <SidebarItem icon={Images} label="Library" count={allPhotos.length} active={view === "library"} onClick={() => setView("library")} />
          <SidebarItem icon={LayoutGrid} label="Albums" count={gallery.data.length} active={view === "albums"} onClick={() => setView("albums")} />
        </SidebarSection>
        {gallery.data.length > 0 && (
          <SidebarSection title="Events">
            {gallery.data.map(a => (
              <SidebarItem key={a.id} icon={Camera} label={a.title} count={a.photos.length} active={view === a.id} onClick={() => setView(a.id)} />
            ))}
          </SidebarSection>
        )}
      </Sidebar>

      <div className="flex min-w-0 flex-1 flex-col">
        <Toolbar
          left={
            album ? (
              <button onClick={() => setView("albums")} className="rounded-md px-1 py-0.5 text-[13px] font-medium text-(--accent) hover:bg-black/5 dark:hover:bg-white/10">
                ‹ Albums
              </button>
            ) : undefined
          }
          title={title}
          subtitle={album ? `${album.date} · ${album.photos.length} photos` : view === "albums" ? `${gallery.data.length} albums` : `${allPhotos.length} photos`}
        />
        <ChipBar
          options={[
            { id: "library", label: "Library", count: allPhotos.length },
            { id: "albums", label: "Albums", count: gallery.data.length },
          ]}
          value={view === "library" ? "library" : "albums"}
          onChange={setView}
          className="border-b border-(--win-divider)"
        />
        <OfflineNotice show={gallery.status === "error" && !gallery.fromFallback} />

        <div className="flex-1 overflow-y-auto p-3">
          {isLoading ? (
            <LoadingState label="Loading photos…" />
          ) : gallery.data.length === 0 ? (
            <EmptyState
              icon={Camera}
              title="No photos yet"
              message="Event photos appear here after the team uploads them. Check out our events in the meantime."
              action={<MacButton onClick={() => windowActions.open("calendar")}>Open Events</MacButton>}
            />
          ) : view === "albums" ? (
            <div className="grid grid-cols-2 gap-4 p-1 @2xl:grid-cols-3 @4xl:grid-cols-4">
              {gallery.data.map(a => (
                <button key={a.id} onClick={() => setView(a.id)} className="group text-left">
                  <div className="aspect-square overflow-hidden rounded-xl bg-black/5 shadow-sm dark:bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.cover} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <p className="mt-2 line-clamp-1 text-[13px] font-semibold text-(--os-text)">{a.title}</p>
                  <p className="text-[11px] text-(--os-text-dim)">{a.photos.length} photos · {a.date}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5 @2xl:grid-cols-4 @4xl:grid-cols-6">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setLightbox({ photos, index: i })}
                  className="group relative aspect-square overflow-hidden bg-black/5 dark:bg-white/5"
                  aria-label={p.caption}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt={p.caption} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {lightbox && <Lightbox {...lightbox} onClose={() => setLightbox(null)} onIndex={index => setLightbox(l => (l ? { ...l, index } : l))} />}
      </AnimatePresence>
    </AppShell>
  )
}

function Lightbox({
  photos,
  index,
  onClose,
  onIndex,
}: {
  photos: Photo[]
  index: number
  onClose: () => void
  onIndex: (i: number) => void
}) {
  const photo = photos[index]
  const prev = useCallback(() => index > 0 && onIndex(index - 1), [index, onIndex])
  const next = useCallback(() => index < photos.length - 1 && onIndex(index + 1), [index, photos.length, onIndex])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowLeft") prev()
      else if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, prev, next])

  if (!photo) return null

  return (
    <motion.div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/90 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
        <X className="size-5" />
      </button>
      {index > 0 && (
        <button
          onClick={e => {
            e.stopPropagation()
            prev()
          }}
          aria-label="Previous photo"
          className="absolute left-3 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}
      {index < photos.length - 1 && (
        <button
          onClick={e => {
            e.stopPropagation()
            next()
          }}
          aria-label="Next photo"
          className="absolute right-3 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <ChevronRight className="size-5" />
        </button>
      )}
      <motion.figure
        key={photo.id}
        className="mx-14 flex max-w-3xl flex-col items-center"
        onClick={e => e.stopPropagation()}
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.src} alt={photo.caption} className="max-h-[75vh] w-auto rounded-xl object-contain" />
        <figcaption className="mt-3 text-center text-sm font-medium text-white/80">{photo.caption}</figcaption>
        <p className="mt-1 text-xs text-white/40">
          {index + 1} / {photos.length}
        </p>
      </motion.figure>
    </motion.div>
  )
}
