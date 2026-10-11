// components/apps/shared/motion.tsx
// Shared motion primitives: staggered entrances, reveal-on-view, count-up
// numbers and cards with a cursor-following sheen (and optional 3D tilt).
// framer-motion honours the OS "reduce motion" setting via <MotionConfig>.

"use client"

import React, { useEffect, useRef, useState } from "react"
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion"
import { cn } from "@/lib/utils"

const SPRING = { type: "spring" as const, stiffness: 260, damping: 26 }

export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
}

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: SPRING },
}

/** Children marked <StaggerItem> animate in one after another. */
export function Stagger({ className, children, ...rest }: HTMLMotionProps<"div">) {
  return (
    <motion.div className={className} variants={staggerParent} initial="hidden" animate="show" {...rest}>
      {children}
    </motion.div>
  )
}

export function StaggerItem({ className, children, ...rest }: HTMLMotionProps<"div">) {
  return (
    <motion.div className={className} variants={staggerChild} {...rest}>
      {children}
    </motion.div>
  )
}

/** Fades + slides content in the first time it scrolls into view. */
export function Reveal({ className, children, delay = 0, ...rest }: HTMLMotionProps<"div"> & { delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ ...SPRING, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/** Animates "1254+" from 0 → 1254, keeping any prefix/suffix. */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  const match = value.match(/^(\D*)([\d,]+)(.*)$/)
  const [prefix, digits, suffix] = match ? [match[1], match[2], match[3]] : ["", "", ""]
  const target = match ? Number(digits.replace(/,/g, "")) : NaN
  const animatable = Number.isFinite(target) && !reduce
  const [animated, setAnimated] = useState(`${prefix}0${suffix}`)

  useEffect(() => {
    if (!animatable || !inView) return
    const controls = animate(0, target, {
      duration: Math.min(1.6, 0.6 + target / 1500),
      ease: [0.16, 1, 0.3, 1],
      onUpdate: v => {
        const n = Math.round(v)
        setAnimated(`${prefix}${digits.includes(",") ? n.toLocaleString("en-IN") : n}${suffix}`)
      },
    })
    return () => controls.stop()
  }, [animatable, inView, target, prefix, digits, suffix])

  const display = animatable ? animated : value

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {display}
    </span>
  )
}

/**
 * A card with a cursor-following sheen. With `tilt`, it also leans towards
 * the cursor in 3D. Pointer moves only touch CSS variables / motion values,
 * so nothing re-renders while you hover.
 */
export function GlowCard({
  tilt = false,
  className,
  children,
  style,
  ...rest
}: HTMLMotionProps<"div"> & { tilt?: boolean | number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const deg = typeof tilt === "number" ? tilt : 9
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(py, [0, 1], [deg * 0.8, -deg * 0.8]), { stiffness: 220, damping: 20 })
  const rotateY = useSpring(useTransform(px, [0, 1], [-deg, deg]), { stiffness: 220, damping: 20 })

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty("--mx", `${x * 100}%`)
    el.style.setProperty("--my", `${y * 100}%`)
    px.set(x)
    py.set(y)
  }

  const onLeave = () => {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn("sheen", className)}
      style={tilt && !reduce ? { rotateX, rotateY, transformPerspective: 900, ...style } : style}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
