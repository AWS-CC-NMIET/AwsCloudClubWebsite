"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { BootScreen } from "@/components/os/boot-screen"
import { LoginScreen } from "@/components/os/login-screen"
import { Desktop } from "@/components/os/desktop"
import { isSessionValid, refreshSession } from "@/lib/auth-client"

type Stage = "checking" | "boot" | "login" | "desktop"

export default function CloudOS() {
  const [stage, setStage] = useState<Stage>("checking")

  useEffect(() => {
    async function restoreSession() {
      if (isSessionValid()) {
        setStage("desktop")
        return
      }
      // Access token expired — try silent refresh with the refresh token
      try {
        const ok = await refreshSession()
        if (ok) { setStage("desktop"); return }
      } catch { /* fall through */ }
      // No valid session — show normal boot → login flow
      setStage("boot")
    }
    restoreSession()
  }, [])

  if (stage === "checking") {
    return <main className="h-screen w-screen" style={{ background: "#a4a4b6ff" }} />
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
            <LoginScreen onLogin={() => setStage("desktop")} />
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
            <Desktop onLogout={() => setStage("login")} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
