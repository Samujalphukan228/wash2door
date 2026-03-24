"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User, Mail, Calendar, Car, Settings, Lock, Trash2,
  Edit2, Save, X, ChevronRight, Star, Clock, CheckCircle,
  Loader2, Eye, EyeOff, ArrowUpRight, Shield,
  Timer, AlertCircle
} from 'lucide-react'
import {
  getUserProfile, updateUserProfile, changePassword,
  getUserBookings, getUserStats, deactivateAccount
} from '@/lib/user.api'
import { MobileBookingCard, DesktopBookingCard } from '@/components/BookingCard'

// ─── Constants ───────────────────────────────────────────
const TYPOGRAPHY = {
  serif: 'Georgia, "Times New Roman", serif',
  sans: "'Helvetica Neue', Helvetica, Arial, sans-serif"
}

const STATUS_CONFIG = {
  pending: { 
    label: 'Pending', 
    color: 'bg-amber-400',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100'
  },
  confirmed: { 
    label: 'Confirmed', 
    color: 'bg-blue-400',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100'
  },
  'in-progress': { 
    label: 'In Progress', 
    color: 'bg-purple-400',
    textColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-100'
  },
  completed: { 
    label: 'Completed', 
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-100'
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-red-400',
    textColor: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-100'
  },
}

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'bookings', label: 'Bookings', icon: Car },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
  message: 'Min 8 chars · uppercase · lowercase · number · special char'
}

// ─── Utilities ───────────────────────────────────────────
const formatDate = (date) => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short',
    ...(date.getFullYear() !== today.getFullYear() && { year: 'numeric' })
  })
}

const formatLongDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-IN', { 
    month: 'short', 
    year: 'numeric' 
  })
}

const getInitials = (firstName = '', lastName = '') => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U'
}

const validatePassword = (password) => {
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    return { valid: false, message: `Minimum ${PASSWORD_REQUIREMENTS.minLength} characters required` }
  }
  if (!PASSWORD_REQUIREMENTS.regex.test(password)) {
    return { valid: false, message: 'Password needs uppercase, lowercase, number & special character' }
  }
  return { valid: true }
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

function useAutoHideMessage(message, setMessage, duration = 3000) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), duration)
    return () => clearTimeout(timer)
  }, [message, setMessage, duration])
}

// ─── Components ──────────────────────────────────────────

// Status Badge
const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  
  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2 py-1 ${config.bgColor} ${config.borderColor} border rounded`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.color}`} aria-hidden="true" />
      <span className={`text-[8px] tracking-[0.12em] uppercase ${config.textColor}`}>
        {config.label}
      </span>
    </span>
  )
}

