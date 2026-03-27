// components/TopBar.jsx
"use client"

import { memo, useEffect, useState } from "react"
import { Phone } from "lucide-react"

const ITEMS = [
  { label: "Free Doorstep Service" },
  { label: "Duliajan, Assam" },
  { label: "Call 6900706456", href: "tel:6900706456", isPhone: true },
  { label: "Open 9AM – 5PM" },
  { label: "Eco-Friendly Products" },
  { label: "Same Day Available" },
]

// Memoized item to prevent re-renders
const MarqueeItem = memo(function MarqueeItem({ item }) {
  if (item.isPhone) {
    return (
      <span className="inline-flex items-center shrink-0 px-5 sm:px-8">
        <a 
          href={item.href} 
          className="group inline-flex items-center gap-1.5"
        >
          <Phone 
            size={9} 
            strokeWidth={2} 
            className="text-white/40 group-hover:text-white/80 transition-colors duration-200" 
          />
          <span 
            className="tracking-[0.2em] uppercase text-white/60 group-hover:text-white transition-colors duration-200"
            style={{ fontSize: "10px" }}
          >
            {item.label}
          </span>
        </a>
        <span 
          className="ml-5 sm:ml-8 w-1 h-1 rounded-full bg-white/15 shrink-0" 
          aria-hidden="true" 
        />
      </span>
    )
  }

  return (
    <span className="inline-flex items-center shrink-0 px-5 sm:px-8">
      <span 
        className="tracking-[0.2em] uppercase text-white/40" 
        style={{ fontSize: "10px" }}
      >
        {item.label}
      </span>
      <span 
        className="ml-5 sm:ml-8 w-1 h-1 rounded-full bg-white/15 shrink-0" 
        aria-hidden="true" 
      />
    </span>
  )
})

// Pre-render marquee content (static, never changes)
const MarqueeContent = memo(function MarqueeContent() {
  return (
    <>
      {ITEMS.map((item, i) => (
        <MarqueeItem key={i} item={item} />
      ))}
    </>
  )
})

export default function TopBar() {
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setShouldAnimate(!mediaQuery.matches)

    const handler = (e) => setShouldAnimate(!e.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  return (
    <div
      className="bg-black overflow-hidden h-9 sm:h-10 flex items-center relative contain-layout"
      role="marquee"
      aria-label="Site announcements"
    >
      {/* Edge fades */}
      <div 
        className="absolute left-0 inset-y-0 w-10 sm:w-14 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute right-0 inset-y-0 w-10 sm:w-14 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Marquee track */}
      <div 
        className={`flex items-center ${shouldAnimate ? "marquee-animate" : ""}`}
        style={{
          willChange: shouldAnimate ? "transform" : "auto",
        }}
      >
        {/* Triple the content for seamless loop */}
        <div className="flex shrink-0 items-center" aria-hidden="false">
          <MarqueeContent />
        </div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          <MarqueeContent />
        </div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          <MarqueeContent />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .marquee-animate {
          animation: marquee-scroll 30s linear infinite;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          perspective: 1000px;
          -webkit-perspective: 1000px;
        }
        
        .marquee-animate:hover {
          animation-play-state: paused;
        }
        
        @keyframes marquee-scroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-33.333%, 0, 0);
          }
        }
        
        .contain-layout {
          contain: layout style paint;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .marquee-animate {
            animation: none;
          }
        }
      `}} />
    </div>
  )
}