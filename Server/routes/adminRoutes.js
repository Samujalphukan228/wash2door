import express from 'express';
import {
    getDashboardStats,
    getAllUsers,
    getUserById,
    blockUser,
    unblockUser,
    changeUserRole,
    getAllBookings,
    getBookingById,
    updateBookingStatus,
    createAdminBooking,
    getRevenueReport,
    getBookingReport,
    cleanupOldBookings,
    getBookingCleanupStats
} from '../controllers/adminController.js';

import { protect, isAdmin } from '../middleware/auth.js';

const router = express.Router();

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
router.get('/bookings/cleanup/stats', getBookingCleanupStats);
router.delete('/bookings/cleanup', cleanupOldBookings);
router.get('/bookings/:bookingId', getBookingById);
router.post('/bookings', createAdminBooking);
router.put('/bookings/:bookingId/status', updateBookingStatus);

// ============================================
// REPORTS
// ============================================
router.get('/reports/revenue', getRevenueReport);
router.get('/reports/bookings', getBookingReport);

export default router;