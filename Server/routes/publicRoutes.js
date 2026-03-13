// routes/publicRoutes.js - UPDATED

import express from 'express';
import {
    getActiveServices,
    getServiceDetails,
    getCategories,
    getServiceReviews,
    checkAvailability,
    getFeaturedServices,
    getAvailableSlots
} from '../controllers/publicController.js';

const router = express.Router();

// GET all active services (with pagination)
router.get('/services', getActiveServices);

// GET featured services
router.get('/services/featured', getFeaturedServices);

// GET single service with full details
router.get('/services/:serviceId', getServiceDetails);

// GET service reviews
router.get('/services/:serviceId/reviews', getServiceReviews);

// GET categories
router.get('/categories', getCategories);

// CHECK availability (GLOBAL - all services)
router.get('/availability', checkAvailability);

// GET available slots only (GLOBAL)
router.get('/slots', getAvailableSlots);

export default router;