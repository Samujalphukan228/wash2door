import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExpenseCategory',
        required: [true, 'Category is required']
    },
    categoryName: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    note: {
        type: String,
        default: '',
        maxlength: 200
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

expenseSchema.index({ createdAt: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ createdAt: 1, category: 1 });

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;