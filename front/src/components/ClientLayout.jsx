"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { AuthProvider } from "@/context/AuthContext"

// ── Animated loading counter ──────────────────────────────────────────────────
function Counter({ onDone }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let start = null
    const duration = 1800

    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.floor(eased * 100))
      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        setDisplay(100)
        setTimeout(onDone, 200)
      }
    }
    requestAnimationFrame(step)
  }, [onDone])

  return (
    <span className="font-mono text-white tabular-nums">
      {String(display).padStart(3, "0")}
    </span>
  )
}

// ── Floating dust particles ───────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 1.5 + 0.5,
  delay: Math.random() * 1.2,
  dur: Math.random() * 2 + 2,
}))

function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            delay: p.delay,
            duration: p.dur,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// ── Main layout ───────────────────────────────────────────────────────────────
export default function ClientLayout({ children }) {
  const [phase, setPhase] = useState("intro") // intro → exit → done

  const handleCounterDone = () => {
    setTimeout(() => setPhase("exit"), 100)
    setTimeout(() => setPhase("done"), 1600)
  }

  // Staggered curtain strips — 5 vertical columns
  const strips = [0, 1, 2, 3, 4]

  return (
    <AuthProvider>
      {/* ══════════════════════════════════════════════
          REVEAL OVERLAY
      ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {phase !== "done" && (
          <motion.div
            key="reveal"
            className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
          >
            {/* ── 5 staggered vertical curtain strips ── */}
            {strips.map((i) => (
              <motion.div
                key={i}
                className="absolute top-0 bottom-0 bg-[#080808]"
                style={{ left: `${i * 20}%`, width: "20.5%" }}
                initial={{ y: 0 }}
                animate={
                  phase === "exit"
                    ? { y: "-102%" }
                    : { y: 0 }
                }
                transition={{
                  duration: 0.85,
                  delay: i * 0.07,
                  ease: [0.76, 0, 0.24, 1],
                }}
              />
            ))}

            {/* ── Noise grain overlay ── */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                backgroundSize: "128px",
              }}
            />

            {/* ── Dust particles ── */}
            <Particles />

            {/* ── Horizontal scan line ── */}
            <motion.div
              className="absolute left-0 right-0 h-px"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.15) 80%, transparent 100%)",
              }}
              initial={{ top: "-2px", opacity: 0 }}
              animate={
                phase === "intro"
                  ? { top: ["0%", "100%"], opacity: [0, 0.8, 0] }
                  : { opacity: 0 }
              }
              transition={{
                duration: 1.6,
                delay: 0.3,
                ease: "linear",
              }}
            />

            {/* ── Center stage ── */}
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center"
              animate={phase === "exit" ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.25, ease: "easeIn" }}
            >
              {/* Outer ring */}
              <motion.div
                className="absolute border border-white/10"
                initial={{ width: 0, height: 0, opacity: 0 }}
                animate={{ width: 320, height: 320, opacity: 1 }}
                transition={{ delay: 0.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                style={{ borderRadius: 0 }}
              />

              {/* Inner ring */}
              <motion.div
                className="absolute border border-white/5"
                initial={{ width: 0, height: 0, opacity: 0 }}
                animate={{ width: 260, height: 260, opacity: 1 }}
                transition={{ delay: 0.35, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                style={{ borderRadius: 0 }}
              />

              {/* Corner accents — top-left */}
              {[
                "top-[calc(50%-160px)] left-[calc(50%-160px)]",
                "top-[calc(50%-160px)] right-[calc(50%-160px)]",
                "bottom-[calc(50%-160px)] left-[calc(50%-160px)]",
                "bottom-[calc(50%-160px)] right-[calc(50%-160px)]",
              ].map((pos, ci) => (
                <motion.div
                  key={ci}
                  className={`absolute w-3 h-3 border-white ${pos}`}
                  style={{
                    borderTopWidth: ci < 2 ? 1 : 0,
                    borderBottomWidth: ci >= 2 ? 1 : 0,
                    borderLeftWidth: ci % 2 === 0 ? 1 : 0,
                    borderRightWidth: ci % 2 === 1 ? 1 : 0,
                  }}
                  initial={{ opacity: 0, scale: 2 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + ci * 0.05, duration: 0.4 }}
                />
              ))}

              {/* Brand content */}
              <div className="relative flex flex-col items-center gap-4 z-10">
                {/* W monogram */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center justify-center w-16 h-16 border border-white/20"
                >
                  <span
                    className="text-white font-light"
                    style={{ fontFamily: "Georgia, serif", fontSize: 28, letterSpacing: "0.05em" }}
                  >
                    W
                  </span>
                </motion.div>

                {/* Horizontal rule */}
                <motion.div
                  className="bg-white/30 h-px"
                  initial={{ width: 0 }}
                  animate={{ width: 80 }}
                  transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
                />

                {/* Brand name — chars staggered */}
                <motion.div className="overflow-hidden">
                  <motion.p
                    className="text-white font-light uppercase"
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: "clamp(20px, 3.5vw, 32px)",
                      letterSpacing: "0.5em",
                      paddingLeft: "0.5em", // optical balance for tracking
                    }}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.75, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  >
                    Wash2Door
                  </motion.p>
                </motion.div>

                {/* Tagline */}
                <motion.p
                  className="text-white/30 uppercase font-light"
                  style={{ fontSize: 9, letterSpacing: "0.7em", paddingLeft: "0.7em" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                >
                  Doorstep Luxury · Duliajan
                </motion.p>

                {/* Counter row */}
                <motion.div
                  className="flex items-center gap-3 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.4 }}
                >
                  <div className="h-px w-6 bg-white/20" />
                  <span className="text-white/20 uppercase" style={{ fontSize: 9, letterSpacing: "0.3em" }}>
                    Loading
                  </span>
                  <span style={{ fontSize: 11, letterSpacing: "0.05em" }}>
                    <Counter onDone={handleCounterDone} />
                  </span>
                  <span className="text-white/40" style={{ fontSize: 10 }}>%</span>
                  <div className="h-px w-6 bg-white/20" />
                </motion.div>

                {/* Progress bar */}
                <motion.div className="w-32 h-px bg-white/10 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-white/50"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.9, duration: 1.85, ease: "linear" }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════
          PAGE CONTENT — fades in after reveal
      ══════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={phase === "done" ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Navbar />
        {children}
        <Footer />
      </motion.div>
    </AuthProvider>
  )
}