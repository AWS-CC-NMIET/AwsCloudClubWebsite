"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue, useTransform, animate, type PanInfo } from "framer-motion"
import { ChevronUp } from "lucide-react"
import Image from "next/image"
import { InteractiveCanvas } from "@/components/os/interactive-canvas"

interface Props {
  onUnlock: () => void
}

export function MobileLockscreen({ onUnlock }: Props) {
  const [time, setTime]    = useState("")
  const [dateStr, setDate] = useState("")

  useEffect(() => {
    const upd = () => {
      const n  = new Date()
      const h  = n.getHours().toString().padStart(2, "0")
      const m  = n.getMinutes().toString().padStart(2, "0")
      setTime(`${h}:${m}`)
      setDate(n.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }))
    }
    upd()
    const id = setInterval(upd, 1000)
    return () => clearInterval(id)
  }, [])

  const y       = useMotionValue(0)
  const opacity = useTransform(y, [0, -160], [1, 0])
  const scale   = useTransform(y, [0, -160], [1, 0.94])

  const handleDragEnd = (_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (info.offset.y < -90 || info.velocity.y < -500) {
      animate(y, -900, { duration: 0.28, ease: "easeIn" }).then(onUnlock)
    } else {
      animate(y, 0, { type: "spring", stiffness: 420, damping: 32 })
    }
  }

  return (
    <div className="fixed inset-0 overflow-hidden select-none" style={{ background: "#050310" }}>
      <InteractiveCanvas theme="dark" particleCountOverride={35} />

      {/* Gradient overlay — bottom fade so swipe hint pops */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, transparent 55%, rgba(5,3,16,0.55) 100%)",
        }}
      />

      <motion.div
        className="absolute inset-0 z-10 flex flex-col items-center touch-none"
        style={{ y, opacity, scale }}
        drag="y"
        dragConstraints={{ top: -900, bottom: 18 }}
        dragElastic={{ top: 0.38, bottom: 0.06 }}
        onDragEnd={handleDragEnd}
      >
        {/* ── Time ── */}
        <div className="flex flex-col items-center mt-20 mb-2">
          <div
            className="tabular-nums"
            style={{
              fontSize: "clamp(4.5rem, 22vw, 6rem)",
              color: "#ffffff",
              fontWeight: 100,
              letterSpacing: "0.04em",
              lineHeight: 1,
              textShadow: "0 2px 32px rgba(168,85,247,0.28)",
            }}
          >
            {time}
          </div>
          <p
            className="mt-2 text-base font-light"
            style={{ color: "rgba(196,181,253,0.72)", letterSpacing: "0.02em" }}
          >
            {dateStr}
          </p>
        </div>

        {/* ── Logo + branding ── */}
        <div className="flex flex-col items-center gap-3 mt-14">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-2xl animate-glow-neon-purple"
              style={{ margin: "-10px" }}
            />
            <div
              className="relative flex items-center justify-center rounded-2xl overflow-hidden"
              style={{
                width: 96,
                height: 96,
                background: "rgba(8,4,20,0.70)",
                border: "1.5px solid rgba(168,85,247,0.40)",
              }}
            >
              <Image
                src="/logo-full.png"
                alt="AWS Student Builder Group"
                width={80}
                height={80}
                className="object-contain"
                unoptimized
              />
            </div>
          </div>

          <div className="text-center">
            <p
              className="text-xs font-bold"
              style={{ color: "rgba(255,255,255,0.88)", letterSpacing: "0.14em" }}
            >
              AWS STUDENT BUILDER GROUP
            </p>
            <p
              className="text-[10px] mt-0.5"
              style={{ color: "rgba(196,181,253,0.55)", letterSpacing: "0.24em" }}
            >
              NMIET CHAPTER
            </p>
          </div>
        </div>

        {/* ── Swipe hint ── */}
        <div className="absolute bottom-12 flex flex-col items-center gap-2">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronUp
              style={{ color: "rgba(196,181,253,0.60)", width: 28, height: 28 }}
            />
          </motion.div>
          <p
            className="text-[10px]"
            style={{ color: "rgba(196,181,253,0.38)", letterSpacing: "0.20em" }}
          >
            SWIPE UP TO UNLOCK
          </p>
        </div>
      </motion.div>
    </div>
  )
}
