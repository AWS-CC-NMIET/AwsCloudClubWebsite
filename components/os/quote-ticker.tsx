"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const AWS_QUOTES = [
  { text: "The cloud is not a place, it's a way of doing IT.", author: "— AWS" },
  { text: "Build the future, one microservice at a time.", author: "— Cloud Club NMIET" },
  { text: "Failures are the stepping stone to a resilient architecture.", author: "— AWS Well-Architected" },
  { text: "Scale infinitely. Pay only for what you use.", author: "— AWS Philosophy" },
  { text: "From idea to cloud in minutes, not months.", author: "— Cloud Native" },
  { text: "Security is not a feature, it's a foundation.", author: "— AWS Security Pillar" },
  { text: "Every great cloud journey starts with a single EC2 instance.", author: "— Cloud Club NMIET" },
  { text: "Think big, start small, scale fast.", author: "— Amazon Leadership Principle" },
  { text: "DevOps is not a tool, it's a culture of collaboration.", author: "— AWS DevOps" },
  { text: "The best architecture is the one that evolves with your needs.", author: "— AWS Well-Architected" },
]

export function QuoteTicker() {
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [visible,  setVisible]  = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setQuoteIdx((i) => (i + 1) % AWS_QUOTES.length)
        setVisible(true)
      }, 500)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const q = AWS_QUOTES[quoteIdx]

  return (
    // Hidden on mobile — quote ticker overlaps content on small screens
    <motion.div
      className="absolute top-10 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none hidden md:block"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      style={{ maxWidth: 500 }}
    >
      {/* Thin top rule */}
      <div className="flex items-center gap-3 mb-2 justify-center">
        <div style={{ width: 32, height: 1, background: "rgba(30,16,96,0.25)" }} />
        <span
          className="text-xs tracking-[0.2em] uppercase"
          style={{ color: "rgba(30,16,96,0.4)", fontFamily: "Georgia, serif", letterSpacing: "0.18em" }}
        >
          quote of the moment
        </span>
        <div style={{ width: 32, height: 1, background: "rgba(30,16,96,0.25)" }} />
      </div>

      <motion.p
        key={quoteIdx}
        style={{
          color: "var(--quote-text, #1E1060)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "0.9rem",
          fontStyle: "italic",
          fontWeight: 400,
          lineHeight: 1.55,
          letterSpacing: "0.01em",
        }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -5 }}
        transition={{ duration: 0.4 }}
      >
        &ldquo;{q.text}&rdquo;
      </motion.p>

      <motion.p
        key={`a-${quoteIdx}`}
        className="mt-1.5 text-xs tracking-wider"
        style={{
          color: "rgba(107,79,232,0.75)",
          fontFamily: "system-ui, sans-serif",
          fontWeight: 600,
          letterSpacing: "0.06em",
        }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        {q.author}
      </motion.p>
    </motion.div>
  )
}
