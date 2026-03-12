"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import {
    User, Mail, Calendar, Car, Settings, Lock, Trash2,
    Edit2, Save, X, ChevronRight, Star, Clock, CheckCircle,
    XCircle, Loader2, Eye, EyeOff, ArrowUpRight, Shield,
    Phone, MapPin, Timer, AlertCircle, ChevronDown
} from 'lucide-react'
import {
    getUserProfile, updateUserProfile, changePassword,
    getUserBookings, getUserStats, deactivateAccount
} from '@/lib/user.api'

// ─── Scroll Lock ───
function useScrollLock(isLocked) {
    useEffect(() => {
        if (isLocked) {
            const scrollY = window.scrollY
            document.body.style.position = 'fixed'
            document.body.style.top = `-${scrollY}px`
            document.body.style.left = '0'
            document.body.style.right = '0'
            document.body.style.overflow = 'hidden'
            document.body.style.width = '100%'
            return () => {
                document.body.style.position = ''
                document.body.style.top = ''
                document.body.style.left = ''
                document.body.style.right = ''
                document.body.style.overflow = ''
                document.body.style.width = ''
                window.scrollTo(0, scrollY)
            }
        }
    }, [isLocked])
}

// ─── Status Config ───
const STATUS_CONFIG = {
    pending: { label: 'Pending', dot: 'bg-yellow-400', icon: Clock },
    confirmed: { label: 'Confirmed', dot: 'bg-blue-400', icon: CheckCircle },
    'in-progress': { label: 'In Progress', dot: 'bg-purple-400', icon: Loader2 },
    completed: { label: 'Completed', dot: 'bg-green-500', icon: CheckCircle },
    cancelled: { label: 'Cancelled', dot: 'bg-red-400', icon: XCircle },
}

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50
                         border border-gray-100 rounded-[3px]">
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            <span className="text-[9px] tracking-[0.15em] uppercase text-gray-600">
                {cfg.label}
            </span>
        </span>
    )
}

// ─── Modal ───
function ModalWrapper({ isOpen, onClose, children }) {
    useScrollLock(isOpen)
    const modalRef = useRef(null)

    useEffect(() => {
        if (!isOpen || !modalRef.current) return
        let ctx
        const init = async () => {
            const { default: gsap } = await import('gsap')
            ctx = gsap.context(() => {
                gsap.fromTo(modalRef.current,
                    { y: '100%', opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out' }
                )
            })
        }
        init()
        return () => ctx?.revert()
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                       bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                ref={modalRef}
                className="relative w-full sm:max-w-lg bg-white sm:rounded-[5px]
                           rounded-t-[16px] max-h-[92vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sm:hidden flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 bg-gray-200 rounded-full" />
                </div>
                <div className="max-h-[85vh] overflow-y-auto overscroll-contain">
                    {children}
                </div>
            </div>
        </div>
    )
}

// ─── Deactivate Modal ───
function DeactivateModal({ isOpen, onClose, onConfirm, loading }) {
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <div className="w-12 h-12 border border-red-200 bg-red-50 rounded-full
                                flex items-center justify-center mb-5">
                    <AlertCircle size={24} className="text-red-500" strokeWidth={1.5} />
                </div>
                <h2
                    className="text-black mb-2"
                    style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontSize: '22px' }}
                >
                    Deactivate Account?
                </h2>
                <p className="text-gray-500 leading-relaxed mb-6" style={{ fontSize: '12px' }}>
                    Once deactivated, you will not be able to access your account or bookings.
                    Contact support to reactivate.
                </p>
                <div className="mb-6">
                    <label className="block text-[9px] tracking-[0.25em] uppercase text-gray-400 mb-2">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full px-4 pr-12 py-3.5 border border-gray-200 rounded-[5px]
                                       text-[12px] text-black placeholder-gray-300
                                       focus:outline-none focus:border-black transition-colors duration-300"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-3.5 border border-gray-200 rounded-[5px]
                                   text-[10px] tracking-[0.2em] uppercase text-black
                                   min-h-[48px] active:scale-[0.98] transition-all duration-200
                                   disabled:opacity-50"
                    >
                        Keep Account
                    </button>
                    <button
                        onClick={() => onConfirm(password)}
                        disabled={loading || !password}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5
                                   bg-red-600 text-white rounded-[5px]
                                   text-[10px] tracking-[0.2em] uppercase min-h-[48px]
                                   active:scale-[0.98] transition-all duration-200
                                   disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <>
                                <Trash2 size={14} strokeWidth={2} />
                                Deactivate
                            </>
                        )}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    )
}

