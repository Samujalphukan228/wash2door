import api from './api'

// Create a review
export const createReview = async (bookingId, rating, comment = '') => {
  try {
    const res = await api.post('/reviews', {
      bookingId,
      rating,
      comment
    })
    
    if (res.data?.success) {
      return res.data.data
    }
    
    throw new Error(res.data?.message || 'Failed to create review')
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to create review')
  }
}

// Check if user can review a booking
export const canReview = async (bookingId) => {
  try {
    const res = await api.get(`/reviews/can-review/${bookingId}`)
    
    if (res.data?.success) {
      return res.data.data
    }
    
    return { canReview: false }
  } catch (error) {
    return { canReview: false }
  }
}

// Get my reviews
export const getMyReviews = async (page = 1, limit = 10) => {
  try {
    const res = await api.get('/reviews/my-reviews', {
      params: { page, limit }
    })
    
    if (res.data?.success) {
      return {
        reviews: res.data.data,
        total: res.data.total,
        pages: res.data.pages,
        currentPage: res.data.currentPage
      }
    }
    
    return { reviews: [], total: 0, pages: 1, currentPage: 1 }
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch reviews')
  }
}

// Update a review
export const updateReview = async (reviewId, rating, comment) => {
  try {
    const res = await api.put(`/reviews/${reviewId}`, {
      rating,
      comment
    })
    
    if (res.data?.success) {
      return res.data.data
    }
    
    throw new Error(res.data?.message || 'Failed to update review')
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to update review')
  }
}

// Delete a review
export const deleteReview = async (reviewId) => {
  try {
    const res = await api.delete(`/reviews/${reviewId}`)
    
    if (res.data?.success) {
      return true
    }
    
    throw new Error(res.data?.message || 'Failed to delete review')
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete review')
  }
}