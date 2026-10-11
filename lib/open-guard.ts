// lib/open-guard.ts
// Shared rule for opening apps that need an account (Profile) or admin rights
// (Admin). Used by both the desktop and the mobile shells.

"use client"

import { APPS_META, type AppId } from "@/lib/aws-apps"
import { systemActions } from "@/lib/aws-store"
import { getSession } from "@/lib/session"

export function createOpenGuard(onRequireSignIn: (appId: AppId) => void) {
  return (appId: AppId): boolean => {
    const meta = APPS_META[appId]
    if (!meta?.requiresAuth && !meta?.requiresAdmin) return true

    const session = getSession()
    if (!session.signedIn) {
      onRequireSignIn(appId)
      return false
    }
    if (meta.requiresAdmin && !session.isAdmin) {
      systemActions.showToast("The Admin panel is only available to club admins.")
      return false
    }
    return true
  }
}

/** Should this app be listed for the current session? (Admin is hidden from non-admins.) */
export function isAppVisible(appId: AppId, isAdmin: boolean) {
  return !APPS_META[appId]?.requiresAdmin || isAdmin
}
