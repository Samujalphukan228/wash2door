import api from './api'

/**
 * Create a new booking (NO VARIANTS)
 */
export async function createBooking(bookingData) {
  try {
    console.log('📦 Creating booking with data:', JSON.stringify(bookingData, null, 2))

    const response = await api.post('/bookings', {
      serviceId: bookingData.serviceId,
      bookingDate: bookingData.bookingDate,
      timeSlot: bookingData.timeSlot,
      location: bookingData.location,
      phone: bookingData.phone
    })
    
    console.log('📦 Response:', response.data)

    if (response.data?.success) {
      return response.data.data
    }
    
    throw new Error(response.data?.message || 'Failed to create booking')
  } catch (error) {
    console.log('❌ Full error:', error)
    console.log('❌ Error response:', error.response)
    console.log('❌ Error data:', error.response?.data)
    console.log('❌ Validation errors:', error.response?.data?.errors)
    
    throw new Error(
      error.response?.data?.errors?.join(', ') || 
      error.response?.data?.message || 
      error.message || 
      'Failed to create booking'
    )
  }
}

/**
 * Get all bookings for the current user
 */
export async function getUserBookings(statusFilter = "", page = 1, limit = 10) {
  try {
    const params = new URLSearchParams()
    if (statusFilter) params.append("status", statusFilter)
    params.append("page", page.toString())
    params.append("limit", limit.toString())

    const response = await api.get(`/bookings/my-bookings?${params.toString()}`)
    
    if (response.data?.success) {
      return response.data.data
    }
    
    throw new Error(response.data?.message || 'Failed to fetch bookings')
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch bookings'
    )
  }
}

/**
 * Get a single booking by ID
 */
export async function getBookingById(bookingId) {
  try {
    const response = await api.get(`/bookings/${bookingId}`)
    
    if (response.data?.success) {
      return response.data.data
    }
    
    throw new Error(response.data?.message || 'Failed to fetch booking')
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch booking'
    )
  }
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId, reason = "") {
  try {
    const response = await api.put(`/bookings/${bookingId}/cancel`, { reason })
    
    if (response.data?.success) {
      return response.data.data
    }
    
    throw new Error(response.data?.message || 'Failed to cancel booking')
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to cancel booking'
    )
  }
}

/**
 * Reschedule a booking
 */
export async function rescheduleBooking(bookingId, newDate, newTimeSlot) {
  try {
    const response = await api.put(`/bookings/${bookingId}/reschedule`, {
      newDate,
      newTimeSlot  // ✅ Already in 12-hour format
    })
    
    if (response.data?.success) {
      return response.data.data
    }
    
    throw new Error(response.data?.message || 'Failed to reschedule booking')
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to reschedule booking'
    )
  }
}

/**
 * Check availability for a date (GLOBAL) - ✅ FIXED URL
 */
export async function checkAvailability(date) {
  try {
    const response = await api.get('/bookings/availability', {
      params: { date }
    })
    
    if (response.data?.success) {
      return response.data.data
    }
    
    throw new Error(response.data?.message || 'Failed to check availability')
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to check availability'
    )
  }
}

/**
 * Get service pricing (returns single price, not variants)
 */
export async function getServicePricing(serviceId) {
  try {
    const response = await api.get(`/bookings/pricing/${serviceId}`)
    
    if (response.data?.success) {
      return response.data.data
    }
    
    throw new Error(response.data?.message || 'Failed to fetch service pricing')
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch service pricing'
    )
  }
}