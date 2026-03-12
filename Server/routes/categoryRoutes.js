// routes/categoryRoutes.js

import express from 'express';
import { protect, isAdmin } from '../middleware/auth.js';
import { handleCategoryImageUpload } from '../middleware/uploadMiddleware.js';

import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    reorderCategories
} from '../controllers/categoryController.js';

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
    console.log(`📍 Category Route: ${req.method} ${req.path}`);
    next();
});

// Health check
router.get('/health', (req, res) => {
    res.json({ success: true, message: 'Category routes OK' });
});

// ============================================
// All routes require admin auth
// ============================================
router.use(protect, isAdmin);

// GET all categories
router.get('/', getAllCategories);

// GET single category
router.get('/:categoryId', getCategoryById);

// CREATE category
router.post('/', handleCategoryImageUpload, createCategory);

// UPDATE category
router.put('/:categoryId', handleCategoryImageUpload, updateCategory);

// DELETE category
router.delete('/:categoryId', deleteCategory);

// TOGGLE active/inactive
router.patch('/:categoryId/toggle', toggleCategoryStatus);

// REORDER categories
router.put('/reorder/bulk', reorderCategories);

export default router;