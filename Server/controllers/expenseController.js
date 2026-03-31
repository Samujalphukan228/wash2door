// controllers/expenseController.js

import ExpenseCategory from '../models/ExpenseCategory.js';
import Expense from '../models/Expense.js';
import { emitDashboardUpdate } from '../utils/socketEmitter.js';
import mongoose from 'mongoose';

const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);

// ============================================
// CATEGORIES
// ============================================

// Create category
export const createCategory = async (req, res) => {
    try {
        const { categoryName } = req.body;

        if (!categoryName?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        const category = await ExpenseCategory.create({
            categoryName: categoryName.trim()
        });

        emitDashboardUpdate({ action: 'expense_category_created' });

        res.status(201).json({ success: true, data: category });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Category already exists'
            });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all categories
export const getAllCategories = async (req, res) => {
    try {
        const categories = await ExpenseCategory.find()
            .sort({ totalAmount: -1, createdAt: -1 });

        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update category
export const updateCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { categoryName } = req.body;

        if (!isValidObjectId(categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }

        if (!categoryName?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        const category = await ExpenseCategory.findByIdAndUpdate(
            categoryId,
            { categoryName: categoryName.trim() },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Update categoryName in all expenses
        await Expense.updateMany(
            { category: categoryId },
            { categoryName: categoryName.trim() }
        );

        res.json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete category
export const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        if (!isValidObjectId(categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }

        // Check if category has expenses
        const expenseCount = await Expense.countDocuments({ category: categoryId });

        if (expenseCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete. ${expenseCount} expenses linked to this category.`
            });
        }

        const category = await ExpenseCategory.findByIdAndDelete(categoryId);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        emitDashboardUpdate({ action: 'expense_category_deleted' });

        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ============================================
// EXPENSES
// ============================================

// Get all expenses (with date filter)
export const getAllExpenses = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            categoryId,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const query = {};

        // Category filter
        if (categoryId && isValidObjectId(categoryId)) {
            query.category = categoryId;
        }

        // Date filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const [expenses, total] = await Promise.all([
            Expense.find(query)
                .populate('createdBy', 'firstName lastName')
                .sort(sortOptions)
                .limit(limitNum)
                .skip((pageNum - 1) * limitNum),
            Expense.countDocuments(query)
        ]);

        // Calculate total amount for filtered results
        const totalAmount = await Expense.aggregate([
            { $match: query },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        res.json({
            success: true,
            data: expenses,
            total,
            totalAmount: totalAmount[0]?.total || 0,
            pages: Math.ceil(total / limitNum),
            currentPage: pageNum
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get expense by ID
export const getExpenseById = async (req, res) => {
    try {
        const { expenseId } = req.params;

        if (!isValidObjectId(expenseId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid expense ID'
            });
        }

        const expense = await Expense.findById(expenseId)
            .populate('createdBy', 'firstName lastName');

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        res.json({ success: true, data: expense });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Add expense
export const addExpense = async (req, res) => {
    try {
        const { categoryId, amount, note } = req.body;

        // ✅ FIX: Convert amount to number
        const numAmount = Number(amount);

        if (!categoryId || !isValidObjectId(categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Valid category ID is required'
            });
        }

        if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid amount is required'
            });
        }

        const category = await ExpenseCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        const expense = await Expense.create({
            category: categoryId,
            categoryName: category.categoryName,
            amount: numAmount,  // ✅ Use number
            note: note?.trim() || '',
            createdBy: req.user._id
        });

        // ✅ FIX: Ensure totalAmount is a number before adding
        category.totalAmount = (Number(category.totalAmount) || 0) + numAmount;
        await category.save();

        emitDashboardUpdate({ action: 'expense_added', amount: numAmount });

        res.status(201).json({ success: true, data: expense });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update expense
export const updateExpense = async (req, res) => {
    try {
        const { expenseId } = req.params;
        const { categoryId, amount, note } = req.body;

        // ✅ FIX: Convert amount to number if provided
        const numAmount = amount !== undefined ? Number(amount) : undefined;

        if (!isValidObjectId(expenseId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid expense ID'
            });
        }

        if (numAmount !== undefined && (isNaN(numAmount) || numAmount <= 0)) {
            return res.status(400).json({
                success: false,
                message: 'Valid amount is required'
            });
        }

        const expense = await Expense.findById(expenseId);
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        const oldAmount = Number(expense.amount) || 0;  // ✅ Ensure number
        const oldCategoryId = expense.category.toString();

        // If changing category
        if (categoryId && categoryId !== oldCategoryId) {
            if (!isValidObjectId(categoryId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category ID'
                });
            }

            const newCategory = await ExpenseCategory.findById(categoryId);
            if (!newCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'New category not found'
                });
            }

            // Subtract from old category
            await ExpenseCategory.findByIdAndUpdate(oldCategoryId, {
                $inc: { totalAmount: -oldAmount }
            });

            // ✅ FIX: Add to new category with proper number conversion
            const amountToAdd = numAmount !== undefined ? numAmount : oldAmount;
            newCategory.totalAmount = (Number(newCategory.totalAmount) || 0) + amountToAdd;
            await newCategory.save();

            expense.category = categoryId;
            expense.categoryName = newCategory.categoryName;
        } else if (numAmount !== undefined && numAmount !== oldAmount) {
            // Same category, different amount
            const diff = numAmount - oldAmount;
            await ExpenseCategory.findByIdAndUpdate(expense.category, {
                $inc: { totalAmount: diff }
            });
        }

        // Update fields
        if (numAmount !== undefined) expense.amount = numAmount;
        if (note !== undefined) expense.note = note.trim();

        await expense.save();

        emitDashboardUpdate({ action: 'expense_updated' });

        res.json({ success: true, data: expense });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete expense
export const deleteExpense = async (req, res) => {
    try {
        const { expenseId } = req.params;

        if (!isValidObjectId(expenseId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid expense ID'
            });
        }

        const expense = await Expense.findById(expenseId);
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        // ✅ FIX: Ensure amount is number before subtracting
        const amountToSubtract = Number(expense.amount) || 0;
        
        await ExpenseCategory.findByIdAndUpdate(expense.category, {
            $inc: { totalAmount: -amountToSubtract }
        });

        await Expense.deleteOne({ _id: expenseId });

        emitDashboardUpdate({ action: 'expense_deleted' });

        res.json({ success: true, message: 'Expense deleted' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get expenses summary by date range
export const getExpenseSummary = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;

        const matchCondition = {};

        if (startDate || endDate) {
            matchCondition.createdAt = {};
            if (startDate) matchCondition.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                matchCondition.createdAt.$lte = end;
            }
        }

        const dateFormat = groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';

        const [byDate, byCategory, totals] = await Promise.all([
            // By date
            Expense.aggregate([
                { $match: matchCondition },
                {
                    $group: {
                        _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
                        amount: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: -1 } }
            ]),

            // By category
            Expense.aggregate([
                { $match: matchCondition },
                {
                    $group: {
                        _id: '$categoryName',
                        amount: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { amount: -1 } }
            ]),

            // Totals
            Expense.aggregate([
                { $match: matchCondition },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' },
                        totalCount: { $sum: 1 }
                    }
                }
            ])
        ]);

        res.json({
            success: true,
            data: {
                byDate,
                byCategory,
                totalAmount: totals[0]?.totalAmount || 0,
                totalCount: totals[0]?.totalCount || 0
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export default {
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
};