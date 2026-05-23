"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MobileLockscreen }  from "./mobile-lockscreen"
import { MobileHome }        from "./mobile-home"
import { LoginScreen }       from "@/components/os/login-screen"
import {
  isSessionValid, refreshSession,
  getAccessToken, parseJwtPayload,
} from "@/lib/auth-client"

type MobileStage = "checking" | "lockscreen" | "login" | "home"

export function MobileOS() {
  const [stage,        setStage]        = useState<MobileStage>("checking")
  const [sessionValid, setSessionValid] = useState(false)
  const [isAdmin,      setIsAdmin]      = useState(false)

  // Check if there's a valid session on mount
  useEffect(() => {
    async function check() {
      let valid = isSessionValid()
      if (!valid) {
        try { valid = await refreshSession() } catch { /* fall through */ }
      }
      setSessionValid(valid)
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

  // Swipe-up from lock screen:
  //   already logged in  →  go directly to home
  //   not logged in      →  show login form
  const handleUnlock = () => setStage(sessionValid ? "home" : "login")

  const handleLogin = () => {
    setSessionValid(true)
    refreshAdmin()
    setStage("home")
  }

  const handleLogout = () => {
    setSessionValid(false)
    setIsAdmin(false)
    setStage("lockscreen")
  }

  // Blank screen while checking session (avoids flash)
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

        {stage === "login" && (
          <motion.div
            key="login"
            className="absolute inset-0"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            {/* Skip the lock-screen phase — jump straight to sign-in */}
            <LoginScreen onLogin={handleLogin} initialPhase="signin" />
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
            <MobileHome onLogout={handleLogout} isAdmin={isAdmin} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
