"use client"

import { useRouter } from "next/navigation"
import { useTransitionState } from "@/context/TransitionContext"

export function useNavigate() {
  const router = useRouter()
  const { startTransition } = useTransitionState()

  return (href) => {
    startTransition(() => {
      router.push(href)
    })
  }
}