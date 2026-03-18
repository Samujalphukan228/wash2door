// components/Footer.jsx
"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Facebook,
  ChevronUp,
} from "lucide-react"

// ─── Constants ───────────────────────────────────────────────
const CURRENT_YEAR = new Date().getFullYear()

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
  { label: "Book Now", href: "/bookings" },
]

const SERVICES = [
  { label: "Car Wash", href: "/services" },
  { label: "Sofa Cleaning", href: "/services" },
  { label: "Tank Cleaning", href: "/services" },
]

const CONTACT_INFO = [
  {
    icon: MapPin,
    text: "Near Sonapur Namghar, Duliajan",
    href: "https://maps.google.com/?q=Duliajan,Assam",
    external: true,
  },
  {
    icon: Phone,
    text: "6900706456",
    href: "tel:6900706456",
    external: true,
  },
  {
    icon: Mail,
    text: "Wash2Door786602@gmail.com",
    href: "mailto:Wash2Door786602@gmail.com",
    external: true,
  },
  {
    icon: Clock,
    text: "Mon – Sun · 9AM – 5PM",
    href: null,
    external: false,
  },
]

const SOCIALS = [
  {
    icon: Facebook,
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61581835752285",
  },
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://www.instagram.com/wash2door.djn",
  },
]

const WHATSAPP_URL =
  "https://wa.me/916900706456?text=Hi%2C%20I%20want%20to%20book%20a%20service"

// ─── Styles ──────────────────────────────────────────────────
const SERIF = 'Georgia, "Times New Roman", serif'
const EASE = [0.22, 1, 0.36, 1]

const STYLES = {
  sectionTitle: { fontSize: "9px" },
  navLink: { fontSize: "13px" },
  contactTextSm: { fontSize: "12px" },
  contactTextLg: { fontSize: "13px" },
  description: { fontSize: "13px" },
  buttonText: { fontSize: "12px" },
  socialLabel: { fontSize: "11px" },
  copyright: { fontSize: "12px" },
  copyrightSm: { fontSize: "11px" },
  madeBy: { fontSize: "10px" },
  madeBySm: { fontSize: "11px" },
  brandMobile: {
    fontFamily: SERIF,
    fontWeight: 400,
    fontSize: "20px",
  },
  brandDesktop: {
    fontFamily: SERIF,
    fontWeight: 400,
    fontSize: "24px",
    letterSpacing: "0.35em",
  },
  footerRoot: {
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
}

// ─── Animation Variants ─────────────────────────────────────
const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
}

const lineReveal = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.9, ease: EASE },
  },
}

// ─── Utility ─────────────────────────────────────────────────
function scrollToTop() {
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches
  window.scrollTo({
    top: 0,
    behavior: prefersReduced ? "auto" : "smooth",
  })
}

