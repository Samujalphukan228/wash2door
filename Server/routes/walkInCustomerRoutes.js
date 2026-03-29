// routes/walkInCustomerRoutes.js

import express from 'express';
import {
    getAllWalkInCustomers,
    searchWalkInCustomers,
    getRecentWalkInCustomers,
    getWalkInCustomerById,
    createWalkInCustomer,
    createOrGetWalkInCustomer,
    updateWalkInCustomer,
    deleteWalkInCustomer
} from '../controllers/walkInCustomerController.js';
import { protect, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(isAdmin);

// Search & list routes
router.get('/search', searchWalkInCustomers);      // GET /api/admin/walkin-customers/search?q=john
router.get('/recent', getRecentWalkInCustomers);   // GET /api/admin/walkin-customers/recent
router.get('/', getAllWalkInCustomers);            // GET /api/admin/walkin-customers

// Create routes
router.post('/', createWalkInCustomer);            // POST /api/admin/walkin-customers
router.post('/find-or-create', createOrGetWalkInCustomer); // POST /api/admin/walkin-customers/find-or-create

// Single customer routes
router.get('/:customerId', getWalkInCustomerById); // GET /api/admin/walkin-customers/:id
router.put('/:customerId', updateWalkInCustomer);  // PUT /api/admin/walkin-customers/:id
router.delete('/:customerId', deleteWalkInCustomer); // DELETE /api/admin/walkin-customers/:id

export default router;