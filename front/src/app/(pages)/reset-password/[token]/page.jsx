"use client"

import { useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"

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

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError("")
  }, [])

  const handleSubmit = useCallback(async (e) => {
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
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
  }, [formData, token])

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 md:p-10 border border-gray-100 shadow-sm">
          <div className="text-center">
            <div className="mb-8">
              <span className="text-xl font-light text-black tracking-wide">
                Wash<span className="font-medium">2</span>Door
              </span>
            </div>

            <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center">
              <CheckCircle size={28} strokeWidth={1.5} className="text-gray-700" />
            </div>

            <h2 className="text-2xl font-light text-black mb-3">
              Password Reset Successfully
            </h2>

            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Your password has been changed. You can now sign in with your new password.
            </p>

            <button
              onClick={() => router.push("/")}
              className="group inline-flex items-center justify-center gap-2 h-12 px-8
                         bg-black text-white rounded-full
                         hover:bg-gray-800 transition-colors duration-150"
            >
              <span className="text-xs tracking-wider uppercase font-medium">
                Go to Home
              </span>
              <ArrowRight
                size={14}
                strokeWidth={1.5}
                className="group-hover:translate-x-0.5 transition-transform duration-150"
              />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 md:p-10 border border-gray-100 shadow-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <span className="text-xl font-light text-black tracking-wide">
              Wash<span className="font-medium">2</span>Door
            </span>
          </div>

          <div className="w-16 h-16 mx-auto mb-6 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center">
            <Lock size={28} strokeWidth={1.5} className="text-gray-400" />
          </div>

          <h2 className="text-2xl font-light text-black mb-2">
            Reset Password
          </h2>

          <p className="text-gray-500 text-sm">
            Enter your new password below
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-gray-50 border border-gray-300 px-4 py-3 rounded-xl flex items-start gap-3">
              <AlertCircle size={16} className="text-gray-700 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700 text-sm">{error}</p>
            </div>
          )}

          {/* New Password */}
          <div>
            <label className="block text-gray-500 tracking-wider uppercase mb-2 text-[10px]">
              New Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                strokeWidth={1.5}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 characters"
                disabled={loading}
                autoComplete="new-password"
                className="w-full bg-gray-50 border border-gray-200 pl-12 pr-12 h-12 
                           text-black placeholder-gray-400 rounded-xl text-sm
                           focus:outline-none focus:border-black 
                           transition-colors duration-150 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 
                           hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={16} strokeWidth={1.5} />
                ) : (
                  <Eye size={16} strokeWidth={1.5} />
                )}
              </button>
            </div>
            <p className="text-gray-400 mt-2 text-[10px]">
              Must contain uppercase, lowercase, number & special character
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-500 tracking-wider uppercase mb-2 text-[10px]">
              Confirm Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                strokeWidth={1.5}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                disabled={loading}
                autoComplete="new-password"
                className="w-full bg-gray-50 border border-gray-200 pl-12 pr-4 h-12 
                           text-black placeholder-gray-400 rounded-xl text-sm
                           focus:outline-none focus:border-black 
                           transition-colors duration-150 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="group w-full flex items-center justify-center gap-2 h-12 mt-6
                       bg-black text-white rounded-full
                       hover:bg-gray-800 disabled:bg-gray-400
                       transition-colors duration-150"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <span className="tracking-wider uppercase text-[10px] font-medium">
                  Reset Password
                </span>
                <ArrowRight
                  size={14}
                  strokeWidth={1.5}
                  className="group-hover:translate-x-0.5 transition-transform duration-150"
                />
              </>
            )}
          </button>
        </form>

        {/* Back to Home */}
        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-gray-500 hover:text-black tracking-wider uppercase transition-colors text-[10px]"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}