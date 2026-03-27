import express from 'express';
import {
    createCategory,
    getAllCategories,
    addExpense,
    cleanupOldExpenses
} from '../controllers/expenseController.js';
import { protect, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// ✅ Create category
router.post('/category', protect, isAdmin, createCategory);

// ✅ Get all categories
router.get('/categories', protect, isAdmin, getAllCategories);

// ✅ Add expense
router.post('/add', protect, isAdmin, addExpense);

// ✅ Cleanup old expenses
router.delete('/cleanup', protect, isAdmin, cleanupOldExpenses);

export default router;