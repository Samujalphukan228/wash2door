// routes/bookingRoutes.js

import express from 'express';
import {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking
} from '../controllers/bookingController.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

// ALL ROUTES REQUIRE AUTH
router.use(protect);

router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/:bookingId', getBookingById);
router.put('/:bookingId/cancel', cancelBooking);

export default router;