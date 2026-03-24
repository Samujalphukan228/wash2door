"use client"

import { memo, useState, useRef, useCallback } from "react"
import { motion, AnimatePresence, useInView, useScroll, useTransform, useSpring } from "framer-motion"
import {
  ArrowUpRight, ArrowRight,
  Phone, Mail, MapPin, Clock,
  Instagram, Facebook, Plus,
} from "lucide-react"

// ══════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════
const PHONE_NUMBER    = "6900706456"
const WHATSAPP_NUMBER = "916900706456"

const CONTACT_METHODS = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    description: "Fastest way to reach us",
    href: `https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C%20I%20want%20to%20book%20a%20service`,
    available: "24/7",
    featured: true,
  },
  {
    id: "phone",
    icon: Phone,
    label: "Call Us",
    value: `+91 ${PHONE_NUMBER}`,
    description: "Speak directly with our team",
    href: `tel:${PHONE_NUMBER}`,
    available: "9AM – 5PM",
  },
  {
    id: "email",
    icon: Mail,
    label: "Email",
    value: "Wash2Door786602@gmail.com",
    description: "We reply within 24 hours",
    href: "mailto:Wash2Door786602@gmail.com",
    available: "24/7",
  },
]

const FAQS = [
  { question: "What areas do you serve?",              answer: "We currently serve all areas within Duliajan, Assam. We come to your home, office, or any location you prefer." },
  { question: "How do I book a service?",              answer: "You can book through our website, call us directly, or send a WhatsApp message. We'll confirm your slot within minutes." },
  { question: "What are your working hours?",          answer: "We're available Tuesday to Sunday, 9:00 AM to 5:00 PM. You can reach us on WhatsApp anytime." },
  { question: "Do I need to provide water or electricity?", answer: "We bring all our own equipment and supplies. Just show us where your car is parked and we handle the rest." },
  { question: "What services do you offer?",           answer: "We offer Car Wash, Sofa Cleaning, and Water Tank Cleaning — all delivered at your doorstep using eco-friendly products." },
]

const SOCIALS = [
  { icon: Facebook,  label: "Facebook",  href: "https://www.facebook.com/profile.php?id=61581835752285", handle: "@wash2door" },
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/wash2door.djn",                handle: "@wash2door.djn" },
]

const HERO_IMAGE = "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=1920&q=80"
const MAP_IMAGE  = "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&q=80"

const SERIF = 'Georgia, "Times New Roman", serif'
const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const EASE  = [0.16, 1, 0.3, 1]

// ══════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ══════════════════════════════════════════════════════════
const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.75, delay: i * 0.1, ease: EASE },
  }),
}
const fadeLeft = {
  hidden:  { opacity: 0, x: -44 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE } },
}
const fadeRight = {
  hidden:  { opacity: 0, x: 44 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE } },
}

// ══════════════════════════════════════════════════════════
// SHARED PRIMITIVES
// ══════════════════════════════════════════════════════════
const Eyebrow = memo(function Eyebrow({ children, light = false }) {
  return (
    <div className="flex items-center gap-4 mb-7">
      <span className={`block h-px w-10 ${light ? "bg-white/28" : "bg-black/25"}`} />
      <span
        className={`tracking-[0.38em] uppercase ${light ? "text-white/42" : "text-black/32"}`}
        style={{ fontSize: "9px", fontFamily: SANS, fontWeight: 500 }}
      >
        {children}
      </span>
    </div>
  )
})

const SectionHeading = memo(function SectionHeading({ children, light = false, className = "" }) {
  return (
    <h2
      className={`${light ? "text-white" : "text-black"} ${className}`}
      style={{
        fontFamily: SERIF,
        fontWeight: 300,
        fontSize: "clamp(1.9rem, 4.5vw, 3.2rem)",
        lineHeight: 1.1,
        letterSpacing: "-0.025em",
      }}
    >
      {children}
    </h2>
  )
})

const GridTexture = memo(function GridTexture() {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none"
      aria-hidden="true"
      style={{
        opacity: 0.022,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)
        `,
        backgroundSize: "72px 72px",
      }}
    />
  )
})

const Grain = memo(function Grain({ opacity = 0.032 }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none mix-blend-overlay"
      aria-hidden="true"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
    />
  )
})

const PulsingDot = memo(function PulsingDot({ color = "bg-emerald-400" }) {
  return (
    <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-70`} />
      <span className={`relative inline-flex rounded-full h-full w-full ${color}`} />
    </span>
  )
})

