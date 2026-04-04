// routes/bookingRoutes.js

import express from 'express';
import {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
    rescheduleBooking,
    getServiceWithPricing,
    checkAvailability,
    getMyBookingStats,
    getAvailableSlots
} from '../controllers/bookingController.js';

import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES - No auth needed
// ============================================

// Get service with variant pricing
router.get('/pricing/:serviceId', getServiceWithPricing);

// Check time slot availability (optionalAuth to detect admin)
router.get('/availability', optionalAuth, checkAvailability);

// ============================================
// PROTECTED ROUTES - Auth required
// ============================================
router.use(protect);

// Create booking
router.post('/', createBooking);

// Get my bookings
router.get('/my-bookings', getMyBookings);

// Get my booking stats
router.get('/my-stats', getMyBookingStats);

// Get available slots (simple list)
router.get('/available-slots', getAvailableSlots);

// Get single booking
router.get('/:bookingId', getBookingById);

// Cancel booking
router.put('/:bookingId/cancel', cancelBooking);

// Reschedule booking
router.put('/:bookingId/reschedule', rescheduleBooking);

export default router;