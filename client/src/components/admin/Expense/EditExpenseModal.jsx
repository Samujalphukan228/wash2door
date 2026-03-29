'use client';

import { useState } from 'react';
import { X, Edit2 } from 'lucide-react';

export default function EditExpenseModal({ expense, categories, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        categoryId: expense.category,
        amount: expense.amount,
        note: expense.note || ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || parseInt(formData.amount) <= 0) return;
        
        setLoading(true);
        try {
            await onSubmit(formData);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl w-full max-w-sm overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <Edit2 className="w-4 h-4 text-orange-400" />
                        </div>
                        <p className="text-sm font-medium text-white">Edit Expense</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Category */}
                    <div>
                        <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1.5 block">
                            Category
                        </label>
                        <select
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                            required
                            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.06] transition-all"
                        >
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.categoryName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1.5 block">
                            Amount
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                                min="1"
                                className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.06] transition-all"
                            />
                        </div>
                    </div>

                    {/* Note */}
                    <div>
                        <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1.5 block">
                            Note (Optional)
                        </label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            maxLength={200}
                            rows={3}
                            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.06] transition-all resize-none"
                            placeholder="Optional note..."
                        />
                        <p className="text-[9px] text-gray-600 mt-1">
                            {formData.note.length}/200 characters
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-gray-400 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.amount || parseInt(formData.amount) <= 0}
                            className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-medium text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Updating...' : 'Update Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}