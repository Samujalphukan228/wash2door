// routes/bookingRoutes.js - UPDATED

import express from 'express';
import {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
    rescheduleBooking,
    getServiceWithPricing,
    checkAvailability
} from '../controllers/bookingController.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES - No auth needed
// ============================================

// Get service with variant pricing
router.get('/pricing/:serviceId', getServiceWithPricing);

// Check time slot availability
router.get('/availability', checkAvailability);

// ============================================
// PROTECTED ROUTES - Auth required
// ============================================
router.use(protect);

// Create booking
router.post('/', createBooking);

// Get my bookings
router.get('/my-bookings', getMyBookings);

// Get single booking
router.get('/:bookingId', getBookingById);

// Cancel booking
router.put('/:bookingId/cancel', cancelBooking);

// Reschedule booking
router.put('/:bookingId/reschedule', rescheduleBooking);

export default router;