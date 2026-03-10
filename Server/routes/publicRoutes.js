// ✅ FIXED: Now uses publicController instead of inline code

import express from 'express';
import {
    getActiveServices,
    getServiceDetails,
    getCategories,
    getServiceReviews,
    checkAvailability
} from '../controllers/publicController.js';

const router = express.Router();

// GET all active services
router.get('/services', getActiveServices);

// GET single service with full details
router.get('/services/:serviceId', getServiceDetails);

// GET service reviews
router.get('/services/:serviceId/reviews', getServiceReviews);

// GET categories
router.get('/categories', getCategories);

// CHECK availability
router.get('/availability', checkAvailability);

export default router;