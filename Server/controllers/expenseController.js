import ExpenseCategory from '../models/ExpenseCategory.js';
import Expense from '../models/Expense.js';

// ✅ Create category
export const createCategory = async (req, res) => {
    try {
        const { categoryName } = req.body;

        const category = new ExpenseCategory({
            categoryName
        });

        await category.save();
        res.status(201).json({ success: true, category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ✅ Get all categories
export const getAllCategories = async (req, res) => {
    try {
        const categories = await ExpenseCategory.find().sort({ createdAt: -1 });
        res.json({ success: true, categories });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ✅ Add expense
export const addExpense = async (req, res) => {
    try {
        const { categoryId, amount } = req.body;

        const category = await ExpenseCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
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

        res.status(201).json({ success: true, expense, category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ✅ Delete old expenses (2 days old)
export const cleanupOldExpenses = async (req, res) => {
    try {
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

        const result = await Expense.deleteMany({
            createdAt: { $lt: twoDaysAgo }
        });

        res.json({
            success: true,
            message: `${result.deletedCount} old expenses deleted`
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};