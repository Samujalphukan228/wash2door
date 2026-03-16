// src/lib/services.api.js
import api from './api'

/**
 * Get all categories
 */
export async function getCategories() {
  try {
    const response = await api.get('/categories')
    
    // Handle different response structures
    return response.data?.data || response.data?.categories || response.data || []
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch categories'
    )
  }
}

/**
 * Get public services (optionally filtered by category)
 */
export async function getPublicServices(filters = {}) {
  try {
    const params = {}
    
    if (filters.category) {
      params.category = filters.category
    }
    if (filters.limit) {
      params.limit = filters.limit
    }

    const response = await api.get('/public/services', { params })
    
    // Handle different response structures
    return response.data?.data || response.data?.services || response.data || []
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch services'
    )
  }
}

/**
 * Get available slots for booking
 */
export async function getAvailableSlots(date, serviceId) {
  try {
    const response = await api.get('/bookings/available-slots', {
      params: { date, serviceId }
    })
    
    return response.data?.data || response.data || []
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch available slots'
    )
  }
}

/**
 * Get single service by ID
 */
export async function getServiceById(serviceId) {
  try {
    const response = await api.get(`/public/services/${serviceId}`)
    
    return response.data?.data || response.data || null
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch service'
    )
  }
}

/**
 * Get user bookings (for services page if needed)
 */
export async function getUserBookings() {
  try {
    const response = await api.get('/bookings/my-bookings')
    
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
 * Get subcategories by category ID
 */
export async function getSubcategoriesByCategoryId(categoryId) {
  try {
    const response = await api.get(`/categories/${categoryId}/subcategories`)
    
    return response.data?.data || response.data?.subcategories || response.data || []
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch subcategories'
    )
  }
}

/**
 * Get services by subcategory ID
 */
export async function getServicesBySubcategoryId(subcategoryId) {
  try {
    const response = await api.get(`/subcategories/${subcategoryId}/services`)
    
    return response.data?.data || response.data?.services || response.data || []
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch services by subcategory'
    )
  }
}

/**
 * Search services
 */
export async function searchServices(query) {
  try {
    const response = await api.get('/public/services/search', {
      params: { q: query }
    })
    
    return response.data?.data || response.data?.services || response.data || []
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to search services'
    )
  }
}