"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { BootScreen }  from "@/components/os/boot-screen"
import { LoginScreen } from "@/components/os/login-screen"
import { Desktop }     from "@/components/os/desktop"
import { MobileOS }    from "@/components/mobile/mobile-os"
import { isSessionValid, refreshSession } from "@/lib/auth-client"

type Stage = "checking" | "boot" | "login" | "desktop"
type LoginEntry = "lock" | "signin"

export default function CloudOS() {
  // null = device type not yet detected (avoids hydration mismatch)
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const [stage, setStage]       = useState<Stage>("checking")
  const [loginEntry, setLoginEntry] = useState<LoginEntry>("lock")

  useEffect(() => {
    // Console log easter egg ASCII Art
    console.log(
      `%c
   ▲   ▲   ▲   ▲   ▲   ▲   ▲   ▲
  / \\ / \\ / \\ / \\ / \\ / \\ / \\ / \\
 ( A | W | S |   | S | B | G |   )
  \\_/ \\_/ \\_/ \\_/ \\_/ \\_/ \\_/ \\_/
         _     _
     _ _| |_ _| |_ ___
    | | |  _| | | _|_ -|
    |___|_| |___|___|__|
          
      Student Builder Group
          
%cHey curious builder 👀 — you'd fit right in. DM us on Instagram.`,
      "color: #FF9900; font-weight: bold; font-family: monospace; font-size: 12px; line-height: 1.2;",
      "color: #6B4FE8; font-weight: bold; font-family: sans-serif; font-size: 12px; margin-top: 8px; display: block;"
    );

    // matchMedia is more reliable than innerWidth in DevTools responsive mode
    const mq     = window.matchMedia("(max-width: 767px)")
    const mobile = mq.matches
    setIsMobile(mobile)

    if (!mobile) {
      // Desktop-only: restore session and decide which stage to show
      async function restoreSession() {
        if (isSessionValid()) { setStage("desktop"); return }
        try {
          const ok = await refreshSession()
          if (ok) { setStage("desktop"); return }
        } catch { /* fall through */ }
        setStage("boot")
      }
      restoreSession()
    }
    // Mobile: MobileOS manages its own session-check internally

    // Re-detect on orientation change / resize (handles DevTools toggle)
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  // Blank screen while detecting device type (avoids flash)
  if (isMobile === null) {
    return <main className="h-screen w-screen" style={{ background: "#0a0a0f" }} />
  }

  // ── Mobile ──────────────────────────────────────────────────────────────────
  if (isMobile) {
    return <MobileOS />
  }

  // ── Desktop ─────────────────────────────────────────────────────────────────
  if (stage === "checking") {
    return <main className="h-screen w-screen" style={{ background: "#0a0a0f" }} />
  }

  return (
    <main className="h-screen w-screen overflow-hidden" style={{ background: "#0a0a0f" }}>
      <AnimatePresence mode="wait">

        {stage === "boot" && (
          <motion.div
            key="boot"
            className="absolute inset-0"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <BootScreen onComplete={() => setStage("login")} />
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
            <LoginScreen onLogin={() => setStage("desktop")} initialPhase={loginEntry} />
          </motion.div>
        )}

        {stage === "desktop" && (
          <motion.div
            key="desktop"
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Desktop
              onLogout={() => { setLoginEntry("lock"); setStage("login") }}
              onRequireSignIn={() => { setLoginEntry("signin"); setStage("login") }}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  )
}
