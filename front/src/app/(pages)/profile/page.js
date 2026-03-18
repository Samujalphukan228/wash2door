// app/profile/page.jsx
"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import {
  User, Mail, Calendar, Car, Settings, Lock, Trash2,
  Edit2, Save, X, ChevronRight, Star, Clock, CheckCircle,
  XCircle, Loader2, Eye, EyeOff, ArrowUpRight, Shield,
  Phone, MapPin, Timer, AlertCircle
} from 'lucide-react'
import {
  getUserProfile, updateUserProfile, changePassword,
  getUserBookings, getUserStats, deactivateAccount
} from '@/lib/user.api'

// ─── Constants ───
const SERIF = 'Georgia, "Times New Roman", serif'
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-amber-400' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-400' },
  'in-progress': { label: 'In Progress', color: 'bg-purple-400' },
  completed: { label: 'Completed', color: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-400' },
}

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'bookings', label: 'Bookings', icon: Car },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'settings', label: 'Settings', icon: Settings },
]

// ─── Scroll Lock Hook ───
function useScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return

    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
      window.scrollTo(0, scrollY)
    }
  }, [isLocked])
}

// ─── Status Badge ───
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-100 rounded">
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.color}`} />
      <span className="text-[8px] tracking-[0.12em] uppercase text-gray-600">
        {cfg.label}
      </span>
    </span>
  )
}

// ─── Avatar ───
function Avatar({ initials, size = 'md', variant = 'dark' }) {
  const sizes = {
    sm: 'w-8 h-8 text-[11px]',
    md: 'w-12 h-12 text-[14px]',
    lg: 'w-16 h-16 text-[18px]',
  }
  const variants = {
    dark: 'bg-black text-white',
    light: 'bg-white text-black border border-gray-200',
    ghost: 'bg-white/10 text-white border border-white/15',
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 ${sizes[size]} ${variants[variant]}`}
      style={{ fontFamily: SERIF, fontWeight: 300 }}
    >
      {initials}
    </div>
  )
}

