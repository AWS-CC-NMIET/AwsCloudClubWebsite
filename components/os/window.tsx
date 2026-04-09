"use client"

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react"
import { motion } from "framer-motion"
import { X, Minus, Maximize2, Minimize2 } from "lucide-react"

interface WindowProps {
  id: string
  title: string
  icon: ReactNode
  children: ReactNode
  isActive: boolean
  isMinimized: boolean
  isMaximized: boolean
  initialPosition?: { x: number; y: number }
  initialSize?: { width: number; height: number }
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onFocus: () => void
  zIndex: number
}

/** Returns true if the viewport is mobile-sized (< 768px) — initializes synchronously to avoid layout flash */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false
    return window.innerWidth < 768
  })
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return isMobile
}

export function Window({
  id: _id,
  title,
  icon,
  children,
  isActive,
  isMinimized,
  isMaximized,
  initialPosition = { x: 100, y: 50 },
  initialSize = { width: 840, height: 620 },
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  zIndex,
}: WindowProps) {
  const windowRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  // On mobile, clamp the initial size to the screen
  const clampedSize = {
    width:  typeof window !== "undefined" ? Math.min(initialSize.width,  window.innerWidth  - 16) : initialSize.width,
    height: typeof window !== "undefined" ? Math.min(initialSize.height, window.innerHeight - 80) : initialSize.height,
  }

  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState(clampedSize)
  const [isClosing, setIsClosing] = useState(false)

  const isDraggingRef   = useRef(false)
  const isResizingRef   = useRef(false)
  const dragOffsetRef   = useRef({ x: 0, y: 0 })
  const positionRef     = useRef(initialPosition)
  const sizeRef         = useRef(clampedSize)

  useEffect(() => { positionRef.current = position }, [position])
  useEffect(() => { sizeRef.current = size }, [size])

  // ── Mouse drag ──────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDraggingRef.current && !isMaximized && !isMobile) {
      setPosition({
        x: Math.max(0, Math.min(e.clientX - dragOffsetRef.current.x, window.innerWidth  - sizeRef.current.width)),
        y: Math.max(0, Math.min(e.clientY - dragOffsetRef.current.y, window.innerHeight - sizeRef.current.height - 56)),
      })
    }
    if (isResizingRef.current && !isMaximized && !isMobile) {
      setSize({
        width:  Math.max(400, e.clientX - positionRef.current.x),
        height: Math.max(300, e.clientY - positionRef.current.y - 56),
      })
    }
  }, [isMaximized, isMobile])

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
    isResizingRef.current = false
  }, [])

  // ── Touch drag (for tablets) ─────────────────────────────────────────────
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDraggingRef.current && !isMaximized && !isMobile && e.touches.length === 1) {
      const t = e.touches[0]
      setPosition({
        x: Math.max(0, Math.min(t.clientX - dragOffsetRef.current.x, window.innerWidth  - sizeRef.current.width)),
        y: Math.max(0, Math.min(t.clientY - dragOffsetRef.current.y, window.innerHeight - sizeRef.current.height - 56)),
      })
      e.preventDefault()
    }
  }, [isMaximized, isMobile])

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup",   handleMouseUp)
    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener("touchend",  handleTouchEnd)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup",   handleMouseUp)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend",  handleTouchEnd)
    }
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".window-controls")) return
    if (isMobile) return   // no drag on mobile
    onFocus()
    isDraggingRef.current = true
    dragOffsetRef.current = { x: e.clientX - positionRef.current.x, y: e.clientY - positionRef.current.y }
  }

  const handleTitleBarTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest(".window-controls")) return
    if (isMobile) return   // no drag on mobile
    onFocus()
    const t = e.touches[0]
    isDraggingRef.current = true
    dragOffsetRef.current = { x: t.clientX - positionRef.current.x, y: t.clientY - positionRef.current.y }
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(onClose, 220)
  }

  if (isMinimized) return null

  // On mobile, always appear above the app drawer (z-50) and homepage bg (z-2)
  const effectiveZIndex = isMobile ? Math.max(zIndex, 60) : zIndex
  // On mobile, windows are always fullscreen (minus taskbar)
  const forceMaximize = isMobile || isMaximized

  return (
    <motion.div
      ref={windowRef}
      className={`absolute overflow-hidden ${isActive ? "neu-window-active" : "neu-window"}`}
      style={{
        left:         forceMaximize ? 0 : position.x,
        top:          forceMaximize ? 0 : position.y,
        width:        forceMaximize ? "100%" : size.width,
        height:       forceMaximize ? "calc(100dvh - 56px)" : size.height,
        zIndex:       effectiveZIndex,
        borderRadius: forceMaximize ? "0" : "1.5rem",
        // Make sure it never goes wider than viewport
        maxWidth:     "100vw",
      }}
      initial={{ scale: 0.90, opacity: 0, y: 24 }}
      animate={isClosing
        ? { scale: 0.88, opacity: 0, y: 16 }
        : { scale: 1,    opacity: 1, y: 0  }
      }
      transition={isClosing
        ? { duration: 0.20, ease: "easeIn" }
        : { type: "spring" as const, stiffness: 300, damping: 26 }
      }
      onClick={onFocus}
      layout={false}
    >
      {/* Title Bar */}
      <div
        className="flex h-11 cursor-move items-center justify-between px-4 select-none"
        style={{
          background: isActive
            ? "linear-gradient(135deg, rgba(107,79,232,0.10) 0%, rgba(184,164,255,0.07) 100%)"
            : "rgba(234,230,255,0.60)",
          borderBottom: "1px solid rgba(194,186,240,0.50)",
          // On mobile, disable cursor-move visual cue
          cursor: isMobile ? "default" : "move",
        }}
        onMouseDown={handleTitleBarMouseDown}
        onTouchStart={handleTitleBarTouchStart}
        onDoubleClick={!isMobile ? onMaximize : undefined}
      >
        {/* Icon + Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex-shrink-0" style={{ color: "#6B4FE8" }}>{icon}</span>
          <span className="text-sm font-semibold truncate" style={{ color: "#1E1060" }}>{title}</span>
        </div>

        {/* macOS-style traffic lights */}
        <div className="window-controls flex items-center gap-2 flex-shrink-0">
          {/* Minimize — hide on mobile (no taskbar restore) */}
          {!isMobile && (
            <motion.button
              onClick={onMinimize}
              className="group flex h-3.5 w-3.5 items-center justify-center rounded-full"
              style={{ background: "#FBBF24" }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              title="Minimize"
            >
              <Minus className="h-2 w-2 text-yellow-900 opacity-0 group-hover:opacity-100" />
            </motion.button>
          )}

          {/* Maximize — hide on mobile (always fullscreen) */}
          {!isMobile && (
            <motion.button
              onClick={onMaximize}
              className="group flex h-3.5 w-3.5 items-center justify-center rounded-full"
              style={{ background: "#34D399" }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized
                ? <Minimize2 className="h-2 w-2 text-green-900 opacity-0 group-hover:opacity-100" />
                : <Maximize2 className="h-2 w-2 text-green-900 opacity-0 group-hover:opacity-100" />
              }
            </motion.button>
          )}

          {/* Close — always shown, larger on mobile for easy tapping */}
          <motion.button
            onClick={handleClose}
            className="group flex items-center justify-center rounded-full"
            style={{
              background: "#F87171",
              width:  isMobile ? "1.5rem" : "0.875rem",
              height: isMobile ? "1.5rem" : "0.875rem",
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            title="Close"
          >
            <X className={isMobile ? "h-3 w-3" : "h-2 w-2"} style={{ color: "#7f1d1d", opacity: isMobile ? 1 : undefined }} />
          </motion.button>
        </div>
      </div>

      {/* Content — touch-scroll enabled */}
      <div
        className="custom-scrollbar overflow-auto"
        style={{
          height: "calc(100% - 2.75rem)",
          // On mobile: no padding & transparent bg so app fills edge-to-edge
          padding: isMobile ? 0 : undefined,
          background: isMobile ? "transparent" : "#EAE6FF",
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
        }}
      >
        {children}
      </div>

      {/* Resize handle — desktop only */}
      {!forceMaximize && (
        <div
          className="absolute bottom-0 right-0 h-5 w-5 cursor-se-resize"
          style={{
            background: "linear-gradient(135deg, transparent 50%, rgba(107,79,232,0.30) 50%)",
          }}
          onMouseDown={(e) => {
            e.stopPropagation()
            isResizingRef.current = true
            onFocus()
          }}
        />
      )}
    </motion.div>
  )
}
