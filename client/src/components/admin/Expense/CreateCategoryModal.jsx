'use client';

import { useState } from 'react';
import { X, Wallet } from 'lucide-react';

export default function CreateCategoryModal({ onClose, onSubmit }) {
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryName.trim()) return;
        setLoading(true);
        try {
            await onSubmit({ categoryName: categoryName.trim() });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl w-full max-w-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <Wallet className="w-4 h-4 text-orange-400" />
                        </div>
                        <p className="text-sm font-medium text-white">New Category</p>
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
                    <div>
                        <label className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider mb-1.5 block">
                            Category Name
                        </label>
                        <input
                            type="text"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            required
                            placeholder="e.g., Supplies, Allowance, Rent"
                            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.06] transition-all"
                        />
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
                            disabled={loading || !categoryName.trim()}
                            className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-medium text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}