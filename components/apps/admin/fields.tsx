// components/apps/admin/fields.tsx
// macOS-style form controls for the Admin editors.

"use client"

import React, { useRef, useState } from "react"
import { ImagePlus, Loader2, X } from "lucide-react"
import { ACCEPTED_IMAGE_TYPES, uploadImage } from "@/lib/image-upload"
import { systemActions } from "@/lib/aws-store"
import { cn } from "@/lib/utils"

export type UploadFolder = "events" | "team" | "projects" | "general"

export type FieldDef =
  | { key: string; label: string; type: "text" | "email" | "url" | "textarea" | "date"; required?: boolean; placeholder?: string; hint?: string; wide?: boolean }
  | { key: string; label: string; type: "number"; hint?: string; wide?: boolean }
  | { key: string; label: string; type: "select"; options: string[]; hint?: string; wide?: boolean }
  | { key: string; label: string; type: "toggle"; hint?: string; wide?: boolean }
  | { key: string; label: string; type: "tags"; placeholder?: string; hint?: string; wide?: boolean }
  | { key: string; label: string; type: "color"; hint?: string; wide?: boolean }
  | { key: string; label: string; type: "image" | "images"; folder: UploadFolder; hint?: string; wide?: boolean }

export function defaultValue(field: FieldDef): unknown {
  switch (field.type) {
    case "number":
      return 0
    case "toggle":
      return false
    case "tags":
    case "images":
      return []
    case "select":
      return field.options[0] ?? ""
    case "color":
      return "#FF9900"
    default:
      return ""
  }
}

export const inputCls =
  "w-full rounded-md border border-(--win-divider) bg-white px-2.5 py-1.5 text-[13px] text-(--os-text) shadow-xs outline-none transition-shadow placeholder:text-(--os-text-dim) focus:border-(--accent) focus:ring-3 focus:ring-(--accent)/25 dark:bg-white/[0.06]"

