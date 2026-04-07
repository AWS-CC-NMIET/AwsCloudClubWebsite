"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { BootScreen } from "@/components/os/boot-screen"
import { LoginScreen } from "@/components/os/login-screen"
import { Desktop } from "@/components/os/desktop"

type Stage = "boot" | "login" | "desktop"

export default function CloudOS() {
  const [stage, setStage] = useState<Stage>("boot")

  return (
    <main className="h-screen w-screen overflow-hidden" style={{ background: "#EAE6FF" }}>
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
