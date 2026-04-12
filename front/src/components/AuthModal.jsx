"use client"

import { useRef, useState, useEffect, memo, useCallback } from "react"
import { useAuth } from "@/context/AuthContext"
import {
  X, Eye, EyeOff, Mail, Lock, User, ArrowRight,
  ArrowLeft, Loader2, CheckCircle, AlertCircle,
} from "lucide-react"
import {
  login as loginAPI,
  register as registerAPI,
  resendRegistrationEmail as resendRegistrationEmailAPI,
  forgotPassword as forgotPasswordAPI,
} from "@/lib/auth.api"

/* ─── Constants ─── */
const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif"
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"

/* ─── Reusable Components ─── */

const ErrorAlert = memo(function ErrorAlert({ message, attempts }) {
  return (
    <div style={{
      display: "flex", gap: 10, padding: "12px 14px",
      borderRadius: 10, border: "0.5px solid rgba(0,0,0,0.08)",
      background: "rgba(0,0,0,0.02)",
    }}>
      <AlertCircle size={15} strokeWidth={1.5} style={{ color: "rgba(0,0,0,0.5)", flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: "#1d1d1f", margin: 0, lineHeight: 1.5 }}>
          {message}
        </p>
        {attempts !== null && attempts > 0 && (
          <p style={{ fontSize: 10, color: "rgba(0,0,0,0.38)", margin: "4px 0 0" }}>
            {attempts} attempt{attempts !== 1 ? "s" : ""} remaining
          </p>
        )}
      </div>
    </div>
  )
})

const InputField = memo(function InputField({ icon: Icon, label, error, ...props }) {
  return (
    <div>
      <label className="auth-label">{label}</label>
      <div style={{ position: "relative", marginTop: 6 }}>
        {Icon && (
          <Icon
            size={15}
            strokeWidth={1.5}
            style={{
              position: "absolute", left: 12, top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(0,0,0,0.28)", pointerEvents: "none",
            }}
          />
        )}
        <input
          className="auth-input"
          style={{
            paddingLeft: Icon ? 38 : 14,
            borderColor: error ? "rgba(0,0,0,0.25)" : undefined,
          }}
          {...props}
        />
      </div>
      {error && (
        <p style={{ fontSize: 11, color: "rgba(0,0,0,0.5)", fontWeight: 500, margin: "5px 0 0" }}>
          {error}
        </p>
      )}
    </div>
  )
})

const PasswordField = memo(function PasswordField({ label, showPassword, onToggle, error, ...props }) {
  return (
    <div>
      <label className="auth-label">{label}</label>
      <div style={{ position: "relative", marginTop: 6 }}>
        <Lock
          size={15}
          strokeWidth={1.5}
          style={{
            position: "absolute", left: 12, top: "50%",
            transform: "translateY(-50%)",
            color: "rgba(0,0,0,0.28)", pointerEvents: "none",
          }}
        />
        <input
          type={showPassword ? "text" : "password"}
          className="auth-input"
          style={{
            paddingLeft: 38,
            paddingRight: 40,
            borderColor: error ? "rgba(0,0,0,0.25)" : undefined,
          }}
          {...props}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="auth-toggle-pw"
        >
          {showPassword
            ? <EyeOff size={15} strokeWidth={1.5} />
            : <Eye size={15} strokeWidth={1.5} />
          }
        </button>
      </div>
      {error && (
        <p style={{ fontSize: 11, color: "rgba(0,0,0,0.5)", fontWeight: 500, margin: "5px 0 0" }}>
          {error}
        </p>
      )}
    </div>
  )
})

const SubmitButton = memo(function SubmitButton({ children, loading, disabled, variant = "primary", ...props }) {
  return (
    <button
      disabled={loading || disabled}
      className={variant === "primary" ? "auth-btn-primary" : "auth-btn-secondary"}
      {...props}
    >
      {loading ? (
        <Loader2 size={15} style={{ animation: "auth-spin 0.7s linear infinite" }} />
      ) : (
        <>
          {children}
          <ArrowRight size={13} strokeWidth={1.5} />
        </>
      )}
    </button>
  )
})

