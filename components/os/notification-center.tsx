"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Bell, X, Check, Trash2, Info, CheckCircle, AlertTriangle, Calendar } from "lucide-react"
import { useNotifications, type AppNotification, type NotificationType } from "@/lib/notifications-context"
import { formatDistanceToNow } from "date-fns"

const typeConfig: Record<NotificationType, { icon: React.ReactNode; color: string; bg: string }> = {
  info:    { icon: <Info className="h-4 w-4" />,          color: "#5BA8D8", bg: "rgba(91,168,216,0.12)" },
  success: { icon: <CheckCircle className="h-4 w-4" />,   color: "#50C88A", bg: "rgba(80,200,138,0.12)" },
  warning: { icon: <AlertTriangle className="h-4 w-4" />, color: "#FF9900", bg: "rgba(255,153,0,0.12)"  },
  event:   { icon: <Calendar className="h-4 w-4" />,      color: "#6B4FE8", bg: "rgba(107,79,232,0.12)" },
}

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

function NotificationItem({ n }: { n: AppNotification }) {
  const cfg = typeConfig[n.type]
  return (
    <motion.div
      className="flex gap-3 rounded-xl px-4 py-3"
      style={{
        background: n.read ? "transparent" : cfg.bg,
        borderLeft: n.read ? "none" : `3px solid ${cfg.color}`,
        borderBottom: "1px solid rgba(194,186,240,0.25)",
      }}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div
        className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full mt-0.5"
        style={{ background: cfg.bg, color: cfg.color }}
      >
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: "#1E1060" }}>{n.title}</p>
        <p className="text-xs leading-relaxed mt-0.5" style={{ color: "#7B6FC0" }}>{n.body}</p>
        <p className="text-[10px] mt-1 font-medium" style={{ color: "rgba(107,79,232,0.55)" }}>
          {formatDistanceToNow(n.time, { addSuffix: true })}
        </p>
      </div>
    </motion.div>
  )
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { notifications, unreadCount, markAllRead, clearAll } = useNotifications()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-2 bottom-16 z-40 flex flex-col rounded-2xl overflow-hidden"
            style={{
              width: "min(360px, calc(100vw - 16px))",
              maxHeight: "70vh",
              background: "rgba(234,230,255,0.98)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(194,186,240,0.60)",
              boxShadow: "0 20px 60px rgba(107,79,232,0.20), 8px 8px 24px #C2BAF0, -4px -4px 12px #FFFFFF",
            }}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring" as const, stiffness: 380, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid rgba(194,186,240,0.50)" }}>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" style={{ color: "#6B4FE8" }} />
                <span className="font-bold text-sm" style={{ color: "#1E1060" }}>Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: "#6B4FE8" }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <motion.button
                    onClick={markAllRead}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-xs"
                    style={{ color: "#6B4FE8", background: "rgba(107,79,232,0.10)" }}
                    whileTap={{ scale: 0.90 }}
                    title="Mark all read"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </motion.button>
                )}
                {notifications.length > 0 && (
                  <motion.button
                    onClick={clearAll}
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ color: "#9B8FC8", background: "rgba(107,79,232,0.06)" }}
                    whileTap={{ scale: 0.90 }}
                    title="Clear all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </motion.button>
                )}
                <motion.button
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ color: "#9B8FC8" }}
                  whileTap={{ scale: 0.90 }}
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12">
                  <Bell className="h-10 w-10 opacity-20" style={{ color: "#6B4FE8" }} />
                  <p className="text-sm font-medium" style={{ color: "#9B8FC8" }}>All caught up!</p>
                  <p className="text-xs" style={{ color: "rgba(155,143,200,0.70)" }}>No new notifications</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((n) => <NotificationItem key={n.id} n={n} />)}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
