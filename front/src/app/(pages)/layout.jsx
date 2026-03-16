"use client"

import { usePageReady } from "@/hooks/usePageReady"

export default function PagesLayout({ children }) {
  usePageReady()
  return <>{children}</>
}