// ─── Input Field ───
function InputField({ label, icon: Icon, disabled, hint, ...props }) {
  return (
    <div>
      <label className="block text-[8px] tracking-[0.2em] uppercase text-gray-400 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={14}
            strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
          />
        )}
        <input
          disabled={disabled}
          className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-3 border text-[11px]
                     rounded transition-all duration-200 min-h-[44px]
                     ${disabled
              ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
              : 'border-gray-200 bg-white text-black focus:outline-none focus:border-black'
            }`}
          {...props}
        />
      </div>
      {hint && (
        <p className="text-[8px] text-gray-300 mt-1">{hint}</p>
      )}
    </div>
  )
}

// ─── Password Field ───
function PasswordField({ label, showPassword, onToggle, ...props }) {
  return (
    <div>
      <label className="block text-[8px] tracking-[0.2em] uppercase text-gray-400 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Lock
          size={14}
          strokeWidth={1.5}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
        />
        <input
          type={showPassword ? 'text' : 'password'}
          className="w-full pl-9 pr-10 py-3 border border-gray-200 text-[11px]
                     text-black bg-white placeholder-gray-300 rounded
                     focus:outline-none focus:border-black transition-colors duration-200
                     min-h-[44px]"
          {...props}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300
                     active:text-gray-600 transition-colors"
        >
          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  )
}

// ─── Stat Card ───
function StatCard({ value, label, icon: Icon }) {
  return (
    <div className="border border-gray-100 rounded p-3 text-center">
      {Icon && (
        <div className="w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
          <Icon size={14} strokeWidth={1.5} className="text-gray-400" />
        </div>
      )}
      <p
        className="text-black leading-none"
        style={{ fontFamily: SERIF, fontWeight: 300, fontSize: '18px' }}
      >
        {value}
      </p>
      <p className="text-[7px] tracking-[0.15em] uppercase text-gray-400 mt-1">
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
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left border border-gray-200 rounded overflow-hidden
                 active:scale-[0.98] transition-transform duration-150 bg-white"
    >
      {/* Header */}
      <div className="relative bg-black px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h3
              className="text-white truncate text-[14px]"
              style={{ fontFamily: SERIF, fontWeight: 400 }}
            >
              {booking.serviceName}
            </h3>
            <p className="text-white/40 text-[9px] tracking-[0.08em] mt-0.5">
              {booking.bookingCode}
            </p>
          </div>
          <div className="text-right ml-3">
            <p
              className="text-white"
              style={{ fontFamily: SERIF, fontWeight: 300, fontSize: '16px' }}
            >
              ₹{booking.price}
            </p>
          </div>
        </div>

        {isUpcoming && (
          <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative rounded-full h-full w-full bg-emerald-500" />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <StatusBadge status={booking.status} />
          <span className="text-[9px] text-gray-400 uppercase tracking-wider">
            {booking.vehicleTypeName}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar size={10} className="text-gray-300" />
            {formatDate(bookingDate)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={10} className="text-gray-300" />
            {booking.timeSlot}
          </span>
          <span className="flex items-center gap-1">
            <Timer size={10} className="text-gray-300" />
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
      className="w-full text-left group border border-gray-200 rounded overflow-hidden
                 hover:border-black hover:shadow-md transition-all duration-300 bg-white"
    >
      <div className="p-5 flex items-center gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <StatusBadge status={booking.status} />
            <span className="text-[9px] text-gray-300 font-mono uppercase">
              {booking.bookingCode}
            </span>
            {isUpcoming && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative rounded-full h-full w-full bg-emerald-500" />
              </span>
            )}
          </div>
          <h3
            className="text-black truncate mb-0.5"
            style={{ fontFamily: SERIF, fontWeight: 400, fontSize: '15px' }}
          >
            {booking.serviceName}
          </h3>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">
            {booking.vehicleTypeName}
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-100 rounded">
            <Calendar size={11} className="text-gray-400" />
            <span className="text-[10px] text-black">{formatDate(bookingDate)}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-100 rounded">
            <Clock size={11} className="text-gray-400" />
            <span className="text-[10px] text-black">{booking.timeSlot}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <p
            className="text-black"
            style={{ fontFamily: SERIF, fontWeight: 300, fontSize: '20px' }}
          >
            ₹{booking.price}
          </p>
          <ChevronRight
            size={14}
            className="text-gray-300 group-hover:text-black transition-colors"
          />
        </div>
      </div>
    </button>
  )
}

// ─── Modal ───
function Modal({ isOpen, onClose, children }) {
  useScrollLock(isOpen)

  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full sm:max-w-md bg-white sm:rounded-lg rounded-t-2xl
                   max-h-[90vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="max-h-[85vh] overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

// ─── Deactivate Modal ───
function DeactivateModal({ isOpen, onClose, onConfirm, loading }) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!isOpen) setPassword('')
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-5">
        <div className="w-12 h-12 border border-red-200 bg-red-50 rounded-full
                        flex items-center justify-center mb-4">
          <AlertCircle size={22} className="text-red-500" strokeWidth={1.5} />
        </div>

        <h2
          className="text-black mb-1.5"
          style={{ fontFamily: SERIF, fontWeight: 400, fontSize: '18px' }}
        >
          Deactivate Account?
        </h2>
        <p className="text-gray-500 text-[11px] leading-relaxed mb-5">
          Once deactivated, you won't be able to access your account. Contact support to reactivate.
        </p>

        <div className="mb-5">
          <label className="block text-[8px] tracking-[0.2em] uppercase text-gray-400 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 pr-10 py-3 border border-gray-200 rounded
                         text-[11px] text-black placeholder-gray-300
                         focus:outline-none focus:border-black transition-colors
                         min-h-[44px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-200 rounded
                       text-[9px] tracking-[0.15em] uppercase text-black
                       min-h-[44px] active:scale-[0.98] transition-all
                       disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(password)}
            disabled={loading || !password}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3
                       bg-red-600 text-white rounded min-h-[44px]
                       text-[9px] tracking-[0.15em] uppercase
                       active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <Trash2 size={12} />
                Deactivate
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Message Toast ───
function Toast({ type, message, onClose }) {
  if (!message) return null

  const config = {
    error: { bg: 'bg-red-50 border-red-100', icon: AlertCircle, iconColor: 'text-red-500', text: 'text-red-600' },
    success: { bg: 'bg-emerald-50 border-emerald-100', icon: CheckCircle, iconColor: 'text-emerald-500', text: 'text-emerald-600' },
  }

  const cfg = config[type]
  const Icon = cfg.icon

  return (
    <div className={`mb-4 flex items-center gap-2.5 p-3 border rounded ${cfg.bg}`}>
      <Icon size={14} className={cfg.iconColor} />
      <p className={`text-[11px] flex-1 ${cfg.text}`}>{message}</p>
      <button onClick={onClose}>
        <X size={12} className={cfg.iconColor} />
      </button>
    </div>
  )
}

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════

export default function ProfilePage() {
  const { user, loading: authLoading, logout, checkAuth } = useAuth()
  const router = useRouter()

  // State
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
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState(false)

  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)

  const [showDeactivateModal, setShowDeactivateModal] = useState(false)

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) router.push('/')
  }, [user, authLoading, router])

  // Fetch data
  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchStats()
    }
  }, [user])

  useEffect(() => {
    if (user && activeTab === 'bookings') fetchBookings()
  }, [user, activeTab])

  // Auto-clear messages
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 3000)
      return () => clearTimeout(t)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 5000)
      return () => clearTimeout(t)
    }
  }, [error])

  // ─── API Calls ───
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
      setSuccess('Profile updated')
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
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/
    if (!regex.test(passwordData.newPassword)) {
      setError('Needs uppercase, lowercase, number & special char')
      return
    }

    setSaving(true)
    try {
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmNewPassword
      )
      setSuccess('Password changed')
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivateAccount = async (password) => {
    if (!password) {
      setError('Enter your password')
      return
    }
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

  // ─── Loading / Auth Guard ───
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={24} className="animate-spin text-gray-300" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-white pb-16 sm:pb-0" style={{ fontFamily: SANS }}>
      {/* ── Header ── */}
      <div className="bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="pt-16 pb-6 sm:pt-20 sm:pb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="block w-5 h-px bg-white/30" />
              <span
                className="tracking-[0.3em] uppercase text-white/40"
                style={{ fontSize: '8px' }}
              >
                Account
              </span>
            </div>

            <div className="flex items-end justify-between gap-4">
              <div>
                <h1
                  className="text-white mb-1"
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 300,
                    fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                  }}
                >
                  My Account
                </h1>
                <p className="text-[9px] tracking-[0.15em] uppercase text-white/30">
                  Manage profile & preferences
                </p>
              </div>

              <div className="hidden sm:block">
                <Avatar
                  initials={`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`}
                  size="md"
                  variant="ghost"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop Tabs ── */}
      <div className="hidden sm:block sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={`relative flex items-center gap-2 px-5 py-3
                             text-[9px] tracking-[0.12em] uppercase transition-colors
                             ${activeTab === tab.id ? 'text-black' : 'text-gray-400 hover:text-black'}`}
                >
                  <Icon size={13} strokeWidth={1.5} />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-5 sm:py-6">
        <Toast type="error" message={error} onClose={() => setError('')} />
        <Toast type="success" message={success} onClose={() => setSuccess('')} />

        {/* ═══ Profile Tab ═══ */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {/* User Card */}
            <div className="border border-gray-200 rounded p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <Avatar
                  initials={`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`}
                  size="lg"
                />

                <div className="text-center sm:text-left flex-1 min-w-0">
                  <h2
                    className="text-black"
                    style={{ fontFamily: SERIF, fontWeight: 300, fontSize: '18px' }}
                  >
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">{user?.email}</p>

                  {stats && (
                    <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
                      <div>
                        <span
                          className="text-black"
                          style={{ fontFamily: SERIF, fontWeight: 300, fontSize: '16px' }}
                        >
                          {stats.bookings?.total || 0}
                        </span>
                        <span className="text-[8px] tracking-[0.12em] uppercase text-gray-400 ml-1">
                          Bookings
                        </span>
                      </div>
                      <div className="w-px h-3 bg-gray-200" />
                      <div>
                        <span
                          className="text-black"
                          style={{ fontFamily: SERIF, fontWeight: 300, fontSize: '16px' }}
                        >
                          ₹{stats.totalSpent || 0}
                        </span>
                        <span className="text-[8px] tracking-[0.12em] uppercase text-gray-400 ml-1">
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
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200
                             rounded text-[9px] tracking-[0.12em] uppercase
                             hover:border-black active:scale-[0.98] transition-all shrink-0"
                >
                  {isEditing ? <X size={12} /> : <Edit2 size={12} />}
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="border border-gray-200 rounded p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="block w-3 h-px bg-gray-300" />
                <h3 className="text-[8px] tracking-[0.25em] uppercase text-gray-400">
                  Personal Information
                </h3>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputField
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!isEditing}
                  />
                  <InputField
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <InputField
                  label="Email"
                  icon={Mail}
                  value={profile?.email || ''}
                  disabled
                  hint="Email cannot be changed"
                />

                <div className="h-px bg-gray-100" />

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="block w-3 h-px bg-gray-300" />
                    <h3 className="text-[8px] tracking-[0.25em] uppercase text-gray-400">
                      Account Details
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-100 rounded">
                      <Calendar size={11} className="text-gray-400" />
                      <span className="text-[10px] text-black">
                        {profile?.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-100 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-black">Active</span>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2
                               px-6 py-3 bg-black text-white rounded min-h-[44px]
                               text-[9px] tracking-[0.15em] uppercase
                               active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <>
                        <Save size={12} />
                        Save Changes
                      </>
                    )}
                  </button>
                )}
              </form>
            </div>
          </div>
        )}

        {/* ═══ Bookings Tab ═══ */}
        {activeTab === 'bookings' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="block w-3 h-px bg-gray-300" />
                <h2
                  className="text-black"
                  style={{ fontFamily: SERIF, fontWeight: 300, fontSize: '16px' }}
                >
                  Recent Bookings
                </h2>
              </div>
              <button
                onClick={() => router.push('/my-bookings')}
                className="group inline-flex items-center gap-1 text-[9px]
                           tracking-[0.12em] uppercase text-gray-400 hover:text-black transition-colors"
              >
                View All
                <ArrowUpRight
                  size={11}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </button>
            </div>

            {bookingsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-gray-300" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border border-gray-200 rounded">
                <div className="w-14 h-14 border border-gray-200 rounded-full flex items-center justify-center mb-4">
                  <Car size={24} strokeWidth={1} className="text-gray-300" />
                </div>
                <h3
                  className="text-black mb-1"
                  style={{ fontFamily: SERIF, fontWeight: 300, fontSize: '16px' }}
                >
                  No bookings yet
                </h3>
                <p className="text-[10px] text-gray-400 mb-5">Book your first service today</p>
                <a
                  href="/bookings"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded
                             text-[9px] tracking-[0.15em] uppercase min-h-[44px]
                             active:scale-[0.98] transition-all"
                >
                  Book Now
                  <ArrowUpRight size={12} />
                </a>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Mobile */}
                <div className="sm:hidden space-y-2.5">
                  {bookings.slice(0, 5).map((b) => (
                    <MobileBookingCard
                      key={b._id}
                      booking={b}
                      onClick={() => router.push('/my-bookings')}
                    />
                  ))}
                </div>

                {/* Desktop */}
                <div className="hidden sm:block space-y-2.5">
                  {bookings.slice(0, 5).map((b) => (
                    <DesktopBookingCard
                      key={b._id}
                      booking={b}
                      onClick={() => router.push('/my-bookings')}
                    />
                  ))}
                </div>

                {bookings.length > 5 && (
                  <div className="text-center pt-3">
                    <button
                      onClick={() => router.push('/my-bookings')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded
                                 text-[9px] tracking-[0.15em] uppercase min-h-[44px]
                                 active:scale-[0.98] transition-all"
                    >
                      View All Bookings
                      <ChevronRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══ Security Tab ═══ */}
        {activeTab === 'security' && (
          <div className="border border-gray-200 rounded p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 border border-gray-200 rounded-full flex items-center justify-center">
                <Shield size={16} className="text-gray-400" />
              </div>
              <div>
                <h2
                  className="text-black"
                  style={{ fontFamily: SERIF, fontWeight: 300, fontSize: '16px' }}
                >
                  Change Password
                </h2>
                <p className="text-[9px] text-gray-400">Keep your account secure</p>
              </div>
            </div>

            <div className="h-px bg-gray-100 mb-5" />

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
              <PasswordField
                label="Current Password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                showPassword={showPasswords}
                onToggle={() => setShowPasswords(!showPasswords)}
                placeholder="Current password"
                required
              />
              <PasswordField
                label="New Password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                showPassword={showPasswords}
                onToggle={() => setShowPasswords(!showPasswords)}
                placeholder="New password"
                required
              />
              <p className="text-[8px] text-gray-300 -mt-2">
                Min 8 chars · uppercase · lowercase · number · special char
              </p>
              <PasswordField
                label="Confirm Password"
                value={passwordData.confirmNewPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })
                }
                showPassword={showPasswords}
                onToggle={() => setShowPasswords(!showPasswords)}
                placeholder="Confirm password"
                required
              />

              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2
                           px-6 py-3 bg-black text-white rounded min-h-[44px]
                           text-[9px] tracking-[0.15em] uppercase
                           active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <>
                    <Lock size={12} />
                    Update Password
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ═══ Settings Tab ═══ */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Stats */}
            {stats && (
              <div className="border border-gray-200 rounded p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="block w-3 h-px bg-gray-300" />
                  <h3 className="text-[8px] tracking-[0.25em] uppercase text-gray-400">
                    Account Overview
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <StatCard value={stats.bookings?.total || 0} label="Total" icon={Car} />
                  <StatCard value={stats.bookings?.completed || 0} label="Done" icon={CheckCircle} />
                  <StatCard value={`₹${stats.totalSpent || 0}`} label="Spent" icon={Calendar} />
                  <StatCard value={stats.totalReviews || 0} label="Reviews" icon={Star} />
                </div>
              </div>
            )}

            {/* Danger Zone */}
            <div className="border border-red-200 rounded p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 border border-red-200 bg-red-50 rounded-full flex items-center justify-center">
                  <AlertCircle size={16} className="text-red-500" />
                </div>
                <div>
                  <h3
                    className="text-black"
                    style={{ fontFamily: SERIF, fontWeight: 400, fontSize: '14px' }}
                  >
                    Danger Zone
                  </h3>
                  <p className="text-[9px] text-gray-400">Irreversible actions</p>
                </div>
              </div>

              <div className="h-px bg-red-100 my-4" />

              <p className="text-[11px] text-gray-500 leading-relaxed mb-4 max-w-md">
                Once deactivated, your account and data will be inaccessible. Contact support to
                reactivate.
              </p>

              <button
                onClick={() => setShowDeactivateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5
                           text-red-500 border border-red-200 rounded
                           hover:bg-red-600 hover:text-white hover:border-red-600
                           active:scale-[0.98] transition-all text-[9px] tracking-[0.12em] uppercase"
              >
                <Trash2 size={12} />
                Deactivate Account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100">
        <div className="flex h-14">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative
                           transition-colors active:bg-gray-50
                           ${isActive ? 'text-black' : 'text-gray-300'}`}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-black rounded-full" />
                )}
                <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[7px] tracking-[0.08em] uppercase">{tab.label}</span>
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