// components/os/system-toast.tsx
// System toast banner — shared by the desktop and the iOS SpringBoard

"use client"

import React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import { useSystemStore } from "@/lib/aws-store"

export function SystemToast({ placement = "top-right" }: { placement?: "top-right" | "top-center" }) {
  const message = useSystemStore(s => s.toast)
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message}
          role="status"
          initial={{ opacity: 0, y: -24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className={
            placement === "top-center"
              ? "fixed inset-x-4 top-[calc(env(safe-area-inset-top)+3.25rem)] z-[1300] mx-auto flex max-w-sm items-center gap-3 glass-strong rim rounded-2xl px-4 py-3 text-xs font-semibold text-(--os-text)"
              : "fixed right-6 top-10 z-[1300] flex max-w-sm items-center gap-3 glass-strong rim rounded-2xl px-4 py-2.5 text-xs font-semibold text-(--os-text)"
          }
        >
          <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
