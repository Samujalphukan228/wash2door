"use client"

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { getPublicServices } from '@/lib/services.api'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUpRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

// ── fallback if API is down ──
const FALLBACK_SERVICES = [
  {
    _id: '1',
    name: 'Car Wash',
    shortDescription: 'Full exterior & interior cleaning at your doorstep.',
    category: 'basic',
    startingPrice: 299,
    primaryImage: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?q=80&w=800&auto=format&fit=crop',
  },
  {
    _id: '2',
    name: 'Sofa Cleaning',
    shortDescription: 'Deep fabric clean that brings your sofa back to life.',
    category: 'standard',
    startingPrice: 499,
    primaryImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
  },
  {
    _id: '3',
    name: 'Water Tank Cleaning',
    shortDescription: 'Hygienic, germ-free tank cleaning you can count on.',
    category: 'premium',
    startingPrice: 799,
    primaryImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
  },
]

const CATEGORY_LABEL = {
  basic:    'Essential',
  standard: 'Standard',
  premium:  'Premium',
}

// ── Skeleton card ──
function SkeletonCard() {
  return (
    <div className="flex flex-col border border-gray-100 overflow-hidden">
      <div className="h-64 bg-gray-100 animate-pulse" />
      <div className="p-7 flex flex-col gap-4">
        <div className="h-2 w-16 bg-gray-100 animate-pulse" />
        <div className="h-4 w-36 bg-gray-100 animate-pulse" />
        <div className="h-2 w-full bg-gray-100 animate-pulse" />
        <div className="h-2 w-3/4 bg-gray-100 animate-pulse" />
        <div className="mt-4 h-10 w-full bg-gray-100 animate-pulse" />
      </div>
    </div>
  )
}

// ── Single service card ──
function ServiceCard({ service, index }) {
  const cardRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        delay: index * 0.12,
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 88%',
        },
      }
    )
  }, [index])

  const image = service.primaryImage || service.images?.[0]?.url

  return (
    <div
      ref={cardRef}
      className="opacity-0 group flex flex-col border border-gray-200 overflow-hidden
                 hover:border-black transition-colors duration-500 cursor-pointer"
    >
      {/* image */}
      <div className="relative h-64 overflow-hidden bg-gray-50">
        {image ? (
          <img
            src={image}
            alt={service.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-[9px] tracking-[0.28em] uppercase text-gray-300">No Image</span>
          </div>
        )}

        {/* category pill */}
        <div className="absolute top-4 left-4 bg-white px-3 py-1.5">
          <span className="text-[8px] tracking-[0.3em] uppercase text-gray-500">
            {CATEGORY_LABEL[service.category] ?? service.category}
          </span>
        </div>
      </div>

      {/* body */}
      <div className="flex flex-col flex-1 p-7">

        {/* name */}
        <h3
          className="text-[15px] text-black mb-3 tracking-[0.04em]"
          style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
        >
          {service.name}
        </h3>

        {/* description */}
        <p className="text-[10.5px] tracking-[0.12em] leading-6 uppercase text-gray-400 flex-1">
          {service.shortDescription}
        </p>

        {/* divider */}
        <div className="w-full h-px bg-gray-100 my-6" />

        {/* price + cta row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[8px] tracking-[0.28em] uppercase text-gray-400 mb-1">Starting from</p>
            <p
              className="text-[18px] text-black"
              style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
            >
              ₹{service.startingPrice}
            </p>
          </div>

          <a
            href="https://wash2door.in/bookin/"
            className="relative flex items-center gap-2 text-[9.5px] tracking-[0.22em] uppercase
                       text-white bg-black border border-black px-5 py-3
                       no-underline overflow-hidden group/btn"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover/btn:scale-y-100 transition-transform duration-500 ease-out" />
            <span className="relative z-10 group-hover/btn:text-black transition-colors duration-500">Book</span>
            <ArrowUpRight
              size={12}
              strokeWidth={1.5}
              className="relative z-10 group-hover/btn:text-black transition-colors duration-500"
            />
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Main section ──
export default function Services() {
  const [services, setServices]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(false)

  const headingRef  = useRef(null)
  const eyebrowRef  = useRef(null)
  const ruleRef     = useRef(null)

  useEffect(() => {
    // fetch from backend
    getPublicServices()
      .then((data) => {
        setServices(Array.isArray(data) ? data : FALLBACK_SERVICES)
      })
      .catch(() => {
        setError(true)
        setServices(FALLBACK_SERVICES)
      })
      .finally(() => setLoading(false))
  }, [])

  // heading animation on scroll
  useEffect(() => {
    if (loading) return
    const tl = gsap.timeline({
      scrollTrigger: { trigger: headingRef.current, start: 'top 85%' },
      defaults: { ease: 'power3.out' },
    })
    tl.fromTo(eyebrowRef.current,  { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.5 })
      .fromTo(headingRef.current,  { opacity: 0, y: 30  }, { opacity: 1, y: 0, duration: 0.7 }, 0.1)
      .fromTo(ruleRef.current,     { scaleX: 0, transformOrigin: 'left' }, { scaleX: 1, duration: 0.6 }, 0.3)
  }, [loading])

  return (
    <section
      className="w-full bg-white py-24 md:py-32"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-8 md:px-16">

        {/* ── heading block ── */}
        <div className="mb-16 md:mb-20">
          <div ref={eyebrowRef} className="flex items-center gap-3 mb-6 opacity-0">
            <span className="block w-6 h-px bg-black shrink-0" />
            <span
              className="text-[9px] tracking-[0.4em] uppercase text-gray-400"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              What We Offer
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2
              ref={headingRef}
              className="opacity-0 text-black"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: 'clamp(2rem, 4vw, 3.8rem)',
                lineHeight: 1.08,
                letterSpacing: '-0.01em',
              }}
            >
              Our Services
            </h2>

            <a
              href="https://wash2door.in/services/"
              className="hidden md:flex items-center gap-3 text-[9px] tracking-[0.28em] uppercase
                         text-gray-400 no-underline hover:text-black transition-colors duration-300 group mb-2"
            >
              View All
              <span className="block h-px bg-gray-300 w-5 group-hover:w-10 group-hover:bg-black transition-all duration-300" />
            </a>
          </div>

          <div ref={ruleRef} className="w-full h-px bg-gray-100 mt-8 opacity-0" style={{ opacity: 1 }} />
        </div>

        {/* ── cards grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : (
          <>
            {error && (
              <p className="text-[9px] tracking-[0.28em] uppercase text-gray-300 mb-8">
                · Showing default services
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map((service, i) => (
                <ServiceCard key={service._id} service={service} index={i} />
              ))}
            </div>
          </>
        )}

        {/* ── mobile view all ── */}
        <div className="mt-12 flex md:hidden">
          <a
            href="https://wash2door.in/services/"
            className="relative flex items-center gap-3 text-[10px] tracking-[0.22em] uppercase
                       text-black border border-black px-7 py-3.5 no-underline overflow-hidden group"
          >
            <span className="absolute inset-0 bg-black origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
            <span className="relative z-10 group-hover:text-white transition-colors duration-500">View All Services</span>
            <ArrowUpRight size={13} strokeWidth={1.5} className="relative z-10 group-hover:text-white transition-colors duration-500" />
          </a>
        </div>

      </div>
    </section>
  )
}