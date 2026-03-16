"use client"

import { createContext, useContext, useRef, useState, useCallback } from "react"

const TransitionContext = createContext(null)

export function TransitionProvider({ children }) {
  const [visible, setVisible] = useState(false)
  const [stage, setStage] = useState("idle")
  const callbackRef = useRef(null)
  const readyRef = useRef(false)
  const coveredRef = useRef(false)

  const startTransition = useCallback((callback) => {
    callbackRef.current = callback
    readyRef.current = false
    coveredRef.current = false
    setVisible(true)
    setStage("in")
  }, [])

  const onCoverDone = useCallback(() => {
    coveredRef.current = true
    callbackRef.current?.()
    callbackRef.current = null
    // If page already signalled ready, reveal immediately
    if (readyRef.current) {
      setStage("out")
      return
    }
    setStage("holding")
    // Safety net — never hold longer than 2s no matter what
    setTimeout(() => {
      if (coveredRef.current && !readyRef.current) {
        readyRef.current = true
        setStage("out")
      }
    }, 300)
  }, [])

  const signalReady = useCallback(() => {
    readyRef.current = true
    if (coveredRef.current) {
      setStage("out")
    }
  }, [])

  const onRevealDone = useCallback(() => {
    setVisible(false)
    setStage("idle")
    readyRef.current = false
    coveredRef.current = false
  }, [])

  return (
    <TransitionContext.Provider value={{ visible, stage, startTransition, onCoverDone, signalReady, onRevealDone }}>
      {children}
    </TransitionContext.Provider>
  )
}

export function useTransitionState() {
  const ctx = useContext(TransitionContext)
  if (!ctx) throw new Error("useTransitionState must be used within TransitionProvider")
  return ctx
}