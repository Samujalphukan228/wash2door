"use client"

import { useEffect, useRef } from 'react'
import { ArrowUpRight, CheckCircle, Droplets, Sofa, Cylinder } from 'lucide-react'

// ── Real data from wash2door.in/services ──
const SERVICES = [
  {
    id: 'car-wash',
    icon: Droplets,
    eyebrow: '01',
    title: 'Car Wash',
    subtitle: 'At Your Doorstep',
    description:
      'Get all types of car wash services right at your home. We use safe and eco-friendly cleaning products for your car\'s perfect shine. Just book your appointment and enjoy a spotless, safe clean — hassle-free.',
    features: [
      'Exterior hand wash & rinse',
      'Interior vacuum & wipe-down',
      'Eco-friendly products',
      'Tyre & rim cleaning',
      'Window & mirror polish',
    ],
    image: 'https://wash2door.in/wp-content/uploads/2025/10/5-1024x664.png',
    cta: 'Book Car Wash',
  },
  {
    id: 'sofa-cleaning',
    icon: Sofa,
    eyebrow: '02',
    title: 'Sofa Cleaning',
    subtitle: 'At Your Doorstep',
    description:
      'Get professional sofa cleaning services right at your home. Our trained team removes deep-set dirt, stains, and allergens using safe methods. Just book your appointment and enjoy a fresh, spotless sofa without any hassle.',
    features: [
      'Deep fabric cleaning',
      'Stain & odour removal',
      'Safe for all fabric types',
      'Allergen reduction treatment',
      'Quick dry process',
    ],
    image: 'https://wash2door.in/wp-content/uploads/2025/10/image_downloader_1759999701023-1024x768.jpg',
    cta: 'Book Sofa Cleaning',
  },
  {
    id: 'water-tank-cleaning',
    icon: Cylinder,
    eyebrow: '03',
    title: 'Water Tank Cleaning',
    subtitle: 'At Your Doorstep',
    description:
      'Get safe and hygienic water tank cleaning services right at your home. We drain, scrub, disinfect, and refill your tank so your water stays clean and germ-free. Just book your appointment and keep your water tank ready to use.',
    features: [
      'Full drain & manual scrub',
      'Disinfection treatment',
      'Sediment & algae removal',
      'Safe for drinking water',
      'Certificate of cleaning provided',
    ],
    image: 'https://wash2door.in/wp-content/uploads/2025/10/Untitled-design-2-1-1024x664.png',
    cta: 'Book Tank Cleaning',
  },
]

