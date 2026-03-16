// lib/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// ✅ Prevent multiple simultaneous refresh attempts
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
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

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config

    // ✅ Don't retry refresh endpoint itself
    if (originalRequest.url?.includes('/auth/refresh')) {
      localStorage.removeItem('accessToken')
      return Promise.reject(err)
    }

    // ✅ Only handle 401 once
    if (err.response?.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        // Queue this request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        console.log('🔄 Access token expired, attempting refresh...')
        
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        )

        if (refreshResponse.data?.success) {
          const newAccessToken = refreshResponse.data.data.accessToken
          
          localStorage.setItem('accessToken', newAccessToken)
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          
          console.log('✅ Token refreshed successfully')
          
          processQueue(null, newAccessToken)
          
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError)
        
        processQueue(refreshError, null)
        localStorage.removeItem('accessToken')
        
        // ✅ Only redirect if not on auth pages
        if (typeof window !== 'undefined' && 
            !window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/register') &&
            !window.location.pathname.includes('/')) {
          window.location.href = '/'
        }
        
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Handle other errors
    const message = err.response?.data?.message || err.message || 'API Error'
    console.error('❌ API Error:', message)
    
    const error = new Error(message)
    error.statusCode = err.response?.status
    error.data = err.response?.data
    
    return Promise.reject(error)
  }
)

export default api