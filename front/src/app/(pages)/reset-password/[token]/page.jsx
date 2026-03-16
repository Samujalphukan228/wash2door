"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Lock, Eye, EyeOff, Loader2, CheckCircle, XCircle, ArrowRight, Droplets } from "lucide-react"

export default function ResetPasswordPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    const { password, confirmPassword } = formData

    if (!password || !confirmPassword) {
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

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    if (!passwordRegex.test(password)) {
      setError("Password must contain uppercase, lowercase, number, and special character")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password")
      }

      setSuccess(true)
    } catch (err) {
      setError(err.message)
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

            <div className="w-16 h-16 mx-auto mb-6 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center">
              <CheckCircle size={28} strokeWidth={1.5} className="text-emerald-600" />
            </div>

            <h2
              className="text-black mb-3"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: "24px",
              }}
            >
              Password Reset Successfully
            </h2>

            <p className="text-gray-400 mb-8" style={{ fontSize: "13px", lineHeight: 1.6 }}>
              Your password has been changed. You can now sign in with your new password.
            </p>

            <button
              onClick={() => router.push("/")}
              className="group inline-flex items-center justify-center gap-2 h-12 px-8
                         bg-black text-white rounded-full
                         hover:bg-gray-800 active:scale-[0.97]
                         transition-all duration-300"
            >
              <span
                className="tracking-wider uppercase"
                style={{ fontSize: "10px", fontWeight: 500 }}
              >
                Go to Home
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

          <div className="w-16 h-16 mx-auto mb-6 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center">
            <Lock size={28} strokeWidth={1.5} className="text-gray-400" />
          </div>

          <h2
            className="text-black mb-2"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 300,
              fontSize: "28px",
            }}
          >
            Reset Password
          </h2>

          <p className="text-gray-400" style={{ fontSize: "13px" }}>
            Enter your new password below
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-xl flex items-start gap-3">
              <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-600" style={{ fontSize: "12px" }}>
                {error}
              </p>
            </div>
          )}

          {/* New Password */}
          <div>
            <label
              className="block text-gray-400 tracking-wider uppercase mb-2"
              style={{ fontSize: "9px", letterSpacing: "0.3em" }}
            >
              New Password
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
            <p className="text-gray-300 mt-2" style={{ fontSize: "9px" }}>
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
                placeholder="Re-enter password"
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
                  Reset Password
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

        {/* Back to Home */}
        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-black tracking-wider uppercase transition-colors"
            style={{ fontSize: "10px" }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}