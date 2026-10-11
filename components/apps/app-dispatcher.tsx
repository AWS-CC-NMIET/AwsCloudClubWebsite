// components/apps/app-dispatcher.tsx
// Maps an AppId to its application. Every app except the Home window is
// code-split, so the first page load only ships the shell + Home.

"use client"

import React, { lazy, Suspense } from "react"
import type { AppId } from "@/lib/aws-apps"
import { AwsFlagshipApp } from "./aws-flagship-app"
import { LoadingState } from "./shared/mac-ui"

const named = <T extends string>(loader: () => Promise<Record<T, React.ComponentType<any>>>, name: T) =>
  lazy(() => loader().then(m => ({ default: m[name] })))

const AboutApp = named(() => import("./about-app"), "AboutApp")
const TeamApp = named(() => import("./team-app"), "TeamApp")
const CalendarApp = named(() => import("./calendar-app"), "CalendarApp")
const FinderApp = named(() => import("./finder-app"), "FinderApp")
const SafariApp = named(() => import("./safari-app"), "SafariApp")
const PhotosApp = named(() => import("./photos-app"), "PhotosApp")
const AchievementsApp = named(() => import("./achievements-app"), "AchievementsApp")
const SocialApp = named(() => import("./social-app"), "SocialApp")
const MailApp = named(() => import("./mail-app"), "MailApp")
const TerminalApp = named(() => import("./terminal-app"), "TerminalApp")
const NotesApp = named(() => import("./notes-app"), "NotesApp")
const MusicApp = named(() => import("./music-app"), "MusicApp")
const SettingsApp = named(() => import("./settings-app"), "SettingsApp")
const TrashApp = named(() => import("./trash-app"), "TrashApp")
const AssistantApp = named(() => import("./assistant-app"), "AssistantApp")
const AboutModal = named(() => import("./about-modal"), "AboutModal")
const ProfileApp = named(() => import("./profile-app"), "ProfileApp")
const AdminApp = named(() => import("./admin-app"), "AdminApp")

function renderApp(appId: AppId, payload: any, onLogout: () => void) {
  switch (appId) {
    case "about":
      return <AboutApp />
    case "team":
      return <TeamApp payload={payload} />
    case "calendar":
      return <CalendarApp payload={payload} />
    case "finder":
      return <FinderApp />
    case "safari":
      return <SafariApp />
    case "photos":
      return <PhotosApp />
    case "achievements":
      return <AchievementsApp />
    case "social":
      return <SocialApp />
    case "mail":
      return <MailApp />
    case "terminal":
      return <TerminalApp />
    case "notes":
      return <NotesApp />
    case "music":
      return <MusicApp />
    case "settings":
      return <SettingsApp payload={payload} />
    case "trash":
      return <TrashApp />
    case "assistant":
      return <AssistantApp />
    case "about-system":
      return <AboutModal />
    case "profile":
      return <ProfileApp onLogout={onLogout} />
    case "admin":
      return <AdminApp />
    case "aws":
    default:
      return <AwsFlagshipApp />
  }
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
  return (
    <Suspense fallback={<LoadingState label="Opening…" />}>
      {renderApp(appId, payload, onLogout ?? (() => {}))}
    </Suspense>
  )
}
