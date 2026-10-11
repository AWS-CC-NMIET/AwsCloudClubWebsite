"use client"

// components/os/login-screen.tsx
// macOS-style lock / login screen: blurred wallpaper, clock, and user tiles
// (Guest · Member). Members sign in with Cognito via /api/auth.

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, ChevronLeft, Eye, EyeOff, Loader2, User, UserPlus } from "lucide-react"
import { signIn, signUp, confirmSignUp, resendCode, forgotPassword, resetPassword } from "@/lib/auth-client"
import { useSystemStore, WALLPAPER_STYLES } from "@/lib/aws-store"
import { LiveWallpaper } from "./live-wallpaper"
import { CLUB } from "@/lib/club-content"

type Phase = "lock" | "signin" | "register" | "verify" | "forgot" | "reset"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_HINT = "At least 8 characters, with upper- and lowercase letters and a number."

function cognitoMessage(err: unknown): string {
  const msg = (err as { message?: string })?.message || "Something went wrong"
  if (/UserNotFound|User does not exist/.test(msg)) return "No account found with this email."
  if (/NotAuthorized/.test(msg)) return "Incorrect email or password."
  if (/UserNotConfirmed/.test(msg)) return "Please verify your email first."
  if (/UsernameExists/.test(msg)) return "An account with this email already exists."
  if (/InvalidPassword/.test(msg)) return PASSWORD_HINT
  if (/CodeMismatch/.test(msg)) return "That code isn't right. Check your email and try again."
  if (/ExpiredCode/.test(msg)) return "That code has expired. Request a new one."
  if (/LimitExceeded|Too many/.test(msg)) return "Too many attempts. Please wait a minute and try again."
  return msg
}

