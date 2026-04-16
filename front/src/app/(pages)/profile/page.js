"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User, Mail, Calendar, Car, Settings, Lock, Trash2,
  Edit2, Save, X, ChevronRight, Star, Clock, CheckCircle,
  Loader2, Eye, EyeOff, ArrowUpRight, Shield,
  AlertCircle, Phone, MapPin, Award, TrendingUp,
  Sparkles, ArrowLeft, RefreshCw, Info
} from 'lucide-react'
import {
  getUserProfile, updateUserProfile, changePassword,
  getUserBookings, getUserStats, deactivateAccount
} from '@/lib/user.api'
import { MobileBookingCard, DesktopBookingCard } from '@/components/BookingCard'

// ─── Constants ───────────────────────────────────────────
const TYPOGRAPHY = {
  serif: "'Playfair Display', Georgia, 'Times New Roman', serif",
  sans: "'Helvetica Neue', Helvetica, Arial, sans-serif"
}

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-amber-400',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200/60',
    icon: Clock
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-blue-400',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200/60',
    icon: CheckCircle
  },
  'in-progress': {
    label: 'In Progress',
    color: 'bg-purple-400',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200/60',
    icon: RefreshCw
  },
  completed: {
    label: 'Completed',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200/60',
    icon: CheckCircle
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-400',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200/60',
    icon: X
  },
}

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'bookings', label: 'Bookings', icon: Car },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const PASSWORD_REQUIREMENTS = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number', test: (p) => /\d/.test(p) },
  { id: 'special', label: 'One special character', test: (p) => /[@$!%*?&#^()_+\-=]/.test(p) },
]

// ─── Utilities ───────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return 'N/A'
  const d = new Date(date)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'

  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    ...(d.getFullYear() !== today.getFullYear() && { year: 'numeric' })
  })
}

const formatLongDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatShortDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric'
  })
}

const getInitials = (firstName = '', lastName = '') => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U'
}

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' }
  const passed = PASSWORD_REQUIREMENTS.filter(r => r.test(password)).length
  const total = PASSWORD_REQUIREMENTS.length

  if (passed <= 1) return { score: 1, label: 'Very Weak', color: 'bg-red-500' }
  if (passed <= 2) return { score: 2, label: 'Weak', color: 'bg-orange-500' }
  if (passed <= 3) return { score: 3, label: 'Fair', color: 'bg-amber-500' }
  if (passed <= 4) return { score: 4, label: 'Strong', color: 'bg-emerald-500' }
  return { score: 5, label: 'Very Strong', color: 'bg-emerald-600' }
}

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// ─── Hooks ───────────────────────────────────────────────
function useScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return

    const scrollY = window.scrollY
    const body = document.body

    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.overflow = 'hidden'

    return () => {
      body.style.position = ''
      body.style.top = ''
      body.style.left = ''
      body.style.right = ''
      body.style.overflow = ''
      window.scrollTo(0, scrollY)
    }
  }, [isLocked])
}

function useAutoHideMessage(message, setMessage, duration = 4000) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), duration)
    return () => clearTimeout(timer)
  }, [message, setMessage, duration])
}

// ─── Sub Components ──────────────────────────────────────

// Skeleton Loader
const Skeleton = ({ className = '', variant = 'rect' }) => (
  <div
    className={`animate-pulse bg-gray-100 rounded ${variant === 'circle' ? 'rounded-full' : ''} ${className}`}
  />
)

const ProfileSkeleton = () => (
  <div className="space-y-4">
    <div className="border border-gray-100 rounded-xl p-5">
      <div className="flex items-center gap-4">
        <Skeleton variant="circle" className="w-16 h-16" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-56" />
          <div className="flex gap-4 mt-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
    <div className="border border-gray-100 rounded-xl p-5 space-y-4">
      <Skeleton className="h-3 w-32" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
      </div>
      <Skeleton className="h-11" />
    </div>
  </div>
)

