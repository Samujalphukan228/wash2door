"use client"

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getMe, logout as logoutAPI } from '@/lib/auth.api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalView, setModalView] = useState('login')
  const [authEmail, setAuthEmail] = useState('')

  // ✅ FIX 1: Memoize checkAuth with useCallback
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken')
      
      if (!token) {
        console.log('❌ No token found')
        setUser(null)
        setLoading(false)
        return
      }

      console.log('🔍 Checking auth with token...')
      const userData = await getMe()
      
      if (userData) {
        console.log('✅ User authenticated:', userData)
        setUser(userData)
      } else {
        console.log('❌ No user data returned')
        setUser(null)
        localStorage.removeItem('accessToken')
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error)
      setUser(null)
      localStorage.removeItem('accessToken')
    } finally {
      setLoading(false)
    }
  }, []) // ✅ Empty deps is OK now because function is stable

  // ✅ FIX 2: Only run checkAuth ONCE on mount
  useEffect(() => {
    let isMounted = true

    async function initAuth() {
      if (isMounted) {
        await checkAuth()
      }
    }

    initAuth()

    return () => {
      isMounted = false
    }
  }, [checkAuth]) // ✅ checkAuth is now stable, so this won't re-run

  // Modal controls
  const openModal = useCallback((view = 'login') => {
    setModalView(view)
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden'
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    document.body.style.overflow = 'unset'
    setTimeout(() => {
      setModalView('login')
      setAuthEmail('')
    }, 300)
  }, [])

  const switchView = useCallback((view, email = '') => {
    if (email) setAuthEmail(email)
    setModalView(view)
  }, [])

  const loginSuccess = useCallback((userData) => {
    console.log('✅ Login success, updating user state:', userData)
    setUser(userData)
    closeModal()
  }, [closeModal])

  const logout = useCallback(async () => {
    console.log('👋 Logging out...')
    try {
      await logoutAPI()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      setUser(null)
      
      // ✅ FIX 3: Prevent reload loop on logout
      if (typeof window !== 'undefined' && 
          !window.location.pathname.includes('/')) {
        window.location.href = '/'
      }
    }
  }, [])

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated: !!user,
    
    isModalOpen,
    modalView,
    authEmail,
    
    openModal,
    closeModal,
    switchView,
    
    loginSuccess,
    logout,
    checkAuth
  }

  // ✅ FIX 4: Show loading state to prevent flash
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}