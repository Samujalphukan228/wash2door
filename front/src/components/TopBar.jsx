// components/TopBar.jsx
"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"
import { Phone } from "lucide-react"

const ITEMS = [
  { label: "Free Doorstep Service" },
  { label: "Duliajan, Assam" },
  { label: "Call 6900706456", href: "tel:6900706456", isPhone: true },
  { label: "Open 9AM – 5PM" },
  { label: "Eco-Friendly Products" },
  { label: "Same Day Available" },
]

function MarqueeItem({ item }) {
  return (
    <span className="inline-flex items-center mx-5 sm:mx-8 shrink-0">
      {item.isPhone ? (
        <a href={item.href} className="group inline-flex items-center gap-1.5 no-underline">
          <Phone size={9} strokeWidth={2} className="text-white/40 group-hover:text-white/80 transition-colors duration-300" />
          <span className="tracking-[0.2em] uppercase text-white/60 group-hover:text-white transition-colors duration-300 border-b border-transparent group-hover:border-white/30" style={{ fontSize: "10px" }}>
            {item.label}
          </span>
        </a>
      ) : (
        <span className="tracking-[0.2em] uppercase text-white/40" style={{ fontSize: "10px" }}>
          {item.label}
        </span>
      )}
      <span className="ml-5 sm:ml-8 w-1 h-1 rounded-full bg-white/15 shrink-0" aria-hidden="true" />
    </span>
  )
}

export default function TopBar() {
  const [mounted, setMounted] = useState(false)
  const prefersReduced = useReducedMotion()

  useEffect(() => { setMounted(true) }, [])

  const marqueeContent = (
    <>
      {[0, 1].map((copy) => (
        <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
          {ITEMS.map((item, i) => (
            <MarqueeItem key={`${copy}-${i}`} item={item} />
          ))}
        </div>
      ))}
    </>
  )

  return (
    <motion.div
      className="bg-black overflow-hidden h-9 sm:h-10 flex items-center relative"
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      role="marquee"
      aria-label="Site announcements"
    >
      <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-14 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" aria-hidden="true" />
      <div className="absolute right-0 top-0 bottom-0 w-10 sm:w-14 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" aria-hidden="true" />

      <div className={prefersReduced || !mounted ? "flex" : "flex topbar-marquee"}>
        {marqueeContent}
      </div>

      <style>{`
        .topbar-marquee { animation: topbar-scroll 32s linear infinite; }
        .topbar-marquee:hover { animation-play-state: paused; }
        @keyframes topbar-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </motion.div>
  )
}