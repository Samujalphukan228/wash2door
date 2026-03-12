"use client"

import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { 
  X, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Droplets
} from 'lucide-react'
import { 
  login as loginAPI, 
  register as registerAPI, 
  verifyOTP as verifyOTPAPI,
  resendOTP as resendOTPAPI,
  forgotPassword as forgotPasswordAPI 
} from '@/lib/auth.api'

// ============================================
// MAIN MODAL COMPONENT
// ============================================

export default function AuthModal() {
  const { isModalOpen, modalView, closeModal } = useAuth()
  const overlayRef = useRef(null)

  // ✅ Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      // Save current scroll position
      const scrollY = window.scrollY
      
      // Lock body
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflow = 'hidden'
      document.body.style.width = '100%'
      
      return () => {
        // Unlock body and restore scroll position
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.overflow = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isModalOpen])

  // Close on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeModal()
    }
    if (isModalOpen) {
      window.addEventListener('keydown', handleEscape)
    }
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isModalOpen, closeModal])

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) closeModal()
  }

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          ref={overlayRef}
          onClick={handleOverlayClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overscroll-none touch-none"
          style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full max-w-md bg-white overflow-hidden rounded-[5px] max-h-[90vh] overflow-y-auto overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black transition-colors duration-300"
              aria-label="Close"
            >
              <X size={20} strokeWidth={1.5} />
            </button>

            {/* Content */}
            <div className="p-8 md:p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={modalView}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {modalView === 'login' && <LoginView />}
                  {modalView === 'register' && <RegisterView />}
                  {modalView === 'otp' && <OTPView />}
                  {modalView === 'forgot' && <ForgotPasswordView />}
                  {modalView === 'reset-success' && <ResetSuccessView />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================
// LOGIN VIEW
// ============================================

function LoginView() {
  const { switchView, loginSuccess } = useAuth()
  
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [remainingAttempts, setRemainingAttempts] = useState(null)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      const response = await loginAPI(formData.email, formData.password)
      loginSuccess(response.user)
    } catch (err) {
      setError(err.message)
      if (err.remainingAttempts !== undefined) {
        setRemainingAttempts(err.remainingAttempts)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-6">
          <Droplets size={24} strokeWidth={1.5} className="text-blue-500" />
          <span
            className="text-[20px] text-black"
            style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
          >
            Wash<span className="text-blue-500">2</span>Door
          </span>
        </div>
        
        <h2
          className="text-black mb-2"
          style={{
            fontFamily: 'Georgia, serif',
            fontWeight: 300,
            fontSize: '1.75rem',
            lineHeight: 1.2
          }}
        >
          Welcome Back
        </h2>
        
        <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400">
          Sign in to continue
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border border-red-100 px-4 py-3 rounded-[3px]"
            >
              <p className="text-[10px] tracking-[0.15em] uppercase text-red-600">
                {error}
              </p>
              {remainingAttempts !== null && remainingAttempts > 0 && (
                <p className="text-[9px] tracking-[0.15em] uppercase text-red-400 mt-1">
                  {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email */}
        <div>
          <label className="block text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full bg-gray-50 border border-gray-200 pl-12 pr-4 py-3.5 text-[12px] tracking-[0.05em] text-black placeholder:text-gray-300 focus:outline-none focus:border-black transition-colors duration-300 rounded-[3px]"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-200 pl-12 pr-12 py-3.5 text-[12px] tracking-[0.05em] text-black placeholder:text-gray-300 focus:outline-none focus:border-black transition-colors duration-300 rounded-[3px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
            >
              {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => switchView('forgot')}
            className="text-[9px] tracking-[0.2em] uppercase text-gray-400 hover:text-black transition-colors"
          >
            Forgot Password?
          </button>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="relative w-full flex items-center justify-center gap-2 text-[10px] tracking-[0.22em] uppercase text-white bg-black border border-black py-4 overflow-hidden group disabled:opacity-50 rounded-[3px]"
        >
          <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
          {loading ? (
            <Loader2 size={16} className="relative z-10 animate-spin" />
          ) : (
            <>
              <span className="relative z-10 group-hover:text-black transition-colors duration-500">Sign In</span>
              <ArrowRight size={14} strokeWidth={1.5} className="relative z-10 group-hover:text-black transition-colors duration-500" />
            </>
          )}
        </motion.button>
      </form>

      {/* Switch to Register */}
      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-[10px] tracking-[0.15em] uppercase text-gray-400">
          Don&apos;t have an account?{' '}
          <button
            onClick={() => switchView('register')}
            className="text-black hover:underline"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  )
}

// ============================================
// REGISTER VIEW
// ============================================

function RegisterView() {
  const { switchView } = useAuth()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const { firstName, lastName, email, password, confirmPassword } = formData

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    if (!passwordRegex.test(password)) {
      setError('Password must contain uppercase, lowercase, number, and special character')
      return
    }

    setLoading(true)

    try {
      await registerAPI(firstName, lastName, email, password, confirmPassword)
      switchView('otp', email)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-6">
          <Droplets size={24} strokeWidth={1.5} className="text-blue-500" />
          <span
            className="text-[20px] text-black"
            style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
          >
            Wash<span className="text-blue-500">2</span>Door
          </span>
        </div>
        
        <h2
          className="text-black mb-2"
          style={{
            fontFamily: 'Georgia, serif',
            fontWeight: 300,
            fontSize: '1.75rem',
            lineHeight: 1.2
          }}
        >
          Create Account
        </h2>
        
        <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400">
          Join us today
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border border-red-100 px-4 py-3 rounded-[3px]"
            >
              <p className="text-[10px] tracking-[0.15em] uppercase text-red-600">
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
              First Name
            </label>
            <div className="relative">
              <User size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full bg-gray-50 border border-gray-200 pl-12 pr-4 py-3.5 text-[12px] tracking-[0.05em] text-black placeholder:text-gray-300 focus:outline-none focus:border-black transition-colors duration-300 rounded-[3px]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              className="w-full bg-gray-50 border border-gray-200 px-4 py-3.5 text-[12px] tracking-[0.05em] text-black placeholder:text-gray-300 focus:outline-none focus:border-black transition-colors duration-300 rounded-[3px]"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full bg-gray-50 border border-gray-200 pl-12 pr-4 py-3.5 text-[12px] tracking-[0.05em] text-black placeholder:text-gray-300 focus:outline-none focus:border-black transition-colors duration-300 rounded-[3px]"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 8 characters"
              className="w-full bg-gray-50 border border-gray-200 pl-12 pr-12 py-3.5 text-[12px] tracking-[0.05em] text-black placeholder:text-gray-300 focus:outline-none focus:border-black transition-colors duration-300 rounded-[3px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
            >
              {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
            </button>
          </div>
          <p className="text-[8px] tracking-[0.1em] text-gray-300 mt-2">
            Must contain uppercase, lowercase, number & special character
          </p>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-200 pl-12 pr-4 py-3.5 text-[12px] tracking-[0.05em] text-black placeholder:text-gray-300 focus:outline-none focus:border-black transition-colors duration-300 rounded-[3px]"
            />
          </div>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="relative w-full flex items-center justify-center gap-2 text-[10px] tracking-[0.22em] uppercase text-white bg-black border border-black py-4 overflow-hidden group disabled:opacity-50 mt-6 rounded-[3px]"
        >
          <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
          {loading ? (
            <Loader2 size={16} className="relative z-10 animate-spin" />
          ) : (
            <>
              <span className="relative z-10 group-hover:text-black transition-colors duration-500">Create Account</span>
              <ArrowRight size={14} strokeWidth={1.5} className="relative z-10 group-hover:text-black transition-colors duration-500" />
            </>
          )}
        </motion.button>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <p className="text-[10px] tracking-[0.15em] uppercase text-gray-400">
          Already have an account?{' '}
          <button
            onClick={() => switchView('login')}
            className="text-black hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  )
}

// ============================================
// OTP VERIFICATION VIEW
// ============================================

function OTPView() {
  const { switchView, authEmail, loginSuccess } = useAuth()
  
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [attemptsRemaining, setAttemptsRemaining] = useState(null)
  const [resendTimer, setResendTimer] = useState(30)
  
  const inputRefs = useRef([])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setError('')

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pasteData)) return

    const newOtp = [...otp]
    pasteData.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char
    })
    setOtp(newOtp)
    
    const lastIndex = Math.min(pasteData.length, 6) - 1
    inputRefs.current[lastIndex]?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const otpString = otp.join('')
    if (otpString.length !== 6) {
      setError('Please enter complete OTP')
      return
    }

    setLoading(true)

    try {
      const response = await verifyOTPAPI(authEmail, otpString)
      loginSuccess(response.user)
    } catch (err) {
      setError(err.message)
      if (err.attemptsRemaining !== undefined) {
        setAttemptsRemaining(err.attemptsRemaining)
      }
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return

    setResending(true)
    setError('')

    try {
      await resendOTPAPI(authEmail)
      setResendTimer(30)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err) {
      setError(err.message)
    } finally {
      setResending(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-16 h-16 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center"
        >
          <Mail size={28} strokeWidth={1.5} className="text-blue-500" />
        </motion.div>
        
        <h2
          className="text-black mb-2"
          style={{
            fontFamily: 'Georgia, serif',
            fontWeight: 300,
            fontSize: '1.75rem',
            lineHeight: 1.2
          }}
        >
          Verify Email
        </h2>
        
        <p className="text-[10px] tracking-[0.15em] uppercase text-gray-400">
          Enter the 6-digit code sent to
        </p>
        <p className="text-[11px] tracking-[0.1em] text-black mt-1">
          {authEmail}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border border-red-100 px-4 py-3 rounded-[3px]"
            >
              <p className="text-[10px] tracking-[0.15em] uppercase text-red-600">
                {error}
              </p>
              {attemptsRemaining !== null && attemptsRemaining > 0 && (
                <p className="text-[9px] tracking-[0.15em] uppercase text-red-400 mt-1">
                  {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <motion.input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="w-12 h-14 text-center text-[18px] font-medium bg-gray-50 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300 rounded-[3px]"
            />
          ))}
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading || otp.join('').length !== 6}
          whileTap={{ scale: 0.98 }}
          className="relative w-full flex items-center justify-center gap-2 text-[10px] tracking-[0.22em] uppercase text-white bg-black border border-black py-4 overflow-hidden group disabled:opacity-50 rounded-[3px]"
        >
          <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
          {loading ? (
            <Loader2 size={16} className="relative z-10 animate-spin" />
          ) : (
            <>
              <span className="relative z-10 group-hover:text-black transition-colors duration-500">Verify</span>
              <ArrowRight size={14} strokeWidth={1.5} className="relative z-10 group-hover:text-black transition-colors duration-500" />
            </>
          )}
        </motion.button>

        {/* Resend */}
        <div className="text-center">
          <p className="text-[10px] tracking-[0.15em] uppercase text-gray-400">
            Didn&apos;t receive code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendTimer > 0 || resending}
              className={`${resendTimer > 0 ? 'text-gray-300' : 'text-black hover:underline'}`}
            >
              {resending ? 'Sending...' : resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend'}
            </button>
          </p>
        </div>
      </form>

      {/* Back to Login */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <button
          onClick={() => switchView('login')}
          className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-gray-400 hover:text-black transition-colors mx-auto"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to Sign In
        </button>
      </div>
    </div>
  )
}

// ============================================
// FORGOT PASSWORD VIEW
// ============================================

function ForgotPasswordView() {
  const { switchView } = useAuth()
  
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Please enter your email')
      return
    }

    setLoading(true)

    try {
      await forgotPasswordAPI(email)
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-16 h-16 mx-auto mb-6 bg-green-50 rounded-full flex items-center justify-center"
        >
          <CheckCircle size={28} strokeWidth={1.5} className="text-green-500" />
        </motion.div>
        
        <h2
          className="text-black mb-3"
          style={{
            fontFamily: 'Georgia, serif',
            fontWeight: 300,
            fontSize: '1.5rem',
            lineHeight: 1.2
          }}
        >
          Check Your Email
        </h2>
        
        <p className="text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-8 max-w-xs mx-auto leading-5">
          If an account exists for {email}, you will receive a password reset link
        </p>

        <button
          onClick={() => switchView('login')}
          className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-gray-400 hover:text-black transition-colors mx-auto"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to Sign In
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center"
        >
          <Lock size={28} strokeWidth={1.5} className="text-gray-400" />
        </motion.div>
        
        <h2
          className="text-black mb-2"
          style={{
            fontFamily: 'Georgia, serif',
            fontWeight: 300,
            fontSize: '1.75rem',
            lineHeight: 1.2
          }}
        >
          Forgot Password?
        </h2>
        
        <p className="text-[10px] tracking-[0.15em] uppercase text-gray-400 max-w-xs mx-auto leading-5">
          Enter your email and we will send you a reset link
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border border-red-100 px-4 py-3 rounded-[3px]"
            >
              <p className="text-[10px] tracking-[0.15em] uppercase text-red-600">
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email */}
        <div>
          <label className="block text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              placeholder="you@example.com"
              className="w-full bg-gray-50 border border-gray-200 pl-12 pr-4 py-3.5 text-[12px] tracking-[0.05em] text-black placeholder:text-gray-300 focus:outline-none focus:border-black transition-colors duration-300 rounded-[3px]"
            />
          </div>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="relative w-full flex items-center justify-center gap-2 text-[10px] tracking-[0.22em] uppercase text-white bg-black border border-black py-4 overflow-hidden group disabled:opacity-50 rounded-[3px]"
        >
          <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
          {loading ? (
            <Loader2 size={16} className="relative z-10 animate-spin" />
          ) : (
            <>
              <span className="relative z-10 group-hover:text-black transition-colors duration-500">Send Reset Link</span>
              <ArrowRight size={14} strokeWidth={1.5} className="relative z-10 group-hover:text-black transition-colors duration-500" />
            </>
          )}
        </motion.button>
      </form>

      {/* Back to Login */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <button
          onClick={() => switchView('login')}
          className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-gray-400 hover:text-black transition-colors mx-auto"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to Sign In
        </button>
      </div>
    </div>
  )
}

// ============================================
// RESET SUCCESS VIEW
// ============================================

function ResetSuccessView() {
  const { switchView } = useAuth()

  return (
    <div className="text-center py-8">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-16 h-16 mx-auto mb-6 bg-green-50 rounded-full flex items-center justify-center"
      >
        <CheckCircle size={28} strokeWidth={1.5} className="text-green-500" />
      </motion.div>
      
      <h2
        className="text-black mb-3"
        style={{
          fontFamily: 'Georgia, serif',
          fontWeight: 300,
          fontSize: '1.5rem',
          lineHeight: 1.2
        }}
      >
        Password Reset!
      </h2>
      
      <p className="text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-8 max-w-xs mx-auto leading-5">
        Your password has been successfully reset. You can now sign in with your new password.
      </p>

      <motion.button
        onClick={() => switchView('login')}
        whileTap={{ scale: 0.98 }}
        className="relative inline-flex items-center justify-center gap-2 text-[10px] tracking-[0.22em] uppercase text-white bg-black border border-black px-8 py-4 overflow-hidden group rounded-[3px]"
      >
        <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
        <span className="relative z-10 group-hover:text-black transition-colors duration-500">Sign In</span>
        <ArrowRight size={14} strokeWidth={1.5} className="relative z-10 group-hover:text-black transition-colors duration-500" />
      </motion.button>
    </div>
  )
}