// ── Single service section ──
function ServiceSection({ service, index }) {
  const sectionRef = useRef(null)
  const imageRef = useRef(null)
  const contentRef = useRef(null)

  const isEven = index % 2 === 0
  const Icon = service.icon

  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (!sectionRef.current) return
      ctx = gsap.context(() => {
        gsap.fromTo(
          imageRef.current,
          { opacity: 0, x: isEven ? -40 : 40 },
          { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 82%' } }
        )
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, x: isEven ? 40 : -40 },
          { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', delay: 0.1, scrollTrigger: { trigger: sectionRef.current, start: 'top 82%' } }
        )
      })
    }
    init()
    return () => ctx?.revert()
  }, [isEven])

  return (
    <div
      ref={sectionRef}
      id={service.id}
      className="w-full border-b border-gray-100 last:border-0 py-20 md:py-28"
    >
      <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
          isEven ? '' : 'lg:grid-flow-dense'
        }`}
      >
        {/* Image */}
        <div
          ref={imageRef}
          className={`opacity-0 relative overflow-hidden rounded-[5px] ${
            isEven ? '' : 'lg:col-start-2'
          }`}
        >
          <div className="aspect-[4/3] overflow-hidden bg-gray-100">
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
          {/* Number badge */}
          <div className="absolute top-5 left-5 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-[3px]">
            <span
              className="text-white"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: 'clamp(9px, 2.2vw, 11px)',
                letterSpacing: '0.3em',
              }}
            >
              {service.eyebrow}
            </span>
          </div>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className={`opacity-0 ${isEven ? '' : 'lg:col-start-1 lg:row-start-1'}`}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-6">
            <span className="block w-6 h-px bg-black shrink-0" />
            <span
              className="tracking-[0.4em] uppercase text-gray-400"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 'clamp(9px, 2.2vw, 11px)',
              }}
            >
              {service.subtitle}
            </span>
          </div>

          {/* Title */}
          <h2
            className="text-black mb-6"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 300,
              fontSize: 'clamp(1.8rem, 3.8vw, 3.2rem)',
              lineHeight: 1.08,
              letterSpacing: '-0.01em',
            }}
          >
            {service.title}
          </h2>

          {/* Description */}
          <p
            className="tracking-[0.18em] leading-[1.9] uppercase text-gray-400 mb-10"
            style={{ fontSize: 'clamp(10px, 2.4vw, 11px)' }}
          >
            {service.description}
          </p>

          {/* Features */}
          <div className="flex flex-col gap-3 mb-10">
            {service.features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle size={13} strokeWidth={1.5} className="text-black shrink-0" />
                <span
                  className="tracking-[0.18em] uppercase text-gray-600"
                  style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
                >
                  {f}
                </span>
              </div>
            ))}
          </div>

          <div className="w-full h-px bg-gray-100 mb-10" />

          {/* CTA */}
          <a
            href="https://wash2door.in/bookin/"
            className="relative inline-flex items-center gap-2 tracking-[0.22em] uppercase
                       text-white bg-black border border-black px-7 py-4 no-underline
                       overflow-hidden group rounded-[5px]"
            style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
          >
            <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
            <span className="relative z-10 group-hover:text-black transition-colors duration-500">{service.cta}</span>
            <ArrowUpRight size={13} strokeWidth={1.5} className="relative z-10 group-hover:text-black transition-colors duration-500" />
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Page ──
export default function ServicesPage() {
  const heroRef = useRef(null)
  const navRef = useRef(null)

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

  // Service nav animation
  useEffect(() => {
    let ctx
    const init = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (!navRef.current) return
      ctx = gsap.context(() => {
        gsap.fromTo(
          navRef.current.children,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: navRef.current, start: 'top 90%' },
          }
        )
      })
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
                What We Offer
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
              Our Services
            </h1>
            <p
              className="tracking-[0.18em] leading-[1.9] uppercase text-white/50 max-w-lg mb-12"
              style={{ fontSize: 'clamp(10px, 2.4vw, 11px)' }}
            >
              Professional cleaning delivered to your doorstep in Duliajan, Assam — every day, 9 AM to 5 PM.
            </p>

            {/* Quick jump links */}
            <div ref={navRef} className="flex flex-wrap gap-3">
              {SERVICES.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="relative tracking-[0.22em] uppercase text-white border border-white/30
                             px-5 py-2.5 no-underline overflow-hidden group rounded-[3px]"
                  style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
                >
                  <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                  <span className="relative z-10 group-hover:text-black transition-colors duration-500">{s.title}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Services list ── */}
      <section className="w-full bg-white">
        <div className="max-w-6xl mx-auto px-8 md:px-16">
          {SERVICES.map((service, i) => (
            <ServiceSection key={service.id} service={service} index={i} />
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="w-full bg-black py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-8 md:px-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="block w-6 h-px bg-white/30 shrink-0" />
                <span
                  className="tracking-[0.4em] uppercase text-white/50"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(9px, 2.2vw, 11px)' }}
                >
                  Ready to Book?
                </span>
              </div>
              <h2
                className="text-white"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 300,
                  fontSize: 'clamp(1.8rem, 4vw, 3.5rem)',
                  lineHeight: 1.08,
                  letterSpacing: '-0.01em',
                }}
              >
                Book a Service Today
              </h2>
            </div>
            <div className="flex flex-wrap gap-4 md:mb-1">
              <a
                href="https://wash2door.in/bookin/"
                className="relative flex items-center gap-2 tracking-[0.22em] uppercase
                           text-black bg-white border border-white px-7 py-4 no-underline
                           overflow-hidden group rounded-[5px]"
                style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
              >
                <span className="absolute inset-0 bg-black origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                <span className="relative z-10 group-hover:text-white transition-colors duration-500">Book Now</span>
                <ArrowUpRight size={13} strokeWidth={1.5} className="relative z-10 group-hover:text-white transition-colors duration-500" />
              </a>
              <a
                href="tel:6900706456"
                className="relative flex items-center gap-2 tracking-[0.22em] uppercase
                           text-white border border-white/30 px-7 py-4 no-underline
                           overflow-hidden group rounded-[5px]"
                style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
              >
                <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                <span className="relative z-10 group-hover:text-black transition-colors duration-500">6900706456</span>
              </a>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}