// Avatar
const Avatar = ({ initials, size = 'md', variant = 'dark', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-12 h-12 text-[13px]',
    lg: 'w-[68px] h-[68px] text-[18px]',
    xl: 'w-20 h-20 text-[22px]',
  }

  const variants = {
    dark: 'bg-[#1a1a1a] text-white/90',
    light: 'bg-gray-100 text-gray-700 border border-gray-200',
    ghost: 'bg-white/10 text-white/90 border border-white/15',
    gradient: 'bg-gradient-to-br from-gray-800 to-black text-white/90',
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 select-none
                  ${sizes[size]} ${variants[variant]} ${className}`}
      style={{ fontFamily: TYPOGRAPHY.serif, fontWeight: 300, fontStyle: 'italic' }}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

// Input Field
const InputField = ({
  label,
  icon: Icon,
  disabled,
  hint,
  error,
  required,
  id,
  ...props
}) => {
  const hasError = Boolean(error)
  const inputId = id || `field-${label?.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[9px] tracking-[0.18em] uppercase text-gray-400 mb-1.5 font-medium"
        >
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon
            size={14}
            strokeWidth={1.5}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors
                       ${hasError ? 'text-red-300' : disabled ? 'text-gray-200' : 'text-gray-300 group-focus-within:text-gray-500'}`}
            aria-hidden="true"
          />
        )}
        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hint || error ? `${inputId}-desc` : undefined}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3.5'} pr-3.5 py-3 border text-[12px] rounded-lg
                     transition-all duration-200 min-h-[46px] outline-none
                     ${hasError
              ? 'border-red-200 bg-red-50/50 text-red-900 focus:border-red-400 focus:ring-2 focus:ring-red-100'
              : disabled
                ? 'border-gray-100 bg-gray-50/80 text-gray-400 cursor-not-allowed'
                : 'border-gray-200 bg-white text-gray-900 placeholder-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 hover:border-gray-300'
            }`}
          {...props}
        />
      </div>
      {(hint || error) && (
        <p
          id={`${inputId}-desc`}
          className={`text-[9px] mt-1.5 leading-relaxed ${hasError ? 'text-red-500' : 'text-gray-400'}`}
        >
          {error || hint}
        </p>
      )}
    </div>
  )
}

// Password Field
const PasswordField = ({
  label,
  showPassword,
  onToggle,
  error,
  required,
  id,
  ...props
}) => {
  const hasError = Boolean(error)
  const inputId = id || `field-${label?.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[9px] tracking-[0.18em] uppercase text-gray-400 mb-1.5 font-medium"
        >
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative group">
        <Lock
          size={14}
          strokeWidth={1.5}
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors
                     ${hasError ? 'text-red-300' : 'text-gray-300 group-focus-within:text-gray-500'}`}
          aria-hidden="true"
        />
        <input
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          aria-invalid={hasError}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full pl-10 pr-11 py-3 border text-[12px] rounded-lg
                     transition-all duration-200 min-h-[46px] outline-none
                     ${hasError
              ? 'border-red-200 bg-red-50/50 text-red-900 focus:border-red-400 focus:ring-2 focus:ring-red-100'
              : 'border-gray-200 bg-white text-gray-900 placeholder-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 hover:border-gray-300'
            }`}
          {...props}
        />
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600
                     active:text-gray-600 transition-colors p-0.5"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-[9px] text-red-500 mt-1.5" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Password Strength Indicator
const PasswordStrength = ({ password }) => {
  if (!password) return null

  const strength = getPasswordStrength(password)

  return (
    <div className="space-y-2.5 -mt-1">
      {/* Strength Bar */}
      <div className="flex items-center gap-2.5">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300
                         ${i <= strength.score ? strength.color : 'bg-gray-100'}`}
            />
          ))}
        </div>
        <span className={`text-[8px] tracking-wider uppercase font-medium
                         ${strength.score <= 2 ? 'text-red-500' : strength.score <= 3 ? 'text-amber-500' : 'text-emerald-600'}`}>
          {strength.label}
        </span>
      </div>

      {/* Requirements List */}
      <div className="grid grid-cols-1 gap-1">
        {PASSWORD_REQUIREMENTS.map((req) => {
          const passed = req.test(password)
          return (
            <div key={req.id} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full flex items-center justify-center transition-all duration-200
                             ${passed ? 'bg-emerald-500' : 'bg-gray-100'}`}>
                {passed && <CheckCircle size={8} className="text-white" strokeWidth={3} />}
              </div>
              <span className={`text-[9px] transition-colors duration-200
                              ${passed ? 'text-emerald-600' : 'text-gray-400'}`}>
                {req.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Stat Card
const StatCard = ({ value, label, icon: Icon, trend, highlight = false }) => {
  return (
    <div className={`relative overflow-hidden rounded-xl p-4 transition-all duration-200
                    ${highlight
        ? 'bg-[#1a1a1a] text-white'
        : 'bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm'
      }`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center
                       ${highlight ? 'bg-white/10' : 'bg-gray-50 border border-gray-100'}`}>
          <Icon size={16} strokeWidth={1.5} className={highlight ? 'text-white/70' : 'text-gray-400'} />
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-medium
                         ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
            <TrendingUp size={8} />
            {trend > 0 ? `+${trend}` : trend}
          </div>
        )}
      </div>
      <p
        className={`leading-none mb-0.5 ${highlight ? 'text-white' : 'text-gray-900'}`}
        style={{ fontFamily: TYPOGRAPHY.serif, fontWeight: 300, fontSize: '22px' }}
      >
        {value}
      </p>
      <p className={`text-[8px] tracking-[0.14em] uppercase font-medium
                   ${highlight ? 'text-white/40' : 'text-gray-400'}`}>
        {label}
      </p>
    </div>
  )
}

