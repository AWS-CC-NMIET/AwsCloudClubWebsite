// components/os/desktop-container.tsx
// Complete macOS-style Desktop environment

"use client"

import React, { useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import {
  useWindowStore,
  windowActions,
  selectFocusedApp,
} from "@/lib/aws-store"
import type { AppId } from "@/lib/aws-apps"
import { AwsMenuBar } from "./aws-menubar"
import { AwsDock } from "./aws-dock"
import { AwsDesktop } from "./aws-desktop"
import { AppWindow } from "./aws-window"
import { AppDispatcher } from "@/components/apps/app-dispatcher"

export function DesktopContainer({
  onLogout,
  onRequireSignIn,
}: {
  onLogout?: () => void
  onRequireSignIn?: () => void
}) {
  const windows = useWindowStore(s => s.windows)
  const zOrder = useWindowStore(s => s.zOrder)
  const focusedAppId = selectFocusedApp({ windows, zOrder })

  // Open AWS flagship overview window on first arrival if no windows are open
  useEffect(() => {
    const activeKeys = Object.keys(windows)
    if (activeKeys.length === 0) {
      // Small timeout for smooth entrance
      const timer = setTimeout(() => {
        windowActions.open("aws")
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden select-none">
      {/* ── Top Translucent macOS Menu Bar ──────────────────────────────────── */}
      <AwsMenuBar onLockScreen={onLogout} />

      {/* ── Desktop Canvas (Wallpapers, Watermark, Widgets) ─────────────────── */}
      <AwsDesktop>
        {/* Render Active Windows */}
        <div className="pointer-events-none fixed inset-0 z-[100]" aria-live="polite">
          <AnimatePresence>
            {Object.keys(windows).map(appIdStr => {
              const appId = appIdStr as AppId
              const win = windows[appId]
              if (!win) return null

              return (
                <AppWindow
                  key={appId}
                  id={appId}
                  zIndex={100 + zOrder.indexOf(appId)}
                  focused={focusedAppId === appId}
                >
                  <AppDispatcher appId={appId} payload={win.payload} onLogout={onLogout} />
                </AppWindow>
              )
            })}
          </AnimatePresence>
        </div>
      </AwsDesktop>

      {/* ── Floating macOS Dock ──────────────────────────────────────────────── */}
      <AwsDock />
    </div>
  )
}
