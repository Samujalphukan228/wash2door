"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Calendar, Car, Settings, Lock, Trash2,
  Edit2, Save, X, ChevronRight, Star, Clock, CheckCircle,
  XCircle, Loader2, Eye, EyeOff, ArrowUpRight, Shield,
  Phone, MapPin, Timer, AlertCircle, Menu, ChevronDown
} from 'lucide-react'
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserBookings,
  getUserStats,
  deactivateAccount
} from '@/lib/user.api'

// ─────────────────────────────────────────
// SCROLL LOCK HOOK
// ─────────────────────────────────────────

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

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-yellow-400',
    icon: Clock
  },
  confirmed: {
    label: 'Confirmed',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-blue-400',
    icon: CheckCircle
  },
  'in-progress': {
    label: 'In Progress',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-purple-400',
    icon: Loader2
  },
  completed: {
    label: 'Completed',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-green-500',
    icon: CheckCircle
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    dot: 'bg-red-400',
    icon: XCircle
  },
}

// ─────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${cfg.bg} rounded-full`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <span className={`text-[9px] tracking-[0.15em] uppercase font-medium ${cfg.text}`}>
        {cfg.label}
      </span>
    </span>
  )
}

// ─────────────────────────────────────────
// MODAL WRAPPER
// ─────────────────────────────────────────