export function FormField({
  field,
  value,
  onChange,
}: {
  field: FieldDef
  value: unknown
  onChange: (value: unknown) => void
}) {
  const id = `field-${field.key}`
  const required = "required" in field && field.required

  let control: React.ReactNode
  switch (field.type) {
    case "textarea":
      control = (
        <textarea
          id={id}
          rows={5}
          value={String(value ?? "")}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={cn(inputCls, "resize-y leading-relaxed")}
        />
      )
      break
    case "number":
      control = (
        <input
          id={id}
          type="number"
          min={0}
          value={Number(value ?? 0)}
          onChange={e => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className={cn(inputCls, "max-w-32 tabular-nums")}
        />
      )
      break
    case "select":
      control = (
        <select id={id} value={String(value ?? "")} onChange={e => onChange(e.target.value)} className={cn(inputCls, "max-w-60")}>
          {field.options.map(o => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )
      break
    case "toggle":
      control = <Toggle id={id} checked={value === true || value === "true"} onChange={onChange} />
      break
    case "tags":
      control = <TagsInput id={id} value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} placeholder={field.placeholder} />
      break
    case "color":
      control = (
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label={field.label}
            value={/^#[0-9a-f]{6}$/i.test(String(value)) ? String(value) : "#FF9900"}
            onChange={e => onChange(e.target.value)}
            className="h-8 w-10 cursor-pointer rounded-md border border-(--win-divider) bg-transparent"
          />
          <input id={id} value={String(value ?? "")} onChange={e => onChange(e.target.value)} className={cn(inputCls, "max-w-28 font-mono")} />
        </div>
      )
      break
    case "image":
      control = <ImageField value={String(value ?? "")} onChange={onChange} folder={field.folder} />
      break
    case "images":
      control = <ImagesField value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} folder={field.folder} />
      break
    default:
      control = (
        <input
          id={id}
          type={field.type === "url" ? "url" : field.type}
          value={String(value ?? "")}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={required}
          className={inputCls}
        />
      )
  }

  return (
    <div className={cn("space-y-1.5", field.wide && "@2xl:col-span-2")}>
      <label htmlFor={id} className="block text-[12px] font-medium text-(--os-text)">
        {field.label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {control}
      {field.hint && <p className="text-[11px] text-(--os-text-dim)">{field.hint}</p>}
    </div>
  )
}

/** macOS switch */
export function Toggle({ id, checked, onChange }: { id?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-(--accent)" : "bg-black/15 dark:bg-white/20"
      )}
    >
      <span
        className={cn(
          "inline-block size-[18px] rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-[2px]"
        )}
      />
    </button>
  )
}

function TagsInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string
  value: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  const [draft, setDraft] = useState("")
  const commit = () => {
    const parts = draft.split(",").map(s => s.trim()).filter(Boolean)
    if (parts.length) onChange([...value, ...parts.filter(p => !value.includes(p))])
    setDraft("")
  }
  return (
    <div className={cn(inputCls, "flex min-h-9 flex-wrap items-center gap-1.5 py-1")}>
      {value.map(tag => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-(--accent)/12 px-1.5 py-0.5 text-[12px] font-medium text-(--accent)">
          {tag}
          <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(value.filter(t => t !== tag))}>
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            commit()
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={commit}
        placeholder={value.length ? "" : placeholder ?? "Type and press Enter"}
        className="min-w-24 flex-1 bg-transparent text-[13px] outline-none placeholder:text-(--os-text-dim)"
      />
    </div>
  )
}

function useUploader(folder: UploadFolder) {
  const [busy, setBusy] = useState(false)
  const upload = async (files: FileList | null): Promise<string[]> => {
    if (!files?.length) return []
    setBusy(true)
    const urls: string[] = []
    try {
      for (const file of Array.from(files)) urls.push(await uploadImage(folder, file))
    } catch (err) {
      systemActions.showToast((err as Error).message || "Upload failed")
    } finally {
      setBusy(false)
    }
    return urls
  }
  return { busy, upload }
}

function ImageField({ value, onChange, folder }: { value: string; onChange: (v: string) => void; folder: UploadFolder }) {
  const input = useRef<HTMLInputElement>(null)
  const { busy, upload } = useUploader(folder)
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-16 items-center justify-center overflow-hidden rounded-lg border border-(--win-divider) bg-black/[0.03] dark:bg-white/[0.05]">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          <ImagePlus className="size-5 text-(--os-text-dim)" />
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-md border border-(--win-divider) bg-white px-2.5 py-1 text-[12px] font-medium shadow-xs hover:bg-black/[0.03] disabled:opacity-60 dark:bg-white/[0.08]"
        >
          {busy && <Loader2 className="size-3.5 animate-spin" />}
          {busy ? "Uploading…" : value ? "Replace…" : "Choose Photo…"}
        </button>
        {value && !busy && (
          <button type="button" onClick={() => onChange("")} className="text-[12px] font-medium text-red-500 hover:underline">
            Remove
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        className="hidden"
        onChange={async e => {
          const [url] = await upload(e.target.files)
          e.target.value = ""
          if (url) onChange(url)
        }}
      />
    </div>
  )
}

function ImagesField({ value, onChange, folder }: { value: string[]; onChange: (v: string[]) => void; folder: UploadFolder }) {
  const input = useRef<HTMLInputElement>(null)
  const { busy, upload } = useUploader(folder)
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-2">
      {value.map((url, i) => (
        <div key={url + i} className="group relative aspect-square overflow-hidden rounded-lg border border-(--win-divider)">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="size-full object-cover" />
          <button
            type="button"
            aria-label="Remove photo"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
          >
            <X className="size-3" />
          </button>
        </div>
      ))}
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-(--win-divider) text-[11px] font-medium text-(--os-text-dim) hover:border-(--accent) hover:text-(--accent) disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
        {busy ? "Uploading" : "Add"}
      </button>
      <input
        ref={input}
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_TYPES}
        className="hidden"
        onChange={async e => {
          const urls = await upload(e.target.files)
          e.target.value = ""
          if (urls.length) onChange([...value, ...urls])
        }}
      />
    </div>
  )
}
