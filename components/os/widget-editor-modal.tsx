// components/os/widget-editor-modal.tsx
// Authentic macOS / AWS Cloud Club "Edit Widgets" management modal

"use client"

import React, { useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  useWidgetStore,
  widgetActions,
  WIDGET_DEFINITIONS,
  type WidgetId,
} from "@/lib/aws-widgets"
import {
  Activity,
  Clock,
  Calendar,
  Radio,
  FolderGit2,
  Award,
  Check,
  Plus,
} from "lucide-react"

const WIDGET_ICONS: Record<WidgetId, React.ComponentType<{ className?: string }>> = {
  "aws-status": Activity,
  "clock-cities": Clock,
  calendar: Calendar,
  "now-playing": Radio,
  portfolio: FolderGit2,
  certifications: Award,
}

export function WidgetEditorModal() {
  const editorOpen = useWidgetStore(s => s.editorOpen)
  const activeWidgets = useWidgetStore(s => s.widgets)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!editorOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        widgetActions.setEditorOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [editorOpen])

  return (
    <AnimatePresence>
      {editorOpen && (
        <div
          onPointerDown={e => {
            if (e.target === e.currentTarget) {
              widgetActions.setEditorOpen(false)
            }
          }}
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm select-none"
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 500, damping: 36 }}
            role="dialog"
            aria-label="Edit Widgets"
            className="flex max-h-[76vh] w-[580px] flex-col overflow-hidden rounded-2xl border border-black/10 bg-(--menu-bg) shadow-2xl backdrop-blur-2xl dark:border-white/15 text-(--os-text)"
          >
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-black/10 px-5 py-3.5 dark:border-white/10">
              <div>
                <h2 className="text-base font-bold text-(--os-text)">Desktop Widgets</h2>
                <p className="text-xs text-(--os-text-dim)">
                  Add, remove, or customize widgets on the desktop.
                </p>
              </div>
              <button
                onClick={() => widgetActions.setEditorOpen(false)}
                className="rounded-full bg-[#7940ea] px-4 py-1 text-xs font-semibold text-white shadow-sm hover:bg-[#8c4bff] transition-colors"
              >
                Done
              </button>
            </div>

            {/* Widget Catalog List */}
            <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3">
              {Object.values(WIDGET_DEFINITIONS).map(item => {
                const isAdded = activeWidgets.some(w => w.id === item.id)
                const Icon = WIDGET_ICONS[item.id]

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-xl border border-black/5 bg-black/[0.02] p-3 transition-colors hover:bg-black/[0.04] dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
                  >
                    {/* Icon Badge */}
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#7940ea]/15 text-[#7940ea] border border-[#7940ea]/20 shadow-xs">
                      <Icon className="size-5" />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-(--os-text)">{item.name}</p>
                        <span className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.2 font-mono text-[9px] uppercase tracking-wider text-(--os-text-dim)">
                          {item.defaultSize}
                        </span>
                      </div>
                      <p className="text-xs text-(--os-text-dim) leading-tight mt-0.5">
                        {item.description}
                      </p>
                    </div>

                    {/* Add / Added Button */}
                    <button
                      onClick={() => {
                        if (isAdded) {
                          widgetActions.remove(item.id)
                        } else {
                          widgetActions.add(item.id, item.defaultSize)
                        }
                      }}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                        isAdded
                          ? "bg-black/10 dark:bg-white/15 text-(--os-text-dim) hover:bg-red-500/15 hover:text-red-400"
                          : "bg-[#7940ea] text-white hover:bg-[#8c4bff] shadow-xs"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="size-3.5 stroke-[2.5]" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="size-3.5 stroke-[2.5]" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Modal Footer Note */}
            <div className="border-t border-black/10 dark:border-white/10 px-5 py-2.5 bg-black/[0.01] dark:bg-white/[0.01] text-[11px] text-(--os-text-dim)">
              <span>Right-click any widget on the desktop to change size or remove it.</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
