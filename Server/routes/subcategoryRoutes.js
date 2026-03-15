// routes/subcategoryRoutes.js

import express from 'express';
import { protect, isAdmin } from '../middleware/auth.js';
import { handleSubcategoryImageUpload } from '../middleware/uploadMiddleware.js';

import {
    getAllSubcategories,
    getSubcategoriesByCategory,
    getSubcategoryById,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    toggleSubcategoryStatus,
    reorderSubcategories
} from '../controllers/subcategoryController.js';

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
    console.log(`📍 Subcategory Route: ${req.method} ${req.path}`);
    next();
});

// Health check
router.get('/health', (req, res) => {
    res.json({ success: true, message: 'Subcategory routes OK' });
});

// ============================================
// All routes require admin auth
// ============================================
router.use(protect, isAdmin);

// GET all subcategories (can filter by category)
router.get('/', getAllSubcategories);

// GET subcategories by category (for dropdowns)
router.get('/category/:categoryId', getSubcategoriesByCategory);

// GET single subcategory
router.get('/:subcategoryId', getSubcategoryById);

// CREATE subcategory
router.post('/', handleSubcategoryImageUpload, createSubcategory);

// UPDATE subcategory
router.put('/:subcategoryId', handleSubcategoryImageUpload, updateSubcategory);

// DELETE subcategory
router.delete('/:subcategoryId', deleteSubcategory);

// TOGGLE active/inactive
router.patch('/:subcategoryId/toggle', toggleSubcategoryStatus);

// REORDER subcategories
router.put('/reorder/bulk', reorderSubcategories);

export default router;