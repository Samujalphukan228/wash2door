// routes/adminRoutes.js

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
    getBookingCleanupStats,
    // ✅ NEW: Walk-in customer routes
    getWalkInCustomers,
    getRecentWalkInCustomers,
    searchWalkInCustomers,
    updateWalkInCustomer,
    deleteWalkInCustomer,
    bulkUpdateWalkInCustomers
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
// WALK-IN CUSTOMERS ✅ NEW
// ============================================
router.get('/walkin-customers', getWalkInCustomers);
router.get('/walkin-customers/recent', getRecentWalkInCustomers);
router.get('/walkin-customers/search', searchWalkInCustomers);
router.put('/walkin-customers/bulk-update', bulkUpdateWalkInCustomers); // ✅ Update all missing address/city
router.put('/walkin-customers/:customerId', updateWalkInCustomer);
router.delete('/walkin-customers/:customerId', deleteWalkInCustomer);

// ============================================
// REPORTS
// ============================================
router.get('/reports/revenue', getRevenueReport);
router.get('/reports/bookings', getBookingReport);

export default router;