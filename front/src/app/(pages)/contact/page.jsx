"use client"

import { memo, useState, useRef, useCallback } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import {
  ArrowUpRight,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  Sparkles,
  Plus,
} from "lucide-react"

// ── Constants ──────────────────────────────────────────────
const PHONE_NUMBER = "6900706456"
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
  {
    question: "What areas do you serve?",
    answer: "We currently serve all areas within Duliajan, Assam. We come to your home, office, or any location you prefer.",
  },
  {
    question: "How do I book a service?",
    answer: "You can book through our website, call us directly, or send a WhatsApp message. We'll confirm your slot within minutes.",
  },
  {
    question: "What are your working hours?",
    answer: "We're available Monday to Sunday, 9:00 AM to 5:00 PM. You can reach us on WhatsApp anytime.",
  },
  {
    question: "Do I need to provide water or electricity?",
    answer: "We bring all our own equipment and supplies. Just show us where your car is parked and we handle the rest.",
  },
]

const SOCIALS = [
  {
    icon: Facebook,
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61581835752285",
    handle: "@wash2door",
  },
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://www.instagram.com/wash2door.djn",
    handle: "@wash2door.djn",
  },
]

const HERO_IMAGE = "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=1920&q=80"
const MAP_IMAGE = "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&q=80"

// ── Typography Tokens ─────────────────────────────────────
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const SERIF = 'Georgia, "Times New Roman", serif'

// ── Animation Variants ─────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
}

const fadeLeft = {
  hidden: { opacity: 0, x: -36 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
}

const fadeRight = {
  hidden: { opacity: 0, x: 36 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
}

// ── Reusable UI Components ─────────────────────────────────
const Eyebrow = memo(function Eyebrow({ children, light = false }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className={`w-8 h-px ${light ? "bg-white/30" : "bg-black"}`} />
      <span
        className={`tracking-[0.35em] uppercase ${light ? "text-white/50" : "text-gray-400"}`}
        style={{ fontSize: "10px", fontFamily: SANS }}
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
        fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
        lineHeight: 1.15,
        letterSpacing: "-0.02em",
      }}
    >
      {children}
    </h2>
  )
})

