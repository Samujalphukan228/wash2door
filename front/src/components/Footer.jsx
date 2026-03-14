// components/Footer.jsx
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
  ArrowUpRight,
} from 'lucide-react'

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/About' },
  { label: 'Services', href: '/Services' },
  { label: 'Contact', href: '/Contact/' },
  { label: 'Book Now', href: '/Bookings' },
]

const SERVICES = [
  { label: 'Car Wash', href: '/Services' },
  { label: 'Sofa Cleaning', href: '/Services' },
  { label: 'Tank Cleaning', href: '/Services' },
]

const CONTACT_INFO = [
  {
    icon: MapPin,
    text: 'Near Sonapur Namghar, Duliajan',
    href: 'https://maps.google.com/?q=Duliajan,Assam',
  },
  {
    icon: Phone,
    text: '6900706456',
    href: 'tel:6900706456',
  },
  {
    icon: Mail,
    text: 'wash2door@gmail.com',
    href: 'mailto:Wash2Door786602@gmail.com',
  },
  {
    icon: Clock,
    text: 'Mon – Sun · 9AM – 5PM',
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
  const gridRef = useRef(null)
  const dividerRef = useRef(null)

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      ctx = gsap.context(() => {
        if (gridRef.current) {
          gsap.fromTo(
            gridRef.current.querySelectorAll('[data-animate]'),
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.1,
              ease: 'power3.out',
              scrollTrigger: { trigger: gridRef.current, start: 'top 88%' },
            }
          )
        }

        if (dividerRef.current) {
          gsap.fromTo(
            dividerRef.current,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: { trigger: dividerRef.current, start: 'top 95%' },
            }
          )
        }
      })
    }
    init()
    return () => ctx?.revert()
  }, [])

  return (
    <footer
      className="w-full bg-black"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      {/* ═══ MOBILE ═══ */}
      <div className="md:hidden">
        <div className="px-5 pt-12 pb-8">
          {/* Brand */}
          <div data-animate className="mb-10">
            <a href="/" className="inline-block no-underline mb-4">
              <span
                className="text-white tracking-[0.35em]"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 400,
                  fontSize: '22px',
                }}
              >
                WASH2DOOR
              </span>
            </a>
            <p
              className="text-white/30 leading-relaxed max-w-[280px]"
              style={{ fontSize: '13px' }}
            >
              Professional car wash and cleaning services delivered to your doorstep.
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div data-animate>
              <h4
                className="text-white/30 mb-4 tracking-wider uppercase"
                style={{ fontSize: '10px' }}
              >
                Quick Links
              </h4>
              <nav className="space-y-1">
                {QUICK_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block py-2.5 text-white/50 active:text-white
                               transition-colors no-underline"
                    style={{ fontSize: '14px' }}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            <div data-animate>
              <h4
                className="text-white/30 mb-4 tracking-wider uppercase"
                style={{ fontSize: '10px' }}
              >
                Services
              </h4>
              <nav className="space-y-1">
                {SERVICES.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block py-2.5 text-white/50 active:text-white
                               transition-colors no-underline"
                    style={{ fontSize: '14px' }}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Contact */}
          <div data-animate className="mb-10">
            <h4
              className="text-white/30 mb-4 tracking-wider uppercase"
              style={{ fontSize: '10px' }}
            >
              Contact
            </h4>
            <div className="space-y-4">
              {CONTACT_INFO.map((item, i) => {
                const Icon = item.icon
                const content = (
                  <div className="flex items-start gap-3">
                    <Icon size={16} className="text-white/30 mt-0.5 shrink-0" />
                    <span
                      className={`leading-relaxed ${
                        item.href ? 'text-white/50' : 'text-white/40'
                      }`}
                      style={{ fontSize: '14px' }}
                    >
                      {item.text}
                    </span>
                  </div>
                )
                return item.href ? (
                  <a key={i} href={item.href} className="block no-underline">
                    {content}
                  </a>
                ) : (
                  <div key={i}>{content}</div>
                )
              })}
            </div>
          </div>

          {/* CTA + Socials */}
          <div data-animate className="mb-10">
            <a
              href="https://wa.me/916900706456?text=Hi%2C%20I%20want%20to%20book%20a%20service"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full h-14
                         bg-white text-black rounded-full mb-4
                         active:scale-[0.97] transition-all duration-200 no-underline"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="font-medium" style={{ fontSize: '14px' }}>
                Chat on WhatsApp
              </span>
            </a>

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
                    className="flex-1 h-12 border border-white/15 rounded-full
                               flex items-center justify-center gap-2
                               active:bg-white active:text-black
                               transition-all duration-200"
                  >
                    <Icon size={16} className="text-white/50" />
                    <span className="text-white/50" style={{ fontSize: '12px' }}>
                      {s.label}
                    </span>
                  </a>
                )
              })}
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/30" style={{ fontSize: '11px' }}>
                  © {new Date().getFullYear()} Wash2Door
                </p>
                <a
                  href="https://nexxupp.com"
                  className="text-white/20 hover:text-white/40 no-underline"
                  style={{ fontSize: '10px' }}
                >
                  Made by Nexxupp
                </a>
              </div>

              <button
                onClick={scrollToTop}
                className="w-12 h-12 border border-white/15 rounded-full
                           flex items-center justify-center
                           active:bg-white active:text-black transition-all duration-200"
                aria-label="Back to top"
              >
                <ChevronUp size={18} className="text-white/50" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ DESKTOP ═══ */}
      <div className="hidden md:block">
        <div ref={gridRef} className="max-w-6xl mx-auto px-12 py-20">
          <div className="grid grid-cols-12 gap-8">
            {/* Brand */}
            <div data-animate className="col-span-5">
              <a href="/" className="inline-block mb-6 no-underline group">
                <span
                  className="text-white tracking-[0.4em] group-hover:tracking-[0.5em]
                             transition-all duration-500"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontWeight: 400,
                    fontSize: '26px',
                  }}
                >
                  WASH2DOOR
                </span>
              </a>

              <p
                className="text-white/30 leading-relaxed mb-10 max-w-sm"
                style={{ fontSize: '14px' }}
              >
                Professional car wash, sofa cleaning, and water tank cleaning
                services delivered right to your doorstep.
              </p>

              {/* Contact Info */}
              <div className="space-y-4 mb-10">
                {CONTACT_INFO.map((item, i) => {
                  const Icon = item.icon
                  const content = (
                    <div className="flex items-start gap-3 group/item">
                      <Icon size={14} className="text-white/30 mt-0.5 shrink-0" />
                      <span
                        className={`leading-relaxed transition-colors duration-300 ${
                          item.href
                            ? 'text-white/40 group-hover/item:text-white'
                            : 'text-white/30'
                        }`}
                        style={{ fontSize: '13px' }}
                      >
                        {item.text}
                      </span>
                    </div>
                  )
                  return item.href ? (
                    <a key={i} href={item.href} className="block no-underline">
                      {content}
                    </a>
                  ) : (
                    <div key={i}>{content}</div>
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
                      className="w-11 h-11 border border-white/15 rounded-full
                                 flex items-center justify-center
                                 hover:border-white hover:bg-white group
                                 transition-all duration-300"
                    >
                      <Icon
                        size={16}
                        className="text-white/50 group-hover:text-black
                                   transition-colors duration-300"
                      />
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div data-animate className="col-span-3">
              <h4
                className="text-white/30 mb-6 tracking-wider uppercase"
                style={{ fontSize: '11px' }}
              >
                Quick Links
              </h4>
              <nav className="space-y-1">
                {QUICK_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block py-2 text-white/40 hover:text-white
                               transition-colors duration-300 no-underline"
                    style={{ fontSize: '14px' }}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Services + WhatsApp */}
            <div data-animate className="col-span-4">
              <h4
                className="text-white/30 mb-6 tracking-wider uppercase"
                style={{ fontSize: '11px' }}
              >
                Services
              </h4>
              <nav className="space-y-1 mb-10">
                {SERVICES.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block py-2 text-white/40 hover:text-white
                               transition-colors duration-300 no-underline"
                    style={{ fontSize: '14px' }}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              <a
                href="https://wa.me/916900706456?text=Hi%2C%20I%20want%20to%20book%20a%20service"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3
                           bg-white text-black rounded-full
                           hover:bg-gray-100 transition-all duration-300 no-underline"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span style={{ fontSize: '13px' }}>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="max-w-6xl mx-auto px-12">
          <div ref={dividerRef} className="h-px bg-white/10 origin-left" />
        </div>

        {/* Bottom */}
        <div className="max-w-6xl mx-auto px-12 py-6">
          <div className="flex items-center justify-between">
            <p className="text-white/30" style={{ fontSize: '12px' }}>
              © {new Date().getFullYear()} Wash2Door. All rights reserved.
            </p>

            <a
              href="https://nexxupp.com"
              className="text-white/20 hover:text-white/40 transition-colors no-underline"
              style={{ fontSize: '12px' }}
            >
              Made by Nexxupp
            </a>

            <button
              onClick={scrollToTop}
              className="w-11 h-11 border border-white/15 rounded-full
                         flex items-center justify-center
                         hover:border-white hover:bg-white group
                         transition-all duration-300"
              aria-label="Back to top"
            >
              <ChevronUp
                size={18}
                className="text-white/50 group-hover:text-black transition-colors"
              />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}