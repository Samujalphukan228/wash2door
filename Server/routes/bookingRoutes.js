// routes/bookingRoutes.js - COMPLETE NEW FILE

import express from 'express';
import {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
    getServiceWithPricing,
    checkAvailability
} from '../controllers/bookingController.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES - No auth needed
// ============================================

// Step 2: Get vehicle types with pricing for a service
router.get('/pricing/:serviceId', getServiceWithPricing);

// Step 3: Check time slot availability
router.get('/availability', checkAvailability);

// ============================================
// PROTECTED ROUTES - Auth required
// ============================================
router.use(protect);

// Step 4 & 5: Create booking
router.post('/', createBooking);

// Get my bookings
router.get('/my-bookings', getMyBookings);

// Get single booking
router.get('/:bookingId', getBookingById);

// Cancel booking
router.put('/:bookingId/cancel', cancelBooking);

export default router;