"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import {
  Eye, EyeOff, ArrowRight, ChevronLeft,
  User, Mail, Lock, Loader2, ChevronDown, KeyRound, CheckCircle2
} from "lucide-react"
import {
  signIn, signUp, confirmSignUp, resendCode,
  forgotPassword, resetPassword,
} from "@/lib/auth-client"

type Phase = "lock" | "signin" | "register" | "verify" | "forgot" | "reset"

interface LoginScreenProps {
  onLogin: () => void
}

const bgParticles = [
  { w: 120, h: 120, left: "5%",  top: "10%", dur: 5,   delay: 0 },
  { w: 80,  h: 80,  left: "80%", top: "5%",  dur: 4.2, delay: 0.8 },
  { w: 160, h: 160, left: "70%", top: "65%", dur: 6,   delay: 0.3 },
  { w: 60,  h: 60,  left: "20%", top: "75%", dur: 3.8, delay: 1.2 },
  { w: 100, h: 100, left: "50%", top: "45%", dur: 5.5, delay: 0.6 },
  { w: 70,  h: 70,  left: "90%", top: "35%", dur: 4.8, delay: 1.5 },
  { w: 90,  h: 90,  left: "35%", top: "15%", dur: 3.5, delay: 0.4 },
]

const inputStyle: React.CSSProperties = {
  background: "#EAE6FF",
  boxShadow: "inset 3px 3px 8px #C2BAF0, inset -3px -3px 8px #FFFFFF",
  border: "none", outline: "none", borderRadius: "0.875rem",
  padding: "0.75rem 1rem", color: "#1E1060", width: "100%", fontSize: "0.9rem",
  transition: "box-shadow 0.2s ease",
}
const iconInputStyle: React.CSSProperties = { ...inputStyle, paddingLeft: "2.75rem" }
const iconInputStylePR: React.CSSProperties = { ...iconInputStyle, paddingRight: "2.75rem" }

