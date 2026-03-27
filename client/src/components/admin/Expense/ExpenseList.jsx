'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import expenseService from '@/services/expenseService';
import CreateCategoryModal from './CreateCategoryModal';
import AddExpenseModal from './AddExpenseModal';
import {
    Wallet,
    Plus,
    TrendingUp,
    ChevronRight,
    Loader2,
    X
} from 'lucide-react';

// === MAIN POPUP COMPONENT ===
export default function ExpenseListPopup({ isOpen, onClose, onExpenseAdded }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const response = await expenseService.getAllCategories();
            if (response.success) {
                setCategories(response.categories);
            }
        } catch (error) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadCategories();
        }
    }, [isOpen]);

    const handleCreateCategory = async (categoryData) => {
        try {
            const response = await expenseService.createCategory(categoryData);
            if (response.success) {
                toast.success('Category created');
                setShowCreateModal(false);
                loadCategories();
                // ✅ Refresh dashboard
                onExpenseAdded?.();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create');
        }
    };

    const handleAddExpense = async (expenseData) => {
        try {
            const response = await expenseService.addExpense(expenseData);
            if (response.success) {
                toast.success('Expense added');
                setShowAddExpenseModal(false);
                setSelectedCategory(null);
                loadCategories();
                // ✅ Refresh dashboard stats
                onExpenseAdded?.();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add');
        }
    };

    const openAddExpenseModal = (category) => {
        setSelectedCategory(category);
        setShowAddExpenseModal(true);
    };

    const totalSpent = categories.reduce((sum, c) => sum + (c.totalAmount || 0), 0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/[0.06] shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <Wallet className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">Expenses</p>
                            <p className="text-[10px] text-gray-600">
                                ₹{totalSpent.toLocaleString('en-IN')} total spent
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-[10px] text-gray-400 hover:text-white font-medium transition-all"
                        >
                            <Plus className="w-3 h-3" />
                            Category
                        </button>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-3">
                    {loading ? (
                        <div className="flex flex-col items-center py-8">
                            <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                            <p className="text-[10px] text-gray-600 mt-2">Loading...</p>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="flex flex-col items-center py-8">
                            <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-2">
                                <Wallet className="w-4 h-4 text-gray-600" />
                            </div>
                            <p className="text-xs text-gray-400 mb-1">No categories yet</p>
                            <p className="text-[10px] text-gray-600">Create one to start tracking</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {categories.map((category) => (
                                <ExpenseCard
                                    key={category._id}
                                    category={category}
                                    onAddExpense={() => openAddExpenseModal(category)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Nested Modals */}
                {showCreateModal && (
                    <CreateCategoryModal
                        onClose={() => setShowCreateModal(false)}
                        onSubmit={handleCreateCategory}
                    />
                )}

                {showAddExpenseModal && selectedCategory && (
                    <AddExpenseModal
                        category={selectedCategory}
                        onClose={() => {
                            setShowAddExpenseModal(false);
                            setSelectedCategory(null);
                        }}
                        onSubmit={handleAddExpense}
                    />
                )}
            </div>
        </div>
    );
}

// === EXPENSE CARD (Simplified) ===
function ExpenseCard({ category, onAddExpense }) {
    return (
        <div
            onClick={onAddExpense}
            className="group flex items-center gap-3 p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all hover:bg-white/[0.03] active:bg-white/[0.05] active:scale-[0.99]"
        >
            {/* Left Icon */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/[0.06]">
                <TrendingUp className="w-4 h-4 text-gray-500" />
            </div>

            {/* Middle Content */}
            <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-white truncate">
                    {category.categoryName}
                </p>
                <p className="text-[10px] text-gray-600 mt-0.5">
                    Click to add expense
                </p>
            </div>

            {/* Right Amount + Arrow */}
            <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                    <p className="text-xs sm:text-sm font-semibold text-white tabular-nums">
                        ₹{(category.totalAmount || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-gray-600">spent</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all" />
            </div>
        </div>
    );
}