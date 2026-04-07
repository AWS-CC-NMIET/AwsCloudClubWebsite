"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User, Edit3, Calendar, Palette, ChevronRight, Check, Camera,
  LogOut, Star, Loader2, Github, Linkedin
} from "lucide-react"
import { api } from "@/lib/api-client"
import { signOut, getStoredUsername } from "@/lib/auth-client"

const accentPresets = [
  { name: "Cloud Purple", value: "#6B4FE8", shadow: "rgba(107,79,232,0.4)" },
  { name: "AWS Orange",   value: "#FF9900", shadow: "rgba(255,153,0,0.4)"  },
  { name: "Sky Blue",     value: "#1A9DC8", shadow: "rgba(26,157,200,0.4)" },
  { name: "Emerald",      value: "#10B981", shadow: "rgba(16,185,129,0.4)" },
  { name: "Rose",         value: "#E85580", shadow: "rgba(232,85,128,0.4)" },
  { name: "Indigo",       value: "#4338CA", shadow: "rgba(67,56,202,0.4)"  },
]

const inputStyle: React.CSSProperties = {
  background: "#EAE6FF",
  boxShadow: "inset 3px 3px 8px #C2BAF0, inset -3px -3px 8px #FFFFFF",
  border: "none", outline: "none", borderRadius: "0.75rem",
  padding: "0.625rem 1rem", color: "#1E1060", width: "100%", fontSize: "0.875rem",
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } } }

interface Profile {
  id?: string
  displayName: string
  email: string
  bio?: string
  avatarUrl?: string
  linkedinUrl?: string
  githubUrl?: string
  skills?: string[]
  joinedAt?: string
}