function ModalWrapper({ isOpen, onClose, children }) {
  useScrollLock(isOpen)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                     bg-black/60 backdrop-blur-sm overscroll-none touch-none"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full sm:max-w-lg bg-white sm:rounded-[8px] rounded-t-[16px]
                       max-h-[92vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            <div className="max-h-[85vh] overflow-y-auto overscroll-contain">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────
// DEACTIVATE MODAL
// ─────────────────────────────────────────

function DeactivateModal({ isOpen, onClose, onConfirm, loading }) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="w-12 h-12 border border-red-200 bg-red-50 rounded-full flex items-center justify-center mb-5">
          <AlertCircle size={24} className="text-red-500" strokeWidth={1.5} />
        </div>

        <h2
          className="text-[22px] text-black mb-2"
          style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
        >
          Deactivate Account?
        </h2>

        <p className="text-[12px] text-gray-500 leading-relaxed mb-6">
          Once deactivated, you won't be able to access your account or bookings.
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
              className="w-full px-4 pr-12 py-3 border border-gray-200 rounded-[5px]
                       text-[12px] text-black placeholder-gray-300
                       focus:outline-none focus:border-black
                       transition-colors duration-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3.5 border border-gray-200 rounded-[5px]
                     text-[10px] tracking-[0.2em] uppercase text-black
                     hover:border-black transition-colors duration-300
                     disabled:opacity-50"
          >
            Keep Account
          </button>
          <button
            onClick={() => onConfirm(password)}
            disabled={loading || !password}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5
                     bg-red-600 text-white rounded-[5px]
                     text-[10px] tracking-[0.2em] uppercase
                     hover:bg-red-700 transition-colors duration-300
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

// ─────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────

function StatCard({ value, label, icon: Icon }) {
  return (
    <div className="border border-gray-100 rounded-[5px] p-4 sm:p-5 text-center
                    hover:border-gray-300 transition-colors duration-300">
      {Icon && (
        <div className="w-9 h-9 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
          <Icon size={16} strokeWidth={1.5} className="text-gray-400" />
        </div>
      )}
      <p
        className="text-[22px] sm:text-[26px] text-black leading-none"
        style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
      >
        {value}
      </p>
      <p className="text-[8px] tracking-[0.2em] uppercase text-gray-400 mt-2">
        {label}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────

export default function ProfilePage() {
  const { user, loading: authLoading, logout, checkAuth } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Mobile nav
  const [showMobileNav, setShowMobileNav] = useState(false)

  // Profile
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ firstName: '', lastName: '' })

  // Password
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState(false)

  // Bookings
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)

  // Delete
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.push('/')
  }, [user, authLoading, router])

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
      console.error('Failed to fetch stats:', err)
    }
  }

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true)
      const data = await getUserBookings()
      setBookings(data.bookings || [])
    } catch (err) {
      console.error('Failed to fetch bookings:', err)
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
      setError('New password must be at least 8 characters')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError('New passwords do not match')
      return
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    if (!passwordRegex.test(passwordData.newPassword)) {
      setError('Password must contain uppercase, lowercase, number, and special character')
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
    if (!password) {
      setError('Please enter your password')
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

  const handleCancelEdit = () => {
    setIsEditing(false)
    setFormData({ firstName: profile?.firstName || '', lastName: profile?.lastName || '' })
    setError('')
  }

  const switchTab = (tabId) => {
    setActiveTab(tabId)
    setError('')
    setSuccess('')
    setShowMobileNav(false)
  }

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

  const activeTabData = tabs.find(t => t.id === activeTab)

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >

      {/* ── HEADER ── */}
      <div className="bg-black">
        <div className="max-w-5xl mx-auto px-5 md:px-16 pt-20 pb-10 md:pt-24 md:pb-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="block w-6 h-px bg-white/30 shrink-0" />
                <span
                  className="text-[10px] tracking-[0.4em] uppercase text-white/50"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Account
                </span>
              </div>
              <h1
                className="text-white text-[1.6rem] sm:text-[2rem] md:text-[2.2rem]"
                style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
              >
                My Account
              </h1>
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 mt-2">
                Manage your profile & preferences
              </p>
            </div>

            {/* Desktop: User avatar */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-full flex items-center justify-center">
                <span
                  className="text-white text-[14px]"
                  style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
                >
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS BAR ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-5 md:px-16">

          {/* Desktop Tabs */}
          <div className="hidden sm:flex gap-0">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={`
                    relative flex items-center gap-2 px-6 py-4
                    text-[10px] tracking-[0.15em] uppercase
                    transition-all duration-300
                    ${activeTab === tab.id
                      ? 'text-black'
                      : 'text-gray-400 hover:text-black'
                    }
                  `}
                >
                  <Icon size={14} strokeWidth={1.5} />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Mobile Tab Selector */}
          <div className="sm:hidden">
            <button
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="w-full flex items-center justify-between py-4
                       text-[10px] tracking-[0.15em] uppercase text-black"
            >
              <div className="flex items-center gap-2">
                {activeTabData && <activeTabData.icon size={14} strokeWidth={1.5} />}
                <span>{activeTabData?.label}</span>
              </div>
              <ChevronDown
                size={16}
                strokeWidth={1.5}
                className={`text-gray-400 transition-transform duration-300 ${showMobileNav ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {showMobileNav && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-100 pb-2"
                >
                  {tabs.filter(t => t.id !== activeTab).map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => switchTab(tab.id)}
                        className="w-full flex items-center gap-2 px-2 py-3
                                 text-[10px] tracking-[0.15em] uppercase text-gray-400
                                 hover:text-black transition-colors duration-300"
                      >
                        <Icon size={14} strokeWidth={1.5} />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-5xl mx-auto px-5 md:px-16 py-8 pb-28 sm:pb-12">

        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 flex items-center gap-3 p-4 border border-red-100 bg-red-50 rounded-[5px]"
            >
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-[12px] text-red-600">{error}</p>
              <button onClick={() => setError('')} className="ml-auto shrink-0">
                <X size={14} className="text-red-400 hover:text-red-600 transition-colors" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 flex items-center gap-3 p-4 border border-green-100 bg-green-50 rounded-[5px]"
            >
              <CheckCircle size={16} className="text-green-500 shrink-0" />
              <p className="text-[12px] text-green-600">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════════ */}
        {/* PROFILE TAB */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* User Card */}
            <div className="border border-gray-200 rounded-[8px] overflow-hidden mb-6
                          hover:border-black transition-colors duration-300">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Avatar */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-black rounded-full flex items-center justify-center shrink-0">
                    <span
                      className="text-white text-[24px] sm:text-[28px]"
                      style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
                    >
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>

                  <div className="text-center sm:text-left flex-1">
                    <h2
                      className="text-[22px] sm:text-[26px] text-black"
                      style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
                    >
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-[11px] tracking-[0.1em] text-gray-400 mt-1">
                      {user?.email}
                    </p>

                    {/* Quick Stats Row */}
                    {stats && (
                      <div className="flex items-center justify-center sm:justify-start gap-6 mt-5">
                        <div>
                          <span
                            className="text-[20px] text-black"
                            style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
                          >
                            {stats.bookings?.total || 0}
                          </span>
                          <span className="text-[9px] tracking-[0.15em] uppercase text-gray-400 ml-1.5">
                            Bookings
                          </span>
                        </div>
                        <div className="w-px h-5 bg-gray-200" />
                        <div>
                          <span
                            className="text-[20px] text-black"
                            style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
                          >
                            ₹{stats.totalSpent || 0}
                          </span>
                          <span className="text-[9px] tracking-[0.15em] uppercase text-gray-400 ml-1.5">
                            Spent
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Edit button */}
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="group relative inline-flex items-center gap-2 px-5 py-2.5
                               border border-gray-200 rounded-[5px] overflow-hidden
                               hover:border-black active:scale-[0.98]
                               transition-all duration-300 shrink-0"
                    >
                      <Edit2 size={13} strokeWidth={1.5} />
                      <span className="text-[10px] tracking-[0.15em] uppercase">Edit</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleCancelEdit}
                      className="inline-flex items-center gap-2 px-5 py-2.5
                               border border-gray-200 rounded-[5px]
                               hover:border-black active:scale-[0.98]
                               transition-all duration-300 shrink-0"
                    >
                      <X size={13} strokeWidth={1.5} />
                      <span className="text-[10px] tracking-[0.15em] uppercase">Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="border border-gray-200 rounded-[8px] overflow-hidden
                          hover:border-black transition-colors duration-300">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="block w-4 h-px bg-gray-300" />
                  <h3 className="text-[9px] tracking-[0.3em] uppercase text-gray-400">
                    Personal Information
                  </h3>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* First Name */}
                    <div>
                      <label className="block text-[9px] tracking-[0.25em] uppercase text-gray-400 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        disabled={!isEditing}
                        className={`
                          w-full px-4 py-3.5 border text-[12px] tracking-[0.05em] rounded-[5px]
                          focus:outline-none transition-all duration-300
                          ${isEditing
                            ? 'border-gray-200 bg-white text-black focus:border-black hover:border-gray-300'
                            : 'border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed'
                          }
                        `}
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-[9px] tracking-[0.25em] uppercase text-gray-400 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        disabled={!isEditing}
                        className={`
                          w-full px-4 py-3.5 border text-[12px] tracking-[0.05em] rounded-[5px]
                          focus:outline-none transition-all duration-300
                          ${isEditing
                            ? 'border-gray-200 bg-white text-black focus:border-black hover:border-gray-300'
                            : 'border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed'
                          }
                        `}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[9px] tracking-[0.25em] uppercase text-gray-400 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={15} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="w-full pl-11 pr-4 py-3.5 border border-gray-100 text-[12px] tracking-[0.05em]
                                 bg-gray-50 text-gray-400 cursor-not-allowed rounded-[5px]"
                      />
                    </div>
                    <p className="text-[9px] tracking-[0.1em] text-gray-300 mt-2">
                      Email cannot be changed
                    </p>
                  </div>

                  {/* Account Details */}
                  <div className="h-px bg-gray-100" />

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="block w-4 h-px bg-gray-300" />
                      <h3 className="text-[9px] tracking-[0.3em] uppercase text-gray-400">
                        Account Details
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <div className="inline-flex items-center gap-2 px-3 py-2 border border-gray-100 rounded-[5px]">
                        <Calendar size={13} strokeWidth={1.5} className="text-gray-400" />
                        <span className="text-[11px] tracking-[0.05em] text-black">
                          {profile?.createdAt
                            ? new Date(profile.createdAt).toLocaleDateString('en-IN', {
                              month: 'long',
                              year: 'numeric'
                            })
                            : 'N/A'
                          }
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-2 px-3 py-2 border border-gray-100 rounded-[5px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-[11px] tracking-[0.05em] text-black">Active</span>
                      </div>

                      <div className="inline-flex items-center gap-2 px-3 py-2 border border-gray-100 rounded-[5px]">
                        <CheckCircle size={13} strokeWidth={1.5} className="text-green-500" />
                        <span className="text-[11px] tracking-[0.05em] text-black">Verified</span>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <AnimatePresence>
                    {isEditing && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-2"
                      >
                        <button
                          type="submit"
                          disabled={saving}
                          className="group relative inline-flex items-center justify-center gap-2
                                   px-8 py-3.5 bg-black text-white rounded-[5px] overflow-hidden
                                   active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
                        >
                          <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                          {saving ? (
                            <Loader2 size={14} className="relative z-10 animate-spin" />
                          ) : (
                            <>
                              <Save size={14} strokeWidth={1.5} className="relative z-10 group-hover:text-black transition-colors duration-500" />
                              <span className="relative z-10 text-[10px] tracking-[0.2em] uppercase group-hover:text-black transition-colors duration-500">
                                Save Changes
                              </span>
                            </>
                          )}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* BOOKINGS TAB */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === 'bookings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="block w-4 h-px bg-gray-300" />
                <h2
                  className="text-[18px] sm:text-[22px] text-black"
                  style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
                >
                  Recent Bookings
                </h2>
              </div>
              <button
                onClick={() => router.push('/MyBookings')}
                className="group inline-flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase
                         text-gray-400 hover:text-black transition-colors duration-300"
              >
                View All
                <ArrowUpRight size={13} strokeWidth={2} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
              </button>
            </div>

            {bookingsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin text-gray-300" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center
                            border border-gray-200 rounded-[8px]">
                <div className="w-16 h-16 border border-gray-200 rounded-full flex items-center justify-center mb-6">
                  <Car size={28} strokeWidth={1} className="text-gray-300" />
                </div>
                <h3
                  className="text-[18px] text-black mb-2"
                  style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
                >
                  No bookings yet
                </h3>
                <p className="text-[11px] tracking-[0.15em] uppercase text-gray-400 mb-8 max-w-xs">
                  Book your first service today
                </p>
                <a
                  href="/Bookings"
                  className="group relative inline-flex items-center gap-2 px-7 py-4
                           bg-black text-white rounded-[5px] overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                  <span className="relative z-10 text-[10px] tracking-[0.2em] uppercase group-hover:text-black transition-colors duration-500">
                    Book Now
                  </span>
                  <ArrowUpRight size={14} strokeWidth={2} className="relative z-10 group-hover:text-black transition-colors duration-500" />
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking) => {
                  const bookingDate = new Date(booking.bookingDate)
                  const isUpcoming = bookingDate > new Date() && !['cancelled', 'completed'].includes(booking.status)

                  const formatDate = (date) => {
                    const today = new Date()
                    const tomorrow = new Date(today)
                    tomorrow.setDate(tomorrow.getDate() + 1)
                    if (date.toDateString() === today.toDateString()) return 'Today'
                    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
                    return date.toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })
                  }

                  return (
                    <motion.div
                      key={booking._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => router.push('/MyBookings')}
                      className="group relative bg-white border border-gray-200 rounded-[8px] overflow-hidden
                               hover:border-black hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]
                               transition-all duration-300 cursor-pointer"
                    >
                      <div className="p-5 sm:p-6">
                        {/* Top: Status & Code */}
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <StatusBadge status={booking.status} />
                          <span className="text-[10px] tracking-[0.1em] text-gray-400 font-mono uppercase">
                            {booking.bookingCode}
                          </span>
                        </div>

                        {/* Service & Price */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1 min-w-0">
                            <h3
                              className="text-[16px] sm:text-[18px] text-black truncate mb-1"
                              style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}
                            >
                              {booking.serviceName}
                            </h3>
                            <p className="text-[11px] tracking-[0.15em] uppercase text-gray-400">
                              {booking.vehicleTypeName}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p
                              className="text-[24px] sm:text-[28px] text-black leading-none"
                              style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
                            >
                              ₹{booking.price}
                            </p>
                          </div>
                        </div>

                        {/* Info Pills */}
                        <div className="flex flex-wrap gap-2">
                          <div className="inline-flex items-center gap-2 px-3 py-2 border border-gray-100 rounded-[5px]">
                            <Calendar size={13} strokeWidth={1.5} className="text-gray-400" />
                            <span className="text-[11px] tracking-[0.05em] text-black">
                              {formatDate(bookingDate)}
                            </span>
                          </div>

                          <div className="inline-flex items-center gap-2 px-3 py-2 border border-gray-100 rounded-[5px]">
                            <Clock size={13} strokeWidth={1.5} className="text-gray-400" />
                            <span className="text-[11px] tracking-[0.05em] text-black">
                              {booking.timeSlot}
                            </span>
                          </div>

                          <div className="inline-flex items-center gap-2 px-3 py-2 border border-gray-100 rounded-[5px]">
                            <Timer size={13} strokeWidth={1.5} className="text-gray-400" />
                            <span className="text-[11px] tracking-[0.05em] text-black">
                              {booking.duration} min
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Upcoming Indicator */}
                      {isUpcoming && booking.status !== 'cancelled' && (
                        <div className="absolute top-5 right-5">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-full w-full bg-green-500" />
                          </span>
                        </div>
                      )}
                    </motion.div>
                  )
                })}

                {/* View All Button */}
                {bookings.length > 5 && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() => router.push('/MyBookings')}
                      className="group relative inline-flex items-center gap-2 px-7 py-3.5
                               bg-black text-white rounded-[5px] overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                      <span className="relative z-10 text-[10px] tracking-[0.2em] uppercase group-hover:text-black transition-colors duration-500">
                        View All Bookings
                      </span>
                      <ChevronRight size={13} strokeWidth={2} className="relative z-10 group-hover:text-black transition-colors duration-500" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* SECURITY TAB */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border border-gray-200 rounded-[8px] overflow-hidden
                          hover:border-black transition-colors duration-300">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center">
                    <Shield size={18} strokeWidth={1.5} className="text-gray-400" />
                  </div>
                  <div>
                    <h2
                      className="text-[18px] sm:text-[22px] text-black"
                      style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
                    >
                      Change Password
                    </h2>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-gray-400 mt-0.5">
                      Keep your account secure
                    </p>
                  </div>
                </div>

                <div className="h-px bg-gray-100 my-6" />

                <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                  {/* Current Password */}
                  <div>
                    <label className="block text-[9px] tracking-[0.25em] uppercase text-gray-400 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock size={15} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        required
                        placeholder="Enter current password"
                        className="w-full pl-11 pr-12 py-3.5 border border-gray-200 text-[12px] tracking-[0.05em]
                                 text-black bg-white placeholder-gray-300
                                 focus:outline-none focus:border-black hover:border-gray-300
                                 transition-colors duration-300 rounded-[5px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                      >
                        {showPasswords ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-[9px] tracking-[0.25em] uppercase text-gray-400 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock size={15} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        required
                        placeholder="Enter new password"
                        className="w-full pl-11 pr-4 py-3.5 border border-gray-200 text-[12px] tracking-[0.05em]
                                 text-black bg-white placeholder-gray-300
                                 focus:outline-none focus:border-black hover:border-gray-300
                                 transition-colors duration-300 rounded-[5px]"
                      />
                    </div>
                    <p className="text-[9px] tracking-[0.1em] text-gray-300 mt-2">
                      Min 8 chars with uppercase, lowercase, number & special character
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-[9px] tracking-[0.25em] uppercase text-gray-400 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock size={15} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={passwordData.confirmNewPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                        required
                        placeholder="Confirm new password"
                        className="w-full pl-11 pr-4 py-3.5 border border-gray-200 text-[12px] tracking-[0.05em]
                                 text-black bg-white placeholder-gray-300
                                 focus:outline-none focus:border-black hover:border-gray-300
                                 transition-colors duration-300 rounded-[5px]"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2
                               px-8 py-3.5 bg-black text-white rounded-[5px] overflow-hidden
                               active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
                    >
                      <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                      {saving ? (
                        <Loader2 size={14} className="relative z-10 animate-spin" />
                      ) : (
                        <>
                          <Lock size={14} strokeWidth={1.5} className="relative z-10 group-hover:text-black transition-colors duration-500" />
                          <span className="relative z-10 text-[10px] tracking-[0.2em] uppercase group-hover:text-black transition-colors duration-500">
                            Update Password
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* SETTINGS TAB */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Account Overview */}
            {stats && (
              <div className="border border-gray-200 rounded-[8px] overflow-hidden
                            hover:border-black transition-colors duration-300">
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="block w-4 h-px bg-gray-300" />
                    <h3 className="text-[9px] tracking-[0.3em] uppercase text-gray-400">
                      Account Overview
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                      value={`₹${stats.totalSpent || 0}`}
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
              </div>
            )}

            {/* Danger Zone */}
            <div className="border border-red-200 rounded-[8px] overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 border border-red-200 bg-red-50 rounded-full flex items-center justify-center">
                    <AlertCircle size={18} strokeWidth={1.5} className="text-red-500" />
                  </div>
                  <div>
                    <h3
                      className="text-[16px] text-black"
                      style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}
                    >
                      Danger Zone
                    </h3>
                    <p className="text-[10px] tracking-[0.1em] text-gray-400 mt-0.5">
                      Irreversible actions
                    </p>
                  </div>
                </div>

                <div className="h-px bg-red-100 my-5" />

                <p className="text-[12px] text-gray-500 leading-relaxed mb-6 max-w-lg">
                  Once you deactivate your account, you will not be able to access it.
                  Please contact support to reactivate.
                </p>

                <button
                  onClick={() => setShowDeactivateModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5
                           text-red-500 border border-red-200 rounded-[5px]
                           hover:bg-red-600 hover:text-white hover:border-red-600
                           active:scale-[0.98] transition-all duration-300"
                >
                  <Trash2 size={13} strokeWidth={2} />
                  <span className="text-[10px] tracking-[0.15em] uppercase">
                    Deactivate Account
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── MOBILE BOTTOM BAR ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`
                  flex-1 flex flex-col items-center gap-1 py-3
                  transition-colors duration-300
                  ${activeTab === tab.id
                    ? 'text-black'
                    : 'text-gray-300'
                  }
                `}
              >
                <Icon size={18} strokeWidth={activeTab === tab.id ? 2 : 1.5} />
                <span className="text-[8px] tracking-[0.1em] uppercase">
                  {tab.label}
                </span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="mobileActiveTab"
                    className="absolute top-0 w-10 h-[2px] bg-black rounded-full"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── DEACTIVATE MODAL ── */}
      <DeactivateModal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={handleDeactivateAccount}
        loading={saving}
      />
    </div>
  )
}