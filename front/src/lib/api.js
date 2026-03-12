// lib/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// ============================================
// REQUEST INTERCEPTOR - Attach access token
// ============================================
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('accessToken')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ============================================
// RESPONSE INTERCEPTOR - Handle errors & refresh
// ============================================
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config

    // Handle 401 Unauthorized (token expired)
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        console.log('🔄 Access token expired, attempting refresh...')
        
        // Try to refresh the token
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          {},
          { withCredentials: true } // Send refresh token cookie
        )

        if (refreshResponse.data?.success) {
          const newAccessToken = refreshResponse.data.data.accessToken
          
          // Store new token
          localStorage.setItem('accessToken', newAccessToken)
          
          // Update the failed request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          
          console.log('✅ Token refreshed successfully')
          
          // Retry the original request
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError)
        
        // Clear token and redirect to login
        localStorage.removeItem('accessToken')
        
        // Only redirect if we're not already on auth pages
        if (typeof window !== 'undefined' && 
            !window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/register')) {
          window.location.href = '/'
        }
        
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    const message = err.response?.data?.message || err.message || 'API Error'
    console.error('❌ API Error:', message)
    
    // Create error object with additional info
    const error = new Error(message)
    error.statusCode = err.response?.status
    error.data = err.response?.data
    
    return Promise.reject(error)
  }
)

export default api