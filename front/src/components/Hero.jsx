"use client"

import { useEffect, useRef } from 'react'
import { ArrowUpRight, Phone } from 'lucide-react'

const stats = [
    { value: '100+', label: 'Cars Cleaned' },
    { value: '4.8★', label: 'Star Rating' },
    { value: '2hr', label: 'Avg Service' },
]

const BG_IMAGE =
    'https://images.unsplash.com/photo-1550355291-bbee04a92027?q=90&w=2400&auto=format&fit=crop'

export default function Hero() {
    const sectionRef = useRef(null)
    const bgRef = useRef(null)
    const eyebrowRef = useRef(null)
    const badgeRef = useRef(null)
    const linesRef = useRef([])
    const rightRef = useRef(null)
    const mobileContentRef = useRef(null)
    const statsRef = useRef(null)
    const desktopStatsRef = useRef(null)
    const accentRef = useRef(null)
    const dividerRef = useRef(null)
    const servicesRef = useRef(null)

    useEffect(() => {
        let ctx
        const init = async () => {
            const { default: gsap } = await import('gsap')
            if (!sectionRef.current) return

            ctx = gsap.context(() => {
                const tl = gsap.timeline({
                    defaults: { ease: 'power3.out' },
                })

                // Background
                if (bgRef.current) {
                    tl.fromTo(bgRef.current,
                        { opacity: 0, scale: 1.08 },
                        { opacity: 1, scale: 1, duration: 1.5, ease: 'power2.out' },
                        0
                    )
                }

                // Eyebrow
                if (eyebrowRef.current) {
                    tl.fromTo(eyebrowRef.current,
                        { opacity: 0, x: -20 },
                        { opacity: 1, x: 0, duration: 0.6 },
                        0.3
                    )
                }

                // Badge
                if (badgeRef.current) {
                    tl.fromTo(badgeRef.current,
                        { opacity: 0, y: -10 },
                        { opacity: 1, y: 0, duration: 0.5 },
                        0.4
                    )
                }

                // Headline lines
                linesRef.current.forEach((line, i) => {
                    if (line) {
                        tl.fromTo(line,
                            { opacity: 0, y: 80 },
                            { opacity: 1, y: 0, duration: 0.9 },
                            0.5 + i * 0.12
                        )
                    }
                })

                // Right content / mobile content
                if (rightRef.current) {
                    tl.fromTo(rightRef.current,
                        { opacity: 0, y: 30 },
                        { opacity: 1, y: 0, duration: 0.7 },
                        0.9
                    )
                }
                if (mobileContentRef.current) {
                    tl.fromTo(mobileContentRef.current,
                        { opacity: 0, y: 30 },
                        { opacity: 1, y: 0, duration: 0.7 },
                        0.9
                    )
                }

                // Accent line
                if (accentRef.current) {
                    tl.fromTo(accentRef.current,
                        { scaleY: 0 },
                        { scaleY: 1, duration: 1.2, ease: 'power2.inOut' },
                        0.3
                    )
                }

                // Divider
                if (dividerRef.current) {
                    tl.fromTo(dividerRef.current,
                        { scaleX: 0, transformOrigin: 'left' },
                        { scaleX: 1, duration: 0.8 },
                        1.0
                    )
                }

                // Stats
                if (statsRef.current) {
                    tl.fromTo(
                        statsRef.current.querySelectorAll('[data-stat]'),
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
                        1.1
                    )
                }
                if (desktopStatsRef.current) {
                    tl.fromTo(
                        desktopStatsRef.current.querySelectorAll('[data-stat]'),
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
                        1.1
                    )
                }

                // Services link
                if (servicesRef.current) {
                    tl.fromTo(servicesRef.current,
                        { opacity: 0 },
                        { opacity: 1, duration: 0.5 },
                        1.3
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
            className="relative w-full min-h-screen overflow-hidden bg-[#080808]"
        >
            {/* ── Background ── */}
            <div ref={bgRef} className="opacity-0 absolute inset-0">
                <img
                    src={BG_IMAGE}
                    alt="Premium car detailing"
                    className="w-full h-full object-cover"
                    style={{ filter: 'brightness(0.35) contrast(1.1) saturate(0.85)' }}
                />
            </div>

            {/* ── Overlays ── */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808]
                                via-[#080808]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/80
                                via-[#080808]/30 to-transparent" />
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b
                                from-[#080808]/70 to-transparent" />
            </div>

            {/* ── Left accent line (desktop) ── */}
            <div
                ref={accentRef}
                className="absolute left-0 top-0 w-[2px] h-full origin-top hidden md:block"
                style={{
                    background: 'linear-gradient(to bottom, transparent 10%, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.15) 70%, transparent 90%)',
                }}
            />

            {/* ── Watermark ── */}
            <div
                className="absolute -right-4 -bottom-6 select-none pointer-events-none
                           hidden lg:block"
                style={{
                    fontFamily: 'Georgia, serif',
                    fontWeight: 300,
                    fontSize: '20vw',
                    lineHeight: 1,
                    color: 'rgba(255,255,255,0.02)',
                    letterSpacing: '-0.04em',
                }}
            >
                W2D
            </div>

            {/* ═══════════════════════════
                MOBILE
            ═══════════════════════════ */}
            <div className="relative z-10 min-h-screen flex flex-col md:hidden
                            px-5 py-6">

                {/* Top bar */}
                <header className="flex items-center justify-between mb-auto">
                    <div ref={eyebrowRef} className="opacity-0 flex items-center gap-3">
                        <span
                            className="tracking-[0.3em] uppercase text-white/50"
                            style={{ fontFamily: 'Georgia, serif', fontSize: '9px' }}
                        >
                            Duliajan
                        </span>
                    </div>

                    <div
                        ref={badgeRef}
                        className="opacity-0 flex items-center gap-2 px-3.5 py-2 border
                                   border-white/10 rounded-full bg-white/5 backdrop-blur-sm"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full
                                             rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-full w-full
                                             bg-green-400" />
                        </span>
                        <span
                            className="tracking-[0.2em] uppercase text-white/60"
                            style={{ fontSize: '9px' }}
                        >
                            Open · 9–5
                        </span>
                    </div>
                </header>

                {/* Content — bottom aligned */}
                <div className="mt-auto">
                    {/* Headline */}
                    <div className="mb-8">
                        {['The Shine', 'That Finds', 'You.'].map((text, i) => (
                            <div key={i} className="overflow-hidden">
                                <h1
                                    ref={el => linesRef.current[i] = el}
                                    className={`opacity-0 ${i === 1 ? 'text-white/40 italic' : 'text-white'}`}
                                    style={{
                                        fontFamily: 'Georgia, "Times New Roman", serif',
                                        fontWeight: 300,
                                        fontSize: 'clamp(3rem, 14vw, 5rem)',
                                        lineHeight: 0.93,
                                        letterSpacing: '-0.03em',
                                    }}
                                >
                                    {text}
                                </h1>
                            </div>
                        ))}
                    </div>

                    {/* Description + CTAs */}
                    <div ref={mobileContentRef} className="opacity-0">
                        <p
                            className="text-white/35 leading-[1.7] mb-6 max-w-[280px]"
                            style={{ fontSize: '12px', letterSpacing: '0.03em' }}
                        >
                            Professional car & home cleaning at your doorstep —
                            fast, safe & hassle-free.
                        </p>

                        <div className="flex flex-col gap-3">
                            <a
                                href="/bookings"
                                className="group relative flex items-center justify-center gap-3
                                           px-7 py-4 border border-white/20 overflow-hidden
                                           rounded-[5px] min-h-[52px]
                                           active:scale-[0.98] transition-all duration-200"
                            >
                                <span className="absolute inset-0 bg-white origin-bottom scale-y-0
                                                 group-hover:scale-y-100 transition-transform
                                                 duration-500 ease-out" />
                                <span
                                    className="relative z-10 tracking-[0.2em] uppercase text-white
                                               group-hover:text-black transition-colors duration-500"
                                    style={{ fontSize: '10px' }}
                                >
                                    Book Now
                                </span>
                                <ArrowUpRight
                                    size={14}
                                    strokeWidth={1.5}
                                    className="relative z-10 text-white group-hover:text-black
                                               transition-colors duration-500"
                                />
                            </a>

                            <a
                                href="https://wa.me/916900706456?text=Hi%2C%20I%27d%20like%20to%20book%20a%20car%20wash"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-center gap-2.5 py-3.5
                                           min-h-[48px] active:opacity-70 transition-opacity duration-200"
                            >
                                <Phone size={13} strokeWidth={1.5} className="text-white/30" />
                                <span
                                    className="tracking-[0.18em] uppercase text-white/30"
                                    style={{ fontSize: '10px' }}
                                >
                                    WhatsApp Us
                                </span>
                            </a>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <div ref={statsRef} className="flex justify-between">
                            {stats.map((stat, i) => (
                                <div key={i} data-stat className="opacity-0">
                                    <p
                                        className="text-white leading-none"
                                        style={{
                                            fontFamily: 'Georgia, serif',
                                            fontWeight: 300,
                                            fontSize: '24px',
                                        }}
                                    >
                                        {stat.value}
                                    </p>
                                    <p
                                        className="tracking-[0.2em] uppercase text-white/25 mt-1.5"
                                        style={{ fontSize: '8px' }}
                                    >
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════
                DESKTOP
            ═══════════════════════════ */}
            <div className="relative z-10 min-h-screen hidden md:flex flex-col
                            px-14 lg:px-20 xl:px-24 py-10">

                {/* Top bar */}
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-6 h-px bg-white/30" />
                        <span
                            className="tracking-[0.3em] uppercase text-white/50"
                            style={{ fontFamily: 'Georgia, serif', fontSize: '11px' }}
                        >
                            Doorstep Car Care · Duliajan
                        </span>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 border border-white/10
                                    rounded-full bg-white/5 backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full
                                             rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-full w-full
                                             bg-green-400" />
                        </span>
                        <span
                            className="tracking-[0.2em] uppercase text-white/60"
                            style={{ fontSize: '10px' }}
                        >
                            Open · 9AM – 5PM
                        </span>
                    </div>
                </header>

                {/* Main content — vertically centered */}
                <div className="flex-1 flex items-center">
                    <div className="w-full">
                        {/* Headline — full width */}
                        <div className="mb-12 lg:mb-16">
                            {['The Shine', 'That Finds', 'You.'].map((text, i) => (
                                <div key={i} className="overflow-hidden">
                                    <h1
                                        ref={el => linesRef.current[i + 3] = el}
                                        className={`opacity-0 ${i === 1 ? 'text-white/40 italic' : 'text-white'}`}
                                        style={{
                                            fontFamily: 'Georgia, "Times New Roman", serif',
                                            fontWeight: 300,
                                            fontSize: 'clamp(4.5rem, 10vw, 9rem)',
                                            lineHeight: 0.92,
                                            letterSpacing: '-0.03em',
                                        }}
                                    >
                                        {text}
                                    </h1>
                                </div>
                            ))}
                        </div>

                        {/* Bottom row: description + CTAs on left, stats on right */}
                        <div ref={rightRef} className="opacity-0">
                            <div className="flex items-end justify-between gap-16">
                                {/* Left: description + CTAs */}
                                <div className="flex items-end gap-10 lg:gap-14">
                                    {/* Divider */}
                                    <div className="w-px h-24 bg-gradient-to-b from-white/20
                                                    to-transparent shrink-0 hidden lg:block" />

                                    <div>
                                        <p
                                            className="tracking-[0.15em] uppercase text-white/35
                                                       leading-[1.9] mb-6 max-w-sm"
                                            style={{ fontSize: '11px' }}
                                        >
                                            Professional car & home cleaning at your doorstep —
                                            fast, safe & hassle-free.
                                        </p>

                                        <div className="flex items-center gap-4">
                                            <a
                                                href="/bookings"
                                                className="group relative inline-flex items-center
                                                           justify-center gap-3 px-8 py-4 border
                                                           border-white/20 overflow-hidden
                                                           hover:border-white/40
                                                           transition-all duration-300"
                                            >
                                                <span className="absolute inset-0 bg-white origin-bottom
                                                                 scale-y-0 group-hover:scale-y-100
                                                                 transition-transform duration-500
                                                                 ease-out" />
                                                <span
                                                    className="relative z-10 tracking-[0.2em] uppercase
                                                               text-white group-hover:text-black
                                                               transition-colors duration-500"
                                                    style={{ fontSize: '11px' }}
                                                >
                                                    Book Now
                                                </span>
                                                <ArrowUpRight
                                                    size={14}
                                                    strokeWidth={1.5}
                                                    className="relative z-10 text-white
                                                               group-hover:text-black
                                                               transition-all duration-500
                                                               group-hover:translate-x-0.5
                                                               group-hover:-translate-y-0.5"
                                                />
                                            </a>

                                            <a
                                                href="https://wa.me/916900706456?text=Hi%2C%20I%27d%20like%20to%20book%20a%20car%20wash"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group inline-flex items-center gap-2 py-3
                                                           text-white/30 hover:text-green-400
                                                           transition-colors duration-300"
                                            >
                                                <Phone size={13} strokeWidth={1.5}
                                                    className="group-hover:rotate-12
                                                               transition-transform duration-300" />
                                                <span
                                                    className="tracking-[0.18em] uppercase"
                                                    style={{ fontSize: '10px' }}
                                                >
                                                    WhatsApp Us
                                                </span>
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: stats */}
                                <div ref={desktopStatsRef}
                                    className="flex items-end gap-10 lg:gap-14 shrink-0">
                                    {stats.map((stat, i) => (
                                        <div key={i} data-stat className="opacity-0 text-right">
                                            <p
                                                className="text-white leading-none"
                                                style={{
                                                    fontFamily: 'Georgia, serif',
                                                    fontWeight: 300,
                                                    fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                                                }}
                                            >
                                                {stat.value}
                                            </p>
                                            <p
                                                className="tracking-[0.25em] uppercase text-white/25 mt-2"
                                                style={{ fontSize: '9px' }}
                                            >
                                                {stat.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <footer className="mt-auto pt-6">
                    <div
                        ref={dividerRef}
                        className="w-full h-px bg-white/10 mb-5 origin-left"
                    />
                    <div ref={servicesRef} className="opacity-0 flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            {['Car Wash', 'Sofa Cleaning', 'Water Tank'].map((s, i) => (
                                <a
                                    key={i}
                                    href="/Services"
                                    className="tracking-[0.2em] uppercase text-white/20
                                               hover:text-white/50 transition-colors duration-300
                                               no-underline"
                                    style={{ fontSize: '9px' }}
                                >
                                    {s}
                                </a>
                            ))}
                        </div>

                        <a
                            href="/Services"
                            className="flex items-center gap-3 text-white/25 hover:text-white/60
                                       transition-colors duration-300 group"
                        >
                            <span
                                className="tracking-[0.25em] uppercase"
                                style={{ fontSize: '9px' }}
                            >
                                All Services
                            </span>
                            <span className="h-px bg-current w-5 group-hover:w-10
                                             transition-all duration-300" />
                        </a>
                    </div>
                </footer>
            </div>
        </section>
    )
}