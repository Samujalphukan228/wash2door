"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Droplets, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function NotFound() {
  const router = useRouter()

  // Hide navbar and footer
  useEffect(() => {
    const navbar = document.querySelector("nav")
    const footer = document.querySelector("footer")
    if (navbar) navbar.style.display = "none"
    if (footer) footer.style.display = "none"

    return () => {
      if (navbar) navbar.style.display = ""
      if (footer) footer.style.display = ""
    }
  }, [])

  return (
    <div
      className="fixed inset-0 bg-[#080808] flex flex-col items-center justify-center p-6"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      {/* Logo */}
      <motion.div
        className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Droplets size={18} strokeWidth={1.5} className="text-white/40" />
        <span
          className="text-white/40 tracking-[0.3em] uppercase"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: "13px", fontWeight: 300 }}
        >
          Wash2Door
        </span>
      </motion.div>

      {/* 404 Number */}
      <motion.h1
        className="text-white/5 select-none absolute"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: "clamp(180px, 30vw, 320px)",
          fontWeight: 300,
          lineHeight: 1,
          letterSpacing: "-0.05em",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        404
      </motion.h1>

      {/* Content */}
      <div className="relative z-10 text-center flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p
            className="text-white mb-3"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
            }}
          >
            Page not found
          </p>
          <p className="text-white/30" style={{ fontSize: "13px", letterSpacing: "0.05em" }}>
            The page you're looking for doesn't exist.
          </p>
        </motion.div>

        <motion.div
          className="h-px w-12 bg-white/10"
          initial={{ width: 0 }}
          animate={{ width: 48 }}
          transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
        />

        <motion.button
          onClick={() => router.push("/")}
          className="group flex items-center gap-3 px-8 h-12 bg-white text-black rounded-full
                     hover:bg-white/90 active:scale-[0.97] transition-all duration-300"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          whileTap={{ scale: 0.97 }}
        >
          <span
            className="tracking-[0.2em] uppercase"
            style={{ fontSize: "10px", fontWeight: 500 }}
          >
            Back to Home
          </span>
          <ArrowRight
            size={13}
            strokeWidth={1.5}
            className="group-hover:translate-x-0.5 transition-transform duration-300"
          />
        </motion.button>
      </div>

      {/* Bottom tagline */}
      <motion.p
        className="absolute bottom-8 text-white/15 uppercase tracking-[0.4em]"
        style={{ fontSize: "9px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        Doorstep Luxury
      </motion.p>
    </div>
  )
}