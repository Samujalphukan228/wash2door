'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import expenseService from '@/services/expenseService';
import {
    Wallet,
    Plus,
    TrendingDown,
    ChevronRight,
    ChevronLeft,
    Loader2,
    X,
    Settings,
    Calendar,
    Edit2,
    Trash2,
    Search,
    Filter,
    Receipt,
    PieChart,
    LayoutGrid,
    List,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    Check,
} from 'lucide-react';

export default function ExpenseListPopup({ isOpen, onClose }) {
    const [categories, setCategories] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [filters, setFilters] = useState({
        categoryId: '',
        search: '',
        page: 1,
        limit: 20
    });

    const [pagination, setPagination] = useState({
        total: 0,
        pages: 0,
        currentPage: 1
    });

    const loadCategories = async () => {
        try {
            const response = await expenseService.getCategories();
            if (response.success) setCategories(response.data || []);
        } catch (error) {
            console.error('Failed to load categories', error);
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
            const response = await expenseService.getSummary({});
            if (response.success) setSummary(response.data);
        } catch (error) {
            console.error('Failed to load summary', error);
        }
    };

    const loadAll = async () => {
        setLoading(true);
        await Promise.all([loadCategories(), loadExpenses(), loadSummary()]);
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen) loadAll();
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && activeTab === 'expenses') loadExpenses();
    }, [filters, activeTab]);

    const handleAddExpense = async (data) => {
        try {
            const response = await expenseService.create(data);
            if (response.success) {
                toast.success('Expense added');
                setShowAddExpense(false);
                setSelectedCategory(null);
                loadAll();
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
            loadAll();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update expense');
        }
    };

    const handleDeleteExpense = async (expenseId) => {
        try {
            await expenseService.delete(expenseId);
            toast.success('Expense deleted');
            loadAll();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete expense');
        }
    };

    const handleCreateCategory = async (name) => {
        try {
            const response = await expenseService.createCategory(name);
            if (response.success) {
                toast.success('Category created');
                setShowAddCategory(false);
                loadCategories();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create category');
        }
    };

    // FIX: Convert totalAmount to Number
    const totalSpent = categories.reduce((sum, c) => sum + (Number(c.totalAmount) || 0), 0);
    const thisMonthExpenses = Number(summary?.thisMonth) || 0;
    const lastMonthExpenses = Number(summary?.lastMonth) || 0;
    const growth = lastMonthExpenses > 0 
        ? Math.round(((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100) 
        : 0;

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50" onClick={onClose} />

            <div className="fixed inset-2 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[460px] sm:max-h-[80vh] bg-neutral-950 rounded-2xl overflow-hidden z-50 flex flex-col border border-white/[0.08]">
                
                {/* Compact Header */}
                <div className="shrink-0 px-4 pt-4 pb-3">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                <Wallet className="w-4 h-4 text-white/80" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-white">Expenses</h2>
                                <p className="text-[10px] text-white/40">Track spending</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setShowCategoryManager(true)}
                                className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center transition-colors"
                            >
                                <Settings className="w-3.5 h-3.5 text-white/40" />
                            </button>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center transition-colors"
                            >
                                <X className="w-3.5 h-3.5 text-white/40" />
                            </button>
                        </div>
                    </div>

                    {/* Compact Stats */}
                    <div className="flex gap-2 mb-4">
                        <StatPill 
                            label="This month" 
                            value={thisMonthExpenses} 
                            trend={growth}
                        />
                        <StatPill 
                            label="Total" 
                            value={totalSpent}
                            sub={`${categories.length} categories`}
                        />
                    </div>

                    {/* Minimal Tabs */}
                    <div className="flex gap-1 p-1 bg-white/[0.04] rounded-lg">
                        {[
                            { key: 'overview', label: 'Overview', icon: PieChart },
                            { key: 'expenses', label: 'History', icon: List },
                            { key: 'categories', label: 'Categories', icon: LayoutGrid }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`
                                    flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium rounded-md transition-all
                                    ${activeTab === tab.key 
                                        ? 'bg-white/10 text-white' 
                                        : 'text-white/40 hover:text-white/60'
                                    }
                                `}
                            >
                                <tab.icon className="w-3 h-3" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                    {loading && expenses.length === 0 ? (
                        <LoadingState />
                    ) : activeTab === 'overview' ? (
                        <OverviewTab
                            categories={categories}
                            onAddExpense={(cat) => {
                                setSelectedCategory(cat);
                                setShowAddExpense(true);
                            }}
                        />
                    ) : activeTab === 'expenses' ? (
                        <ExpensesTab
                            expenses={expenses}
                            categories={categories}
                            filters={filters}
                            setFilters={setFilters}
                            pagination={pagination}
                            onEdit={setEditingExpense}
                            onDelete={handleDeleteExpense}
                            loading={loading}
                        />
                    ) : (
                        <CategoriesTab
                            categories={categories}
                            totalSpent={totalSpent}
                            onAddCategory={() => setShowAddCategory(true)}
                            onAddExpense={(cat) => {
                                setSelectedCategory(cat);
                                setShowAddExpense(true);
                            }}
                        />
                    )}
                </div>

                {/* Slim Footer */}
                <div className="shrink-0 p-3 border-t border-white/[0.06]">
                    <button
                        onClick={() => setShowAddExpense(true)}
                        className="w-full py-2.5 rounded-lg bg-white hover:bg-white/90 text-black text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                    >
                        <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                        Add Expense
                    </button>
                </div>
            </div>

            {/* Modals */}
            {showAddExpense && (
                <AddExpenseSheet
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onClose={() => { setShowAddExpense(false); setSelectedCategory(null); }}
                    onSubmit={handleAddExpense}
                />
            )}
            {showAddCategory && (
                <AddCategorySheet
                    onClose={() => setShowAddCategory(false)}
                    onSubmit={handleCreateCategory}
                />
            )}
            {showCategoryManager && (
                <CategoryManagerSheet
                    categories={categories}
                    onClose={() => setShowCategoryManager(false)}
                    onUpdate={loadCategories}
                />
            )}
            {editingExpense && (
                <EditExpenseSheet
                    expense={editingExpense}
                    categories={categories}
                    onClose={() => setEditingExpense(null)}
                    onSubmit={(data) => handleUpdateExpense(editingExpense._id, data)}
                    onDelete={() => handleDeleteExpense(editingExpense._id)}
                />
            )}
        </>
    );
}

// === STAT PILL ===
function StatPill({ label, value, trend, sub }) {
    const isUp = trend > 0;
    const isDown = trend < 0;

    return (
        <div className="flex-1 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-white/40 font-medium">{label}</span>
                {trend !== undefined && (
                    <span className={`text-[9px] font-semibold flex items-center gap-0.5 ${isUp ? 'text-red-400' : isDown ? 'text-emerald-400' : 'text-white/30'}`}>
                        {isUp ? <ArrowUpRight className="w-2.5 h-2.5" /> : isDown ? <ArrowDownRight className="w-2.5 h-2.5" /> : null}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <p className="text-base font-bold text-white tabular-nums">₹{Number(value).toLocaleString('en-IN')}</p>
            {sub && <p className="text-[9px] text-white/30 mt-0.5">{sub}</p>}
        </div>
    );
}

// === LOADING ===
function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-white/30 animate-spin mb-2" />
            <p className="text-[11px] text-white/30">Loading...</p>
        </div>
    );
}

// === OVERVIEW TAB ===
function OverviewTab({ categories, onAddExpense }) {
    const sorted = [...categories].sort((a, b) => (Number(b.totalAmount) || 0) - (Number(a.totalAmount) || 0));
    const total = sorted.reduce((s, c) => s + (Number(c.totalAmount) || 0), 0);

    if (categories.length === 0) {
        return <EmptyState icon={Wallet} title="No expenses" desc="Add your first category" />;
    }

    return (
        <div className="px-3 py-2 space-y-1.5">
            {sorted.map((cat, i) => {
                const catTotal = Number(cat.totalAmount) || 0;
                const pct = total > 0 ? Math.round(catTotal / total * 100) : 0;
                const isTop = i === 0;

                return (
                    <button
                        key={cat._id}
                        onClick={() => onAddExpense(cat)}
                        className={`
                            w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.99]
                            ${isTop ? 'bg-white text-black' : 'bg-white/[0.03] hover:bg-white/[0.06]'}
                        `}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${isTop ? 'bg-black/10' : 'bg-white/[0.08] text-white/60'}`}>
                            {cat.categoryName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-medium truncate ${isTop ? 'text-black' : 'text-white/80'}`}>
                                    {cat.categoryName}
                                </span>
                                <span className={`text-xs font-semibold tabular-nums ${isTop ? 'text-black' : 'text-white'}`}>
                                    ₹{catTotal.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`flex-1 h-1 rounded-full overflow-hidden ${isTop ? 'bg-black/10' : 'bg-white/[0.08]'}`}>
                                    <div className={`h-full rounded-full ${isTop ? 'bg-black/60' : 'bg-white/30'}`} style={{ width: `${pct}%` }} />
                                </div>
                                <span className={`text-[9px] tabular-nums ${isTop ? 'text-black/50' : 'text-white/30'}`}>{pct}%</span>
                            </div>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isTop ? 'text-black/30' : 'text-white/20'}`} />
                    </button>
                );
            })}
        </div>
    );
}

// === EXPENSES TAB ===
function ExpensesTab({ expenses, categories, filters, setFilters, pagination, onEdit, onDelete, loading }) {
    const [showFilters, setShowFilters] = useState(false);

    const formatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        if (d.toDateString() === now.toDateString()) return 'Today';
        if (d.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString()) return 'Yesterday';
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    const grouped = expenses.reduce((g, e) => {
        const date = new Date(e.createdAt).toDateString();
        if (!g[date]) g[date] = [];
        g[date].push(e);
        return g;
    }, {});

    return (
        <div className="flex flex-col h-full">
            {/* Search */}
            <div className="px-3 py-2 space-y-2">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                            className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-2.5 rounded-lg border transition-colors ${filters.categoryId ? 'bg-white/10 border-white/20' : 'border-white/[0.06] hover:bg-white/[0.04]'}`}
                    >
                        <Filter className="w-3.5 h-3.5 text-white/50" />
                    </button>
                </div>

                {showFilters && (
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                        <FilterChip active={!filters.categoryId} onClick={() => setFilters({ ...filters, categoryId: '', page: 1 })}>All</FilterChip>
                        {categories.map(c => (
                            <FilterChip key={c._id} active={filters.categoryId === c._id} onClick={() => setFilters({ ...filters, categoryId: c._id, page: 1 })}>
                                {c.categoryName}
                            </FilterChip>
                        ))}
                    </div>
                )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-3 pb-2">
                {loading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-4 h-4 text-white/30 animate-spin" /></div>
                ) : expenses.length === 0 ? (
                    <EmptyState icon={Receipt} title="No expenses" desc="Add your first expense" />
                ) : (
                    <div className="space-y-4">
                        {Object.entries(grouped).map(([date, items]) => (
                            <div key={date}>
                                <div className="flex items-center gap-2 mb-1.5 px-1">
                                    <span className="text-[9px] text-white/30 font-semibold uppercase tracking-wide">{formatDate(date)}</span>
                                    <div className="flex-1 h-px bg-white/[0.04]" />
                                    <span className="text-[9px] text-white/20 tabular-nums">₹{items.reduce((s, e) => s + (Number(e.amount) || 0), 0).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="space-y-1">
                                    {items.map((exp) => (
                                        <ExpenseRow key={exp._id} expense={exp} onEdit={() => onEdit(exp)} onDelete={() => { if (confirm('Delete?')) onDelete(exp._id); }} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {pagination.pages > 1 && (
                <div className="px-3 py-2 border-t border-white/[0.04] flex items-center justify-between">
                    <span className="text-[10px] text-white/30">{pagination.currentPage}/{pagination.pages}</span>
                    <div className="flex gap-1">
                        <button onClick={() => setFilters({ ...filters, page: filters.page - 1 })} disabled={filters.page === 1} className="w-7 h-7 rounded-md bg-white/[0.04] flex items-center justify-center disabled:opacity-30">
                            <ChevronLeft className="w-3.5 h-3.5 text-white/50" />
                        </button>
                        <button onClick={() => setFilters({ ...filters, page: filters.page + 1 })} disabled={filters.page === pagination.pages} className="w-7 h-7 rounded-md bg-white/[0.04] flex items-center justify-center disabled:opacity-30">
                            <ChevronRight className="w-3.5 h-3.5 text-white/50" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function FilterChip({ children, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${active ? 'bg-white text-black' : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.08]'}`}
        >
            {children}
        </button>
    );
}

function ExpenseRow({ expense, onEdit, onDelete }) {
    const [open, setOpen] = useState(false);

    return (
        <div 
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer group"
        >
            <div className="w-7 h-7 rounded-md bg-white/[0.06] flex items-center justify-center text-[10px] font-semibold text-white/50 shrink-0">
                {expense.categoryName?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-white/80 truncate">{expense.categoryName}</p>
                {expense.note && <p className="text-[9px] text-white/30 truncate">{expense.note}</p>}
            </div>
            {open ? (
                <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="w-6 h-6 rounded-md bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center">
                        <Edit2 className="w-3 h-3 text-white/50" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-6 h-6 rounded-md bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center">
                        <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                </div>
            ) : (
                <>
                    <span className="text-xs font-semibold text-white tabular-nums">₹{(Number(expense.amount) || 0).toLocaleString('en-IN')}</span>
                    <MoreHorizontal className="w-3.5 h-3.5 text-white/20 opacity-0 group-hover:opacity-100" />
                </>
            )}
        </div>
    );
}

// === CATEGORIES TAB ===
function CategoriesTab({ categories, totalSpent, onAddCategory, onAddExpense }) {
    return (
        <div className="px-3 py-2 space-y-2">
            <button
                onClick={onAddCategory}
                className="w-full p-3 rounded-xl border border-dashed border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-all flex items-center justify-center gap-2 text-white/40 hover:text-white/60"
            >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Add Category</span>
            </button>

            {categories.length === 0 ? (
                <EmptyState icon={LayoutGrid} title="No categories" desc="Create one to start" />
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => {
                        const catTotal = Number(cat.totalAmount) || 0;
                        const pct = totalSpent > 0 ? Math.round(catTotal / totalSpent * 100) : 0;
                        return (
                            <button
                                key={cat._id}
                                onClick={() => onAddExpense(cat)}
                                className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.08] transition-all text-left active:scale-[0.98]"
                            >
                                <div className="w-7 h-7 rounded-md bg-white/[0.08] flex items-center justify-center text-[10px] font-bold text-white/60 mb-2">
                                    {cat.categoryName.charAt(0)}
                                </div>
                                <p className="text-[10px] text-white/40 truncate mb-0.5">{cat.categoryName}</p>
                                <p className="text-sm font-bold text-white tabular-nums">₹{catTotal.toLocaleString('en-IN')}</p>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                                        <div className="h-full bg-white/30 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="text-[8px] text-white/30 tabular-nums">{pct}%</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// === EMPTY STATE ===
function EmptyState({ icon: Icon, title, desc }) {
    return (
        <div className="flex flex-col items-center justify-center py-10 px-4">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-white/20" />
            </div>
            <p className="text-xs font-medium text-white/60 mb-0.5">{title}</p>
            <p className="text-[10px] text-white/30">{desc}</p>
        </div>
    );
}

// === ADD EXPENSE SHEET ===
function AddExpenseSheet({ categories, selectedCategory, onClose, onSubmit }) {
    const [formData, setFormData] = useState({ categoryId: selectedCategory?._id || '', amount: '', note: '' });
    const [loading, setLoading] = useState(false);

    const selectedCat = categories.find(c => c._id === formData.categoryId);
    const quickAmounts = [100, 500, 1000, 2000, 5000];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.categoryId || !formData.amount) return;
        setLoading(true);
        try { 
            await onSubmit({
                ...formData,
                amount: Number(formData.amount)
            }); 
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <Sheet onClose={onClose}>
            <div className="p-4 border-b border-white/[0.06]">
                <h3 className="text-sm font-semibold text-white">Add Expense</h3>
                <p className="text-[10px] text-white/40">Track a new expense</p>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Category */}
                <div>
                    <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">Category</label>
                    <div className="grid grid-cols-3 gap-1.5">
                        {categories.map((cat) => (
                            <button
                                key={cat._id}
                                type="button"
                                onClick={() => setFormData({ ...formData, categoryId: cat._id })}
                                className={`p-2.5 rounded-lg border text-left transition-all ${
                                    formData.categoryId === cat._id
                                        ? 'bg-white text-black border-white'
                                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center ${formData.categoryId === cat._id ? 'bg-black/10' : 'bg-white/[0.08] text-white/50'}`}>
                                        {cat.categoryName.charAt(0)}
                                    </span>
                                    {formData.categoryId === cat._id && <Check className="w-3 h-3" />}
                                </div>
                                <p className={`text-[10px] font-medium truncate ${formData.categoryId === cat._id ? 'text-black' : 'text-white/70'}`}>
                                    {cat.categoryName}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Amount */}
                <div>
                    <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">Amount</label>
                    <div className="relative mb-2">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-white/30 font-semibold">₹</span>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                            min="1"
                            placeholder="0"
                            className="w-full pl-9 pr-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xl font-bold text-white placeholder-white/20 focus:outline-none focus:border-white/20 text-center"
                        />
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                        {quickAmounts.map((amt) => (
                            <button
                                key={amt}
                                type="button"
                                onClick={() => setFormData({ ...formData, amount: String(amt) })}
                                className={`px-2.5 py-1.5 rounded-md text-[10px] font-semibold transition-colors ${
                                    formData.amount === String(amt) ? 'bg-white text-black' : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.08]'
                                }`}
                            >
                                ₹{amt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Note */}
                <div>
                    <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">Note <span className="text-white/20">(optional)</span></label>
                    <input
                        type="text"
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        maxLength={100}
                        className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                        placeholder="What was this for?"
                    />
                </div>

                {/* Preview */}
                {formData.categoryId && formData.amount && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                        <span className="text-[10px] text-white/40">New total in {selectedCat?.categoryName}</span>
                        <span className="text-sm font-bold text-white tabular-nums">
                            ₹{((Number(selectedCat?.totalAmount) || 0) + (Number(formData.amount) || 0)).toLocaleString('en-IN')}
                        </span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !formData.categoryId || !formData.amount}
                    className="w-full py-3 rounded-lg bg-white hover:bg-white/90 text-black text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? 'Adding...' : 'Add Expense'}
                </button>
            </form>
        </Sheet>
    );
}

// === ADD CATEGORY SHEET ===
function AddCategorySheet({ onClose, onSubmit }) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const suggestions = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        try { await onSubmit(name.trim()); } finally { setLoading(false); }
    };

    return (
        <Sheet onClose={onClose}>
            <div className="p-4 border-b border-white/[0.06]">
                <h3 className="text-sm font-semibold text-white">New Category</h3>
                <p className="text-[10px] text-white/40">Organize your expenses</p>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                    <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        maxLength={30}
                        placeholder="e.g., Groceries"
                        className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                    />
                </div>

                <div className="flex gap-1.5 flex-wrap">
                    {suggestions.map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setName(s)}
                            className={`px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-colors ${
                                name === s ? 'bg-white text-black' : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.08]'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={loading || !name.trim()}
                    className="w-full py-3 rounded-lg bg-white hover:bg-white/90 text-black text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? 'Creating...' : 'Create Category'}
                </button>
            </form>
        </Sheet>
    );
}

// === EDIT EXPENSE SHEET ===
function EditExpenseSheet({ expense, categories, onClose, onSubmit, onDelete }) {
    const [formData, setFormData] = useState({ categoryId: expense.category, amount: String(expense.amount), note: expense.note || '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount) return;
        setLoading(true);
        try { 
            await onSubmit({
                ...formData,
                amount: Number(formData.amount)
            }); 
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <Sheet onClose={onClose}>
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-white">Edit Expense</h3>
                    <p className="text-[10px] text-white/40">Update details</p>
                </div>
                <button onClick={() => { if (confirm('Delete this expense?')) { onDelete(); onClose(); } }} className="w-7 h-7 rounded-md bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                    <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">Category</label>
                    <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white focus:outline-none focus:border-white/20 appearance-none"
                    >
                        {categories.map(c => <option key={c._id} value={c._id} className="bg-neutral-900">{c.categoryName}</option>)}
                    </select>
                </div>

                <div>
                    <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">Amount</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/30">₹</span>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                            min="1"
                            className="w-full pl-8 pr-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-white/20"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">Note</label>
                    <input
                        type="text"
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        maxLength={100}
                        className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                        placeholder="Optional"
                    />
                </div>

                <div className="flex gap-2">
                    <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-white/60">Cancel</button>
                    <button type="submit" disabled={loading || !formData.amount} className="flex-1 py-2.5 rounded-lg bg-white hover:bg-white/90 text-black text-xs font-semibold disabled:opacity-30">{loading ? 'Saving...' : 'Save'}</button>
                </div>
            </form>
        </Sheet>
    );
}

// === CATEGORY MANAGER SHEET ===
function CategoryManagerSheet({ categories, onClose, onUpdate }) {
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (id) => {
        if (!editingName.trim()) return;
        setLoading(true);
        try {
            await expenseService.updateCategory(id, editingName.trim());
            toast.success('Updated');
            setEditingId(null);
            setEditingName('');
            onUpdate();
        } catch (e) {
            toast.error('Failed to update');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete category and all expenses?')) return;
        setLoading(true);
        try {
            await expenseService.deleteCategory(id);
            toast.success('Deleted');
            onUpdate();
        } catch (e) {
            toast.error('Failed to delete');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet onClose={onClose}>
            <div className="p-4 border-b border-white/[0.06]">
                <h3 className="text-sm font-semibold text-white">Manage Categories</h3>
                <p className="text-[10px] text-white/40">{categories.length} total</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {categories.length === 0 ? (
                    <EmptyState icon={LayoutGrid} title="No categories" desc="Create one" />
                ) : (
                    categories.map((cat) => (
                        <div key={cat._id} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                            {editingId === cat._id ? (
                                <>
                                    <input
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        className="flex-1 px-2.5 py-1.5 rounded-md bg-white/[0.06] border border-white/[0.1] text-xs text-white focus:outline-none"
                                        autoFocus
                                    />
                                    <button onClick={() => handleUpdate(cat._id)} disabled={loading} className="px-2.5 py-1.5 rounded-md bg-white text-black text-[10px] font-semibold">Save</button>
                                    <button onClick={() => { setEditingId(null); setEditingName(''); }} className="px-2.5 py-1.5 rounded-md bg-white/[0.06] text-white/60 text-[10px] font-medium">Cancel</button>
                                </>
                            ) : (
                                <>
                                    <div className="w-6 h-6 rounded-md bg-white/[0.06] flex items-center justify-center text-[9px] font-bold text-white/50 shrink-0">{cat.categoryName.charAt(0)}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-medium text-white/80 truncate">{cat.categoryName}</p>
                                        <p className="text-[9px] text-white/30 tabular-nums">₹{(Number(cat.totalAmount) || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                    <button onClick={() => { setEditingId(cat._id); setEditingName(cat.categoryName); }} className="w-6 h-6 rounded-md hover:bg-white/[0.06] flex items-center justify-center">
                                        <Edit2 className="w-3 h-3 text-white/40" />
                                    </button>
                                    <button onClick={() => handleDelete(cat._id)} disabled={loading} className="w-6 h-6 rounded-md hover:bg-red-500/10 flex items-center justify-center">
                                        <Trash2 className="w-3 h-3 text-white/40 hover:text-red-400" />
                                    </button>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="shrink-0 p-3 border-t border-white/[0.06]">
                <button onClick={onClose} className="w-full py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-white/50">Done</button>
            </div>
        </Sheet>
    );
}

// === SHEET WRAPPER =======
function Sheet({ children, onClose }) {
    return (
        <>
            <div className="fixed inset-0 bg-black/70 z-[60]" onClick={onClose} />
            <div className="fixed inset-x-2 bottom-2 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[380px] bg-neutral-950 rounded-2xl z-[60] max-h-[85vh] overflow-hidden flex flex-col border border-white/[0.08] shadow-2xl">
                <div className="sm:hidden flex justify-center pt-2 pb-1">
                    <div className="w-8 h-1 rounded-full bg-white/20" />
                </div>
                {children}
            </div>
        </>
    );
}