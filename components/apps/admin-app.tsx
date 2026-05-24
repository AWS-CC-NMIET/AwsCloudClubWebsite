"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Calendar, Users, FolderOpen, Trophy,
  BookOpen, Share2, Settings, Mail, Shield, Plus, Edit3,
  Trash2, Save, X, Upload, CheckCircle2, AlertCircle,
  RefreshCw, Loader2, Image as ImageIcon,
} from "lucide-react"
import { api, uploadFileToS3 } from "@/lib/api-client"

type AdminTab =
  | "dashboard" | "events" | "team" | "projects"
  | "achievements" | "resources" | "social" | "config" | "contacts" | "users" | "gallery"

const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard",    label: "Dashboard",    icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
  { id: "events",       label: "Events",       icon: <Calendar className="h-3.5 w-3.5" /> },
  { id: "gallery",      label: "Gallery",      icon: <ImageIcon className="h-3.5 w-3.5" /> },
  { id: "team",         label: "Team",         icon: <Users className="h-3.5 w-3.5" /> },
  { id: "projects",     label: "Projects",     icon: <FolderOpen className="h-3.5 w-3.5" /> },
  { id: "achievements", label: "Achievements", icon: <Trophy className="h-3.5 w-3.5" /> },
  { id: "resources",    label: "Resources",    icon: <BookOpen className="h-3.5 w-3.5" /> },
  { id: "social",       label: "Social",       icon: <Share2 className="h-3.5 w-3.5" /> },
  { id: "config",       label: "Config",       icon: <Settings className="h-3.5 w-3.5" /> },
  { id: "contacts",     label: "Contacts",     icon: <Mail className="h-3.5 w-3.5" /> },
  { id: "users",        label: "Users",        icon: <Shield className="h-3.5 w-3.5" /> },
]

// ── Shared style constants ─────────────────────────────────────
const CARD = "rounded-xl border" as const
const CARD_BG = { background: "rgba(107,79,232,0.05)", border: "1px solid rgba(107,79,232,0.13)" }
const CARD_BG_HOVER = { background: "rgba(107,79,232,0.09)", border: "1px solid rgba(107,79,232,0.20)" }
const INPUT_STYLE: React.CSSProperties = {
  background: "rgba(183,168,250,0.65)",
  boxShadow: "inset 2px 2px 6px rgba(107,79,232,0.18), inset -2px -2px 6px rgba(255,255,255,0.55)",
  border: "1px solid rgba(107,79,232,0.14)",
  outline: "none",
  borderRadius: "0.625rem",
  padding: "0.5rem 0.75rem",
  color: "#1E1060",
  width: "100%",
  fontSize: "0.82rem",
}
const TEXTAREA_STYLE: React.CSSProperties = { ...INPUT_STYLE, resize: "none" }

// ── Toast ──────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <motion.div
      className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-xl"
      style={{ background: type === "success" ? "#50C88A" : "#E85555" }}
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
    >
      {type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      {message}
    </motion.div>
  )
}

// ── Section header ─────────────────────────────────────────────
function SectionHeader({ title, sub, action }: { title: string; sub: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h2 className="text-base font-bold" style={{ color: "#1E1060" }}>{title}</h2>
        <p className="text-xs mt-0.5" style={{ color: "#9B8FC8" }}>{sub}</p>
      </div>
      {action}
    </div>
  )
}

