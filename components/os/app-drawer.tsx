"use client"

import { AnimatePresence, motion } from "framer-motion"
import { LayoutGrid, X } from "lucide-react"
import type { AppId, AppMeta } from "@/lib/types"

interface AppDrawerProps {
  apps: AppMeta[]
  isOpen: boolean
  onClose: () => void
  onAppClick: (id: AppId) => void
}

/**
 * Mobile-only slide-in app drawer.
 * Always renders above open app windows (z:200/210) and the taskbar.
 */
export function AppDrawer({ apps, isOpen, onClose, onAppClick }: AppDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 sm:hidden"
            style={{
              background: "rgba(30,16,96,0.40)",
              backdropFilter: "blur(5px)",
              WebkitBackdropFilter: "blur(5px)",
              zIndex: 200,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            className="fixed left-0 top-0 bottom-14 sm:hidden hide-scrollbar"
            style={{
              width: 240,
              overflowY: "auto",
              zIndex: 210,
              background: "rgba(234,230,255,0.97)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderRight: "1px solid rgba(194,186,240,0.65)",
              boxShadow: "8px 0 36px rgba(107,79,232,0.20)",
            }}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring" as const, stiffness: 380, damping: 34 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(194,186,240,0.50)" }}
            >
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" style={{ color: "#6B4FE8" }} />
                <span className="text-base font-bold" style={{ color: "#1E1060" }}>All Apps</span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(107,79,232,0.12)", color: "#6B4FE8" }}
                >
                  {apps.length}
                </span>
              </div>
              <motion.button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{ background: "rgba(107,79,232,0.10)" }}
                whileTap={{ scale: 0.90 }}
                title="Close"
              >
                <X className="h-4 w-4" style={{ color: "#6B4FE8" }} />
              </motion.button>
            </div>

            {/* App grid */}
            <div className="grid grid-cols-2 gap-3 p-4">
              {apps.map((app, i) => (
                <motion.button
                  key={app.id}
                  onClick={() => { onAppClick(app.id); onClose() }}
                  className="flex flex-col items-center gap-2 rounded-2xl p-3"
                  style={{
                    background: "rgba(212,206,255,0.60)",
                    boxShadow: "4px 4px 12px #C2BAF0, -4px -4px 12px #FFFFFF",
                    touchAction: "manipulation",
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.035, type: "spring" as const, stiffness: 320, damping: 26 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                    style={{
                      background: app.gradient,
                      boxShadow: "3px 3px 10px rgba(107,79,232,0.30), -2px -2px 8px rgba(255,255,255,0.80)",
                    }}
                  >
                    {app.icon}
                  </div>
                  <span
                    className="text-[11px] font-semibold text-center leading-tight"
                    style={{ color: "#1E1060" }}
                  >
                    {app.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
