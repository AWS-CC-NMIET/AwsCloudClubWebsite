// components/os/desktop-container.tsx
// macOS desktop: menu bar, wallpaper + widgets, windows and the dock

"use client"

import React, { useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { useWindowStore, windowActions, selectFocusedApp, setOpenGuard } from "@/lib/aws-store"
import type { AppId } from "@/lib/aws-apps"
import { createOpenGuard } from "@/lib/open-guard"
import { AwsMenuBar } from "./aws-menubar"
import { AwsDock } from "./aws-dock"
import { AwsDesktop } from "./aws-desktop"
import { AppWindow } from "./aws-window"
import { AppDispatcher } from "@/components/apps/app-dispatcher"

export function DesktopContainer({
  onLogout,
  onRequireSignIn,
  initialApp,
}: {
  onLogout?: () => void
  /** Called when a sign-in-only app is opened without a session. */
  onRequireSignIn?: (appId: AppId) => void
  /** App to open once the desktop appears (e.g. after signing in). */
  initialApp?: AppId | null
}) {
  const windows = useWindowStore(s => s.windows)
  const zOrder = useWindowStore(s => s.zOrder)
  const focusedAppId = selectFocusedApp({ windows, zOrder })

  // Profile needs an account; Admin needs the admins group.
  useEffect(() => setOpenGuard(createOpenGuard(appId => onRequireSignIn?.(appId))), [onRequireSignIn])

  // Open the requested app, or the Home window on first arrival.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (initialApp) windowActions.open(initialApp)
      else if (Object.keys(useWindowStore.getState().windows).length === 0) windowActions.open("aws")
    }, 300)
    return () => clearTimeout(timer)
  }, [initialApp])

  // Keep windows on-screen when the browser window is resized.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(timer)
      timer = setTimeout(windowActions.reflow, 120)
    }
    window.addEventListener("resize", onResize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <div className="fixed inset-0 select-none overflow-hidden">
      <AwsMenuBar onLockScreen={onLogout} />

      <AwsDesktop>
        <div className="pointer-events-none fixed inset-0 z-[100]">
          <AnimatePresence>
            {Object.keys(windows).map(key => {
              const appId = key as AppId
              const win = windows[appId]
              if (!win) return null
              return (
                <AppWindow key={appId} id={appId} zIndex={100 + zOrder.indexOf(appId)} focused={focusedAppId === appId}>
                  <AppDispatcher appId={appId} payload={win.payload} onLogout={onLogout} />
                </AppWindow>
              )
            })}
          </AnimatePresence>
        </div>
      </AwsDesktop>

      <AwsDock />
    </div>
  )
}
