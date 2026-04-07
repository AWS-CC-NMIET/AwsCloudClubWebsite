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
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState(initialSize)
  const [isClosing, setIsClosing] = useState(false)

  const isDraggingRef   = useRef(false)
  const isResizingRef   = useRef(false)
  const dragOffsetRef   = useRef({ x: 0, y: 0 })
  const positionRef     = useRef(initialPosition)
  const sizeRef         = useRef(initialSize)

  useEffect(() => { positionRef.current = position }, [position])
  useEffect(() => { sizeRef.current = size }, [size])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDraggingRef.current && !isMaximized) {
      setPosition({
        x: Math.max(0, Math.min(e.clientX - dragOffsetRef.current.x, window.innerWidth - sizeRef.current.width)),
        y: Math.max(0, Math.min(e.clientY - dragOffsetRef.current.y, window.innerHeight - sizeRef.current.height - 56)),
      })
    }
    if (isResizingRef.current && !isMaximized) {
      setSize({
        width:  Math.max(400, e.clientX - positionRef.current.x),
        height: Math.max(300, e.clientY - positionRef.current.y - 56),
      })
    }
  }, [isMaximized])

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
    isResizingRef.current = false
  }, [])

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".window-controls")) return
    onFocus()
    isDraggingRef.current = true
    dragOffsetRef.current = { x: e.clientX - positionRef.current.x, y: e.clientY - positionRef.current.y }
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(onClose, 220)
  }

  if (isMinimized) return null

  return (
    <motion.div
      ref={windowRef}
      className={`absolute overflow-hidden ${isActive ? "neu-window-active" : "neu-window"}`}
      style={{
        left:   isMaximized ? 0 : position.x,
        top:    isMaximized ? 0 : position.y,
        width:  isMaximized ? "100%" : size.width,
        height: isMaximized ? "calc(100vh - 56px)" : size.height,
        zIndex,
        borderRadius: isMaximized ? "0" : "1.5rem",
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
        }}
        onMouseDown={handleTitleBarMouseDown}
        onDoubleClick={onMaximize}
      >
        {/* Icon + Title */}
        <div className="flex items-center gap-2.5">
          <span style={{ color: "#6B4FE8" }}>{icon}</span>
          <span className="text-sm font-semibold" style={{ color: "#1E1060" }}>{title}</span>
        </div>

        {/* macOS-style traffic lights */}
        <div className="window-controls flex items-center gap-2">
          {/* Minimize — yellow */}
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

          {/* Maximize — green */}
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

          {/* Close — red */}
          <motion.button
            onClick={handleClose}
            className="group flex h-3.5 w-3.5 items-center justify-center rounded-full"
            style={{ background: "#F87171" }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            title="Close"
          >
            <X className="h-2 w-2 text-red-900 opacity-0 group-hover:opacity-100" />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div
        className="custom-scrollbar h-[calc(100%-2.75rem)] overflow-auto p-5"
        style={{ background: "#EAE6FF" }}
      >
        {children}
      </div>

      {/* Resize handle */}
      {!isMaximized && (
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