// ─── Stat Card ───
function StatCard({ value, label, icon: Icon }) {
    return (
        <div className="border border-gray-100 rounded-[5px] p-4 text-center
                        hover:border-gray-300 transition-colors duration-300">
            {Icon && (
                <div className="w-9 h-9 border border-gray-200 rounded-full
                                flex items-center justify-center mx-auto mb-3">
                    <Icon size={16} strokeWidth={1.5} className="text-gray-400" />
                </div>
            )}
            <p
                className="text-black leading-none"
                style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontSize: '22px' }}
            >
                {value}
            </p>
            <p className="text-[8px] tracking-[0.2em] uppercase text-gray-400 mt-2">
                {label}
            </p>
        </div>
    )
}

// ─── Mobile Booking Card ───
function MobileBookingCard({ booking, onClick }) {
    const bookingDate = new Date(booking.bookingDate)
    const isUpcoming = bookingDate > new Date() && !['cancelled', 'completed'].includes(booking.status)

    const formatDate = (date) => {
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        if (date.toDateString() === today.toDateString()) return 'Today'
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
        return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
    }

    return (
        <button
            onClick={onClick}
            className="w-full text-left border border-gray-200 rounded-[5px] overflow-hidden
                       active:scale-[0.98] transition-all duration-200 bg-white"
        >
            {/* Black top strip */}
            <div className="relative bg-black px-5 py-4 overflow-hidden">
                <span
                    className="absolute -top-2 -right-1 text-white/[0.05] select-none pointer-events-none"
                    style={{ fontFamily: 'Georgia, serif', fontSize: '60px', fontWeight: 300, lineHeight: 1 }}
                >
                    {'\u20B9'}{booking.price}
                </span>

                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h3
                            className="text-white mb-1 truncate max-w-[200px]"
                            style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '16px' }}
                        >
                            {booking.serviceName}
                        </h3>
                        <p className="text-white/40" style={{ fontSize: '10px', letterSpacing: '0.1em' }}>
                            {booking.bookingCode}
                        </p>
                    </div>
                    <div className="text-right">
                        <p
                            className="text-white"
                            style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontSize: '20px' }}
                        >
                            {'\u20B9'}{booking.price}
                        </p>
                    </div>
                </div>

                {isUpcoming && (
                    <span className="absolute top-3 right-3 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-full w-full bg-green-500" />
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                    <StatusBadge status={booking.status} />
                    <span className="text-[10px] text-gray-400 tracking-[0.1em] uppercase">
                        {booking.vehicleTypeName}
                    </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1.5">
                        <Calendar size={12} strokeWidth={1.5} className="text-gray-300" />
                        {formatDate(bookingDate)}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock size={12} strokeWidth={1.5} className="text-gray-300" />
                        {booking.timeSlot}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Timer size={12} strokeWidth={1.5} className="text-gray-300" />
                        {booking.duration}m
                    </span>
                </div>
            </div>
        </button>
    )
}

// ─── Desktop Booking Card ───
function DesktopBookingCard({ booking, onClick }) {
    const bookingDate = new Date(booking.bookingDate)
    const isUpcoming = bookingDate > new Date() && !['cancelled', 'completed'].includes(booking.status)

    const formatDate = (date) => {
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        if (date.toDateString() === today.toDateString()) return 'Today'
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
        return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
    }

    return (
        <button
            onClick={onClick}
            className="w-full text-left group border border-gray-200 rounded-[5px] overflow-hidden
                       hover:border-black hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]
                       transition-all duration-300 bg-white"
        >
            <div className="p-6 flex items-center gap-6">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <StatusBadge status={booking.status} />
                        <span className="text-[10px] tracking-[0.1em] text-gray-300 font-mono uppercase">
                            {booking.bookingCode}
                        </span>
                        {isUpcoming && (
                            <span className="relative flex h-2 w-2 ml-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-full w-full bg-green-500" />
                            </span>
                        )}
                    </div>
                    <h3
                        className="text-black truncate mb-1"
                        style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '17px' }}
                    >
                        {booking.serviceName}
                    </h3>
                    <p className="text-[11px] text-gray-400 tracking-[0.1em] uppercase">
                        {booking.vehicleTypeName}
                    </p>
                </div>

                <div className="hidden lg:flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 px-3 py-2 border border-gray-100 rounded-[3px]">
                        <Calendar size={12} strokeWidth={1.5} className="text-gray-400" />
                        <span className="text-[11px] text-black">{formatDate(bookingDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-2 border border-gray-100 rounded-[3px]">
                        <Clock size={12} strokeWidth={1.5} className="text-gray-400" />
                        <span className="text-[11px] text-black">{booking.timeSlot}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-2 border border-gray-100 rounded-[3px]">
                        <Timer size={12} strokeWidth={1.5} className="text-gray-400" />
                        <span className="text-[11px] text-black">{booking.duration} min</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                    <p
                        className="text-black"
                        style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontSize: '24px' }}
                    >
                        {'\u20B9'}{booking.price}
                    </p>
                    <ChevronRight
                        size={16}
                        strokeWidth={1.5}
                        className="text-gray-300 group-hover:text-black transition-colors duration-300"
                    />
                </div>
            </div>
        </button>
    )
}

