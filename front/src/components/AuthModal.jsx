"use client"

import { useRef, useState, useEffect, memo, useCallback } from "react"
import { useAuth } from "@/context/AuthContext"
import {
  X,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Droplets,
} from "lucide-react"
import {
  login as loginAPI,
  register as registerAPI,
  verifyOTP as verifyOTPAPI,
  resendOTP as resendOTPAPI,
  forgotPassword as forgotPasswordAPI,
} from "@/lib/auth.api"

// ── GSAP Loader ───────────────────────────────────────────
let cachedGsap = null

async function loadGsap() {
  if (!cachedGsap) {
    const { default: gsap } = await import("gsap")
    cachedGsap = gsap
  }
  return cachedGsap
}

function makeFallbackVisible(element) {
  if (!element) return
  element.style.opacity = "1"
  element.style.transform = "none"
}

// ── Main Modal Component ──────────────────────────────────
export default function AuthModal() {
  const { isModalOpen, modalView, closeModal } = useAuth()
  const overlayRef = useRef(null)
  const contentRef = useRef(null)

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isModalOpen) return

    const scrollY = window.scrollY

    document.body.style.position = "fixed"
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = "0"
    document.body.style.right = "0"
    document.body.style.overflow = "hidden"
    document.body.style.width = "100%"

    return () => {
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.left = ""
      document.body.style.right = ""
      document.body.style.overflow = ""
      document.body.style.width = ""
      window.scrollTo(0, scrollY)
    }
  }, [isModalOpen])

  // Close on escape
  useEffect(() => {
    if (!isModalOpen) return

    const handleEscape = (e) => {
      if (e.key === "Escape") closeModal()
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isModalOpen, closeModal])

  // Animate modal entrance
  useEffect(() => {
    if (!isModalOpen) return

    let mounted = true

    const animate = async () => {
      try {
        const gsap = await loadGsap()
        if (!mounted) return

        if (overlayRef.current) {
          gsap.fromTo(
            overlayRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: "power2.out" }
          )
        }

        if (contentRef.current) {
          gsap.fromTo(
            contentRef.current,
            { opacity: 0, y: 50, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.4,
              ease: "power3.out",
            }
          )
        }
      } catch {
        if (overlayRef.current) overlayRef.current.style.opacity = "1"
        if (contentRef.current) {
          contentRef.current.style.opacity = "1"
          contentRef.current.style.transform = "none"
        }
      }
    }

    animate()

    return () => {
      mounted = false
    }
  }, [isModalOpen])

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) closeModal()
  }

  if (!isModalOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 
                 bg-black/60 backdrop-blur-sm"
      style={{
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-md bg-white overflow-hidden rounded-2xl 
                   max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center 
                     text-gray-400 hover:text-black rounded-full hover:bg-gray-100
                     transition-all duration-300"
          aria-label="Close"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        {/* Content */}
        <div className="p-8 md:p-10">
          <ViewSwitcher view={modalView} />
        </div>
      </div>
    </div>
  )
}

// ── View Switcher ─────────────────────────────────────────
const ViewSwitcher = memo(function ViewSwitcher({ view }) {
  const containerRef = useRef(null)

  useEffect(() => {
    let mounted = true

    const animate = async () => {
      try {
        const gsap = await loadGsap()
        if (!mounted || !containerRef.current) return

        gsap.fromTo(
          containerRef.current,
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
        )
      } catch {
        if (mounted) makeFallbackVisible(containerRef.current)
      }
    }

    animate()

    return () => {
      mounted = false
    }
  }, [view])

  return (
    <div ref={containerRef} className="opacity-0">
      {view === "login" && <LoginView />}
      {view === "register" && <RegisterView />}
      {view === "otp" && <OTPView />}
      {view === "forgot" && <ForgotPasswordView />}
      {view === "reset-success" && <ResetSuccessView />}
    </div>
  )
})

// ── Login View ────────────────────────────────────────────
const LoginView = memo(function LoginView() {
  const { switchView, loginSuccess } = useAuth()

  const [formData, setFormData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [remainingAttempts, setRemainingAttempts] = useState(null)

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError("")
  }, [])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setError("")

      if (!formData.email || !formData.password) {
        setError("Please fill in all fields")
        return
      }

      setLoading(true)

      try {
        const response = await loginAPI(formData.email, formData.password)
        loginSuccess(response.user)
      } catch (err) {
        setError(err.message)
        if (err.remainingAttempts !== undefined) {
          setRemainingAttempts(err.remainingAttempts)
        }
      } finally {
        setLoading(false)
      }
    },
    [formData, loginSuccess]
  )

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-6">
          <Droplets size={24} strokeWidth={1.5} className="text-blue-500" />
          <span
            className="text-black"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: "20px",
              fontWeight: 300,
            }}
          >
            Wash<span className="text-blue-500">2</span>Door
          </span>
        </div>

        <h2
          className="text-black mb-2"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 300,
            fontSize: "28px",
            lineHeight: 1.2,
          }}
        >
          Welcome Back
        </h2>

        <p
          className="text-gray-400 tracking-wider uppercase"
          style={{ fontSize: "10px" }}
        >
          Sign in to continue
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
            <p
              className="text-red-600 tracking-wider uppercase"
              style={{ fontSize: "10px" }}
            >
              {error}
            </p>
            {remainingAttempts !== null && remainingAttempts > 0 && (
              <p
                className="text-red-400 tracking-wider uppercase mt-1"
                style={{ fontSize: "9px" }}
              >
                {remainingAttempts} attempt{remainingAttempts !== 1 ? "s" : ""}{" "}
                remaining
              </p>
            )}
          </div>
        )}

        {/* Email */}
        <div>
          <label
            className="block text-gray-400 tracking-wider uppercase mb-2"
            style={{ fontSize: "9px", letterSpacing: "0.3em" }}
          >
            Email
          </label>
          <div className="relative">
            <Mail
              size={16}
              strokeWidth={1.5}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full bg-gray-50 border border-gray-200 pl-12 pr-4 h-12 
                         text-black placeholder-gray-300 rounded-xl
                         focus:outline-none focus:border-black 
                         transition-colors duration-300"
              style={{ fontSize: "13px" }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            className="block text-gray-400 tracking-wider uppercase mb-2"
            style={{ fontSize: "9px", letterSpacing: "0.3em" }}
          >
            Password
          </label>
          <div className="relative">
            <Lock
              size={16}
              strokeWidth={1.5}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
            />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-200 pl-12 pr-12 h-12 
                         text-black placeholder-gray-300 rounded-xl
                         focus:outline-none focus:border-black 
                         transition-colors duration-300"
              style={{ fontSize: "13px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 
                         hover:text-gray-500 transition-colors"
            >
              {showPassword ? (
                <EyeOff size={16} strokeWidth={1.5} />
              ) : (
                <Eye size={16} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => switchView("forgot")}
            className="text-gray-400 hover:text-black tracking-wider uppercase
                       transition-colors duration-300"
            style={{ fontSize: "9px" }}
          >
            Forgot Password?
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="group w-full flex items-center justify-center gap-2 h-12
                     bg-black text-white rounded-full
                     hover:bg-gray-800 active:scale-[0.97]
                     disabled:opacity-50 transition-all duration-300"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <span
                className="tracking-wider uppercase"
                style={{ fontSize: "10px", fontWeight: 500 }}
              >
                Sign In
              </span>
              <ArrowRight
                size={14}
                strokeWidth={1.5}
                className="group-hover:translate-x-0.5 transition-transform duration-300"
              />
            </>
          )}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p
          className="text-gray-400 tracking-wider uppercase"
          style={{ fontSize: "10px" }}
        >
          Don&apos;t have an account?{" "}
          <button
            onClick={() => switchView("register")}
            className="text-black hover:underline"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  )
})

