// routes/reviewRoutes.js - UPDATED

import express from 'express';
import {
    createReview,
    getMyReviews,
    updateReview,
    deleteReview,
    canReview
} from '../controllers/reviewController.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createReview);
router.get('/my-reviews', getMyReviews);
router.get('/can-review/:bookingId', canReview);
router.put('/:reviewId', updateReview);
router.delete('/:reviewId', deleteReview);

export default router;