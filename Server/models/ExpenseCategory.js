import mongoose from 'mongoose';

const expenseCategorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true
    },
    totalAmount: {
        type: Number,
        default: 0,
        min: [0, 'Total cannot be negative']
    }
}, { timestamps: true });

expenseCategorySchema.index({ categoryName: 1 });

const ExpenseCategory = mongoose.models.ExpenseCategory || mongoose.model('ExpenseCategory', expenseCategorySchema);

export default ExpenseCategory;