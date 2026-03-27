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
  AlertCircle,
} from "lucide-react"
import {
  login as loginAPI,
  register as registerAPI,
  resendRegistrationEmail as resendRegistrationEmailAPI,
  forgotPassword as forgotPasswordAPI,
} from "@/lib/auth.api"

// ── Reusable Components ───────────────────────────────────

const ErrorAlert = memo(({ message, attempts }) => (
  <div className="bg-gray-50 border border-gray-300 px-4 py-3 rounded-lg flex gap-3">
    <AlertCircle size={16} className="text-gray-700 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="text-gray-800 text-sm font-medium">{message}</p>
      {attempts !== null && attempts > 0 && (
        <p className="text-gray-600 text-xs mt-1">
          {attempts} attempt{attempts !== 1 ? "s" : ""} remaining
        </p>
      )}
    </div>
  </div>
))

ErrorAlert.displayName = "ErrorAlert"

const InputField = memo(({ icon: Icon, label, error, ...props }) => (
  <div className="space-y-2">
    <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon
          size={16}
          strokeWidth={1.5}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      )}
      <input
        className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-3 text-sm border rounded-lg
          bg-white transition-colors duration-150
          ${
            error
              ? "border-gray-400 focus:border-gray-600"
              : "border-gray-200 focus:border-black"
          }
          focus:outline-none placeholder-gray-400`}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-gray-700 font-medium">{error}</p>}
  </div>
))

InputField.displayName = "InputField"

const PasswordField = memo(
  ({ label, showPassword, onToggle, error, ...props }) => (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <Lock
          size={16}
          strokeWidth={1.5}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type={showPassword ? "text" : "password"}
          className={`w-full pl-10 pr-10 py-3 text-sm border rounded-lg
            bg-white transition-colors duration-150
            ${
              error
                ? "border-gray-400 focus:border-gray-600"
                : "border-gray-200 focus:border-black"
            }
            focus:outline-none placeholder-gray-400`}
          {...props}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
        </button>
      </div>
      {error && <p className="text-xs text-gray-700 font-medium">{error}</p>}
    </div>
  )
)

PasswordField.displayName = "PasswordField"

const Button = memo(
  ({ children, loading, disabled, variant = "primary", ...props }) => {
    const variants = {
      primary:
        "bg-black text-white hover:bg-gray-800 disabled:bg-gray-400",
      secondary:
        "border border-gray-300 text-black hover:bg-gray-50 disabled:opacity-50",
    }

    return (
      <button
        disabled={loading || disabled}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm uppercase tracking-wider transition-colors duration-150 ${variants[variant]}`}
        {...props}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            {children}
            <ArrowRight size={14} strokeWidth={1.5} />
          </>
        )}
      </button>
    )
  }
)

Button.displayName = "Button"

const Logo = memo(() => (
  <span className="text-xl font-light text-black tracking-wide">
    Wash<span className="font-medium">2</span>Door
  </span>
))

Logo.displayName = "Logo"

// ── Main Modal Component ──────────────────────────────────
export default function AuthModal() {
  const { isModalOpen, modalView, closeModal } = useAuth()
  const overlayRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    if (!isModalOpen) return

    const scrollY = window.scrollY
    document.body.style.position = "fixed"
    document.body.style.top = `-${scrollY}px`
    document.body.style.overflow = "hidden"
    document.body.style.width = "100%"

    return () => {
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.overflow = ""
      document.body.style.width = ""
      window.scrollTo(0, scrollY)
    }
  }, [isModalOpen])

  useEffect(() => {
    if (!isModalOpen) return

    const handleEscape = (e) => {
      if (e.key === "Escape") closeModal()
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isModalOpen, closeModal])

  const handleOverlayClick = useCallback((e) => {
    if (e.target === overlayRef.current) closeModal()
  }, [closeModal])

  if (!isModalOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200"
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-md bg-white rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center 
                     text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors duration-150"
          aria-label="Close modal"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        <div className="p-6 md:p-8">
          <ViewSwitcher view={modalView} />
        </div>
      </div>
    </div>
  )
}

// ── View Switcher ─────────────────────────────────────────
const ViewSwitcher = memo(function ViewSwitcher({ view }) {
  return (
    <div className="animate-in fade-in slide-in-from-right-2 duration-200">
      {view === "login" && <LoginView />}
      {view === "register" && <RegisterView />}
      {view === "register-success" && <RegisterSuccessView />}
      {view === "forgot" && <ForgotPasswordView />}
      {view === "reset-success" && <ResetSuccessView />}
    </div>
  )
})

