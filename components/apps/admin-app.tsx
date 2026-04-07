"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Calendar, Users, FolderOpen, Trophy,
  BookOpen, Share2, Settings, Mail, Shield, Plus, Edit3,
  Trash2, Save, X, Upload, CheckCircle2, AlertCircle,
  Eye, EyeOff, RefreshCw, ExternalLink, ChevronDown,
  ChevronRight, Star, Loader2, Image as ImageIcon,
} from "lucide-react"
import { api, uploadFileToS3 } from "@/lib/api-client"

type AdminTab =
  | "dashboard" | "events" | "team" | "projects"
  | "achievements" | "resources" | "social" | "config" | "contacts" | "users"

const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard",    label: "Dashboard",   icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "events",       label: "Events",      icon: <Calendar className="h-4 w-4" /> },
  { id: "team",         label: "Team",        icon: <Users className="h-4 w-4" /> },
  { id: "projects",     label: "Projects",    icon: <FolderOpen className="h-4 w-4" /> },
  { id: "achievements", label: "Achievements",icon: <Trophy className="h-4 w-4" /> },
  { id: "resources",    label: "Resources",   icon: <BookOpen className="h-4 w-4" /> },
  { id: "social",       label: "Social",      icon: <Share2 className="h-4 w-4" /> },
  { id: "config",       label: "Site Config", icon: <Settings className="h-4 w-4" /> },
  { id: "contacts",     label: "Contacts",    icon: <Mail className="h-4 w-4" /> },
  { id: "users",        label: "Users",       icon: <Shield className="h-4 w-4" /> },
]

const inputCls: React.CSSProperties = {
  background: "#EAE6FF", boxShadow: "inset 2px 2px 6px #C2BAF0, inset -2px -2px 6px #FFFFFF",
  border: "none", outline: "none", borderRadius: "0.75rem",
  padding: "0.625rem 0.875rem", color: "#1E1060", width: "100%", fontSize: "0.85rem",
}
const textareaCls: React.CSSProperties = { ...inputCls, resize: "none" }

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <motion.div
      className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-lg"
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

// ── Image Upload Button ────────────────────────────────────────
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
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {current && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={current} alt="Current" className="h-10 w-10 rounded-lg object-cover" />
      )}
      <button type="button" onClick={() => ref.current?.click()}
        className="neu-btn inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium"
        style={{ color: "#7B6FC0" }} disabled={uploading}>
        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        {uploading ? "Uploading..." : current ? "Change photo" : "Upload photo"}
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