// Avatar
const Avatar = ({ initials, size = 'md', variant = 'dark' }) => {
  const sizes = {
    sm: { className: 'w-8 h-8', fontSize: '11px' },
    md: { className: 'w-12 h-12', fontSize: '14px' },
    lg: { className: 'w-16 h-16', fontSize: '18px' },
  }
  
  const variants = {
    dark: 'bg-black text-white',
    light: 'bg-white text-black border border-gray-200',
    ghost: 'bg-white/10 text-white border border-white/15',
  }
  
  const sizeConfig = sizes[size]
  
  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 ${sizeConfig.className} ${variants[variant]}`}
      style={{ fontFamily: TYPOGRAPHY.serif, fontWeight: 300, fontSize: sizeConfig.fontSize }}
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
  ...props 
}) => {
  const hasError = Boolean(error)
  
  return (
    <div>
      <label className="block text-[8px] tracking-[0.2em] uppercase text-gray-400 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon 
            size={14} 
            strokeWidth={1.5} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" 
            aria-hidden="true"
          />
        )}
        <input
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hint || error ? `${props.id}-description` : undefined}
          className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-3 border text-[11px] rounded transition-all duration-200 min-h-[44px]
            ${hasError 
              ? 'border-red-200 bg-red-50/50 text-red-900 focus:border-red-400 focus:ring-2 focus:ring-red-100' 
              : disabled 
                ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed' 
                : 'border-gray-200 bg-white text-black focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5'
            }`}
          {...props}
        />
      </div>
      {(hint || error) && (
        <p 
          id={`${props.id}-description`}
          className={`text-[8px] mt-1 ${hasError ? 'text-red-500' : 'text-gray-400'}`}
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
  ...props 
}) => {
  const hasError = Boolean(error)
  
  return (
    <div>
      <label className="block text-[8px] tracking-[0.2em] uppercase text-gray-400 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <Lock 
          size={14} 
          strokeWidth={1.5} 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" 
          aria-hidden="true"
        />
        <input
          type={showPassword ? 'text' : 'password'}
          aria-invalid={hasError}
          aria-describedby={error ? `${props.id}-error` : undefined}
          className={`w-full pl-9 pr-10 py-3 border text-[11px] rounded transition-all duration-200 min-h-[44px]
            ${hasError 
              ? 'border-red-200 bg-red-50/50 text-red-900 focus:border-red-400 focus:ring-2 focus:ring-red-100' 
              : 'border-gray-200 bg-white text-black placeholder-gray-300 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5'
            }`}
          {...props}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 active:text-gray-600 transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {error && (
        <p id={`${props.id}-error`} className="text-[8px] text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  )
}

// Stat Card
const StatCard = ({ value, label, icon: Icon }) => {
  return (
    <div className="border border-gray-100 rounded-lg p-3 text-center hover:border-gray-200 transition-colors">
      {Icon && (
        <div className="w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
          <Icon size={14} strokeWidth={1.5} className="text-gray-400" />
        </div>
      )}
      <p 
        className="text-black leading-none" 
        style={{ fontFamily: TYPOGRAPHY.serif, fontWeight: 300, fontSize: '18px' }}
      >
        {value}
      </p>
      <p className="text-[7px] tracking-[0.15em] uppercase text-gray-400 mt-1">
        {label}
      </p>
    </div>
  )
}

// Modal
const Modal = ({ isOpen, onClose, children, title }) => {
  useScrollLock(isOpen)

  useEffect(() => {
    if (!isOpen) return
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        className="relative w-full sm:max-w-md bg-white sm:rounded-lg rounded-t-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="max-h-[85vh] overflow-y-auto overscroll-contain">
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

  useEffect(() => {
    if (!isOpen) {
      setPassword('')
      setShowPassword(false)
      setError('')
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!password.trim()) {
      setError('Password is required')
      return
    }
    setError('')
    onConfirm(password)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Deactivate Account">
      <form onSubmit={handleSubmit} className="p-5">
        <div className="w-12 h-12 border border-red-200 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={22} className="text-red-500" strokeWidth={1.5} />
        </div>
        
        <h2 
          id="modal-title"
          className="text-black mb-1.5" 
          style={{ fontFamily: TYPOGRAPHY.serif, fontWeight: 400, fontSize: '18px' }}
        >
          Deactivate Account?
        </h2>
        
        <p className="text-gray-500 text-[11px] leading-relaxed mb-5">
          Once deactivated, you will not be able to access your account or data. 
          Contact support if you need to reactivate later.
        </p>
        
        <div className="mb-5">
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
            placeholder="Enter your password"
            error={error}
            required
          />
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-200 rounded text-[9px] tracking-[0.15em] 
                       uppercase text-black min-h-[44px] hover:bg-gray-50 active:scale-[0.98] 
                       transition-all disabled:opacity-50 disabled:cursor-not-allowed
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading || !password}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white 
                       rounded min-h-[44px] text-[9px] tracking-[0.15em] uppercase hover:bg-red-700 
                       active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
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
      </form>
    </Modal>
  )
}

// Toast Notification
const Toast = ({ type, message, onClose }) => {
  if (!message) return null

  const config = {
    error: { 
      bg: 'bg-red-50 border-red-100', 
      icon: AlertCircle, 
      iconColor: 'text-red-500', 
      text: 'text-red-700' 
    },
    success: { 
      bg: 'bg-emerald-50 border-emerald-100', 
      icon: CheckCircle, 
      iconColor: 'text-emerald-500', 
      text: 'text-emerald-700' 
    },
  }

  const cfg = config[type] || config.error
  const Icon = cfg.icon

  return (
    <div 
      className={`mb-4 flex items-start gap-2.5 p-3 border rounded-lg ${cfg.bg}`}
      role="alert"
      aria-live="assertive"
    >
      <Icon size={16} className={`${cfg.iconColor} shrink-0 mt-0.5`} />
      <p className={`text-[11px] flex-1 leading-relaxed ${cfg.text}`}>
        {message}
      </p>
      <button
        onClick={onClose}
        className={`${cfg.iconColor} hover:opacity-70 transition-opacity shrink-0`}
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
  return (
    <div className="flex flex-col items-center justify-center py-12 border border-gray-200 rounded-lg">
      <div className="w-14 h-14 border border-gray-200 rounded-full flex items-center justify-center mb-4">
        <Icon size={24} strokeWidth={1} className="text-gray-300" />
      </div>
      <h3 
        className="text-black mb-1" 
        style={{ fontFamily: TYPOGRAPHY.serif, fontWeight: 300, fontSize: '16px' }}
      >
        {title}
      </h3>
      {description && (
        <p className="text-[10px] text-gray-400 mb-5 max-w-xs text-center">
          {description}
        </p>
      )}
      {(actionLabel && (actionHref || onAction)) && (
        actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg 
                       text-[9px] tracking-[0.15em] uppercase min-h-[44px] hover:bg-gray-900 
                       active:scale-[0.98] transition-all
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            {actionLabel}
            <ArrowUpRight size={12} />
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg 
                       text-[9px] tracking-[0.15em] uppercase min-h-[44px] hover:bg-gray-900 
                       active:scale-[0.98] transition-all
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            {actionLabel}
            <ArrowUpRight size={12} />
          </button>
        )
      )}
    </div>
  )
}

// Section Header
const SectionHeader = ({ title, action }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="block w-3 h-px bg-gray-300" />
        <h2 
          className="text-black" 
          style={{ fontFamily: TYPOGRAPHY.serif, fontWeight: 300, fontSize: '16px' }}
        >
          {title}
        </h2>
      </div>
      {action}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════

export default function ProfilePage() {
  const { user, loading: authLoading, logout, checkAuth } = useAuth()
  const router = useRouter()

  // ✅ Footer hide (correct place)
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
  const [showPasswords, setShowPasswords] = useState(false)
  
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)

  // Auto-hide messages
  useAutoHideMessage(success, setSuccess, 3000)
  useAutoHideMessage(error, setError, 5000)

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

  // Data fetching functions
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
    
    // Validation
    const errors = {}
    if (!formData.firstName.trim()) errors.firstName = 'First name is required'
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required'
    
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
    
    // Validation
    const errors = {}
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required'
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required'
    } else {
      const validation = validatePassword(passwordData.newPassword)
      if (!validation.valid) {
        errors.newPassword = validation.message
      }
    }
    
    if (!passwordData.confirmNewPassword) {
      errors.confirmNewPassword = 'Please confirm your password'
    } else if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      errors.confirmNewPassword = 'Passwords do not match'
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
      setPasswordData({ 
        currentPassword: '', 
        newPassword: '', 
        confirmNewPassword: '' 
      })
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

  // Tab switching
  const switchTab = useCallback((id) => {
    setActiveTab(id)
    setError('')
    setSuccess('')
    setIsEditing(false)
  }, [])

  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    setFormData({ 
      firstName: profile?.firstName || '', 
      lastName: profile?.lastName || '' 
    })
    setFormErrors({})
  }, [profile])

  // Computed values
  const userInitials = useMemo(
    () => getInitials(user?.firstName, user?.lastName),
    [user?.firstName, user?.lastName]
  )

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={32} className="animate-spin text-gray-300" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: TYPOGRAPHY.sans }}>
      
      {/* Header */}
      <div className="bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="pt-16 pb-6 sm:pt-20 sm:pb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="block w-5 h-px bg-white/30" />
              <span className="tracking-[0.3em] uppercase text-white/40" style={{ fontSize: '8px' }}>
                Account
              </span>
            </div>
            
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 
                  className="text-white mb-1" 
                  style={{ 
                    fontFamily: TYPOGRAPHY.serif, 
                    fontWeight: 300, 
                    fontSize: 'clamp(1.25rem, 4vw, 1.75rem)' 
                  }}
                >
                  My Account
                </h1>
                <p className="text-[9px] tracking-[0.15em] uppercase text-white/40">
                  Manage your profile and preferences
                </p>
              </div>
              
              <div className="hidden sm:block">
                <Avatar initials={userInitials} size="md" variant="ghost" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden sm:block sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <nav className="flex" role="tablist" aria-label="Profile sections">
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
                  className={`relative flex items-center gap-2 px-5 py-4 text-[9px] tracking-[0.12em] 
                             uppercase transition-all duration-200
                             ${isActive 
                               ? 'text-black font-medium' 
                               : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                             }
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black`}
                >
                  <Icon size={14} strokeWidth={isActive ? 2 : 1.5} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black rounded-t-full" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-5 sm:py-6 pb-24 sm:pb-6">
        
        {/* Toast Messages */}
        <Toast type="error" message={error} onClose={() => setError('')} />
        <Toast type="success" message={success} onClose={() => setSuccess('')} />

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4" role="tabpanel" id="profile-panel">
            
            {/* Profile Summary Card */}
            <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <Avatar initials={userInitials} size="lg" />
                
                <div className="text-center sm:text-left flex-1 min-w-0">
                  <h2 
                    className="text-black" 
                    style={{ fontFamily: TYPOGRAPHY.serif, fontWeight: 300, fontSize: '18px' }}
                  >
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">{user?.email}</p>
                  
                  {stats && (
                    <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
                      <div>
                        <span 
                          className="text-black" 
                          style={{ fontFamily: TYPOGRAPHY.serif, fontWeight: 300, fontSize: '16px' }}
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
                          style={{ fontFamily: TYPOGRAPHY.serif, fontWeight: 300, fontSize: '16px' }}
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
                  onClick={isEditing ? handleCancelEdit : () => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg 
                             text-[9px] tracking-[0.12em] uppercase hover:border-black hover:bg-gray-50 
                             active:scale-[0.98] transition-all shrink-0"
                >
                  {isEditing ? <><X size={12} />Cancel</> : <><Edit2 size={12} />Edit</>}
                </button>
              </div>
            </div>

            {/* Personal Information */}
            <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="block w-3 h-px bg-gray-300" />
                <h3 className="text-[8px] tracking-[0.25em] uppercase text-gray-400">
                  Personal Information
                </h3>
              </div>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputField
                    id="firstName"
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => {
                      setFormData({ ...formData, firstName: e.target.value })
                      setFormErrors({ ...formErrors, firstName: '' })
                    }}
                    disabled={!isEditing}
                    error={formErrors.firstName}
                    required={isEditing}
                  />
                  <InputField
                    id="lastName"
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => {
                      setFormData({ ...formData, lastName: e.target.value })
                      setFormErrors({ ...formErrors, lastName: '' })
                    }}
                    disabled={!isEditing}
                    error={formErrors.lastName}
                    required={isEditing}
                  />
                </div>
                
                <InputField 
                  id="email"
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
                        Joined {formatLongDate(profile?.createdAt)}
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
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 
                               bg-black text-white rounded-lg min-h-[44px] text-[9px] tracking-[0.15em] 
                               uppercase hover:bg-gray-900 active:scale-[0.98] transition-all 
                               disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={12} className="animate-spin" /> : <><Save size={12} />Save Changes</>}
                  </button>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div role="tabpanel" id="bookings-panel">
            <SectionHeader 
              title="Recent Bookings"
              action={
                bookings.length > 0 && (
                  <button
                    onClick={() => router.push('/my-bookings')}
                    className="group inline-flex items-center gap-1 text-[9px] tracking-[0.12em] 
                               uppercase text-gray-400 hover:text-black transition-colors"
                  >
                    View All
                    <ArrowUpRight size={11} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                )
              }
            />

            {bookingsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-gray-300" />
              </div>
            ) : bookings.length === 0 ? (
              <EmptyState
                icon={Car}
                title="No bookings yet"
                description="Book your first car wash service today"
                actionLabel="Book Now"
                actionHref="/bookings"
              />
            ) : (
              <div className="space-y-2.5">
                <div className="sm:hidden space-y-2.5">
                  {bookings.slice(0, 5).map((booking) => (
                    <MobileBookingCard 
                      key={booking._id} 
                      booking={booking} 
                      onClick={() => router.push('/my-bookings')} 
                    />
                  ))}
                </div>
                
                <div className="hidden sm:block space-y-2.5">
                  {bookings.slice(0, 5).map((booking) => (
                    <DesktopBookingCard 
                      key={booking._id} 
                      booking={booking} 
                      onClick={() => router.push('/my-bookings')} 
                    />
                  ))}
                </div>
                
                {bookings.length > 5 && (
                  <div className="text-center pt-3">
                    <button
                      onClick={() => router.push('/my-bookings')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg 
                                 text-[9px] tracking-[0.15em] uppercase min-h-[44px] hover:bg-gray-900 
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

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="border border-gray-200 rounded-lg p-4 sm:p-6" role="tabpanel" id="security-panel">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 border border-gray-200 rounded-full flex items-center justify-center">
                <Shield size={16} className="text-gray-400" />
              </div>
              <div>
                <h2 className="text-black" style={{ fontFamily: TYPOGRAPHY.serif, fontWeight: 300, fontSize: '16px' }}>
                  Change Password
                </h2>
                <p className="text-[9px] text-gray-400">Keep your account secure</p>
              </div>
            </div>
            
            <div className="h-px bg-gray-100 mb-5" />
            
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
              <PasswordField
                id="currentPassword"
                label="Current Password"
                value={passwordData.currentPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  setPasswordErrors({ ...passwordErrors, currentPassword: '' })
                }}
                showPassword={showPasswords}
                onToggle={() => setShowPasswords(!showPasswords)}
                placeholder="Enter current password"
                error={passwordErrors.currentPassword}
                required
              />
              
              <PasswordField
                id="newPassword"
                label="New Password"
                value={passwordData.newPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                  setPasswordErrors({ ...passwordErrors, newPassword: '' })
                }}
                showPassword={showPasswords}
                onToggle={() => setShowPasswords(!showPasswords)}
                placeholder="Enter new password"
                error={passwordErrors.newPassword}
                required
              />
              
              {!passwordErrors.newPassword && (
                <p className="text-[8px] text-gray-400 -mt-2">
                  {PASSWORD_REQUIREMENTS.message}
                </p>
              )}
              
              <PasswordField
                id="confirmNewPassword"
                label="Confirm Password"
                value={passwordData.confirmNewPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })
                  setPasswordErrors({ ...passwordErrors, confirmNewPassword: '' })
                }}
                showPassword={showPasswords}
                onToggle={() => setShowPasswords(!showPasswords)}
                placeholder="Confirm new password"
                error={passwordErrors.confirmNewPassword}
                required
              />
              
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 
                           bg-black text-white rounded-lg min-h-[44px] text-[9px] tracking-[0.15em] 
                           uppercase hover:bg-gray-900 active:scale-[0.98] transition-all 
                           disabled:opacity-50"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <><Lock size={12} />Update Password</>}
              </button>
            </form>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4" role="tabpanel" id="settings-panel">
            {stats && (
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="block w-3 h-px bg-gray-300" />
                  <h3 className="text-[8px] tracking-[0.25em] uppercase text-gray-400">
                    Account Overview
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <StatCard value={stats.bookings?.total || 0} label="Total Bookings" icon={Car} />
                  <StatCard value={stats.bookings?.completed || 0} label="Completed" icon={CheckCircle} />
                  <StatCard value={`₹${stats.totalSpent || 0}`} label="Total Spent" icon={Calendar} />
                  <StatCard value={stats.totalReviews || 0} label="Reviews" icon={Star} />
                </div>
              </div>
            )}
            
            <div className="border border-red-200 rounded-lg p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 border border-red-200 bg-red-50 rounded-full flex items-center justify-center">
                  <AlertCircle size={16} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-black" style={{ fontFamily: TYPOGRAPHY.serif, fontWeight: 400, fontSize: '14px' }}>
                    Danger Zone
                  </h3>
                  <p className="text-[9px] text-gray-400">Irreversible actions</p>
                </div>
              </div>
              
              <div className="h-px bg-red-100 my-4" />
              
              <p className="text-[11px] text-gray-500 leading-relaxed mb-4 max-w-md">
                Deactivating your account will revoke access to all data. Contact support to reactivate.
              </p>
              
              <button
                onClick={() => setShowDeactivateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-red-600 border border-red-200 
                           rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 
                           active:scale-[0.98] transition-all text-[9px] tracking-[0.12em] uppercase"
              >
                <Trash2 size={12} />
                Deactivate Account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav 
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]"
        role="tablist"
        aria-label="Profile navigation"
      >
        <div className="grid grid-cols-4 h-16">
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
                           transition-all duration-200
                           ${isActive 
                             ? 'text-black' 
                             : 'text-gray-400 active:bg-gray-50'
                           }
                           focus-visible:outline-none focus-visible:bg-gray-50`}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[3px] bg-black rounded-b-full" />
                )}
                
                <div className={`relative ${isActive ? 'transform scale-110' : ''} transition-transform duration-200`}>
                  {isActive && (
                    <div className="absolute inset-0 bg-black/5 rounded-full scale-150" />
                  )}
                  <Icon 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className="relative"
                  />
                </div>
                
                <span 
                  className={`text-[7px] tracking-[0.1em] uppercase transition-all duration-200
                             ${isActive ? 'font-semibold' : 'font-normal'}`}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
        
        <div className="h-[env(safe-area-inset-bottom)] bg-white" />
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
    </div>
  )
}