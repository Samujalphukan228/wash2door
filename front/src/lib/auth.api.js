// lib/auth.api.js
import api from './api'

// Login - NOW STORES TOKEN
export const login = async (email, password) => {
  try {
    const res = await api.post('/auth/login', { email, password })
    
    if (res.data?.success) {
      const { user, accessToken } = res.data.data
      
      // ✅ STORE TOKEN IMMEDIATELY
      localStorage.setItem('accessToken', accessToken)
      
      console.log('✅ Token stored, user logged in:', user)
      
      return { user, accessToken }
    }
    
    throw new Error(res.data?.message || 'Login failed')
    
  } catch (error) {
    const err = new Error(
      error.response?.data?.message || error.message || 'Login failed'
    )
    err.remainingAttempts = error.response?.data?.remainingAttempts
    throw err
  }
}

// Verify OTP - ALSO STORE TOKEN
export const verifyOTP = async (email, otp) => {
  try {
    const res = await api.post('/auth/verify-otp', { email, otp })
    
    if (res.data?.success) {
      const { user, accessToken } = res.data.data
      
      // ✅ STORE TOKEN
      localStorage.setItem('accessToken', accessToken)
      
      console.log('✅ OTP verified, token stored:', user)
      
      return { user, accessToken }
    }
    
    throw new Error(res.data?.message || 'OTP verification failed')
    
  } catch (error) {
    const err = new Error(
      error.response?.data?.message || error.message || 'OTP verification failed'
    )
    err.attemptsRemaining = error.response?.data?.attemptsRemaining
    throw err
  }
}

// Register
export const register = async (firstName, lastName, email, password, confirmPassword) => {
  try {
    const res = await api.post('/auth/register', {
      firstName,
      lastName,
      email,
      password,
      confirmPassword
    })
    
    if (res.data?.success) {
      return res.data.data
    }
    
    throw new Error(res.data?.message || 'Registration failed')
    
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Registration failed'
    )
  }
}

// Resend OTP
export const resendOTP = async (email) => {
  try {
    const res = await api.post('/auth/resend-otp', { email })
    
    if (res.data?.success) {
      return res.data.data
    }
    
    throw new Error(res.data?.message || 'Failed to resend OTP')
    
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to resend OTP'
    )
  }
}

// Get current user
export const getMe = async () => {
  try {
    const res = await api.get('/auth/me')
    
    console.log('📡 getMe response:', res.data)
    
    if (res.data?.success && res.data?.data?.user) {
      return res.data.data.user
    }
    
    return null
    
  } catch (error) {
    console.error('❌ getMe error:', error.message)
    
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
    }
    
    return null
  }
}

// Logout
export const logout = async () => {
  try {
    await api.post('/auth/logout')
    localStorage.removeItem('accessToken')
    return true
  } catch (error) {
    console.error('Logout error:', error)
    localStorage.removeItem('accessToken')
    return true
  }
}

// Forgot password
export const forgotPassword = async (email) => {
  try {
    const res = await api.post('/auth/forgot-password', { email })
    
    if (res.data?.success) {
      return res.data.message
    }
    
    throw new Error(res.data?.message || 'Failed to send reset email')
    
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to send reset email'
    )
  }
}

// Reset password
export const resetPassword = async (token, password, confirmPassword) => {
  try {
    const res = await api.post(`/auth/reset-password/${token}`, {
      password,
      confirmPassword
    })
    
    if (res.data?.success) {
      return res.data.message
    }
    
    throw new Error(res.data?.message || 'Password reset failed')
    
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Password reset failed'
    )
  }
}