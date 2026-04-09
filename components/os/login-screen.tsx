"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import {
  Eye, EyeOff, ArrowRight, ChevronLeft,
  Mail, Loader2, CheckCircle2,
  Server, Database, Shield, Zap,
} from "lucide-react"
import { signIn, signUp, confirmSignUp, resendCode, forgotPassword, resetPassword } from "@/lib/auth-client"

type Phase = "lock" | "signin" | "register" | "verify" | "forgot" | "reset"

// Exact same gradient as boot/splash screen
const BG = "linear-gradient(135deg, #2A1580 0%, #4B2FA8 40%, #6B4FE8 100%)"

// Same particles as boot screen
const particles = [
  { width: 80,  height: 80,  left: "8%",  top: "15%", duration: "4s",   delay: "0s" },
  { width: 120, height: 120, left: "78%", top: "8%",  duration: "5s",   delay: "0.5s" },
  { width: 60,  height: 60,  left: "45%", top: "85%", duration: "3.5s", delay: "1s" },
  { width: 100, height: 100, left: "20%", top: "70%", duration: "6s",   delay: "0.3s" },
  { width: 70,  height: 70,  left: "88%", top: "55%", duration: "4.5s", delay: "1.2s" },
  { width: 90,  height: 90,  left: "60%", top: "30%", duration: "5.5s", delay: "0.8s" },
  { width: 50,  height: 50,  left: "35%", top: "20%", duration: "3s",   delay: "1.5s" },
  { width: 110, height: 110, left: "5%",  top: "40%", duration: "4.2s", delay: "0.2s" },
]

// Same sparkle stars as boot screen
const sparkles = [
  { top: "12%", left: "18%", delay: "0s",   size: 16 },
  { top: "22%", left: "72%", delay: "0.6s", size: 12 },
  { top: "68%", left: "85%", delay: "1.2s", size: 18 },
  { top: "78%", left: "10%", delay: "0.9s", size: 14 },
  { top: "45%", left: "92%", delay: "0.3s", size: 10 },
  { top: "32%", left: "5%",  delay: "1.5s", size: 12 },
]

// Same orbit icons as boot screen
const orbitIcons = [
  { icon: Server,   dur: "8s",  dir: "normal",  size: 20, pos: "top",    color: "#9B8FFF" },
  { icon: Database, dur: "10s", dir: "reverse", size: 20, pos: "bottom", color: "#B8A4FF" },
  { icon: Shield,   dur: "12s", dir: "normal",  size: 20, pos: "left",   color: "#8B7FFF" },
  { icon: Zap,      dur: "9s",  dir: "reverse", size: 20, pos: "right",  color: "#C4B5FD" },
]

// The shared animated logo widget — identical to boot screen
function AnimatedLogo({ scale = 1 }: { scale?: number }) {
  return (
    <motion.div
      className="relative"
      style={{ scale }}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {/* Glow ring */}
      <div
        className="absolute inset-0 rounded-3xl animate-glow-purple"
        style={{ margin: "-8px" }}
      />
      {/* Logo card */}
      <div
        className="relative flex h-28 w-28 items-center justify-center rounded-3xl"
        style={{
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.25)",
        }}
      >
        <Image
          src="/logo-full.png"
          alt="AWS Cloud Club NMIET"
          width={96}
          height={96}
          className="rounded-2xl object-cover"
        />
      </div>
      {/* Orbit icons — same as boot screen */}
      {orbitIcons.map(({ icon: Icon, dur, dir, size, pos, color }, i) => {
        const posStyle: React.CSSProperties =
          pos === "top"    ? { top: "-1.5rem",    left: "50%",  transform: "translateX(-50%)" } :
          pos === "bottom" ? { bottom: "-1.5rem", left: "50%",  transform: "translateX(-50%)" } :
          pos === "left"   ? { left: "-1.5rem",   top: "50%",   transform: "translateY(-50%)" } :
                             { right: "-1.5rem",  top: "50%",   transform: "translateY(-50%)" }
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              animation: `spin ${dur} linear infinite`,
              animationDirection: dir as "normal" | "reverse",
            }}
          >
            <Icon
              className="absolute"
              style={{ ...posStyle, color, width: size, height: size }}
            />
          </div>
        )
      })}
    </motion.div>
  )
}

