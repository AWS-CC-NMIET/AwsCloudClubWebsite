// components/apps/shared/mac-ui.tsx
// Shared macOS-style building blocks for app windows and iOS sheets.
//
// Every app root uses <AppShell>, which is a Tailwind container. Layouts switch
// on the *window* width (`@xl:` ≈ 576px), not the viewport, so the same app
// works in a narrow desktop window and in a full-screen iOS sheet.

"use client"

import React from "react"
import { ChevronLeft, Loader2, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function AppShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("@container flex h-full w-full min-h-0 bg-(--win-bg) text-(--os-text)", className)}>
      {children}
    </div>
  )
}

/** Left source list. Hidden on narrow windows when `hideOnNarrow` is set. */
export function Sidebar({
  children,
  className,
  hideOnNarrow = false,
}: {
  children: React.ReactNode
  className?: string
  hideOnNarrow?: boolean
}) {
  return (
    <aside
      className={cn(
        "w-full shrink-0 flex-col gap-4 overflow-y-auto border-(--win-divider) bg-black/[0.03] p-3 dark:bg-white/[0.03] @xl:flex @xl:w-56 @xl:border-r",
        hideOnNarrow ? "hidden" : "flex",
        className
      )}
    >
      {children}
    </aside>
  )
}

export function SidebarSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      {title && (
        <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-(--os-text-dim)">{title}</p>
      )}
      {children}
    </div>
  )
}

export function SidebarItem({
  icon: Icon,
  label,
  count,
  active,
  onClick,
  iconClassName,
}: {
  icon?: LucideIcon
  label: string
  count?: number | string
  active?: boolean
  onClick?: () => void
  iconClassName?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] font-medium transition-colors",
        active ? "bg-(--accent) text-white" : "text-(--os-text) hover:bg-black/5 dark:hover:bg-white/10"
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        {Icon && <Icon className={cn("size-4 shrink-0", active ? "text-white" : iconClassName ?? "text-(--accent)")} />}
        <span className="truncate">{label}</span>
      </span>
      {count !== undefined && (
        <span className={cn("text-[11px] tabular-nums", active ? "text-white/80" : "text-(--os-text-dim)")}>{count}</span>
      )}
    </button>
  )
}

/** Horizontal chip filter — the narrow-window replacement for a sidebar. */
export function ChipBar<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { id: T; label: string; count?: number }[]
  value: T
  onChange: (id: T) => void
  className?: string
}) {
  return (
    <div className={cn("flex shrink-0 gap-2 overflow-x-auto px-3 py-2 @xl:hidden", className)}>
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
            value === opt.id
              ? "border-transparent bg-(--accent) text-white"
              : "border-(--win-divider) bg-black/[0.03] text-(--os-text) dark:bg-white/[0.05]"
          )}
        >
          {opt.label}
          {opt.count !== undefined && <span className="opacity-70 tabular-nums">{opt.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function Toolbar({
  title,
  subtitle,
  left,
  right,
  className,
}: {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  left?: React.ReactNode
  right?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex h-12 shrink-0 items-center justify-between gap-3 border-b border-(--win-divider) px-4",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {left}
        {(title || subtitle) && (
          <div className="min-w-0 leading-tight">
            {title && <h2 className="truncate text-[13px] font-semibold text-(--os-text)">{title}</h2>}
            {subtitle && <p className="truncate text-[11px] text-(--os-text-dim)">{subtitle}</p>}
          </div>
        )}
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </div>
  )
}

/** "‹ Back" — only rendered on narrow windows (list → detail navigation). */
export function BackButton({ onClick, label = "Back" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="-ml-1 flex items-center gap-0.5 rounded-md px-1 py-0.5 text-[13px] font-medium text-(--accent) hover:bg-black/5 dark:hover:bg-white/10 @xl:hidden"
    >
      <ChevronLeft className="size-4" />
      {label}
    </button>
  )
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex h-full min-h-48 w-full flex-col items-center justify-center gap-3 p-8 text-(--os-text-dim)">
      <Loader2 className="size-6 animate-spin text-(--accent)" />
      <span className="text-xs">{label}</span>
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: LucideIcon
  title: string
  message?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="flex h-full min-h-48 w-full flex-col items-center justify-center gap-2 p-8 text-center">
      <div className="mb-1 flex size-12 items-center justify-center rounded-2xl bg-(--accent)/10">
        <Icon className="size-6 text-(--accent)" />
      </div>
      <p className="text-sm font-semibold text-(--os-text)">{title}</p>
      {message && <p className="max-w-xs text-xs leading-relaxed text-(--os-text-dim)">{message}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  )
}

const BUTTON_VARIANTS = {
  primary: "bg-(--accent) text-white hover:brightness-110 shadow-sm",
  aws: "bg-[#FF9900] text-[#1a1206] hover:brightness-105 shadow-sm",
  secondary:
    "border border-(--win-divider) bg-black/[0.04] text-(--os-text) hover:bg-black/[0.08] dark:bg-white/[0.07] dark:hover:bg-white/[0.12]",
}

export function MacButton({
  children,
  variant = "secondary",
  href,
  onClick,
  className,
  type = "button",
  disabled,
}: {
  children: React.ReactNode
  variant?: keyof typeof BUTTON_VARIANTS
  href?: string
  onClick?: () => void
  className?: string
  type?: "button" | "submit"
  disabled?: boolean
}) {
  const cls = cn(
    "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all disabled:opacity-50",
    BUTTON_VARIANTS[variant],
    className
  )
  if (href) {
    const external = /^https?:|^mailto:/.test(href)
    return (
      <a href={href} className={cls} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    )
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  )
}

/** Small notice shown when an app is displaying cached/fallback data. */
export function OfflineNotice({ show, children }: { show: boolean; children?: React.ReactNode }) {
  if (!show) return null
  return (
    <div className="mx-3 mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-700 dark:text-amber-300">
      {children ?? "Live data is temporarily unavailable — showing saved content."}
    </div>
  )
}
