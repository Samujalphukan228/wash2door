import api from './api'

// Get all active services (Step 1)
export const getServices = async () => {
  try {
    const res = await api.get('/public/services')
    
    if (res.data?.success) {
      return res.data.data
    }
    
    return []
  } catch (error) {
    console.error('Failed to fetch services:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch services')
  }
}

// Get service with vehicle type pricing (Step 2)
export const getServicePricing = async (serviceId) => {
  try {
    const res = await api.get(`/bookings/pricing/${serviceId}`)
    
    if (res.data?.success) {
      return res.data.data
    }
    
    throw new Error('Failed to fetch pricing')
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch pricing')
  }
}

// Check availability (Step 3)
export const checkAvailability = async (serviceId, date) => {
  try {
    const res = await api.get('/bookings/availability', {
      params: { serviceId, date }
    })
    
    if (res.data?.success) {
      return res.data.data
    }
    
    throw new Error('Failed to check availability')
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to check availability')
  }
}

// Create booking (Step 5)
export const createBooking = async (bookingData) => {
  try {
    const res = await api.post('/bookings', bookingData)
    
    if (res.data?.success) {
      return res.data.data
    }
    
    throw new Error(res.data?.message || 'Failed to create booking')
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create booking')
  }
}

// Get user's bookings
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
    
    return { bookings: [], total: 0, pages: 1, currentPage: 1 }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch bookings')
  }
}

// Get single booking
export const getBooking = async (bookingId) => {
  try {
    const res = await api.get(`/bookings/${bookingId}`)
    
    if (res.data?.success) {
      return res.data.data
    }
    
    throw new Error('Failed to fetch booking')
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch booking')
  }
}

// Cancel booking
export const cancelBooking = async (bookingId, reason = '') => {
  try {
    const res = await api.put(`/bookings/${bookingId}/cancel`, { reason })
    
    if (res.data?.success) {
      return res.data.data
    }
    
    throw new Error('Failed to cancel booking')
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to cancel booking')
  }
}