// Modal
const Modal = ({ isOpen, onClose, children, title }) => {
  useScrollLock(isOpen)
  const contentRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Focus trap
  useEffect(() => {
    if (!isOpen || !contentRef.current) return
    const focusable = contentRef.current.querySelectorAll(
      'button, input, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length) focusable[0].focus()
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative w-full sm:max-w-[420px] bg-white sm:rounded-2xl rounded-t-2xl
                   max-h-[92vh] overflow-hidden shadow-2xl
                   animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-2 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="max-h-[88vh] overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  )
}

// Deactivate Account Modal
const DeactivateModal = ({ isOpen, onClose, onConfirm, loading }) => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setPassword('')
      setShowPassword(false)
      setError('')
      setConfirmed(false)
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!password.trim()) {
      setError('Password is required to confirm')
      return
    }
    if (!confirmed) {
      setError('Please confirm that you understand this action')
      return
    }
    setError('')
    onConfirm(password)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Deactivate Account">
      <form onSubmit={handleSubmit} className="p-6">
        {/* Icon */}
        <div className="w-14 h-14 border-2 border-red-200 bg-red-50 rounded-2xl
                       flex items-center justify-center mb-5">
          <AlertCircle size={26} className="text-red-500" strokeWidth={1.5} />
        </div>

        <h2
          id="modal-title"
          className="text-gray-900 mb-2"
          style={{ fontFamily: TYPOGRAPHY.serif, fontWeight: 400, fontSize: '20px' }}
        >
          Deactivate Account?
        </h2>

        <p className="text-gray-500 text-[12px] leading-relaxed mb-6">
          This action will permanently disable your account. You will lose access to:
        </p>

        <ul className="space-y-2 mb-6">
          {['All booking history and data', 'Saved preferences', 'Account credentials'].map((item) => (
            <li key={item} className="flex items-center gap-2 text-[11px] text-gray-600">
              <X size={12} className="text-red-400 shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        {/* Confirm Checkbox */}
        <label className="flex items-start gap-2.5 p-3 bg-red-50/60 border border-red-100 rounded-lg mb-5 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-red-300 text-red-600
                      focus:ring-red-500 focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-[11px] text-red-700 leading-relaxed">
            I understand this action is irreversible and I will lose access to my account.
          </span>
        </label>

        <div className="mb-6">
          <PasswordField
            id="deactivate-password"
            label="Confirm Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
            showPassword={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
            placeholder="Enter your current password"
            error={error}
            required
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3.5 border border-gray-200 rounded-xl text-[10px] tracking-[0.14em]
                       uppercase text-gray-700 min-h-[48px] font-medium
                       hover:bg-gray-50 active:scale-[0.98] transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || !password || !confirmed}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-red-600 text-white
                       rounded-xl min-h-[48px] text-[10px] tracking-[0.14em] uppercase font-medium
                       hover:bg-red-700 active:scale-[0.98] transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Trash2 size={13} />
                Deactivate
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// Toast Notification
const Toast = ({ type, message, onClose }) => {
  if (!message) return null

  const config = {
    error: {
      bg: 'bg-red-50 border-red-200/60',
      icon: AlertCircle,
      iconColor: 'text-red-500',
      text: 'text-red-700',
      progress: 'bg-red-400'
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200/60',
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
      text: 'text-emerald-700',
      progress: 'bg-emerald-400'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200/60',
      icon: Info,
      iconColor: 'text-blue-500',
      text: 'text-blue-700',
      progress: 'bg-blue-400'
    },
  }

  const cfg = config[type] || config.error
  const Icon = cfg.icon

  return (
    <div
      className={`mb-4 flex items-start gap-3 p-3.5 border rounded-xl ${cfg.bg}
                  animate-in slide-in-from-top-2 fade-in duration-300 relative overflow-hidden`}
      role="alert"
      aria-live="assertive"
    >
      <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
        <Icon size={15} className={cfg.iconColor} />
      </div>
      <p className={`text-[12px] flex-1 leading-relaxed pt-0.5 ${cfg.text}`}>
        {message}
      </p>
      <button
        onClick={onClose}
        className={`${cfg.iconColor} hover:opacity-70 transition-opacity shrink-0 p-0.5 mt-0.5`}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  )
}

// Empty State
const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction
}) => {
  const ButtonContent = () => (
    <>
      {actionLabel}
      <ArrowUpRight size={13} />
    </>
  )

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 border border-dashed border-gray-200 rounded-xl bg-gray-50/30">
      <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
        <Icon size={28} strokeWidth={1} className="text-gray-300" />
      </div>
      <h3
        className="text-gray-900 mb-1.5"
        style={{ fontFamily: TYPOGRAPHY.serif, fontWeight: 300, fontSize: '17px' }}
      >
        {title}
      </h3>
      {description && (
        <p className="text-[11px] text-gray-400 mb-6 max-w-xs text-center leading-relaxed">
          {description}
        </p>
      )}
      {(actionLabel && (actionHref || onAction)) && (
        actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white/90 rounded-xl
                       text-[10px] tracking-[0.14em] uppercase font-medium min-h-[46px]
                       hover:bg-black active:scale-[0.98] transition-all
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            <ButtonContent />
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white/90 rounded-xl
                       text-[10px] tracking-[0.14em] uppercase font-medium min-h-[46px]
                       hover:bg-black active:scale-[0.98] transition-all
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            <ButtonContent />
          </button>
        )
      )}
    </div>
  )
}

// Section Header
const SectionHeader = ({ title, subtitle, action }) => {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2
          className="text-gray-900"
          style={{ fontFamily: TYPOGRAPHY.serif, fontWeight: 300, fontSize: '18px' }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}

// Info Row for profile details
const InfoRow = ({ icon: Icon, label, value, badge }) => (
  <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
      <Icon size={14} strokeWidth={1.5} className="text-gray-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[8px] tracking-[0.15em] uppercase text-gray-400 font-medium">{label}</p>
      <p className="text-[12px] text-gray-800 mt-0.5 truncate">{value || 'Not set'}</p>
    </div>
    {badge && (
      <span className={`text-[8px] tracking-wider uppercase font-semibold px-2 py-1 rounded-full ${badge.className}`}>
        {badge.label}
      </span>
    )}
  </div>
)

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════

export default function ProfilePage() {
  const { user, loading: authLoading, logout, checkAuth } = useAuth()
  const router = useRouter()

  // Hide footer
  useEffect(() => {
    const footer = document.querySelector("footer")
    if (footer) footer.style.display = "none"
    return () => {
      if (footer) footer.style.display = ""
    }
  }, [])

  // State
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ firstName: '', lastName: '' })
  const [formErrors, setFormErrors] = useState({})

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [showDeactivateModal, setShowDeactivateModal] = useState(false)

  // Auto-hide messages
  useAutoHideMessage(success, setSuccess, 4000)
  useAutoHideMessage(error, setError, 6000)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  // Fetch initial data
  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchStats()
    }
  }, [user])

  // Fetch bookings when tab changes
  useEffect(() => {
    if (user && activeTab === 'bookings' && bookings.length === 0) {
      fetchBookings()
    }
  }, [user, activeTab, bookings.length])

  // Data fetching
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getUserProfile()
      setProfile(data)
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || ''
      })
    } catch (err) {
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const data = await getUserStats()
      setStats(data)
    } catch (err) {
      console.error('Stats error:', err)
    }
  }, [])

  const fetchBookings = useCallback(async () => {
    try {
      setBookingsLoading(true)
      const data = await getUserBookings()
      setBookings(data.bookings || [])
    } catch (err) {
      console.error('Bookings error:', err)
      setError('Failed to load bookings')
    } finally {
      setBookingsLoading(false)
    }
  }, [])

  // Form handlers
  const handleUpdateProfile = useCallback(async (e) => {
    e.preventDefault()

    const errors = {}
    if (!formData.firstName.trim()) errors.firstName = 'First name is required'
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required'
    if (formData.firstName.trim().length < 2) errors.firstName = 'At least 2 characters'
    if (formData.lastName.trim().length < 2) errors.lastName = 'At least 2 characters'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})
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
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }, [formData, checkAuth, fetchProfile])

  const handleChangePassword = useCallback(async (e) => {
    e.preventDefault()

    const errors = {}

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required'
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required'
    } else {
      const allPassed = PASSWORD_REQUIREMENTS.every(r => r.test(passwordData.newPassword))
      if (!allPassed) {
        errors.newPassword = 'Please meet all password requirements'
      }
    }

    if (!passwordData.confirmNewPassword) {
      errors.confirmNewPassword = 'Please confirm your password'
    } else if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      errors.confirmNewPassword = 'Passwords do not match'
    }

    if (passwordData.currentPassword && passwordData.newPassword &&
      passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'New password must differ from current'
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }

    setPasswordErrors({})
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmNewPassword
      )
      setSuccess('Password changed successfully')
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
    } catch (err) {
      setError(err.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }, [passwordData])

  const handleDeactivateAccount = useCallback(async (password) => {
    if (!password) {
      setError('Password is required')
      return
    }

    setSaving(true)
    setError('')

    try {
      await deactivateAccount(password)
      setShowDeactivateModal(false)
      logout()
    } catch (err) {
      setError(err.message || 'Failed to deactivate account')
      setSaving(false)
    }
  }, [logout])

  const switchTab = useCallback((id) => {
    setActiveTab(id)
    setError('')
    setSuccess('')
    setIsEditing(false)
    // Scroll to top on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    setFormData({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || ''
    })
    setFormErrors({})
  }, [profile])

  const userInitials = useMemo(
    () => getInitials(user?.firstName, user?.lastName),
    [user?.firstName, user?.lastName]
  )

  const greeting = useMemo(() => getGreeting(), [])

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-3">
        <Loader2 size={28} className="animate-spin text-gray-300" />
        <p className="text-[10px] tracking-[0.15em] uppercase text-gray-400">
          Loading your account...
        </p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#fafafa]" style={{ fontFamily: TYPOGRAPHY.sans }}>

      {/* ─── Header ─── */}
      <div className="bg-[#1a1a1a] relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-white/5" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 relative">
          {/* Back button */}
          <div className="pt-5 sm:pt-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-white/35 hover:text-white/70
                        transition-colors text-[9px] tracking-[0.15em] uppercase"
            >
              <ArrowLeft size={13} strokeWidth={1.5} />
              Back
            </button>
          </div>

          <div className="pt-6 pb-7 sm:pt-8 sm:pb-9">
            <div className="flex items-end justify-between gap-4">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="relative">
                  <Avatar initials={userInitials} size="lg" variant="ghost" />
                  {/* Online indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500
                                rounded-full border-[2.5px] border-[#1a1a1a]" />
                </div>

                <div>
                  <p className="text-[9px] tracking-[0.2em] uppercase text-white/30 mb-1 font-medium">
                    {greeting}
                  </p>
                  <h1
                    className="text-white/90"
                    style={{
                      fontFamily: TYPOGRAPHY.serif,
                      fontWeight: 300,
                      fontStyle: 'italic',
                      fontSize: 'clamp(1.15rem, 3.5vw, 1.5rem)'
                    }}
                  >
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <p className="text-[10px] text-white/30 mt-0.5">{user?.email}</p>
                </div>
              </div>

              {/* Quick stats - desktop only */}
              <div className="hidden sm:flex items-center gap-5">
                {stats && (
                  <>
                    <div className="text-right">
                      <p className="text-white/90" style={{ fontFamily: TYPOGRAPHY.serif, fontWeight: 300, fontSize: '20px' }}>
                        {stats.bookings?.total || 0}
                      </p>
                      <p className="text-[7px] tracking-[0.15em] uppercase text-white/30 mt-0.5">Bookings</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-right">
                      <p className="text-white/90" style={{ fontFamily: TYPOGRAPHY.serif, fontWeight: 300, fontSize: '20px' }}>
                        ₹{stats.totalSpent || 0}
                      </p>
                      <p className="text-[7px] tracking-[0.15em] uppercase text-white/30 mt-0.5">Total Spent</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Desktop Tabs ─── */}
      <div className="hidden sm:block sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <nav className="flex gap-1" role="tablist" aria-label="Profile sections">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`${tab.id}-panel`}
                  className={`relative flex items-center gap-2 px-5 py-3.5 text-[9px] tracking-[0.12em]
                             uppercase transition-all duration-200 rounded-t-lg
                             ${isActive
                      ? 'text-gray-900 font-semibold'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-900`}
                >
                  <Icon size={14} strokeWidth={isActive ? 2 : 1.5} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-gray-900 rounded-t-full" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-5 sm:py-7 pb-28 sm:pb-8">

        {/* Toast Messages */}
        <Toast type="error" message={error} onClose={() => setError('')} />
        <Toast type="success" message={success} onClose={() => setSuccess('')} />

        {/* ═══ PROFILE TAB ═══ */}
        {activeTab === 'profile' && (
          <div className="space-y-4" role="tabpanel" id="profile-panel">

            {loading ? (
              <ProfileSkeleton />
            ) : (
              <>
                {/* Profile Summary */}
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      <div className="relative">
                        <Avatar initials={userInitials} size="lg" variant="gradient" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500
                                      rounded-full border-[2.5px] border-white" />
                      </div>

                      <div className="text-center sm:text-left flex-1 min-w-0">
                        <h2
                          className="text-gray-900"
                          style={{ fontFamily: TYPOGRAPHY.serif, fontWeight: 300, fontSize: '20px' }}
                        >
                          {user?.firstName} {user?.lastName}
                        </h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">{user?.email}</p>

                        {/* Quick stats - mobile */}
                        {stats && (
                          <div className="flex items-center justify-center sm:justify-start gap-5 mt-3.5">
                            <div>
                              <span className="text-gray-900" style={{ fontFamily: TYPOGRAPHY.serif, fontWeight: 300, fontSize: '18px' }}>
                                {stats.bookings?.total || 0}
                              </span>
                              <span className="text-[8px] tracking-[0.12em] uppercase text-gray-400 ml-1.5">
                                Bookings
                              </span>
                            </div>
                            <div className="w-px h-4 bg-gray-200" />
                            <div>
                              <span className="text-gray-900" style={{ fontFamily: TYPOGRAPHY.serif, fontWeight: 300, fontSize: '18px' }}>
                                ₹{stats.totalSpent || 0}
                              </span>
                              <span className="text-[8px] tracking-[0.12em] uppercase text-gray-400 ml-1.5">
                                Spent
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={isEditing ? handleCancelEdit : () => setIsEditing(true)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg
                                   text-[9px] tracking-[0.12em] uppercase font-medium shrink-0
                                   active:scale-[0.98] transition-all
                                   ${isEditing
                            ? 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                            : 'bg-[#1a1a1a] text-white/90 hover:bg-black'
                          }`}
                      >
                        {isEditing ? <><X size={12} />Cancel</> : <><Edit2 size={12} />Edit Profile</>}
                      </button>
                    </div>
                  </div>

                  {/* Member badge */}
                  <div className="px-5 sm:px-6 py-3 bg-gray-50/50 border-t border-gray-100
                                flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award size={14} className="text-gray-400" />
                      <span className="text-[9px] tracking-[0.12em] uppercase text-gray-500 font-medium">
                        Member since {formatShortDate(profile?.createdAt)}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[8px] tracking-wider uppercase
                                   font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>
                </div>

                {/* Personal Information Form */}
                <div className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6">
                  <SectionHeader
                    title="Personal Information"
                    subtitle="Manage your personal details"
                  />

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <InputField
                        id="firstName"
                        label="First Name"
                        icon={User}
                        value={formData.firstName}
                        onChange={(e) => {
                          setFormData({ ...formData, firstName: e.target.value })
                          setFormErrors({ ...formErrors, firstName: '' })
                        }}
                        disabled={!isEditing}
                        error={formErrors.firstName}
                        required={isEditing}
                        placeholder="Enter first name"
                        autoComplete="given-name"
                      />
                      <InputField
                        id="lastName"
                        label="Last Name"
                        icon={User}
                        value={formData.lastName}
                        onChange={(e) => {
                          setFormData({ ...formData, lastName: e.target.value })
                          setFormErrors({ ...formErrors, lastName: '' })
                        }}
                        disabled={!isEditing}
                        error={formErrors.lastName}
                        required={isEditing}
                        placeholder="Enter last name"
                        autoComplete="family-name"
                      />
                    </div>

                    <InputField
                      id="email"
                      label="Email Address"
                      icon={Mail}
                      value={profile?.email || ''}
                      disabled
                      hint="Email address cannot be changed"
                      autoComplete="email"
                    />

                    {isEditing && (
                      <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                        <button
                          type="submit"
                          disabled={saving}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-7 py-3
                                     bg-[#1a1a1a] text-white/90 rounded-xl min-h-[48px] text-[10px] tracking-[0.14em]
                                     uppercase font-medium hover:bg-black active:scale-[0.98] transition-all
                                     disabled:opacity-50"
                        >
                          {saving ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <><Save size={13} />Save Changes</>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={saving}
                          className="sm:hidden inline-flex items-center justify-center gap-2 px-6 py-3
                                     border border-gray-200 text-gray-600 rounded-xl min-h-[48px]
                                     text-[10px] tracking-[0.14em] uppercase font-medium
                                     hover:bg-gray-50 active:scale-[0.98] transition-all"
                        >
                          <X size={13} />Cancel
                        </button>
                      </div>
                    )}
                  </form>
                </div>

                {/* Account Info */}
                <div className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6">
                  <SectionHeader
                    title="Account Details"
                    subtitle="Your account information"
                  />

                  <div className="space-y-0">
                    <InfoRow
                      icon={Mail}
                      label="Email"
                      value={profile?.email}
                    />
                    <InfoRow
                      icon={Calendar}
                      label="Member Since"
                      value={formatLongDate(profile?.createdAt)}
                    />
                    <InfoRow
                      icon={Shield}
                      label="Account Status"
                      value="Active"
                      badge={{ label: 'Verified', className: 'bg-emerald-50 text-emerald-600' }}
                    />
                    <InfoRow
                      icon={Clock}
                      label="Last Updated"
                      value={formatLongDate(profile?.updatedAt)}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══ BOOKINGS TAB ═══ */}
        {activeTab === 'bookings' && (
          <div role="tabpanel" id="bookings-panel">
            <SectionHeader
              title="Recent Bookings"
              subtitle="Your latest car wash appointments"
              action={
                bookings.length > 0 && (
                  <button
                    onClick={() => router.push('/my-bookings')}
                    className="group inline-flex items-center gap-1.5 text-[9px] tracking-[0.12em]
                               uppercase text-gray-400 hover:text-gray-900 transition-colors font-medium
                               px-3 py-1.5 rounded-lg hover:bg-gray-100"
                  >
                    View All
                    <ArrowUpRight size={11} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                )
              }
            />

            {bookingsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 size={24} className="animate-spin text-gray-300" />
                <p className="text-[10px] text-gray-400 tracking-wider uppercase">Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <EmptyState
                icon={Car}
                title="No bookings yet"
                description="Book your first car wash service and it'll appear here"
                actionLabel="Book a Wash"
                actionHref="/services"
              />
            ) : (
              <div className="space-y-3">
                {/* Mobile */}
                <div className="sm:hidden space-y-3">
                  {bookings.slice(0, 5).map((booking) => (
                    <MobileBookingCard
                      key={booking._id}
                      booking={booking}
                      onClick={() => router.push('/my-bookings')}
                    />
                  ))}
                </div>

                {/* Desktop */}
                <div className="hidden sm:block space-y-3">
                  {bookings.slice(0, 5).map((booking) => (
                    <DesktopBookingCard
                      key={booking._id}
                      booking={booking}
                      onClick={() => router.push('/my-bookings')}
                    />
                  ))}
                </div>

                {bookings.length > 5 && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() => router.push('/my-bookings')}
                      className="inline-flex items-center gap-2 px-7 py-3 bg-[#1a1a1a] text-white/90 rounded-xl
                                 text-[10px] tracking-[0.14em] uppercase font-medium min-h-[48px]
                                 hover:bg-black active:scale-[0.98] transition-all"
                    >
                      View All {bookings.length} Bookings
                      <ChevronRight size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══ SECURITY TAB ═══ */}
        {activeTab === 'security' && (
          <div className="space-y-4" role="tabpanel" id="security-panel">
            <div className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6">
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center">
                  <Shield size={18} className="text-gray-400" />
                </div>
                <div>
                  <h2 className="text-gray-900" style={{ fontFamily: TYPOGRAPHY.serif, fontWeight: 300, fontSize: '18px' }}>
                    Change Password
                  </h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">Update your password to keep your account secure</p>
                </div>
              </div>

              <div className="h-px bg-gray-100 mb-5" />

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <PasswordField
                  id="currentPassword"
                  label="Current Password"
                  value={passwordData.currentPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    setPasswordErrors({ ...passwordErrors, currentPassword: '' })
                  }}
                  showPassword={showCurrentPassword}
                  onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                  placeholder="Enter current password"
                  error={passwordErrors.currentPassword}
                  required
                  autoComplete="current-password"
                />

                <div className="h-px bg-gray-50 my-1" />

                <PasswordField
                  id="newPassword"
                  label="New Password"
                  value={passwordData.newPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                    setPasswordErrors({ ...passwordErrors, newPassword: '' })
                  }}
                  showPassword={showNewPassword}
                  onToggle={() => setShowNewPassword(!showNewPassword)}
                  placeholder="Enter new password"
                  error={passwordErrors.newPassword}
                  required
                  autoComplete="new-password"
                />

                {/* Password Strength */}
                <PasswordStrength password={passwordData.newPassword} />

                <PasswordField
                  id="confirmNewPassword"
                  label="Confirm New Password"
                  value={passwordData.confirmNewPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })
                    setPasswordErrors({ ...passwordErrors, confirmNewPassword: '' })
                  }}
                  showPassword={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                  placeholder="Confirm new password"
                  error={passwordErrors.confirmNewPassword}
                  required
                  autoComplete="new-password"
                />

                {/* Match indicator */}
                {passwordData.confirmNewPassword && passwordData.newPassword && (
                  <div className={`flex items-center gap-1.5 text-[10px]
                                 ${passwordData.newPassword === passwordData.confirmNewPassword
                      ? 'text-emerald-600' : 'text-red-500'}`}>
                    {passwordData.newPassword === passwordData.confirmNewPassword
                      ? <><CheckCircle size={12} /> Passwords match</>
                      : <><X size={12} /> Passwords don't match</>
                    }
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3
                               bg-[#1a1a1a] text-white/90 rounded-xl min-h-[48px] text-[10px] tracking-[0.14em]
                               uppercase font-medium hover:bg-black active:scale-[0.98] transition-all
                               disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <><Lock size={13} />Update Password</>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Security Tips */}
            <div className="bg-blue-50/50 border border-blue-100/60 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Info size={14} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-[10px] tracking-[0.12em] uppercase text-blue-800 font-semibold mb-1.5">
                    Security Tips
                  </h3>
                  <ul className="space-y-1.5">
                    {[
                      'Use a unique password not shared with other accounts',
                      'Enable two-factor authentication when available',
                      'Never share your password with anyone',
                    ].map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px] text-blue-700/80 leading-relaxed">
                        <CheckCircle size={11} className="text-blue-400 shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ SETTINGS TAB ═══ */}
        {activeTab === 'settings' && (
          <div className="space-y-4" role="tabpanel" id="settings-panel">

            {/* Stats Overview */}
            {stats && (
              <div className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6">
                <SectionHeader
                  title="Account Overview"
                  subtitle="Your activity summary"
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard
                    value={stats.bookings?.total || 0}
                    label="Total Bookings"
                    icon={Car}
                    highlight
                  />
                  <StatCard
                    value={stats.bookings?.completed || 0}
                    label="Completed"
                    icon={CheckCircle}
                  />
                  <StatCard
                    value={`₹${stats.totalSpent || 0}`}
                    label="Total Spent"
                    icon={TrendingUp}
                  />
                  <StatCard
                    value={stats.totalReviews || 0}
                    label="Reviews"
                    icon={Star}
                  />
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6">
              <SectionHeader
                title="Quick Actions"
                subtitle="Frequently used actions"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { label: 'Book a Wash', icon: Sparkles, href: '/services', desc: 'Schedule your next car wash' },
                  { label: 'View Bookings', icon: Calendar, href: '/my-bookings', desc: 'Check your appointments' },
                  { label: 'Edit Profile', icon: Edit2, action: () => { switchTab('profile'); setTimeout(() => setIsEditing(true), 100) }, desc: 'Update your details' },
                  { label: 'Change Password', icon: Lock, action: () => switchTab('security'), desc: 'Update your password' },
                ].map((item) => (
                  item.href ? (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="group flex items-center gap-3.5 p-3.5 rounded-xl border border-gray-100
                               hover:border-gray-200 hover:bg-gray-50/50 transition-all"
                    >
                      <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl
                                    flex items-center justify-center shrink-0
                                    group-hover:bg-[#1a1a1a] group-hover:border-transparent transition-all">
                        <item.icon size={16} strokeWidth={1.5} className="text-gray-400 group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-gray-800">{item.label}</p>
                        <p className="text-[9px] text-gray-400 mt-0.5">{item.desc}</p>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors" />
                    </Link>
                  ) : (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="group flex items-center gap-3.5 p-3.5 rounded-xl border border-gray-100
                               hover:border-gray-200 hover:bg-gray-50/50 transition-all text-left w-full"
                    >
                      <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl
                                    flex items-center justify-center shrink-0
                                    group-hover:bg-[#1a1a1a] group-hover:border-transparent transition-all">
                        <item.icon size={16} strokeWidth={1.5} className="text-gray-400 group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-gray-800">{item.label}</p>
                        <p className="text-[9px] text-gray-400 mt-0.5">{item.desc}</p>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors" />
                    </button>
                  )
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white border border-red-200/60 rounded-xl p-5 sm:p-6">
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-10 h-10 border border-red-200 bg-red-50 rounded-xl flex items-center justify-center">
                  <AlertCircle size={18} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-gray-900" style={{ fontFamily: TYPOGRAPHY.serif, fontWeight: 400, fontSize: '15px' }}>
                    Danger Zone
                  </h3>
                  <p className="text-[9px] text-gray-400 mt-0.5">Actions here are permanent and cannot be undone</p>
                </div>
              </div>

              <div className="h-px bg-red-100/60 my-4" />

              <p className="text-[11px] text-gray-500 leading-relaxed mb-5 max-w-md">
                Deactivating your account will permanently remove access to all your data,
                booking history, and account settings. Contact support if you need to reactivate.
              </p>

              <button
                onClick={() => setShowDeactivateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-3 text-red-600 border border-red-200
                           rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600
                           active:scale-[0.98] transition-all text-[10px] tracking-[0.12em] uppercase font-medium"
              >
                <Trash2 size={13} />
                Deactivate Account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Mobile Bottom Nav ─── */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg
                  border-t border-gray-200/60"
        role="tablist"
        aria-label="Profile navigation"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="grid grid-cols-4 h-[60px]">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tab.id}-panel`}
                className={`relative flex flex-col items-center justify-center gap-1
                           transition-all duration-200 active:scale-95
                           ${isActive ? 'text-gray-900' : 'text-gray-400'}
                           focus-visible:outline-none`}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px]
                                 bg-gray-900 rounded-b-full" />
                )}

                <div className={`relative transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2.2 : 1.5}
                    className="relative"
                  />
                </div>

                <span className={`text-[7px] tracking-[0.1em] uppercase transition-all duration-200
                               ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Deactivate Modal */}
      <DeactivateModal
        isOpen={showDeactivateModal}
        onClose={() => {
          setShowDeactivateModal(false)
          setError('')
        }}
        onConfirm={handleDeactivateAccount}
        loading={saving}
      />

      {/* Font Import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;1,300&display=swap');
      `}</style>
    </div>
  )
}