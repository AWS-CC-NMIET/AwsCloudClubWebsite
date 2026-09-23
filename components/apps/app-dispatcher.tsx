// components/apps/app-dispatcher.tsx
// Central dynamic dispatcher mapping AppId to the corresponding application

"use client"

import React, { lazy, Suspense } from "react"
import type { AppId } from "@/lib/aws-apps"

// macOS & iOS-style applications
import { AwsFlagshipApp } from "./aws-flagship-app"
import { FinderApp } from "./finder-app"
import { SafariApp } from "./safari-app"
import { AppStoreApp } from "./appstore-app"
import { NotesApp } from "./notes-app"
import { CalendarApp } from "./calendar-app"
import { MailApp } from "./mail-app"
import { MusicApp } from "./music-app"
import { PhotosApp } from "./photos-app"
import { MessagesApp } from "./messages-app"
import { TerminalApp } from "./terminal-app"
import { SettingsApp } from "./settings-app"
import { AboutModal } from "./about-modal"
import { TrashApp } from "./trash-app"
import { AssistantApp } from "./assistant-app"

// Lazy-loaded administrative & profile apps
const AdminApp = lazy(() => import("./admin-app").then(m => ({ default: m.AdminApp })))
const ProfileApp = lazy(() => import("./profile-app").then(m => ({ default: m.ProfileApp })))

function AppLoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center p-12 text-center bg-(--win-bg)">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 rounded-full border-2 border-(--accent) border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-(--os-text-dim)">Loading application...</span>
      </div>
    </div>
  )
}

export function AppDispatcher({
  appId,
  payload,
  onLogout,
}: {
  appId: AppId
  payload?: any
  onLogout?: () => void
}) {
  switch (appId) {
    case "aws":
      return <AwsFlagshipApp />
    case "finder":
      return <FinderApp />
    case "safari":
      return <SafariApp />
    case "appstore":
      return <AppStoreApp />
    case "notes":
      return <NotesApp />
    case "calendar":
      return <CalendarApp />
    case "mail":
      return <MailApp />
    case "music":
      return <MusicApp />
    case "photos":
      return <PhotosApp />
    case "messages":
      return <MessagesApp />
    case "terminal":
      return <TerminalApp />
    case "settings":
      return <SettingsApp payload={payload} />
    case "about":
      return <AboutModal />
    case "trash":
      return <TrashApp />
    case "assistant":
      return <AssistantApp />
    case "admin":
      return (
        <Suspense fallback={<AppLoadingFallback />}>
          <AdminApp />
        </Suspense>
      )
    case "profile":
      return (
        <Suspense fallback={<AppLoadingFallback />}>
          <ProfileApp onLogout={onLogout || (() => {})} />
        </Suspense>
      )
    default:
      return <AwsFlagshipApp />
  }
}
