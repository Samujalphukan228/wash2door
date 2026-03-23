"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, CheckCircle, XCircle, ArrowRight, Droplets } from "lucide-react"
import { verifyRegistration } from "@/lib/auth.api"
import { useAuth } from "@/context/AuthContext"

export default function VerifyRegistrationPage() {
  const params = useParams()
  const router = useRouter()
  const { loginSuccess } = useAuth()
  const token = params.token

  const [status, setStatus] = useState("loading")
  const [error, setError] = useState("")
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const verify = async () => {
      if (!token) {
        setError("Invalid verification link")
        setStatus("error")
        return
      }

      try {
        const result = await verifyRegistration(token)

        if (!result?.user || !result?.accessToken) {
          setError("Invalid response from server")
          setStatus("error")
          return
        }

        localStorage.setItem("accessToken", result.accessToken)
        setStatus("success")
        loginSuccess(result.user)

        setTimeout(() => {
          router.push("/")
        }, 2000)

      } catch (err) {
        setError(err.message || "Verification failed. Please try again.")
        setStatus("error")
      }
    }

    verify()
  }, [token])

  const Logo = () => (
    <div className="inline-flex items-center gap-2 mb-8">
      <Droplets size={24} strokeWidth={1.5} className="text-blue-500" />
      <span
        className="text-black"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: "20px", fontWeight: 300 }}
      >
        Wash<span className="text-blue-500">2</span>Door
      </span>
    </div>
  )

  const Card = ({ children }) => (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 text-center">
        {children}
      </div>
    </div>
  )

  if (status === "loading") {
    return (
      <Card>
        <Logo />
        <div className="w-16 h-16 mx-auto mb-6 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center">
          <Loader2 size={28} strokeWidth={1.5} className="text-blue-500 animate-spin" />
        </div>
        <h2
          className="text-black mb-2"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 300, fontSize: "24px" }}
        >
          Verifying Email
        </h2>
        <p className="text-gray-400" style={{ fontSize: "13px" }}>
          Please wait while we verify your email address...
        </p>
      </Card>
    )
  }

  if (status === "success") {
    return (
      <Card>
        <Logo />
        <div className="w-16 h-16 mx-auto mb-6 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center">
          <CheckCircle size={28} strokeWidth={1.5} className="text-emerald-600" />
        </div>
        <h2
          className="text-black mb-2"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 300, fontSize: "28px" }}
        >
          Email Verified!
        </h2>
        <p className="text-gray-400 mb-8" style={{ fontSize: "13px", lineHeight: 1.6 }}>
          Your registration is complete. Redirecting...
        </p>
        <button
          onClick={() => router.push("/")}
          className="group w-full inline-flex items-center justify-center gap-2 h-12 bg-black text-white rounded-full hover:bg-gray-800 active:scale-[0.97] transition-all duration-300"
        >
          <span className="tracking-wider uppercase" style={{ fontSize: "10px", fontWeight: 500 }}>
            Go to Home
          </span>
          <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-0.5 transition-transform duration-300" />
        </button>
      </Card>
    )
  }

  return (
    <Card>
      <Logo />
      <div className="w-16 h-16 mx-auto mb-6 bg-red-50 border border-red-200 rounded-full flex items-center justify-center">
        <XCircle size={28} strokeWidth={1.5} className="text-red-500" />
      </div>
      <h2
        className="text-black mb-2"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 300, fontSize: "28px" }}
      >
        Verification Failed
      </h2>
      <p className="text-gray-400 mb-6" style={{ fontSize: "13px", lineHeight: 1.6 }}>
        {error}
      </p>
      <button
        onClick={() => router.push("/")}
        className="group w-full inline-flex items-center justify-center gap-2 h-12 bg-black text-white rounded-full hover:bg-gray-800 active:scale-[0.97] transition-all duration-300"
      >
        <span className="tracking-wider uppercase" style={{ fontSize: "10px", fontWeight: 500 }}>
          Back to Home
        </span>
        <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-0.5 transition-transform duration-300" />
      </button>
    </Card>
  )
}