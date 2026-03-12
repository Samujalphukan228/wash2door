"use client"

import { motion } from 'framer-motion'
import { ArrowUpRight, CalendarCheck, Car, MapPin, Sparkles } from 'lucide-react'

const STEPS = [
  {
    icon: Car,
    number: '01',
    title: 'Choose Service',
    description: 'Select from our range of professional cleaning services tailored to your needs.',
  },
  {
    icon: MapPin,
    number: '02',
    title: 'Enter Location',
    description: 'Tell us where you are. We come to your doorstep — home, office, or anywhere.',
  },
  {
    icon: CalendarCheck,
    number: '03',
    title: 'Pick Date & Time',
    description: 'Choose a slot that works for you. We offer flexible scheduling 7 days a week.',
  },
  {
    icon: Sparkles,
    number: '04',
    title: 'We Handle the Rest',
    description: 'Sit back and relax. Our experts arrive on time and deliver a spotless finish.',
  },
]

function StepCard({ step, index }) {
  const Icon = step.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className="group flex flex-col border border-gray-200 p-6 md:p-7 bg-white
                 hover:border-black transition-all duration-500 rounded-[5px]
                 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
    >
      {/* Top row: Icon + Number */}
      <div className="flex items-start justify-between mb-6">
        <div className="w-14 h-14 border border-gray-200 rounded-full flex items-center justify-center
                        group-hover:border-black transition-colors duration-500 shrink-0">
          <Icon 
            size={20} 
            strokeWidth={1.2} 
            className="text-gray-400 group-hover:text-black transition-colors duration-500" 
          />
        </div>
        <span
          className="text-gray-300 group-hover:text-black transition-colors duration-500"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(9px, 1vw, 12px)',
            letterSpacing: '0.1em',
          }}
        >
          {step.number}
        </span>
      </div>

      {/* Title */}
      <h3
        className="text-black mb-3 group-hover:opacity-70 transition-opacity duration-300"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontWeight: 300,
          fontSize: 'clamp(13px, 1.4vw, 16px)',
          letterSpacing: '-0.01em',
        }}
      >
        {step.title}
      </h3>

      {/* Description */}
      <p
        className="tracking-[0.18em] leading-[1.9] uppercase text-gray-400"
        style={{ fontSize: 'clamp(8px, 0.9vw, 11px)' }}
      >
        {step.description}
      </p>
    </motion.div>
  )
}

export default function HowItWorks() {
  return (
    <section
      className="w-full bg-white py-24 md:py-32"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-8 md:px-16">

        {/* ── Heading ── */}
        <div className="mb-16 md:mb-20">
          {/* Eyebrow */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="block w-6 h-px bg-black shrink-0" />
            <span
              className="tracking-[0.4em] uppercase text-gray-400"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 'clamp(7px, 0.8vw, 9px)',
              }}
            >
              Simple Process
            </span>
          </motion.div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="flex-1">
              {/* Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-black mb-5"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 300,
                  fontSize: 'clamp(2rem, 4vw, 3.8rem)',
                  lineHeight: 1.08,
                  letterSpacing: '-0.01em',
                }}
              >
                How It Works
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="tracking-[0.18em] leading-[1.9] uppercase text-gray-400 max-w-md"
                style={{ fontSize: 'clamp(8px, 0.9vw, 11px)' }}
              >
                Book a professional car wash in under 2 minutes — we handle everything else.
              </motion.p>
            </div>

            <a
              href="/Bookings"
              className="hidden md:flex items-center gap-3 tracking-[0.28em] uppercase
                         text-gray-400 no-underline hover:text-black transition-colors duration-300 group mb-2"
              style={{ fontSize: 'clamp(7px, 0.8vw, 9px)' }}
            >
              Get Started
              <span className="block h-px bg-gray-300 w-5 group-hover:w-10 group-hover:bg-black transition-all duration-300" />
            </a>
          </div>

          {/* Divider line */}
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full h-px bg-gray-200 mt-8 origin-left" 
          />
        </div>

        {/* ── Steps Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {STEPS.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} />
          ))}
        </div>

        {/* ── Mobile CTA ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 flex md:hidden justify-center"
        >
          <a
            href="/Bookings"
            className="relative flex items-center gap-3 tracking-[0.22em] uppercase
                       text-black border border-black px-7 py-3.5 no-underline
                       overflow-hidden group rounded-[5px]"
            style={{ fontSize: 'clamp(8px, 2.4vw, 10px)' }}
          >
            <span className="absolute inset-0 bg-black origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
            <span className="relative z-10 group-hover:text-white transition-colors duration-500">
              Book Now
            </span>
            <ArrowUpRight 
              size={13} 
              strokeWidth={1.5} 
              className="relative z-10 group-hover:text-white transition-colors duration-500" 
            />
          </a>
        </motion.div>

      </div>
    </section>
  )
}