'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import expenseService from '@/services/expenseService';
import CreateCategoryModal from './CreateCategoryModal';
import AddExpenseModal from './AddExpenseModal';
import EditExpenseModal from './EditExpenseModal';
import CategoryManager from './CategoryManager';
import {
    Wallet,
    Plus,
    TrendingUp,
    ChevronRight,
    Loader2,
    X,
    Settings,
    Calendar,
    Edit2,
    Trash2
} from 'lucide-react';

export default function ExpenseListPopup({ isOpen, onClose }) {
    const [categories, setCategories] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [editingExpense, setEditingExpense] = useState(null);
    const [activeView, setActiveView] = useState('categories'); // 'categories' | 'expenses'

    // Filters for expenses view
    const [filters, setFilters] = useState({
        categoryId: '',
        startDate: '',
        endDate: '',
        page: 1,
        limit: 10
    });

    const [pagination, setPagination] = useState({
        total: 0,
        pages: 0,
        currentPage: 1
    });

    const loadCategories = async () => {
        try {
            setLoading(true);
            const response = await expenseService.getCategories();
            if (response.success) {
                setCategories(response.data || []);
            }
        } catch (error) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const response = await expenseService.getAll(filters);
            if (response.success) {
                setExpenses(response.data || []);
                setPagination({
                    total: response.total,
                    pages: response.pages,
                    currentPage: response.currentPage
                });
            }
        } catch (error) {
            toast.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    const loadSummary = async () => {
        try {
            const response = await expenseService.getSummary({
                startDate: filters.startDate,
                endDate: filters.endDate
            });
            if (response.success) {
                setSummary(response.data);
            }
        } catch (error) {
            console.error('Failed to load summary', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadCategories();
            loadSummary();
        }
    }, [isOpen]);

    useEffect(() => {
        if (activeView === 'expenses') {
            loadExpenses();
        }
    }, [activeView, filters]);

    const handleCreateCategory = async (categoryData) => {
        try {
            const response = await expenseService.createCategory(categoryData.categoryName);
            if (response.success) {
                toast.success('Category created');
                setShowCreateModal(false);
                loadCategories();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create category');
        }
    };

    const handleAddExpense = async (expenseData) => {
        try {
            const response = await expenseService.create(expenseData);
            if (response.success) {
                toast.success('Expense added');
                setShowAddExpenseModal(false);
                setSelectedCategory(null);
                loadCategories();
                loadExpenses();
                loadSummary();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add expense');
        }
    };

    const handleUpdateExpense = async (expenseId, data) => {
        try {
            await expenseService.update(expenseId, data);
            toast.success('Expense updated');
            setEditingExpense(null);
            loadExpenses();
            loadCategories();
            loadSummary();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update expense');
        }
    };

    const handleDeleteExpense = async (expenseId) => {
        if (!confirm('Delete this expense?')) return;
        
        try {
            await expenseService.delete(expenseId);
            toast.success('Expense deleted');
            loadExpenses();
            loadCategories();
            loadSummary();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete expense');
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
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/[0.06] shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <Wallet className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">Expense Manager</p>
                            <p className="text-[10px] text-gray-600">
                                ₹{totalSpent.toLocaleString('en-IN')} total spent
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* View Toggle */}
                        <div className="flex items-center gap-1 p-1 bg-white/[0.04] rounded-lg">
                            <button
                                onClick={() => setActiveView('categories')}
                                className={`px-2.5 py-1.5 rounded text-[10px] font-medium transition-colors ${
                                    activeView === 'categories'
                                        ? 'bg-white/[0.1] text-white'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                Categories
                            </button>
                            <button
                                onClick={() => setActiveView('expenses')}
                                className={`px-2.5 py-1.5 rounded text-[10px] font-medium transition-colors ${
                                    activeView === 'expenses'
                                        ? 'bg-white/[0.1] text-white'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                All Expenses
                            </button>
                        </div>
                        
                        <button
                            onClick={() => setShowCategoryManager(true)}
                            className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
                        >
                            <Settings className="w-4 h-4 text-gray-400" />
                        </button>
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
                    ) : activeView === 'categories' ? (
                        // Categories View
                        categories.length === 0 ? (
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
                        )
                    ) : (
                        // Expenses View
                        <ExpensesView
                            expenses={expenses}
                            categories={categories}
                            filters={filters}
                            setFilters={setFilters}
                            pagination={pagination}
                            onEdit={setEditingExpense}
                            onDelete={handleDeleteExpense}
                        />
                    )}
                </div>

                {/* Modals */}
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

                {showCategoryManager && (
                    <CategoryManager
                        categories={categories}
                        onClose={() => setShowCategoryManager(false)}
                        onUpdate={loadCategories}
                    />
                )}

                {editingExpense && (
                    <EditExpenseModal
                        expense={editingExpense}
                        categories={categories}
                        onClose={() => setEditingExpense(null)}
                        onSubmit={(data) => handleUpdateExpense(editingExpense._id, data)}
                    />
                )}
            </div>
        </div>
    );
}

// === EXPENSE CARD (for category view) ===
function ExpenseCard({ category, onAddExpense }) {
    return (
        <div
            onClick={onAddExpense}
            className="group flex items-center gap-3 p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all hover:bg-white/[0.03] active:bg-white/[0.05] active:scale-[0.99]"
        >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/[0.06]">
                <TrendingUp className="w-4 h-4 text-gray-500" />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-white truncate">
                    {category.categoryName}
                </p>
                <p className="text-[10px] text-gray-600 mt-0.5">
                    Click to add expense
                </p>
            </div>

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

// === EXPENSES VIEW ===
function ExpensesView({ expenses, categories, filters, setFilters, pagination, onEdit, onDelete }) {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-3">
            {/* Filters */}
            <div className="flex gap-2">
                <select
                    value={filters.categoryId}
                    onChange={(e) => setFilters({ ...filters, categoryId: e.target.value, page: 1 })}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-orange-500/50"
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                    ))}
                </select>
            </div>

            {/* Expense List */}
            {expenses.length === 0 ? (
                <div className="flex flex-col items-center py-8">
                    <p className="text-xs text-gray-400">No expenses found</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {expenses.map((expense) => (
                        <div
                            key={expense._id}
                            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-xs font-medium text-white truncate">
                                        {expense.categoryName}
                                    </p>
                                    <span className="text-[10px] text-gray-600">
                                        {formatDate(expense.createdAt)}
                                    </span>
                                </div>
                                {expense.note && (
                                    <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                                        {expense.note}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-white tabular-nums">
                                    ₹{expense.amount.toLocaleString('en-IN')}
                                </p>
                                <button
                                    onClick={() => onEdit(expense)}
                                    className="p-1.5 rounded hover:bg-white/[0.06] text-gray-400 hover:text-white transition-colors"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => onDelete(expense._id)}
                                    className="p-1.5 rounded hover:bg-white/[0.06] text-gray-400 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <p className="text-[10px] text-gray-600">
                        Page {pagination.currentPage} of {pagination.pages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                            disabled={filters.page === 1}
                            className="px-2 py-1 rounded bg-white/[0.04] text-[10px] text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Prev
                        </button>
                        <button
                            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                            disabled={filters.page === pagination.pages}
                            className="px-2 py-1 rounded bg-white/[0.04] text-[10px] text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}