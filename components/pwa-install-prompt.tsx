"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, X } from "lucide-react"
import Image from "next/image"
import { safeStorage } from "@/lib/utils"

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
    if (safeStorage.getItem(DISMISSED_KEY)) return

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
    safeStorage.setItem(DISMISSED_KEY, "1")
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
          role="dialog"
          aria-label="Install the app"
          className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-1/2 z-[1250] w-[calc(100vw-32px)] max-w-sm -translate-x-1/2"
          initial={{ y: 40, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        >
          <div className="relative flex items-center gap-3 rounded-2xl border border-black/10 bg-white/85 p-3.5 text-neutral-900 shadow-2xl backdrop-blur-2xl dark:border-white/15 dark:bg-[#202028]/90 dark:text-white">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-[22%] bg-gradient-to-b from-[#1f2937] to-[#0f172a] shadow-md">
              <Image src="/logo-full.png" alt="" width={32} height={32} className="size-8 object-contain" unoptimized />
            </div>
            <div className="min-w-0 flex-1 pr-5">
              <p className="text-[13px] font-semibold">Install AWS SBG NMIET</p>
              <p className="mt-0.5 text-[12px] leading-snug text-neutral-500 dark:text-neutral-400">
                {isIOS ? (
                  <>
                    Tap <strong>Share</strong> → <strong>Add to Home Screen</strong> to open it like an app.
                  </>
                ) : (
                  "Open it from your home screen or dock, like an app."
                )}
              </p>
            </div>
            {!isIOS && (
              <button
                onClick={install}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#7940ea] px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm hover:brightness-110"
              >
                <Download className="size-3.5" /> Install
              </button>
            )}
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