const WhatsAppIcon = memo(function WhatsAppIcon({ size = 20, className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
})

// ══════════════════════════════════════════════════════════
// SECTION 1 — HERO
// ══════════════════════════════════════════════════════════
const Hero = memo(function Hero() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] })
  const smooth    = useSpring(scrollYProgress, { stiffness: 40, damping: 20 })
  const bgY       = useTransform(smooth, [0, 1], ["0%", "16%"])
  const bgOpacity = useTransform(smooth, [0, 0.65], [1, 0.45])
  const contentY  = useTransform(smooth, [0, 1], ["0%", "10%"])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] bg-black overflow-hidden flex items-end"
      style={{ fontFamily: SANS }}
      aria-label="Hero"
    >
      {/* Parallax bg */}
      <motion.div className="absolute inset-0" style={{ y: bgY, opacity: bgOpacity }}>
        <img
          src={HERO_IMAGE} alt="" role="presentation"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.26) contrast(1.12) saturate(0.5)" }}
          loading="eager" fetchPriority="high"
        />
      </motion.div>

      {/* Overlays */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-x-0 bottom-0 h-[80%] bg-gradient-to-t from-black via-black/72 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-[60%] bg-gradient-to-r from-black/70 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
        <GridTexture />
        <Grain />
      </div>

      {/* Content */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 w-full max-w-7xl mx-auto
                   px-5 sm:px-8 md:px-12 lg:px-16
                   pb-14 md:pb-24 pt-28 md:pt-36"
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex items-center gap-4 mb-8"
        >
          <span className="w-10 h-px bg-white/28" />
          <span className="tracking-[0.38em] uppercase text-white/42" style={{ fontSize: "9px", fontFamily: SANS }}>
            Contact Us
          </span>
        </motion.div>

        {/* Headline — clip-slide per line */}
        <div className="mb-8">
          {["Let's Start a", "Conversation."].map((line, i) => (
            <div key={line} className="overflow-hidden">
              <motion.h1
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ delay: 0.15 + i * 0.14, duration: 1.0, ease: EASE }}
                className={`leading-[0.95] ${i === 1 ? "italic text-white/18" : "text-white"}`}
                style={{
                  fontFamily: SERIF,
                  fontWeight: 300,
                  fontSize: i === 1
                    ? "clamp(2rem, 5.5vw, 4.5rem)"
                    : "clamp(2.6rem, 7vw, 5.8rem)",
                  letterSpacing: "-0.025em",
                }}
              >
                {line}
              </motion.h1>
            </div>
          ))}
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48, duration: 0.7, ease: EASE }}
          className="text-white/40 max-w-md mb-10 leading-[1.78]"
          style={{ fontSize: "15px" }}
        >
          Have a question or want to book? We're here every day from 9AM to 5PM.
          Reach out through any channel that works for you.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.65, ease: EASE }}
          className="flex flex-wrap items-center gap-3 mb-10"
        >
          <a
            href={CONTACT_METHODS[0].href}
            target="_blank" rel="noopener noreferrer"
            className="group flex items-center justify-between gap-4 h-13 pl-6 pr-3
                       bg-white text-black rounded-full hover:bg-gray-100
                       active:scale-[0.97] transition-all duration-300"
          >
            <div className="flex items-center gap-2.5">
              <WhatsAppIcon size={16} />
              <span className="tracking-[0.16em] uppercase" style={{ fontSize: "10px", fontWeight: 600 }}>
                Message Us
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center
                            group-hover:scale-110 group-hover:rotate-[-6deg] transition-transform duration-400">
              <ArrowRight size={13} className="text-white" />
            </div>
          </a>

          <a
            href={`tel:${PHONE_NUMBER}`}
            className="group flex items-center gap-2.5 h-13 px-6
                       border border-white/15 text-white/60 rounded-full
                       hover:text-white/90 hover:border-white/28
                       active:scale-[0.97] transition-all duration-300"
          >
            <Phone size={14} strokeWidth={1.5} />
            <span className="tracking-[0.16em] uppercase" style={{ fontSize: "10px" }}>Call Now</span>
          </a>
        </motion.div>

        {/* Availability */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <PulsingDot />
          <span className="text-white/55" style={{ fontSize: "13px" }}>Available now</span>
          <span className="text-white/18">·</span>
          <span className="text-white/35" style={{ fontSize: "13px" }}>Tue – Sun, 9AM – 5PM</span>
        </motion.div>
      </motion.div>

      {/* Scroll line */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center" aria-hidden="true">
        <motion.div
          animate={{ scaleY: [0.4, 1, 0.4], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-14 bg-gradient-to-b from-white/40 to-transparent origin-top"
        />
      </div>
    </section>
  )
})

// ══════════════════════════════════════════════════════════
// SECTION 2 — CONTACT METHODS
// ══════════════════════════════════════════════════════════
const ContactMethods = memo(function ContactMethods() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <section ref={ref} className="w-full bg-white py-24 md:py-36 lg:py-44" style={{ fontFamily: SANS }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-start">

          {/* Left */}
          <motion.div variants={fadeLeft} initial="hidden" animate={inView ? "visible" : "hidden"}>
            <Eyebrow>Get In Touch</Eyebrow>
            <SectionHeading className="mb-7">
              Choose Your<br />
              <span className="text-black/18 italic">Preferred Channel</span>
            </SectionHeading>
            <p className="text-black/42 leading-[1.8] mb-12 max-w-sm" style={{ fontSize: "15px" }}>
              We're available on multiple platforms. WhatsApp is the fastest — we respond to all enquiries quickly.
            </p>

            <div className="flex gap-10 pt-8 border-t border-black/[0.07]">
              {[
                { value: "< 5 min", label: "Avg Response" },
                { value: "6 Days",  label: "Availability" },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-black leading-none mb-1.5"
                     style={{ fontFamily: SERIF, fontSize: "28px", fontWeight: 300, letterSpacing: "-0.02em" }}>
                    {stat.value}
                  </p>
                  <p className="text-black/28 tracking-[0.2em] uppercase" style={{ fontSize: "9px" }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact cards */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="space-y-3"
          >
            {CONTACT_METHODS.map((method, i) => {
              const Icon      = method.icon
              const isWA      = method.id === "whatsapp"
              const featured  = method.featured

              return (
                <motion.a
                  key={method.id}
                  custom={i}
                  variants={fadeUp}
                  whileTap={{ scale: 0.98 }}
                  href={method.href}
                  target={method.href.startsWith("http") ? "_blank" : undefined}
                  rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={`group flex items-center gap-5 p-5 rounded-2xl border
                              transition-all duration-400 no-underline
                              ${featured
                                ? "bg-black border-black hover:bg-black/85"
                                : "bg-white border-black/[0.08] hover:border-black hover:shadow-xl hover:shadow-black/[0.05]"
                              }`}
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                                   transition-colors duration-400
                                   ${featured
                                     ? "bg-white/10 group-hover:bg-white/18"
                                     : "bg-black/[0.03] group-hover:bg-black"
                                   }`}>
                    {isWA
                      ? <WhatsAppIcon size={20} className={featured ? "text-white" : "text-black/40 group-hover:text-white transition-colors duration-400"} />
                      : <Icon size={18} strokeWidth={1.4}
                          className={`transition-colors duration-400 ${featured ? "text-white" : "text-black/40 group-hover:text-white"}`} />
                    }
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-0.5">
                      <p
                        className={featured ? "text-white" : "text-black"}
                        style={{ fontFamily: SERIF, fontSize: "16px", fontWeight: 400 }}
                      >
                        {method.label}
                      </p>
                      {featured && (
                        <span className="px-2 py-0.5 bg-white/15 rounded-full text-white/60
                                         tracking-[0.14em] uppercase"
                              style={{ fontSize: "7px" }}>
                          Fastest
                        </span>
                      )}
                    </div>
                    <p className={`truncate ${featured ? "text-white/42" : "text-black/35"}`}
                       style={{ fontSize: "12px" }}>
                      {method.value ?? method.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0
                                   transition-colors duration-400
                                   ${featured
                                     ? "bg-white/10 group-hover:bg-white/20"
                                     : "bg-black/[0.04] group-hover:bg-black"
                                   }`}>
                    <ArrowUpRight size={13}
                      className={`transition-all duration-300
                                  group-hover:translate-x-0.5 group-hover:-translate-y-0.5
                                  ${featured ? "text-white" : "text-black/38 group-hover:text-white"}`} />
                  </div>
                </motion.a>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
})

// ══════════════════════════════════════════════════════════
// SECTION 3 — FAQ
// ══════════════════════════════════════════════════════════
const FAQItem = memo(function FAQItem({ faq, isOpen, onToggle, index }) {
  return (
    <div className="border-b border-black/[0.07] last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-6 text-left group"
        aria-expanded={isOpen}
      >
        <span
          className="text-black pr-6 group-hover:text-black/55 transition-colors duration-300 leading-snug"
          style={{ fontFamily: SERIF, fontSize: "16px", fontWeight: 400 }}
        >
          {faq.question}
        </span>

        <motion.div
          animate={{ backgroundColor: isOpen ? "#000" : "rgba(0,0,0,0.04)" }}
          transition={{ duration: 0.22 }}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        >
          <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.28, ease: EASE }}>
            <Plus size={14} className={isOpen ? "text-white" : "text-black/40"} strokeWidth={2} />
          </motion.div>
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <p className="pb-6 text-black/42 leading-[1.78] pr-12" style={{ fontSize: "14px" }}>
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

const FAQ = memo(function FAQ() {
  const ref       = useRef(null)
  const inView    = useInView(ref, { once: true, margin: "-60px" })
  const [open, setOpen] = useState(0)
  const toggle    = useCallback((i) => setOpen(p => p === i ? -1 : i), [])

  return (
    <section ref={ref} className="w-full bg-[#f7f7f5] py-24 md:py-32" style={{ fontFamily: SANS }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-14 lg:gap-20">

          {/* Left */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="lg:col-span-2"
          >
            <Eyebrow>FAQ</Eyebrow>
            <SectionHeading className="mb-7">
              Common<br /><span className="text-black/18 italic">Questions</span>
            </SectionHeading>
            <p className="text-black/40 leading-[1.78] mb-8 max-w-xs" style={{ fontSize: "14px" }}>
              Quick answers about our services in Duliajan.
              Can't find what you need?
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C%20I%20have%20a%20question`}
              target="_blank" rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 text-black no-underline"
            >
              <span
                className="tracking-[0.16em] uppercase border-b border-black/25 pb-0.5
                           group-hover:border-black transition-colors duration-300"
                style={{ fontSize: "10px", fontWeight: 500 }}
              >
                Ask Us on WhatsApp
              </span>
              <ArrowUpRight size={12}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </a>
          </motion.div>

          {/* FAQ list */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="lg:col-span-3 bg-white rounded-2xl px-6 sm:px-8 py-2"
          >
            {FAQS.map((faq, i) => (
              <FAQItem key={i} faq={faq} index={i} isOpen={open === i} onToggle={() => toggle(i)} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
})

// ══════════════════════════════════════════════════════════
// SECTION 4 — LOCATION
// ══════════════════════════════════════════════════════════
const Location = memo(function Location() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  const details = [
    { icon: MapPin, label: "Address",       value: "Near Sonapur Namghar, Duliajan, Assam" },
    { icon: Phone,  label: "Phone",         value: "+91 6900706456" },
    { icon: Mail,   label: "Email",         value: "Wash2Door786602@gmail.com" },
    { icon: Clock,  label: "Working Hours", value: "Tue – Sun, 9:00 AM – 5:00 PM" },
  ]

  return (
    <section ref={ref} className="w-full bg-white py-24 md:py-36 lg:py-44" style={{ fontFamily: SANS }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-center">

          {/* Map */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 order-2 lg:order-1"
          >
            <img
              src={MAP_IMAGE} alt="Duliajan service area"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: "brightness(0.75) saturate(0.4) contrast(1.1)" }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/25" />

            {/* Pin */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <motion.span
                  animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 bg-white rounded-full"
                />
                <div className="relative w-13 h-13 bg-black rounded-full flex items-center justify-center shadow-2xl ring-1 ring-white/20">
                  <MapPin size={20} className="text-white" />
                </div>
              </div>
            </div>

            {/* Open maps btn */}
            <a
              href="https://maps.google.com/?q=Sonapur+Namghar+Duliajan+Assam"
              target="_blank" rel="noopener noreferrer"
              className="absolute bottom-5 left-5 right-5 flex items-center justify-between
                         h-12 px-5 bg-white text-black rounded-xl
                         hover:bg-gray-50 active:scale-[0.98] transition-all duration-300 shadow-xl"
            >
              <span className="tracking-[0.14em] uppercase" style={{ fontSize: "10px", fontWeight: 600 }}>
                Open in Google Maps
              </span>
              <ArrowUpRight size={13} />
            </a>
          </motion.div>

          {/* Details */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="order-1 lg:order-2"
          >
            <Eyebrow>Location</Eyebrow>
            <SectionHeading className="mb-7">
              Based in<br /><span className="text-black/18 italic">Duliajan</span>
            </SectionHeading>
            <p className="text-black/42 leading-[1.8] mb-10 max-w-sm" style={{ fontSize: "15px" }}>
              We're located near Sonapur Namghar in Duliajan, Assam.
              But remember — <span className="text-black font-medium">we come to you.</span> Just share your location and we'll be there.
            </p>

            <div className="space-y-2.5 mb-8">
              {details.map(({ icon: Icon, label, value }, i) => (
                <motion.div
                  key={label}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  className="group flex items-start gap-4 p-4 rounded-xl bg-black/[0.02]
                             hover:bg-black/[0.04] transition-colors duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={14} className="text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-black/28 tracking-[0.2em] uppercase mb-1" style={{ fontSize: "9px" }}>
                      {label}
                    </p>
                    <p className="text-black leading-snug" style={{ fontFamily: SERIF, fontSize: "14px" }}>
                      {value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center shrink-0">
                <span className="text-white" style={{ fontSize: "8px" }}>✓</span>
              </div>
              <span className="text-black/40" style={{ fontSize: "13px" }}>
                Doorstep service across all of Duliajan
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
})

// ══════════════════════════════════════════════════════════
// SECTION 5 — BOTTOM CTA
// ══════════════════════════════════════════════════════════
const BottomCTA = memo(function BottomCTA() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <section
      ref={ref}
      className="w-full bg-black py-24 md:py-32 relative overflow-hidden"
      style={{ fontFamily: SANS }}
    >
      <GridTexture />
      <Grain />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16 relative z-10">

        {/* Main CTA block */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mb-20"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
            <div>
              <Eyebrow light>Ready to get started?</Eyebrow>
              <SectionHeading light className="max-w-lg">
                Book Your First Service{" "}
                <span className="italic text-white/18">Today</span>
              </SectionHeading>
            </div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="flex flex-wrap gap-3 lg:pb-1"
            >
              <a
                href="/bookings"
                className="group flex items-center justify-between gap-4 h-13 pl-7 pr-3
                           bg-white text-black rounded-full hover:bg-gray-100
                           active:scale-[0.97] transition-all duration-300"
              >
                <span className="tracking-[0.16em] uppercase" style={{ fontSize: "10px", fontWeight: 600 }}>
                  Book Now
                </span>
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center
                                group-hover:scale-110 group-hover:rotate-[-6deg] transition-transform duration-400">
                  <ArrowRight size={13} className="text-white" />
                </div>
              </a>

              <a
                href="/services"
                className="group flex items-center gap-3 h-13 px-7
                           border border-white/12 text-white/50 rounded-full
                           hover:text-white/80 hover:border-white/25
                           active:scale-[0.97] transition-all duration-300"
              >
                <span className="tracking-[0.16em] uppercase" style={{ fontSize: "10px" }}>View Services</span>
              </a>
            </motion.div>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="w-full h-px bg-white/[0.07] mb-12" />

        {/* Bottom strip — socials + credit */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
        >
          <div>
            <p className="text-white mb-1" style={{ fontFamily: SERIF, fontSize: "16px", fontWeight: 300 }}>
              Follow Our Journey
            </p>
            <p className="text-white/30" style={{ fontSize: "12px" }}>Stay updated with our latest work</p>
          </div>

          <div className="flex items-center gap-3">
            {SOCIALS.map(({ icon: Icon, label, href, handle }) => (
              <a
                key={label}
                href={href}
                target="_blank" rel="noopener noreferrer"
                aria-label={label}
                className="group flex items-center gap-2.5 px-4 py-2.5
                           border border-white/[0.09] rounded-xl
                           hover:bg-white/[0.06] hover:border-white/20
                           transition-all duration-300"
              >
                <Icon size={15} strokeWidth={1.5} className="text-white/45 group-hover:text-white/70 transition-colors duration-300" />
                <span className="text-white/45 group-hover:text-white/70 hidden sm:block transition-colors duration-300"
                      style={{ fontSize: "11px" }}>
                  {handle}
                </span>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
})

// ══════════════════════════════════════════════════════════
// FOOTER STRIP
// ══════════════════════════════════════════════════════════
const FooterStrip = memo(function FooterStrip() {
  return (
    <footer
      className="w-full bg-black border-t border-white/[0.05] py-6"
      style={{ fontFamily: SANS }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16
                      flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-white/18 tracking-[0.15em] uppercase" style={{ fontSize: "9px" }}>
          © {new Date().getFullYear()} Wash2Door · Duliajan, Assam
        </p>
        <p className="text-white/18 tracking-[0.15em] uppercase" style={{ fontSize: "9px" }}>
          Designed &amp; Developed by{" "}
          <span className="text-white/42 font-medium">Nexxupp</span>
        </p>
      </div>
    </footer>
  )
})

// ══════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════
export default function ContactPage() {
  return (
    <main className="overflow-x-hidden">
      <Hero />
      <ContactMethods />
      <FAQ />
      <Location />
      <BottomCTA />
      <FooterStrip />
    </main>
  )
}