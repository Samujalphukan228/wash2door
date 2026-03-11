// lib/services.api.js
import api from './api'

export const getPublicServices = async () => {
  try {
    const res = await api.get('/public/services')
    
    console.log('📡 API Response:', res.data)
    
    // Your API returns: { success: true, total: 1, data: [...] }
    if (res.data?.success && Array.isArray(res.data?.data)) {
      return res.data.data
    }
    
    // Fallback checks
    if (Array.isArray(res.data?.data)) {
      return res.data.data
    }
    
    if (Array.isArray(res.data)) {
      return res.data
    }
    
    console.warn('📡 Unexpected format:', res.data)
    return []
    
  } catch (error) {
    console.error('📡 getPublicServices error:', error.message)
    throw error
  }
}

export const getServiceDetails = async (serviceId) => {
  try {
    const res = await api.get(`/public/services/${serviceId}`)
    
    // API returns: { success: true, data: { service, reviews, ratingBreakdown } }
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
    
    if (res.data?.success && Array.isArray(res.data?.data)) {
      return res.data.data
    }
    
    return res.data?.data || []
    
  } catch (error) {
    console.error('📡 getCategories error:', error.message)
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