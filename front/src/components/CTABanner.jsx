"use client"

import { useEffect, useRef, memo } from "react"
import { ArrowRight, Phone, Clock, MapPin, Sparkles } from "lucide-react"

// ── Constants ──────────────────────────────────────────────
const INFO_ITEMS = {
  mobile: [
    { icon: Clock, text: "9AM – 5PM" },
    { icon: MapPin, text: "Duliajan" },
    { icon: Phone, text: "6900706456", href: "tel:6900706456" },
  ],
  desktop: [
    { icon: Clock, text: "Open 9AM – 5PM" },
    { icon: Phone, text: "6900706456", href: "tel:6900706456" },
  ],
}

const ANIMATION_CONFIG = {
  section: { duration: 1, ease: "power3.out" },
  content: { duration: 0.7, stagger: 0.08, ease: "power4.out" },
}

const BG_IMAGE =
  "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=1200&auto=format&fit=crop"

// ── Custom Hook: Scroll Animation ──────────────────────────
function useScrollAnimation(ref, config, deps = []) {
  useEffect(() => {
    if (!ref.current) return

    let ctx
    let observer

    const init = async () => {
      observer = new IntersectionObserver(
        async (entries) => {
          if (entries[0].isIntersecting) {
            observer.disconnect()

            const { default: gsap } = await import("gsap")
            const { ScrollTrigger } = await import("gsap/ScrollTrigger")
            gsap.registerPlugin(ScrollTrigger)

            ctx = gsap.context(() => {
              config(gsap, ScrollTrigger)
            })
          }
        },
        { rootMargin: "50px" }
      )

      observer.observe(ref.current)
    }

    init()

    return () => {
      observer?.disconnect()
      ctx?.revert()
    }
  }, deps)
}

// ── Subcomponents ──────────────────────────────────────────

const AvailabilityBadge = memo(function AvailabilityBadge({ size = "sm" }) {
  const sizes = {
    sm: "px-3 py-1.5 text-[11px]",
    md: "px-4 py-2 text-[12px]",
  }

  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
  }

  return (
    <span
      className={`inline-flex items-center gap-2 bg-white/10 
                  border border-white/10 rounded-full ${sizes[size]}`}
    >
      <span className="relative flex">
        <span
          className={`absolute inline-flex h-full w-full rounded-full 
                      bg-emerald-400 opacity-75 animate-ping`}
          style={{ animationDuration: "2s" }}
        />
        <span className={`relative rounded-full bg-emerald-400 ${dotSizes[size]}`} />
      </span>
      <span className="text-white/70">Available Today</span>
    </span>
  )
})

const InfoPill = memo(function InfoPill({ icon: Icon, text, href, size = "sm" }) {
  const sizes = {
    sm: "px-3 py-2 text-[11px] gap-2",
    md: "px-4 py-2.5 text-[12px] gap-2.5",
  }

  const iconSizes = {
    sm: 12,
    md: 14,
  }

  const content = (
    <>
      <Icon size={iconSizes[size]} className="text-white/40" />
      <span className="text-white/60">{text}</span>
    </>
  )

  const className = `flex items-center ${sizes[size]} 
                     bg-white/[0.03] border border-white/10 rounded-full
                     transition-colors duration-300
                     ${href ? "hover:bg-white/[0.08] hover:border-white/20" : ""}`

  if (href) {
    return (
      <a href={href} className={`${className} no-underline`}>
        {content}
      </a>
    )
  }

  return <div className={className}>{content}</div>
})

const PriceBadge = memo(function PriceBadge({ size = "sm" }) {
  const sizes = {
    sm: "px-5 py-4 text-[28px]",
    md: "px-6 py-5 text-[32px]",
  }

  return (
    <div className={`bg-white rounded-2xl ${size === "sm" ? "px-5 py-4" : "px-6 py-5"}`}>
      <p className="text-gray-400 mb-1" style={{ fontSize: "11px" }}>
        Starting from
      </p>
      <p
        className="text-black"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: size === "sm" ? "28px" : "32px",
          fontWeight: 300,
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        ₹299
      </p>
    </div>
  )
})

const PrimaryButton = memo(function PrimaryButton({ href, children, className = "" }) {
  return (
    <a
      href={href}
      className={`group flex items-center justify-center gap-3
                  bg-white text-black rounded-full no-underline
                  active:scale-[0.97] hover:bg-gray-100
                  transition-all duration-300 ${className}`}
    >
      <span
        className="tracking-wider uppercase font-medium"
        style={{ fontSize: "12px" }}
      >
        {children}
      </span>
      <ArrowRight
        size={16}
        strokeWidth={2}
        className="group-hover:translate-x-0.5 transition-transform duration-300"
      />
    </a>
  )
})

