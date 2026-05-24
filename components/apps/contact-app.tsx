"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, MapPin, Mail, CheckCircle, Loader2, CornerDownRight } from "lucide-react"
import { api } from "@/lib/api-client"

export function ContactApp() {
  const [name, setName]       = useState("")
  const [email, setEmail]     = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState("")

  const handleSubmit = async (e: { preventDefault(): void }) => {
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

  const inputCls = "w-full bg-white/60 border border-white/70 rounded-lg px-4 py-2.5 text-sm text-indigo-950 placeholder:text-indigo-950/30 outline-none focus:ring-2 focus:ring-indigo-300/40 transition-all"

  return (
    <div className="flex h-full flex-col md:flex-row gap-4 p-1 overflow-hidden" style={{ minHeight: "520px" }}>

      {/* ── Left sidebar ── */}
      <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-3">
        {/* Path header */}
        <div className="bg-white/30 backdrop-blur-sm border border-white/40 shadow-2xs rounded-xl p-3">
          <p className="text-[10px] font-bold text-indigo-950/50 uppercase tracking-wider px-2 mb-2">Contact</p>
          <div className="flex items-center gap-2 px-2 py-1 bg-white/20 border border-white/30 rounded-lg text-indigo-950 text-xs font-semibold">
            <CornerDownRight className="h-3 w-3 text-indigo-950/60" />
            <span>/root/contact_us</span>
          </div>
        </div>

        {/* Contact info */}
        <div className="bg-white/35 backdrop-blur-sm border border-white/40 shadow-xs rounded-xl p-4">
          <p className="text-[9px] font-bold text-indigo-950/40 uppercase tracking-wider mb-3">Contact Info</p>
          <div className="space-y-3.5">
            {[
              { icon: MapPin, label: "Location", value: "NMIET Campus, Talegaon Dabhade\nPune, Maharashtra 410507", color: "#6B4FE8" },
              { icon: Mail,   label: "Email",    value: "aws.studentbuildersgroup.nmiet@gmail.com",                 color: "#FF9900" },
            ].map((info) => (
              <div key={info.label} className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg mt-0.5" style={{ background: `${info.color}15` }}>
                  <info.icon className="h-3.5 w-3.5" style={{ color: info.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-indigo-950/40 uppercase tracking-wider mb-0.5">{info.label}</p>
                  <p className="text-xs text-indigo-950/75 whitespace-pre-line leading-relaxed break-words">{info.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Office hours */}
        <div className="bg-white/35 backdrop-blur-sm border border-white/40 shadow-xs rounded-xl p-4">
          <p className="text-[9px] font-bold text-indigo-950/40 uppercase tracking-wider mb-3">Office Hours</p>
          <div className="space-y-1.5">
            {[
              { day: "Mon – Fri",  time: "10:00 AM – 6:00 PM" },
              { day: "Saturday",   time: "12:00 PM – 4:00 PM" },
              { day: "Sunday",     time: "Closed"              },
            ].map((s) => (
              <div key={s.day} className="flex items-center justify-between bg-white/50 border border-white/60 rounded-lg px-3 py-2">
                <span className="text-xs font-medium text-indigo-950/80">{s.day}</span>
                <span className="text-xs text-indigo-950/50">{s.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right — form ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white/35 backdrop-blur-sm border border-white/40 shadow-xs rounded-xl overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-white/30 bg-white/20 px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#6B4FE8]" />
            <h3 className="text-xs font-semibold text-indigo-950">Send a Message</h3>
          </div>
          <span className="text-[10px] text-indigo-950/50 bg-white/30 px-2 py-0.5 rounded border border-white/20">new_message.txt</span>
        </div>

        {/* Form content */}
        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                className="flex flex-col items-center justify-center h-full min-h-64 gap-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100">
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-indigo-950">Message Sent!</h3>
                  <p className="text-sm mt-1 text-indigo-950/60">{"We'll"} get back to you soon.</p>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-4 max-w-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold text-indigo-950/40 uppercase tracking-wider">Name</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Your name" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold text-indigo-950/40 uppercase tracking-wider">Email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="your@email.com" />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-indigo-950/40 uppercase tracking-wider">Subject</label>
                  <input type="text" required value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls} placeholder="What's this about?" />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-indigo-950/40 uppercase tracking-wider">Message</label>
                  <textarea
                    required rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={`${inputCls} resize-none`}
                    placeholder="Your message..."
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 bg-[#6B4FE8] hover:bg-[#5B3FD8] text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-60 transition-colors"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {loading ? "Sending..." : "Send Message"}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
