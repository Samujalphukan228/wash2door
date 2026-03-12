// lib/booking.api.js

import api from './api'

// ════════════════════════════════════════════════
// PUBLIC ENDPOINTS
// ════════════════════════════════════════════════

// Get all active services (Step 1)
export const getServices = async () => {
    try {
        const res = await api.get('/public/services')
        console.log('📦 getServices response:', res.data)
        
        if (res.data?.success) {
            return res.data.data || []
        }
        return []
    } catch (error) {
        console.error('❌ Failed to fetch services:', error)
        throw new Error(error.response?.data?.message || 'Failed to fetch services')
    }
}

// Get categories
export const getCategories = async () => {
    try {
        const res = await api.get('/public/categories')
        
        if (res.data?.success) {
            return res.data.data || []
        }
        return []
    } catch (error) {
        console.error('❌ Failed to fetch categories:', error)
        throw new Error(error.response?.data?.message || 'Failed to fetch categories')
    }
}

// Get services by category
export const getServicesByCategory = async (categoryId) => {
    try {
        const res = await api.get('/public/services', {
            params: { category: categoryId }
        })
        
        if (res.data?.success) {
            return res.data.data || []
        }
        return []
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch services')
    }
}

// ════════════════════════════════════════════════
// BOOKING ENDPOINTS
// ════════════════════════════════════════════════

// Get service with variant pricing (Step 2)
export const getServicePricing = async (serviceId) => {
    try {
        const res = await api.get(`/bookings/pricing/${serviceId}`)
        console.log('💰 getServicePricing response:', res.data)
        
        if (res.data?.success) {
            return res.data.data
        }
        throw new Error('Failed to fetch pricing')
    } catch (error) {
        console.error('❌ Failed to fetch pricing:', error)
        throw new Error(error.response?.data?.message || 'Failed to fetch pricing')
    }
}

// Check availability (Step 3)
export const checkAvailability = async (serviceId, date) => {
    try {
        const res = await api.get('/bookings/availability', {
            params: { serviceId, date }
        })
        console.log('📅 checkAvailability response:', res.data)
        
        if (res.data?.success) {
            return res.data.data
        }
        throw new Error('Failed to check availability')
    } catch (error) {
        console.error('❌ Failed to check availability:', error)
        throw new Error(error.response?.data?.message || 'Failed to check availability')
    }
}

// Create booking (Step 5)
export const createBooking = async (bookingData) => {
    try {
        console.log('📤 Creating booking with:', bookingData)
        
        const res = await api.post('/bookings', bookingData)
        
        console.log('📥 createBooking response:', res.data)
        
        // Check for success
        if (res.data?.success && res.data?.data) {
            console.log('✅ Booking created:', res.data.data)
            return res.data.data
        }
        
        // If we got a response but success is false
        if (res.data && !res.data.success) {
            throw new Error(res.data.message || 'Booking failed')
        }
        
        // If we got data directly (some APIs return data without wrapper)
        if (res.data?.bookingCode || res.data?.bookingId) {
            return res.data
        }
        
        throw new Error('Unexpected response format')
        
    } catch (error) {
        console.error('❌ Create booking error:', error)
        
        // If it's an axios error with response
        if (error.response?.data) {
            const message = error.response.data.message || 'Failed to create booking'
            throw new Error(message)
        }
        
        // If it's already an Error we threw
        if (error.message) {
            throw error
        }
        
        throw new Error('Failed to create booking')
    }
}

// ════════════════════════════════════════════════
// USER BOOKING ENDPOINTS (Protected)
// ════════════════════════════════════════════════

// Get user's bookings
export const getUserBookings = async (status = '', page = 1, limit = 10) => {
    try {
        const params = new URLSearchParams()
        if (status) params.append('status', status)
        params.append('page', page.toString())
        params.append('limit', limit.toString())

        const res = await api.get(`/bookings/my-bookings?${params.toString()}`)
        
        if (res.data?.success) {
            return res.data.data
        }
        return { bookings: [], total: 0, pages: 1, currentPage: 1 }
    } catch (error) {
        console.error('❌ Failed to fetch bookings:', error)
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
        console.error('❌ Failed to fetch booking:', error)
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
        console.error('❌ Failed to cancel booking:', error)
        throw new Error(error.response?.data?.message || 'Failed to cancel booking')
    }
}