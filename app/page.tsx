"use client"

import { useState, useEffect, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { BootScreen } from "@/components/os/boot-screen"
import { LoginScreen } from "@/components/os/login-screen"
import { DesktopContainer } from "@/components/os/desktop-container"
import { MobileOS } from "@/components/mobile/mobile-os"
import { ScreenBrightnessOverlay } from "@/components/os/screen-brightness-overlay"
import { isSessionValid, refreshSession } from "@/lib/auth-client"
import type { AppId } from "@/lib/aws-apps"

type Stage = "checking" | "boot" | "login" | "desktop"
type LoginEntry = "lock" | "signin"

const BOOTED_KEY = "sbg-booted"

function hasBootedThisSession() {
  try {
    return sessionStorage.getItem(BOOTED_KEY) === "1"
  } catch {
    return false
  }
}

function markBooted() {
  try {
    sessionStorage.setItem(BOOTED_KEY, "1")
  } catch {
    /* private mode — boot again next time, no harm */
  }
}

export default function CloudOS() {
  // null = device type not yet detected (avoids hydration mismatch)
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const [stage, setStage] = useState<Stage>("checking")
  const [loginEntry, setLoginEntry] = useState<LoginEntry>("lock")
  /** App the visitor tried to open before being asked to sign in. */
  const [pendingApp, setPendingApp] = useState<AppId | null>(null)
  const [initialApp, setInitialApp] = useState<AppId | null>(null)

  useEffect(() => {
    console.log(
      `%c
   ▲   ▲   ▲   ▲   ▲   ▲   ▲   ▲
  / \\ / \\ / \\ / \\ / \\ / \\ / \\ / \\
 ( A | W | S |   | S | B | G |   )
  \\_/ \\_/ \\_/ \\_/ \\_/ \\_/ \\_/ \\_/

      Student Builder Group · NMIET

%cHey curious builder 👀 — you'd fit right in. Welcome to the AWS SBG NMIET Cloud OS.`,
      "color: #FF9900; font-weight: bold; font-family: monospace; font-size: 12px; line-height: 1.2;",
      "color: #FF9900; font-weight: bold; font-family: sans-serif; font-size: 12px; margin-top: 8px; display: block;"
    )

    // matchMedia is more reliable than innerWidth in DevTools responsive mode
    const mq = window.matchMedia("(max-width: 767px)")
    setIsMobile(mq.matches)

    if (!mq.matches) {
      ;(async () => {
        if (isSessionValid() || hasBootedThisSession()) {
          setStage("desktop")
          return
        }
        try {
          if (await refreshSession()) {
            setStage("desktop")
            return
          }
        } catch {
          /* fall through to the boot animation */
        }
        setStage("boot")
      })()
    }

    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
      if (!e.matches) setStage(s => (s === "checking" ? "desktop" : s))
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  // Stable identity so the desktop's open-guard effect doesn't re-run each render.
  const handleRequireSignIn = useCallback((appId: AppId) => {
    setPendingApp(appId)
    setLoginEntry("signin")
    setStage("login")
  }, [])

  const handleLogout = useCallback(() => {
    setPendingApp(null)
    setInitialApp(null)
    setLoginEntry("lock")
    setStage("login")
  }, [])

  const handleLogin = useCallback(() => {
    // Only reopen the requested app if the visitor actually signed in.
    setInitialApp(pendingApp && isSessionValid() ? pendingApp : null)
    setPendingApp(null)
    setStage("desktop")
  }, [pendingApp])

  // Blank screen while detecting device type
  if (isMobile === null) {
    return <main className="wallpaper h-screen w-screen" />
  }

  // ── Mobile ──────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <MobileOS />
        <ScreenBrightnessOverlay />
      </>
    )
  }

  // ── Desktop ─────────────────────────────────────────────────────────────────
  if (stage === "checking") {
    return (
      <>
        <main className="wallpaper h-screen w-screen" />
        <ScreenBrightnessOverlay />
      </>
    )
  }

  return (
    <>
      <main className="h-screen w-screen overflow-hidden">
        <AnimatePresence mode="wait">
          {stage === "boot" && (
            <motion.div
              key="boot"
              className="absolute inset-0"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <BootScreen
                onComplete={() => {
                  markBooted()
                  setStage("desktop")
                }}
              />
            </motion.div>
          )}

          {stage === "login" && (
            <motion.div
              key="login"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.45 }}
            >
              <LoginScreen onLogin={handleLogin} initialPhase={loginEntry} />
            </motion.div>
          )}

          {stage === "desktop" && (
            <motion.div
              key="desktop"
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <DesktopContainer onLogout={handleLogout} onRequireSignIn={handleRequireSignIn} initialApp={initialApp} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <ScreenBrightnessOverlay />
    </>
  )
}
