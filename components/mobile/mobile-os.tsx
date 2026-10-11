// components/mobile/mobile-os.tsx
// Mobile OS host: lock screen → iOS SpringBoard, with a sign-in sheet for
// apps that require an account (Profile, Admin).

"use client"

import React, { useCallback, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { MobileLockscreen } from "./mobile-lockscreen"
import { SpringBoard } from "./aws-springboard"
import { AppDispatcher } from "@/components/apps/app-dispatcher"
import { LoginScreen } from "@/components/os/login-screen"
import { setOpenGuard, windowActions } from "@/lib/aws-store"
import { APPS_META, type AppId } from "@/lib/aws-apps"
import { isSessionValid, refreshSession } from "@/lib/auth-client"

type MobileStage = "checking" | "lockscreen" | "home"

export function MobileOS() {
  const [stage, setStage] = useState<MobileStage>("checking")
  const [signInFor, setSignInFor] = useState<AppId | null>(null)

  useEffect(() => {
    ;(async () => {
      if (!isSessionValid()) {
        try {
          await refreshSession()
        } catch {
          /* guests are welcome */
        }
      }
      setStage("lockscreen")
    })()
  }, [])

  // Sign-in-only apps open the sign-in sheet for guests.
  useEffect(
    () =>
      setOpenGuard(appId => {
        if (!APPS_META[appId]?.requiresAuth || isSessionValid()) return true
        setSignInFor(appId)
        return false
      }),
    []
  )

  const handleLogout = useCallback(() => {
    windowActions.closeAll()
    setStage("lockscreen")
  }, [])

  const handleSignedIn = useCallback(() => {
    const target = signInFor
    setSignInFor(null)
    if (target && isSessionValid()) windowActions.open(target)
  }, [signInFor])

  if (stage === "checking") {
    return <div className="wallpaper fixed inset-0" />
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#050310]">
      <AnimatePresence mode="wait">
        {stage === "lockscreen" && (
          <motion.div key="lockscreen" className="absolute inset-0" exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25 }}>
            <MobileLockscreen onUnlock={() => setStage("home")} />
          </motion.div>
        )}

        {stage === "home" && (
          <motion.div
            key="home"
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
          >
            <SpringBoard renderAppContent={appId => <AppDispatcher appId={appId} onLogout={handleLogout} />} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sign-in sheet ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {signInFor && (
          <motion.div
            key="signin"
            className="fixed inset-0 z-[1500]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
          >
            <LoginScreen initialPhase="signin" onLogin={handleSignedIn} />
            <button
              onClick={() => setSignInFor(null)}
              aria-label="Cancel sign in"
              className="absolute left-4 top-[max(1rem,env(safe-area-inset-top))] z-20 flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md"
            >
              <X className="size-3.5" /> Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
