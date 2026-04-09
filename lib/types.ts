// ─────────────────────────────────────────────────────────────────────────────
// Shared application-level types
// Centralised here so desktop.tsx, taskbar.tsx, app-drawer.tsx, etc.
// never duplicate them.
// ─────────────────────────────────────────────────────────────────────────────

export type AppId =
  | "home" | "about" | "team" | "events" | "projects"
  | "resources" | "social" | "contact" | "achievements" | "terminal"
  | "profile" | "admin" | "gallery"

export interface WindowState {
  id: AppId
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
}

export interface AppMeta {
  id: AppId
  label: string
  icon: React.ReactNode
  gradient: string
}
