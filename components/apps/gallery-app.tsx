"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ImageIcon, X, ChevronLeft, ChevronRight, Calendar, Camera } from "lucide-react"

// Static gallery data — replace with S3 fetch when bucket is ready
const galleryAlbums = [
  {
    id: "launch",
    title: "Club Launch Event",
    date: "February 2026",
    cover: "/logo-full.png",
    photos: [
      { id: "1", src: "/logo-full.png", caption: "Club Launch — Welcome Session" },
      { id: "2", src: "/logo-full.png", caption: "Inaugural Address" },
      { id: "3", src: "/logo-full.png", caption: "Q&A With Cloud Experts" },
    ],
  },
]

interface Photo { id: string; src: string; caption: string }

function Lightbox({
  photos,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  photos: Photo[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const photo = photos[index]
  return (
    <motion.div
      className="fixed inset-0 z-[500] flex items-center justify-center"
      style={{ background: "rgba(10,6,40,0.92)", backdropFilter: "blur(10px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Navigation */}
      {index > 0 && (
        <motion.button
          className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full z-10"
          style={{ background: "rgba(255,255,255,0.12)", color: "white" }}
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          whileTap={{ scale: 0.90 }}
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>
      )}
      {index < photos.length - 1 && (
        <motion.button
          className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full z-10"
          style={{ background: "rgba(255,255,255,0.12)", color: "white" }}
          onClick={(e) => { e.stopPropagation(); onNext() }}
          whileTap={{ scale: 0.90 }}
        >
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      )}

      {/* Close */}
      <motion.button
        className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full z-10"
        style={{ background: "rgba(255,255,255,0.12)", color: "white" }}
        onClick={onClose}
        whileTap={{ scale: 0.90 }}
      >
        <X className="h-5 w-5" />
      </motion.button>

      {/* Image */}
      <motion.div
        className="relative max-w-2xl w-full mx-8"
        onClick={(e) => e.stopPropagation()}
        key={index}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring" as const, stiffness: 320, damping: 26 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.src}
          alt={photo.caption}
          className="w-full rounded-2xl object-cover"
          style={{ maxHeight: "70vh" }}
        />
        {photo.caption && (
          <p className="mt-3 text-center text-sm font-medium" style={{ color: "rgba(255,255,255,0.80)" }}>
            {photo.caption}
          </p>
        )}
        <p className="text-center text-xs mt-1" style={{ color: "rgba(255,255,255,0.40)" }}>
          {index + 1} / {photos.length}
        </p>
      </motion.div>
    </motion.div>
  )
}

export function GalleryApp() {
  const [selectedAlbum, setSelectedAlbum] = useState<typeof galleryAlbums[0] | null>(null)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  const openLightbox = (i: number) => setLightboxIdx(i)
  const closeLightbox = () => setLightboxIdx(null)

  return (
    <div className="h-full overflow-y-auto custom-scrollbar" style={{ background: "#EAE6FF" }}>
      <div className="max-w-2xl mx-auto px-4 pt-5 pb-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{ background: "linear-gradient(135deg,#E85580,#B83060)" }}>
            <Camera className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: "#1E1060" }}>Gallery</h1>
            <p className="text-xs" style={{ color: "#7B6FC0" }}>Memories from our events</p>
          </div>
        </div>

        {!selectedAlbum ? (
          // Album grid
          <>
            <p className="text-sm font-semibold mb-3" style={{ color: "#7B6FC0" }}>
              {galleryAlbums.length} {galleryAlbums.length === 1 ? "Album" : "Albums"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {galleryAlbums.map((album, i) => (
                <motion.button
                  key={album.id}
                  className="text-left rounded-2xl overflow-hidden"
                  style={{ boxShadow: "6px 6px 18px #C2BAF0, -6px -6px 18px #FFFFFF" }}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedAlbum(album)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={album.cover} alt={album.title} className="w-full h-36 object-cover" />
                  <div className="px-4 py-3" style={{ background: "#EAE6FF" }}>
                    <h3 className="font-bold text-sm" style={{ color: "#1E1060" }}>{album.title}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" style={{ color: "#7B6FC0" }} />
                      <span className="text-xs" style={{ color: "#7B6FC0" }}>{album.date}</span>
                      <span className="ml-auto text-xs font-medium" style={{ color: "#6B4FE8" }}>
                        {album.photos.length} photos
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {galleryAlbums.length === 0 && (
              <div className="flex flex-col items-center gap-4 py-16">
                <ImageIcon className="h-12 w-12 opacity-20" style={{ color: "#6B4FE8" }} />
                <p className="text-sm font-medium" style={{ color: "#9B8FC8" }}>No albums yet</p>
                <p className="text-xs text-center" style={{ color: "rgba(155,143,200,0.70)" }}>
                  Photos from events will appear here
                </p>
              </div>
            )}
          </>
        ) : (
          // Photo grid
          <>
            <motion.button
              onClick={() => setSelectedAlbum(null)}
              className="flex items-center gap-1.5 mb-4 text-sm font-semibold"
              style={{ color: "#6B4FE8" }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="h-4 w-4" />
              All Albums
            </motion.button>
            <h2 className="text-lg font-bold mb-1" style={{ color: "#1E1060" }}>{selectedAlbum.title}</h2>
            <p className="text-xs mb-4" style={{ color: "#7B6FC0" }}>{selectedAlbum.date} · {selectedAlbum.photos.length} photos</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {selectedAlbum.photos.map((photo, i) => (
                <motion.button
                  key={photo.id}
                  className="rounded-xl overflow-hidden aspect-square"
                  style={{ boxShadow: "4px 4px 12px #C2BAF0, -3px -3px 10px #FFFFFF" }}
                  initial={{ opacity: 0, scale: 0.90 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => openLightbox(i)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.src} alt={photo.caption} className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && selectedAlbum && (
          <Lightbox
            photos={selectedAlbum.photos}
            index={lightboxIdx}
            onClose={closeLightbox}
            onPrev={() => setLightboxIdx((i) => Math.max(0, (i ?? 1) - 1))}
            onNext={() => setLightboxIdx((i) => Math.min(selectedAlbum.photos.length - 1, (i ?? 0) + 1))}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
