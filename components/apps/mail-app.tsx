// components/apps/mail-app.tsx
// Contact Us — a Mail.app compose window that delivers via /api/contact (SES).
// If the backend is unreachable, it offers a pre-filled email instead.

"use client"

import React, { useRef, useState } from "react"
import { AlertCircle, CheckCircle2, Clock, Loader2, Mail, MapPin, PenSquare, Send } from "lucide-react"
import { api } from "@/lib/api-client"
import { systemActions } from "@/lib/aws-store"
import { CLUB, OFFICE_HOURS } from "@/lib/club-content"
import { AppShell, MacButton, Sidebar, SidebarItem, SidebarSection, Toolbar } from "./shared/mac-ui"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EMPTY = { name: "", email: "", subject: "", message: "" }

function mailtoHref(form: typeof EMPTY) {
  const body = `${form.message}\n\n— ${form.name}${form.email ? ` (${form.email})` : ""}`
  return `mailto:${CLUB.email}?subject=${encodeURIComponent(form.subject || "Hello from the website")}&body=${encodeURIComponent(body)}`
}

export function MailApp() {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deliveryFailed, setDeliveryFailed] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const update = (key: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setDeliveryFailed(false)

    const clean = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    }
    if (!clean.name || !clean.email || !clean.subject || !clean.message) {
      setError("Please fill out all fields.")
      return
    }
    if (!EMAIL_REGEX.test(clean.email)) {
      setError("Please enter a valid email address.")
      return
    }

    setLoading(true)
    try {
      await api.contact.submit(clean)
      setSent(true)
      setForm(EMPTY)
      systemActions.showToast("Message sent — we'll get back to you soon!")
    } catch (err) {
      setDeliveryFailed(true)
      setError(
        (err as Error)?.message && !/HTTP 5|Failed to fetch|Request failed/i.test((err as Error).message)
          ? (err as Error).message
          : "We couldn't deliver your message right now."
      )
    } finally {
      setLoading(false)
    }
  }

  const fieldCls =
    "w-full bg-transparent py-2 text-[13px] text-(--os-text) outline-none placeholder:text-(--os-text-dim)"

  return (
    <AppShell>
      <Sidebar hideOnNarrow>
        <SidebarSection title="Mailboxes">
          <SidebarItem icon={PenSquare} label="New Message" active />
        </SidebarSection>
        <SidebarSection title="Contact Info">
          <div className="space-y-3 px-2.5 text-[12px] leading-relaxed">
            <p className="flex gap-2 text-(--os-text)">
              <Mail className="mt-0.5 size-3.5 shrink-0 text-[#FF9900]" />
              <a href={`mailto:${CLUB.email}`} className="break-all hover:underline">{CLUB.email}</a>
            </p>
            <p className="flex gap-2 whitespace-pre-line text-(--os-text)">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-(--accent)" />
              {CLUB.address}
            </p>
          </div>
        </SidebarSection>
        <SidebarSection title="Office Hours">
          <div className="space-y-1 px-1">
            {OFFICE_HOURS.map(h => (
              <div key={h.day} className="flex items-center justify-between rounded-md px-1.5 py-1 text-[12px]">
                <span className="text-(--os-text)">{h.day}</span>
                <span className="text-(--os-text-dim)">{h.time}</span>
              </div>
            ))}
          </div>
        </SidebarSection>
      </Sidebar>

      <div className="flex min-w-0 flex-1 flex-col">
        <Toolbar
          title="New Message"
          subtitle="We usually reply within a few days"
          right={
            !sent && (
              <MacButton variant="primary" disabled={loading} className="px-3 py-1.5 @xl:hidden" onClick={() => formRef.current?.requestSubmit()}>
                {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                {loading ? "Sending…" : "Send"}
              </MacButton>
            )
          }
        />

        {sent ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-8" />
            </div>
            <h2 className="text-lg font-bold text-(--os-text)">Message Sent!</h2>
            <p className="max-w-sm text-xs text-(--os-text-dim)">Thanks for reaching out. We&apos;ll get back to you soon.</p>
            <MacButton variant="primary" onClick={() => setSent(false)}>Write Another</MacButton>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
            <div className="divide-y divide-(--win-divider) border-b border-(--win-divider) px-4">
              <Field label="To:">
                <span className="inline-flex max-w-full items-center rounded-full bg-(--accent)/12 px-2 py-0.5 text-[12px] font-medium text-(--accent)">
                  <span className="truncate">AWS SBG NMIET &lt;{CLUB.email}&gt;</span>
                </span>
              </Field>
              <Field label="Name:">
                <input required maxLength={100} value={form.name} onChange={update("name")} placeholder="Your name" className={fieldCls} />
              </Field>
              <Field label="From:">
                <input required type="email" maxLength={254} value={form.email} onChange={update("email")} placeholder="your@email.com" className={fieldCls} />
              </Field>
              <Field label="Subject:">
                <input required maxLength={200} value={form.subject} onChange={update("subject")} placeholder="What's this about?" className={fieldCls} />
              </Field>
            </div>

            <textarea
              required
              maxLength={5000}
              value={form.message}
              onChange={update("message")}
              placeholder="Write your message…"
              className="min-h-48 flex-1 resize-none bg-transparent px-4 py-3 text-[13px] leading-relaxed text-(--os-text) outline-none placeholder:text-(--os-text-dim)"
            />

            {error && (
              <div className="mx-4 mb-3 space-y-2 rounded-lg border border-red-500/25 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                <p className="flex items-center gap-2"><AlertCircle className="size-4 shrink-0" /> {error}</p>
                {deliveryFailed && (
                  <MacButton variant="secondary" href={mailtoHref(form)}>
                    <Mail className="size-3.5" /> Send via email instead
                  </MacButton>
                )}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-(--win-divider) px-4 py-3">
              <span className="flex items-center gap-1.5 text-[11px] text-(--os-text-dim)">
                <Clock className="size-3.5" /> {CLUB.city}
              </span>
              <MacButton variant="primary" type="submit" disabled={loading}>
                {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                {loading ? "Sending…" : "Send Message"}
              </MacButton>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex min-h-10 items-center gap-3">
      <span className="w-14 shrink-0 text-right text-[12px] text-(--os-text-dim)">{label}</span>
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  )
}
