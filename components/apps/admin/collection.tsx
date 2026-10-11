// components/apps/admin/collection.tsx
// Generic list + inspector editor for an admin-managed collection.

"use client"

import React, { useCallback, useMemo, useState } from "react"
import { AlertTriangle, ChevronRight, Plus, RotateCw, Search, type LucideIcon } from "lucide-react"
import { systemActions } from "@/lib/aws-store"
import { cn } from "@/lib/utils"
import { useLoad } from "@/lib/use-load"
import { BackButton, EmptyState, LoadingState, MacButton } from "../shared/mac-ui"
import { defaultValue, FormField, inputCls, type FieldDef } from "./fields"

export type Row = Record<string, unknown>

export interface CollectionConfig {
  title: string
  /** Singular noun for buttons and messages, e.g. "event" */
  noun: string
  icon: LucideIcon
  listKey: string
  list: () => Promise<Record<string, unknown>>
  create: (data: Row) => Promise<unknown>
  update: (id: string, data: Row) => Promise<unknown>
  remove: (id: string) => Promise<unknown>
  fields: FieldDef[]
  primary: (item: Row) => string
  secondary: (item: Row) => string
  thumbnail?: (item: Row) => string | undefined
  /** Only show items that match (e.g. gallery albums among events). */
  filter?: (item: Row) => boolean
  /** Extra values merged into every create/update (e.g. tags for gallery albums). */
  fixedValues?: Row
  /** Optional notice above the list (e.g. "import the roster"). */
  banner?: (items: Row[], reload: () => Promise<void>) => React.ReactNode
}

