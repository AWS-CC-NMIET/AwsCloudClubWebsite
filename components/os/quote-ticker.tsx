"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const AWS_QUOTES = [
  { text: "The cloud is not a place, it's a way of doing IT.", author: "— AWS" },
  { text: "Build the future, one microservice at a time.", author: "— Student Builder Group NMIET" },
  { text: "Failures are the stepping stone to a resilient architecture.", author: "— AWS Well-Architected" },
  { text: "Scale infinitely. Pay only for what you use.", author: "— AWS Philosophy" },
  { text: "From idea to cloud in minutes, not months.", author: "— Cloud Native" },
  { text: "Security is not a feature, it's a foundation.", author: "— AWS Security Pillar" },
  { text: "Every great cloud journey starts with a single EC2 instance.", author: "— Student Builder Group NMIET" },
  { text: "Think big, start small, scale fast.", author: "— Amazon Leadership Principle" },
  { text: "DevOps is not a tool, it's a culture of collaboration.", author: "— AWS DevOps" },
  { text: "The best architecture is the one that evolves with your needs.", author: "— AWS Well-Architected" },
]

export function QuoteTicker() {
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [visible,  setVisible]  = useState(true)
  const [isRareQuote, setIsRareQuote] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        // Roll for 1-in-50 (2%) chance of rare quote
        const roll = Math.random() < 0.02
        if (roll) {
          setIsRareQuote(true)
        } else {
          setIsRareQuote(false)
          setQuoteIdx((i) => (i + 1) % AWS_QUOTES.length)
        }
        setVisible(true)
      }, 500)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const q = isRareQuote 
    ? { text: "It's not a bug, it's an undocumented feature.", author: "— AWS Support, probably" }
    : AWS_QUOTES[quoteIdx]

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
        <div style={{ width: 32, height: 1, background: "rgba(168,85,247,0.35)" }} />
        <span
          className="text-xs tracking-[0.2em] uppercase"
          style={{ color: "rgba(196,181,253,0.55)", fontFamily: "Georgia, serif", letterSpacing: "0.18em" }}
        >
          quote of the moment
        </span>
        <div style={{ width: 32, height: 1, background: "rgba(168,85,247,0.35)" }} />
      </div>

      <motion.p
        key={isRareQuote ? "rare" : quoteIdx}
        style={{
          color: isRareQuote ? "#FDE047" : "rgba(237,233,254,0.92)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "0.9rem",
          fontStyle: "italic",
          fontWeight: isRareQuote ? 600 : 400,
          lineHeight: 1.55,
          letterSpacing: "0.01em",
          textShadow: isRareQuote ? "0 0 24px rgba(254,224,71,0.60)" : "0 0 20px rgba(168,85,247,0.30)",
        }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -5 }}
        transition={{ duration: 0.4 }}
      >
        &ldquo;{q.text}&rdquo;
      </motion.p>

      <motion.p
        key={isRareQuote ? "rare-a" : `a-${quoteIdx}`}
        className="mt-1.5 text-xs tracking-wider"
        style={{
          color: isRareQuote ? "#F59E0B" : "#A78BFA",
          fontFamily: "system-ui, sans-serif",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textShadow: isRareQuote ? "0 0 12px rgba(245,158,11,0.50)" : "0 0 12px rgba(168,85,247,0.50)",
        }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        {q.author}
      </motion.p>
    </motion.div>
  )
}
