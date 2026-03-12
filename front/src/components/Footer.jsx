"use client"

import { useEffect, useRef } from 'react'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Facebook,
  ChevronUp,
} from 'lucide-react'

const QUICK_LINKS = [
  { label: 'Home',       href: '/' },
  { label: 'About Us',   href: '/About' },
  { label: 'Services',   href: '/Services' },
  { label: 'Contact Us', href: '/Contact/' },
  { label: 'Book Now',   href: '/Bookings' },
]

const SERVICES = [
  { label: 'Car Wash',            href: '/Services' },
  { label: 'Sofa Cleaning',       href: '/Services' },
  { label: 'Water Tank Cleaning', href: '/Services' },
]

const CONTACT_INFO = [
  {
    icon: MapPin,
    text: 'Near Sonapur Namghar, Duliajan, Assam',
    href: 'https://maps.google.com/?q=Duliajan,Assam',
  },
  {
    icon: Phone,
    text: '6900706456',
    href: 'tel:6900706456',
  },
  {
    icon: Mail,
    text: 'Wash2Door786602@gmail.com',
    href: 'mailto:Wash2Door786602@gmail.com',
  },
  {
    icon: Clock,
    text: 'Monday – Sunday · 9:00 AM – 5:00 PM',
    href: null,
  },
]

const SOCIALS = [
  {
    icon: Facebook,
    href: 'https://www.facebook.com/profile.php?id=61581835752285',
    label: 'Facebook',
  },
  {
    icon: Instagram,
    href: 'https://www.instagram.com/wash2door.djn',
    label: 'Instagram',
  },
]

export default function Footer() {
  const footerRef = useRef(null)

  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      const el = footerRef.current
      if (!el) return
      ctx = gsap.context(() => {
        gsap.fromTo(
          el.querySelectorAll('.footer-col'),
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 90%' },
          }
        )
      })
    }
    init()
    return () => ctx?.revert()
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer
      ref={footerRef}
      className="w-full bg-black"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      {/* ── Main grid ── */}
      <div className="max-w-6xl mx-auto px-8 md:px-16 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* ── Brand column ── */}
          <div className="lg:col-span-5 footer-col opacity-0">

            {/* Wordmark */}
            <a href="/" className="inline-block mb-6 no-underline group">
              <div
                className="tracking-[0.42em] uppercase text-white transition-opacity duration-300 group-hover:opacity-60"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 300,
                  fontSize: 'clamp(16px, 3.5vw, 24px)',
                }}
              >
                WASH2DOOR
              </div>
              <div
                className="tracking-[0.3em] uppercase text-white/40 mt-1"
                style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
              >
                The Shine That Finds You
              </div>
            </a>

            <p
              className="tracking-[0.15em] leading-[1.8] uppercase text-white/40 mb-10 max-w-xs"
              style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
            >
              Professional car wash, sofa cleaning, and water tank cleaning services right at your doorstep. Fast, safe, and hassle-free.
            </p>

            {/* Contact info */}
            <div className="space-y-4 mb-10">
              {CONTACT_INFO.map((item, i) => {
                const Icon = item.icon
                const inner = (
                  <div className="flex items-start gap-3 group/item">
                    <Icon size={13} strokeWidth={1.5} className="text-white/30 mt-0.5 shrink-0" />
                    <span
                      className={`tracking-[0.12em] uppercase leading-5 ${
                        item.href
                          ? 'text-white/50 group-hover/item:text-white transition-colors duration-300'
                          : 'text-white/40'
                      }`}
                      style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
                    >
                      {item.text}
                    </span>
                  </div>
                )
                return item.href ? (
                  <a key={i} href={item.href} className="block no-underline">{inner}</a>
                ) : (
                  <div key={i}>{inner}</div>
                )
              })}
            </div>

            {/* Socials */}
            <div className="flex gap-3">
              {SOCIALS.map((s) => {
                const Icon = s.icon
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-10 h-10 border border-white/20 flex items-center justify-center
                               hover:border-white hover:bg-white group transition-all duration-300 rounded-[3px]"
                  >
                    <Icon size={15} strokeWidth={1.5} className="text-white/60 group-hover:text-black transition-colors duration-300" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div className="lg:col-span-3 footer-col opacity-0">
            <h4
              className="tracking-[0.3em] uppercase text-white/30 mb-6"
              style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
            >
              Quick Links
            </h4>
            <nav className="flex flex-col gap-1">
              {QUICK_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="tracking-[0.15em] uppercase text-white/50 hover:text-white
                             transition-colors duration-300 no-underline py-1.5"
                  style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* ── Services ── */}
          <div className="lg:col-span-4 footer-col opacity-0">
            <h4
              className="tracking-[0.3em] uppercase text-white/30 mb-6"
              style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
            >
              Our Services
            </h4>
            <nav className="flex flex-col gap-1 mb-10">
              {SERVICES.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="tracking-[0.15em] uppercase text-white/50 hover:text-white
                             transition-colors duration-300 no-underline py-1.5"
                  style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* WhatsApp CTA */}
            <h4
              className="tracking-[0.3em] uppercase text-white/30 mb-4"
              style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
            >
              Book via WhatsApp
            </h4>
            <a
              href="https://wa.me/916900706456?text=Hi%2C%20I%20want%20to%20book%20a%20service"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white/10 border border-white/20
                         hover:bg-white hover:border-white text-white hover:text-black
                         px-5 py-3 no-underline transition-all duration-300 rounded-[5px] group"
            >
              {/* WhatsApp SVG */}
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span
                className="tracking-[0.2em] uppercase font-medium"
                style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
              >
                Chat on WhatsApp
              </span>
            </a>
          </div>

        </div>
      </div>

      {/* ── Divider ── */}
      <div className="max-w-6xl mx-auto px-8 md:px-16">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* ── Bottom bar ── */}
      <div className="max-w-6xl mx-auto px-8 md:px-16 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          <p
            className="tracking-[0.2em] uppercase text-white/30 text-center md:text-left"
            style={{ fontSize: 'clamp(9px, 2.2vw, 10px)' }}
          >
            © {new Date().getFullYear()} Wash2Door. All rights reserved.
          </p>

          <a href="https://nexxupp.com">
            <p
            className="tracking-[0.2em] uppercase text-white/20 text-center"
            style={{ fontSize: 'clamp(9px, 2.2vw, 10px)' }}
          >
            Made by Nexxupp
          </p>
          </a>

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="w-10 h-10 border border-white/20 flex items-center justify-center
                       hover:border-white hover:bg-white group transition-all duration-300 rounded-[3px]"
            aria-label="Back to top"
          >
            <ChevronUp size={16} strokeWidth={1.5} className="text-white/50 group-hover:text-black transition-colors duration-300" />
          </button>
        </div>
      </div>

    </footer>
  )
}