// ─── Sub-Components ──────────────────────────────────────────
function WhatsAppIcon({ size = 18 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function ContactList({ small = false }) {
  const textStyle = small ? STYLES.contactTextSm : STYLES.contactTextLg
  const iconSize = small ? 13 : 14

  return (
    <div className="space-y-3.5">
      {CONTACT_INFO.map((item) => {
        const Icon = item.icon
        const inner = (
          <div className="flex items-start gap-3 group/c">
            <Icon
              size={iconSize}
              strokeWidth={1.5}
              className="text-white/25 mt-0.5 shrink-0"
            />
            <span
              className={`leading-relaxed transition-colors duration-300 ${
                item.href
                  ? "text-white/40 group-hover/c:text-white/70"
                  : "text-white/30"
              }`}
              style={textStyle}
            >
              {item.text}
            </span>
          </div>
        )

        if (item.href) {
          return (
            <a
              key={item.text}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="block no-underline"
            >
              {inner}
            </a>
          )
        }

        return <div key={item.text}>{inner}</div>
      })}
    </div>
  )
}

function SocialRow({ full = false }) {
  return (
    <div className="flex gap-2.5">
      {SOCIALS.map(({ icon: Icon, label, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={`border border-white/15 rounded-full flex items-center
            justify-center hover:border-white hover:bg-white group
            transition-all duration-300
            ${full ? "flex-1 h-11 gap-2" : "w-10 h-10"}`}
        >
          <Icon
            size={15}
            className="text-white/45 group-hover:text-black transition-colors duration-300"
          />
          {full && (
            <span
              className="text-white/45 group-hover:text-black transition-colors duration-300"
              style={STYLES.socialLabel}
            >
              {label}
            </span>
          )}
        </a>
      ))}
    </div>
  )
}

function WhatsAppButton({ fullWidth = false }) {
  return (
    <motion.a
      whileTap={{ scale: 0.97 }}
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={`inline-flex items-center gap-2.5 h-11 px-6 bg-white
        text-black rounded-full no-underline hover:bg-gray-100
        transition-colors duration-300
        ${fullWidth ? "w-full justify-center" : ""}`}
    >
      <WhatsAppIcon size={16} />
      <span className="font-medium tracking-wide" style={STYLES.buttonText}>
        Chat on WhatsApp
      </span>
    </motion.a>
  )
}

function NavColumn({ title, links }) {
  return (
    <div>
      <h4
        className="text-white/25 mb-5 tracking-[0.35em] uppercase"
        style={STYLES.sectionTitle}
      >
        {title}
      </h4>
      <nav aria-label={title} className="space-y-0.5">
        {links.map(({ label, href }) => {
          const isExternal = href.startsWith("http")

          if (isExternal) {
            return (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-2 text-white/40 hover:text-white
                  transition-colors duration-300 no-underline group"
                style={STYLES.navLink}
              >
                <span className="group-hover:translate-x-1 inline-block transition-transform duration-300">
                  {label}
                </span>
              </a>
            )
          }

          return (
            <Link
              key={label}
              href={href}
              className="block py-2 text-white/40 hover:text-white
                transition-colors duration-300 no-underline group"
              style={STYLES.navLink}
            >
              <span className="group-hover:translate-x-1 inline-block transition-transform duration-300">
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

function ScrollToTop() {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={scrollToTop}
      aria-label="Back to top"
      className="w-11 h-11 border border-white/15 rounded-full flex items-center
        justify-center hover:border-white hover:bg-white group
        transition-all duration-300"
    >
      <ChevronUp
        size={17}
        className="text-white/40 group-hover:text-black transition-colors duration-300"
      />
    </motion.button>
  )
}

function BottomBar({ showAllRights = false }) {
  return (
    <div className="flex items-center justify-between gap-4 pt-6 border-t border-white/[0.07]">
      <div>
        <p
          className="text-white/25"
          style={showAllRights ? STYLES.copyright : STYLES.copyrightSm}
        >
          © {CURRENT_YEAR} Wash2Door
          {showAllRights ? ". All rights reserved." : ""}
        </p>
        <a
          href="https://nexxupp.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/15 hover:text-white/35 transition-colors no-underline"
          style={showAllRights ? STYLES.madeBySm : STYLES.madeBy}
        >
          Made by Nexxupp
        </a>
      </div>
      <ScrollToTop />
    </div>
  )
}

// ─── Brand Logo ──────────────────────────────────────────────
function BrandLogo({ mobile = false }) {
  if (mobile) {
    return (
      <Link href="/" className="inline-block no-underline mb-4">
        <span
          className="text-white tracking-[0.35em]"
          style={STYLES.brandMobile}
        >
          WASH2DOOR
        </span>
      </Link>
    )
  }

  return (
    <Link href="/" className="inline-block mb-6 no-underline group">
      <motion.span
        className="text-white inline-block"
        style={STYLES.brandDesktop}
        whileHover={{ letterSpacing: "0.48em" }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        WASH2DOOR
      </motion.span>
    </Link>
  )
}

// ─── Mobile Footer ───────────────────────────────────────────
function MobileFooter() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="md:hidden px-5 pt-12 pb-8 space-y-8"
    >
      {/* Brand */}
      <motion.div variants={fadeUp}>
        <BrandLogo mobile />
        <p
          className="text-white/30 leading-relaxed max-w-[280px]"
          style={STYLES.description}
        >
          Professional cleaning services delivered to your doorstep.
        </p>
      </motion.div>

      {/* Navigation */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-6">
        <NavColumn title="Quick Links" links={QUICK_LINKS} />
        <NavColumn title="Services" links={SERVICES} />
      </motion.div>

      {/* Contact */}
      <motion.div variants={fadeUp}>
        <h4
          className="text-white/25 mb-4 tracking-[0.35em] uppercase"
          style={STYLES.sectionTitle}
        >
          Contact
        </h4>
        <ContactList small />
      </motion.div>

      {/* Actions */}
      <motion.div variants={fadeUp} className="space-y-3">
        <WhatsAppButton fullWidth />
        <SocialRow full />
      </motion.div>

      {/* Bottom */}
      <motion.div variants={fadeUp}>
        <BottomBar />
      </motion.div>
    </motion.div>
  )
}

// ─── Desktop Footer ──────────────────────────────────────────
function DesktopFooter() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="hidden md:block max-w-6xl mx-auto px-12 py-20"
    >
      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-8 mb-16">
        {/* Brand + Contact */}
        <motion.div variants={fadeUp} className="col-span-5">
          <BrandLogo />
          <p
            className="text-white/30 leading-relaxed mb-8 max-w-sm"
            style={STYLES.description}
          >
            Professional car wash, sofa cleaning, and water tank cleaning
            delivered right to your doorstep in Duliajan.
          </p>
          <div className="mb-8">
            <ContactList />
          </div>
          <SocialRow />
        </motion.div>

        {/* Quick Links */}
        <motion.div variants={fadeUp} className="col-span-3 col-start-7">
          <NavColumn title="Quick Links" links={QUICK_LINKS} />
        </motion.div>

        {/* Services + CTA */}
        <motion.div variants={fadeUp} className="col-span-3">
          <div className="mb-10">
            <NavColumn title="Services" links={SERVICES} />
          </div>
          <WhatsAppButton />
        </motion.div>
      </div>

      {/* Divider */}
      <motion.div
        variants={lineReveal}
        className="h-px bg-white/[0.07] origin-left mb-6"
        aria-hidden="true"
      />

      {/* Bottom Bar */}
      <div className="flex items-center justify-between">
        <p className="text-white/25" style={STYLES.copyright}>
          © {CURRENT_YEAR} Wash2Door. All rights reserved.
        </p>
        <a
          href="https://nexxupp.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/15 hover:text-white/35 transition-colors no-underline"
          style={STYLES.madeBySm}
        >
          Made by Nexxupp
        </a>
        <ScrollToTop />
      </div>
    </motion.div>
  )
}

// ─── Main Export ─────────────────────────────────────────────
export default function Footer() {
  return (
    <footer className="w-full bg-black" style={STYLES.footerRoot}>
      <MobileFooter />
      <DesktopFooter />
    </footer>
  )
}