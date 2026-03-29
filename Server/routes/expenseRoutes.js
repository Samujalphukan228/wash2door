// routes/expenseRoutes.js

import express from 'express';
import {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
    getAllExpenses,
    getExpenseById,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpenseSummary
} from '../controllers/expenseController.js';
import { protect, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin
router.use(protect, isAdmin);

// ============================================
// CATEGORIES
// ============================================
router.post('/categories', createCategory);
router.get('/categories', getAllCategories);
router.put('/categories/:categoryId', updateCategory);
router.delete('/categories/:categoryId', deleteCategory);

// ============================================
// EXPENSES
// ============================================
router.get('/', getAllExpenses);
router.get('/summary', getExpenseSummary);
router.get('/:expenseId', getExpenseById);
router.post('/', addExpense);
router.put('/:expenseId', updateExpense);
router.delete('/:expenseId', deleteExpense);

export default router;