// lib/services.api.js

import api from './api'

export const getPublicServices = async (params = {}) => {
    try {
        console.log('📡 getPublicServices params:', params)
        const res = await api.get('/public/services', { params })
        console.log('📡 getPublicServices response:', res.data)

        if (res.data?.success && Array.isArray(res.data?.data)) {
            return res.data.data
        }

        return []
    } catch (error) {
        console.error('📡 getPublicServices error:', error.message)
        throw error
    }
}

export const getServicesByCategory = async (categoryId) => {
    try {
        const res = await api.get('/public/services', {
            params: { category: categoryId }
        })

        if (res.data?.success && Array.isArray(res.data?.data)) {
            return res.data.data
        }

        return []
    } catch (error) {
        console.error('📡 getServicesByCategory error:', error.message)
        throw error
    }
}

export const getServiceDetails = async (serviceId) => {
    try {
        const res = await api.get(`/public/services/${serviceId}`)

        if (res.data?.success) {
            return res.data.data
        }

        return res.data?.data || res.data
    } catch (error) {
        console.error('📡 getServiceDetails error:', error.message)
        throw error
    }
}

export const getCategories = async () => {
    try {
        const res = await api.get('/public/categories')
        console.log('📡 getCategories response:', res.data)

        if (res.data?.success && Array.isArray(res.data?.data)) {
            return res.data.data
        }

        return []
    } catch (error) {
        console.error('📡 getCategories error:', error.message)
        throw error
    }
}

export const getFeaturedServices = async () => {
    try {
        const res = await api.get('/public/services', {
            params: { featured: true }
        })

        if (res.data?.success && Array.isArray(res.data?.data)) {
            return res.data.data
        }

        return []
    } catch (error) {
        console.error('📡 getFeaturedServices error:', error.message)
        throw error
    }
}

export const checkAvailability = async (serviceId, date) => {
    try {
        const res = await api.get('/public/availability', {
            params: { serviceId, date }
        })

        if (res.data?.success) {
            return res.data.data
        }

        return res.data?.data || res.data
    } catch (error) {
        console.error('📡 checkAvailability error:', error.message)
        throw error
    }
}