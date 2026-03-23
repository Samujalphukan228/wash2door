import api from './api'

// ============================================
// LOGIN
// ============================================
export const login = async (email, password) => {
  try {
    const res = await api.post('/auth/login', { email, password })
    
    if (res.data?.success) {
      const { user, accessToken } = res.data.data
      
      // Store token
      localStorage.setItem('accessToken', accessToken)
      
      console.log('✅ Login successful:', user.email)
      
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

// ============================================
// REGISTER (Link-Based - NEW)
// ============================================
export const register = async (firstName, lastName, email, password, confirmPassword) => {
  try {
    console.log('📡 Registering user:', email)
    
    const res = await api.post('/auth/register', {
      firstName,
      lastName,
      email,
      password,
      confirmPassword
    })
    
    console.log('✅ Registration response:', res.data)
    
    if (res.data?.success) {
      return {
        ...res.data.data,
        email: email  // Include email for modal
      }
    }
    
    throw new Error(res.data?.message || 'Registration failed')
    
  } catch (error) {
    console.error('❌ Registration error:', error)
    throw new Error(
      error.response?.data?.message || error.message || 'Registration failed'
    )
  }
}

// ============================================
// VERIFY REGISTRATION (Link-Based - NEW)
// ============================================
export const verifyRegistration = async (token) => {
  try {
    console.log('📡 Calling verify API with token:', token)
    
    const res = await api.get(`/auth/verify-registration/${token}`)
    
    console.log('📩 API Response:', res.data)
    
    if (res.data?.success) {
      const { user, accessToken } = res.data.data
      
      // Validate response data
      if (!user) {
        throw new Error('No user data in response')
      }
      if (!accessToken) {
        throw new Error('No access token in response')
      }
      
      // Store token
      localStorage.setItem('accessToken', accessToken)
      
      console.log('✅ Registration verified:', user.email)
      
      return { user, accessToken }
    }
    
    throw new Error(res.data?.message || 'Verification failed')
    
  } catch (error) {
    console.error('❌ Verification error:', error)
    console.error('❌ Error response:', error.response?.data)
    throw new Error(
      error.response?.data?.message || error.message || 'Verification failed'
    )
  }
}

// ============================================
// RESEND REGISTRATION EMAIL (Link-Based - NEW)
// ============================================
export const resendRegistrationEmail = async (email) => {
  try {
    console.log('📡 Resending registration email to:', email)
    
    const res = await api.post('/auth/resend-registration-email', { email })
    
    if (res.data?.success) {
      return res.data.data
    }
    
    throw new Error(res.data?.message || 'Failed to resend email')
    
  } catch (error) {
    console.error('❌ Resend email error:', error)
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to resend email'
    )
  }
}

// ============================================
// GET CURRENT USER
// ============================================
export const getMe = async () => {
  try {
    const res = await api.get('/auth/me')
    
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

// ============================================
// LOGOUT
// ============================================
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

// ============================================
// FORGOT PASSWORD
// ============================================
export const forgotPassword = async (email) => {
  try {
    console.log('📡 Sending forgot password email to:', email)
    
    const res = await api.post('/auth/forgot-password', { email })
    
    if (res.data?.success) {
      return res.data.message
    }
    
    throw new Error(res.data?.message || 'Failed to send reset email')
    
  } catch (error) {
    console.error('❌ Forgot password error:', error)
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to send reset email'
    )
  }
}

// ============================================
// RESET PASSWORD
// ============================================
export const resetPassword = async (token, password) => {
  try {
    console.log('📡 Resetting password with token:', token)
    
    const res = await api.post(`/auth/reset-password/${token}`, { password })
    
    if (res.data?.success) {
      return res.data.message
    }
    
    throw new Error(res.data?.message || 'Password reset failed')
    
  } catch (error) {
    console.error('❌ Reset password error:', error)
    throw new Error(
      error.response?.data?.message || error.message || 'Password reset failed'
    )
  }
}

// ============================================
// CHANGE PASSWORD
// ============================================
export const changePassword = async (currentPassword, newPassword) => {
  try {
    console.log('📡 Changing password')
    
    const res = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    })
    
    if (res.data?.success) {
      localStorage.setItem('accessToken', res.data.data.accessToken)
      return res.data.data
    }
    
    throw new Error(res.data?.message || 'Password change failed')
    
  } catch (error) {
    console.error('❌ Change password error:', error)
    throw new Error(
      error.response?.data?.message || error.message || 'Password change failed'
    )
  }
}

// ============================================
// VERIFY EMAIL (For existing users)
// ============================================
export const verifyEmail = async (token) => {
  try {
    console.log('📡 Verifying email with token:', token)
    
    const res = await api.get(`/auth/verify-email/${token}`)
    
    if (res.data?.success) {
      return res.data.message
    }
    
    throw new Error(res.data?.message || 'Email verification failed')
    
  } catch (error) {
    console.error('❌ Email verification error:', error)
    throw new Error(
      error.response?.data?.message || error.message || 'Email verification failed'
    )
  }
}

// ============================================
// RESEND VERIFICATION EMAIL
// ============================================
export const resendVerificationEmail = async () => {
  try {
    console.log('📡 Resending verification email')
    
    const res = await api.post('/auth/resend-verification')
    
    if (res.data?.success) {
      return res.data.message
    }
    
    throw new Error(res.data?.message || 'Failed to resend verification email')
    
  } catch (error) {
    console.error('❌ Resend verification error:', error)
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to resend verification email'
    )
  }
}