const BackButton = memo(function BackButton({ onClick, children }) {
  return (
    <button onClick={onClick} className="auth-back-btn">
      <ArrowLeft size={14} strokeWidth={1.5} />
      {children || "Back to sign in"}
    </button>
  )
})

/* ─── Main Modal ─── */
export default function AuthModal() {
  const { isModalOpen, modalView, closeModal } = useAuth()
  const overlayRef = useRef(null)

  // Lock scroll
  useEffect(() => {
    if (!isModalOpen) return
    const scrollY = window.scrollY
    Object.assign(document.body.style, {
      position: "fixed", top: `-${scrollY}px`,
      overflow: "hidden", width: "100%",
    })
    return () => {
      Object.assign(document.body.style, {
        position: "", top: "", overflow: "", width: "",
      })
      window.scrollTo(0, scrollY)
    }
  }, [isModalOpen])

  // Escape key
  useEffect(() => {
    if (!isModalOpen) return
    const h = (e) => e.key === "Escape" && closeModal()
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [isModalOpen, closeModal])

  const handleOverlayClick = useCallback(
    (e) => { if (e.target === overlayRef.current) closeModal() },
    [closeModal]
  )

  if (!isModalOpen) return null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;1,300&display=swap');

        @keyframes auth-spin { to { transform: rotate(360deg); } }
        @keyframes auth-fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes auth-slideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .auth-overlay {
          position: fixed; inset: 0; z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          background: rgba(0,0,0,0.28);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          animation: auth-fadeIn 0.2s ease;
        }

        .auth-panel {
          position: relative; width: 100%; max-width: 420px;
          background: #fff; border-radius: 16px;
          max-height: 90vh; overflow-y: auto;
          box-shadow: 0 24px 80px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.06);
          animation: auth-slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }

        .auth-close {
          position: absolute; top: 16px; right: 16px; z-index: 10;
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(0,0,0,0.04); border: none;
          display: flex; align-items: center; justify-content: center;
          color: rgba(0,0,0,0.35); cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .auth-close:hover { background: rgba(0,0,0,0.08); color: #000; }

        .auth-label {
          display: block;
          font-family: ${SANS};
          font-size: 9px; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(0,0,0,0.4);
        }

        .auth-input {
          width: 100%; padding: 11px 14px;
          font-family: ${SANS}; font-size: 13px;
          border: 0.5px solid rgba(0,0,0,0.12);
          border-radius: 10px; background: #fff;
          color: #1d1d1f; outline: none;
          transition: border-color 0.2s;
        }
        .auth-input::placeholder { color: rgba(0,0,0,0.22); }
        .auth-input:focus { border-color: rgba(0,0,0,0.4); }
        .auth-input:disabled { opacity: 0.5; cursor: not-allowed; }

        .auth-toggle-pw {
          position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(0,0,0,0.28); padding: 2px;
          transition: color 0.2s;
        }
        .auth-toggle-pw:hover { color: rgba(0,0,0,0.55); }

        .auth-btn-primary {
          width: 100%; display: flex; align-items: center;
          justify-content: center; gap: 8px;
          height: 46px; border-radius: 12px;
          background: #1d1d1f; color: #fff;
          border: none; cursor: pointer;
          font-family: ${SANS}; font-size: 10px;
          font-weight: 600; letter-spacing: 0.18em;
          text-transform: uppercase;
          transition: opacity 0.2s;
        }
        .auth-btn-primary:hover { opacity: 0.82; }
        .auth-btn-primary:active { transform: scale(0.98); }
        .auth-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

        .auth-btn-secondary {
          width: 100%; display: flex; align-items: center;
          justify-content: center; gap: 8px;
          height: 46px; border-radius: 12px;
          background: transparent; color: #1d1d1f;
          border: 0.5px solid rgba(0,0,0,0.14);
          cursor: pointer;
          font-family: ${SANS}; font-size: 10px;
          font-weight: 600; letter-spacing: 0.18em;
          text-transform: uppercase;
          transition: background 0.2s, border-color 0.2s;
        }
        .auth-btn-secondary:hover { background: rgba(0,0,0,0.03); border-color: rgba(0,0,0,0.22); }
        .auth-btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }

        .auth-back-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 6px; width: 100%;
          background: none; border: none; cursor: pointer;
          font-family: ${SANS}; font-size: 12px;
          color: rgba(0,0,0,0.38);
          transition: color 0.2s;
          padding: 8px 0;
        }
        .auth-back-btn:hover { color: #1d1d1f; }

        .auth-link {
          background: none; border: none; cursor: pointer;
          font-family: ${SANS}; font-size: 12px;
          color: #1d1d1f; font-weight: 500;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .auth-link:hover { opacity: 0.6; }

        .auth-forgot {
          background: none; border: none; cursor: pointer;
          font-family: ${SANS}; font-size: 11px;
          color: rgba(0,0,0,0.35);
          transition: color 0.2s;
        }
        .auth-forgot:hover { color: #1d1d1f; }

        .auth-divider {
          width: 100%; height: 0.5px;
          background: rgba(0,0,0,0.06);
        }

        .auth-icon-circle {
          width: 56px; height: 56px; border-radius: 50%;
          background: rgba(0,0,0,0.03);
          border: 0.5px solid rgba(0,0,0,0.08);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
        }

        .auth-info-box {
          padding: 14px 16px; border-radius: 10px;
          border: 0.5px solid rgba(0,0,0,0.08);
          background: rgba(0,0,0,0.015);
        }

        .auth-success-box {
          padding: 12px 16px; border-radius: 10px;
          border: 0.5px solid rgba(0,0,0,0.1);
          background: rgba(0,0,0,0.03);
        }
      `}</style>

      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className="auth-overlay"
      >
        <div
          className="auth-panel"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={closeModal} className="auth-close" aria-label="Close modal">
            <X size={16} strokeWidth={1.5} />
          </button>

          <div style={{ padding: "32px 28px" }}>
            <ViewSwitcher view={modalView} />
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── View Switcher ─── */
const ViewSwitcher = memo(function ViewSwitcher({ view }) {
  return (
    <>
      {view === "login" && <LoginView />}
      {view === "register" && <RegisterView />}
      {view === "register-success" && <RegisterSuccessView />}
      {view === "forgot" && <ForgotPasswordView />}
      {view === "reset-success" && <ResetSuccessView />}
    </>
  )
})

/* ─── Login View ─── */
const LoginView = memo(function LoginView() {
  const { switchView, loginSuccess } = useAuth()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState("")
  const [remainingAttempts, setRemainingAttempts] = useState(null)

  const validateForm = useCallback(() => {
    const e = {}
    if (!formData.email?.trim()) e.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Invalid email format"
    if (!formData.password) e.password = "Password is required"
    else if (formData.password.length < 6) e.password = "Password must be at least 6 characters"
    setErrors(e)
    return Object.keys(e).length === 0
  }, [formData])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((p) => ({ ...p, [name]: value }))
    setErrors((p) => ({ ...p, [name]: "" }))
    setServerError("")
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    setServerError("")
    try {
      const res = await loginAPI(formData.email, formData.password)
      if (res.user) loginSuccess(res.user)
    } catch (err) {
      setServerError(err.message || "Login failed. Please try again.")
      if (err.remainingAttempts !== undefined) setRemainingAttempts(err.remainingAttempts)
    } finally {
      setLoading(false)
    }
  }, [formData, validateForm, loginSuccess])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <p style={{
          fontFamily: SERIF, fontWeight: 300, fontStyle: "italic",
          fontSize: 15, letterSpacing: "0.2em", color: "rgba(0,0,0,0.35)",
          margin: "0 0 20px",
        }}>
          Wash2Door
        </p>
        <h2 style={{
          fontFamily: SERIF, fontWeight: 300, fontSize: 26,
          color: "#1d1d1f", margin: "0 0 6px", letterSpacing: "-0.01em",
        }}>
          Welcome Back
        </h2>
        <p style={{ fontSize: 12, color: "rgba(0,0,0,0.38)", margin: 0 }}>
          Sign in to your account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {serverError && <ErrorAlert message={serverError} attempts={remainingAttempts} />}

        <InputField
          icon={Mail} label="Email" type="email" name="email"
          value={formData.email} onChange={handleChange}
          placeholder="you@example.com" error={errors.email}
          disabled={loading} autoComplete="email"
        />

        <PasswordField
          label="Password" name="password"
          value={formData.password} onChange={handleChange}
          showPassword={showPassword}
          onToggle={() => setShowPassword((s) => !s)}
          placeholder="••••••••" error={errors.password}
          disabled={loading} autoComplete="current-password"
        />

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="button" onClick={() => switchView("forgot")} className="auth-forgot">
            Forgot password?
          </button>
        </div>

        <SubmitButton loading={loading} disabled={loading}>Sign In</SubmitButton>
      </form>

      {/* Footer */}
      <div>
        <div className="auth-divider" style={{ marginBottom: 20 }} />
        <p style={{ textAlign: "center", fontSize: 12, color: "rgba(0,0,0,0.38)", margin: 0 }}>
          Don&apos;t have an account?{" "}
          <button onClick={() => switchView("register")} className="auth-link">
            Create one
          </button>
        </p>
      </div>
    </div>
  )
})

/* ─── Register View ─── */
const RegisterView = memo(function RegisterView() {
  const { switchView } = useAuth()
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "",
    password: "", confirmPassword: "",
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState("")

  const validateForm = useCallback(() => {
    const e = {}
    if (!formData.firstName?.trim()) e.firstName = "First name is required"
    if (!formData.lastName?.trim()) e.lastName = "Last name is required"
    if (!formData.email?.trim()) e.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Invalid email format"
    if (!formData.password) e.password = "Password is required"
    else if (formData.password.length < 8) e.password = "At least 8 characters"
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password))
      e.password = "Must include upper, lower, number & special char"
    if (!formData.confirmPassword) e.confirmPassword = "Confirm your password"
    else if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords don't match"
    setErrors(e)
    return Object.keys(e).length === 0
  }, [formData])

  const handleChange = useCallback((ev) => {
    const { name, value } = ev.target
    setFormData((p) => ({ ...p, [name]: value }))
    setErrors((p) => ({ ...p, [name]: "" }))
    setServerError("")
  }, [])

  const handleSubmit = useCallback(async (ev) => {
    ev.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    setServerError("")
    try {
      await registerAPI(formData.firstName, formData.lastName, formData.email, formData.password, formData.confirmPassword)
      switchView("register-success", formData.email)
    } catch (err) {
      setServerError(err.message || "Registration failed.")
    } finally {
      setLoading(false)
    }
  }, [formData, validateForm, switchView])

  const passwordOk = formData.password && !errors.password

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <p style={{
          fontFamily: SERIF, fontWeight: 300, fontStyle: "italic",
          fontSize: 15, letterSpacing: "0.2em", color: "rgba(0,0,0,0.35)",
          margin: "0 0 20px",
        }}>
          Wash2Door
        </p>
        <h2 style={{
          fontFamily: SERIF, fontWeight: 300, fontSize: 26,
          color: "#1d1d1f", margin: "0 0 6px", letterSpacing: "-0.01em",
        }}>
          Create Account
        </h2>
        <p style={{ fontSize: 12, color: "rgba(0,0,0,0.38)", margin: 0 }}>
          Join us today
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {serverError && <ErrorAlert message={serverError} attempts={null} />}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <InputField
            icon={User} label="First Name" type="text" name="firstName"
            value={formData.firstName} onChange={handleChange}
            placeholder="John" error={errors.firstName}
            disabled={loading} autoComplete="given-name"
          />
          <InputField
            label="Last Name" type="text" name="lastName"
            value={formData.lastName} onChange={handleChange}
            placeholder="Doe" error={errors.lastName}
            disabled={loading} autoComplete="family-name"
          />
        </div>

        <InputField
          icon={Mail} label="Email" type="email" name="email"
          value={formData.email} onChange={handleChange}
          placeholder="you@example.com" error={errors.email}
          disabled={loading} autoComplete="email"
        />

        <div>
          <PasswordField
            label="Password" name="password"
            value={formData.password} onChange={handleChange}
            showPassword={showPassword}
            onToggle={() => setShowPassword((s) => !s)}
            placeholder="Min 8 characters" error={errors.password}
            disabled={loading} autoComplete="new-password"
          />
          {passwordOk && (
            <p style={{
              fontSize: 10, color: "rgba(0,0,0,0.45)", fontWeight: 500,
              margin: "6px 0 0", display: "flex", alignItems: "center", gap: 4,
            }}>
              <CheckCircle size={11} /> Strong password
            </p>
          )}
        </div>

        <PasswordField
          label="Confirm Password" name="confirmPassword"
          value={formData.confirmPassword} onChange={handleChange}
          showPassword={showPassword}
          onToggle={() => setShowPassword((s) => !s)}
          placeholder="••••••••" error={errors.confirmPassword}
          disabled={loading} autoComplete="new-password"
        />

        <SubmitButton loading={loading} disabled={loading}>Create Account</SubmitButton>
      </form>

      {/* Footer */}
      <div>
        <div className="auth-divider" style={{ marginBottom: 20 }} />
        <p style={{ textAlign: "center", fontSize: 12, color: "rgba(0,0,0,0.38)", margin: 0 }}>
          Already have an account?{" "}
          <button onClick={() => switchView("login")} className="auth-link">
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
})

/* ─── Register Success View ─── */
const RegisterSuccessView = memo(function RegisterSuccessView() {
  const { switchView, authEmail } = useAuth()
  const [resending, setResending] = useState(false)
  const [resendStatus, setResendStatus] = useState("")

  const handleResend = useCallback(async () => {
    if (!authEmail || resending) return
    setResending(true)
    setResendStatus("")
    try {
      await resendRegistrationEmailAPI(authEmail)
      setResendStatus("success")
    } catch {
      setResendStatus("error")
    } finally {
      setResending(false)
    }
  }, [authEmail, resending])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ textAlign: "center" }}>
        <div className="auth-icon-circle">
          <Mail size={24} strokeWidth={1.5} style={{ color: "rgba(0,0,0,0.45)" }} />
        </div>
        <h2 style={{
          fontFamily: SERIF, fontWeight: 300, fontSize: 24,
          color: "#1d1d1f", margin: "0 0 8px",
        }}>
          Check Your Email
        </h2>
        <p style={{ fontSize: 12, color: "rgba(0,0,0,0.38)", margin: 0, lineHeight: 1.6 }}>
          We&apos;ve sent a verification link to
          <br />
          <span style={{ color: "#1d1d1f", fontWeight: 500 }}>{authEmail}</span>
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="auth-info-box">
          <p style={{ fontSize: 12, color: "rgba(0,0,0,0.55)", margin: 0, lineHeight: 1.6 }}>
            Click the link in your email to verify your account and start using Wash2Door.
          </p>
        </div>

        {resendStatus === "success" && (
          <div className="auth-success-box">
            <p style={{ fontSize: 12, color: "#1d1d1f", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle size={13} /> Verification email sent!
            </p>
          </div>
        )}

        {resendStatus === "error" && (
          <div className="auth-success-box">
            <p style={{ fontSize: 12, color: "rgba(0,0,0,0.6)", margin: 0 }}>
              Failed to send. Please try again.
            </p>
          </div>
        )}

        <div className="auth-info-box">
          <p style={{ fontSize: 10, color: "rgba(0,0,0,0.45)", fontWeight: 500, margin: "0 0 4px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Didn&apos;t receive the email?
          </p>
          <p style={{ fontSize: 11, color: "rgba(0,0,0,0.35)", margin: "0 0 10px" }}>
            Check your spam folder or request a new link.
          </p>
          <button
            onClick={handleResend}
            disabled={resending}
            className="auth-link"
            style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4, opacity: resending ? 0.5 : 1 }}
          >
            {resending ? (
              <>
                <Loader2 size={11} style={{ animation: "auth-spin 0.7s linear infinite" }} />
                Sending...
              </>
            ) : (
              "Resend Verification Email"
            )}
          </button>
        </div>
      </div>

      <div>
        <div className="auth-divider" style={{ marginBottom: 16 }} />
        <BackButton onClick={() => switchView("login")} />
      </div>
    </div>
  )
})

/* ─── Forgot Password View ─── */
const ForgotPasswordView = memo(function ForgotPasswordView() {
  const { switchView } = useAuth()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setError("")
    if (!email?.trim()) { setError("Email is required"); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Invalid email format"); return }
    setLoading(true)
    try {
      await forgotPasswordAPI(email)
      setSuccess(true)
    } catch (err) {
      setError(err.message || "Failed to send reset link")
    } finally {
      setLoading(false)
    }
  }, [email])

  if (success) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24, textAlign: "center" }}>
        <div>
          <div className="auth-icon-circle">
            <CheckCircle size={24} strokeWidth={1.5} style={{ color: "rgba(0,0,0,0.5)" }} />
          </div>
          <h2 style={{
            fontFamily: SERIF, fontWeight: 300, fontSize: 24,
            color: "#1d1d1f", margin: "0 0 8px",
          }}>
            Check Your Email
          </h2>
          <p style={{ fontSize: 12, color: "rgba(0,0,0,0.38)", margin: 0, lineHeight: 1.6 }}>
            If an account exists for{" "}
            <span style={{ color: "#1d1d1f", fontWeight: 500 }}>{email}</span>,
            you&apos;ll receive a reset link.
          </p>
        </div>
        <div>
          <div className="auth-divider" style={{ marginBottom: 16 }} />
          <BackButton onClick={() => switchView("login")} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ textAlign: "center" }}>
        <div className="auth-icon-circle">
          <Lock size={24} strokeWidth={1.5} style={{ color: "rgba(0,0,0,0.35)" }} />
        </div>
        <h2 style={{
          fontFamily: SERIF, fontWeight: 300, fontSize: 24,
          color: "#1d1d1f", margin: "0 0 6px",
        }}>
          Reset Password
        </h2>
        <p style={{ fontSize: 12, color: "rgba(0,0,0,0.38)", margin: 0 }}>
          Enter your email and we&apos;ll send a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {error && <ErrorAlert message={error} attempts={null} />}

        <InputField
          icon={Mail} label="Email Address" type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError("") }}
          placeholder="you@example.com"
          disabled={loading} autoComplete="email"
        />

        <SubmitButton loading={loading} disabled={loading}>Send Reset Link</SubmitButton>
      </form>

      <div>
        <div className="auth-divider" style={{ marginBottom: 16 }} />
        <BackButton onClick={() => switchView("login")} />
      </div>
    </div>
  )
})

/* ─── Reset Success View ─── */
const ResetSuccessView = memo(function ResetSuccessView() {
  const { switchView } = useAuth()

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, textAlign: "center", padding: "12px 0" }}>
      <div>
        <div className="auth-icon-circle">
          <CheckCircle size={24} strokeWidth={1.5} style={{ color: "rgba(0,0,0,0.5)" }} />
        </div>
        <h2 style={{
          fontFamily: SERIF, fontWeight: 300, fontSize: 24,
          color: "#1d1d1f", margin: "0 0 8px",
        }}>
          Password Reset!
        </h2>
        <p style={{ fontSize: 12, color: "rgba(0,0,0,0.38)", margin: 0, lineHeight: 1.6 }}>
          Your password has been successfully reset. You can now sign in with your new password.
        </p>
      </div>

      <button
        onClick={() => switchView("login")}
        className="auth-btn-primary"
        style={{ maxWidth: 200, margin: "0 auto" }}
      >
        Sign In
        <ArrowRight size={13} strokeWidth={1.5} />
      </button>
    </div>
  )
})