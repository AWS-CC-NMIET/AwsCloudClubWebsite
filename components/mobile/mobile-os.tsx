"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MobileLockscreen } from "./mobile-lockscreen"
import { MobileHome }       from "./mobile-home"
import {
  isSessionValid, refreshSession,
  getAccessToken, parseJwtPayload,
} from "@/lib/auth-client"

type MobileStage = "checking" | "lockscreen" | "home"

export function MobileOS() {
  const [stage,   setStage]   = useState<MobileStage>("checking")
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function check() {
      let valid = isSessionValid()
      if (!valid) {
        try { valid = await refreshSession() } catch { /* fall through */ }
      }
      if (valid) refreshAdmin()
      setStage("lockscreen")
    }
    check()
  }, [])

  function refreshAdmin() {
    const token = getAccessToken()
    if (!token) return
    const payload = parseJwtPayload(token)
    const groups  = (payload["cognito:groups"] as string[]) || []
    setIsAdmin(groups.includes("admins"))
  }

  // Swipe-up always goes straight to home — no login gate on mobile
  const handleUnlock = () => setStage("home")

  const handleLogout = () => {
    setIsAdmin(false)
    setStage("lockscreen")
  }

  if (stage === "checking") {
    return <div className="fixed inset-0" style={{ background: "#050310" }} />
  }

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#050310" }}>
      <AnimatePresence mode="wait">

        {stage === "lockscreen" && (
          <motion.div
            key="lockscreen"
            className="absolute inset-0"
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
          >
            <MobileLockscreen onUnlock={handleUnlock} />
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
            <MobileHome
              onLogout={handleLogout}
              onRequireSignIn={() => {/* auth gate modal handles this */}}
              isAdmin={isAdmin}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
