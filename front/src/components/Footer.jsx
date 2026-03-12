"use client"

import { useEffect, useRef } from 'react'
import {
    MapPin, Phone, Mail, Clock, Instagram, Facebook, ChevronUp,
} from 'lucide-react'

const QUICK_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/About' },
    { label: 'Services', href: '/Services' },
    { label: 'Contact', href: '/Contact/' },
    { label: 'Book Now', href: '/Bookings' },
]

const SERVICES = [
    { label: 'Car Wash', href: '/Services' },
    { label: 'Sofa Cleaning', href: '/Services' },
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
        text: 'Mon – Sun · 9:00 AM – 5:00 PM',
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
    const bottomRef = useRef(null)

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

    useEffect(() => {
        let ctx
        const init = async () => {
            const { default: gsap } = await import('gsap')
            const { ScrollTrigger } = await import('gsap/ScrollTrigger')
            gsap.registerPlugin(ScrollTrigger)

            ctx = gsap.context(() => {
                // Grid columns
                if (gridRef.current) {
                    gsap.fromTo(
                        gridRef.current.children,
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1, y: 0, duration: 0.7, stagger: 0.12,
                            ease: 'power3.out',
                            scrollTrigger: { trigger: gridRef.current, start: 'top 88%' },
                        }
                    )
                }

                // Divider
                if (dividerRef.current) {
                    gsap.fromTo(
                        dividerRef.current,
                        { scaleX: 0 },
                        {
                            scaleX: 1, duration: 0.8, ease: 'power3.out',
                            scrollTrigger: { trigger: dividerRef.current, start: 'top 92%' },
                        }
                    )
                }

                // Bottom bar
                if (bottomRef.current) {
                    gsap.fromTo(
                        bottomRef.current,
                        { opacity: 0, y: 15 },
                        {
                            opacity: 1, y: 0, duration: 0.5, ease: 'power3.out',
                            scrollTrigger: { trigger: bottomRef.current, start: 'top 95%' },
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
            {/* ═══ Mobile Footer ═══ */}
            <div className="md:hidden">
                <div className="px-5 pt-12 pb-8">

                    {/* Brand */}
                    <div className="mb-10">
                        <a href="/" className="inline-block no-underline group mb-5">
                            <div
                                className="tracking-[0.42em] uppercase text-white
                                           group-active:opacity-60 transition-opacity duration-200"
                                style={{
                                    fontFamily: 'Georgia, "Times New Roman", serif',
                                    fontWeight: 300,
                                    fontSize: '20px',
                                }}
                            >
                                WASH2DOOR
                            </div>
                            <div
                                className="tracking-[0.25em] uppercase text-white/30 mt-1"
                                style={{ fontSize: '9px' }}
                            >
                                The Shine That Finds You
                            </div>
                        </a>

                        <p
                            className="text-white/30 leading-[1.7] max-w-[280px]"
                            style={{ fontSize: '11px', letterSpacing: '0.03em' }}
                        >
                            Professional car wash, sofa cleaning, and water tank cleaning
                            services right at your doorstep.
                        </p>
                    </div>

                    {/* Quick links + Services side by side */}
                    <div className="grid grid-cols-2 gap-8 mb-10">
                        <div>
                            <h4
                                className="tracking-[0.3em] uppercase text-white/20 mb-4"
                                style={{ fontSize: '9px' }}
                            >
                                Quick Links
                            </h4>
                            <nav className="flex flex-col gap-0.5">
                                {QUICK_LINKS.map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        className="tracking-[0.12em] uppercase text-white/40
                                                   active:text-white transition-colors duration-200
                                                   no-underline py-2 min-h-[40px] flex items-center"
                                        style={{ fontSize: '10px' }}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </nav>
                        </div>

                        <div>
                            <h4
                                className="tracking-[0.3em] uppercase text-white/20 mb-4"
                                style={{ fontSize: '9px' }}
                            >
                                Services
                            </h4>
                            <nav className="flex flex-col gap-0.5">
                                {SERVICES.map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        className="tracking-[0.12em] uppercase text-white/40
                                                   active:text-white transition-colors duration-200
                                                   no-underline py-2 min-h-[40px] flex items-center"
                                        style={{ fontSize: '10px' }}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Contact info */}
                    <div className="mb-8">
                        <h4
                            className="tracking-[0.3em] uppercase text-white/20 mb-4"
                            style={{ fontSize: '9px' }}
                        >
                            Contact
                        </h4>
                        <div className="space-y-3">
                            {CONTACT_INFO.map((item, i) => {
                                const Icon = item.icon
                                const inner = (
                                    <div className="flex items-start gap-3">
                                        <Icon size={13} strokeWidth={1.5}
                                            className="text-white/20 mt-0.5 shrink-0" />
                                        <span
                                            className={`leading-[1.5] ${item.href
                                                    ? 'text-white/40 active:text-white'
                                                    : 'text-white/30'
                                                }`}
                                            style={{ fontSize: '11px', letterSpacing: '0.03em' }}
                                        >
                                            {item.text}
                                        </span>
                                    </div>
                                )
                                return item.href ? (
                                    <a key={i} href={item.href}
                                        className="block no-underline py-1 min-h-[40px]
                                                   flex items-center">
                                        {inner}
                                    </a>
                                ) : (
                                    <div key={i} className="py-1">{inner}</div>
                                )
                            })}
                        </div>
                    </div>

                    {/* WhatsApp + Socials row */}
                    <div className="flex items-center gap-3 mb-10">
                        <a
                            href="https://wa.me/916900706456?text=Hi%2C%20I%20want%20to%20book%20a%20service"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2.5 bg-white/10
                                       border border-white/15 text-white px-5 py-3.5
                                       no-underline rounded-[5px] min-h-[48px]
                                       active:bg-white active:text-black
                                       transition-all duration-200"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            <span
                                className="tracking-[0.18em] uppercase"
                                style={{ fontSize: '10px' }}
                            >
                                WhatsApp
                            </span>
                        </a>

                        {SOCIALS.map((s) => {
                            const Icon = s.icon
                            return (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.label}
                                    className="w-12 h-12 border border-white/15 flex items-center
                                               justify-center rounded-[3px] shrink-0
                                               active:bg-white active:border-white
                                               transition-all duration-200 group"
                                >
                                    <Icon
                                        size={16}
                                        strokeWidth={1.5}
                                        className="text-white/40 group-active:text-black
                                                   transition-colors duration-200"
                                    />
                                </a>
                            )
                        })}
                    </div>

                    {/* Bottom divider */}
                    <div className="h-px bg-white/10 mb-6" />

                    {/* Bottom row */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className="tracking-[0.15em] uppercase text-white/20"
                                style={{ fontSize: '9px' }}
                            >
                                © {new Date().getFullYear()} Wash2Door
                            </p>
                            <a
                                href="https://nexxupp.com"
                                className="no-underline block mt-1"
                            >
                                <p
                                    className="tracking-[0.15em] uppercase text-white/15
                                               active:text-white/30 transition-colors duration-200"
                                    style={{ fontSize: '8px' }}
                                >
                                    Made by Nexxupp
                                </p>
                            </a>
                        </div>

                        <button
                            onClick={scrollToTop}
                            className="w-10 h-10 border border-white/15 flex items-center
                                       justify-center rounded-[3px]
                                       active:bg-white active:border-white
                                       transition-all duration-200 group"
                            aria-label="Back to top"
                        >
                            <ChevronUp
                                size={16}
                                strokeWidth={1.5}
                                className="text-white/40 group-active:text-black
                                           transition-colors duration-200"
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══ Desktop Footer ═══ */}
            <div className="hidden md:block">
                <div className="max-w-6xl mx-auto px-16 py-24">
                    <div
                        ref={gridRef}
                        className="grid grid-cols-12 gap-8"
                    >
                        {/* Brand column */}
                        <div className="col-span-5 opacity-0">
                            <a href="/" className="inline-block mb-6 no-underline group">
                                <div
                                    className="tracking-[0.42em] uppercase text-white
                                               group-hover:opacity-60 transition-opacity duration-300"
                                    style={{
                                        fontFamily: 'Georgia, "Times New Roman", serif',
                                        fontWeight: 300,
                                        fontSize: '24px',
                                    }}
                                >
                                    WASH2DOOR
                                </div>
                                <div
                                    className="tracking-[0.3em] uppercase text-white/30 mt-1"
                                    style={{ fontSize: '10px' }}
                                >
                                    The Shine That Finds You
                                </div>
                            </a>

                            <p
                                className="tracking-[0.18em] leading-[1.9] uppercase text-white/30
                                           mb-10 max-w-xs"
                                style={{ fontSize: '11px' }}
                            >
                                Professional car wash, sofa cleaning, and water tank cleaning
                                services right at your doorstep. Fast, safe, and hassle-free.
                            </p>

                            {/* Contact info */}
                            <div className="space-y-4 mb-10">
                                {CONTACT_INFO.map((item, i) => {
                                    const Icon = item.icon
                                    const inner = (
                                        <div className="flex items-start gap-3 group/item">
                                            <Icon size={13} strokeWidth={1.5}
                                                className="text-white/20 mt-0.5 shrink-0" />
                                            <span
                                                className={`tracking-[0.12em] uppercase leading-5 ${item.href
                                                        ? 'text-white/40 group-hover/item:text-white transition-colors duration-300'
                                                        : 'text-white/30'
                                                    }`}
                                                style={{ fontSize: '11px' }}
                                            >
                                                {item.text}
                                            </span>
                                        </div>
                                    )
                                    return item.href ? (
                                        <a key={i} href={item.href} className="block no-underline">
                                            {inner}
                                        </a>
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
                                            className="w-10 h-10 border border-white/15 flex items-center
                                                       justify-center hover:border-white hover:bg-white
                                                       group transition-all duration-300 rounded-[3px]"
                                        >
                                            <Icon
                                                size={15}
                                                strokeWidth={1.5}
                                                className="text-white/50 group-hover:text-black
                                                           transition-colors duration-300"
                                            />
                                        </a>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="col-span-3 opacity-0">
                            <h4
                                className="tracking-[0.3em] uppercase text-white/20 mb-6"
                                style={{ fontSize: '10px' }}
                            >
                                Quick Links
                            </h4>
                            <nav className="flex flex-col gap-1">
                                {QUICK_LINKS.map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        className="tracking-[0.15em] uppercase text-white/40
                                                   hover:text-white transition-colors duration-300
                                                   no-underline py-1.5"
                                        style={{ fontSize: '11px' }}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </nav>
                        </div>

                        {/* Services + WhatsApp */}
                        <div className="col-span-4 opacity-0">
                            <h4
                                className="tracking-[0.3em] uppercase text-white/20 mb-6"
                                style={{ fontSize: '10px' }}
                            >
                                Our Services
                            </h4>
                            <nav className="flex flex-col gap-1 mb-10">
                                {SERVICES.map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        className="tracking-[0.15em] uppercase text-white/40
                                                   hover:text-white transition-colors duration-300
                                                   no-underline py-1.5"
                                        style={{ fontSize: '11px' }}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </nav>

                            <h4
                                className="tracking-[0.3em] uppercase text-white/20 mb-4"
                                style={{ fontSize: '10px' }}
                            >
                                Book via WhatsApp
                            </h4>
                            <a
                                href="https://wa.me/916900706456?text=Hi%2C%20I%20want%20to%20book%20a%20service"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 bg-white/5 border border-white/15
                                           hover:bg-white hover:border-white text-white hover:text-black
                                           px-5 py-3 no-underline transition-all duration-300
                                           rounded-[5px] group"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor"
                                    className="w-4 h-4 shrink-0">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                <span
                                    className="tracking-[0.2em] uppercase"
                                    style={{ fontSize: '10px' }}
                                >
                                    Chat on WhatsApp
                                </span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="max-w-6xl mx-auto px-16">
                    <div
                        ref={dividerRef}
                        className="h-px bg-white/10 origin-left"
                    />
                </div>

                {/* Bottom bar */}
                <div
                    ref={bottomRef}
                    className="opacity-0 max-w-6xl mx-auto px-16 py-6"
                >
                    <div className="flex items-center justify-between">
                        <p
                            className="tracking-[0.2em] uppercase text-white/20"
                            style={{ fontSize: '10px' }}
                        >
                            © {new Date().getFullYear()} Wash2Door. All rights reserved.
                        </p>

                        <a href="https://nexxupp.com" className="no-underline">
                            <p
                                className="tracking-[0.2em] uppercase text-white/15
                                           hover:text-white/30 transition-colors duration-300"
                                style={{ fontSize: '10px' }}
                            >
                                Made by Nexxupp
                            </p>
                        </a>

                        <button
                            onClick={scrollToTop}
                            className="w-10 h-10 border border-white/15 flex items-center
                                       justify-center hover:border-white hover:bg-white
                                       group transition-all duration-300 rounded-[3px]"
                            aria-label="Back to top"
                        >
                            <ChevronUp
                                size={16}
                                strokeWidth={1.5}
                                className="text-white/40 group-hover:text-black
                                           transition-colors duration-300"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    )
}