// ── Login View ────────────────────────────────────────────
const LoginView = memo(function LoginView() {
  const { switchView, loginSuccess } = useAuth()

  const [formData, setFormData] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState("")
  const [remainingAttempts, setRemainingAttempts] = useState(null)

  const validateForm = useCallback(() => {
    const newErrors = {}

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: "" }))
    setServerError("")
  }, [])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()

      if (!validateForm()) return

      setLoading(true)
      setServerError("")

      try {
        const response = await loginAPI(formData.email, formData.password)
        if (response.user) {
          loginSuccess(response.user)
        }
      } catch (err) {
        setServerError(err.message || "Login failed. Please try again.")
        if (err.remainingAttempts !== undefined) {
          setRemainingAttempts(err.remainingAttempts)
        }
      } finally {
        setLoading(false)
      }
    },
    [formData, validateForm, loginSuccess]
  )

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mb-6">
          <Logo />
        </div>
        <h2 className="text-2xl font-light text-black mb-2">Welcome Back</h2>
        <p className="text-sm text-gray-500">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <ErrorAlert message={serverError} attempts={remainingAttempts} />
        )}

        <InputField
          icon={Mail}
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          error={errors.email}
          disabled={loading}
          autoComplete="email"
        />

        <PasswordField
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          showPassword={showPassword}
          onToggle={() => setShowPassword((s) => !s)}
          placeholder="••••••••"
          error={errors.password}
          disabled={loading}
          autoComplete="current-password"
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => switchView("forgot")}
            className="text-xs text-gray-500 hover:text-black transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <Button loading={loading} disabled={loading}>
          Sign In
        </Button>
      </form>

      <div className="border-t border-gray-100 pt-6 text-center">
        <p className="text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <button
            onClick={() => switchView("register")}
            className="text-black font-medium hover:underline"
          >
            Create one
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
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState("")

  const validateForm = useCallback(() => {
    const newErrors = {}

    if (!formData.firstName?.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)
    ) {
      newErrors.password =
        "Must contain uppercase, lowercase, number & special character"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: "" }))
    setServerError("")
  }, [])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()

      if (!validateForm()) return

      setLoading(true)
      setServerError("")

      try {
        await registerAPI(
          formData.firstName,
          formData.lastName,
          formData.email,
          formData.password,
          formData.confirmPassword
        )
        switchView("register-success", formData.email)
      } catch (err) {
        setServerError(err.message || "Registration failed. Please try again.")
      } finally {
        setLoading(false)
      }
    },
    [formData, validateForm, switchView]
  )

  const passwordStrength = formData.password && !errors.password

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mb-6">
          <Logo />
        </div>
        <h2 className="text-2xl font-light text-black mb-2">Create Account</h2>
        <p className="text-sm text-gray-500">Join us today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && <ErrorAlert message={serverError} attempts={null} />}

        <div className="grid grid-cols-2 gap-4">
          <InputField
            icon={User}
            label="First Name"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="John"
            error={errors.firstName}
            disabled={loading}
            autoComplete="given-name"
          />
          <InputField
            label="Last Name"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Doe"
            error={errors.lastName}
            disabled={loading}
            autoComplete="family-name"
          />
        </div>

        <InputField
          icon={Mail}
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          error={errors.email}
          disabled={loading}
          autoComplete="email"
        />

        <div>
          <PasswordField
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            showPassword={showPassword}
            onToggle={() => setShowPassword((s) => !s)}
            placeholder="Min 8 characters"
            error={errors.password}
            disabled={loading}
            autoComplete="new-password"
          />
          {passwordStrength && (
            <p className="text-xs text-gray-600 font-medium mt-2 flex items-center gap-1">
              <CheckCircle size={12} /> Strong password
            </p>
          )}
        </div>

        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          showPassword={showPassword}
          onToggle={() => setShowPassword((s) => !s)}
          placeholder="••••••••"
          error={errors.confirmPassword}
          disabled={loading}
          autoComplete="new-password"
        />

        <Button loading={loading} disabled={loading}>
          Create Account
        </Button>
      </form>

      <div className="border-t border-gray-100 pt-6 text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <button
            onClick={() => switchView("login")}
            className="text-black font-medium hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
})

