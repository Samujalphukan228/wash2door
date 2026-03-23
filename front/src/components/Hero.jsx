'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Phone } from 'lucide-react'

const WHATSAPP = 'https://wa.me/916900706456?text=Hi%2C%20I%27d%20like%20to%20book%20a%20car%20wash'
const BG_IMAGE = 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2000&auto=format&fit=crop'

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section ref={ref} className="relative min-h-[100svh] w-full overflow-hidden bg-[#0a0a0a]">
      {/* Background */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <img
          src={BG_IMAGE}
          alt=""
          className="h-full w-full object-cover"
          style={{ filter: 'brightness(0.35) contrast(1.1)' }}
        />
      </motion.div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 to-transparent" />

      {/* Content */}
      <motion.div 
        className="relative z-10 min-h-[100svh] flex flex-col px-5 sm:px-8 md:px-12 lg:px-20"
        style={{ opacity }}
      >
        {/* Nav */}
        <nav className="flex items-center justify-between py-5 sm:py-6 lg:py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <p className="text-[12px] sm:text-[13px] font-medium tracking-[0.2em] sm:tracking-[0.25em] text-white/80 uppercase">
              Wash2Door
            </p>
            <p className="text-[10px] sm:text-[11px] tracking-[0.12em] sm:tracking-[0.15em] text-white/30 mt-0.5">
              Duliajan, Assam
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex items-center gap-2"
          >
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-full w-full rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] sm:text-[11px] tracking-[0.12em] sm:tracking-[0.15em] text-white/50 uppercase">
              Open
            </span>
          </motion.div>
        </nav>

        {/* Main */}
        <div className="flex-1 flex flex-col justify-end pb-6 sm:pb-8 lg:justify-center lg:pb-0 lg:-mt-10">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[10px] sm:text-[11px] md:text-[12px] tracking-[0.3em] sm:tracking-[0.4em] text-white/40 uppercase mb-4 sm:mb-6 md:mb-8"
          >
            Premium Doorstep Detailing
          </motion.p>

          {/* Headline */}
          <div className="mb-6 sm:mb-8 md:mb-12">
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-[15vw] sm:text-[12vw] md:text-[10vw] lg:text-[8vw] xl:text-[7vw] font-extralight text-white leading-[0.9] tracking-[-0.02em]"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                The <em className="font-normal">SHINE</em>
              </motion.h1>
            </div>
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-[15vw] sm:text-[12vw] md:text-[10vw] lg:text-[8vw] xl:text-[7vw] font-extralight text-white/15 leading-[0.9] tracking-[-0.02em]"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                that finds you
              </motion.h1>
            </div>
          </div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="text-[13px] sm:text-[14px] md:text-[15px] text-white/35 leading-[1.6] max-w-[380px] mb-8 sm:mb-10 md:mb-12"
          >
            We bring professional car care to your doorstep. 
            Book in under two minutes.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-col gap-3 sm:flex-row sm:gap-4"
          >
            {/* Primary Button */}
            <a
              href="/bookings"
              className="group relative inline-flex items-center justify-between bg-white pl-6 pr-2 sm:pl-8 sm:pr-3 py-3 sm:py-4 rounded-full overflow-hidden transition-transform duration-300 active:scale-[0.97] sm:hover:scale-[1.02]"
            >
              <span className="absolute inset-0 bg-black/[0.03] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              <span className="relative text-[12px] sm:text-[13px] font-semibold tracking-[0.08em] sm:tracking-[0.1em] text-black uppercase">
                Book Now
              </span>
              <span className="relative ml-4 sm:ml-6 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black flex items-center justify-center group-hover:rotate-[-45deg] transition-transform duration-500">
                <ArrowRight size={15} className="text-white sm:w-4 sm:h-4" strokeWidth={2} />
              </span>
            </a>

            {/* Secondary Button */}
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full border border-white/15 bg-white/[0.03] backdrop-blur-sm transition-all duration-300 active:bg-white/[0.08] sm:hover:bg-white/[0.08] sm:hover:border-white/25"
            >
              <Phone size={15} className="text-white/60 group-hover:text-white/90 transition-colors duration-300 sm:w-4 sm:h-4" strokeWidth={1.5} />
              <span className="text-[12px] sm:text-[13px] font-medium tracking-[0.08em] sm:tracking-[0.1em] text-white/60 group-hover:text-white/90 uppercase transition-colors duration-300">
                WhatsApp
              </span>
            </a>
          </motion.div>

          {/* Stats - Mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.4 }}
            className="mt-10 pt-6 border-t border-white/[0.08] sm:mt-12 lg:mt-16 lg:pt-8"
          >
            <div className="flex items-center justify-between sm:justify-start sm:gap-12 md:gap-16 lg:gap-20">
              {[
                { value: '500+', label: 'Clients' },
                { value: '4.9', label: 'Rating' },
                { value: '2min', label: 'To Book' },
              ].map((stat, i) => (
                <div key={i} className="text-center sm:text-left">
                  <p 
                    className="text-[22px] sm:text-[26px] md:text-[30px] lg:text-[34px] font-light text-white tracking-tight"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.15em] sm:tracking-[0.2em] text-white/25 uppercase mt-0.5 sm:mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}