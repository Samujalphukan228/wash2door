"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useTransitionState } from "@/context/TransitionContext"

const ease = [0.76, 0, 0.24, 1]

export default function PageTransition() {
  const { visible, stage, onCoverDone, onRevealDone } = useTransitionState()

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="wipe"
          className="fixed inset-0 z-[9998] flex items-center justify-center"
          style={{ background: "#080808", pointerEvents: "all" }}
          initial={{ x: "-100%" }}
          animate={stage === "in" ? { x: "0%" } : { x: "100%" }}
          transition={{ duration: 0.7, ease }}
          onAnimationComplete={() => {
            if (stage === "in") onCoverDone()
            if (stage === "out") onRevealDone()
          }}
        >
          <AnimatePresence>
            {stage === "in" && (
              <motion.div
                className="flex flex-col items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p
                  className="text-white font-light uppercase tracking-[0.5em] pl-[0.5em]"
                  style={{ fontFamily: "Georgia, serif", fontSize: "clamp(14px, 2vw, 20px)" }}
                >
                  Wash2Door
                </p>
                <div className="h-px w-10 bg-white/20" />
                <p
                  className="text-white/30 uppercase tracking-[0.55em] pl-[0.55em]"
                  style={{ fontSize: 8 }}
                >
                  Doorstep Luxury
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}