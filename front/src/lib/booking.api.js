// lib/booking.api.js
import api from './api'

export const getServices = async () => {
    try {
        const res = await api.get('/public/services')
        if (res.data?.success) {
            return res.data.data || []
        }
        return []
    } catch (error) {
        console.error('❌ Failed to fetch services:', error)
        throw error
    }
}

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
        console.error('❌ Failed to check availability:', error)
        throw error
    }
}

export const createBooking = async (bookingData) => {
    try {
        const res = await api.post('/bookings', bookingData)
        if (res.data?.success && res.data?.data) {
            return res.data.data
        }
        throw new Error(res.data.message || 'Booking failed')
    } catch (error) {
        console.error('❌ Create booking error:', error)
        throw error
    }
}