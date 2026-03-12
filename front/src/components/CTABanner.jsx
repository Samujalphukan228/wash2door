"use client"

import { useEffect, useRef } from 'react'
import { ArrowUpRight, Phone, Clock } from 'lucide-react'

export default function CTABanner() {
    const sectionRef = useRef(null)
    const contentRef = useRef(null)
    const imageRef = useRef(null)
    const badgeRef = useRef(null)

    useEffect(() => {
        let ctx
        const init = async () => {
            const { default: gsap } = await import('gsap')
            const { ScrollTrigger } = await import('gsap/ScrollTrigger')
            gsap.registerPlugin(ScrollTrigger)
            if (!sectionRef.current) return

            ctx = gsap.context(() => {
                // Content
                if (contentRef.current) {
                    gsap.fromTo(
                        contentRef.current.children,
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1, y: 0, duration: 0.7, stagger: 0.1,
                            ease: 'power3.out',
                            scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
                        }
                    )
                }

                // Image
                if (imageRef.current) {
                    gsap.fromTo(
                        imageRef.current,
                        { opacity: 0, scale: 1.08 },
                        {
                            opacity: 1, scale: 1, duration: 1, ease: 'power3.out',
                            scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
                        }
                    )
                }

                // Badge
                if (badgeRef.current) {
                    gsap.fromTo(
                        badgeRef.current,
                        { opacity: 0, y: 20 },
                        {
                            opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.5,
                            scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
                        }
                    )
                }
            })
        }
        init()
        return () => ctx?.revert()
    }, [])

    return (
        <section
            ref={sectionRef}
            className="w-full bg-black"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
        >
            {/* ═══ Mobile ═══ */}
            <div className="md:hidden">
                {/* Image */}
                <div ref={imageRef} className="opacity-0 relative h-56 overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=800&auto=format&fit=crop"
                        alt="Professional car wash"
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />

                    {/* Price badge on image */}
                    <div
                        ref={badgeRef}
                        className="opacity-0 absolute bottom-4 right-4 bg-white px-4 py-3 rounded-[3px]"
                    >
                        <p
                            className="text-black leading-none mb-0.5"
                            style={{
                                fontFamily: 'Georgia, "Times New Roman", serif',
                                fontWeight: 300,
                                fontSize: '24px',
                            }}
                        >
                            ₹299
                        </p>
                        <p
                            className="tracking-[0.2em] uppercase text-gray-500"
                            style={{ fontSize: '8px' }}
                        >
                            Starting Price
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div ref={contentRef} className="px-5 py-10">
                    {/* Eyebrow */}
                    <div className="flex items-center gap-3 mb-5">
                        <span className="block w-6 h-px bg-white/30 shrink-0" />
                        <span
                            className="tracking-[0.4em] uppercase text-white/40"
                            style={{
                                fontFamily: 'Georgia, "Times New Roman", serif',
                                fontSize: '9px',
                            }}
                        >
                            Get Started Today
                        </span>
                    </div>

                    {/* Heading */}
                    <h2
                        className="text-white mb-4"
                        style={{
                            fontFamily: 'Georgia, "Times New Roman", serif',
                            fontWeight: 300,
                            fontSize: '28px',
                            lineHeight: 1.15,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Ready for a<br />Spotless Car?
                    </h2>

                    {/* Description */}
                    <p
                        className="text-white/40 leading-[1.7] mb-6 max-w-xs"
                        style={{ fontSize: '12px', letterSpacing: '0.03em' }}
                    >
                        Book your professional car wash in under 2 minutes.
                        We come to you — anytime, anywhere.
                    </p>

                    {/* Info pills */}
                    <div className="flex gap-3 mb-8">
                        <div className="flex items-center gap-2 border border-white/10 px-3.5 py-2.5
                                        rounded-[3px]">
                            <Clock size={12} strokeWidth={1.5} className="text-white/40 shrink-0" />
                            <span
                                className="tracking-[0.15em] uppercase text-white/60"
                                style={{ fontSize: '9px' }}
                            >
                                8 AM – 6 PM
                            </span>
                        </div>
                        <div className="flex items-center gap-2 border border-white/10 px-3.5 py-2.5
                                        rounded-[3px]">
                            <Phone size={12} strokeWidth={1.5} className="text-white/40 shrink-0" />
                            <span
                                className="tracking-[0.15em] uppercase text-white/60"
                                style={{ fontSize: '9px' }}
                            >
                                6900706456
                            </span>
                        </div>
                    </div>

                    {/* CTA buttons — stacked on mobile */}
                    <div className="flex flex-col gap-3">
                        <a
                            href="/bookings"
                            className="relative flex items-center justify-center gap-2.5
                                       tracking-[0.22em] uppercase text-black bg-white
                                       border border-white px-7 py-4 no-underline
                                       overflow-hidden group rounded-[5px] min-h-[52px]
                                       active:scale-[0.98] transition-all duration-200"
                            style={{ fontSize: '10px' }}
                        >
                            <span className="absolute inset-0 bg-black origin-bottom scale-y-0
                                             group-hover:scale-y-100 transition-transform
                                             duration-500 ease-out" />
                            <span className="relative z-10 group-hover:text-white
                                             transition-colors duration-500">
                                Book Now
                            </span>
                            <ArrowUpRight
                                size={13}
                                strokeWidth={1.5}
                                className="relative z-10 group-hover:text-white
                                           transition-colors duration-500"
                            />
                        </a>

                        <a
                            href="tel:6900706456"
                            className="relative flex items-center justify-center gap-2.5
                                       tracking-[0.22em] uppercase text-white
                                       border border-white/20 px-7 py-4 no-underline
                                       overflow-hidden group rounded-[5px] min-h-[52px]
                                       active:scale-[0.98] transition-all duration-200"
                            style={{ fontSize: '10px' }}
                        >
                            <span className="absolute inset-0 bg-white origin-bottom scale-y-0
                                             group-hover:scale-y-100 transition-transform
                                             duration-500 ease-out" />
                            <span className="relative z-10 group-hover:text-black
                                             transition-colors duration-500">
                                Call Us
                            </span>
                            <Phone
                                size={13}
                                strokeWidth={1.5}
                                className="relative z-10 group-hover:text-black
                                           transition-colors duration-500"
                            />
                        </a>
                    </div>
                </div>
            </div>

            {/* ═══ Desktop ═══ */}
            <div className="hidden md:block">
                <div className="max-w-6xl mx-auto px-16">
                    <div className="grid grid-cols-2 gap-16 items-center">

                        {/* Content */}
                        <div ref={!contentRef.current ? undefined : null} className="py-24">
                            <div className="space-y-0">
                                {/* Eyebrow */}
                                <div className="flex items-center gap-3 mb-8">
                                    <span className="block w-6 h-px bg-white/30 shrink-0" />
                                    <span
                                        className="tracking-[0.4em] uppercase text-white/40"
                                        style={{
                                            fontFamily: 'Georgia, "Times New Roman", serif',
                                            fontSize: '10px',
                                        }}
                                    >
                                        Get Started Today
                                    </span>
                                </div>

                                {/* Heading */}
                                <h2
                                    className="text-white mb-6"
                                    style={{
                                        fontFamily: 'Georgia, "Times New Roman", serif',
                                        fontWeight: 300,
                                        fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
                                        lineHeight: 1.15,
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    Ready for a Spotless Car?
                                </h2>

                                {/* Description */}
                                <p
                                    className="tracking-[0.18em] leading-[1.9] uppercase text-white/40
                                               mb-10 max-w-md"
                                    style={{ fontSize: '11px' }}
                                >
                                    Book your professional car wash in under 2 minutes.
                                    We come to you — anytime, anywhere.
                                </p>

                                {/* Info pills */}
                                <div className="flex gap-4 mb-10">
                                    <div className="flex items-center gap-2 border border-white/10
                                                    px-4 py-2.5 rounded-[3px]">
                                        <Clock size={13} strokeWidth={1.5}
                                            className="text-white/40 shrink-0" />
                                        <span
                                            className="tracking-[0.2em] uppercase text-white/60"
                                            style={{ fontSize: '10px' }}
                                        >
                                            Open 8 AM – 6 PM
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 border border-white/10
                                                    px-4 py-2.5 rounded-[3px]">
                                        <Phone size={13} strokeWidth={1.5}
                                            className="text-white/40 shrink-0" />
                                        <span
                                            className="tracking-[0.2em] uppercase text-white/60"
                                            style={{ fontSize: '10px' }}
                                        >
                                            6900706456
                                        </span>
                                    </div>
                                </div>

                                {/* CTA Buttons */}
                                <div className="flex gap-4">
                                    <a
                                        href="/bookings"
                                        className="relative flex items-center gap-2 tracking-[0.22em]
                                                   uppercase text-black bg-white border border-white
                                                   px-7 py-4 no-underline overflow-hidden group
                                                   rounded-[5px]"
                                        style={{ fontSize: '11px' }}
                                    >
                                        <span className="absolute inset-0 bg-black origin-bottom
                                                         scale-y-0 group-hover:scale-y-100
                                                         transition-transform duration-500 ease-out" />
                                        <span className="relative z-10 group-hover:text-white
                                                         transition-colors duration-500">
                                            Book Now
                                        </span>
                                        <ArrowUpRight
                                            size={13}
                                            strokeWidth={1.5}
                                            className="relative z-10 group-hover:text-white
                                                       transition-colors duration-500"
                                        />
                                    </a>

                                    <a
                                        href="tel:6900706456"
                                        className="relative flex items-center gap-2 tracking-[0.22em]
                                                   uppercase text-white border border-white/20
                                                   px-7 py-4 no-underline overflow-hidden group
                                                   rounded-[5px]"
                                        style={{ fontSize: '11px' }}
                                    >
                                        <span className="absolute inset-0 bg-white origin-bottom
                                                         scale-y-0 group-hover:scale-y-100
                                                         transition-transform duration-500 ease-out" />
                                        <span className="relative z-10 group-hover:text-black
                                                         transition-colors duration-500">
                                            Call Us
                                        </span>
                                        <Phone
                                            size={13}
                                            strokeWidth={1.5}
                                            className="relative z-10 group-hover:text-black
                                                       transition-colors duration-500"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="relative h-full min-h-[500px] overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=800&auto=format&fit=crop"
                                alt="Professional car wash"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent" />

                            {/* Price badge */}
                            <div className="absolute bottom-8 right-8 bg-white px-5 py-4 rounded-[3px]">
                                <p
                                    className="text-black leading-none mb-1"
                                    style={{
                                        fontFamily: 'Georgia, "Times New Roman", serif',
                                        fontWeight: 300,
                                        fontSize: '28px',
                                    }}
                                >
                                    ₹299
                                </p>
                                <p
                                    className="tracking-[0.25em] uppercase text-gray-500"
                                    style={{ fontSize: '9px' }}
                                >
                                    Starting Price
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}