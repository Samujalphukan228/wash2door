// routes/publicRoutes.js

import express from 'express';
import {
    getActiveServices,
    getServiceDetails,
    getCategories,
    getServiceReviews,
    checkAvailability
} from '../controllers/publicController.js';

const router = express.Router();

// NO AUTH REQUIRED - PUBLIC ROUTES

router.get('/services', getActiveServices);
router.get('/services/:serviceId', getServiceDetails);
router.get('/categories', getCategories);
router.get('/services/:serviceId/reviews', getServiceReviews);
router.get('/availability', checkAvailability);

export default router;