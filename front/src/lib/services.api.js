// src/lib/services.api.js
import api from './api'

/**
 * Get all categories (PUBLIC - no auth needed)
 */
export async function getCategories() {
  try {
    const response = await api.get('/public/categories')

    return response.data?.data || response.data?.categories || response.data || []
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch categories'
    )
  }
}

/**
 * Get public services (optionally filtered)
 */
export async function getPublicServices(filters = {}) {
  try {
    const params = {}

    if (filters.category) {
      params.category = filters.category
    }
    if (filters.subcategory) {
      params.subcategory = filters.subcategory
    }
    if (filters.limit) {
      params.limit = filters.limit
    }

    const response = await api.get('/public/services', { params })

    return response.data?.data || response.data?.services || response.data || []
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch services'
    )
  }
}

/**
 * Get single service by ID (NO VARIANTS - single price structure)
 */
export async function getServiceById(serviceId) {
  try {
    const response = await api.get(`/bookings/service/${serviceId}/pricing`)

    // ✅ Service structure: { price, discountPrice, duration, finalPrice }
    if (response.data?.success) {
      return response.data.data
    }

    throw new Error(response.data?.message || 'Service not found')
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch service'
    )
  }
}

/**
 * Get user bookings
 */
export async function getUserBookings() {
  try {
    const response = await api.get('/bookings/my-bookings')

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
 * Get subcategories by category ID
 */
export async function getSubcategoriesByCategoryId(categoryId) {
  try {
    const response = await api.get(`/public/categories/${categoryId}/subcategories`)

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
    const response = await api.get('/public/services', {
      params: { subcategory: subcategoryId }
    })

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
    const response = await api.get('/public/services', {
      params: { search: query }
    })

    return response.data?.data || response.data?.services || response.data || []
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to search services'
    )
  }
}