// ── Register View ─────────────────────────────────────────
const RegisterView = memo(function RegisterView() {
  const { switchView } = useAuth()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError("")
  }, [])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setError("")

      const { firstName, lastName, email, password, confirmPassword } =
        formData

      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        setError("Please fill in all fields")
        return
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters")
        return
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match")
        return
      }

      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
      if (!passwordRegex.test(password)) {
        setError(
          "Password must contain uppercase, lowercase, number, and special character"
        )
        return
      }

      setLoading(true)

      try {
        await registerAPI(
          firstName,
          lastName,
          email,
          password,
          confirmPassword
        )
        switchView("otp", email)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [formData, switchView]
  )

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-6">
          <Droplets size={24} strokeWidth={1.5} className="text-blue-500" />
          <span
            className="text-black"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: "20px",
              fontWeight: 300,
            }}
          >
            Wash<span className="text-blue-500">2</span>Door
          </span>
        </div>

        <h2
          className="text-black mb-2"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 300,
            fontSize: "28px",
            lineHeight: 1.2,
          }}
        >
          Create Account
        </h2>

        <p
          className="text-gray-400 tracking-wider uppercase"
          style={{ fontSize: "10px" }}
        >
          Join us today
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
            <p
              className="text-red-600 tracking-wider uppercase"
              style={{ fontSize: "10px" }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="block text-gray-400 tracking-wider uppercase mb-2"
              style={{ fontSize: "9px", letterSpacing: "0.3em" }}
            >
              First Name
            </label>
            <div className="relative">
              <User
                size={16}
                strokeWidth={1.5}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
              />
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full bg-gray-50 border border-gray-200 pl-12 pr-4 h-12 
                           text-black placeholder-gray-300 rounded-xl
                           focus:outline-none focus:border-black 
                           transition-colors duration-300"
                style={{ fontSize: "13px" }}
              />
            </div>
          </div>
          <div>
            <label
              className="block text-gray-400 tracking-wider uppercase mb-2"
              style={{ fontSize: "9px", letterSpacing: "0.3em" }}
            >
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              className="w-full bg-gray-50 border border-gray-200 px-4 h-12 
                         text-black placeholder-gray-300 rounded-xl
                         focus:outline-none focus:border-black 
                         transition-colors duration-300"
              style={{ fontSize: "13px" }}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            className="block text-gray-400 tracking-wider uppercase mb-2"
            style={{ fontSize: "9px", letterSpacing: "0.3em" }}
          >
            Email
          </label>
          <div className="relative">
            <Mail
              size={16}
              strokeWidth={1.5}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full bg-gray-50 border border-gray-200 pl-12 pr-4 h-12 
                         text-black placeholder-gray-300 rounded-xl
                         focus:outline-none focus:border-black 
                         transition-colors duration-300"
              style={{ fontSize: "13px" }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            className="block text-gray-400 tracking-wider uppercase mb-2"
            style={{ fontSize: "9px", letterSpacing: "0.3em" }}
          >
            Password
          </label>
          <div className="relative">
            <Lock
              size={16}
              strokeWidth={1.5}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
            />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 8 characters"
              className="w-full bg-gray-50 border border-gray-200 pl-12 pr-12 h-12 
                         text-black placeholder-gray-300 rounded-xl
                         focus:outline-none focus:border-black 
                         transition-colors duration-300"
              style={{ fontSize: "13px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 
                         hover:text-gray-500 transition-colors"
            >
              {showPassword ? (
                <EyeOff size={16} strokeWidth={1.5} />
              ) : (
                <Eye size={16} strokeWidth={1.5} />
              )}
            </button>
          </div>
          <p
            className="text-gray-300 mt-2"
            style={{ fontSize: "9px", letterSpacing: "0.05em" }}
          >
            Must contain uppercase, lowercase, number & special character
          </p>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            className="block text-gray-400 tracking-wider uppercase mb-2"
            style={{ fontSize: "9px", letterSpacing: "0.3em" }}
          >
            Confirm Password
          </label>
          <div className="relative">
            <Lock
              size={16}
              strokeWidth={1.5}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
            />
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-200 pl-12 pr-4 h-12 
                         text-black placeholder-gray-300 rounded-xl
                         focus:outline-none focus:border-black 
                         transition-colors duration-300"
              style={{ fontSize: "13px" }}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="group w-full flex items-center justify-center gap-2 h-12 mt-6
                     bg-black text-white rounded-full
                     hover:bg-gray-800 active:scale-[0.97]
                     disabled:opacity-50 transition-all duration-300"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <span
                className="tracking-wider uppercase"
                style={{ fontSize: "10px", fontWeight: 500 }}
              >
                Create Account
              </span>
              <ArrowRight
                size={14}
                strokeWidth={1.5}
                className="group-hover:translate-x-0.5 transition-transform duration-300"
              />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <p
          className="text-gray-400 tracking-wider uppercase"
          style={{ fontSize: "10px" }}
        >
          Already have an account?{" "}
          <button
            onClick={() => switchView("login")}
            className="text-black hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  )
})

// ── OTP View ──────────────────────────────────────────────
const OTPView = memo(function OTPView() {
  const { switchView, authEmail, loginSuccess } = useAuth()

  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState("")
  const [attemptsRemaining, setAttemptsRemaining] = useState(null)
  const [resendTimer, setResendTimer] = useState(30)

  const inputRefs = useRef([])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleChange = useCallback(
    (index, value) => {
      if (!/^\d*$/.test(value)) return

      const newOtp = [...otp]
      newOtp[index] = value.slice(-1)
      setOtp(newOtp)
      setError("")

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    },
    [otp]
  )

  const handleKeyDown = useCallback(
    (index, e) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    },
    [otp]
  )

  const handlePaste = useCallback((e) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData("text").slice(0, 6)
    if (!/^\d+$/.test(pasteData)) return

    const newOtp = ["", "", "", "", "", ""]
    pasteData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char
    })
    setOtp(newOtp)

    const lastIndex = Math.min(pasteData.length, 6) - 1
    inputRefs.current[lastIndex]?.focus()
  }, [])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setError("")

      const otpString = otp.join("")
      if (otpString.length !== 6) {
        setError("Please enter complete OTP")
        return
      }

      setLoading(true)

      try {
        const response = await verifyOTPAPI(authEmail, otpString)
        loginSuccess(response.user)
      } catch (err) {
        setError(err.message)
        if (err.attemptsRemaining !== undefined) {
          setAttemptsRemaining(err.attemptsRemaining)
        }
        setOtp(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
      } finally {
        setLoading(false)
      }
    },
    [otp, authEmail, loginSuccess]
  )

  const handleResend = useCallback(async () => {
    if (resendTimer > 0) return

    setResending(true)
    setError("")

    try {
      await resendOTPAPI(authEmail)
      setResendTimer(30)
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } catch (err) {
      setError(err.message)
    } finally {
      setResending(false)
    }
  }, [resendTimer, authEmail])

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-6 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center">
          <Mail size={28} strokeWidth={1.5} className="text-blue-500" />
        </div>

        <h2
          className="text-black mb-2"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 300,
            fontSize: "28px",
            lineHeight: 1.2,
          }}
        >
          Verify Email
        </h2>

        <p
          className="text-gray-400 tracking-wider uppercase"
          style={{ fontSize: "10px" }}
        >
          Enter the 6-digit code sent to
        </p>
        <p className="text-black mt-1" style={{ fontSize: "12px" }}>
          {authEmail}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
            <p
              className="text-red-600 tracking-wider uppercase"
              style={{ fontSize: "10px" }}
            >
              {error}
            </p>
            {attemptsRemaining !== null && attemptsRemaining > 0 && (
              <p
                className="text-red-400 tracking-wider uppercase mt-1"
                style={{ fontSize: "9px" }}
              >
                {attemptsRemaining} attempt{attemptsRemaining !== 1 ? "s" : ""}{" "}
                remaining
              </p>
            )}
          </div>
        )}

        {/* OTP Inputs */}
        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-14 text-center bg-gray-50 border border-gray-200 
                         rounded-xl focus:border-black focus:outline-none 
                         transition-colors duration-300"
              style={{ fontSize: "18px", fontWeight: 500 }}
            />
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || otp.join("").length !== 6}
          className="group w-full flex items-center justify-center gap-2 h-12
                     bg-black text-white rounded-full
                     hover:bg-gray-800 active:scale-[0.97]
                     disabled:opacity-50 transition-all duration-300"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <span
                className="tracking-wider uppercase"
                style={{ fontSize: "10px", fontWeight: 500 }}
              >
                Verify
              </span>
              <ArrowRight
                size={14}
                strokeWidth={1.5}
                className="group-hover:translate-x-0.5 transition-transform duration-300"
              />
            </>
          )}
        </button>

        {/* Resend */}
        <div className="text-center">
          <p
            className="text-gray-400 tracking-wider uppercase"
            style={{ fontSize: "10px" }}
          >
            Didn&apos;t receive code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendTimer > 0 || resending}
              className={`${
                resendTimer > 0 ? "text-gray-300" : "text-black hover:underline"
              }`}
            >
              {resending
                ? "Sending..."
                : resendTimer > 0
                ? `Resend in ${resendTimer}s`
                : "Resend"}
            </button>
          </p>
        </div>
      </form>

      {/* Back to Login */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <button
          onClick={() => switchView("login")}
          className="flex items-center gap-2 text-gray-400 hover:text-black 
                     tracking-wider uppercase transition-colors mx-auto"
          style={{ fontSize: "10px" }}
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to Sign In
        </button>
      </div>
    </div>
  )
})

