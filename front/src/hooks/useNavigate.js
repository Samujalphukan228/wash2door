"use client"

import { useRouter } from "next/navigation"

export function useNavigate() {
  const router = useRouter()
  return (href) => router.push(href)
}