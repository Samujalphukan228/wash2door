"use client"

import { useEffect } from "react"
import { useTransitionState } from "@/context/TransitionContext"

export function usePageReady() {
  const { signalReady } = useTransitionState()

  useEffect(() => {
    // Wait for paint, then signal ready
    const raf = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        signalReady()
      })
      return () => cancelAnimationFrame(raf2)
    })
    return () => cancelAnimationFrame(raf)
  }, [signalReady])
}