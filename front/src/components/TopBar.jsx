// components/TopBar.jsx (Recommended - Cleanest)
"use client"

import { motion } from "framer-motion"

export default function TopBar() {
  const items = [
    "Free Doorstep Service",
    "Duliajan, Assam", 
    "Call 6900706456",
    "Open 9AM – 5PM",
    "Eco-Friendly Products",
    "Same Day Available",
  ]

  return (
    <motion.div
      className="bg-black overflow-hidden h-10 flex items-center relative group"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Fade edges for premium look */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />

      {/* Marquee wrapper */}
      <div className="flex marquee-container">
        {/* First set */}
        <motion.div
          className="flex shrink-0 items-center marquee-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {items.map((item, i) => (
            <MarqueeItem key={`a-${i}`} item={item} />
          ))}
        </motion.div>

        {/* Duplicate for seamless loop */}
        <motion.div
          className="flex shrink-0 items-center marquee-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {items.map((item, i) => (
            <MarqueeItem key={`b-${i}`} item={item} />
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        .marquee-container {
          animation: scroll 30s linear infinite;
        }
        
        .marquee-container:hover {
          animation-play-state: paused;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </motion.div>
  )
}

function MarqueeItem({ item }) {
  const isPhone = item === "Call 6900706456"

  return (
    <span className="inline-flex items-center mx-5 sm:mx-7">
      {isPhone ? (
        <motion.a
          href="tel:6900706456"
          className="tracking-[0.2em] uppercase text-white/90 no-underline
                     relative overflow-hidden"
          style={{ fontSize: "10px" }}
          whileHover={{ color: "#fff" }}
        >
          <span className="relative z-10">{item}</span>
          <motion.span
            className="absolute bottom-0 left-0 h-px bg-white/50 w-full"
            initial={{ scaleX: 1 }}
            whileHover={{ scaleX: 0, originX: 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.a>
      ) : (
        <span
          className="tracking-[0.2em] uppercase text-white/50"
          style={{ fontSize: "10px" }}
        >
          {item}
        </span>
      )}

      {/* Animated separator dot */}
      <motion.span
        className="ml-5 sm:ml-7 w-1.5 h-1.5 rounded-full bg-white/20"
        whileHover={{ 
          scale: 1.5, 
          backgroundColor: "rgba(255,255,255,0.5)",
        }}
        transition={{ duration: 0.2 }}
      />
    </span>
  )
}