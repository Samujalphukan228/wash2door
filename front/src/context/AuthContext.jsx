"use client"

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getMe, logout as logoutAPI } from '@/lib/auth.api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalView, setModalView] = useState('login')
  const [authEmail, setAuthEmail] = useState('')

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken')

      if (!token) {
        setUser(null)
        return
      }

      const userData = await getMe()

      if (userData) {
        setUser(userData)
      } else {
        setUser(null)
        localStorage.removeItem('accessToken')
      }
    } catch (error) {
      setUser(null)
      localStorage.removeItem('accessToken')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    if (isMounted) checkAuth()
    return () => { isMounted = false }
  }, [checkAuth])

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
    setUser(userData)
    closeModal()
  }, [closeModal])

  const logout = useCallback(async () => {
    try {
      await logoutAPI()
    } finally {
      localStorage.removeItem('accessToken')
      setUser(null)
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/')) {
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
    checkAuth,
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