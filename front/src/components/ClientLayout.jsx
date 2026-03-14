"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { AuthProvider } from "@/context/AuthContext"

const EASE_EXPO = [0.16, 1, 0.3, 1]
const EASE_CIRC = [0.85, 0, 0.15, 1]
const LOADER_DURATION = 2200 // ms until progress hits 100
const REVEAL_DURATION = 1.4 // seconds for the circle expand

export default function ClientLayout({ children }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isRevealing, setIsRevealing] = useState(false)
  const [progress, setProgress] = useState(0)
  const rafRef = useRef(null)
  const startRef = useRef(null)

  useEffect(() => {
    startRef.current = performance.now()

    const tick = (now) => {
      const elapsed = now - startRef.current
      const raw = Math.min(elapsed / LOADER_DURATION, 1)
      const eased = 1 - Math.pow(1 - raw, 4)
      setProgress(eased * 100)

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        // Trigger the circle reveal after a brief pause
        setTimeout(() => setIsRevealing(true), 300)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <AuthProvider>
      {/* ══════════════════════════════════════════════════
          CONTENT — revealed by expanding circle clip-path
      ══════════════════════════════════════════════════ */}
      <div className="min-h-screen">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </div>

      {/* ══════════════════════════════════════════════════
          LOADER OVERLAY — with circle cutout that expands
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loader-overlay"
            className="fixed inset-0 z-[9999] pointer-events-none"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: REVEAL_DURATION }}
            onAnimationComplete={() => setIsLoading(false)}
          >
            {/* Black overlay with expanding circle cutout */}
            <motion.div
              className="absolute inset-0 bg-black"
              initial={{ clipPath: "circle(0% at 50% 50%)" }}
              animate={
                isRevealing
                  ? { clipPath: "circle(0% at 50% 50%)" }
                  : { clipPath: "circle(150% at 50% 50%)" }
              }
              exit={{ clipPath: "circle(0% at 50% 50%)" }}
              transition={{
                duration: REVEAL_DURATION,
                ease: EASE_CIRC,
              }}
              style={{
                clipPath: "circle(150% at 50% 50%)",
              }}
            >
              {/* Grain overlay */}
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                  backgroundSize: "128px 128px",
                }}
              />

              {/* Radial glow */}
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.4 }}
                style={{
                  background:
                    "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 70%)",
                }}
              />
            </motion.div>

            {/* Loader content - fades out before circle reveals */}
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center"
              initial={{ opacity: 1 }}
              animate={{ opacity: isRevealing ? 0 : 1 }}
              transition={{ duration: 0.5, ease: EASE_EXPO }}
            >
              {/* Wordmark block */}
              <div className="relative flex flex-col items-center select-none">
                <motion.div
                  className="h-px bg-white/20 mb-10"
                  initial={{ width: 0 }}
                  animate={{ width: "140px" }}
                  transition={{ duration: 1.0, delay: 0.1, ease: EASE_EXPO }}
                />

                <WordmarkStagger />

                <motion.p
                  className="text-white/30 uppercase tracking-[0.4em] mt-5"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontSize: "9px",
                    fontWeight: 300,
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.1, ease: EASE_EXPO }}
                >
                  The Shine That Finds You
                </motion.p>

                <motion.div
                  className="h-px bg-white/20 mt-10"
                  initial={{ width: 0 }}
                  animate={{ width: "140px" }}
                  transition={{ duration: 1.0, delay: 0.3, ease: EASE_EXPO }}
                />
              </div>

              {/* Progress counter */}
              <div
                className="absolute bottom-14 right-12 tabular-nums text-white/25"
                style={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  fontWeight: 300,
                }}
              >
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  {Math.round(progress).toString().padStart(3, "0")}
                </motion.span>
              </div>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/10">
                <div
                  className="h-full bg-white/60"
                  style={{
                    width: `${progress}%`,
                    transition: "width 0.05s linear",
                  }}
                />
              </div>
            </motion.div>

            {/* Circle border indicator during reveal */}
            {isRevealing && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.4, 0] }}
                transition={{ duration: REVEAL_DURATION, ease: "easeInOut" }}
              >
                <motion.div
                  className="rounded-full border-2 border-white/30"
                  initial={{ width: 0, height: 0 }}
                  animate={{
                    width: "300vmax",
                    height: "300vmax",
                  }}
                  transition={{
                    duration: REVEAL_DURATION,
                    ease: EASE_CIRC,
                  }}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </AuthProvider>
  )
}

function WordmarkStagger() {
  return (
    <div className="flex items-center" aria-label="WASH2DOOR">
      {"WASH2DOOR".split("").map((char, i) => (
        <motion.span
          key={i}
          className="text-white inline-block"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: "clamp(24px, 4.8vw, 32px)",
            fontWeight: 300,
            letterSpacing: "0.5em",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.4 + i * 0.06,
            ease: EASE_EXPO,
          }}
        >
          {char}
        </motion.span>
      ))}
    </div>
  )
}