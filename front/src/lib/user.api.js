import api from './api'

export const getUserProfile = async () => {
  try {
    const res = await api.get('/auth/me')
    
    if (res.data?.success) {
      return res.data.data.user
    }
    
    throw new Error(res.data?.message || 'Failed to fetch profile')
    
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch profile'
    )
  }
}

export const updateUserProfile = async (data) => {
  try {
    const res = await api.put('/auth/update-profile', {
      firstName: data.firstName,
      lastName: data.lastName
    })
    
    if (res.data?.success) {
      return res.data.data.user
    }
    
    throw new Error(res.data?.message || 'Failed to update profile')
    
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to update profile'
    )
  }
}

export const changePassword = async (currentPassword, newPassword, confirmNewPassword) => {
  try {
    const res = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmNewPassword
    })
    
    if (res.data?.success) {
      if (res.data.data?.accessToken) {
        localStorage.setItem('accessToken', res.data.data.accessToken)
      }
      return res.data.message
    }
    
    throw new Error(res.data?.message || 'Failed to change password')
    
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to change password'
    )
  }
}

export const getUserBookings = async (status = '', page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    params.append('page', page)
    params.append('limit', limit)
    
    const res = await api.get(`/bookings/my-bookings?${params.toString()}`)
    
    if (res.data?.success) {
      return res.data.data
    }
    
    throw new Error(res.data?.message || 'Failed to fetch bookings')
    
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch bookings'
    )
  }
}

export const getUserStats = async () => {
  try {
    const res = await api.get('/auth/me/stats')
    
    if (res.data?.success) {
      return res.data.data
    }
    
    throw new Error(res.data?.message || 'Failed to fetch stats')
    
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch stats'
    )
  }
}

export const deactivateAccount = async (password) => {
  try {
    const res = await api.delete('/auth/deactivate', {
      data: { password }
    })
    
    if (res.data?.success) {
      localStorage.removeItem('accessToken')
      return res.data.message
    }
    
    throw new Error(res.data?.message || 'Failed to deactivate account')
    
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to deactivate account'
    )
  }
}

export const updateAvatar = async (file) => {
  try {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const res = await api.put('/auth/update-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    if (res.data?.success) {
      return res.data.data.avatar
    }
    
    throw new Error(res.data?.message || 'Failed to update avatar')
    
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to update avatar'
    )
  }
}