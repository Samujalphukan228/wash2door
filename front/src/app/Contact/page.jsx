"use client"

import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Phone, Mail, MapPin, Clock, Instagram, Facebook, Send } from 'lucide-react'

const CONTACT_DETAILS = [
  {
    icon: Phone,
    label: 'Phone',
    value: '+91 6900706456',
    href: 'tel:6900706456',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'Wash2Door786602@gmail.com',
    href: 'mailto:Wash2Door786602@gmail.com',
  },
  {
    icon: MapPin,
    label: 'Address',
    value: 'Near Sonapur Namghar, Duliajan, Assam',
    href: 'https://maps.google.com/?q=Duliajan,Assam',
  },
  {
    icon: Clock,
    label: 'Hours',
    value: 'Monday – Sunday · 9:00 AM – 5:00 PM',
    href: null,
  },
]

const SOCIALS = [
  {
    icon: Facebook,
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61581835752285',
  },
  {
    icon: Instagram,
    label: 'Instagram',
    href: 'https://www.instagram.com/wash2door.djn',
  },
]

// ── Contact Form ──
function ContactForm() {
  const [form, setForm] = useState({ name: '', phone: '', service: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulate submission — wire up to your backend/API here
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSubmitted(true)
  }

  const inputClass = `
    w-full bg-transparent border-b border-gray-200 py-3 outline-none
    tracking-[0.15em] uppercase text-black placeholder-gray-300
    focus:border-black transition-colors duration-300
  `

  if (submitted) {
    return (
      <div className="flex flex-col items-start justify-center h-full py-16">
        <div className="w-12 h-px bg-black mb-8" />
        <h3
          className="text-black mb-4"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 300,
            fontSize: 'clamp(20px, 4vw, 32px)',
            letterSpacing: '-0.01em',
          }}
        >
          Message Sent
        </h3>
        <p
          className="tracking-[0.18em] uppercase text-gray-400 leading-[1.9] mb-8"
          style={{ fontSize: 'clamp(10px, 2.4vw, 11px)' }}
        >
          Thank you for reaching out. We will get back to you shortly.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', service: '', message: '' }) }}
          className="tracking-[0.22em] uppercase text-gray-400 hover:text-black transition-colors duration-300 border-b border-gray-200 hover:border-black pb-0.5"
          style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label
            className="block tracking-[0.3em] uppercase text-gray-400 mb-3"
            style={{ fontSize: 'clamp(9px, 2.2vw, 10px)' }}
          >
            Your Name
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="Rahul Sharma"
            value={form.name}
            onChange={handleChange}
            className={inputClass}
            style={{ fontSize: 'clamp(10px, 2.4vw, 11px)' }}
          />
        </div>
        <div>
          <label
            className="block tracking-[0.3em] uppercase text-gray-400 mb-3"
            style={{ fontSize: 'clamp(9px, 2.2vw, 10px)' }}
          >
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            required
            placeholder="+91 XXXXX XXXXX"
            value={form.phone}
            onChange={handleChange}
            className={inputClass}
            style={{ fontSize: 'clamp(10px, 2.4vw, 11px)' }}
          />
        </div>
      </div>

      <div>
        <label
          className="block tracking-[0.3em] uppercase text-gray-400 mb-3"
          style={{ fontSize: 'clamp(9px, 2.2vw, 10px)' }}
        >
          Service Interested In
        </label>
        <select
          name="service"
          value={form.service}
          onChange={handleChange}
          className={`${inputClass} cursor-pointer`}
          style={{ fontSize: 'clamp(10px, 2.4vw, 11px)' }}
        >
          <option value="">Select a service</option>
          <option value="car-wash">Car Wash</option>
          <option value="sofa-cleaning">Sofa Cleaning</option>
          <option value="water-tank-cleaning">Water Tank Cleaning</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label
          className="block tracking-[0.3em] uppercase text-gray-400 mb-3"
          style={{ fontSize: 'clamp(9px, 2.2vw, 10px)' }}
        >
          Message
        </label>
        <textarea
          name="message"
          rows={4}
          placeholder="Tell us how we can help..."
          value={form.message}
          onChange={handleChange}
          className={`${inputClass} resize-none`}
          style={{ fontSize: 'clamp(10px, 2.4vw, 11px)' }}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <button
          type="submit"
          disabled={loading}
          className="relative flex items-center gap-2 tracking-[0.22em] uppercase
                     text-white bg-black border border-black px-7 py-4
                     overflow-hidden group rounded-[5px] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
        >
          <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
          <span className="relative z-10 group-hover:text-black transition-colors duration-500">
            {loading ? 'Sending…' : 'Send Message'}
          </span>
          <Send size={13} strokeWidth={1.5} className="relative z-10 group-hover:text-black transition-colors duration-500" />
        </button>

        <p
          className="tracking-[0.15em] uppercase text-gray-300"
          style={{ fontSize: 'clamp(9px, 2.2vw, 10px)' }}
        >
          Or call us directly at{' '}
          <a
            href="tel:6900706456"
            className="text-black border-b border-gray-200 hover:border-black transition-colors duration-300 no-underline"
          >
            6900706456
          </a>
        </p>
      </div>
    </form>
  )
}

