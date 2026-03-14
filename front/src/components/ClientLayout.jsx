"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { AuthProvider } from "@/context/AuthContext"

const ease = [0.76, 0, 0.24, 1]

export default function ClientLayout({ children }) {
  // If already seen this session, skip straight to done
  const [done, setDone] = useState(() => {
    if (typeof window === "undefined") return false
    return sessionStorage.getItem("w2d_intro") === "1"
  })

  useEffect(() => {
    if (done) return // already seen — don't run timer
    const t = setTimeout(() => {
      sessionStorage.setItem("w2d_intro", "1")
      setDone(true)
    }, 2200)
    return () => clearTimeout(t)
  }, [])

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

      {/* Page content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={done ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Navbar />
        {children}
        <Footer />
      </motion.div>
    </AuthProvider>
  )
}