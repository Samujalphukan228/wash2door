// routes/adminRoutes.js

import express from 'express';
import {
    getDashboardStats,
    getAllUsers,
    blockUser,
    unblockUser,
    changeUserRole,
    getAllServices,
    createService,
    updateService,
    deleteService,
    getAllBookings,
    updateBookingStatus,
    getRevenueReport,
    getAllReviews,
    toggleReviewVisibility
} from '../controllers/adminController.js';

import { protect, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, isAdmin);

// DASHBOARD
router.get('/dashboard/stats', getDashboardStats);

// USERS
router.get('/users', getAllUsers);
router.put('/users/:userId/block', blockUser);
router.put('/users/:userId/unblock', unblockUser);
router.put('/users/:userId/role', changeUserRole);

// SERVICES
router.get('/services', getAllServices);
router.post('/services', createService);
router.put('/services/:serviceId', updateService);
router.delete('/services/:serviceId', deleteService);

// BOOKINGS
router.get('/bookings', getAllBookings);
router.put('/bookings/:bookingId/status', updateBookingStatus);

// REVIEWS
router.get('/reviews', getAllReviews);
router.put('/reviews/:reviewId/toggle', toggleReviewVisibility);

// REPORTS
router.get('/reports/revenue', getRevenueReport);

export default router;