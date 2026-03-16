// src/lib/booking.api.js

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

/**
 * Create a new booking
 */
export async function createBooking(bookingData) {
  const token = localStorage.getItem("token")
  
  const response = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(bookingData),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to create booking")
  }

  return data
}

/**
 * Get all bookings for the current user
 */
export async function getUserBookings(statusFilter = "", page = 1, limit = 10) {
  const token = localStorage.getItem("token")

  if (!token) {
    throw new Error("Authentication required")
  }

  const params = new URLSearchParams()
  if (statusFilter) params.append("status", statusFilter)
  params.append("page", page.toString())
  params.append("limit", limit.toString())

  const response = await fetch(`${API_URL}/bookings/my-bookings?${params.toString()}`, {
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

/**
 * Get a single booking by ID
 */
export async function getBookingById(bookingId) {
  const token = localStorage.getItem("token")

  if (!token) {
    throw new Error("Authentication required")
  }

  const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch booking")
  }

  return data
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId, reason = "") {
  const token = localStorage.getItem("token")

  if (!token) {
    throw new Error("Authentication required")
  }

  const response = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to cancel booking")
  }

  return data
}

/**
 * Reschedule a booking
 */
export async function rescheduleBooking(bookingId, newDate, newTime) {
  const token = localStorage.getItem("token")

  if (!token) {
    throw new Error("Authentication required")
  }

  const response = await fetch(`${API_URL}/bookings/${bookingId}/reschedule`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ date: newDate, time: newTime }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to reschedule booking")
  }

  return data
}

/**
 * Get available time slots for a specific date
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

  return data
}

/**
 * Check availability for a service on a date
 */
export async function checkAvailability(serviceId, date) {
  const response = await fetch(
    `${API_URL}/bookings/availability?serviceId=${serviceId}&date=${date}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to check availability")
  }

  return data
}

/**
 * Get services (public)
 */
export async function getServices() {
  const response = await fetch(`${API_URL}/public/services`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch services")
  }

  return data.data || data || []
}