// ── Dashboard Tab ─────────────────────────────────────────────
function DashboardTab() {
  const [stats, setStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.admin.stats().then(({ stats }) => { setStats(stats); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const statCards = [
    { label: "Total Events", value: stats.totalEvents, sub: `${stats.upcomingEvents || 0} upcoming`, color: "#FF9900" },
    { label: "Team Members", value: stats.teamMembers, sub: `${stats.activeMembers || 0} active`, color: "#6B4FE8" },
    { label: "Projects", value: stats.totalProjects, sub: "in showcase", color: "#50C88A" },
    { label: "Registered Users", value: stats.registeredUsers, sub: "total accounts", color: "#5BA8D8" },
    { label: "Achievements", value: stats.totalAchievements, sub: "recorded", color: "#FFB800" },
    { label: "Resources", value: stats.totalResources, sub: "learning links", color: "#B8A4FF" },
    { label: "Contact Inbox", value: stats.totalContacts, sub: `${stats.unreadContacts || 0} unread`, color: "#E85580" },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#6B4FE8" }} />
    </div>
  )

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold mb-1" style={{ color: "#1E1060" }}>Admin Dashboard</h2>
        <p className="text-sm" style={{ color: "#7B6FC0" }}>AWS Cloud Club NMIET — Website Control Panel</p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((s) => (
          <motion.div key={s.label} className="neu-raised-sm rounded-2xl p-4"
            whileHover={{ y: -3 }} transition={{ type: "spring" as const, stiffness: 300 }}>
            <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value ?? "—"}</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: "#1E1060" }}>{s.label}</p>
            <p className="text-xs mt-0.5" style={{ color: "#9B8FC8" }}>{s.sub}</p>
          </motion.div>
        ))}
      </div>
      <div className="neu-raised-sm rounded-2xl p-5">
        <h3 className="font-semibold mb-3" style={{ color: "#1E1060" }}>Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {[
            "Add Event", "Add Team Member", "Add Project", "Add Achievement",
            "View Contacts", "Add Resource",
          ].map((action) => (
            <button key={action} className="neu-btn rounded-xl px-3 py-2 text-sm font-medium" style={{ color: "#6B4FE8" }}>
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Generic List Manager ──────────────────────────────────────
// Reusable manager used for Events, Team, Projects, etc.
interface FieldDef {
  key: string
  label: string
  type: "text" | "textarea" | "number" | "boolean" | "select" | "tags" | "image"
  options?: string[] // for select
  folder?: "events" | "team" | "projects" | "general" // for image
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
      defaults[f.key] = f.type === "boolean" ? false : f.type === "number" ? 0 : f.type === "tags" ? [] : ""
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
        await updateFn(editing.id as string, form)
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
    if (!confirm("Are you sure you want to delete this?")) return
    try {
      await deleteFn(id)
      showToast("Deleted.", "success")
      await load()
    } catch { showToast("Delete failed", "error") }
  }

  const setField = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {toast && <Toast message={toast.msg} type={toast.type} />}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: "#1E1060" }}>{title}</h2>
          <p className="text-sm" style={{ color: "#7B6FC0" }}>{description}</p>
        </div>
        <div className="flex gap-2">
          <motion.button onClick={load} className="neu-btn flex h-9 w-9 items-center justify-center rounded-xl"
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} title="Refresh">
            <RefreshCw className="h-4 w-4" style={{ color: "#7B6FC0" }} />
          </motion.button>
          <motion.button onClick={openCreate}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #6B4FE8, #8B6FFF)",
              boxShadow: "4px 4px 12px rgba(107,79,232,0.35)" }}
            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Plus className="h-4 w-4" /> Add New
          </motion.button>
        </div>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="neu-inset rounded-2xl p-5"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: "#1E1060" }}>
                {editing ? "Edit Entry" : "Add New Entry"}
              </h3>
              <button onClick={() => setShowForm(false)} className="neu-btn flex h-8 w-8 items-center justify-center rounded-xl">
                <X className="h-4 w-4" style={{ color: "#7B6FC0" }} />
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {fields.map((field) => (
                <div key={field.key} className={field.span === "full" ? "md:col-span-2" : ""}>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "#9B8FC8" }}>
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea value={String(form[field.key] || "")} rows={3}
                      onChange={(e) => setField(field.key, e.target.value)} style={textareaCls} />
                  ) : field.type === "select" ? (
                    <select value={String(form[field.key] || "")}
                      onChange={(e) => setField(field.key, e.target.value)}
                      style={{ ...inputCls, cursor: "pointer" }}>
                      {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : field.type === "boolean" ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={Boolean(form[field.key])}
                        onChange={(e) => setField(field.key, e.target.checked)} className="h-4 w-4" />
                      <span className="text-sm" style={{ color: "#1E1060" }}>{form[field.key] ? "Yes" : "No"}</span>
                    </label>
                  ) : field.type === "tags" ? (
                    <input type="text" value={Array.isArray(form[field.key]) ? (form[field.key] as string[]).join(", ") : String(form[field.key] || "")}
                      onChange={(e) => setField(field.key, e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                      placeholder="Comma separated values" style={inputCls} />
                  ) : field.type === "image" ? (
                    <div className="space-y-2">
                      <ImageUpload folder={field.folder || "general"}
                        current={String(form[field.key] || "")}
                        onUploaded={(url) => setField(field.key, url)} />
                      {Boolean(form[field.key]) && (
                        <input type="text" value={String(form[field.key])} onChange={(e) => setField(field.key, e.target.value)}
                          placeholder="Or paste URL" style={{ ...(inputCls as React.CSSProperties), fontSize: "0.75rem" }} />
                      )}
                    </div>
                  ) : (
                    <input type={field.type} value={String(form[field.key] ?? "")}
                      onChange={(e) => setField(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)}
                      style={inputCls} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="neu-btn rounded-xl px-4 py-2 text-sm font-medium" style={{ color: "#7B6FC0" }}>
                Cancel
              </button>
              <motion.button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                style={{ background: "linear-gradient(135deg, #6B4FE8, #8B6FFF)" }}
                whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" style={{ color: "#6B4FE8" }} /></div>
      ) : items.length === 0 ? (
        <div className="neu-inset rounded-2xl py-12 text-center">
          <Plus className="h-8 w-8 mx-auto mb-2" style={{ color: "#C2BAF0" }} />
          <p className="text-sm font-medium" style={{ color: "#9B8FC8" }}>No entries yet. Add your first one!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <motion.div key={String(item.id)} className="neu-raised-sm flex items-center gap-3 rounded-2xl px-4 py-3"
              whileHover={{ y: -2 }} transition={{ type: "spring" as const, stiffness: 300 }}>
              {item.photoUrl || item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={String(item.photoUrl || item.imageUrl)} alt="" className="h-10 w-10 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="h-10 w-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(107,79,232,0.10)" }}>
                  <ImageIcon className="h-5 w-5" style={{ color: "#B8A4FF" }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: "#1E1060" }}>{displayName(item)}</p>
                {displaySub && <p className="text-xs truncate" style={{ color: "#9B8FC8" }}>{displaySub(item)}</p>}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <motion.button onClick={() => openEdit(item)}
                  className="neu-btn flex h-8 w-8 items-center justify-center rounded-xl"
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}>
                  <Edit3 className="h-3.5 w-3.5" style={{ color: "#6B4FE8" }} />
                </motion.button>
                <motion.button onClick={() => handleDelete(String(item.id))}
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: "rgba(232,85,85,0.10)" }}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}>
                  <Trash2 className="h-3.5 w-3.5" style={{ color: "#E85555" }} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Contacts Tab ──────────────────────────────────────────────
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
    <div className="space-y-4">
      <AnimatePresence>{toast && <Toast message={toast.msg} type={toast.type} />}</AnimatePresence>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: "#1E1060" }}>Contact Inbox</h2>
          <p className="text-sm" style={{ color: "#7B6FC0" }}>{unread} unread • {submissions.length} total</p>
        </div>
        <motion.button onClick={load} className="neu-btn flex h-9 w-9 items-center justify-center rounded-xl"
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
          <RefreshCw className="h-4 w-4" style={{ color: "#7B6FC0" }} />
        </motion.button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" style={{ color: "#6B4FE8" }} /></div>
      ) : submissions.length === 0 ? (
        <div className="neu-inset rounded-2xl py-12 text-center">
          <Mail className="h-8 w-8 mx-auto mb-2" style={{ color: "#C2BAF0" }} />
          <p className="text-sm font-medium" style={{ color: "#9B8FC8" }}>No submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {submissions.map((sub) => (
            <motion.div key={String(sub.id)}
              className="neu-raised-sm flex items-start gap-3 rounded-2xl px-4 py-3 cursor-pointer"
              onClick={() => { setSelected(sub); if (!sub.isRead) markRead(String(sub.id), true) }}
              whileHover={{ y: -2 }} transition={{ type: "spring" as const, stiffness: 300 }}>
              <div className="flex-shrink-0 mt-0.5">
                {!sub.isRead && (
                  <div className="h-2 w-2 rounded-full mt-1.5" style={{ background: "#6B4FE8" }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm" style={{ color: "#1E1060" }}>{String(sub.name)}</p>
                  {!sub.isRead && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: "rgba(107,79,232,0.12)", color: "#6B4FE8" }}>new</span>
                  )}
                </div>
                <p className="text-xs font-medium truncate" style={{ color: "#7B6FC0" }}>{String(sub.subject)}</p>
                <p className="text-xs mt-0.5" style={{ color: "#9B8FC8" }}>
                  {String(sub.email)} · {new Date(String(sub.submittedAt)).toLocaleDateString()}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 mt-1" style={{ color: "#C2BAF0" }} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(30,16,96,0.20)", backdropFilter: "blur(6px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}>
            <motion.div className="neu-panel w-full max-w-lg rounded-2xl"
              initial={{ scale: 0.90, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring" as const, stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b p-4" style={{ borderColor: "#D0C8F0" }}>
                <h3 className="font-bold" style={{ color: "#1E1060" }}>{String(selected.subject)}</h3>
                <button onClick={() => setSelected(null)} className="neu-btn flex h-8 w-8 items-center justify-center rounded-xl">
                  <X className="h-4 w-4" style={{ color: "#7B6FC0" }} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="neu-inset-sm rounded-xl p-3">
                    <p className="text-xs mb-1" style={{ color: "#9B8FC8" }}>From</p>
                    <p className="font-semibold" style={{ color: "#1E1060" }}>{String(selected.name)}</p>
                    <p style={{ color: "#7B6FC0" }}>{String(selected.email)}</p>
                  </div>
                  <div className="neu-inset-sm rounded-xl p-3">
                    <p className="text-xs mb-1" style={{ color: "#9B8FC8" }}>Received</p>
                    <p className="font-semibold" style={{ color: "#1E1060" }}>
                      {new Date(String(selected.submittedAt)).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <p style={{ color: "#7B6FC0" }}>
                      {new Date(String(selected.submittedAt)).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="neu-inset-sm rounded-xl p-4">
                  <p className="text-xs mb-2" style={{ color: "#9B8FC8" }}>Message</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#1E1060" }}>{String(selected.message)}</p>
                </div>
                <div className="flex gap-2">
                  <a href={`mailto:${String(selected.email)}?subject=Re: ${String(selected.subject)}`}
                    className="flex flex-1 items-center justify-center gap-1.5 neu-btn rounded-xl py-2.5 text-sm font-semibold"
                    style={{ color: "#6B4FE8" }}>
                    <Mail className="h-4 w-4" /> Reply via Email
                  </a>
                  <motion.button onClick={() => handleDelete(String(selected.id))}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold"
                    style={{ background: "rgba(232,85,85,0.10)", color: "#E85555" }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Site Config Tab ────────────────────────────────────────────
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
    { key: "mission",        label: "Mission Statement",     multiline: true },
    { key: "vision",         label: "Vision Statement",      multiline: true },
    { key: "memberCount",    label: "Member Count (display)" },
    { key: "eventCount",     label: "Event Count (display)"  },
    { key: "projectCount",   label: "Project Count (display)"},
    { key: "workshopCount",  label: "Workshop Count (display)"},
    { key: "contactEmail",   label: "Contact Email" },
    { key: "location",       label: "Location Address",       multiline: true },
    { key: "phone",          label: "Phone Number" },
  ]

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" style={{ color: "#6B4FE8" }} /></div>

  return (
    <div className="space-y-4">
      <AnimatePresence>{toast && <Toast message={toast.msg} type={toast.type} />}</AnimatePresence>
      <div>
        <h2 className="text-lg font-bold" style={{ color: "#1E1060" }}>Site Configuration</h2>
        <p className="text-sm" style={{ color: "#7B6FC0" }}>Edit text content shown across the website</p>
      </div>
      <div className="space-y-3">
        {configFields.map((field) => (
          <div key={field.key} className="neu-raised-sm rounded-2xl p-4">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide" style={{ color: "#9B8FC8" }}>
              {field.label}
            </label>
            <div className="flex gap-2">
              {field.multiline ? (
                <textarea rows={3} value={config[field.key] || ""}
                  onChange={(e) => setConfig((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  style={{ ...textareaCls, flex: 1 }} />
              ) : (
                <input type="text" value={config[field.key] || ""}
                  onChange={(e) => setConfig((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  style={{ ...inputCls, flex: 1 }} />
              )}
              <motion.button onClick={() => save(field.key)} disabled={saving === field.key}
                className="flex-shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-white disabled:opacity-70"
                style={{ background: "linear-gradient(135deg, #6B4FE8, #8B6FFF)" }}
                whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                {saving === field.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </motion.button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Users Tab ─────────────────────────────────────────────────
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
    <div className="space-y-4">
      <AnimatePresence>{toast && <Toast message={toast.msg} type={toast.type} />}</AnimatePresence>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: "#1E1060" }}>User Management</h2>
          <p className="text-sm" style={{ color: "#7B6FC0" }}>{users.length} registered users</p>
        </div>
        <motion.button onClick={load} className="neu-btn flex h-9 w-9 items-center justify-center rounded-xl"
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
          <RefreshCw className="h-4 w-4" style={{ color: "#7B6FC0" }} />
        </motion.button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" style={{ color: "#6B4FE8" }} /></div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div key={String(user.username)} className="neu-raised-sm flex items-center gap-3 rounded-2xl px-4 py-3">
              <div className="h-9 w-9 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-white text-sm"
                style={{ background: "linear-gradient(135deg, #6B4FE8, #B8A4FF)" }}>
                {String(user.name || user.email || "?").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: "#1E1060" }}>
                  {String(user.name || user.email || user.username)}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs truncate" style={{ color: "#9B8FC8" }}>{String(user.email || user.username)}</p>
                  {Boolean(user.isAdmin) && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: "rgba(107,79,232,0.12)", color: "#6B4FE8" }}>admin</span>
                  )}
                </div>
              </div>
              <motion.button onClick={() => toggleAdmin(user)}
                className="flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: user.isAdmin ? "rgba(232,85,85,0.10)" : "rgba(107,79,232,0.10)",
                  color: user.isAdmin ? "#E85555" : "#6B4FE8",
                }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {user.isAdmin ? "Remove Admin" : "Make Admin"}
              </motion.button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Admin App ─────────────────────────────────────────────
export function AdminApp() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardTab />
      case "events": return (
        <ListManager
          title="Events Manager" description="Manage past and upcoming events"
          fetchFn={api.events.list} dataKey="events"
          createFn={api.events.create} updateFn={api.events.update} deleteFn={api.events.delete}
          displayName={(i) => String(i.title)}
          displaySub={(i) => `${String(i.date)} · ${String(i.location)} · ${String(i.attendees || 0)} attendees`}
          fields={[
            { key: "title",       label: "Event Title",     type: "text",     span: "full" },
            { key: "date",        label: "Date",            type: "text",     },
            { key: "location",    label: "Location",        type: "text",     },
            { key: "attendees",   label: "Attendees",       type: "number",   },
            { key: "description", label: "Description",     type: "textarea", span: "full" },
            { key: "tags",        label: "Tags (comma sep)",type: "tags",     span: "full" },
            { key: "isPast",      label: "Is Past Event",   type: "boolean",  },
            { key: "imageUrls",   label: "Image URLs (comma sep)", type: "tags", span: "full" },
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
            { key: "name",     label: "Full Name",             type: "text" },
            { key: "role",     label: "Role/Position",         type: "text" },
            { key: "order",    label: "Display Order",         type: "number" },
            { key: "status",   label: "Status",                type: "select",  options: ["running", "stopped"] },
            { key: "skills",   label: "Skills (comma sep)",    type: "tags",    span: "full" },
            { key: "bio",      label: "Short Bio",             type: "textarea",span: "full" },
            { key: "email",    label: "Email",                 type: "text" },
            { key: "linkedin", label: "LinkedIn URL",          type: "text" },
            { key: "github",   label: "GitHub URL",            type: "text" },
            { key: "photoUrl", label: "Profile Photo",         type: "image",   folder: "team", span: "full" },
          ]}
        />
      )
      case "projects": return (
        <ListManager
          title="Projects" description="Showcase your club's projects"
          fetchFn={api.projects.list} dataKey="projects"
          createFn={api.projects.create} updateFn={api.projects.update} deleteFn={api.projects.delete}
          displayName={(i) => String(i.title)}
          displaySub={(i) => `by ${String(i.author)} · ${String(i.status)}`}
          fields={[
            { key: "title",       label: "Project Title",       type: "text"     },
            { key: "author",      label: "Author",              type: "text"     },
            { key: "status",      label: "Status",              type: "select",  options: ["Production", "Development", "Beta"] },
            { key: "description", label: "Description",         type: "textarea",span: "full" },
            { key: "stack",       label: "Tech Stack (comma sep)",type: "tags",  span: "full" },
            { key: "githubUrl",   label: "GitHub URL",          type: "text"     },
            { key: "liveUrl",     label: "Live Demo URL",       type: "text"     },
            { key: "imageUrl",    label: "Project Screenshot",  type: "image",   folder: "projects", span: "full" },
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
            { key: "title",       label: "Achievement Title",   type: "text" },
            { key: "date",        label: "Year",                type: "text" },
            { key: "type",        label: "Type",                type: "select", options: ["Competition", "Hackathon", "Recognition", "Milestone"] },
            { key: "order",       label: "Display Order",       type: "number" },
            { key: "description", label: "Description",         type: "textarea", span: "full" },
            { key: "iconName",    label: "Icon",                type: "select", options: ["Trophy","Award","Star","Medal","Target","Zap"] },
            { key: "color",       label: "Color (hex)",         type: "text" },
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
            { key: "name",     label: "Resource Name",     type: "text",   span: "full" },
            { key: "category", label: "Category",          type: "text" },
            { key: "type",     label: "Type",              type: "select", options: ["Course", "Video", "Document", "Tool"] },
            { key: "url",      label: "URL",               type: "text",   span: "full" },
            { key: "order",    label: "Display Order",     type: "number" },
            { key: "featured", label: "Featured",          type: "boolean" },
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
          displaySub={(i) => `${String(i.url)} · ${String(i.followers || "—")} followers`}
          fields={[
            { key: "name",      label: "Platform Name",     type: "text" },
            { key: "platform",  label: "Platform ID",       type: "select", options: ["linkedin","github","instagram","twitter","youtube","discord"] },
            { key: "url",       label: "URL",               type: "text",   span: "full" },
            { key: "followers", label: "Followers (display)",type: "text" },
            { key: "color",     label: "Brand Color (hex)", type: "text" },
          ]}
        />
      )
      case "config":   return <ConfigTab />
      case "contacts": return <ContactsTab />
      case "users":    return <UsersTab />
    }
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="flex-shrink-0 border-r" style={{ borderColor: "#D0C8F0", width: sidebarOpen ? 180 : 52, transition: "width 0.2s ease" }}>
        <div className="p-2 space-y-0.5">
          <div className="flex items-center justify-between px-2 py-2 mb-2">
            {sidebarOpen && <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#9B8FC8" }}>Admin</span>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="neu-btn flex h-7 w-7 items-center justify-center rounded-lg">
              <ChevronRight className="h-3.5 w-3.5 transition-transform" style={{ color: "#7B6FC0", transform: sidebarOpen ? "rotate(180deg)" : "none" }} />
            </button>
          </div>
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition-colors"
              style={{
                background: activeTab === tab.id ? "rgba(107,79,232,0.12)" : "transparent",
                color: activeTab === tab.id ? "#6B4FE8" : "#7B6FC0",
                boxShadow: activeTab === tab.id ? "inset 2px 2px 6px #C2BAF0, inset -2px -2px 6px #FFFFFF" : "none",
              }}
              whileHover={{ x: 2 }}
              title={!sidebarOpen ? tab.label : undefined}
            >
              <span className="flex-shrink-0">{tab.icon}</span>
              {sidebarOpen && <span className="text-xs font-medium truncate">{tab.label}</span>}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 overflow-auto p-5">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}>
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
