"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, MapPin, Mail, Phone, CheckCircle, Loader2 } from "lucide-react"
import { api } from "@/lib/api-client"

const inputCls = "neu-input w-full rounded-xl px-4 py-2.5 text-sm"

export function ContactApp() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await api.contact.submit({ name, email, subject, message })
      setSubmitted(true)
      setName(""); setEmail(""); setSubject(""); setMessage("")
      setTimeout(() => setSubmitted(false), 4000)
    } catch (err) {
      setError((err as Error).message || "Failed to send. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Contact Form */}
        <motion.div
          className="neu-raised rounded-2xl p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring" as const, stiffness: 260 }}
        >
          <h2 className="mb-5 text-lg font-bold" style={{ color: "#1E1060" }}>Get in Touch</h2>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                className="flex flex-col items-center justify-center py-12 gap-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "rgba(80,200,138,0.12)" }}>
                  <CheckCircle className="h-8 w-8" style={{ color: "#50C88A" }} />
                </div>
                <div className="text-center">
                  <h3 className="font-bold" style={{ color: "#1E1060" }}>Message Sent!</h3>
                  <p className="text-sm mt-1" style={{ color: "#7B6FC0" }}>{"We'll"} get back to you soon.</p>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "#9B8FC8" }}>Name</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Your name" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "#9B8FC8" }}>Email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="your@email.com" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "#9B8FC8" }}>Subject</label>
                  <input type="text" required value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls} placeholder="What's this about?" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "#9B8FC8" }}>Message</label>
                  <textarea
                    required rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={`${inputCls} resize-none`}
                    placeholder="Your message..."
                  />
                </div>
                {error && (
                  <p className="text-sm" style={{ color: "#E85555" }}>{error}</p>
                )}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="neu-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold disabled:opacity-70"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {loading ? "Sending..." : "Send Message"}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Info + Hours */}
        <div className="space-y-4">
          <motion.div
            className="neu-raised rounded-2xl p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring" as const, stiffness: 260, delay: 0.1 }}
          >
            <h2 className="mb-4 text-lg font-bold" style={{ color: "#1E1060" }}>Contact Information</h2>
            <div className="space-y-4">
              {[
                { icon: MapPin, label: "Location", value: "NMIET Campus, Talegaon Dabhade\nPune, Maharashtra 410507", color: "#6B4FE8" },
                { icon: Mail,   label: "Email",    value: "awscloudclub.nmiet@gmail.com",                              color: "#FF9900" },
                { icon: Phone,  label: "Phone",    value: "Update phone in admin panel",                               color: "#50C88A" },
              ].map((info) => (
                <div key={info.label} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${info.color}12` }}>
                    <info.icon className="h-4 w-4" style={{ color: info.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: "#1E1060" }}>{info.label}</h3>
                    <p className="text-sm whitespace-pre-line" style={{ color: "#7B6FC0" }}>{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="neu-raised rounded-2xl p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring" as const, stiffness: 260, delay: 0.2 }}
          >
            <h2 className="mb-4 text-lg font-bold" style={{ color: "#1E1060" }}>Club Hours</h2>
            <div className="space-y-2">
              {[
                { day: "Mon – Fri",  time: "10:00 AM – 6:00 PM" },
                { day: "Saturday",   time: "12:00 PM – 4:00 PM" },
                { day: "Sunday",     time: "Closed" },
              ].map((s) => (
                <div key={s.day} className="neu-inset-sm flex justify-between rounded-xl px-4 py-2.5">
                  <span className="text-sm font-medium" style={{ color: "#1E1060" }}>{s.day}</span>
                  <span className="text-sm" style={{ color: "#7B6FC0" }}>{s.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
