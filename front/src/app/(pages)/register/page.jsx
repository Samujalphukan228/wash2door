"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Droplets,
  AlertCircle
} from "lucide-react"
import { register } from "@/lib/auth.api"

export default function RegisterPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [success, setSuccess] = useState(false)
  const [successEmail, setSuccessEmail] = useState("")

  const validateForm = () => {
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
        "Password must contain uppercase, lowercase, number & special character"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
    setServerError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError("")

    if (!validateForm()) return

    setLoading(true)

    try {
      await register(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password,
        formData.confirmPassword
      )
      setSuccess(true)
      setSuccessEmail(formData.email)
    } catch (err) {
      setServerError(err.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Success View
  if (success) {
    return (
      <div 
        className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
        style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      >
        <div className="w-full max-w-md bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100">
          <div className="text-center">
            {/* Logo */}
            <div className="inline-flex items-center gap-2 mb-8">
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

            <div className="w-16 h-16 mx-auto mb-6 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center">
              <Mail size={28} strokeWidth={1.5} className="text-blue-500" />
            </div>

            <h2
              className="text-black mb-2"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: "28px",
              }}
            >
              Check Your Email
            </h2>

            <p className="text-gray-400 mb-8" style={{ fontSize: "13px", lineHeight: 1.6 }}>
              We've sent a verification link to <br />
              <span className="text-black font-medium">{successEmail}</span>
              <br />
              <br />
              Click the link in your email to complete registration.
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8">
              <p className="text-blue-600" style={{ fontSize: "12px" }}>
                <strong>Tip:</strong> Check your spam folder if you don't see the email.
              </p>
            </div>

            <button
              onClick={() => router.push("/")}
              className="group w-full inline-flex items-center justify-center gap-2 h-12
                         bg-black text-white rounded-full
                         hover:bg-gray-800 active:scale-[0.97]
                         transition-all duration-300"
            >
              <span
                className="tracking-wider uppercase"
                style={{ fontSize: "10px", fontWeight: 500 }}
              >
                Back to Home
              </span>
              <ArrowRight
                size={14}
                strokeWidth={1.5}
                className="group-hover:translate-x-0.5 transition-transform duration-300"
              />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo */}
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

          <div className="w-16 h-16 mx-auto mb-6 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center">
            <User size={28} strokeWidth={1.5} className="text-blue-500" />
          </div>

          <h2
            className="text-black mb-2"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 300,
              fontSize: "28px",
            }}
          >
            Create Account
          </h2>

          <p className="text-gray-400" style={{ fontSize: "13px" }}>
            Join us today and start booking
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Server Error */}
          {serverError && (
            <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-xl flex items-start gap-3">
              <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-600" style={{ fontSize: "12px" }}>
                {serverError}
              </p>
            </div>
          )}

          {/* First Name */}
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
                className={`w-full bg-gray-50 border pl-12 pr-4 h-12 
                           text-black placeholder-gray-300 rounded-xl
                           focus:outline-none transition-colors duration-300
                           ${
                             errors.firstName
                               ? "border-red-300 focus:border-red-500"
                               : "border-gray-200 focus:border-black"
                           }`}
                style={{ fontSize: "13px" }}
              />
            </div>
            {errors.firstName && (
              <p className="text-red-600 mt-2" style={{ fontSize: "11px" }}>
                {errors.firstName}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label
              className="block text-gray-400 tracking-wider uppercase mb-2"
              style={{ fontSize: "9px", letterSpacing: "0.3em" }}
            >
              Last Name
            </label>
            <div className="relative">
              <User
                size={16}
                strokeWidth={1.5}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className={`w-full bg-gray-50 border pl-12 pr-4 h-12 
                           text-black placeholder-gray-300 rounded-xl
                           focus:outline-none transition-colors duration-300
                           ${
                             errors.lastName
                               ? "border-red-300 focus:border-red-500"
                               : "border-gray-200 focus:border-black"
                           }`}
                style={{ fontSize: "13px" }}
              />
            </div>
            {errors.lastName && (
              <p className="text-red-600 mt-2" style={{ fontSize: "11px" }}>
                {errors.lastName}
              </p>
            )}
          </div>

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
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full bg-gray-50 border pl-12 pr-4 h-12 
                           text-black placeholder-gray-300 rounded-xl
                           focus:outline-none transition-colors duration-300
                           ${
                             errors.email
                               ? "border-red-300 focus:border-red-500"
                               : "border-gray-200 focus:border-black"
                           }`}
                style={{ fontSize: "13px" }}
              />
            </div>
            {errors.email && (
              <p className="text-red-600 mt-2" style={{ fontSize: "11px" }}>
                {errors.email}
              </p>
            )}
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
                className={`w-full bg-gray-50 border pl-12 pr-12 h-12 
                           text-black placeholder-gray-300 rounded-xl
                           focus:outline-none transition-colors duration-300
                           ${
                             errors.password
                               ? "border-red-300 focus:border-red-500"
                               : "border-gray-200 focus:border-black"
                           }`}
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
            {errors.password ? (
              <p className="text-red-600 mt-2" style={{ fontSize: "11px" }}>
                {errors.password}
              </p>
            ) : formData.password && !errors.password ? (
              <p className="text-emerald-600 mt-2" style={{ fontSize: "11px" }}>
                ✓ Strong password
              </p>
            ) : (
              <p className="text-gray-300 mt-2" style={{ fontSize: "11px" }}>
                Must contain uppercase, lowercase, number & special character
              </p>
            )}
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
                placeholder="Re-enter password"
                className={`w-full bg-gray-50 border pl-12 pr-4 h-12 
                           text-black placeholder-gray-300 rounded-xl
                           focus:outline-none transition-colors duration-300
                           ${
                             errors.confirmPassword
                               ? "border-red-300 focus:border-red-500"
                               : "border-gray-200 focus:border-black"
                           }`}
                style={{ fontSize: "13px" }}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-600 mt-2" style={{ fontSize: "11px" }}>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="group w-full flex items-center justify-center gap-2 h-12 mt-8
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

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-400" style={{ fontSize: "12px" }}>
            Already have an account?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-black font-medium hover:underline transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}