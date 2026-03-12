"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  User, Mail, Calendar, Car, Settings, Lock, Trash2, 
  Edit2, Save, X, ChevronRight, Star, Clock, CheckCircle,
  XCircle, Loader2
} from 'lucide-react'
import { 
  getUserProfile, 
  updateUserProfile, 
  changePassword, 
  getUserBookings,
  getUserStats,
  deactivateAccount 
} from '@/lib/user.api'

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
}

const STATUS_ICONS = {
  pending: Clock,
  confirmed: CheckCircle,
  'in-progress': Loader2,
  completed: CheckCircle,
  cancelled: XCircle
}

export default function ProfilePage() {
  const { user, loading: authLoading, logout, checkAuth } = useAuth()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Profile data
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: ''
  })
  
  // Password data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState(false)
  
  // Bookings data
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  
  // Delete account
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  // Fetch profile data
  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchStats()
    }
  }, [user])

  // Fetch bookings when tab changes
  useEffect(() => {
    if (user && activeTab === 'bookings') {
      fetchBookings()
    }
  }, [user, activeTab])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await getUserProfile()
      setProfile(data)
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || ''
      })
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
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      await checkAuth()
      await fetchProfile()
      
      setTimeout(() => setSuccess(''), 3000)
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

    // Validation
    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError('New passwords do not match')
      return
    }

    // Password strength check
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
      setSuccess('Password changed successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      })
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivateAccount = async () => {
    if (!deletePassword) {
      setError('Please enter your password to confirm')
      return
    }

    setSaving(true)
    setError('')

    try {
      await deactivateAccount(deletePassword)
      logout()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setFormData({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || ''
    })
    setError('')
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'bookings', label: 'My Bookings', icon: Car },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }} className="min-h-screen bg-gray-50 pt-0">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 md:px-16 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-2xl sm:text-3xl text-black"
                style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
              >
                My Account
              </h1>
              <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mt-2">
                Manage your profile and preferences
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="text-[9px] tracking-[0.2em] uppercase text-gray-400 hover:text-black transition-colors duration-300"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 md:px-16 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 overflow-hidden">
              {/* User Info */}
              <div className="p-6 border-b border-gray-100 text-center">
                <div className="w-20 h-20 mx-auto bg-black rounded-full flex items-center justify-center">
                  <span 
                    className="text-white text-2xl"
                    style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
                  >
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <h3 
                  className="mt-4 text-[14px] tracking-[0.1em] text-black"
                  style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}
                >
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-[10px] tracking-[0.1em] text-gray-400 mt-1">
                  {user?.email}
                </p>
                
                {/* Quick Stats */}
                {stats && (
                  <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-[20px] text-black" style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}>
                        {stats.bookings?.total || 0}
                      </p>
                      <p className="text-[8px] tracking-[0.2em] uppercase text-gray-400">Bookings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[20px] text-black" style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}>
                        ₹{stats.totalSpent || 0}
                      </p>
                      <p className="text-[8px] tracking-[0.2em] uppercase text-gray-400">Spent</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <nav className="p-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setError('')
                        setSuccess('')
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-[9px] tracking-[0.2em] uppercase transition-colors duration-300 ${
                        activeTab === tab.id
                          ? 'bg-black text-white'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={14} strokeWidth={1.5} />
                      <span>{tab.label}</span>
                      <ChevronRight size={12} className="ml-auto" />
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 p-8">
              
              {/* Messages */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100">
                  <p className="text-[10px] tracking-[0.15em] uppercase text-red-600">
                    {error}
                  </p>
                </div>
              )}
              
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100">
                  <p className="text-[10px] tracking-[0.15em] uppercase text-green-600">
                    {success}
                  </p>
                </div>
              )}

              {/* ============================================ */}
              {/* PROFILE TAB */}
              {/* ============================================ */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h2 
                      className="text-xl text-black"
                      style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
                    >
                      Personal Information
                    </h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 text-[9px] tracking-[0.2em] uppercase border border-gray-200 hover:border-black transition-colors duration-300"
                      >
                        <Edit2 size={12} strokeWidth={1.5} />
                        Edit
                      </button>
                    ) : (
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2 px-4 py-2 text-[9px] tracking-[0.2em] uppercase border border-gray-200 hover:border-black transition-colors duration-300"
                      >
                        <X size={12} strokeWidth={1.5} />
                        Cancel
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* First Name */}
                      <div>
                        <label className="block text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          disabled={!isEditing}
                          className={`w-full px-4 py-3.5 border border-gray-200 text-[12px] tracking-[0.05em] ${
                            isEditing ? 'bg-white focus:border-black' : 'bg-gray-50'
                          } focus:outline-none transition-colors duration-300`}
                        />
                      </div>

                      {/* Last Name */}
                      <div>
                        <label className="block text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          disabled={!isEditing}
                          className={`w-full px-4 py-3.5 border border-gray-200 text-[12px] tracking-[0.05em] ${
                            isEditing ? 'bg-white focus:border-black' : 'bg-gray-50'
                          } focus:outline-none transition-colors duration-300`}
                        />
                      </div>
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                      <label className="block text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                          type="email"
                          value={profile?.email || ''}
                          disabled
                          className="w-full pl-12 pr-4 py-3.5 border border-gray-200 text-[12px] tracking-[0.05em] bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-[8px] tracking-[0.1em] text-gray-400 mt-2">
                        Email address cannot be changed
                      </p>
                    </div>

                    {/* Account Info */}
                    <div className="pt-6 border-t border-gray-100">
                      <h3 className="text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-4">
                        Account Details
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                        <div>
                          <p className="text-[9px] tracking-[0.2em] uppercase text-gray-400">Member Since</p>
                          <p className="text-[12px] text-black mt-1">
                            {profile?.createdAt 
                              ? new Date(profile.createdAt).toLocaleDateString('en-IN', { 
                                  year: 'numeric', 
                                  month: 'long' 
                                })
                              : 'N/A'
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] tracking-[0.2em] uppercase text-gray-400">Status</p>
                          <p className="text-[12px] text-green-600 mt-1 flex items-center gap-1">
                            <CheckCircle size={12} />
                            Active
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] tracking-[0.2em] uppercase text-gray-400">Email Verified</p>
                          <p className="text-[12px] text-green-600 mt-1 flex items-center gap-1">
                            <CheckCircle size={12} />
                            Verified
                          </p>
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="pt-6">
                        <button
                          type="submit"
                          disabled={saving}
                          className="relative flex items-center justify-center gap-2 px-8 py-4 bg-black text-white text-[10px] tracking-[0.22em] uppercase overflow-hidden group disabled:opacity-50"
                        >
                          <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                          {saving ? (
                            <Loader2 size={14} className="relative z-10 animate-spin" />
                          ) : (
                            <>
                              <Save size={14} strokeWidth={1.5} className="relative z-10 group-hover:text-black transition-colors duration-500" />
                              <span className="relative z-10 group-hover:text-black transition-colors duration-500">
                                Save Changes
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* ============================================ */}
              {/* BOOKINGS TAB */}
              {/* ============================================ */}
              {activeTab === 'bookings' && (
                <div>
                  <h2 
                    className="text-xl text-black mb-8"
                    style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
                  >
                    My Bookings
                  </h2>

                  {bookingsLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 size={24} className="animate-spin text-gray-400" />
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-16 border border-gray-100">
                      <Car size={48} className="mx-auto text-gray-200 mb-4" strokeWidth={1} />
                      <p className="text-[11px] tracking-[0.15em] uppercase text-gray-400 mb-6">
                        No bookings yet
                      </p>
                      <button
                        onClick={() => router.push('/services')}
                        className="relative inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-[10px] tracking-[0.22em] uppercase overflow-hidden group"
                      >
                        <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                        <span className="relative z-10 group-hover:text-black transition-colors duration-500">
                          Book Your First Wash
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => {
                        const StatusIcon = STATUS_ICONS[booking.status] || Clock
                        return (
                          <div 
                            key={booking._id} 
                            className="border border-gray-100 p-5 hover:border-gray-300 transition-colors duration-300"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 
                                    className="text-[14px] text-black"
                                    style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}
                                  >
                                    {booking.serviceName}
                                  </h3>
                                  <span className={`px-2 py-1 text-[8px] tracking-[0.2em] uppercase ${STATUS_COLORS[booking.status]}`}>
                                    {booking.status}
                                  </span>
                                </div>
                                <p className="text-[9px] tracking-[0.15em] uppercase text-gray-400 mb-3">
                                  {booking.bookingCode} · {booking.vehicleTypeName}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar size={12} strokeWidth={1.5} />
                                    {new Date(booking.bookingDate).toLocaleDateString('en-IN', {
                                      weekday: 'short',
                                      day: 'numeric',
                                      month: 'short'
                                    })}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock size={12} strokeWidth={1.5} />
                                    {booking.timeSlot}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p 
                                  className="text-[18px] text-black"
                                  style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
                                >
                                  ₹{booking.price}
                                </p>
                                <p className="text-[8px] tracking-[0.2em] uppercase text-gray-400 mt-1">
                                  {booking.duration} mins
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ============================================ */}
              {/* SECURITY TAB */}
              {/* ============================================ */}
              {activeTab === 'security' && (
                <div>
                  <h2 
                    className="text-xl text-black mb-8"
                    style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
                  >
                    Change Password
                  </h2>

                  <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                    <div>
                      <label className="block text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
                        Current Password
                      </label>
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        required
                        className="w-full px-4 py-3.5 border border-gray-200 text-[12px] tracking-[0.05em] focus:outline-none focus:border-black transition-colors duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
                        New Password
                      </label>
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        required
                        className="w-full px-4 py-3.5 border border-gray-200 text-[12px] tracking-[0.05em] focus:outline-none focus:border-black transition-colors duration-300"
                      />
                      <p className="text-[8px] tracking-[0.1em] text-gray-400 mt-2">
                        Min 8 characters with uppercase, lowercase, number & special character
                      </p>
                    </div>

                    <div>
                      <label className="block text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={passwordData.confirmNewPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                        required
                        className="w-full px-4 py-3.5 border border-gray-200 text-[12px] tracking-[0.05em] focus:outline-none focus:border-black transition-colors duration-300"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="showPasswords"
                        checked={showPasswords}
                        onChange={(e) => setShowPasswords(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label htmlFor="showPasswords" className="text-[10px] tracking-[0.1em] text-gray-500">
                        Show passwords
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="relative w-full flex items-center justify-center gap-2 px-8 py-4 bg-black text-white text-[10px] tracking-[0.22em] uppercase overflow-hidden group disabled:opacity-50"
                    >
                      <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                      {saving ? (
                        <Loader2 size={14} className="relative z-10 animate-spin" />
                      ) : (
                        <>
                          <Lock size={14} strokeWidth={1.5} className="relative z-10 group-hover:text-black transition-colors duration-500" />
                          <span className="relative z-10 group-hover:text-black transition-colors duration-500">
                            Update Password
                          </span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* ============================================ */}
              {/* SETTINGS TAB */}
              {/* ============================================ */}
              {activeTab === 'settings' && (
                <div>
                  <h2 
                    className="text-xl text-black mb-8"
                    style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
                  >
                    Account Settings
                  </h2>

                  {/* Account Stats */}
                  {stats && (
                    <div className="border border-gray-100 p-6 mb-8">
                      <h3 className="text-[9px] tracking-[0.3em] uppercase text-gray-400 mb-4">
                        Account Overview
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <div>
                          <p 
                            className="text-[24px] text-black"
                            style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
                          >
                            {stats.bookings?.total || 0}
                          </p>
                          <p className="text-[9px] tracking-[0.15em] uppercase text-gray-400">Total Bookings</p>
                        </div>
                        <div>
                          <p 
                            className="text-[24px] text-black"
                            style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
                          >
                            {stats.bookings?.completed || 0}
                          </p>
                          <p className="text-[9px] tracking-[0.15em] uppercase text-gray-400">Completed</p>
                        </div>
                        <div>
                          <p 
                            className="text-[24px] text-black"
                            style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
                          >
                            ₹{stats.totalSpent || 0}
                          </p>
                          <p className="text-[9px] tracking-[0.15em] uppercase text-gray-400">Total Spent</p>
                        </div>
                        <div>
                          <p 
                            className="text-[24px] text-black"
                            style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}
                          >
                            {stats.totalReviews || 0}
                          </p>
                          <p className="text-[9px] tracking-[0.15em] uppercase text-gray-400">Reviews Given</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Danger Zone */}
                  <div className="border border-red-200 bg-red-50/50 p-6">
                    <h3 className="text-[9px] tracking-[0.3em] uppercase text-red-600 mb-2">
                      Danger Zone
                    </h3>
                    <p className="text-[11px] text-gray-600 mb-6 leading-5">
                      Once you deactivate your account, you will not be able to access it. 
                      Please contact support to reactivate.
                    </p>
                    
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 px-6 py-3 border border-red-300 text-red-600 text-[10px] tracking-[0.2em] uppercase hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors duration-300"
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                        Deactivate Account
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-[10px] tracking-[0.1em] text-red-600">
                          Enter your password to confirm:
                        </p>
                        <input
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="Your password"
                          className="w-full max-w-xs px-4 py-3 border border-red-200 text-[12px] focus:outline-none focus:border-red-400"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={handleDeactivateAccount}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white text-[10px] tracking-[0.2em] uppercase hover:bg-red-700 transition-colors duration-300 disabled:opacity-50"
                          >
                            {saving ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <>
                                <Trash2 size={14} strokeWidth={1.5} />
                                Confirm Deactivation
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(false)
                              setDeletePassword('')
                            }}
                            className="px-6 py-3 border border-gray-300 text-[10px] tracking-[0.2em] uppercase hover:border-black transition-colors duration-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}