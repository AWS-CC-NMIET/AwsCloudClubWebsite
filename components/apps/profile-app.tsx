"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User, Edit3, Calendar, ChevronRight, Camera,
  LogOut, Star, Loader2, Github, Linkedin, X, Save,
} from "lucide-react"
import { api, uploadFileToS3 } from "@/lib/api-client"
import { signOut, getStoredUsername } from "@/lib/auth-client"

const INPUT_STYLE: React.CSSProperties = {
  background: "rgba(183,168,250,0.65)",
  boxShadow: "inset 2px 2px 6px rgba(107,79,232,0.18), inset -2px -2px 6px rgba(255,255,255,0.55)",
  border: "1px solid rgba(107,79,232,0.14)",
  outline: "none",
  borderRadius: "0.625rem",
  padding: "0.5rem 0.75rem",
  color: "#1E1060",
  width: "100%",
  fontSize: "0.85rem",
}

const CARD = "rounded-xl border"
const CARD_BG: React.CSSProperties = { background: "rgba(107,79,232,0.05)", border: "1px solid rgba(107,79,232,0.13)" }

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
  const [profile, setProfile]               = useState<Profile | null>(null)
  const [loading, setLoading]               = useState(true)
  const [isEditing, setIsEditing]           = useState(false)
  const [saving, setSaving]                 = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [editName, setEditName]         = useState("")
  const [editBio, setEditBio]           = useState("")
  const [editLinkedin, setEditLinkedin] = useState("")
  const [editGithub, setEditGithub]     = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const { profile: p } = await api.profile.get() as { profile: Profile | null }
        if (p) {
          setProfile(p)
        } else {
          const username = getStoredUsername() || ""
          const { profile: created } = await api.profile.create({
            displayName: username.split("@")[0] || "Cloud User",
          }) as { profile: Profile }
          setProfile(created)
        }
      } catch {
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
      setIsEditing(false)
    } catch {
      // keep modal open so user can retry
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    e.target.value = ""
    try {
      const url = await uploadFileToS3("general", file)
      const { profile: updated } = await api.profile.update({ avatarUrl: url }) as { profile: Profile }
      setProfile(updated)
    } catch (err) {
      console.error("Avatar upload failed:", err)
    } finally {
      setUploadingAvatar(false)
    }
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
    <motion.div className="space-y-4 p-1" variants={container} initial="hidden" animate="show">

      {/* ── Profile Hero Card ─────────────────────────────────── */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl p-5"
        style={{
          background: "linear-gradient(135deg, #6B4FE8 0%, #8B6FFF 60%, #B8A4FF 100%)",
          boxShadow: "6px 6px 20px rgba(107,79,232,0.28), -4px -4px 14px rgba(255,255,255,0.65)",
        }}
      >
        {/* decorative blobs */}
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.13), transparent 70%)" }} />
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.07), transparent 70%)" }} />

        <div className="relative z-10 flex items-center gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <motion.div
              className="flex h-16 w-16 items-center justify-center rounded-xl text-xl font-bold text-white overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.20)",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(255,255,255,0.35)",
                boxShadow: "3px 3px 12px rgba(0,0,0,0.12)",
              }}
              whileHover={{ scale: 1.05 }}
            >
              {profile?.avatarUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                : initials
              }
            </motion.div>
            <motion.button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full"
              style={{ background: "rgba(255,255,255,0.92)", boxShadow: "0 2px 6px rgba(0,0,0,0.14)" }}
              whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.92 }}
              disabled={uploadingAvatar}
              title="Change profile photo"
            >
              {uploadingAvatar
                ? <Loader2 className="h-3 w-3 animate-spin" style={{ color: "#6B4FE8" }} />
                : <Camera className="h-3 w-3" style={{ color: "#6B4FE8" }} />
              }
            </motion.button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white truncate leading-tight">{profile?.displayName}</h2>
            <p className="text-xs font-medium truncate mt-0.5" style={{ color: "rgba(255,255,255,0.72)" }}>{profile?.email}</p>
            {profile?.bio && (
              <p className="text-[11px] mt-1.5 line-clamp-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.60)" }}>{profile.bio}</p>
            )}
          </div>

          {/* Edit button */}
          <motion.button
            onClick={openEdit}
            className="flex-shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold"
            style={{ background: "rgba(255,255,255,0.16)", color: "#FFFFFF", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.25)" }}
            whileHover={{ background: "rgba(255,255,255,0.26)", y: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </motion.button>
        </div>
      </motion.div>

      {/* ── Edit Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(30,16,96,0.25)", backdropFilter: "blur(8px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl overflow-hidden"
              style={{
                background: "rgba(212,206,255,0.98)",
                border: "1px solid rgba(107,79,232,0.22)",
                boxShadow: "0 24px 60px rgba(107,79,232,0.28)",
              }}
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: "spring" as const, stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b"
                style={{ borderColor: "rgba(107,79,232,0.15)" }}>
                <p className="text-sm font-bold" style={{ color: "#1E1060" }}>Edit Profile</p>
                <motion.button
                  onClick={() => setIsEditing(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: "rgba(107,79,232,0.08)", border: "1px solid rgba(107,79,232,0.12)" }}
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                  <X className="h-3.5 w-3.5" style={{ color: "#7B6FC0" }} />
                </motion.button>
              </div>

              {/* Modal body — scrolls when keyboard pushes viewport up on mobile */}
              <div className="px-5 py-4 space-y-3 overflow-y-auto" style={{ maxHeight: "52vh" }}>
                {[
                  { label: "Display Name",  value: editName,     setter: setEditName,     placeholder: "Your name",                  multiline: false },
                  { label: "Bio",           value: editBio,      setter: setEditBio,      placeholder: "Tell us about yourself…",   multiline: true  },
                  { label: "LinkedIn URL",  value: editLinkedin, setter: setEditLinkedin, placeholder: "https://linkedin.com/in/…", multiline: false },
                  { label: "GitHub URL",    value: editGithub,   setter: setEditGithub,   placeholder: "https://github.com/…",       multiline: false },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider" style={{ color: "#9B8FC8" }}>
                      {f.label}
                    </label>
                    {f.multiline
                      ? <textarea value={f.value} onChange={(e) => f.setter(e.target.value)}
                          style={{ ...INPUT_STYLE, resize: "none" }} rows={3} placeholder={f.placeholder} />
                      : <input value={f.value} onChange={(e) => f.setter(e.target.value)}
                          style={INPUT_STYLE} placeholder={f.placeholder} />
                    }
                  </div>
                ))}
              </div>

              {/* Modal footer */}
              <div className="flex gap-2 px-5 pb-5">
                <button onClick={() => setIsEditing(false)}
                  className="flex-1 rounded-xl py-2.5 text-xs font-semibold"
                  style={{ background: "rgba(107,79,232,0.06)", color: "#7B6FC0", border: "1px solid rgba(107,79,232,0.12)" }}>
                  Cancel
                </button>
                <motion.button onClick={saveProfile} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold text-white disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#6B4FE8,#8B6FFF)", boxShadow: "0 4px 14px rgba(107,79,232,0.35)" }}
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {saving ? "Saving…" : "Save Changes"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats Row ─────────────────────────────────────────── */}
      <motion.div variants={item} className="grid grid-cols-3 gap-2.5">
        {[
          { label: "Member Since", value: joinYear,                                       icon: Star,     color: "#5BA8D8" },
          { label: "Skills",       value: String(profile?.skills?.length || 0),           icon: User,     color: "#6B4FE8" },
          { label: "Events",       value: "—",                                            icon: Calendar, color: "#FF9900" },
        ].map((s) => (
          <div key={s.label} className={`${CARD} p-4 text-center`} style={CARD_BG}>
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: `${s.color}18` }}>
              <s.icon className="h-4 w-4" style={{ color: s.color }} />
            </div>
            <p className="text-xl font-extrabold" style={{ color: "#1E1060" }}>{s.value}</p>
            <p className="text-[10px] font-medium mt-0.5" style={{ color: "#9B8FC8" }}>{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Links ─────────────────────────────────────────────── */}
      {(profile?.linkedinUrl || profile?.githubUrl) && (
        <motion.div variants={item} className={`${CARD} p-4`} style={CARD_BG}>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "#9B8FC8" }}>Links</p>
          <div className="flex flex-wrap gap-2">
            {profile?.linkedinUrl && (
              <motion.a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold"
                style={{ background: "rgba(0,119,181,0.08)", color: "#0077B5", border: "1px solid rgba(0,119,181,0.18)" }}
                whileHover={{ y: -2 }}>
                <Linkedin className="h-3.5 w-3.5" /> LinkedIn
              </motion.a>
            )}
            {profile?.githubUrl && (
              <motion.a href={profile.githubUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold"
                style={{ background: "rgba(30,16,96,0.07)", color: "#1E1060", border: "1px solid rgba(30,16,96,0.14)" }}
                whileHover={{ y: -2 }}>
                <Github className="h-3.5 w-3.5" /> GitHub
              </motion.a>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Settings ──────────────────────────────────────────── */}
      <motion.div variants={item} className={`${CARD} p-4`} style={CARD_BG}>
        <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "#9B8FC8" }}>Settings</p>
        <div className="space-y-2">
          {[
            { label: "Notifications", desc: "Event reminders and updates" },
            { label: "Privacy",       desc: "Control your data and visibility" },
          ].map((s) => (
            <motion.button key={s.label}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left"
              style={{ background: "rgba(107,79,232,0.04)", border: "1px solid rgba(107,79,232,0.10)" }}
              whileHover={{ x: 3 }} transition={{ type: "spring" as const, stiffness: 300 }}>
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: "#1E1060" }}>{s.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "#9B8FC8" }}>{s.desc}</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "rgba(107,79,232,0.35)" }} />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Sign Out ───────────────────────────────────────────── */}
      <motion.div variants={item}>
        <motion.button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold"
          style={{ background: "rgba(232,85,85,0.08)", color: "#E85555", border: "1px solid rgba(232,85,85,0.18)" }}
          whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </motion.button>
      </motion.div>

    </motion.div>
  )
}
