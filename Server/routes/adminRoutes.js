// routes/adminRoutes.js - CLEANED UP (removed duplicate service CRUD)

import express from 'express';
import {
    getDashboardStats,
    getAllUsers,
    getUserById,
    blockUser,
    unblockUser,
    changeUserRole,
    getAllBookings,
    updateBookingStatus,
    createAdminBooking,
    getRevenueReport,
    getBookingReport,
    getAllReviews,
    toggleReviewVisibility
} from '../controllers/adminController.js';

import { protect, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin auth
router.use(protect, isAdmin);

// ============================================
// DASHBOARD
// ============================================
router.get('/dashboard/stats', getDashboardStats);

// ============================================
// USERS
// ============================================
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId/block', blockUser);
router.put('/users/:userId/unblock', unblockUser);
router.put('/users/:userId/role', changeUserRole);

// ============================================
// BOOKINGS
// ============================================
router.get('/bookings', getAllBookings);
router.post('/bookings', createAdminBooking);
router.put('/bookings/:bookingId/status', updateBookingStatus);

// ============================================
// REVIEWS
// ============================================
router.get('/reviews', getAllReviews);
router.put('/reviews/:reviewId/toggle', toggleReviewVisibility);

// ============================================
// REPORTS
// ============================================
router.get('/reports/revenue', getRevenueReport);
router.get('/reports/bookings', getBookingReport);

// ============================================
// NOTE: Service CRUD is handled by /api/services routes
// See routes/serviceRoutes.js
// Category CRUD is handled by /api/categories routes
// See routes/categoryRoutes.js
// ============================================

export default router;