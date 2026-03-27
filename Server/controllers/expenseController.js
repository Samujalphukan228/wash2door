// controllers/expenseController.js - FIXED WITH REAL-TIME SOCKET

import ExpenseCategory from '../models/ExpenseCategory.js';
import Expense from '../models/Expense.js';
import { emitDashboardUpdate } from '../utils/socketEmitter.js';

// ============================================
// CREATE CATEGORY (🔥 ADDED SOCKET)
// ============================================
export const createCategory = async (req, res) => {
    try {
        const { categoryName } = req.body;

        const category = new ExpenseCategory({
            categoryName
        });

        await category.save();

        // 🔥 Real-time dashboard update
        emitDashboardUpdate({ 
            action: 'expense_category_created', 
            categoryName 
        });

        console.log(`🔌 Real-time: Expense category created - ${categoryName}`);

        res.status(201).json({ success: true, category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ============================================
// GET ALL CATEGORIES
// ============================================
export const getAllCategories = async (req, res) => {
    try {
        const categories = await ExpenseCategory.find().sort({ createdAt: -1 });
        res.json({ success: true, categories });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ============================================
// ADD EXPENSE (🔥 ADDED SOCKET)
// ============================================
export const addExpense = async (req, res) => {
    try {
        const { categoryId, amount } = req.body;

        const category = await ExpenseCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({ 
                success: false, 
                message: 'Category not found' 
            });
        }

        const expense = new Expense({
            category: categoryId,
            categoryName: category.categoryName,
            amount,
            createdBy: req.user._id
        });

        await expense.save();

        category.totalAmount += amount;
        await category.save();

        // 🔥 Real-time dashboard update
        emitDashboardUpdate({
            action: 'expense_added',
            amount,
            categoryName: category.categoryName
        });

        console.log(`🔌 Real-time: Expense added - ${amount} to ${category.categoryName}`);

        res.status(201).json({ success: true, expense, category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ============================================
// CLEANUP OLD EXPENSES (🔥 ADDED SOCKET)
// ============================================
export const cleanupOldExpenses = async (req, res) => {
    try {
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

        const result = await Expense.deleteMany({
            createdAt: { $lt: twoDaysAgo }
        });

        // 🔥 Real-time dashboard update (only if something was deleted)
        if (result.deletedCount > 0) {
            emitDashboardUpdate({ 
                action: 'expenses_cleaned', 
                count: result.deletedCount 
            });

            console.log(`🔌 Real-time: ${result.deletedCount} old expenses cleaned`);
        }

        res.json({
            success: true,
            message: `${result.deletedCount} old expenses deleted`
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export default {
    createCategory,
    getAllCategories,
    addExpense,
    cleanupOldExpenses
};