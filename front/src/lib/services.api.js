// src/lib/services.api.js

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

/**
 * Get all categories
 */
export async function getCategories() {
  const response = await fetch(`${API_URL}/categories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch categories")
  }

  // Handle different response structures
  return data.data || data.categories || data || []
}

/**
 * Get public services (optionally filtered by category)
 */
export async function getPublicServices(filters = {}) {
  const params = new URLSearchParams()
  
  if (filters.category) {
    params.append("category", filters.category)
  }
  if (filters.limit) {
    params.append("limit", filters.limit.toString())
  }

  const url = params.toString() 
    ? `${API_URL}/public/services?${params.toString()}`
    : `${API_URL}/public/services`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch services")
  }

  // Handle different response structures
  return data.data || data.services || data || []
}

/**
 * Get available slots for booking
 */
export async function getAvailableSlots(date, serviceId) {
  const response = await fetch(
    `${API_URL}/bookings/available-slots?date=${date}&serviceId=${serviceId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch available slots")
  }

  return data.data || data || []
}

/**
 * Get single service by ID
 */
export async function getServiceById(serviceId) {
  const response = await fetch(`${API_URL}/public/services/${serviceId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch service")
  }

  return data.data || data || null
}

/**
 * Get user bookings (for services page if needed)
 */
export async function getUserBookings() {
  const token = localStorage.getItem("token")

  if (!token) {
    throw new Error("Authentication required")
  }

  const response = await fetch(`${API_URL}/bookings/my-bookings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch bookings")
  }

  return data
}