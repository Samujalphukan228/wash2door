import api from './api'

export const login = async (email, password) => {
  try {
    const res = await api.post('/auth/login', { email, password })
    
    if (res.data?.success) {
      const { user, accessToken } = res.data.data
      localStorage.setItem('accessToken', accessToken)
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
      return {
        ...res.data.data,
        email: email
      }
    }
    
    throw new Error(res.data?.message || 'Registration failed')
    
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Registration failed'
    )
  }
}

export const verifyRegistration = async (token) => {
  try {
    const res = await api.get(`/auth/verify-registration/${token}`)
    
    if (res.data?.success) {
      const { user, accessToken } = res.data.data
      
      if (!user) {
        throw new Error('No user data in response')
      }
      if (!accessToken) {
        throw new Error('No access token in response')
      }
      
      localStorage.setItem('accessToken', accessToken)
      
      return { user, accessToken }
    }
    
    throw new Error(res.data?.message || 'Verification failed')
    
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Verification failed'
    )
  }
}

export const resendRegistrationEmail = async (email) => {
  try {
    const res = await api.post('/auth/resend-registration-email', { email })
    
    if (res.data?.success) {
      return res.data.data
    }
    
    throw new Error(res.data?.message || 'Failed to resend email')
    
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to resend email'
    )
  }
}

export const getMe = async () => {
  try {
    const res = await api.get('/auth/me')
    
    if (res.data?.success && res.data?.data?.user) {
      return res.data.data.user
    }
    
    return null
    
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
    }
    
    return null
  }
}

export const logout = async () => {
  try {
    await api.post('/auth/logout')
    localStorage.removeItem('accessToken')
    return true
  } catch (error) {
    localStorage.removeItem('accessToken')
    return true
  }
}

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

export const resetPassword = async (token, password) => {
  try {
    const res = await api.post(`/auth/reset-password/${token}`, { password })
    
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

export const changePassword = async (currentPassword, newPassword) => {
  try {
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
    throw new Error(
      error.response?.data?.message || error.message || 'Password change failed'
    )
  }
}

export const verifyEmail = async (token) => {
  try {
    const res = await api.get(`/auth/verify-email/${token}`)
    
    if (res.data?.success) {
      return res.data.message
    }
    
    throw new Error(res.data?.message || 'Email verification failed')
    
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Email verification failed'
    )
  }
}

export const resendVerificationEmail = async () => {
  try {
    const res = await api.post('/auth/resend-verification')
    
    if (res.data?.success) {
      return res.data.message
    }
    
    throw new Error(res.data?.message || 'Failed to resend verification email')
    
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to resend verification email'
    )
  }
}