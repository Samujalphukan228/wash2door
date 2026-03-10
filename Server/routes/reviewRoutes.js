// routes/reviewRoutes.js

import express from 'express';
import {
    createReview,
    getMyReviews,
    updateReview,
    deleteReview
} from '../controllers/reviewController.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

// ALL ROUTES REQUIRE AUTH
router.use(protect);

router.post('/', createReview);
router.get('/my-reviews', getMyReviews);
router.put('/:reviewId', updateReview);
router.delete('/:reviewId', deleteReview);

export default router;