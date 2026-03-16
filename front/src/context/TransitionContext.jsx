"use client"

import { createContext, useContext, useRef, useState } from "react"

const TransitionContext = createContext(null)

export function TransitionProvider({ children }) {
  const [visible, setVisible] = useState(false)
  const [stage, setStage] = useState("idle")
  const callbackRef = useRef(null)

  const startTransition = (callback) => {
    callbackRef.current = callback
    setVisible(true)
    setStage("in")
  }

  const onCoverDone = () => {
    callbackRef.current?.()
    callbackRef.current = null
    setStage("out")
  }

  const onRevealDone = () => {
    setVisible(false)
    setStage("idle")
  }

  return (
    <TransitionContext.Provider value={{ visible, stage, startTransition, onCoverDone, onRevealDone }}>
      {children}
    </TransitionContext.Provider>
  )
}

export function useTransitionState() {
  const ctx = useContext(TransitionContext)
  if (!ctx) throw new Error("useTransitionState must be used within TransitionProvider")
  return ctx
}