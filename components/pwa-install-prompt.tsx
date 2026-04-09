"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, X } from "lucide-react"
import Image from "next/image"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const DISMISSED_KEY = "pwa_install_dismissed"

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Don't show if already dismissed
    if (localStorage.getItem(DISMISSED_KEY)) return

    // Detect iOS (no beforeinstallprompt support)
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const standalone = (navigator as unknown as Record<string, unknown>).standalone === true
    setIsIOS(ios)

    if (ios && !standalone) {
      // Show iOS instructions after 5s
      const t = setTimeout(() => setShow(true), 5000)
      return () => clearTimeout(t)
    }

    // Chrome/Android — wait for the browser event
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setShow(true), 3000)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const dismiss = () => {
    setShow(false)
    localStorage.setItem(DISMISSED_KEY, "1")
  }

  const install = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") dismiss()
    setDeferredPrompt(null)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[300] w-[calc(100vw-32px)] max-w-sm"
          initial={{ y: 60, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring" as const, stiffness: 380, damping: 28 }}
        >
          <div
            className="relative flex items-center gap-3 rounded-2xl p-4"
            style={{
              background: "rgba(234,230,255,0.97)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(194,186,240,0.65)",
              boxShadow: "0 16px 40px rgba(107,79,232,0.25), 6px 6px 18px #C2BAF0, -4px -4px 12px #FFFFFF",
            }}
          >
            {/* Close */}
            <motion.button
              onClick={dismiss}
              className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full"
              style={{ background: "rgba(107,79,232,0.10)", color: "#9B8FC8" }}
              whileTap={{ scale: 0.90 }}
            >
              <X className="h-3.5 w-3.5" />
            </motion.button>

            <div
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{ background: "linear-gradient(135deg,#6B4FE8,#8B6FFF)", boxShadow: "3px 3px 10px rgba(107,79,232,0.35)" }}
            >
              <Image src="/logo-icon.png" alt="CloudOS" width={32} height={32} className="rounded-xl object-contain" />
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <p className="text-sm font-bold" style={{ color: "#1E1060" }}>Install Cloud OS</p>
              {isIOS ? (
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#7B6FC0" }}>
                  Tap <strong>Share</strong> → <strong>Add to Home Screen</strong> for the full app experience
                </p>
              ) : (
                <p className="text-xs mt-0.5" style={{ color: "#7B6FC0" }}>
                  Add to your home screen for instant access
                </p>
              )}
            </div>

            {!isIOS && (
              <motion.button
                onClick={install}
                className="flex-shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg,#6B4FE8,#8B6FFF)", boxShadow: "3px 3px 10px rgba(107,79,232,0.35)" }}
                whileTap={{ scale: 0.93 }}
              >
                <Download className="h-3.5 w-3.5" />
                Install
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
