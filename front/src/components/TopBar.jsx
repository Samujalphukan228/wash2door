"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"

export default function TopBar() {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    gsap.fromTo(
      containerRef.current,
      {
        opacity: 0,
        y: -20,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      }
    )
  }, [])

  return (
    <div
      ref={containerRef}
      className="bg-black text-white text-center py-2 text-xs tracking-[0.18em] uppercase"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      Doorstep Car Care &nbsp;·&nbsp; Duliajan, Assam &nbsp;·&nbsp;
      <a
        href="tel:6900706456"
        className="underline underline-offset-2 ml-1 hover:opacity-60 transition-opacity duration-300 text-white"
      >
        6900706456
      </a>
    </div>
  )
}