// ── Register Success View ─────────────────────────────────
const RegisterSuccessView = memo(function RegisterSuccessView() {
  const { switchView, authEmail } = useAuth()
  const [resending, setResending] = useState(false)
  const [resendStatus, setResendStatus] = useState("")

  const handleResendEmail = useCallback(async () => {
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
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center">
          <Mail size={28} strokeWidth={1.5} className="text-gray-600" />
        </div>
        <h2 className="text-2xl font-light text-black mb-2">Check Your Email</h2>
        <p className="text-sm text-gray-500">
          We&apos;ve sent a verification link to
          <br />
          <span className="text-black font-medium">{authEmail}</span>
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            Click the link in your email to verify your account and start using
            Wash2Door.
          </p>
        </div>

        {resendStatus === "success" && (
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
            <p className="text-sm text-gray-800 flex items-center gap-2">
              <CheckCircle size={14} /> Verification email sent!
            </p>
          </div>
        )}

        {resendStatus === "error" && (
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
            <p className="text-sm text-gray-800">
              Failed to send. Please try again.
            </p>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-2 font-medium">
            Didn&apos;t receive the email?
          </p>
          <p className="text-xs text-gray-500 mb-3">
            Check your spam folder or request a new verification link.
          </p>
          <button
            onClick={handleResendEmail}
            disabled={resending}
            className="text-xs text-black font-medium hover:underline disabled:opacity-50 flex items-center gap-1"
          >
            {resending ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Sending...
              </>
            ) : (
              "Resend Verification Email"
            )}
          </button>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <button
          onClick={() => switchView("login")}
          className="flex items-center justify-center gap-2 w-full text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to sign in
        </button>
      </div>
    </div>
  )
})

// ── Forgot Password View ──────────────────────────────────
const ForgotPasswordView = memo(function ForgotPasswordView() {
  const { switchView } = useAuth()

  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setError("")

      if (!email?.trim()) {
        setError("Email is required")
        return
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Invalid email format")
        return
      }

      setLoading(true)

      try {
        await forgotPasswordAPI(email)
        setSuccess(true)
      } catch (err) {
        setError(err.message || "Failed to send reset link")
      } finally {
        setLoading(false)
      }
    },
    [email]
  )

  if (success) {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="w-16 h-16 mx-auto bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center">
          <CheckCircle size={28} strokeWidth={1.5} className="text-gray-700" />
        </div>

        <div>
          <h2 className="text-2xl font-light text-black mb-2">Check Your Email</h2>
          <p className="text-sm text-gray-500">
            If an account exists for <strong className="text-black">{email}</strong>,
            you will receive a password reset link.
          </p>
        </div>

        <button
          onClick={() => switchView("login")}
          className="flex items-center justify-center gap-2 w-full text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to sign in
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center">
          <Lock size={28} strokeWidth={1.5} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-light text-black mb-2">Reset Password</h2>
        <p className="text-sm text-gray-500">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorAlert message={error} attempts={null} />}

        <InputField
          icon={Mail}
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError("")
          }}
          placeholder="you@example.com"
          disabled={loading}
          autoComplete="email"
        />

        <Button loading={loading} disabled={loading}>
          Send Reset Link
        </Button>
      </form>

      <div className="border-t border-gray-100 pt-6">
        <button
          onClick={() => switchView("login")}
          className="flex items-center justify-center gap-2 w-full text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to sign in
        </button>
      </div>
    </div>
  )
})

// ── Reset Success View ────────────────────────────────────
const ResetSuccessView = memo(function ResetSuccessView() {
  const { switchView } = useAuth()

  return (
    <div className="text-center space-y-6 py-4">
      <div className="w-16 h-16 mx-auto bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center">
        <CheckCircle size={28} strokeWidth={1.5} className="text-gray-700" />
      </div>

      <div>
        <h2 className="text-2xl font-light text-black mb-2">Password Reset!</h2>
        <p className="text-sm text-gray-500">
          Your password has been successfully reset. You can now sign in with
          your new password.
        </p>
      </div>

      <button
        onClick={() => switchView("login")}
        className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-black text-white 
                   rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
      >
        Sign In
        <ArrowRight size={16} strokeWidth={1.5} />
      </button>
    </div>
  )
})