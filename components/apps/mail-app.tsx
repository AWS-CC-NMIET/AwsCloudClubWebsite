// components/apps/mail-app.tsx
// macOS Mail application interface connecting directly with AWS SES & DynamoDB

"use client"

import React, { useState } from "react"
import { Send, CheckCircle2, Mail as MailIcon, Inbox, AlertCircle, Loader2 } from "lucide-react"
import { api } from "@/lib/api-client"
import { systemActions } from "@/lib/aws-store"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function MailApp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    year: "3rd Year",
    track: "Cloud Architecture",
    subject: "Application to Join AWS Cloud Club SBG",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanName = formData.name.trim()
    const cleanEmail = formData.email.trim().toLowerCase()
    const cleanSubject = formData.subject.trim()
    const cleanMessage = formData.message.trim()

    if (!cleanName || !cleanEmail || !cleanSubject || !cleanMessage) {
      setError("Please fill out all fields.")
      return
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    setLoading(true)

    try {
      await api.contact.submit({
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: `[Year: ${formData.year} | Track: ${formData.track}]\n\n${cleanMessage}`,
      })
      setSubmitted(true)
      systemActions.showToast("✉️ Message Sent to AWS Club Leads!")
    } catch (err: any) {
      setError(err?.message || "Failed to deliver message. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full w-full flex-col md:flex-row bg-(--win-bg) text-(--os-text)">
      {/* ── Left Mailboxes Sidebar ───────────────────────────────────────────── */}
      <aside className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-(--win-divider) bg-black/[0.02] dark:bg-white/[0.02] p-3 space-y-4">
        <div>
          <p className="px-2 text-[11px] font-semibold text-(--os-text-dim) uppercase tracking-wider">
            Mailboxes
          </p>
          <div className="mt-1 space-y-0.5">
            <button className="flex w-full items-center justify-between rounded-md bg-(--accent) px-2.5 py-1.5 text-xs font-medium text-white shadow-xs">
              <div className="flex items-center gap-2">
                <MailIcon className="size-3.5" />
                <span>New Message</span>
              </div>
            </button>
            <button className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium text-(--os-text) hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-2">
                <Inbox className="size-3.5" />
                <span>Club Inquiries</span>
              </div>
              <span className="text-[10px] opacity-70">Official</span>
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-(--win-divider) bg-black/5 dark:bg-white/5 p-3 text-xs space-y-1.5">
          <p className="font-semibold text-(--os-text)">Club Lead Contact</p>
          <p className="text-[11px] text-(--os-text-dim)">awscloudclub@sbg.edu</p>
          <p className="text-[11px] text-(--os-text-dim)">Responses within 24 hours.</p>
        </div>
      </aside>

      {/* ── Right Compose Email View ─────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        {submitted ? (
          <div className="flex h-full flex-col items-center justify-center text-center space-y-3 py-12">
            <div className="size-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="size-8" />
            </div>
            <h2 className="text-xl font-bold text-(--os-text)">Application Received!</h2>
            <p className="text-xs text-(--os-text-dim) max-w-sm">
              Thank you for reaching out to AWS Cloud Club SBG. Our student leadership team has
              received your application and will email you with workshop discord invites.
            </p>
            <button
              onClick={() => {
                setSubmitted(false)
                setFormData(prev => ({ ...prev, message: "" }))
              }}
              className="mt-2 rounded-lg bg-(--accent) px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
            >
              Send Another Note
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
            <div className="border-b border-(--win-divider) pb-2">
              <h2 className="text-base font-bold text-(--os-text)">New Message to Club Leads</h2>
              <p className="text-xs text-(--os-text-dim)">
                Apply for membership, propose a collaboration, or ask about upcoming cohorts.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-(--os-text-dim)">Your Full Name</label>
                  <input
                    required
                    maxLength={100}
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alex Sharma"
                    className="w-full rounded-lg border border-(--win-divider) bg-black/5 dark:bg-white/5 px-3 py-2 text-sm text-(--os-text) outline-none focus:border-(--accent)"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-(--os-text-dim)">College Email</label>
                  <input
                    required
                    type="email"
                    maxLength={100}
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@college.edu"
                    className="w-full rounded-lg border border-(--win-divider) bg-black/5 dark:bg-white/5 px-3 py-2 text-sm text-(--os-text) outline-none focus:border-(--accent)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-(--os-text-dim)">Current Academic Year</label>
                  <select
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: e.target.value })}
                    className="w-full rounded-lg border border-(--win-divider) bg-black/5 dark:bg-white/5 px-3 py-2 text-sm text-(--os-text) outline-none focus:border-(--accent)"
                  >
                    <option value="1st Year">1st Year (Freshman)</option>
                    <option value="2nd Year">2nd Year (Sophomore)</option>
                    <option value="3rd Year">3rd Year (Junior)</option>
                    <option value="4th Year">4th Year (Senior)</option>
                    <option value="Faculty / Alumni">Faculty / Alumni</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-(--os-text-dim)">Preferred Cloud Domain</label>
                  <select
                    value={formData.track}
                    onChange={e => setFormData({ ...formData, track: e.target.value })}
                    className="w-full rounded-lg border border-(--win-divider) bg-black/5 dark:bg-white/5 px-3 py-2 text-sm text-(--os-text) outline-none focus:border-(--accent)"
                  >
                    <option value="Cloud Architecture">Cloud Architecture & DevOps</option>
                    <option value="AI / ML Bedrock">AI / ML & AWS Bedrock</option>
                    <option value="Serverless Full-Stack">Serverless & Web Apps</option>
                    <option value="Cloud Security">Cloud Security & Governance</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-(--os-text-dim)">Subject</label>
                <input
                  required
                  maxLength={200}
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full rounded-lg border border-(--win-divider) bg-black/5 dark:bg-white/5 px-3 py-2 text-sm text-(--os-text) outline-none focus:border-(--accent)"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-(--os-text-dim)">Message / Why do you want to join?</label>
                <textarea
                  required
                  maxLength={5000}
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your background, any cloud interest, or questions..."
                  className="w-full rounded-lg border border-(--win-divider) bg-black/5 dark:bg-white/5 px-3 py-2 text-sm text-(--os-text) outline-none focus:border-(--accent) resize-none"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-(--accent) px-5 py-2.5 text-xs font-semibold text-white hover:opacity-90 shadow-sm transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Transmitting through AWS SES...</span>
                </>
              ) : (
                <>
                  <Send className="size-3.5" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
