"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Server, Database, Shield, Zap } from "lucide-react"
import { InteractiveCanvas } from "./interactive-canvas"

const bootMessages = [
  "Initializing Cloud Environment...",
  "Loading AWS Services...",
  "Connecting to Cloud Infrastructure...",
  "Mounting Virtual Instances...",
  "Starting Security Protocols...",
  "Preparing Desktop Environment...",
  "Welcome to AWS Student Builder Group NMIET",
]

const orbitIcons = [
  { icon: Server,   dur: "8s",  dir: "normal",  size: 20, pos: "top", color: "#9B8FFF" },
  { icon: Database, dur: "10s", dir: "reverse", size: 20, pos: "bottom", color: "#B8A4FF" },
  { icon: Shield,   dur: "12s", dir: "normal",  size: 20, pos: "left", color: "#8B7FFF" },
  { icon: Zap,      dur: "9s",  dir: "reverse", size: 20, pos: "right", color: "#C4B5FD" },
]

export function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => Math.min(prev + 1, bootMessages.length - 1))
    }, 400)

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 100))
    }, 55)

    const completeTimeout = setTimeout(onComplete, 3200)

    return () => {
      clearInterval(messageInterval)
      clearInterval(progressInterval)
      clearTimeout(completeTimeout)
    }
  }, [onComplete])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: "#0a0a0f" }}
    >
      {/* Interactive animated canvas background */}
      <InteractiveCanvas theme="dark" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with orbiting icons */}
        <motion.div
          className="relative mb-10"
          initial={{ scale: 0.7, opacity: 0, y: 0, rotate: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            y: [-6, 6],
            rotate: [-3, 3]
          }}
          transition={{
            scale: { duration: 0.7, ease: [0.34, 1.56, 0.64, 1] },
            opacity: { duration: 0.7 },
            y: {
              duration: 6,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            },
            rotate: {
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }
          }}
        >
          {/* Glow ring */}
          <div
            className="absolute inset-0 rounded-3xl animate-glow-neon-purple"
            style={{ margin: "-8px" }}
          />
          {/* Logo */}
          <div
            className="relative flex h-28 w-28 items-center justify-center rounded-3xl"
            style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.25)" }}
          >
            <Image
              src="/logo-full.png"
              alt="AWS Student Builder Group NMIET"
              width={96}
              height={96}
              className="object-contain"
              unoptimized
            />
          </div>

          {/* Orbit icons */}
          {orbitIcons.map(({ icon: Icon, dur, dir, size, pos, color }, i) => {
            const posStyle: React.CSSProperties =
              pos === "top"    ? { top: "-1.5rem",  left: "50%",      transform: "translateX(-50%)" } :
              pos === "bottom" ? { bottom: "-1.5rem", left: "50%",    transform: "translateX(-50%)" } :
              pos === "left"   ? { left: "-1.5rem", top: "50%",       transform: "translateY(-50%)" } :
                                 { right: "-1.5rem", top: "50%",      transform: "translateY(-50%)" }
            return (
              <div
                key={i}
                className="absolute inset-0"
                style={{ animation: `spin ${dur} linear infinite`, animationDirection: dir as "normal" | "reverse" }}
              >
                <Icon
                  className="absolute"
                  style={{ ...posStyle, color, width: size, height: size }}
                />
              </div>
            )
          })}
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center mb-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-white mb-1">
            AWS Student Builder Group
          </h1>
          <p className="text-lg font-semibold" style={{ color: "#C4B5FD" }}>
            NMIET Chapter
          </p>
        </motion.div>

        {/* Progress */}
        <motion.div
          className="w-72"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div
            className="mb-4 h-1 w-full overflow-hidden rounded-full"
            style={{ background: "rgba(255,255,255,0.10)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #9B8FFF, #C4B5FD)",
                boxShadow: "0 0 12px rgba(155,143,255,0.7)",
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessage}
              className="text-center font-mono text-sm animate-boot-pulse"
              style={{ color: "rgba(255,255,255,0.60)" }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {bootMessages[currentMessage]}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom branding */}
      <div className="absolute bottom-8 text-center">
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.22)" }}>
          Powered by AWS Student Builder Group · NMIET
        </p>
      </div>

    </div>
  )
}