export function CollectionManager({ config }: { config: CollectionConfig }) {
  const fetchItems = useCallback(async () => {
    const data = await config.list()
    return ((data[config.listKey] as Row[]) ?? []).filter(i => (config.filter ? config.filter(i) : true))
  }, [config])
  const { data, error: loadError = "", loading, reload: load } = useLoad(fetchItems)
  const items = useMemo(() => data ?? [], [data])
  const status = loading ? "loading" : loadError ? "error" : "ready"
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | "new" | null>(null)
  const [form, setForm] = useState<Row>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)


  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(i => `${config.primary(i)} ${config.secondary(i)}`.toLowerCase().includes(q))
  }, [items, query, config])

  const selected = selectedId && selectedId !== "new" ? items.find(i => i.id === selectedId) : undefined
  const editing = selectedId !== null

  const openNew = () => {
    setForm(Object.fromEntries(config.fields.map(f => [f.key, defaultValue(f)])))
    setSelectedId("new")
    setSaveError("")
  }

  const openItem = (item: Row) => {
    setForm(Object.fromEntries(config.fields.map(f => [f.key, item[f.key] ?? defaultValue(f)])))
    setSelectedId(String(item.id))
    setSaveError("")
  }

  const save = async () => {
    setSaving(true)
    setSaveError("")
    const payload = { ...form, ...config.fixedValues }
    try {
      if (selectedId === "new") {
        const res = (await config.create(payload)) as Record<string, Row>
        const created = Object.values(res ?? {}).find(v => v && typeof v === "object" && "id" in v)
        systemActions.showToast(`Created ${config.noun}`)
        await load()
        if (created?.id) setSelectedId(String(created.id))
      } else if (selectedId) {
        await config.update(selectedId, payload)
        systemActions.showToast(`Saved ${config.noun}`)
        await load()
      }
    } catch (err) {
      setSaveError((err as Error).message || "Could not save")
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!selected) return
    setConfirmDelete(false)
    try {
      await config.remove(String(selected.id))
      systemActions.showToast(`Deleted ${config.noun}`)
      setSelectedId(null)
      await load()
    } catch (err) {
      setSaveError((err as Error).message || "Could not delete")
    }
  }

  const Icon = config.icon

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1">
      {/* ── List ──────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "min-w-0 flex-col border-(--win-divider) @4xl:flex @4xl:w-80 @4xl:flex-none @4xl:border-r",
          editing ? "hidden" : "flex flex-1"
        )}
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-(--win-divider) p-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-(--os-text-dim)" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={`Search ${config.title.toLowerCase()}`}
              aria-label={`Search ${config.title}`}
              className={cn(inputCls, "pl-8")}
            />
          </div>
          <button onClick={load} aria-label="Refresh" className="rounded-md p-1.5 text-(--os-text-dim) hover:bg-black/5 dark:hover:bg-white/10">
            <RotateCw className={cn("size-4", status === "loading" && "animate-spin")} />
          </button>
          <MacButton variant="primary" onClick={openNew} className="px-2.5 py-1.5">
            <Plus className="size-3.5" /> New
          </MacButton>
        </div>

        {status === "ready" && config.banner?.(items, load)}
        <div className="flex-1 overflow-y-auto p-1.5">
          {status === "loading" && items.length === 0 ? (
            <LoadingState />
          ) : status === "error" && items.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title={`Couldn't load ${config.title.toLowerCase()}`}
              message={loadError}
              action={<MacButton onClick={load}>Try Again</MacButton>}
            />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={Icon}
              title={query ? "No matches" : `No ${config.title.toLowerCase()} yet`}
              action={!query && <MacButton variant="primary" onClick={openNew}>Add the first {config.noun}</MacButton>}
            />
          ) : (
            visible.map(item => {
              const active = item.id === selectedId
              const thumb = config.thumbnail?.(item)
              return (
                <button
                  key={String(item.id)}
                  onClick={() => openItem(item)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                    active ? "bg-(--accent) text-white" : "hover:bg-black/5 dark:hover:bg-white/10"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg",
                      active ? "bg-white/20" : "bg-(--accent)/10"
                    )}
                  >
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt="" className="size-full object-cover" />
                    ) : (
                      <Icon className={cn("size-4", active ? "text-white" : "text-(--accent)")} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">{config.primary(item) || "Untitled"}</p>
                    <p className={cn("truncate text-[11px]", active ? "text-white/75" : "text-(--os-text-dim)")}>{config.secondary(item)}</p>
                  </div>
                  <ChevronRight className="size-3.5 shrink-0 opacity-40 @4xl:hidden" />
                </button>
              )
            })
          )}
        </div>
        <p className="shrink-0 border-t border-(--win-divider) px-3 py-1.5 text-center text-[11px] text-(--os-text-dim)">
          {items.length} {items.length === 1 ? config.noun : config.title.toLowerCase()}
        </p>
      </div>

      {/* ── Inspector ─────────────────────────────────────────────────────── */}
      <div className={cn("min-w-0 flex-1 flex-col @4xl:flex", editing ? "flex" : "hidden")}>
        {editing ? (
          <>
            <div className="flex h-12 shrink-0 items-center gap-2 border-b border-(--win-divider) px-4">
              <span className="@4xl:hidden">
                <BackButton onClick={() => setSelectedId(null)} label={config.title} />
              </span>
              <h3 className="truncate text-[13px] font-semibold">
                {selectedId === "new" ? `New ${config.noun}` : config.primary(selected ?? form) || `Edit ${config.noun}`}
              </h3>
            </div>
            <form
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={e => {
                e.preventDefault()
                save()
              }}
            >
              <div className="flex-1 overflow-y-auto p-5">
                <div className="mx-auto grid max-w-2xl gap-4 @2xl:grid-cols-2">
                  {config.fields.map(field => (
                    <FormField key={field.key} field={field} value={form[field.key]} onChange={v => setForm(f => ({ ...f, [field.key]: v }))} />
                  ))}
                </div>
              </div>
              {saveError && (
                <p className="mx-5 mb-2 flex items-center gap-2 rounded-md border border-red-500/25 bg-red-500/10 px-3 py-2 text-[12px] text-red-600 dark:text-red-400">
                  <AlertTriangle className="size-4 shrink-0" /> {saveError}
                </p>
              )}
              <div className="flex shrink-0 items-center gap-2 border-t border-(--win-divider) px-5 py-3">
                {selectedId !== "new" && (
                  <button type="button" onClick={() => setConfirmDelete(true)} className="text-[12px] font-semibold text-red-500 hover:underline">
                    Delete {config.noun}…
                  </button>
                )}
                <span className="flex-1" />
                <MacButton onClick={() => setSelectedId(null)}>Cancel</MacButton>
                <MacButton variant="primary" type="submit" disabled={saving}>
                  {saving ? "Saving…" : selectedId === "new" ? `Create ${config.noun}` : "Save"}
                </MacButton>
              </div>
            </form>
          </>
        ) : (
          <EmptyState icon={Icon} title={`Select a ${config.noun}`} message={`Or create a new ${config.noun} with the + New button.`} />
        )}
      </div>

      {/* ── Delete confirmation (macOS alert) ─────────────────────────────── */}
      {confirmDelete && selected && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px]">
          <div role="alertdialog" aria-modal="true" className="w-full max-w-xs glass-strong rim rounded-2xl p-5 text-center shadow-2xl">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-red-500/10">
              <AlertTriangle className="size-6 text-red-500" />
            </div>
            <h4 className="text-[13px] font-bold">Delete “{config.primary(selected)}”?</h4>
            <p className="mt-1 text-[12px] text-(--os-text-dim)">This removes it from the website. You can’t undo this.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <MacButton onClick={() => setConfirmDelete(false)}>Cancel</MacButton>
              <button onClick={remove} className="rounded-lg bg-red-500 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