// ── WhatsApp Icon ──────────────────────────────────────────
const WhatsAppIcon = memo(function WhatsAppIcon({ className = "", size = 24 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
})

// ── Hero ───────────────────────────────────────────────────
const Hero = memo(function Hero() {
  return (
    <section
      className="relative min-h-[80dvh] md:min-h-[85vh] bg-black overflow-hidden flex items-end"
      style={{ fontFamily: SANS }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt=""
          role="presentation"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 md:px-12 pb-14 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="w-10 h-px bg-white/30" />
          <span className="tracking-[0.35em] uppercase text-white/50" style={{ fontSize: "11px" }}>
            Contact Us
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-white mb-5"
          style={{
            fontFamily: SERIF,
            fontWeight: 300,
            fontSize: "clamp(2.4rem, 6vw, 5rem)",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            maxWidth: "600px",
          }}
        >
          Let's Start a{" "}
          <span className="italic text-white/50">Conversation</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-white/40 max-w-md mb-9 leading-relaxed"
          style={{ fontSize: "15px" }}
        >
          Have a question? Want to book a service? We're here to help. Reach out
          through any channel that works for you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center gap-3 mb-9"
        >
          <motion.a
            whileTap={{ scale: 0.96 }}
            href={CONTACT_METHODS[0].href}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 h-12 sm:h-14 px-5 sm:px-8 bg-white text-black rounded-full hover:bg-gray-100 transition-colors duration-300"
          >
            <WhatsAppIcon size={17} />
            <span className="tracking-wider uppercase" style={{ fontSize: "11px", fontWeight: 500 }}>
              Message Us
            </span>
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </motion.a>

          <motion.a
            whileTap={{ scale: 0.96 }}
            href={`tel:${PHONE_NUMBER}`}
            className="group inline-flex items-center gap-2.5 h-12 sm:h-14 px-5 sm:px-8 border border-white/20 text-white rounded-full hover:bg-white/5 transition-colors duration-300"
          >
            <Phone size={15} strokeWidth={1.5} />
            <span className="tracking-wider uppercase" style={{ fontSize: "11px" }}>
              Call Now
            </span>
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center gap-4"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <span className="text-white/60" style={{ fontSize: "13px" }}>Available now</span>
          </div>
          <span className="text-white/20">·</span>
          <span className="text-white/40" style={{ fontSize: "13px" }}>Responds in minutes</span>
        </motion.div>
      </div>
    </section>
  )
})

// ── Contact Methods ────────────────────────────────────────
const ContactMethods = memo(function ContactMethods() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <section ref={ref} className="w-full bg-white py-16 md:py-24 lg:py-32" style={{ fontFamily: SANS }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left Column */}
          <motion.div variants={fadeLeft} initial="hidden" animate={inView ? "visible" : "hidden"}>
            <Eyebrow>Get In Touch</Eyebrow>
            <SectionHeading className="mb-5">
              Choose Your <span className="text-gray-300">Preferred Channel</span>
            </SectionHeading>
            <p className="text-gray-500 leading-relaxed mb-8 max-w-sm" style={{ fontSize: "15px" }}>
              We're available on multiple platforms. Pick whatever works best — we respond quickly on all channels.
            </p>

            <div className="flex gap-8 pt-6 border-t border-gray-100">
              {[
                { value: "< 5 min", label: "Avg Response" },
                { value: "7 Days", label: "Availability" },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-black mb-1" style={{ fontFamily: SERIF, fontSize: "24px", fontWeight: 300 }}>
                    {stat.value}
                  </p>
                  <p className="text-gray-400 tracking-wider uppercase" style={{ fontSize: "9px" }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Cards */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="space-y-3"
          >
            {CONTACT_METHODS.map((method, i) => {
              const Icon = method.icon
              const isWhatsApp = method.id === "whatsapp"

              return (
                <motion.a
                  key={method.id}
                  custom={i}
                  variants={fadeUp}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  href={method.href}
                  target={method.href.startsWith("http") ? "_blank" : undefined}
                  rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={`group flex items-center gap-4 p-4 sm:p-5 rounded-xl border transition-colors duration-300 no-underline
                    ${method.featured
                      ? "bg-black border-black hover:bg-gray-900"
                      : "bg-white border-gray-200 hover:border-black"}`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300
                      ${method.featured ? "bg-white/10" : "bg-gray-100 group-hover:bg-black"}`}
                  >
                    {isWhatsApp ? (
                      <WhatsAppIcon
                        size={20}
                        className={method.featured ? "text-white" : "text-gray-500 group-hover:text-white"}
                      />
                    ) : (
                      <Icon
                        size={18}
                        strokeWidth={1.5}
                        className={`transition-colors duration-300 ${method.featured ? "text-white" : "text-gray-500 group-hover:text-white"}`}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p
                        className={method.featured ? "text-white" : "text-black"}
                        style={{ fontFamily: SERIF, fontSize: "15px", fontWeight: 400 }}
                      >
                        {method.label}
                      </p>
                      {method.featured && (
                        <span className="px-1.5 py-0.5 bg-white/20 rounded text-white/70 uppercase tracking-wider text-[8px]">
                          Fast
                        </span>
                      )}
                    </div>
                    <p className={`truncate ${method.featured ? "text-white/50" : "text-gray-400"}`} style={{ fontSize: "12px" }}>
                      {method.description}
                    </p>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300
                      ${method.featured ? "bg-white/10" : "bg-gray-100 group-hover:bg-black"}`}
                  >
                    <ArrowUpRight
                      size={13}
                      className={`transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5
                        ${method.featured ? "text-white" : "text-gray-400 group-hover:text-white"}`}
                    />
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

// ── FAQ Item ───────────────────────────────────────────────
const FAQItem = memo(function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left group"
        aria-expanded={isOpen}
      >
        <span
          className="text-black pr-4 group-hover:text-gray-600 transition-colors duration-200 leading-snug"
          style={{ fontFamily: SERIF, fontSize: "15px", fontWeight: 400 }}
        >
          {faq.question}
        </span>

        <motion.div
          animate={{ backgroundColor: isOpen ? "#000" : "#f3f4f6" }}
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        >
          <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.25 }}>
            <Plus size={14} className={isOpen ? "text-white" : "text-gray-500"} />
          </motion.div>
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p className="pb-5 text-gray-500 leading-relaxed pr-10" style={{ fontSize: "14px" }}>
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

// ── FAQ Section ────────────────────────────────────────────
const FAQ = memo(function FAQ() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const [openIndex, setOpenIndex] = useState(0)

  const toggleFAQ = useCallback((index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index))
  }, [])

  return (
    <section ref={ref} className="w-full bg-gray-50 py-16 md:py-24 lg:py-32" style={{ fontFamily: SANS }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Left */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="lg:col-span-2"
          >
            <Eyebrow>FAQ</Eyebrow>
            <SectionHeading className="mb-5">
              Common <span className="text-gray-300">Questions</span>
            </SectionHeading>
            <p className="text-gray-500 leading-relaxed mb-6" style={{ fontSize: "14px" }}>
              Quick answers to questions you might have.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C%20I%20have%20a%20question`}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-black no-underline"
            >
              <span className="tracking-wider uppercase border-b border-black pb-0.5 group-hover:border-gray-400 transition-colors duration-300"
                style={{ fontSize: "11px", fontWeight: 500 }}>
                Ask a Question
              </span>
              <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </motion.div>

          {/* FAQ List */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="lg:col-span-3 bg-white rounded-2xl p-5 sm:p-7"
          >
            {FAQS.map((faq, i) => (
              <FAQItem
                key={i}
                faq={faq}
                isOpen={openIndex === i}
                onToggle={() => toggleFAQ(i)}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
})

// ── Location Section ───────────────────────────────────────
const Location = memo(function Location() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <section ref={ref} className="w-full bg-white py-16 md:py-24 lg:py-32" style={{ fontFamily: SANS }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Map */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 order-2 lg:order-1"
          >
            <img
              src={MAP_IMAGE}
              alt="Our service area in Duliajan, Assam"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/20" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <span className="absolute -inset-4 bg-white/30 rounded-full animate-ping" style={{ animationDuration: "2s" }} />
                <div className="relative w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-2xl">
                  <MapPin size={20} className="text-white" />
                </div>
              </div>
            </div>

            <a
              href="https://maps.google.com/?q=Duliajan,Assam"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 h-11 bg-white text-black rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all duration-300 shadow-lg"
            >
              <span className="tracking-wider uppercase" style={{ fontSize: "10px", fontWeight: 500 }}>
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
            <SectionHeading className="mb-5">
              Based in <span className="text-gray-300">Duliajan</span>
            </SectionHeading>
            <p className="text-gray-500 leading-relaxed mb-7" style={{ fontSize: "15px" }}>
              We're located in Duliajan, Assam. But remember — we come to you! Just share your location and we'll be there.
            </p>

            <div className="space-y-3 mb-6">
              {[
                { icon: MapPin, label: "Address", value: "Near Sonapur Namghar, Duliajan, Assam" },
                { icon: Clock, label: "Working Hours", value: "Monday – Sunday, 9:00 AM – 5:00 PM" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-white" />
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1 uppercase tracking-wider" style={{ fontSize: "9px" }}>
                        {label}
                      </p>
                      <p className="text-black leading-snug" style={{ fontFamily: SERIF, fontSize: "14px" }}>
                        {value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-emerald-500">✔</span>
              <span className="text-gray-500" style={{ fontSize: "13px" }}>
                Doorstep service across all of Duliajan
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
})

// ── Bottom CTA ─────────────────────────────────────────────
const BottomCTA = memo(function BottomCTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <section ref={ref} className="w-full bg-black py-16 md:py-24" style={{ fontFamily: SANS }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12">
        <motion.div variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"}>
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles size={13} className="text-white/30" />
              <span className="text-white/40 tracking-wider uppercase" style={{ fontSize: "10px" }}>
                Ready to get started?
              </span>
            </div>

            <SectionHeading light className="mb-5">
              Book Your First Service <span className="italic text-white/40">Today</span>
            </SectionHeading>

            <p className="text-white/40 max-w-md mx-auto mb-8 leading-relaxed" style={{ fontSize: "14px" }}>
              Join 100+ happy customers in Duliajan who trust us with their cleaning needs.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <motion.a
                whileTap={{ scale: 0.96 }}
                href="/bookings"
                className="group inline-flex items-center gap-2.5 h-12 sm:h-14 px-6 sm:px-8 bg-white text-black rounded-full hover:bg-gray-100 transition-colors"
              >
                <span className="tracking-wider uppercase" style={{ fontSize: "11px", fontWeight: 500 }}>
                  Book Now
                </span>
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </motion.a>

              <motion.a
                whileTap={{ scale: 0.96 }}
                href="/services"
                className="inline-flex items-center gap-2.5 h-12 sm:h-14 px-6 sm:px-8 border border-white/20 text-white rounded-full hover:bg-white/5 transition-colors"
              >
                <span className="tracking-wider uppercase" style={{ fontSize: "11px" }}>View Services</span>
              </motion.a>
            </div>
          </div>

          <div className="w-full h-px bg-white/10 mb-10" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <p className="text-white mb-1" style={{ fontFamily: SERIF, fontSize: "17px", fontWeight: 400 }}>
                Follow Our Journey
              </p>
              <p className="text-white/40" style={{ fontSize: "13px" }}>
                Stay updated with our latest work
              </p>
            </div>

            <div className="flex gap-3">
              {SOCIALS.map((social) => {
                const Icon = social.icon
                return (
                  <motion.a
                    key={social.label}
                    whileTap={{ scale: 0.94 }}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-4 py-2.5 border border-white/10 rounded-xl hover:bg-white/5 hover:border-white/20 transition-all duration-300"
                    aria-label={social.label}
                  >
                    <Icon size={16} strokeWidth={1.5} className="text-white/60" />
                    <span className="text-white/60 hidden sm:block" style={{ fontSize: "12px" }}>
                      {social.handle}
                    </span>
                  </motion.a>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
})

// ── Main Page ──────────────────────────────────────────────
export default function ContactPage() {
  return (
    <main>
      <Hero />
      <ContactMethods />
      <FAQ />
      <Location />
      <BottomCTA />
    </main>
  )
}