// ─── Input Field ───
function InputField({ label, icon: Icon, disabled, hint, ...props }) {
    return (
        <div>
            <label className="block text-[9px] tracking-[0.25em] uppercase text-gray-400 mb-2">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon size={15} strokeWidth={1.5}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                )}
                <input
                    disabled={disabled}
                    className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 border text-[12px]
                               tracking-[0.05em] rounded-[5px] focus:outline-none
                               transition-all duration-300 min-h-[48px]
                               ${disabled
                            ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'border-gray-200 bg-white text-black focus:border-black hover:border-gray-300'
                        }`}
                    {...props}
                />
            </div>
            {hint && (
                <p className="text-[9px] tracking-[0.1em] text-gray-300 mt-2">{hint}</p>
            )}
        </div>
    )
}

// ─── Password Field ───
function PasswordField({ label, showPassword, onToggle, ...props }) {
    return (
        <div>
            <label className="block text-[9px] tracking-[0.25em] uppercase text-gray-400 mb-2">
                {label}
            </label>
            <div className="relative">
                <Lock size={15} strokeWidth={1.5}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-11 pr-12 py-3.5 border border-gray-200 text-[12px]
                               tracking-[0.05em] text-black bg-white placeholder-gray-300
                               focus:outline-none focus:border-black hover:border-gray-300
                               transition-colors duration-300 rounded-[5px] min-h-[48px]"
                    {...props}
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300
                               active:text-gray-600 transition-colors"
                >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════

export default function ProfilePage() {
    const { user, loading: authLoading, logout, checkAuth } = useAuth()
    const router = useRouter()

    const [activeTab, setActiveTab] = useState('profile')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [profile, setProfile] = useState(null)
    const [stats, setStats] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({ firstName: '', lastName: '' })

    const [passwordData, setPasswordData] = useState({
        currentPassword: '', newPassword: '', confirmNewPassword: ''
    })
    const [showPasswords, setShowPasswords] = useState(false)

    const [bookings, setBookings] = useState([])
    const [bookingsLoading, setBookingsLoading] = useState(false)

    const [showDeactivateModal, setShowDeactivateModal] = useState(false)

    const contentRef = useRef(null)
    const headerRef = useRef(null)

    // Auth redirect
    useEffect(() => {
        if (!authLoading && !user) router.push('/')
    }, [user, authLoading, router])

    // Fetch data
    useEffect(() => {
        if (user) { fetchProfile(); fetchStats() }
    }, [user])

    useEffect(() => {
        if (user && activeTab === 'bookings') fetchBookings()
    }, [user, activeTab])

    // Auto clear messages
    useEffect(() => {
        if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t) }
    }, [success])

    useEffect(() => {
        if (error) { const t = setTimeout(() => setError(''), 5000); return () => clearTimeout(t) }
    }, [error])

    // Content animation on tab change
    useEffect(() => {
        let ctx
        const init = async () => {
            const { default: gsap } = await import('gsap')
            if (!contentRef.current) return
            ctx = gsap.context(() => {
                gsap.fromTo(contentRef.current,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
                )
            })
        }
        init()
        return () => ctx?.revert()
    }, [activeTab])

    // Header animation
    useEffect(() => {
        if (loading) return
        let ctx
        const init = async () => {
            const { default: gsap } = await import('gsap')
            if (!headerRef.current) return
            ctx = gsap.context(() => {
                gsap.fromTo(headerRef.current.children,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
                )
            })
        }
        init()
        return () => ctx?.revert()
    }, [loading])

    // ─── API calls ───

    const fetchProfile = async () => {
        try {
            setLoading(true)
            const data = await getUserProfile()
            setProfile(data)
            setFormData({ firstName: data.firstName || '', lastName: data.lastName || '' })
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const data = await getUserStats()
            setStats(data)
        } catch (err) {
            console.error('Stats error:', err)
        }
    }

    const fetchBookings = async () => {
        try {
            setBookingsLoading(true)
            const data = await getUserBookings()
            setBookings(data.bookings || [])
        } catch (err) {
            console.error('Bookings error:', err)
        } finally {
            setBookingsLoading(false)
        }
    }

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setSaving(true)
        try {
            await updateUserProfile(formData)
            setSuccess('Profile updated successfully')
            setIsEditing(false)
            await checkAuth()
            await fetchProfile()
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (passwordData.newPassword.length < 8) {
            setError('Min 8 characters required')
            return
        }
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            setError('Passwords do not match')
            return
        }
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
        if (!regex.test(passwordData.newPassword)) {
            setError('Must contain uppercase, lowercase, number & special char')
            return
        }

        setSaving(true)
        try {
            await changePassword(
                passwordData.currentPassword,
                passwordData.newPassword,
                passwordData.confirmNewPassword
            )
            setSuccess('Password changed successfully')
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDeactivateAccount = async (password) => {
        if (!password) { setError('Enter your password'); return }
        setSaving(true)
        setError('')
        try {
            await deactivateAccount(password)
            logout()
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    const switchTab = (id) => {
        setActiveTab(id)
        setError('')
        setSuccess('')
    }

    // ─── Loading / Auth guard ───

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 size={28} className="animate-spin text-gray-300" />
            </div>
        )
    }

    if (!user) return null

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'bookings', label: 'Bookings', icon: Car },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'settings', label: 'Settings', icon: Settings },
    ]

    return (
        <div
            className="min-h-screen bg-white pb-20 sm:pb-0"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
        >
            {/* ── Header ── */}
            <div className="bg-black">
                <div className="max-w-5xl mx-auto px-5 md:px-16">
                    <div ref={headerRef} className="pt-20 pb-8 md:pt-24 md:pb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="block w-6 h-px bg-white/30 shrink-0" />
                            <span
                                className="tracking-[0.4em] uppercase text-white/40"
                                style={{ fontFamily: 'Georgia, serif', fontSize: '9px' }}
                            >
                                Account
                            </span>
                        </div>

                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <h1
                                    className="text-white mb-2"
                                    style={{
                                        fontFamily: 'Georgia, serif',
                                        fontWeight: 300,
                                        fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                                    }}
                                >
                                    My Account
                                </h1>
                                <p className="text-[10px] tracking-[0.18em] uppercase text-white/30">
                                    Manage your profile & preferences
                                </p>
                            </div>

                            <div className="hidden sm:block">
                                <div className="w-12 h-12 bg-white/10 border border-white/15
                                                rounded-full flex items-center justify-center">
                                    <span
                                        className="text-white"
                                        style={{
                                            fontFamily: 'Georgia, serif',
                                            fontSize: '14px',
                                            fontWeight: 300,
                                        }}
                                    >
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Desktop Tabs ── */}
            <div className="hidden sm:block sticky top-0 z-30 bg-white border-b border-gray-100">
                <div className="max-w-5xl mx-auto px-5 md:px-16">
                    <div className="flex gap-0">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => switchTab(tab.id)}
                                    className={`relative flex items-center gap-2 px-6 py-4
                                               text-[10px] tracking-[0.15em] uppercase
                                               transition-all duration-300 ${
                                        activeTab === tab.id
                                            ? 'text-black'
                                            : 'text-gray-400 hover:text-black'
                                    }`}
                                >
                                    <Icon size={14} strokeWidth={1.5} />
                                    <span>{tab.label}</span>
                                    {activeTab === tab.id && (
                                        <span className="absolute bottom-0 left-0 right-0
                                                         h-[2px] bg-black" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-5xl mx-auto px-5 md:px-16 py-6 md:py-8">

                {/* Messages */}
                {error && (
                    <div className="mb-5 flex items-center gap-3 p-4 border border-red-100
                                    bg-red-50 rounded-[5px]">
                        <AlertCircle size={16} className="text-red-500 shrink-0" />
                        <p className="text-[12px] text-red-600 flex-1">{error}</p>
                        <button onClick={() => setError('')}>
                            <X size={14} className="text-red-400" />
                        </button>
                    </div>
                )}
                {success && (
                    <div className="mb-5 flex items-center gap-3 p-4 border border-green-100
                                    bg-green-50 rounded-[5px]">
                        <CheckCircle size={16} className="text-green-500 shrink-0" />
                        <p className="text-[12px] text-green-600">{success}</p>
                    </div>
                )}

                <div ref={contentRef}>

                    {/* ═══ Profile Tab ═══ */}
                    {activeTab === 'profile' && (
                        <div className="space-y-5 md:space-y-6">

                            {/* User Card */}
                            <div className="border border-gray-200 rounded-[5px] p-5 sm:p-8
                                            hover:border-black transition-colors duration-300">
                                <div className="flex flex-col sm:flex-row items-center
                                                sm:items-start gap-5">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black rounded-full
                                                    flex items-center justify-center shrink-0">
                                        <span
                                            className="text-white"
                                            style={{
                                                fontFamily: 'Georgia, serif',
                                                fontWeight: 300,
                                                fontSize: '22px',
                                            }}
                                        >
                                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                                        </span>
                                    </div>

                                    <div className="text-center sm:text-left flex-1 min-w-0">
                                        <h2
                                            className="text-black"
                                            style={{
                                                fontFamily: 'Georgia, serif',
                                                fontWeight: 300,
                                                fontSize: '22px',
                                            }}
                                        >
                                            {user?.firstName} {user?.lastName}
                                        </h2>
                                        <p className="text-[11px] text-gray-400 mt-1">
                                            {user?.email}
                                        </p>

                                        {stats && (
                                            <div className="flex items-center justify-center
                                                            sm:justify-start gap-5 mt-4">
                                                <div>
                                                    <span
                                                        className="text-black"
                                                        style={{
                                                            fontFamily: 'Georgia, serif',
                                                            fontWeight: 300,
                                                            fontSize: '20px',
                                                        }}
                                                    >
                                                        {stats.bookings?.total || 0}
                                                    </span>
                                                    <span className="text-[9px] tracking-[0.15em]
                                                                     uppercase text-gray-400 ml-1.5">
                                                        Bookings
                                                    </span>
                                                </div>
                                                <div className="w-px h-4 bg-gray-200" />
                                                <div>
                                                    <span
                                                        className="text-black"
                                                        style={{
                                                            fontFamily: 'Georgia, serif',
                                                            fontWeight: 300,
                                                            fontSize: '20px',
                                                        }}
                                                    >
                                                        {'\u20B9'}{stats.totalSpent || 0}
                                                    </span>
                                                    <span className="text-[9px] tracking-[0.15em]
                                                                     uppercase text-gray-400 ml-1.5">
                                                        Spent
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (isEditing) {
                                                setIsEditing(false)
                                                setFormData({
                                                    firstName: profile?.firstName || '',
                                                    lastName: profile?.lastName || '',
                                                })
                                            } else {
                                                setIsEditing(true)
                                            }
                                        }}
                                        className="inline-flex items-center gap-2 px-5 py-2.5
                                                   border border-gray-200 rounded-[5px]
                                                   hover:border-black active:scale-[0.98]
                                                   transition-all duration-300 shrink-0 min-h-[40px]"
                                    >
                                        {isEditing
                                            ? <X size={13} strokeWidth={1.5} />
                                            : <Edit2 size={13} strokeWidth={1.5} />
                                        }
                                        <span className="text-[10px] tracking-[0.15em] uppercase">
                                            {isEditing ? 'Cancel' : 'Edit'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Form */}
                            <div className="border border-gray-200 rounded-[5px] p-5 sm:p-8
                                            hover:border-black transition-colors duration-300">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="block w-4 h-px bg-gray-300" />
                                    <h3 className="text-[9px] tracking-[0.3em] uppercase text-gray-400">
                                        Personal Information
                                    </h3>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <InputField
                                            label="First Name"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({
                                                ...formData, firstName: e.target.value
                                            })}
                                            disabled={!isEditing}
                                        />
                                        <InputField
                                            label="Last Name"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({
                                                ...formData, lastName: e.target.value
                                            })}
                                            disabled={!isEditing}
                                        />
                                    </div>

                                    <InputField
                                        label="Email Address"
                                        icon={Mail}
                                        value={profile?.email || ''}
                                        disabled
                                        hint="Email cannot be changed"
                                    />

                                    <div className="h-px bg-gray-100" />

                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="block w-4 h-px bg-gray-300" />
                                            <h3 className="text-[9px] tracking-[0.3em] uppercase
                                                           text-gray-400">
                                                Account Details
                                            </h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <div className="inline-flex items-center gap-2 px-3 py-2
                                                            border border-gray-100 rounded-[5px]">
                                                <Calendar size={13} strokeWidth={1.5}
                                                    className="text-gray-400" />
                                                <span className="text-[11px] text-black">
                                                    {profile?.createdAt
                                                        ? new Date(profile.createdAt)
                                                            .toLocaleDateString('en-IN', {
                                                                month: 'long', year: 'numeric'
                                                            })
                                                        : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="inline-flex items-center gap-2 px-3 py-2
                                                            border border-gray-100 rounded-[5px]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                <span className="text-[11px] text-black">Active</span>
                                            </div>
                                            <div className="inline-flex items-center gap-2 px-3 py-2
                                                            border border-gray-100 rounded-[5px]">
                                                <CheckCircle size={13} strokeWidth={1.5}
                                                    className="text-green-500" />
                                                <span className="text-[11px] text-black">Verified</span>
                                            </div>
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="group relative w-full sm:w-auto inline-flex
                                                           items-center justify-center gap-2 px-8 py-3.5
                                                           bg-black text-white rounded-[5px] overflow-hidden
                                                           min-h-[48px] active:scale-[0.98]
                                                           transition-all duration-200 disabled:opacity-50"
                                            >
                                                <span className="absolute inset-0 bg-white origin-bottom
                                                                 scale-y-0 group-hover:scale-y-100
                                                                 transition-transform duration-500 ease-out" />
                                                {saving ? (
                                                    <Loader2 size={14}
                                                        className="relative z-10 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Save size={14} strokeWidth={1.5}
                                                            className="relative z-10 group-hover:text-black
                                                                       transition-colors duration-500" />
                                                        <span className="relative z-10 text-[10px]
                                                                         tracking-[0.2em] uppercase
                                                                         group-hover:text-black
                                                                         transition-colors duration-500">
                                                            Save Changes
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    )}

                    {/* ═══ Bookings Tab ═══ */}
                    {activeTab === 'bookings' && (
                        <div>
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <span className="block w-4 h-px bg-gray-300" />
                                    <h2
                                        className="text-black"
                                        style={{
                                            fontFamily: 'Georgia, serif',
                                            fontWeight: 300,
                                            fontSize: '18px',
                                        }}
                                    >
                                        Recent Bookings
                                    </h2>
                                </div>
                                <button
                                    onClick={() => router.push('/my-bookings')}
                                    className="group inline-flex items-center gap-1.5 text-[10px]
                                               tracking-[0.15em] uppercase text-gray-400
                                               hover:text-black transition-colors duration-300"
                                >
                                    View All
                                    <ArrowUpRight size={13} strokeWidth={2}
                                        className="group-hover:translate-x-0.5
                                                   group-hover:-translate-y-0.5
                                                   transition-transform duration-300" />
                                </button>
                            </div>

                            {bookingsLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 size={28} className="animate-spin text-gray-300" />
                                </div>
                            ) : bookings.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16
                                                border border-gray-200 rounded-[5px]">
                                    <div className="w-16 h-16 border border-gray-200 rounded-full
                                                    flex items-center justify-center mb-5">
                                        <Car size={28} strokeWidth={1} className="text-gray-300" />
                                    </div>
                                    <h3
                                        className="text-black mb-2"
                                        style={{
                                            fontFamily: 'Georgia, serif',
                                            fontWeight: 300,
                                            fontSize: '18px',
                                        }}
                                    >
                                        No bookings yet
                                    </h3>
                                    <p className="text-[11px] tracking-[0.15em] uppercase
                                                  text-gray-400 mb-6">
                                        Book your first service today
                                    </p>
                                    <a
                                        href="/bookings"
                                        className="group relative inline-flex items-center gap-2
                                                   px-7 py-4 bg-black text-white rounded-[5px]
                                                   overflow-hidden min-h-[48px]
                                                   active:scale-[0.98] transition-all duration-200"
                                    >
                                        <span className="absolute inset-0 bg-white origin-bottom
                                                         scale-y-0 group-hover:scale-y-100
                                                         transition-transform duration-500 ease-out" />
                                        <span className="relative z-10 text-[10px] tracking-[0.2em]
                                                         uppercase group-hover:text-black
                                                         transition-colors duration-500">
                                            Book Now
                                        </span>
                                        <ArrowUpRight size={14} strokeWidth={1.5}
                                            className="relative z-10 group-hover:text-black
                                                       transition-colors duration-500" />
                                    </a>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {/* Mobile */}
                                    <div className="sm:hidden space-y-3">
                                        {bookings.slice(0, 5).map((b) => (
                                            <MobileBookingCard
                                                key={b._id}
                                                booking={b}
                                                onClick={() => router.push('/my-bookings')}
                                            />
                                        ))}
                                    </div>

                                    {/* Desktop */}
                                    <div className="hidden sm:block space-y-3">
                                        {bookings.slice(0, 5).map((b) => (
                                            <DesktopBookingCard
                                                key={b._id}
                                                booking={b}
                                                onClick={() => router.push('/my-bookings')}
                                            />
                                        ))}
                                    </div>

                                    {bookings.length > 5 && (
                                        <div className="text-center pt-4">
                                            <button
                                                onClick={() => router.push('/my-bookings')}
                                                className="group relative inline-flex items-center gap-2
                                                           px-7 py-3.5 bg-black text-white rounded-[5px]
                                                           overflow-hidden min-h-[48px]
                                                           active:scale-[0.98]
                                                           transition-all duration-200"
                                            >
                                                <span className="absolute inset-0 bg-white origin-bottom
                                                                 scale-y-0 group-hover:scale-y-100
                                                                 transition-transform duration-500
                                                                 ease-out" />
                                                <span className="relative z-10 text-[10px]
                                                                 tracking-[0.2em] uppercase
                                                                 group-hover:text-black
                                                                 transition-colors duration-500">
                                                    View All Bookings
                                                </span>
                                                <ChevronRight size={13} strokeWidth={1.5}
                                                    className="relative z-10 group-hover:text-black
                                                               transition-colors duration-500" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══ Security Tab ═══ */}
                    {activeTab === 'security' && (
                        <div className="border border-gray-200 rounded-[5px] p-5 sm:p-8
                                        hover:border-black transition-colors duration-300">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 border border-gray-200 rounded-full
                                                flex items-center justify-center">
                                    <Shield size={18} strokeWidth={1.5} className="text-gray-400" />
                                </div>
                                <div>
                                    <h2
                                        className="text-black"
                                        style={{
                                            fontFamily: 'Georgia, serif',
                                            fontWeight: 300,
                                            fontSize: '18px',
                                        }}
                                    >
                                        Change Password
                                    </h2>
                                    <p className="text-[10px] tracking-[0.15em] uppercase
                                                  text-gray-400 mt-0.5">
                                        Keep your account secure
                                    </p>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 my-6" />

                            <form onSubmit={handleChangePassword}
                                className="space-y-5 max-w-md">
                                <PasswordField
                                    label="Current Password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({
                                        ...passwordData, currentPassword: e.target.value
                                    })}
                                    showPassword={showPasswords}
                                    onToggle={() => setShowPasswords(!showPasswords)}
                                    placeholder="Enter current password"
                                    required
                                />
                                <PasswordField
                                    label="New Password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({
                                        ...passwordData, newPassword: e.target.value
                                    })}
                                    showPassword={showPasswords}
                                    onToggle={() => setShowPasswords(!showPasswords)}
                                    placeholder="Enter new password"
                                    required
                                />
                                <p className="text-[9px] tracking-[0.1em] text-gray-300 -mt-3">
                                    Min 8 chars &middot; uppercase &middot; lowercase &middot; number &middot; special char
                                </p>
                                <PasswordField
                                    label="Confirm New Password"
                                    value={passwordData.confirmNewPassword}
                                    onChange={(e) => setPasswordData({
                                        ...passwordData, confirmNewPassword: e.target.value
                                    })}
                                    showPassword={showPasswords}
                                    onToggle={() => setShowPasswords(!showPasswords)}
                                    placeholder="Confirm new password"
                                    required
                                />

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="group relative w-full sm:w-auto inline-flex
                                                   items-center justify-center gap-2 px-8 py-3.5
                                                   bg-black text-white rounded-[5px] overflow-hidden
                                                   min-h-[48px] active:scale-[0.98]
                                                   transition-all duration-200 disabled:opacity-50"
                                    >
                                        <span className="absolute inset-0 bg-white origin-bottom
                                                         scale-y-0 group-hover:scale-y-100
                                                         transition-transform duration-500 ease-out" />
                                        {saving ? (
                                            <Loader2 size={14}
                                                className="relative z-10 animate-spin" />
                                        ) : (
                                            <>
                                                <Lock size={14} strokeWidth={1.5}
                                                    className="relative z-10 group-hover:text-black
                                                               transition-colors duration-500" />
                                                <span className="relative z-10 text-[10px]
                                                                 tracking-[0.2em] uppercase
                                                                 group-hover:text-black
                                                                 transition-colors duration-500">
                                                    Update Password
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ═══ Settings Tab ═══ */}
                    {activeTab === 'settings' && (
                        <div className="space-y-5 md:space-y-6">

                            {/* Stats */}
                            {stats && (
                                <div className="border border-gray-200 rounded-[5px] p-5 sm:p-8
                                                hover:border-black transition-colors duration-300">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="block w-4 h-px bg-gray-300" />
                                        <h3 className="text-[9px] tracking-[0.3em] uppercase
                                                       text-gray-400">
                                            Account Overview
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <StatCard
                                            value={stats.bookings?.total || 0}
                                            label="Total Bookings"
                                            icon={Car}
                                        />
                                        <StatCard
                                            value={stats.bookings?.completed || 0}
                                            label="Completed"
                                            icon={CheckCircle}
                                        />
                                        <StatCard
                                            value={`${'\u20B9'}${stats.totalSpent || 0}`}
                                            label="Total Spent"
                                            icon={Calendar}
                                        />
                                        <StatCard
                                            value={stats.totalReviews || 0}
                                            label="Reviews"
                                            icon={Star}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Danger Zone */}
                            <div className="border border-red-200 rounded-[5px] p-5 sm:p-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 border border-red-200 bg-red-50
                                                    rounded-full flex items-center justify-center">
                                        <AlertCircle size={18} strokeWidth={1.5}
                                            className="text-red-500" />
                                    </div>
                                    <div>
                                        <h3
                                            className="text-black"
                                            style={{
                                                fontFamily: 'Georgia, serif',
                                                fontWeight: 400,
                                                fontSize: '16px',
                                            }}
                                        >
                                            Danger Zone
                                        </h3>
                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                            Irreversible actions
                                        </p>
                                    </div>
                                </div>
                                <div className="h-px bg-red-100 my-5" />
                                <p className="text-[12px] text-gray-500 leading-relaxed mb-6
                                              max-w-lg">
                                    Once deactivated, your account and data will be inaccessible.
                                    Contact support to reactivate.
                                </p>
                                <button
                                    onClick={() => setShowDeactivateModal(true)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5
                                               text-red-500 border border-red-200 rounded-[5px]
                                               hover:bg-red-600 hover:text-white hover:border-red-600
                                               active:scale-[0.98] transition-all duration-300
                                               min-h-[44px]"
                                >
                                    <Trash2 size={13} strokeWidth={2} />
                                    <span className="text-[10px] tracking-[0.15em] uppercase">
                                        Deactivate Account
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Mobile Bottom Nav ── */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-white
                            border-t border-gray-100">
                <div className="flex h-[56px]">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => switchTab(tab.id)}
                                className={`flex-1 flex flex-col items-center justify-center gap-1
                                           relative transition-colors duration-200
                                           active:bg-gray-50 ${
                                    isActive ? 'text-black' : 'text-gray-300'
                                }`}
                            >
                                {isActive && (
                                    <span className="absolute top-0 left-1/2 -translate-x-1/2
                                                     w-8 h-[2px] bg-black rounded-full" />
                                )}
                                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                                <span className="text-[8px] tracking-[0.1em] uppercase">
                                    {tab.label}
                                </span>
                            </button>
                        )
                    })}
                </div>
                <div className="h-[env(safe-area-inset-bottom)]" />
            </div>

            {/* ── Deactivate Modal ── */}
            <DeactivateModal
                isOpen={showDeactivateModal}
                onClose={() => setShowDeactivateModal(false)}
                onConfirm={handleDeactivateAccount}
                loading={saving}
            />
        </div>
    )
}