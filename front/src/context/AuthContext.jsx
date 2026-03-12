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

  // Check auth on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
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
  }

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

  // ✅ IMPROVED: loginSuccess now just needs user data
  const loginSuccess = useCallback((userData) => {
    console.log('✅ Login success, updating user state:', userData)
    setUser(userData)
    closeModal()
    
    // Optional: Reload to ensure fresh state
    // setTimeout(() => window.location.reload(), 100)
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
      
      if (typeof window !== 'undefined') {
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