export function ProfileApp({ onLogout }: { onLogout: () => void }) {
  const [profile, setProfile]         = useState<Profile | null>(null)
  const [loading, setLoading]         = useState(true)
  const [isEditing, setIsEditing]     = useState(false)
  const [saving, setSaving]           = useState(false)
  const [selectedAccent, setSelectedAccent] = useState("#6B4FE8")
  const [savedAccent, setSavedAccent]       = useState("#6B4FE8")

  // Edit form state
  const [editName, setEditName]           = useState("")
  const [editBio, setEditBio]             = useState("")
  const [editLinkedin, setEditLinkedin]   = useState("")
  const [editGithub, setEditGithub]       = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const { profile: p } = await api.profile.get() as { profile: Profile | null }
        if (p) {
          setProfile(p)
        } else {
          // Auto-create profile on first login
          const username = getStoredUsername() || ""
          const { profile: created } = await api.profile.create({
            displayName: username.split("@")[0] || "Cloud User",
          }) as { profile: Profile }
          setProfile(created)
        }
      } catch {
        // If profile fetch fails (e.g. no DynamoDB table yet), show minimal data
        const username = getStoredUsername() || ""
        setProfile({ displayName: username.split("@")[0] || "Cloud User", email: username })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const openEdit = () => {
    setEditName(profile?.displayName || "")
    setEditBio(profile?.bio || "")
    setEditLinkedin(profile?.linkedinUrl || "")
    setEditGithub(profile?.githubUrl || "")
    setIsEditing(true)
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const { profile: updated } = await api.profile.update({
        displayName: editName,
        bio: editBio,
        linkedinUrl: editLinkedin,
        githubUrl: editGithub,
      }) as { profile: Profile }
      setProfile(updated)
      setSavedAccent(selectedAccent)
      setIsEditing(false)
    } catch {
      // silently fail — keep modal open so user can retry
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setSelectedAccent(savedAccent)
    document.documentElement.style.setProperty("--primary", savedAccent)
    setIsEditing(false)
  }

  const applyAccent = (color: string) => {
    setSelectedAccent(color)
    document.documentElement.style.setProperty("--primary", color)
  }

  const handleSignOut = () => {
    signOut()
    onLogout()
  }

  const initials = (profile?.displayName || "?")
    .split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  const joinYear = profile?.joinedAt
    ? new Date(profile.joinedAt).getFullYear().toString()
    : new Date().getFullYear().toString()

  if (loading) return (
    <div className="flex h-60 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#6B4FE8" }} />
    </div>
  )

  return (
    <motion.div className="space-y-5" variants={container} initial="hidden" animate="show">

      {/* ── Profile Header Card ── */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-3xl p-6"
        style={{
          background: "linear-gradient(135deg, #6B4FE8 0%, #8B6FFF 60%, #B8A4FF 100%)",
          boxShadow: "8px 8px 24px rgba(107,79,232,0.30), -6px -6px 18px #FFFFFF",
        }}
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.14), transparent 70%)" }} />
        <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)" }} />

        <div className="relative z-10 flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <motion.div
              className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold text-white"
              style={{
                background: "rgba(255,255,255,0.22)", backdropFilter: "blur(10px)",
                border: "2px solid rgba(255,255,255,0.35)",
                boxShadow: "4px 4px 16px rgba(0,0,0,0.15)",
              }}
              whileHover={{ scale: 1.05 }}
            >
              {initials}
            </motion.div>
            <motion.button
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full"
              style={{ background: "rgba(255,255,255,0.90)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
              whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.92 }}
            >
              <Camera className="h-3.5 w-3.5" style={{ color: "#6B4FE8" }} />
            </motion.button>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white truncate">{profile?.displayName}</h2>
            <p className="text-sm font-medium truncate" style={{ color: "rgba(255,255,255,0.75)" }}>{profile?.email}</p>
            {profile?.bio && (
              <p className="text-xs mt-1 line-clamp-2" style={{ color: "rgba(255,255,255,0.60)" }}>{profile.bio}</p>
            )}
          </div>

          <motion.button
            onClick={openEdit}
            className="flex-shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold"
            style={{ background: "rgba(255,255,255,0.18)", color: "#FFFFFF", backdropFilter: "blur(10px)" }}
            whileHover={{ background: "rgba(255,255,255,0.28)", y: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </motion.button>
        </div>
      </motion.div>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(30,16,96,0.20)", backdropFilter: "blur(6px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="neu-panel w-full max-w-md rounded-2xl p-6"
              initial={{ scale: 0.90, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring" as const, stiffness: 300, damping: 26 }}
            >
              <h3 className="mb-5 text-lg font-bold" style={{ color: "#1E1060" }}>Edit Profile</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "#9B8FC8" }}>Display Name</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} style={inputStyle} placeholder="Your name" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "#9B8FC8" }}>Bio</label>
                  <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)}
                    style={{ ...inputStyle, resize: "none" }} rows={3} placeholder="Tell us about yourself..." />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "#9B8FC8" }}>LinkedIn URL</label>
                  <input value={editLinkedin} onChange={(e) => setEditLinkedin(e.target.value)} style={inputStyle} placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "#9B8FC8" }}>GitHub URL</label>
                  <input value={editGithub} onChange={(e) => setEditGithub(e.target.value)} style={inputStyle} placeholder="https://github.com/..." />
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <motion.button onClick={cancelEdit}
                  className="neu-btn flex-1 rounded-xl py-2.5 text-sm font-semibold"
                  style={{ color: "#7B6FC0" }} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                  Cancel
                </motion.button>
                <motion.button onClick={saveProfile} disabled={saving}
                  className="neu-btn-primary flex-1 rounded-xl py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-2"
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats ── */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Member Since", value: joinYear,         icon: Star,     color: "#5BA8D8" },
          { label: "Skills",       value: String(profile?.skills?.length || 0), icon: User, color: "#6B4FE8" },
          { label: "Events",       value: "—",              icon: Calendar, color: "#FF9900" },
        ].map((s) => (
          <div key={s.label} className="neu-raised-sm rounded-2xl p-4 text-center">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${s.color}14` }}>
              <s.icon className="h-4.5 w-4.5" style={{ color: s.color, width: 18, height: 18 }} />
            </div>
            <p className="text-2xl font-extrabold" style={{ color: "#1E1060" }}>{s.value}</p>
            <p className="text-[11px] font-medium mt-0.5" style={{ color: "#7B6FC0" }}>{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Links ── */}
      {(profile?.linkedinUrl || profile?.githubUrl) && (
        <motion.div variants={item} className="neu-raised rounded-2xl p-5">
          <h3 className="mb-3 font-bold" style={{ color: "#1E1060" }}>Links</h3>
          <div className="flex gap-3">
            {profile?.linkedinUrl && (
              <motion.a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                className="neu-btn flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
                style={{ color: "#0077B5" }} whileHover={{ y: -2 }}>
                <Linkedin className="h-4 w-4" /> LinkedIn
              </motion.a>
            )}
            {profile?.githubUrl && (
              <motion.a href={profile.githubUrl} target="_blank" rel="noopener noreferrer"
                className="neu-btn flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
                style={{ color: "#1E1060" }} whileHover={{ y: -2 }}>
                <Github className="h-4 w-4" /> GitHub
              </motion.a>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Account Settings ── */}
      <motion.div variants={item} className="neu-raised rounded-2xl p-5">
        <h3 className="mb-3 font-bold" style={{ color: "#1E1060" }}>Settings</h3>
        {[
          { label: "Notifications", desc: "Event reminders and updates" },
          { label: "Privacy",       desc: "Control your data and visibility" },
        ].map((s) => (
          <motion.button key={s.label}
            className="neu-inset-sm flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left mb-2"
            whileHover={{ x: 3 }} transition={{ type: "spring" as const, stiffness: 300 }}>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: "#1E1060" }}>{s.label}</p>
              <p className="text-xs" style={{ color: "#9B8FC8" }}>{s.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: "#C2BAF0" }} />
          </motion.button>
        ))}
      </motion.div>

      {/* ── Theme ── */}
      <motion.div variants={item} className="neu-raised rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5" style={{ color: "#6B4FE8" }} />
          <h3 className="font-bold" style={{ color: "#1E1060" }}>Accent Color</h3>
          <span className="ml-auto text-xs" style={{ color: "#9B8FC8" }}>Live preview</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {accentPresets.map((preset) => (
            <motion.button key={preset.value} onClick={() => applyAccent(preset.value)}
              className="group flex flex-col items-center gap-1.5" whileHover={{ y: -3 }} whileTap={{ scale: 0.92 }}>
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl"
                style={{
                  background: preset.value,
                  boxShadow: selectedAccent === preset.value
                    ? `4px 4px 14px ${preset.shadow}, -3px -3px 10px #FFFFFF`
                    : "3px 3px 8px #C2BAF0, -3px -3px 8px #FFFFFF",
                }}>
                <AnimatePresence>
                  {selectedAccent === preset.value && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Check className="h-5 w-5 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className="text-[10px] font-medium" style={{ color: "#9B8FC8" }}>{preset.name.split(" ")[0]}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Sign Out ── */}
      <motion.div variants={item}>
        <motion.button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold"
          style={{
            background: "rgba(232,85,85,0.08)", color: "#E85555",
            boxShadow: "4px 4px 12px rgba(232,85,85,0.08), -4px -4px 12px #FFFFFF",
          }}
          whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
