// components/Hero.jsx
"use client"

import { useEffect, useRef } from "react"
import { ArrowRight, Phone } from "lucide-react"

const BG_IMAGE =
  "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=90&w=2400&auto=format&fit=crop"

export default function Hero() {
  const sectionRef = useRef(null)
  const bgRef = useRef(null)
  const contentRef = useRef(null)
  const statsRef = useRef(null)

  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import("gsap")
      if (!sectionRef.current) return

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

        // Background
        tl.fromTo(
          bgRef.current,
          { scale: 1.1, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.5, ease: "power2.out" },
          0
        )

        // Content
        tl.fromTo(
          contentRef.current?.querySelectorAll("[data-animate]") || [],
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 },
          0.4
        )

        // Stats
        tl.fromTo(
          statsRef.current?.querySelectorAll("[data-stat]") || [],
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.08 },
          0.9
        )
      })
    }
    init()
    return () => ctx?.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[100svh] bg-black overflow-hidden"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      {/* Background */}
      <div ref={bgRef} className="absolute inset-0 opacity-0">
        <img
          src={BG_IMAGE}
          alt="Car detailing"
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.3)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-[100svh] flex flex-col">
        {/* Main Content */}
        <div
          ref={contentRef}
          className="flex-1 flex flex-col justify-end px-5 sm:px-8 lg:px-16 xl:px-24 
                     pb-8 sm:pb-12 lg:pb-16"
        >
          {/* Badge */}
          <div data-animate className="mb-6 lg:mb-8">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 
                         border border-white/20 rounded-full"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span
                className="text-white/60 tracking-widest uppercase"
                style={{ fontSize: "10px" }}
              >
                Available Today
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 data-animate className="mb-6 lg:mb-8 max-w-4xl">
            <span
              className="block text-white"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: "clamp(2.5rem, 8vw, 6rem)",
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              Premium Car Care
            </span>
            <span
              className="block text-white/40 mt-1 lg:mt-2"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: "clamp(2.5rem, 8vw, 6rem)",
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              At Your Doorstep
            </span>
          </h1>

          {/* Description */}
          <p
            data-animate
            className="text-white/40 max-w-md mb-8 lg:mb-10 leading-relaxed"
            style={{ fontSize: "clamp(14px, 1.5vw, 16px)" }}
          >
            Professional detailing services delivered to your location. 
            We bring the shine to you.
          </p>

          {/* CTAs */}
          <div data-animate className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <a
              href="/bookings"
              className="group flex items-center justify-center gap-3 h-14 px-8
                         bg-white text-black rounded-full
                         hover:bg-white/90 active:scale-[0.98]
                         transition-all duration-300 no-underline"
            >
              <span
                className="tracking-widest uppercase font-medium"
                style={{ fontSize: "11px" }}
              >
                Book Now
              </span>
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </a>

            <a
              href="tel:6900706456"
              className="flex items-center justify-center gap-3 h-14 px-8
                         border border-white/20 text-white rounded-full
                         hover:bg-white/5 active:scale-[0.98]
                         transition-all duration-300 no-underline"
            >
              <Phone size={16} />
              <span
                className="tracking-widest uppercase"
                style={{ fontSize: "11px" }}
              >
                Call Us
              </span>
            </a>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div
          ref={statsRef}
          className="border-t border-white/10 px-5 sm:px-8 lg:px-16 xl:px-24 py-6 lg:py-8"
        >
          <div className="flex items-center justify-between max-w-4xl">
            {[
              { value: "500+", label: "Cars Serviced" },
              { value: "4.9", label: "Rating" },
              { value: "Same Day", label: "Service" },
            ].map((stat, i) => (
              <div key={i} data-stat className="text-center sm:text-left">
                <p
                  className="text-white mb-1"
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: "clamp(20px, 3vw, 28px)",
                    fontWeight: 300,
                  }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-white/30 tracking-widest uppercase"
                  style={{ fontSize: "9px" }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}