// ── Page ──
export default function ContactPage() {
  const heroRef = useRef(null)
  const leftRef = useRef(null)
  const rightRef = useRef(null)

  // Hero animation
  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import('gsap')
      if (!heroRef.current) return
      ctx = gsap.context(() => {
        gsap.fromTo(
          heroRef.current.children,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out', delay: 0.1 }
        )
      })
    }
    init()
    return () => ctx?.revert()
  }, [])

  // Main content animation
  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      for (const ref of [leftRef, rightRef]) {
        if (!ref.current) continue
        ctx = gsap.context(() => {
          gsap.fromTo(
            ref.current,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: ref.current, start: 'top 85%' } }
          )
        })
      }
    }
    init()
    return () => ctx?.revert()
  }, [])

  return (
    <main style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>

      {/* ── Hero ── */}
      <section className="w-full bg-black pt-24 pb-32 md:pt-32 md:pb-40 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 60px, white 60px, white 61px)' }}
        />
        <div className="max-w-6xl mx-auto px-8 md:px-16 relative z-10">
          <div ref={heroRef}>
            <div className="flex items-center gap-3 mb-8">
              <span className="block w-6 h-px bg-white/30 shrink-0" />
              <span
                className="tracking-[0.4em] uppercase text-white/50"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(9px, 2.2vw, 11px)' }}
              >
                Get In Touch
              </span>
            </div>
            <h1
              className="text-white mb-6"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: 'clamp(2.4rem, 6vw, 5.5rem)',
                lineHeight: 1.06,
                letterSpacing: '-0.02em',
                maxWidth: '700px',
              }}
            >
              We'd Love to Hear From You
            </h1>
            <p
              className="tracking-[0.18em] leading-[1.9] uppercase text-white/50 max-w-lg"
              style={{ fontSize: 'clamp(10px, 2.4vw, 11px)' }}
            >
              Book a service, ask a question, or just say hello. We are available every day — 9 AM to 5 PM.
            </p>
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="w-full bg-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-8 md:px-16">

          {/* Eyebrow rule */}
          <div className="flex items-center gap-3 mb-16 md:mb-20">
            <span className="block w-6 h-px bg-black shrink-0" />
            <span
              className="tracking-[0.4em] uppercase text-gray-400"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(9px, 2.2vw, 11px)' }}
            >
              Contact Us
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

            {/* ── Left — Contact info ── */}
            <div ref={leftRef} className="opacity-0">
              <h2
                className="text-black mb-10"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 300,
                  fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                }}
              >
                Contact Information
              </h2>

              {/* Details */}
              <div className="flex flex-col gap-8 mb-12">
                {CONTACT_DETAILS.map((item, i) => {
                  const Icon = item.icon
                  const inner = (
                    <div className="flex items-start gap-5 group/item">
                      <div className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center shrink-0
                                      group-hover/item:border-black transition-colors duration-300 mt-0.5">
                        <Icon size={14} strokeWidth={1.5} className="text-gray-400 group-hover/item:text-black transition-colors duration-300" />
                      </div>
                      <div>
                        <p
                          className="tracking-[0.3em] uppercase text-gray-400 mb-1"
                          style={{ fontSize: 'clamp(9px, 2.2vw, 10px)' }}
                        >
                          {item.label}
                        </p>
                        <p
                          className={`tracking-[0.12em] uppercase leading-6 ${item.href ? 'text-black group-hover/item:opacity-60 transition-opacity duration-300' : 'text-gray-500'}`}
                          style={{ fontSize: 'clamp(10px, 2.4vw, 11px)' }}
                        >
                          {item.value}
                        </p>
                      </div>
                    </div>
                  )
                  return item.href ? (
                    <a key={i} href={item.href} className="block no-underline">{inner}</a>
                  ) : (
                    <div key={i}>{inner}</div>
                  )
                })}
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gray-100 mb-10" />

              {/* Socials */}
              <p
                className="tracking-[0.3em] uppercase text-gray-400 mb-5"
                style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
              >
                Follow Us
              </p>
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
                      className="w-10 h-10 border border-gray-200 flex items-center justify-center
                                 hover:border-black hover:bg-black group transition-all duration-300 rounded-[3px]"
                    >
                      <Icon size={15} strokeWidth={1.5} className="text-gray-400 group-hover:text-white transition-colors duration-300" />
                    </a>
                  )
                })}
              </div>

              {/* WhatsApp */}
              <div className="mt-10">
                <a
                  href="https://wa.me/916900706456?text=Hi%2C%20I%20want%20to%20book%20a%20service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative inline-flex items-center gap-3 tracking-[0.22em] uppercase
                             text-black border border-black px-7 py-4 no-underline
                             overflow-hidden group rounded-[5px]"
                  style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
                >
                  <span className="absolute inset-0 bg-black origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 relative z-10 group-hover:text-white transition-colors duration-500">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="relative z-10 group-hover:text-white transition-colors duration-500">
                    Chat on WhatsApp
                  </span>
                </a>
              </div>
            </div>

            {/* ── Right — Form ── */}
            <div ref={rightRef} className="opacity-0">
              <h2
                className="text-black mb-10"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 300,
                  fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                }}
              >
                Send a Message
              </h2>
              <ContactForm />
            </div>

          </div>
        </div>
      </section>

      {/* ── Map / Location strip ── */}
      <section className="w-full bg-black py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-8 md:px-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <p
                className="tracking-[0.3em] uppercase text-white/30 mb-2"
                style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
              >
                Our Location
              </p>
              <p
                className="text-white"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 300,
                  fontSize: 'clamp(16px, 3vw, 24px)',
                  letterSpacing: '-0.01em',
                }}
              >
                Near Sonapur Namghar, Duliajan, Assam
              </p>
            </div>
            <a
              href="https://maps.google.com/?q=Duliajan,Assam"
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center gap-2 tracking-[0.22em] uppercase
                         text-white border border-white/30 px-7 py-4 no-underline
                         overflow-hidden group rounded-[5px] w-fit"
              style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
            >
              <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
              <span className="relative z-10 group-hover:text-black transition-colors duration-500">Open in Maps</span>
              <ArrowUpRight size={13} strokeWidth={1.5} className="relative z-10 group-hover:text-black transition-colors duration-500" />
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}