// ── Primary button ─────────────────────────────────────────────
function PrimaryBtn({ onClick, disabled, children, className = "" }: {
  onClick?: () => void; disabled?: boolean; children: React.ReactNode; className?: string
}) {
  return (
    <motion.button
      onClick={onClick} disabled={disabled}
      className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white disabled:opacity-60 ${className}`}
      style={{ background: "linear-gradient(135deg,#6B4FE8,#8B6FFF)", boxShadow: "0 4px 14px rgba(107,79,232,0.35)" }}
      whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  )
}

// ── Icon button ─────────────────────────────────────────────────
function IconBtn({ onClick, title, children, danger }: {
  onClick?: () => void; title?: string; children: React.ReactNode; danger?: boolean
}) {
  return (
    <motion.button
      onClick={onClick} title={title}
      className="flex h-8 w-8 items-center justify-center rounded-xl"
      style={danger
        ? { background: "rgba(232,85,85,0.10)" }
        : { background: "rgba(107,79,232,0.08)", border: "1px solid rgba(107,79,232,0.12)" }
      }
      whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
    >
      {children}
    </motion.button>
  )
}

// ── Image Upload Button ─────────────────────────────────────────
function ImageUpload({ onUploaded, folder, current }: {
  onUploaded: (url: string) => void
  folder: "events" | "team" | "projects" | "general"
  current?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadFileToS3(folder, file)
      onUploaded(url)
    } catch (err) {
      console.error("Upload failed:", err)
    } finally { setUploading(false) }
  }

  return (
    <div className="flex items-center gap-2">
      {current && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={current} alt="Current" className="h-10 w-10 rounded-lg object-cover border border-white/40" />
      )}
      <button type="button" onClick={() => ref.current?.click()}
        className="neu-btn inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium"
        style={{ color: "#7B6FC0" }} disabled={uploading}>
        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        {uploading ? "Uploading…" : current ? "Change photo" : "Upload photo"}
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

// ── Multi-Image Upload ──────────────────────────────────────────
function MultiImageUpload({ urls, onChanged, folder }: {
  urls: string[]
  onChanged: (urls: string[]) => void
  folder: "events" | "team" | "projects" | "general"
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    e.target.value = ""
    try {
      const url = await uploadFileToS3(folder, file)
      onChanged([...urls, url])
    } catch (err) { console.error("Upload failed:", err) }
    finally { setUploading(false) }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {urls.map((url, i) => (
        <div key={i} className="relative group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="h-14 w-14 rounded-xl object-cover border border-white/40" />
          <button type="button" onClick={() => onChanged(urls.filter((_, j) => j !== i))}
            className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-white text-xs shadow"
            style={{ background: "#E85555" }}>×</button>
        </div>
      ))}
      <button type="button" onClick={() => ref.current?.click()}
        className="neu-btn flex h-14 w-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-medium"
        style={{ color: "#7B6FC0" }} disabled={uploading}>
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {uploading ? "…" : "Add"}
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

// ── Dashboard Tab ───────────────────────────────────────────────
function DashboardTab({ setActiveTab }: { setActiveTab: (tab: AdminTab) => void }) {
  const [stats, setStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.admin.stats().then(({ stats }) => { setStats(stats); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const statCards = [
    { label: "Events",       value: stats.totalEvents,       sub: `${stats.upcomingEvents || 0} upcoming`,  color: "#FF9900", tab: "events" as AdminTab },
    { label: "Team Members", value: stats.teamMembers,       sub: `${stats.activeMembers || 0} active`,     color: "#6B4FE8", tab: "team" as AdminTab },
    { label: "Projects",     value: stats.totalProjects,     sub: "in showcase",                            color: "#50C88A", tab: "projects" as AdminTab },
    { label: "Achievements", value: stats.totalAchievements, sub: "recorded",                               color: "#FFB800", tab: "achievements" as AdminTab },
    { label: "Resources",    value: stats.totalResources,    sub: "learning links",                         color: "#B8A4FF", tab: "resources" as AdminTab },
    { label: "Users",        value: stats.registeredUsers,   sub: "registered accounts",                    color: "#5BA8D8", tab: "users" as AdminTab },
    { label: "Inbox",        value: stats.totalContacts,     sub: `${stats.unreadContacts || 0} unread`,    color: "#E85580", tab: "contacts" as AdminTab },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="h-7 w-7 animate-spin" style={{ color: "#6B4FE8" }} />
    </div>
  )

  return (
    <div className="space-y-5">
      <SectionHeader title="Dashboard" sub="AWS Student Builder Group NMIET — Control Panel" />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {statCards.map((s) => (
          <motion.button key={s.label} onClick={() => setActiveTab(s.tab)}
            className={`${CARD} p-4 text-left w-full`} style={CARD_BG}
            whileHover={{ y: -3, ...CARD_BG_HOVER }} transition={{ type: "spring", stiffness: 300 }}>
            <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value ?? "—"}</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: "#1E1060" }}>{s.label}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "#9B8FC8" }}>{s.sub}</p>
          </motion.button>
        ))}
      </div>

      <div className={`${CARD} p-4`} style={CARD_BG}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#9B8FC8" }}>Quick Actions</p>
        <div className="flex flex-wrap gap-2">
          {([
            { label: "+ Add Event",       tab: "events"       },
            { label: "+ Add Member",      tab: "team"         },
            { label: "+ Add Project",     tab: "projects"     },
            { label: "+ Add Achievement", tab: "achievements" },
            { label: "+ Add Resource",    tab: "resources"    },
            { label: "View Contacts",     tab: "contacts"     },
          ] as { label: string; tab: AdminTab }[]).map(({ label, tab }) => (
            <button key={label} onClick={() => setActiveTab(tab)}
              className="neu-btn rounded-xl px-3 py-1.5 text-xs font-semibold" style={{ color: "#6B4FE8" }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Generic List Manager ────────────────────────────────────────
interface FieldDef {
  key: string
  label: string
  type: "text" | "date" | "textarea" | "number" | "boolean" | "select" | "tags" | "image" | "images"
  options?: string[]
  folder?: "events" | "team" | "projects" | "general"
  span?: "full"
}

interface ListManagerProps {
  title: string
  description: string
  fetchFn: () => Promise<{ [key: string]: unknown[] }>
  dataKey: string
  createFn: (data: unknown) => Promise<unknown>
  updateFn: (id: string, data: unknown) => Promise<unknown>
  deleteFn: (id: string) => Promise<unknown>
  fields: FieldDef[]
  displayName: (item: Record<string, unknown>) => string
  displaySub?: (item: Record<string, unknown>) => string
}

function ListManager({
  title, description, fetchFn, dataKey, createFn, updateFn, deleteFn,
  fields, displayName, displaySub,
}: ListManagerProps) {
  const [items, setItems] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [form, setForm] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchFn()
      setItems((data[dataKey] || []) as Record<string, unknown>[])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    const defaults: Record<string, unknown> = {}
    fields.forEach((f) => {
      defaults[f.key] = f.type === "boolean" ? false
        : f.type === "number" ? 0
        : f.type === "tags" ? []
        : f.type === "images" ? []
        : f.type === "select" ? (f.options?.[0] ?? "")
        : ""
    })
    setForm(defaults)
    setShowForm(true)
  }

  const openEdit = (item: Record<string, unknown>) => {
    setEditing(item)
    setForm({ ...item })
    setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) {
        const payload: Record<string, unknown> = {}
        fields.forEach((f) => { payload[f.key] = form[f.key] })
        await updateFn(editing.id as string, payload)
        showToast("Updated successfully!", "success")
      } else {
        await createFn(form)
        showToast("Created successfully!", "success")
      }
      setShowForm(false)
      await load()
    } catch (err) {
      showToast((err as Error).message || "Failed to save", "error")
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return
    try {
      await deleteFn(id)
      showToast("Deleted.", "success")
      await load()
    } catch { showToast("Delete failed", "error") }
  }

  const setField = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {toast && <Toast message={toast.msg} type={toast.type} />}
      </AnimatePresence>

      <SectionHeader
        title={title}
        sub={description}
        action={
          <div className="flex gap-2 flex-shrink-0">
            <IconBtn onClick={load} title="Refresh">
              <RefreshCw className="h-3.5 w-3.5" style={{ color: "#7B6FC0" }} />
            </IconBtn>
            <PrimaryBtn onClick={openCreate}>
              <Plus className="h-3.5 w-3.5" /> Add New
            </PrimaryBtn>
          </div>
        }
      />

      {/* Inline Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className={`${CARD} p-4`}
            style={{ background: "rgba(107,79,232,0.08)", border: "1px solid rgba(107,79,232,0.22)" }}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold" style={{ color: "#1E1060" }}>
                {editing ? "Edit Entry" : "New Entry"}
              </p>
              <IconBtn onClick={() => setShowForm(false)}>
                <X className="h-3.5 w-3.5" style={{ color: "#7B6FC0" }} />
              </IconBtn>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.key} className={field.span === "full" ? "sm:col-span-2" : ""}>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider" style={{ color: "#9B8FC8" }}>
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea value={String(form[field.key] || "")} rows={3}
                      onChange={(e) => setField(field.key, e.target.value)} style={TEXTAREA_STYLE} />
                  ) : field.type === "select" ? (
                    <select value={String(form[field.key] || "")}
                      onChange={(e) => setField(field.key, e.target.value)}
                      style={{ ...INPUT_STYLE, cursor: "pointer" }}>
                      {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : field.type === "boolean" ? (
                    <label className="flex items-center gap-2 cursor-pointer mt-1">
                      <input type="checkbox" checked={Boolean(form[field.key])}
                        onChange={(e) => setField(field.key, e.target.checked)} className="h-4 w-4 accent-purple-600" />
                      <span className="text-xs" style={{ color: "#1E1060" }}>{form[field.key] ? "Yes" : "No"}</span>
                    </label>
                  ) : field.type === "tags" ? (
                    <input type="text"
                      value={Array.isArray(form[field.key]) ? (form[field.key] as string[]).join(", ") : String(form[field.key] || "")}
                      onChange={(e) => setField(field.key, e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                      placeholder="Comma-separated values" style={INPUT_STYLE} />
                  ) : field.type === "image" ? (
                    <div className="space-y-2">
                      <ImageUpload folder={field.folder || "general"}
                        current={String(form[field.key] || "")}
                        onUploaded={(url) => setField(field.key, url)} />
                      {Boolean(form[field.key]) && (
                        <input type="text" value={String(form[field.key])} onChange={(e) => setField(field.key, e.target.value)}
                          placeholder="Or paste URL" style={{ ...INPUT_STYLE, fontSize: "0.73rem" }} />
                      )}
                    </div>
                  ) : field.type === "images" ? (
                    <MultiImageUpload
                      folder={field.folder || "events"}
                      urls={Array.isArray(form[field.key]) ? (form[field.key] as string[]) : []}
                      onChanged={(urls) => setField(field.key, urls)} />
                  ) : (
                    <input type={field.type} value={String(form[field.key] ?? "")}
                      onChange={(e) => setField(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)}
                      style={INPUT_STYLE} />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold" style={{ color: "#7B6FC0", background: "rgba(107,79,232,0.06)", border: "1px solid rgba(107,79,232,0.12)" }}>
                Cancel
              </button>
              <PrimaryBtn onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {saving ? "Saving…" : editing ? "Update" : "Create"}
              </PrimaryBtn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#6B4FE8" }} />
        </div>
      ) : items.length === 0 ? (
        <div className={`${CARD} py-12 text-center`} style={CARD_BG}>
          <div className="h-10 w-10 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "rgba(107,79,232,0.08)" }}>
            <Plus className="h-5 w-5" style={{ color: "rgba(107,79,232,0.40)" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "#9B8FC8" }}>No entries yet. Add your first one!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <motion.div key={String(item.id)}
              className={`${CARD} flex items-center gap-3 px-3 py-2.5`} style={CARD_BG}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}>
              {item.photoUrl || item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={String(item.photoUrl || item.imageUrl)} alt="" className="h-9 w-9 rounded-lg object-cover flex-shrink-0 border border-white/40" />
              ) : (
                <div className="h-9 w-9 rounded-lg flex-shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(107,79,232,0.10)" }}>
                  <ImageIcon className="h-4 w-4" style={{ color: "#B8A4FF" }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "#1E1060" }}>{displayName(item)}</p>
                {displaySub && <p className="text-[10px] truncate mt-0.5" style={{ color: "#9B8FC8" }}>{displaySub(item)}</p>}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <IconBtn onClick={() => openEdit(item)} title="Edit">
                  <Edit3 className="h-3.5 w-3.5" style={{ color: "#6B4FE8" }} />
                </IconBtn>
                <IconBtn onClick={() => handleDelete(String(item.id))} title="Delete" danger>
                  <Trash2 className="h-3.5 w-3.5" style={{ color: "#E85555" }} />
                </IconBtn>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Contacts Tab ────────────────────────────────────────────────
function ContactsTab() {
  const [submissions, setSubmissions] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    setLoading(true)
    try {
      const { submissions } = await api.contact.list()
      setSubmissions(submissions as Record<string, unknown>[])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const markRead = async (id: string, isRead: boolean) => {
    await api.contact.markRead(id, isRead)
    await load()
  }

  const handleDelete = async (id: string) => {
    await api.contact.delete(id)
    setSelected(null)
    showToast("Deleted.", "success")
    await load()
  }

  const unread = submissions.filter((s) => !s.isRead).length

  return (
    <div className="space-y-3">
      <AnimatePresence>{toast && <Toast message={toast.msg} type={toast.type} />}</AnimatePresence>
      <SectionHeader
        title="Contact Inbox"
        sub={`${unread} unread · ${submissions.length} total`}
        action={
          <IconBtn onClick={load} title="Refresh">
            <RefreshCw className="h-3.5 w-3.5" style={{ color: "#7B6FC0" }} />
          </IconBtn>
        }
      />

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#6B4FE8" }} />
        </div>
      ) : submissions.length === 0 ? (
        <div className={`${CARD} py-12 text-center`} style={CARD_BG}>
          <Mail className="h-8 w-8 mx-auto mb-2" style={{ color: "rgba(107,79,232,0.30)" }} />
          <p className="text-sm font-medium" style={{ color: "#9B8FC8" }}>No submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {submissions.map((sub) => (
            <motion.div key={String(sub.id)}
              className={`${CARD} flex items-start gap-3 px-3 py-3 cursor-pointer`} style={CARD_BG}
              onClick={() => { setSelected(sub); if (!sub.isRead) markRead(String(sub.id), true) }}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}>
              <div className="flex-shrink-0 mt-1">
                {!sub.isRead && <div className="h-2 w-2 rounded-full" style={{ background: "#6B4FE8" }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold" style={{ color: "#1E1060" }}>{String(sub.name)}</p>
                  {!sub.isRead && (
                    <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                      style={{ background: "rgba(107,79,232,0.12)", color: "#6B4FE8" }}>new</span>
                  )}
                </div>
                <p className="text-xs font-medium truncate mt-0.5" style={{ color: "#7B6FC0" }}>{String(sub.subject)}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "#9B8FC8" }}>
                  {String(sub.email)} · {new Date(String(sub.submittedAt)).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(30,16,96,0.25)", backdropFilter: "blur(8px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}>
            <motion.div className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{ background: "rgba(204,192,255,0.98)", border: "1px solid rgba(107,79,232,0.22)", boxShadow: "0 24px 60px rgba(107,79,232,0.30)" }}
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b"
                style={{ borderColor: "rgba(107,79,232,0.15)" }}>
                <p className="font-bold text-sm" style={{ color: "#1E1060" }}>{String(selected.subject)}</p>
                <IconBtn onClick={() => setSelected(null)}>
                  <X className="h-3.5 w-3.5" style={{ color: "#7B6FC0" }} />
                </IconBtn>
              </div>
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className={`${CARD} p-3`} style={CARD_BG}>
                    <p className="text-[10px] mb-1" style={{ color: "#9B8FC8" }}>From</p>
                    <p className="text-sm font-semibold" style={{ color: "#1E1060" }}>{String(selected.name)}</p>
                    <p className="text-xs" style={{ color: "#7B6FC0" }}>{String(selected.email)}</p>
                  </div>
                  <div className={`${CARD} p-3`} style={CARD_BG}>
                    <p className="text-[10px] mb-1" style={{ color: "#9B8FC8" }}>Received</p>
                    <p className="text-sm font-semibold" style={{ color: "#1E1060" }}>
                      {new Date(String(selected.submittedAt)).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <p className="text-xs" style={{ color: "#7B6FC0" }}>
                      {new Date(String(selected.submittedAt)).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className={`${CARD} p-4`} style={CARD_BG}>
                  <p className="text-[10px] mb-2" style={{ color: "#9B8FC8" }}>Message</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#1E1060" }}>{String(selected.message)}</p>
                </div>
                <div className="flex gap-2">
                  <a href={`mailto:${String(selected.email)}?subject=Re: ${String(selected.subject)}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold"
                    style={{ background: "rgba(107,79,232,0.10)", color: "#6B4FE8", border: "1px solid rgba(107,79,232,0.20)" }}>
                    <Mail className="h-3.5 w-3.5" /> Reply via Email
                  </a>
                  <button onClick={() => handleDelete(String(selected.id))}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold"
                    style={{ background: "rgba(232,85,85,0.10)", color: "#E85555", border: "1px solid rgba(232,85,85,0.20)" }}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Site Config Tab ─────────────────────────────────────────────
function ConfigTab() {
  const [config, setConfig] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    api.config.get().then(({ config }) => { setConfig(config); setLoading(false) })
  }, [])

  const save = async (key: string) => {
    setSaving(key)
    try {
      await api.config.set(key, config[key])
      showToast(`${key} updated!`, "success")
    } catch { showToast("Failed to save", "error") }
    finally { setSaving(null) }
  }

  const configFields = [
    { key: "mission",       label: "Mission Statement",      multiline: true },
    { key: "vision",        label: "Vision Statement",       multiline: true },
    { key: "memberCount",   label: "Member Count (display)" },
    { key: "eventCount",    label: "Event Count (display)"  },
    { key: "projectCount",  label: "Project Count (display)" },
    { key: "workshopCount", label: "Workshop Count (display)" },
    { key: "contactEmail",  label: "Contact Email" },
    { key: "location",      label: "Location Address",       multiline: true },
    { key: "phone",         label: "Phone Number" },
  ]

  if (loading) return (
    <div className="flex justify-center py-10">
      <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#6B4FE8" }} />
    </div>
  )

  return (
    <div className="space-y-3">
      <AnimatePresence>{toast && <Toast message={toast.msg} type={toast.type} />}</AnimatePresence>
      <SectionHeader title="Site Configuration" sub="Edit text content shown across the website" />
      <div className="space-y-2.5">
        {configFields.map((field) => (
          <div key={field.key} className={`${CARD} p-3.5`} style={CARD_BG}>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider" style={{ color: "#9B8FC8" }}>
              {field.label}
            </label>
            <div className="flex gap-2">
              {field.multiline ? (
                <textarea rows={3} value={config[field.key] || ""}
                  onChange={(e) => setConfig((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  style={{ ...TEXTAREA_STYLE, flex: 1 }} />
              ) : (
                <input type="text" value={config[field.key] || ""}
                  onChange={(e) => setConfig((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  style={{ ...INPUT_STYLE, flex: 1 }} />
              )}
              <PrimaryBtn onClick={() => save(field.key)} disabled={saving === field.key} className="flex-shrink-0 self-start">
                {saving === field.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              </PrimaryBtn>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Users Tab ───────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    setLoading(true)
    try {
      const { users } = await api.admin.users.list()
      setUsers(users as Record<string, unknown>[])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const toggleAdmin = async (user: Record<string, unknown>) => {
    try {
      if (user.isAdmin) {
        await api.admin.users.demote(String(user.username))
        showToast(`${user.username} removed from admins`, "success")
      } else {
        await api.admin.users.promote(String(user.username))
        showToast(`${user.username} promoted to admin`, "success")
      }
      await load()
    } catch (err) { showToast((err as Error).message, "error") }
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>{toast && <Toast message={toast.msg} type={toast.type} />}</AnimatePresence>
      <SectionHeader
        title="User Management"
        sub={`${users.length} registered users`}
        action={
          <IconBtn onClick={load} title="Refresh">
            <RefreshCw className="h-3.5 w-3.5" style={{ color: "#7B6FC0" }} />
          </IconBtn>
        }
      />

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#6B4FE8" }} />
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div key={String(user.username)} className={`${CARD} flex items-center gap-3 px-3 py-2.5`} style={CARD_BG}>
              <div className="h-9 w-9 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-white text-xs"
                style={{ background: "linear-gradient(135deg,#6B4FE8,#B8A4FF)" }}>
                {String(user.name || user.email || "?").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate" style={{ color: "#1E1060" }}>
                    {String(user.name || user.email || user.username)}
                  </p>
                  {Boolean(user.isAdmin) && (
                    <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                      style={{ background: "rgba(107,79,232,0.12)", color: "#6B4FE8" }}>admin</span>
                  )}
                </div>
                <p className="text-[10px] truncate mt-0.5" style={{ color: "#9B8FC8" }}>{String(user.email || user.username)}</p>
              </div>
              <motion.button onClick={() => toggleAdmin(user)}
                className="flex-shrink-0 rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide border"
                style={user.isAdmin
                  ? { background: "rgba(232,85,85,0.08)", color: "#E85555", borderColor: "rgba(232,85,85,0.20)" }
                  : { background: "rgba(107,79,232,0.08)", color: "#6B4FE8", borderColor: "rgba(107,79,232,0.20)" }}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                {user.isAdmin ? "Remove Admin" : "Make Admin"}
              </motion.button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Admin App ──────────────────────────────────────────────
export function AdminApp() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard")

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardTab setActiveTab={setActiveTab} />

      case "events": return (
        <ListManager
          title="Events" description="Manage past and upcoming events"
          fetchFn={api.events.list} dataKey="events"
          createFn={api.events.create} updateFn={api.events.update} deleteFn={api.events.delete}
          displayName={(i) => String(i.title)}
          displaySub={(i) => `${String(i.date)} · ${String(i.location)} · ${String(i.attendees || 0)} attendees`}
          fields={[
            { key: "title",       label: "Event Title",      type: "text",     span: "full" },
            { key: "date",        label: "Date",             type: "date" },
            { key: "location",    label: "Location",         type: "text" },
            { key: "attendees",   label: "Attendees",        type: "number" },
            { key: "description", label: "Description",      type: "textarea", span: "full" },
            { key: "tags",        label: "Tags (comma sep)", type: "tags",     span: "full" },
            { key: "isPast",      label: "Is Past Event",    type: "boolean" },
            { key: "imageUrls",   label: "Event Photos",     type: "images",   folder: "events", span: "full" },
          ]}
        />
      )

      case "team": return (
        <ListManager
          title="Team Members" description="Manage your core team"
          fetchFn={api.team.list} dataKey="members"
          createFn={api.team.create} updateFn={api.team.update} deleteFn={api.team.delete}
          displayName={(i) => String(i.name)}
          displaySub={(i) => `${String(i.role)} · ${String(i.status)}`}
          fields={[
            { key: "name",     label: "Full Name",          type: "text" },
            { key: "role",     label: "Role / Position",    type: "text" },
            { key: "order",    label: "Display Order",      type: "number" },
            { key: "status",   label: "Status",             type: "select",   options: ["running", "stopped"] },
            { key: "skills",   label: "Skills (comma sep)", type: "tags",     span: "full" },
            { key: "bio",      label: "Short Bio",          type: "textarea", span: "full" },
            { key: "email",    label: "Email",              type: "text" },
            { key: "linkedin", label: "LinkedIn URL",       type: "text" },
            { key: "github",   label: "GitHub URL",         type: "text" },
            { key: "photoUrl", label: "Profile Photo",      type: "image",    folder: "team", span: "full" },
          ]}
        />
      )

      case "projects": return (
        <ListManager
          title="Projects" description="Showcase of club projects"
          fetchFn={api.projects.list} dataKey="projects"
          createFn={api.projects.create} updateFn={api.projects.update} deleteFn={api.projects.delete}
          displayName={(i) => String(i.title)}
          displaySub={(i) => `by ${String(i.author)} · ${String(i.status)}`}
          fields={[
            { key: "title",       label: "Project Title",         type: "text" },
            { key: "author",      label: "Author",                type: "text" },
            { key: "status",      label: "Status",                type: "select",   options: ["Production", "Development", "Beta"] },
            { key: "description", label: "Description",           type: "textarea", span: "full" },
            { key: "stack",       label: "Tech Stack (comma sep)", type: "tags",    span: "full" },
            { key: "githubUrl",   label: "GitHub URL",            type: "text" },
            { key: "liveUrl",     label: "Live Demo URL",         type: "text" },
            { key: "imageUrl",    label: "Project Screenshot",    type: "image",    folder: "projects", span: "full" },
          ]}
        />
      )

      case "achievements": return (
        <ListManager
          title="Achievements" description="Awards and milestones"
          fetchFn={api.achievements.list} dataKey="achievements"
          createFn={api.achievements.create} updateFn={api.achievements.update} deleteFn={api.achievements.delete}
          displayName={(i) => String(i.title)}
          displaySub={(i) => `${String(i.type)} · ${String(i.date)}`}
          fields={[
            { key: "title",       label: "Achievement Title", type: "text" },
            { key: "date",        label: "Year",              type: "text" },
            { key: "type",        label: "Type",              type: "select",   options: ["Competition", "Hackathon", "Recognition", "Milestone"] },
            { key: "order",       label: "Display Order",     type: "number" },
            { key: "description", label: "Description",       type: "textarea", span: "full" },
            { key: "iconName",    label: "Icon",              type: "select",   options: ["Trophy", "Award", "Star", "Medal", "Target", "Zap"] },
            { key: "color",       label: "Color (hex)",       type: "text" },
          ]}
        />
      )

      case "resources": return (
        <ListManager
          title="Resources" description="Learning materials and links"
          fetchFn={api.resources.list} dataKey="resources"
          createFn={api.resources.create} updateFn={api.resources.update} deleteFn={api.resources.delete}
          displayName={(i) => String(i.name)}
          displaySub={(i) => `${String(i.category)} · ${String(i.type)}`}
          fields={[
            { key: "name",     label: "Resource Name",  type: "text",    span: "full" },
            { key: "category", label: "Category",       type: "text" },
            { key: "type",     label: "Type",           type: "select",  options: ["Course", "Video", "Document", "Tool"] },
            { key: "url",      label: "URL",            type: "text",    span: "full" },
            { key: "order",    label: "Display Order",  type: "number" },
            { key: "featured", label: "Featured",       type: "boolean" },
          ]}
        />
      )

      case "social": return (
        <ListManager
          title="Social Links" description="Manage social media links and follower counts"
          fetchFn={api.social.list} dataKey="links"
          createFn={api.social.create}
          updateFn={(id, data) => api.social.update({ id, ...(data as Record<string, unknown>) })}
          deleteFn={(id) => api.social.delete(id)}
          displayName={(i) => String(i.name)}
          displaySub={(i) => `${String(i.platform)} · ${String(i.url)}`}
          fields={[
            { key: "name",      label: "Platform Name",          type: "text" },
            { key: "platform",  label: "Platform ID",            type: "select", options: ["linkedin", "github", "instagram", "twitter", "youtube", "discord"] },
            { key: "url",       label: "URL",                    type: "text",   span: "full" },
            { key: "followers", label: "Followers (display)",    type: "text" },
            { key: "color",     label: "Brand Color (hex)",      type: "text" },
          ]}
        />
      )

      case "config":   return <ConfigTab />
      case "contacts": return <ContactsTab />
      case "users":    return <UsersTab />

      case "gallery": return (
        <ListManager
          title="Gallery Albums" description="Manage photo albums in the gallery"
          fetchFn={api.events.list} dataKey="events"
          createFn={(data) => {
            const p = data as Record<string, unknown>
            return api.events.create({
              ...p,
              location: p.location || "NMIET Campus",
              description: p.description || "Gallery Album",
              isPast: p.isPast ?? true,
              attendees: p.attendees ?? 0,
              tags: p.tags ?? [],
            })
          }}
          updateFn={(id, data) => {
            const p = data as Record<string, unknown>
            return api.events.update(id, {
              ...p,
              location: p.location || "NMIET Campus",
              description: p.description || "Gallery Album",
              isPast: p.isPast ?? true,
              attendees: p.attendees ?? 0,
              tags: p.tags ?? [],
            })
          }}
          deleteFn={api.events.delete}
          displayName={(i) => String(i.title)}
          displaySub={(i) => `${String(i.date)} · ${Array.isArray(i.imageUrls) ? i.imageUrls.length : 0} photos`}
          fields={[
            { key: "title",     label: "Album Title", type: "text",   span: "full" },
            { key: "date",      label: "Date",        type: "date" },
            { key: "imageUrls", label: "Album Photos",type: "images", folder: "events", span: "full" },
          ]}
        />
      )
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Horizontal Tab Navigation ── */}
      <div className="flex-shrink-0 border-b px-3 pt-3" style={{ borderColor: "rgba(107,79,232,0.15)" }}>
        <div className="flex gap-1.5 overflow-x-auto pb-2.5 hide-scrollbar" style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-semibold transition-colors"
              style={activeTab === tab.id
                ? { background: "linear-gradient(135deg,#6B4FE8,#8B6FFF)", color: "white", boxShadow: "0 4px 12px rgba(107,79,232,0.35)" }
                : { background: "rgba(107,79,232,0.07)", color: "#7B6FC0", border: "1px solid rgba(107,79,232,0.12)" }
              }
              whileHover={activeTab !== tab.id ? { y: -1 } : {}}
              whileTap={{ scale: 0.95 }}
            >
              {tab.icon}
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}>
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
