// src/lib/booking.api.js
import api from './api'

/**
 * Create a new booking
 */
export async function createBooking(bookingData) {
  try {
    const response = await api.post('/bookings', bookingData)
    
    if (response.data?.success) {
      return response.data
    }
    
    throw new Error(response.data?.message || 'Failed to create booking')
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to create booking'
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
      return response.data
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
      return response.data
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
    const response = await api.patch(`/bookings/${bookingId}/cancel`, { reason })
    
    if (response.data?.success) {
      return response.data
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
export async function rescheduleBooking(bookingId, newDate, newTime) {
  try {
    const response = await api.patch(`/bookings/${bookingId}/reschedule`, {
      date: newDate,
      time: newTime
    })
    
    if (response.data?.success) {
      return response.data
    }
    
    throw new Error(response.data?.message || 'Failed to reschedule booking')
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to reschedule booking'
    )
  }
}

/**
 * Get available time slots for a specific date
 */
export async function getAvailableSlots(date, serviceId) {
  try {
    const response = await api.get('/bookings/available-slots', {
      params: { date, serviceId }
    })
    
    if (response.data?.success) {
      return response.data.data || response.data || []
    }
    
    return response.data || []
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch available slots'
    )
  }
}

/**
 * Check availability for a date (GLOBAL - no serviceId needed)
 */
export async function checkAvailability(date) {
  try {
    const response = await api.get('/bookings/availability', {
      params: { date }
    })
    
    if (response.data?.success) {
      return response.data
    }
    
    throw new Error(response.data?.message || 'Failed to check availability')
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to check availability'
    )
  }
}

/**
 * Get services (public)
 */
export async function getServices() {
  try {
    const response = await api.get('/public/services')
    
    return response.data?.data || response.data || []
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch services'
    )
  }
}