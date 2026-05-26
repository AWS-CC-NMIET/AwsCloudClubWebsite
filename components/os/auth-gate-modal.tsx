"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Lock, LogIn } from "lucide-react"
import type { AppId } from "@/lib/types"

// ── Per-app messages ──────────────────────────────────────────────────────────
const APP_MESSAGES: Partial<Record<AppId, string>> = {
  gallery:      "You need to be logged in to view the Gallery.",
  resources:    "You need to be logged in to access Resources.",
  achievements: "You need to be logged in to view Achievements.",
  profile:      "You need to be logged in to view your Profile & Leaderboard.",
  projects:     "You need to be logged in to view Projects or submit your own.",
  events:       "You need to be logged in to register for Contests & Events.",
}

const DEFAULT_MESSAGE = "You need to be logged in to access this section."

interface AuthGateModalProps {
  appId: AppId | null
  onSignIn: () => void
  onDismiss: () => void
}

export function AuthGateModal({ appId, onSignIn, onDismiss }: AuthGateModalProps) {
  const message = appId ? (APP_MESSAGES[appId] ?? DEFAULT_MESSAGE) : DEFAULT_MESSAGE

  return (
    <AnimatePresence>
      {appId !== null && (
        <>
          {/* Backdrop — macOS uses a very subtle dark scrim */}
          <motion.div
            key="auth-gate-backdrop"
            className="fixed inset-0 z-[9998]"
            style={{ background: "rgba(0,0,0,0.40)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onDismiss}
          />

          {/* Alert panel */}
          <motion.div
            key="auth-gate-modal"
            className="fixed z-[9999]"
            style={{ left: "50%", top: "50%", translateX: "-50%", translateY: "-50%" }}
            initial={{ opacity: 0, scale: 0.80 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.86 }}
            transition={{ type: "spring", stiffness: 460, damping: 32 }}
          >
            <div
              style={{
                width: 260,
                borderRadius: 12,
                background: "#ECECEC",
                boxShadow:
                  "0 22px 70px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(0,0,0,0.18)",
                overflow: "hidden",
              }}
            >
              {/* Body */}
              <div
                className="flex flex-col items-center text-center"
                style={{ padding: "20px 20px 16px" }}
              >
                {/* Lock icon — macOS uses the SF Symbols lock, we approximate it */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "linear-gradient(180deg, #7B61FF 0%, #5B3FD8 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                    boxShadow: "0 2px 8px rgba(91,63,216,0.35)",
                  }}
                >
                  <Lock style={{ width: 20, height: 20, color: "#fff", strokeWidth: 2.2 }} />
                </div>

                {/* Title */}
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#1c1c1e",
                    lineHeight: 1.3,
                    marginBottom: 5,
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
                  }}
                >
                  Sign In Required
                </p>

                {/* Message */}
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 400,
                    color: "#3c3c43cc",
                    lineHeight: 1.5,
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
                  }}
                >
                  {message}
                </p>
              </div>

              {/* Horizontal rule */}
              <div style={{ height: "0.5px", background: "rgba(0,0,0,0.14)" }} />

              {/* Buttons */}
              <div style={{ display: "flex", height: 44 }}>
                {/* Cancel */}
                <motion.button
                  onClick={onDismiss}
                  style={{
                    flex: 1,
                    fontSize: 13,
                    fontWeight: 400,
                    color: "#007AFF",
                    background: "transparent",
                    border: "none",
                    borderRight: "0.5px solid rgba(0,0,0,0.14)",
                    cursor: "pointer",
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
                  }}
                  whileHover={{ background: "rgba(0,0,0,0.04)" }}
                  whileTap={{ background: "rgba(0,0,0,0.08)" }}
                  transition={{ duration: 0.08 }}
                >
                  Cancel
                </motion.button>

                {/* Sign In — bold = default/primary action */}
                <motion.button
                  onClick={onSignIn}
                  style={{
                    flex: 1,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#007AFF",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
                  }}
                  whileHover={{ background: "rgba(0,0,0,0.04)" }}
                  whileTap={{ background: "rgba(0,0,0,0.08)" }}
                  transition={{ duration: 0.08 }}
                >
                  <LogIn style={{ width: 12, height: 12, strokeWidth: 2.5 }} />
                  Sign In
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