// ── Forgot Password View ──────────────────────────────────
const ForgotPasswordView = memo(function ForgotPasswordView() {
  const { switchView } = useAuth()

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setError("")

      if (!email) {
        setError("Please enter your email")
        return
      }

      setLoading(true)

      try {
        await forgotPasswordAPI(email)
        setSuccess(true)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [email]
  )

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-6 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center">
          <CheckCircle size={28} strokeWidth={1.5} className="text-emerald-600" />
        </div>

        <h2
          className="text-black mb-3"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 300,
            fontSize: "24px",
            lineHeight: 1.2,
          }}
        >
          Check Your Email
        </h2>

        <p
          className="text-gray-400 mb-8 max-w-xs mx-auto"
          style={{ fontSize: "13px", lineHeight: 1.6 }}
        >
          If an account exists for {email}, you will receive a password reset
          link
        </p>

        <button
          onClick={() => switchView("login")}
          className="flex items-center gap-2 text-gray-400 hover:text-black 
                     tracking-wider uppercase transition-colors mx-auto"
          style={{ fontSize: "10px" }}
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to Sign In
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-6 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center">
          <Lock size={28} strokeWidth={1.5} className="text-gray-400" />
        </div>

        <h2
          className="text-black mb-2"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 300,
            fontSize: "28px",
            lineHeight: 1.2,
          }}
        >
          Forgot Password?
        </h2>

        <p
          className="text-gray-400 max-w-xs mx-auto"
          style={{ fontSize: "13px", lineHeight: 1.6 }}
        >
          Enter your email and we will send you a reset link
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
            <p
              className="text-red-600 tracking-wider uppercase"
              style={{ fontSize: "10px" }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Email */}
        <div>
          <label
            className="block text-gray-400 tracking-wider uppercase mb-2"
            style={{ fontSize: "9px", letterSpacing: "0.3em" }}
          >
            Email Address
          </label>
          <div className="relative">
            <Mail
              size={16}
              strokeWidth={1.5}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError("")
              }}
              placeholder="you@example.com"
              className="w-full bg-gray-50 border border-gray-200 pl-12 pr-4 h-12 
                         text-black placeholder-gray-300 rounded-xl
                         focus:outline-none focus:border-black 
                         transition-colors duration-300"
              style={{ fontSize: "13px" }}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="group w-full flex items-center justify-center gap-2 h-12
                     bg-black text-white rounded-full
                     hover:bg-gray-800 active:scale-[0.97]
                     disabled:opacity-50 transition-all duration-300"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <span
                className="tracking-wider uppercase"
                style={{ fontSize: "10px", fontWeight: 500 }}
              >
                Send Reset Link
              </span>
              <ArrowRight
                size={14}
                strokeWidth={1.5}
                className="group-hover:translate-x-0.5 transition-transform duration-300"
              />
            </>
          )}
        </button>
      </form>

      {/* Back to Login */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <button
          onClick={() => switchView("login")}
          className="flex items-center gap-2 text-gray-400 hover:text-black 
                     tracking-wider uppercase transition-colors mx-auto"
          style={{ fontSize: "10px" }}
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to Sign In
        </button>
      </div>
    </div>
  )
})

// ── Reset Success View ────────────────────────────────────
const ResetSuccessView = memo(function ResetSuccessView() {
  const { switchView } = useAuth()

  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-6 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center">
        <CheckCircle size={28} strokeWidth={1.5} className="text-emerald-600" />
      </div>

      <h2
        className="text-black mb-3"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontWeight: 300,
          fontSize: "24px",
          lineHeight: 1.2,
        }}
      >
        Password Reset!
      </h2>

      <p
        className="text-gray-400 mb-8 max-w-xs mx-auto"
        style={{ fontSize: "13px", lineHeight: 1.6 }}
      >
        Your password has been successfully reset. You can now sign in with
        your new password.
      </p>

      <button
        onClick={() => switchView("login")}
        className="group inline-flex items-center justify-center gap-2 h-12 px-8
                   bg-black text-white rounded-full
                   hover:bg-gray-800 active:scale-[0.97]
                   transition-all duration-300"
      >
        <span
          className="tracking-wider uppercase"
          style={{ fontSize: "10px", fontWeight: 500 }}
        >
          Sign In
        </span>
        <ArrowRight
          size={14}
          strokeWidth={1.5}
          className="group-hover:translate-x-0.5 transition-transform duration-300"
        />
      </button>
    </div>
  )
})