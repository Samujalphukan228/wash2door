// routes/reviewRoutes.js - UPDATED

import express from 'express';
import {
    createReview,
    getMyReviews,
    getReviewById,
    updateReview,
    deleteReview,
    canReview
} from '../controllers/reviewController.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require auth
router.use(protect);

// Create review
router.post('/', createReview);

// Get my reviews
router.get('/my-reviews', getMyReviews);

// Check if can review a booking
router.get('/can-review/:bookingId', canReview);

// Get single review
router.get('/:reviewId', getReviewById);

// Update review
router.put('/:reviewId', updateReview);

// Delete review
router.delete('/:reviewId', deleteReview);

export default router;