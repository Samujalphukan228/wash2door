"use client"

import { useState, useEffect, useRef } from 'react'
import { Phone, MapPin, Menu, User, LogIn, ChevronDown } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import TopBar from './TopBar'
import MobileDrawer from './MobileDrawer'
import AuthModal from './AuthModal'

const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/About' },
    { label: 'Services', href: '/services' },
    { label: 'My Bookings', href: '/my-bookings' },
    { label: 'Contact', href: '/Contact' },
]

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const { user, loading, openModal, logout } = useAuth()
    const dropdownRef = useRef(null)
    const navRef = useRef(null)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const handleProtectedClick = (e, href) => {
        if (href === '/my-bookings' && !user) {
            e.preventDefault()
            openModal('login')
        }
    }

    return (
        <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
            <TopBar />

            <nav
                ref={navRef}
                className={`bg-white sticky top-0 z-50 transition-all duration-500 ${
                    scrolled
                        ? 'shadow-[0_2px_20px_rgba(0,0,0,0.06)]'
                        : 'border-b border-gray-100'
                }`}
            >
                {/* ═══ Mobile ═══ */}
                <div className="md:hidden">
                    <div className="flex items-center justify-between px-4 h-[56px]">
                        {/* Hamburger */}
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="w-10 h-10 flex items-center justify-center -ml-1
                                       active:bg-gray-100 rounded-full transition-colors duration-200"
                            aria-label="Open menu"
                        >
                            <div className="flex flex-col gap-[5px]">
                                <span className="block w-[18px] h-px bg-black" />
                                <span className="block w-[14px] h-px bg-black" />
                            </div>
                        </button>

                        {/* Logo */}
                        <a
                            href="/"
                            className="absolute left-1/2 -translate-x-1/2 text-center
                                       leading-none no-underline"
                        >
                            <div
                                className="tracking-[0.35em] uppercase text-black"
                                style={{
                                    fontFamily: 'Georgia, "Times New Roman", serif',
                                    fontWeight: 300,
                                    fontSize: '14px',
                                }}
                            >
                                WASH2DOOR
                            </div>
                        </a>

                        {/* Right icon */}
                        {loading ? (
                            <div className="w-10 h-10 flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-gray-200
                                                border-t-black rounded-full animate-spin" />
                            </div>
                        ) : user ? (
                            <button
                                onClick={() => setMobileOpen(true)}
                                className="w-10 h-10 flex items-center justify-center
                                           active:bg-gray-100 rounded-full
                                           transition-colors duration-200"
                                aria-label="Account"
                            >
                                <div className="w-7 h-7 rounded-full bg-black flex items-center
                                                justify-center">
                                    <span
                                        className="text-white"
                                        style={{
                                            fontFamily: 'Georgia, serif',
                                            fontSize: '11px',
                                            fontWeight: 300,
                                        }}
                                    >
                                        {user.firstName?.charAt(0)}
                                    </span>
                                </div>
                            </button>
                        ) : (
                            <button
                                onClick={() => openModal('login')}
                                className="w-10 h-10 flex items-center justify-center
                                           active:bg-gray-100 rounded-full
                                           transition-colors duration-200"
                                aria-label="Sign In"
                            >
                                <LogIn size={17} strokeWidth={1.5} className="text-black" />
                            </button>
                        )}
                    </div>
                </div>

                {/* ═══ Desktop ═══ */}
                <div className="hidden md:block">
                    {/* Main bar */}
                    <div className="flex items-center justify-between px-10 lg:px-14 h-[72px]">
                        {/* Left: Location */}
                        <div className="flex items-center gap-2 min-w-[180px]">
                            <MapPin size={12} strokeWidth={1.5} className="text-gray-300" />
                            <span
                                className="tracking-[0.18em] uppercase text-gray-400"
                                style={{ fontSize: '10px' }}
                            >
                                Duliajan, Assam
                            </span>
                        </div>

                        {/* Center: Logo */}
                        <a
                            href="/"
                            className="absolute left-1/2 -translate-x-1/2 text-center
                                       leading-none no-underline group"
                        >
                            <div
                                className="tracking-[0.42em] uppercase text-black
                                           group-hover:opacity-60 transition-opacity duration-300"
                                style={{
                                    fontFamily: 'Georgia, "Times New Roman", serif',
                                    fontWeight: 300,
                                    fontSize: '26px',
                                }}
                            >
                                WASH2DOOR
                            </div>
                            <div
                                className="tracking-[0.3em] uppercase text-gray-300 mt-1"
                                style={{ fontSize: '9px' }}
                            >
                                The Shine That Finds You
                            </div>
                        </a>

                        {/* Right: Phone + User */}
                        <div className="flex items-center gap-5 min-w-[180px] justify-end">
                            <a
                                href="tel:6900706456"
                                className="flex items-center gap-1.5 no-underline
                                           text-gray-400 hover:text-black
                                           transition-colors duration-300"
                            >
                                <Phone size={12} strokeWidth={1.5} />
                                <span
                                    className="tracking-[0.18em] uppercase"
                                    style={{ fontSize: '10px' }}
                                >
                                    6900706456
                                </span>
                            </a>

                            {/* User section */}
                            {loading ? (
                                <div className="w-9 h-9 flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-gray-200
                                                    border-t-black rounded-full animate-spin" />
                                </div>
                            ) : user ? (
                                <div ref={dropdownRef} className="relative">
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-2.5 px-3 py-1.5
                                                   hover:bg-gray-50 rounded-[3px]
                                                   transition-colors duration-200"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-black
                                                        flex items-center justify-center">
                                            <span
                                                className="text-white"
                                                style={{
                                                    fontFamily: 'Georgia, serif',
                                                    fontSize: '11px',
                                                    fontWeight: 300,
                                                }}
                                            >
                                                {user.firstName?.charAt(0)}
                                            </span>
                                        </div>
                                        <span
                                            className="tracking-[0.15em] uppercase text-black"
                                            style={{ fontSize: '10px' }}
                                        >
                                            {user.firstName}
                                        </span>
                                        <ChevronDown
                                            size={12}
                                            strokeWidth={1.5}
                                            className={`text-gray-400 transition-transform
                                                       duration-200 ${
                                                dropdownOpen ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>

                                    {/* Dropdown */}
                                    <div
                                        className={`absolute right-0 top-full mt-2 w-52 bg-white
                                                   border border-gray-200 rounded-[5px]
                                                   shadow-[0_8px_30px_rgba(0,0,0,0.08)]
                                                   transition-all duration-200 z-50 overflow-hidden
                                                   ${dropdownOpen
                                                ? 'opacity-100 visible translate-y-0'
                                                : 'opacity-0 invisible -translate-y-2'
                                            }`}
                                    >
                                        {/* User info header */}
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p
                                                className="text-black"
                                                style={{
                                                    fontFamily: 'Georgia, serif',
                                                    fontSize: '13px',
                                                    fontWeight: 400,
                                                }}
                                            >
                                                {user.firstName} {user.lastName}
                                            </p>
                                            {user.email && (
                                                <p
                                                    className="text-gray-400 mt-0.5 truncate"
                                                    style={{ fontSize: '10px' }}
                                                >
                                                    {user.email}
                                                </p>
                                            )}
                                        </div>

                                        <a
                                            href="/profile"
                                            className="flex items-center px-4 py-3
                                                       tracking-[0.15em] uppercase text-black
                                                       hover:bg-gray-50 transition-colors
                                                       no-underline"
                                            style={{ fontSize: '10px' }}
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            My Profile
                                        </a>
                                        <a
                                            href="/my-bookings"
                                            className="flex items-center px-4 py-3
                                                       tracking-[0.15em] uppercase text-black
                                                       hover:bg-gray-50 transition-colors
                                                       no-underline border-t border-gray-50"
                                            style={{ fontSize: '10px' }}
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            My Bookings
                                        </a>
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false)
                                                logout()
                                            }}
                                            className="w-full text-left px-4 py-3
                                                       tracking-[0.15em] uppercase text-red-500
                                                       hover:bg-red-50 transition-colors
                                                       border-t border-gray-100"
                                            style={{ fontSize: '10px' }}
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => openModal('login')}
                                    className="flex items-center gap-2 px-4 py-2
                                               tracking-[0.18em] uppercase text-black
                                               border border-gray-200 hover:border-black
                                               hover:bg-black hover:text-white
                                               transition-all duration-300 rounded-[3px]"
                                    style={{ fontSize: '10px' }}
                                >
                                    <LogIn size={13} strokeWidth={1.5} />
                                    <span>Sign In</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Nav links */}
                    <div className="flex items-center justify-center border-t border-gray-100
                                    h-[42px]">
                        {navLinks.map((link, i) => (
                            <a
                                key={link.label}
                                href={link.href}
                                onClick={(e) => handleProtectedClick(e, link.href)}
                                className="relative flex items-center h-[42px] px-5 lg:px-7
                                           tracking-[0.2em] uppercase text-black no-underline
                                           group"
                                style={{ fontSize: '10px' }}
                            >
                                {link.label}
                                <span className="absolute bottom-0 left-5 right-5 lg:left-7
                                                 lg:right-7 h-[2px] bg-black origin-center
                                                 scale-x-0 group-hover:scale-x-100
                                                 transition-transform duration-300 ease-out" />
                            </a>
                        ))}
                    </div>
                </div>
            </nav>

            <MobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
            <AuthModal />
        </div>
    )
}