function CognitoError(err: unknown): string {
  const msg = (err as { message?: string })?.message || "Something went wrong"
  if (msg.includes("UserNotFoundException") || msg.includes("User does not exist")) return "No account found with this email."
  if (msg.includes("NotAuthorizedException")) return "Incorrect password. Please try again."
  if (msg.includes("UsernameExistsException")) return "An account with this email already exists."
  if (msg.includes("InvalidPasswordException")) return "Password must be at least 8 characters with uppercase, lowercase, and number."
  if (msg.includes("CodeMismatchException")) return "Invalid verification code. Please try again."
  if (msg.includes("ExpiredCodeException")) return "Verification code has expired. Please request a new one."
  if (msg.includes("LimitExceededException")) return "Too many attempts. Please wait a few minutes."
  if (msg.includes("InvalidParameterException")) return "Please fill all fields correctly."
  return msg
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [phase, setPhase] = useState<Phase>("lock")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [verifyCode, setVerifyCode] = useState("")
  const [forgotEmail, setForgotEmail] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [time, setTime] = useState<Date | null>(null)
  const [pendingEmail, setPendingEmail] = useState("") // For verification step

  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const formatDate = (d: Date) => d.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })

  // ── Sign In ────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError("Please enter your email and password"); return }
    setError(""); setIsLoading(true)
    try {
      await signIn(email.trim().toLowerCase(), password)
      onLogin()
    } catch (err) {
      setError(CognitoError(err))
    } finally {
      setIsLoading(false)
    }
  }

  // ── Register ───────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) { setError("Please fill all fields"); return }
    if (password !== confirmPassword) { setError("Passwords do not match"); return }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return }
    setError(""); setIsLoading(true)
    try {
      await signUp(email.trim().toLowerCase(), password, name.trim())
      setPendingEmail(email.trim().toLowerCase())
      setPhase("verify")
    } catch (err) {
      setError(CognitoError(err))
    } finally {
      setIsLoading(false)
    }
  }

  // ── Verify Email (OTP) ─────────────────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verifyCode) { setError("Please enter the verification code"); return }
    setError(""); setIsLoading(true)
    try {
      await confirmSignUp(pendingEmail, verifyCode.trim())
      // Auto sign in after verification
      await signIn(pendingEmail, password)
      onLogin()
    } catch (err) {
      setError(CognitoError(err))
    } finally {
      setIsLoading(false)
    }
  }

  // ── Resend verification code ───────────────────────────────
  const handleResendCode = async () => {
    setIsLoading(true)
    try {
      await resendCode(pendingEmail)
      setError("✓ New code sent to your email!")
    } catch (err) {
      setError(CognitoError(err))
    } finally {
      setIsLoading(false)
    }
  }

  // ── Forgot Password ────────────────────────────────────────
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) { setError("Please enter your email"); return }
    setError(""); setIsLoading(true)
    try {
      await forgotPassword(forgotEmail.trim().toLowerCase())
      setPendingEmail(forgotEmail.trim().toLowerCase())
      setPhase("reset")
    } catch (err) {
      setError(CognitoError(err))
    } finally {
      setIsLoading(false)
    }
  }

  // ── Reset Password ─────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetCode || !newPassword) { setError("Please fill all fields"); return }
    setError(""); setIsLoading(true)
    try {
      await resetPassword(pendingEmail, resetCode.trim(), newPassword)
      setPhase("signin")
      setEmail(pendingEmail)
      setPassword(newPassword)
      setError("✓ Password reset! Sign in below.")
    } catch (err) {
      setError(CognitoError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const goToSignIn = () => { setPhase("signin"); setError("") }
  const goToRegister = () => { setPhase("register"); setError(""); setPassword(""); setConfirmPassword("") }
  const goToForgot = () => { setPhase("forgot"); setError("") }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden select-none"
      style={{ background: "linear-gradient(135deg, #3D25A0 0%, #6B4FE8 45%, #9B7FFF 100%)" }}
      onClick={() => phase === "lock" && setPhase("signin")}
    >
      {bgParticles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{ width: p.w, height: p.h, left: p.left, top: p.top,
            background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)" }}
          animate={{ y: [0, -18, 0], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <AnimatePresence mode="wait">
        {/* ── LOCK SCREEN ── */}
        {phase === "lock" && (
          <motion.div
            key="lock"
            className="absolute inset-0 flex flex-col items-center justify-between py-16 cursor-pointer"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.div className="text-center mt-8" initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25, duration: 0.6 }}>
              <div className="text-8xl font-thin text-white tracking-tight tabular-nums"
                style={{ textShadow: "0 4px 30px rgba(0,0,0,0.25)" }}>
                {time ? formatTime(time) : "--:--"}
              </div>
              <div className="mt-3 text-xl font-light" style={{ color: "rgba(255,255,255,0.70)" }}>
                {time ? formatDate(time) : ""}
              </div>
            </motion.div>
            <motion.div className="flex flex-col items-center gap-4"
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6 }}>
              <div className="relative flex items-center justify-center">
                <div className="absolute h-24 w-24 rounded-full animate-pulse-ring"
                  style={{ background: "rgba(255,255,255,0.15)" }} />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full"
                  style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.20), 0 0 0 1px rgba(255,255,255,0.25) inset" }}>
                  <Image src="/logo-icon.png" alt="AWS Cloud Club NMIET" width={54} height={54} className="object-contain" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-white">AWS Cloud Club NMIET</p>
                <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>Click anywhere to sign in</p>
              </div>
              <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
                <ChevronDown className="h-5 w-5" style={{ color: "rgba(255,255,255,0.4)" }} />
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* ── PANEL (sign in / register / verify / forgot / reset) ── */}
        {phase !== "lock" && (
          <motion.div
            key="panel"
            className="relative z-10 w-full max-w-sm mx-4"
            initial={{ opacity: 0, y: 70, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.97 }}
            transition={{ type: "spring" as const, stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-hidden rounded-3xl"
              style={{ background: "rgba(234, 230, 255, 0.96)", backdropFilter: "blur(40px)",
                boxShadow: "20px 20px 50px rgba(40, 15, 140, 0.30), -10px -10px 30px rgba(255,255,255,0.45), 0 0 0 1px rgba(255,255,255,0.55) inset" }}>
              <AnimatePresence mode="wait">

                {/* ── SIGN IN ── */}
                {phase === "signin" && (
                  <motion.div key="signin" className="p-8"
                    initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.25 }}>
                    <div className="mb-6 flex flex-col items-center gap-3">
                      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, type: "spring" as const, stiffness: 300 }}
                        className="flex h-20 w-20 items-center justify-center rounded-2xl"
                        style={{ boxShadow: "6px 6px 16px #C2BAF0, -6px -6px 16px #FFFFFF", background: "#EAE6FF" }}>
                        <Image src="/logo-full.png" alt="Logo" width={64} height={64} className="rounded-xl object-cover" />
                      </motion.div>
                      <div className="text-center">
                        <h2 className="text-xl font-bold" style={{ color: "#1E1060" }}>Welcome Back</h2>
                        <p className="text-sm" style={{ color: "#7B6FC0" }}>AWS Cloud Club NMIET</p>
                      </div>
                    </div>

                    <form onSubmit={handleSignIn} className="space-y-4">
                      <motion.div className="relative" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                        <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none" style={{ color: "#9B8FC8" }} />
                        <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError("") }}
                          placeholder="Email address" style={iconInputStyle} autoFocus />
                      </motion.div>
                      <motion.div className="relative" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
                        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none" style={{ color: "#9B8FC8" }} />
                        <input type={showPassword ? "text" : "password"} value={password}
                          onChange={(e) => { setPassword(e.target.value); setError("") }}
                          placeholder="Password" style={iconInputStylePR} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-80" style={{ color: "#7B6FC0" }}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </motion.div>

                      <AnimatePresence>
                        {error && (
                          <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="text-xs px-1" style={{ color: error.startsWith("✓") ? "#50C88A" : "#E85555" }}>
                            {error}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <motion.button type="submit" disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-white disabled:opacity-70"
                        style={{ background: "linear-gradient(135deg, #6B4FE8, #8B6FFF)",
                          boxShadow: "5px 5px 15px rgba(107,79,232,0.45), -3px -3px 10px rgba(255,255,255,0.60)" }}
                        whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                        initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
                      </motion.button>
                    </form>

                    <div className="mt-4 flex flex-col items-center gap-2">
                      <button onClick={goToForgot} className="text-xs transition-opacity hover:opacity-70" style={{ color: "#9B8FC8" }}>
                        Forgot password?
                      </button>
                      <button onClick={goToRegister} className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: "#6B4FE8" }}>
                        New here? Create an account →
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── REGISTER ── */}
                {phase === "register" && (
                  <motion.div key="register" className="p-8"
                    initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
                    <div className="mb-6">
                      <button onClick={goToSignIn} className="mb-4 flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70" style={{ color: "#7B6FC0" }}>
                        <ChevronLeft className="h-4 w-4" /> Back
                      </button>
                      <h2 className="text-xl font-bold" style={{ color: "#1E1060" }}>Create Account</h2>
                      <p className="text-sm mt-0.5" style={{ color: "#7B6FC0" }}>Join AWS Cloud Club NMIET</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-3">
                      {[
                        { icon: User, value: name, setter: setName, placeholder: "Full Name", type: "text", style: iconInputStyle },
                        { icon: Mail, value: email, setter: setEmail, placeholder: "Email address", type: "email", style: iconInputStyle },
                      ].map(({ icon: Icon, value, setter, placeholder, type, style }, idx) => (
                        <motion.div key={placeholder} className="relative"
                          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: idx * 0.05 }}>
                          <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none" style={{ color: "#9B8FC8" }} />
                          <input type={type} value={value} onChange={(e) => { setter(e.target.value); setError("") }}
                            placeholder={placeholder} style={style} autoFocus={idx === 0} />
                        </motion.div>
                      ))}

                      {[
                        { value: password, setter: setPassword, placeholder: "Password", show: showPassword, toggleShow: () => setShowPassword(!showPassword) },
                        { value: confirmPassword, setter: setConfirmPassword, placeholder: "Confirm password", show: showConfirm, toggleShow: () => setShowConfirm(!showConfirm) },
                      ].map(({ value, setter, placeholder, show, toggleShow }, idx) => (
                        <motion.div key={placeholder} className="relative"
                          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 + idx * 0.05 }}>
                          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none" style={{ color: "#9B8FC8" }} />
                          <input type={show ? "text" : "password"} value={value}
                            onChange={(e) => { setter(e.target.value); setError("") }}
                            placeholder={placeholder} style={iconInputStylePR} />
                          <button type="button" onClick={toggleShow} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#9B8FC8" }}>
                            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </motion.div>
                      ))}

                      <p className="text-xs px-1" style={{ color: "#9B8FC8" }}>Min 8 chars, uppercase, lowercase & number</p>

                      <AnimatePresence>
                        {error && (
                          <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="text-xs px-1" style={{ color: "#E85555" }}>{error}</motion.p>
                        )}
                      </AnimatePresence>

                      <motion.button type="submit" disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-white disabled:opacity-70"
                        style={{ background: "linear-gradient(135deg, #6B4FE8, #8B6FFF)",
                          boxShadow: "5px 5px 15px rgba(107,79,232,0.45), -3px -3px 10px rgba(255,255,255,0.60)" }}
                        whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                        initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Create Account <ArrowRight className="h-4 w-4" /></>}
                      </motion.button>
                    </form>
                  </motion.div>
                )}

                {/* ── EMAIL VERIFICATION ── */}
                {phase === "verify" && (
                  <motion.div key="verify" className="p-8"
                    initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25 }}>
                    <div className="mb-6 flex flex-col items-center gap-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl"
                        style={{ background: "rgba(107,79,232,0.10)" }}>
                        <Mail className="h-8 w-8" style={{ color: "#6B4FE8" }} />
                      </div>
                      <div className="text-center">
                        <h2 className="text-xl font-bold" style={{ color: "#1E1060" }}>Check Your Email</h2>
                        <p className="text-sm mt-1" style={{ color: "#7B6FC0" }}>
                          We sent a 6-digit code to<br />
                          <span className="font-semibold" style={{ color: "#6B4FE8" }}>{pendingEmail}</span>
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-4">
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none" style={{ color: "#9B8FC8" }} />
                        <input type="text" value={verifyCode} onChange={(e) => { setVerifyCode(e.target.value); setError("") }}
                          placeholder="Enter 6-digit code" maxLength={6} style={iconInputStyle} autoFocus
                          className="text-center tracking-widest text-lg font-semibold" />
                      </div>

                      <AnimatePresence>
                        {error && (
                          <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="text-xs px-1" style={{ color: error.startsWith("✓") ? "#50C88A" : "#E85555" }}>{error}</motion.p>
                        )}
                      </AnimatePresence>

                      <motion.button type="submit" disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-white disabled:opacity-70"
                        style={{ background: "linear-gradient(135deg, #6B4FE8, #8B6FFF)",
                          boxShadow: "5px 5px 15px rgba(107,79,232,0.45), -3px -3px 10px rgba(255,255,255,0.60)" }}
                        whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle2 className="h-4 w-4" /> Verify & Sign In</>}
                      </motion.button>
                    </form>

                    <div className="mt-4 text-center space-y-2">
                      <button onClick={handleResendCode} disabled={isLoading}
                        className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: "#6B4FE8" }}>
                        Resend code
                      </button>
                      <br />
                      <button onClick={goToRegister} className="text-xs transition-opacity hover:opacity-70" style={{ color: "#9B8FC8" }}>
                        ← Use different email
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── FORGOT PASSWORD ── */}
                {phase === "forgot" && (
                  <motion.div key="forgot" className="p-8"
                    initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
                    <button onClick={goToSignIn} className="mb-4 flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70" style={{ color: "#7B6FC0" }}>
                      <ChevronLeft className="h-4 w-4" /> Back to Sign In
                    </button>
                    <h2 className="text-xl font-bold mb-1" style={{ color: "#1E1060" }}>Forgot Password?</h2>
                    <p className="text-sm mb-5" style={{ color: "#7B6FC0" }}>Enter your email to receive a reset code.</p>

                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none" style={{ color: "#9B8FC8" }} />
                        <input type="email" value={forgotEmail} onChange={(e) => { setForgotEmail(e.target.value); setError("") }}
                          placeholder="Email address" style={iconInputStyle} autoFocus />
                      </div>
                      <AnimatePresence>
                        {error && <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="text-xs px-1" style={{ color: "#E85555" }}>{error}</motion.p>}
                      </AnimatePresence>
                      <motion.button type="submit" disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-white disabled:opacity-70"
                        style={{ background: "linear-gradient(135deg, #6B4FE8, #8B6FFF)",
                          boxShadow: "5px 5px 15px rgba(107,79,232,0.45), -3px -3px 10px rgba(255,255,255,0.60)" }}
                        whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Send Reset Code <ArrowRight className="h-4 w-4" /></>}
                      </motion.button>
                    </form>
                  </motion.div>
                )}

                {/* ── RESET PASSWORD ── */}
                {phase === "reset" && (
                  <motion.div key="reset" className="p-8"
                    initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                    <h2 className="text-xl font-bold mb-1" style={{ color: "#1E1060" }}>Reset Password</h2>
                    <p className="text-sm mb-5" style={{ color: "#7B6FC0" }}>Enter the code sent to {pendingEmail}</p>

                    <form onSubmit={handleResetPassword} className="space-y-3">
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none" style={{ color: "#9B8FC8" }} />
                        <input type="text" value={resetCode} onChange={(e) => { setResetCode(e.target.value); setError("") }}
                          placeholder="Reset code" style={iconInputStyle} autoFocus />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none" style={{ color: "#9B8FC8" }} />
                        <input type={showPassword ? "text" : "password"} value={newPassword}
                          onChange={(e) => { setNewPassword(e.target.value); setError("") }}
                          placeholder="New password" style={iconInputStylePR} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#9B8FC8" }}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <AnimatePresence>
                        {error && <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="text-xs px-1" style={{ color: error.startsWith("✓") ? "#50C88A" : "#E85555" }}>{error}</motion.p>}
                      </AnimatePresence>
                      <motion.button type="submit" disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-white disabled:opacity-70"
                        style={{ background: "linear-gradient(135deg, #6B4FE8, #8B6FFF)",
                          boxShadow: "5px 5px 15px rgba(107,79,232,0.45), -3px -3px 10px rgba(255,255,255,0.60)" }}
                        whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Reset Password <CheckCircle2 className="h-4 w-4" /></>}
                      </motion.button>
                    </form>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
