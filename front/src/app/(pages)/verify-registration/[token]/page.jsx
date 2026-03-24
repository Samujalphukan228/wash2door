"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { CheckCircle, ArrowRight, Droplets } from "lucide-react"
import { verifyRegistration } from "@/lib/auth.api"
import { useAuth } from "@/context/AuthContext"

export default function VerifyRegistrationPage() {
  const params = useParams()
  const router = useRouter()
  const { loginSuccess } = useAuth()
  const token = params.token

  useEffect(() => {
    const navbar = document.querySelector("nav")
    const footer = document.querySelector("footer")
    const topbar = document.querySelector("[role='marquee']")
    if (navbar) navbar.style.display = "none"
    if (footer) footer.style.display = "none"
    if (topbar) topbar.style.display = "none"

    return () => {
      if (navbar) navbar.style.display = ""
      if (footer) footer.style.display = ""
      if (topbar) topbar.style.display = ""
    }
  }, [])

  useEffect(() => {
    const verify = async () => {
      try {
        const result = await verifyRegistration(token)
        if (result?.user && result?.accessToken) {
          localStorage.setItem("accessToken", result.accessToken)
          loginSuccess(result.user)
        }
      } catch (err) {
        // silently ignore errors
      }
    }
    verify()
  }, [])

  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 text-center">
        <div className="inline-flex items-center gap-2 mb-8">
          <Droplets size={24} strokeWidth={1.5} className="text-blue-500" />
          <span
            className="text-black"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: "20px", fontWeight: 300 }}
          >
            Wash<span className="text-blue-500">2</span>Door
          </span>
        </div>

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
          Your registration is complete. Click below to go home.
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
      </div>
    </div>
  )
}