export function LoginScreen({ onLogin, initialPhase = "lock" }: { onLogin: () => void; initialPhase?: Phase }) {
  const appearance = useSystemStore(s => s.appearance)
  const wallpaper = useSystemStore(s => s.wallpaper)
  const background = WALLPAPER_STYLES[wallpaper]?.dark ?? WALLPAPER_STYLES.dynamic.dark

  const [phase, setPhase] = useState<Phase>(initialPhase)
  const [now, setNow] = useState<Date | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [code, setCode] = useState("")
  const [newPw, setNewPw] = useState("")
  const [pendingEmail, setPendingEmail] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 10_000)
    return () => clearInterval(id)
  }, [])

  // Enter on the lock screen continues as a guest.
  useEffect(() => {
    if (phase !== "lock") return
    const onKey = (e: KeyboardEvent) => e.key === "Enter" && onLogin()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [phase, onLogin])

  const go = (next: Phase) => {
    setError("")
    setNotice("")
    setShowPw(false)
    setPhase(next)
  }

  const run = async (fn: () => Promise<void>) => {
    setError("")
    setLoading(true)
    try {
      await fn()
    } catch (err) {
      setError(cognitoMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = email.trim().toLowerCase()
    if (!EMAIL_RE.test(cleanEmail)) return setError("Enter the email you signed up with.")
    if (!password) return setError("Enter your password.")
    run(async () => {
      await signIn(cleanEmail, password)
      onLogin()
    })
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = email.trim().toLowerCase()
    if (!name.trim()) return setError("Enter your name.")
    if (!EMAIL_RE.test(cleanEmail)) return setError("Enter a valid email address.")
    if (password.length < 8) return setError(PASSWORD_HINT)
    if (password !== confirmPw) return setError("Passwords don't match.")
    run(async () => {
      await signUp(cleanEmail, password, name.trim())
      setPendingEmail(cleanEmail)
      go("verify")
    })
  }

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return setError("Enter the 6-digit code from your email.")
    run(async () => {
      await confirmSignUp(pendingEmail, code.trim())
      if (password) {
        await signIn(pendingEmail, password)
        onLogin()
      } else {
        setEmail(pendingEmail)
        go("signin")
        setNotice("Email verified — sign in to continue.")
      }
    })
  }

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = email.trim().toLowerCase()
    if (!EMAIL_RE.test(cleanEmail)) return setError("Enter the email you signed up with.")
    run(async () => {
      await forgotPassword(cleanEmail)
      setPendingEmail(cleanEmail)
      go("reset")
    })
  }

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return setError("Enter the code from your email.")
    if (newPw.length < 8) return setError(PASSWORD_HINT)
    run(async () => {
      await resetPassword(pendingEmail, code.trim(), newPw)
      setEmail(pendingEmail)
      setPassword("")
      go("signin")
      setNotice("Password changed — sign in with your new password.")
    })
  }

  const time = now?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M$/, "") ?? ""
  const date = now?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) ?? ""

  return (
    <div className="fixed inset-0 select-none overflow-hidden text-white" style={{ background }}>
      <LiveWallpaper forceDark />
      {/* Frosted overlay like the macOS login window */}
      <div className={`absolute inset-0 backdrop-blur-2xl ${appearance === "dark" ? "bg-black/35" : "bg-black/20"}`} />

      <div className="relative z-10 flex h-full flex-col items-center px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(3rem,env(safe-area-inset-top))]">
        {/* ── Clock ───────────────────────────────────────────────────── */}
        <div className="text-center drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
          <p className="text-[15px] font-semibold text-white/85">{date}</p>
          <p className="text-[clamp(4.5rem,14vw,7rem)] font-semibold leading-none tracking-tight tabular-nums">{time}</p>
        </div>

        <div className="flex w-full flex-1 flex-col items-center justify-end pb-6 sm:pb-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex w-full max-w-xs flex-col items-center"
            >
              {phase === "lock" && (
                <>
                  <div className="flex items-start gap-8">
                    <UserTile label="Guest" sublabel="Explore the site" onClick={onLogin} logo />
                    <UserTile label="Member" sublabel="Sign in" onClick={() => go("signin")} icon={User} />
                  </div>
                  <button onClick={() => go("register")} className="mt-6 inline-flex items-center gap-1.5 text-[12px] font-medium text-white/70 hover:text-white">
                    <UserPlus className="size-3.5" /> Create a member account
                  </button>
                  <p className="mt-2 text-[11px] text-white/45">Press Enter to continue as a guest</p>
                </>
              )}

              {phase === "signin" && (
                <form onSubmit={handleSignIn} className="flex w-full flex-col items-center gap-2.5">
                  <Avatar icon={User} />
                  <h1 className="mb-1 text-[15px] font-semibold">Member sign in</h1>
                  <Field type="email" value={email} onChange={setEmail} placeholder="Email" autoFocus autoComplete="email" />
                  <PasswordPill value={password} onChange={setPassword} show={showPw} onToggle={() => setShowPw(v => !v)} loading={loading} autoComplete="current-password" />
                  <Messages error={error} notice={notice} />
                  <div className="mt-1 flex w-full justify-between text-[12px] text-white/70">
                    <BackLink onClick={() => go("lock")} />
                    <button type="button" onClick={() => go("forgot")} className="hover:text-white">
                      Forgot password?
                    </button>
                  </div>
                </form>
              )}

              {phase === "register" && (
                <form onSubmit={handleRegister} className="flex w-full flex-col items-center gap-2.5">
                  <Avatar icon={UserPlus} />
                  <h1 className="text-[15px] font-semibold">Create a member account</h1>
                  <p className="mb-1 text-center text-[12px] text-white/65">Save your profile and get updates from {CLUB.shortName}.</p>
                  <Field value={name} onChange={setName} placeholder="Full name" autoFocus autoComplete="name" />
                  <Field type="email" value={email} onChange={setEmail} placeholder="Email" autoComplete="email" />
                  <Field type={showPw ? "text" : "password"} value={password} onChange={setPassword} placeholder="Password" autoComplete="new-password" />
                  <PasswordPill value={confirmPw} onChange={setConfirmPw} show={showPw} onToggle={() => setShowPw(v => !v)} loading={loading} placeholder="Confirm password" autoComplete="new-password" />
                  <p className="text-center text-[11px] text-white/55">{PASSWORD_HINT}</p>
                  <Messages error={error} notice={notice} />
                  <div className="flex w-full justify-between text-[12px] text-white/70">
                    <BackLink onClick={() => go("lock")} />
                    <button type="button" onClick={() => go("signin")} className="hover:text-white">
                      Already a member? Sign in
                    </button>
                  </div>
                </form>
              )}

              {phase === "verify" && (
                <form onSubmit={handleVerify} className="flex w-full flex-col items-center gap-2.5">
                  <Avatar icon={User} />
                  <h1 className="text-[15px] font-semibold">Check your email</h1>
                  <p className="mb-1 text-center text-[12px] text-white/70">
                    We sent a 6-digit code to <span className="font-semibold text-white">{pendingEmail}</span>.
                  </p>
                  <CodePill value={code} onChange={setCode} loading={loading} />
                  <Messages error={error} notice={notice} />
                  <div className="flex w-full justify-between text-[12px] text-white/70">
                    <BackLink onClick={() => go("register")} />
                    <button
                      type="button"
                      onClick={() => run(async () => {
                        await resendCode(pendingEmail)
                        setNotice("A new code is on its way.")
                      })}
                      className="hover:text-white"
                    >
                      Resend code
                    </button>
                  </div>
                </form>
              )}

              {phase === "forgot" && (
                <form onSubmit={handleForgot} className="flex w-full flex-col items-center gap-2.5">
                  <Avatar icon={User} />
                  <h1 className="text-[15px] font-semibold">Reset your password</h1>
                  <p className="mb-1 text-center text-[12px] text-white/70">We’ll email you a code to set a new one.</p>
                  <div className="flex w-full items-center gap-2">
                    <Field type="email" value={email} onChange={setEmail} placeholder="Email" autoFocus autoComplete="email" />
                    <SubmitArrow loading={loading} />
                  </div>
                  <Messages error={error} notice={notice} />
                  <div className="flex w-full text-[12px] text-white/70">
                    <BackLink onClick={() => go("signin")} />
                  </div>
                </form>
              )}

              {phase === "reset" && (
                <form onSubmit={handleReset} className="flex w-full flex-col items-center gap-2.5">
                  <Avatar icon={User} />
                  <h1 className="text-[15px] font-semibold">Choose a new password</h1>
                  <p className="mb-1 text-center text-[12px] text-white/70">Enter the code sent to {pendingEmail}.</p>
                  <Field value={code} onChange={setCode} placeholder="6-digit code" autoFocus inputMode="numeric" autoComplete="one-time-code" />
                  <PasswordPill value={newPw} onChange={setNewPw} show={showPw} onToggle={() => setShowPw(v => !v)} loading={loading} placeholder="New password" autoComplete="new-password" />
                  <p className="text-center text-[11px] text-white/55">{PASSWORD_HINT}</p>
                  <Messages error={error} notice={notice} />
                  <div className="flex w-full text-[12px] text-white/70">
                    <BackLink onClick={() => go("forgot")} />
                  </div>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="text-[11px] text-white/45">
          {CLUB.name} · {CLUB.chapter}
        </p>
      </div>
    </div>
  )
}

// ── Pieces ───────────────────────────────────────────────────────────────────

function UserTile({
  label,
  sublabel,
  onClick,
  icon: Icon,
  logo,
}: {
  label: string
  sublabel: string
  onClick: () => void
  icon?: typeof User
  logo?: boolean
}) {
  return (
    <button onClick={onClick} className="group flex w-24 flex-col items-center gap-2 outline-none">
      <span className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-white/20 shadow-lg ring-white/80 backdrop-blur-md transition-transform group-hover:scale-105 group-focus-visible:ring-2">
        {logo ? (
          <Image src="/logo-full.png" alt="" width={56} height={56} className="size-14 object-contain" unoptimized priority />
        ) : Icon ? (
          <Icon className="size-9 text-white" />
        ) : null}
      </span>
      <span className="text-[14px] font-semibold drop-shadow">{label}</span>
      <span className="-mt-1.5 text-[11px] text-white/65">{sublabel}</span>
    </button>
  )
}

function Avatar({ icon: Icon }: { icon: typeof User }) {
  return (
    <span className="mb-1 flex size-16 items-center justify-center rounded-full bg-white/20 shadow-lg backdrop-blur-md">
      <Icon className="size-8 text-white" />
    </span>
  )
}

const pillCls =
  "h-9 w-full rounded-full border border-white/25 bg-white/15 px-4 text-[13px] text-white outline-none backdrop-blur-md placeholder:text-white/55 focus:border-white/60 focus:bg-white/20"

function Field({
  value,
  onChange,
  type = "text",
  ...rest
}: {
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  autoFocus?: boolean
  autoComplete?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
}) {
  return <input {...rest} type={type} value={value} onChange={e => onChange(e.target.value)} aria-label={rest.placeholder} className={pillCls} />
}

function SubmitArrow({ loading }: { loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-label="Continue"
      className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white transition-colors hover:bg-white/35 disabled:opacity-50"
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
    </button>
  )
}

function PasswordPill({
  value,
  onChange,
  show,
  onToggle,
  loading,
  placeholder = "Password",
  autoComplete,
}: {
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggle: () => void
  loading: boolean
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <div className="flex w-full items-center gap-2">
      <div className="relative flex-1">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          autoComplete={autoComplete}
          className={`${pillCls} pr-10`}
        />
        <button type="button" onClick={onToggle} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      <SubmitArrow loading={loading} />
    </div>
  )
}

function CodePill({ value, onChange, loading }: { value: string; onChange: (v: string) => void; loading: boolean }) {
  return (
    <div className="flex w-full items-center gap-2">
      <input
        value={value}
        onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="000000"
        aria-label="Verification code"
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus
        className={`${pillCls} text-center font-mono text-[16px] tracking-[0.4em]`}
      />
      <SubmitArrow loading={loading} />
    </div>
  )
}

function Messages({ error, notice }: { error: string; notice: string }) {
  if (!error && !notice) return null
  return (
    <p role={error ? "alert" : "status"} className={`text-center text-[12px] font-medium ${error ? "text-red-200" : "text-emerald-200"}`}>
      {error || notice}
    </p>
  )
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-0.5 hover:text-white">
      <ChevronLeft className="size-3.5" /> Back
    </button>
  )
}