// Background layer — same as boot screen (particles + sparkle stars)
function SplashBg() {
  return (
    <>
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: p.width, height: p.height, left: p.left, top: p.top,
              background: "radial-gradient(circle, rgba(155,143,255,0.18) 0%, transparent 70%)",
              animation: `float ${p.duration} ease-in-out infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>
      {/* Sparkle stars */}
      {sparkles.map((s, i) => (
        <div
          key={i}
          className="absolute pointer-events-none animate-sparkle"
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}
        >
          <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z"
              fill="rgba(255,255,255,0.55)"
            />
          </svg>
        </div>
      ))}
    </>
  )
}

// Outer wrapper for form pages — scrollable on small screens
function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-6 sm:px-6">
      {children}
    </div>
  )
}

function CognitoError(err: unknown): string {
  const msg = (err as { message?: string })?.message || "Something went wrong"
  if (msg.includes("UserNotFoundException") || msg.includes("User does not exist")) return "No account found with this email."
  if (msg.includes("NotAuthorizedException")) return "Incorrect password. Please try again."
  if (msg.includes("UsernameExistsException")) return "An account with this email already exists."
  if (msg.includes("InvalidPasswordException")) return "Password must be 8+ chars with uppercase, lowercase & number."
  if (msg.includes("CodeMismatchException")) return "Invalid verification code. Please try again."
  if (msg.includes("ExpiredCodeException")) return "Code expired. Please request a new one."
  if (msg.includes("LimitExceededException")) return "Too many attempts. Please wait a minute."
  return msg
}

// Individual neumorphic input box — lighter purple, blends into bg
function UInput({ label, type = "text", value, onChange, placeholder, autoFocus = false, right }: {
  label?: string; type?: string; value: string; onChange: (v: string) => void
  placeholder: string; autoFocus?: boolean; right?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      {label && (
        <label className="block text-xs mb-2 font-bold tracking-widest uppercase"
          style={{ color: "rgba(196,181,253,0.7)", letterSpacing: "0.1em" }}>
          {label}
        </label>
      )}
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-2xl transition-all"
        style={{
          background: focused
            ? "rgba(255,255,255,0.22)"
            : "rgba(255,255,255,0.15)",
          boxShadow: focused
            ? `inset 3px 3px 8px rgba(0,0,0,0.25), inset -2px -2px 6px rgba(255,255,255,0.12), 0 0 0 1.5px rgba(255,255,255,0.3)`
            : `6px 6px 16px rgba(0,0,0,0.3), -4px -4px 12px rgba(255,255,255,0.1)`,
          transition: "all 0.25s ease",
          backdropFilter: "blur(8px)",
        }}
      >
        <input
          type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} autoFocus={autoFocus}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            background: "transparent", border: "none", outline: "none",
            color: "white", fontSize: "16px" /* prevent iOS zoom */, fontWeight: 600, width: "100%",
          }}
          className="placeholder:text-white/25 font-semibold"
        />
        {right}
      </div>
    </div>
  )
}

function ErrorLine({ error }: { error: string }) {
  if (!error) return null
  return (
    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      className="text-xs text-center py-1 rounded-lg"
      style={{ color: error.startsWith("✓") ? "#a0f0c0" : "#fca5a5" }}>
      {error}
    </motion.p>
  )
}

function PrimaryBtn({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <motion.button type="submit" disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm disabled:opacity-50"
      style={{
        background: "linear-gradient(145deg, #6B4FE8, #5535C0)",
        color: "white",
        boxShadow: "6px 6px 16px rgba(0,0,0,0.4), -3px -3px 10px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.15)",
        letterSpacing: "0.04em",
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97, boxShadow: "inset 3px 3px 8px rgba(0,0,0,0.4)" as unknown as undefined }}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </motion.button>
  )
}

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [phase, setPhase] = useState<Phase>("lock")
  const [showPw, setShowPw] = useState(false)
  const [showCPw, setShowCPw] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [verifyCode, setVerifyCode] = useState("")
  const [forgotEmail, setForgotEmail] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [newPw, setNewPw] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [pendingEmail, setPendingEmail] = useState("")
  const [time, setTime] = useState("")
  const [dateStr, setDateStr] = useState("")

  useEffect(() => {
    const upd = () => {
      const n = new Date()
      const h = n.getHours().toString().padStart(2, "0")
      const m = n.getMinutes().toString().padStart(2, "0")
      setTime(`${h} : ${m}`)
      setDateStr(n.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }))
    }
    upd(); const id = setInterval(upd, 1000); return () => clearInterval(id)
  }, [])

  const clrErr = () => setError("")

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError("Please enter email and password"); return }
    setError(""); setLoading(true)
    try { await signIn(email.trim().toLowerCase(), password); onLogin() }
    catch (err) { setError(CognitoError(err)) } finally { setLoading(false) }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) { setError("Please fill all fields"); return }
    if (password !== confirmPw) { setError("Passwords do not match"); return }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return }
    setError(""); setLoading(true)
    try { await signUp(email.trim().toLowerCase(), password, name.trim()); setPendingEmail(email.trim().toLowerCase()); setPhase("verify") }
    catch (err) { setError(CognitoError(err)) } finally { setLoading(false) }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verifyCode) { setError("Enter the verification code"); return }
    setError(""); setLoading(true)
    try { await confirmSignUp(pendingEmail, verifyCode.trim()); await signIn(pendingEmail, password); onLogin() }
    catch (err) { setError(CognitoError(err)) } finally { setLoading(false) }
  }

  const handleResend = async () => {
    setLoading(true)
    try { await resendCode(pendingEmail); setError("✓ Code sent!") }
    catch (err) { setError(CognitoError(err)) } finally { setLoading(false) }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) { setError("Please enter your email"); return }
    setError(""); setLoading(true)
    try { await forgotPassword(forgotEmail.trim().toLowerCase()); setPendingEmail(forgotEmail.trim().toLowerCase()); setPhase("reset") }
    catch (err) { setError(CognitoError(err)) } finally { setLoading(false) }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetCode || !newPw) { setError("Please fill all fields"); return }
    setError(""); setLoading(true)
    try {
      await resetPassword(pendingEmail, resetCode.trim(), newPw)
      setPhase("signin"); setEmail(pendingEmail); setPassword(newPw)
      setError("✓ Password reset! Please sign in.")
    }
    catch (err) { setError(CognitoError(err)) } finally { setLoading(false) }
  }

  const eyeBtn = (show: boolean, toggle: () => void) => (
    <button type="button" onClick={toggle} style={{ color: "rgba(196,181,253,0.6)", flexShrink: 0 }}>
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  )

  const ArrowBtn = () => (
    <motion.button type="submit" disabled={loading}
      className="flex items-center justify-center rounded-full flex-shrink-0 disabled:opacity-50"
      style={{ width: 36, height: 36, background: "rgba(155,143,255,0.3)", color: "white", border: "1px solid rgba(196,181,253,0.4)" }}
      whileHover={{ background: "rgba(155,143,255,0.5)" as unknown as undefined, scale: 1.05 }}
      whileTap={{ scale: 0.93 }}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
    </motion.button>
  )

  return (
    <div className="fixed inset-0 overflow-hidden select-none" style={{ background: BG }}>
      <SplashBg />

      <AnimatePresence mode="wait">

        {/* ══ LOCK SCREEN — boot screen aesthetic with login choices ══ */}
        {phase === "lock" && (
          <motion.div key="lock" className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-6 sm:gap-8 px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>

            {/* Time — above logo */}
            <motion.div className="text-center"
              initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}>
              <div className="tabular-nums font-thin"
                style={{ fontSize: "clamp(2.8rem, 6vw, 4.5rem)", color: "white", letterSpacing: "0.12em" }}>
                {time}
              </div>
              <p className="text-sm mt-0.5 font-light" style={{ color: "rgba(196,181,253,0.7)" }}>{dateStr}</p>
            </motion.div>

            {/* Animated logo — same as boot screen */}
            <div className="relative mb-2">
              <AnimatedLogo />
            </div>

            {/* Title */}
            <motion.div className="text-center"
              initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}>
              <h1 className="text-3xl font-bold tracking-tight text-white">AWS Cloud Club</h1>
              <p className="text-base font-semibold mt-0.5" style={{ color: "#C4B5FD" }}>NMIET Chapter</p>
            </motion.div>

            {/* Sign in / Sign up buttons */}
            <motion.div className="flex flex-col items-center gap-3 mt-2"
              initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.5 }}>

              <motion.button
                onClick={() => setPhase("signin")}
                className="flex items-center gap-3 px-8 py-2.5 rounded-full font-semibold text-sm text-white"
                style={{
                  background: "linear-gradient(135deg, rgba(155,143,255,0.4), rgba(196,181,253,0.25))",
                  border: "1px solid rgba(196,181,253,0.45)",
                  boxShadow: "0 4px 20px rgba(107,79,232,0.3)",
                }}
                whileHover={{ scale: 1.04, background: "rgba(155,143,255,0.55)" as unknown as undefined }}
                whileTap={{ scale: 0.97 }}>
                Sign In <ArrowRight className="h-4 w-4" />
              </motion.button>

              <motion.button
                onClick={() => setPhase("register")}
                className="text-sm font-medium"
                style={{ color: "rgba(196,181,253,0.7)" }}
                whileHover={{ color: "rgba(255,255,255,0.95)" as unknown as undefined }}>
                New user? <span style={{ color: "#C4B5FD", fontWeight: 600 }}>Create account</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* ══ SIGN IN ══ */}
        {phase === "signin" && (
          <motion.div key="signin" className="absolute inset-0 flex items-center justify-center z-10 overflow-y-auto py-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-sm px-4 sm:px-0"
              initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.08, type: "spring", stiffness: 260, damping: 26 }}>
              <GlassCard>
                {/* Mini logo */}
                <div className="flex flex-col items-center mb-7">
                  <div className="relative mb-4">
                    <AnimatedLogo scale={0.7} />
                  </div>
                  <h2 className="text-lg font-bold text-white">AWS Cloud Club NMIET</h2>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(196,181,253,0.7)" }}>Sign in to Cloud OS</p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-5">
                  <UInput label="Email address" type="email" value={email}
                    onChange={v => { setEmail(v); clrErr() }} placeholder="name@example.com" autoFocus />
                  <UInput label="Password" type={showPw ? "text" : "password"} value={password}
                    onChange={v => { setPassword(v); clrErr() }} placeholder="Password"
                    right={<div className="flex items-center gap-2">{eyeBtn(showPw, () => setShowPw(s => !s))}<ArrowBtn /></div>}
                  />
                  <ErrorLine error={error} />
                </form>

                <div className="mt-6 flex items-center justify-between">
                  <button onClick={() => { setPhase("lock"); clrErr() }}
                    className="flex items-center gap-1 text-xs hover:opacity-70"
                    style={{ color: "rgba(196,181,253,0.55)" }}>
                    <ChevronLeft className="h-3.5 w-3.5" /> Back
                  </button>
                  <div className="flex flex-col items-end gap-1">
                    <button onClick={() => { setPhase("forgot"); clrErr() }}
                      className="text-xs hover:opacity-70"
                      style={{ color: "rgba(196,181,253,0.55)" }}>Forgot password?</button>
                    <button onClick={() => { setPhase("register"); clrErr() }}
                      className="text-xs hover:opacity-70"
                      style={{ color: "#C4B5FD", fontWeight: 600 }}>New here? Sign up</button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}

        {/* ══ OTHER FORMS ══ */}
        {(phase === "register" || phase === "verify" || phase === "forgot" || phase === "reset") && (
          <motion.div key="form" className="absolute inset-0 flex items-center justify-center z-10 overflow-y-auto py-4 px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-sm"
              initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.05 }}>
              <GlassCard>
                <AnimatePresence mode="wait">

                  {/* REGISTER */}
                  {phase === "register" && (
                    <motion.div key="reg" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                      <button onClick={() => { setPhase("lock"); clrErr() }}
                        className="flex items-center gap-1 text-xs mb-5 hover:opacity-70"
                        style={{ color: "rgba(196,181,253,0.6)" }}>
                        <ChevronLeft className="h-3.5 w-3.5" /> Back
                      </button>
                      <h2 className="text-xl font-bold text-white mb-0.5">Create Account</h2>
                      <p className="text-sm mb-5" style={{ color: "rgba(196,181,253,0.6)" }}>Join AWS Cloud Club NMIET</p>
                      <form onSubmit={handleRegister} className="space-y-4">
                        <UInput label="Full Name" value={name} onChange={v => { setName(v); clrErr() }} placeholder="Your name" autoFocus />
                        <UInput label="Email" type="email" value={email} onChange={v => { setEmail(v); clrErr() }} placeholder="name@example.com" />
                        <UInput label="Password" type={showPw ? "text" : "password"} value={password}
                          onChange={v => { setPassword(v); clrErr() }} placeholder="Min 8 chars"
                          right={eyeBtn(showPw, () => setShowPw(s => !s))} />
                        <UInput label="Confirm Password" type={showCPw ? "text" : "password"} value={confirmPw}
                          onChange={v => { setConfirmPw(v); clrErr() }} placeholder="Re-enter password"
                          right={eyeBtn(showCPw, () => setShowCPw(s => !s))} />
                        <ErrorLine error={error} />
                        <PrimaryBtn loading={loading}>Create Account <ArrowRight className="h-4 w-4" /></PrimaryBtn>
                      </form>
                      <button onClick={() => { setPhase("signin"); clrErr() }}
                        className="mt-4 w-full text-center text-xs hover:opacity-70"
                        style={{ color: "rgba(196,181,253,0.55)" }}>Already have an account? Sign in</button>
                    </motion.div>
                  )}

                  {/* VERIFY */}
                  {phase === "verify" && (
                    <motion.div key="ver" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                      <div className="flex flex-col items-center mb-6">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full mb-3"
                          style={{ border: "2px solid rgba(196,181,253,0.4)" }}>
                          <Mail className="h-6 w-6" style={{ color: "#C4B5FD" }} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Check Your Email</h2>
                        <p className="text-sm mt-1 text-center" style={{ color: "rgba(196,181,253,0.6)" }}>
                          6-digit code sent to <span className="text-white font-medium">{pendingEmail}</span>
                        </p>
                      </div>
                      <form onSubmit={handleVerify} className="space-y-4">
                        <UInput value={verifyCode} onChange={v => { setVerifyCode(v); clrErr() }}
                          placeholder="Enter 6-digit code" autoFocus />
                        <ErrorLine error={error} />
                        <PrimaryBtn loading={loading}><CheckCircle2 className="h-4 w-4" /> Verify &amp; Sign In</PrimaryBtn>
                      </form>
                      <div className="mt-4 flex justify-between text-xs">
                        <button onClick={handleResend} disabled={loading} className="hover:opacity-70"
                          style={{ color: "rgba(196,181,253,0.6)" }}>Resend code</button>
                        <button onClick={() => { setPhase("register"); clrErr() }} className="hover:opacity-70"
                          style={{ color: "rgba(196,181,253,0.6)" }}>← Different email</button>
                      </div>
                    </motion.div>
                  )}

                  {/* FORGOT */}
                  {phase === "forgot" && (
                    <motion.div key="fgt" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                      <button onClick={() => { setPhase("signin"); clrErr() }}
                        className="flex items-center gap-1 text-xs mb-5 hover:opacity-70"
                        style={{ color: "rgba(196,181,253,0.6)" }}>
                        <ChevronLeft className="h-3.5 w-3.5" /> Back
                      </button>
                      <h2 className="text-xl font-bold text-white mb-0.5">Forgot Password?</h2>
                      <p className="text-sm mb-5" style={{ color: "rgba(196,181,253,0.6)" }}>Enter your email for a reset code.</p>
                      <form onSubmit={handleForgot} className="space-y-4">
                        <UInput label="Email" type="email" value={forgotEmail}
                          onChange={v => { setForgotEmail(v); clrErr() }} placeholder="name@example.com" autoFocus />
                        <ErrorLine error={error} />
                        <PrimaryBtn loading={loading}>Send Reset Code <ArrowRight className="h-4 w-4" /></PrimaryBtn>
                      </form>
                    </motion.div>
                  )}

                  {/* RESET */}
                  {phase === "reset" && (
                    <motion.div key="rst" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                      <h2 className="text-xl font-bold text-white mb-1">Reset Password</h2>
                      <p className="text-sm mb-5" style={{ color: "rgba(196,181,253,0.6)" }}>Code sent to {pendingEmail}</p>
                      <form onSubmit={handleReset} className="space-y-4">
                        <UInput label="Reset Code" value={resetCode}
                          onChange={v => { setResetCode(v); clrErr() }} placeholder="Enter reset code" autoFocus />
                        <UInput label="New Password" type={showPw ? "text" : "password"} value={newPw}
                          onChange={v => { setNewPw(v); clrErr() }} placeholder="New password"
                          right={eyeBtn(showPw, () => setShowPw(s => !s))} />
                        <ErrorLine error={error} />
                        <PrimaryBtn loading={loading}>Reset Password <CheckCircle2 className="h-4 w-4" /></PrimaryBtn>
                      </form>
                    </motion.div>
                  )}

                </AnimatePresence>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Bottom branding — same as boot screen */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-10">
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          Powered by AWS Cloud Innovation · NMIET
        </p>
      </div>
    </div>
  )
}
