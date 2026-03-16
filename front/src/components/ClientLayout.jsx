"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { AuthProvider } from "@/context/AuthContext"

const ease = [0.76, 0, 0.24, 1]

export default function ClientLayout({ children }) {
  // Start as `true` (skip intro) until we confirm it's the first visit this session.
  // This means: on tab switch / remount, content is always visible immediately.
  const [done, setDone] = useState(true)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // Only runs client-side, after hydration
    const seen = sessionStorage.getItem("w2d_intro") === "1"

    if (seen) {
      // Already seen — stay done, just mark checked
      setChecked(true)
      return
    }

    // First visit this session — show the intro
    setDone(false)
    setChecked(true)

    const t = setTimeout(() => {
      sessionStorage.setItem("w2d_intro", "1")
      setDone(true)
    }, 2200)

    return () => clearTimeout(t)
  }, [])

  // Until we've read sessionStorage, render content visible (no flash)
  // The intro will only appear after the check confirms it's needed
  if (!checked) {
    return (
      <AuthProvider>
        <Navbar />
        {children}
        <Footer />
      </AuthProvider>
    )
  }

  return (
    <AuthProvider>
      <AnimatePresence>
        {!done && (
          <motion.div
            key="overlay"
            className="fixed inset-0 z-[9999] pointer-events-none flex flex-col"
          >
            {/* Top half */}
            <motion.div
              className="flex-1 bg-[#080808]"
              initial={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 1.1, ease }}
            />

            {/* Brand mark */}
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.p
                className="text-white font-light uppercase tracking-[0.5em] pl-[0.5em]"
                style={{ fontFamily: "Georgia, serif", fontSize: "clamp(18px, 3vw, 28px)" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                Wash2Door
              </motion.p>

              <motion.div
                className="h-px bg-white/20"
                initial={{ width: 0 }}
                animate={{ width: 48 }}
                transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
              />

              <motion.p
                className="text-white/30 uppercase font-light tracking-[0.55em] pl-[0.55em]"
                style={{ fontSize: 9 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                Doorstep Luxury
              </motion.p>
            </motion.div>

            {/* Bottom half */}
            <motion.div
              className="flex-1 bg-[#080808]"
              initial={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 1.1, ease }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <Navbar />
        {children}
        <Footer />
      </div>
    </AuthProvider>
  )
}