const SecondaryButton = memo(function SecondaryButton({ href, icon: Icon, children, className = "" }) {
  return (
    <a
      href={href}
      className={`group flex items-center justify-center gap-3
                  border border-white/20 text-white rounded-full no-underline
                  active:scale-[0.97] hover:bg-white/[0.05] hover:border-white/30
                  transition-all duration-300 ${className}`}
    >
      {Icon && <Icon size={16} strokeWidth={1.5} />}
      <span className="tracking-wider uppercase" style={{ fontSize: "12px" }}>
        {children}
      </span>
    </a>
  )
})

// ── Background Decorations ─────────────────────────────────
const BackgroundDecorations = memo(function BackgroundDecorations() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Gradient orbs */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full
                   bg-white opacity-[0.02] blur-3xl"
      />
      <div
        className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full
                   bg-white opacity-[0.015] blur-3xl"
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Diagonal accent lines */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 80px,
            rgba(255,255,255,0.1) 80px,
            rgba(255,255,255,0.1) 81px
          )`,
        }}
      />
    </div>
  )
})

// ── Mobile CTA ─────────────────────────────────────────────
const MobileCTA = memo(function MobileCTA({ contentRef }) {
  return (
    <div className="md:hidden">
      <div
        ref={contentRef}
        className="relative overflow-hidden rounded-3xl bg-black"
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={BG_IMAGE}
            alt=""
            role="presentation"
            className="w-full h-full object-cover opacity-30"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/50" />
        </div>

        <BackgroundDecorations />

        {/* Content */}
        <div className="relative z-10 p-6 pt-8">
          {/* Badge */}
          <div data-animate className="mb-6">
            <AvailabilityBadge size="sm" />
          </div>

          {/* Heading */}
          <h2
            data-animate
            className="text-white mb-4"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 300,
              fontSize: "32px",
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
            }}
          >
            Ready for a
            <br />
            <span className="text-white/40">Spotless Ride?</span>
          </h2>

          {/* Description */}
          <p
            data-animate
            className="text-white/45 leading-relaxed mb-6 max-w-[280px]"
            style={{ fontSize: "14px" }}
          >
            Book in under 2 minutes. We come to you — home, office, anywhere.
          </p>

          {/* Info pills */}
          <div data-animate className="flex flex-wrap gap-2 mb-8">
            {INFO_ITEMS.mobile.map((item, i) => (
              <InfoPill key={i} {...item} size="sm" />
            ))}
          </div>

          {/* Price badge */}
          <div data-animate className="inline-block mb-6">
            <PriceBadge size="sm" />
          </div>

          {/* CTAs */}
          <div data-animate className="flex flex-col gap-3">
            <PrimaryButton href="/bookings" className="h-14">
              Book Now
            </PrimaryButton>
            <SecondaryButton href="tel:6900706456" icon={Phone} className="h-14">
              Call Us
            </SecondaryButton>
          </div>

          {/* Trust indicator */}
          <div data-animate className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-white/[0.06]">
            <Sparkles size={12} className="text-white/20" />
            <span className="text-white/25 tracking-wider uppercase" style={{ fontSize: "9px" }}>
              100+ Happy Customers
            </span>
          </div>
        </div>
      </div>
    </div>
  )
})

// ── Desktop CTA ────────────────────────────────────────────
const DesktopCTA = memo(function DesktopCTA() {
  const desktopRef = useRef(null)

  useScrollAnimation(
    desktopRef,
    (gsap, ScrollTrigger) => {
      // Animate content elements
      const elements = desktopRef.current.querySelectorAll("[data-desktop-animate]")

      gsap.fromTo(
        elements,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: ANIMATION_CONFIG.content.duration,
          stagger: ANIMATION_CONFIG.content.stagger,
          ease: ANIMATION_CONFIG.content.ease,
          scrollTrigger: {
            trigger: desktopRef.current,
            start: "top 80%",
            once: true,
          },
        }
      )

      // Animate image
      const image = desktopRef.current.querySelector("[data-image]")
      if (image) {
        gsap.fromTo(
          image,
          { opacity: 0, scale: 1.05 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: desktopRef.current,
              start: "top 80%",
              once: true,
            },
          }
        )
      }
    },
    []
  )

  return (
    <div ref={desktopRef} className="hidden md:block">
      <div className="relative overflow-hidden rounded-3xl bg-black">
        <BackgroundDecorations />

        <div className="grid grid-cols-2">
          {/* Left: Content */}
          <div className="relative z-10 p-10 lg:p-14 xl:p-16">
            {/* Badge */}
            <div data-desktop-animate className="mb-8">
              <AvailabilityBadge size="md" />
            </div>

            {/* Heading */}
            <h2
              data-desktop-animate
              className="text-white mb-5"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: "clamp(32px, 4vw, 48px)",
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
              }}
            >
              Ready for a
              <br />
              <span className="text-white/35">Spotless Ride?</span>
            </h2>

            {/* Description */}
            <p
              data-desktop-animate
              className="text-white/40 leading-relaxed mb-8 max-w-sm"
              style={{ fontSize: "15px" }}
            >
              Book your professional car wash in under 2 minutes.
              We come to you — home, office, anywhere in Duliajan.
            </p>

            {/* Info pills */}
            <div data-desktop-animate className="flex flex-wrap gap-3 mb-10">
              {INFO_ITEMS.desktop.map((item, i) => (
                <InfoPill key={i} {...item} size="md" />
              ))}
            </div>

            {/* CTAs */}
            <div data-desktop-animate className="flex gap-4">
              <PrimaryButton href="/bookings" className="h-13 px-8">
                Book Now
              </PrimaryButton>
              <SecondaryButton href="tel:6900706456" icon={Phone} className="h-13 px-8">
                Call Us
              </SecondaryButton>
            </div>

            {/* Trust indicator */}
            <div data-desktop-animate className="flex items-center gap-2 mt-10 pt-8 border-t border-white/[0.06]">
              <Sparkles size={14} className="text-white/20" />
              <span className="text-white/25 tracking-wider uppercase" style={{ fontSize: "10px" }}>
                Trusted by 100+ Customers in Duliajan
              </span>
            </div>
          </div>

          {/* Right: Image */}
          <div className="relative min-h-[480px] lg:min-h-[520px]">
            <div data-image className="absolute inset-0 opacity-0">
              <img
                src={BG_IMAGE}
                alt="Professional car detailing service"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>

            {/* Decorative corner accent */}
            <div
              className="absolute top-0 right-0 w-32 h-32 opacity-10"
              style={{
                background: "linear-gradient(135deg, white 0%, transparent 60%)",
              }}
              aria-hidden="true"
            />

            {/* Price badge */}
            <div className="absolute bottom-8 right-8 z-10">
              <div className="relative">
                {/* Glow effect */}
                <div
                  className="absolute inset-0 bg-white rounded-2xl blur-xl opacity-20"
                  aria-hidden="true"
                />
                <PriceBadge size="md" />
              </div>
            </div>

            {/* Feature badge */}
            <div className="absolute top-8 right-8 z-10">
              <div
                className="flex items-center gap-2 px-4 py-2.5 
                           bg-black/60 backdrop-blur-md border border-white/10 rounded-full"
              >
                <MapPin size={12} className="text-white/50" />
                <span className="text-white/60" style={{ fontSize: "11px" }}>
                  Doorstep Service
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

// ── Main Component ─────────────────────────────────────────
export default function CTABanner() {
  const sectionRef = useRef(null)
  const mobileContentRef = useRef(null)

  // Section animation
  useScrollAnimation(
    sectionRef,
    (gsap, ScrollTrigger) => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: ANIMATION_CONFIG.section.duration,
          ease: ANIMATION_CONFIG.section.ease,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 88%",
            once: true,
          },
        }
      )

      // Mobile content animation
      if (mobileContentRef.current) {
        const elements = mobileContentRef.current.querySelectorAll("[data-animate]")

        gsap.fromTo(
          elements,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: ANIMATION_CONFIG.content.duration,
            stagger: ANIMATION_CONFIG.content.stagger,
            ease: ANIMATION_CONFIG.content.ease,
            scrollTrigger: {
              trigger: mobileContentRef.current,
              start: "top 80%",
              once: true,
            },
          }
        )
      }
    },
    []
  )

  return (
    <section
      ref={sectionRef}
      className="w-full bg-white py-8 md:py-16 lg:py-20 opacity-0"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      aria-label="Book a car wash"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12">
        <MobileCTA contentRef={mobileContentRef} />
        <DesktopCTA />
      </div>
    </section>
  )
}