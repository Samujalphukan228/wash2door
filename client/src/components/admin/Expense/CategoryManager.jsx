'use client';

import { useState } from 'react';
import { X, Edit2, Trash2 } from 'lucide-react';
import expenseService from '@/services/expenseService';
import toast from 'react-hot-toast';

export default function CategoryManager({ categories, onClose, onUpdate }) {
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (categoryId) => {
        if (!editingName.trim()) return;

        setLoading(true);
        try {
            await expenseService.updateCategory(categoryId, editingName.trim());
            toast.success('Category updated');
            setEditingId(null);
            setEditingName('');
            onUpdate();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (categoryId) => {
        if (!confirm('Delete this category? This cannot be undone.')) return;

        setLoading(true);
        try {
            await expenseService.deleteCategory(categoryId);
            toast.success('Category deleted');
            onUpdate();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                    <p className="text-sm font-medium text-white">Manage Categories</p>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-3">
                    <div className="space-y-1">
                        {categories.map((category) => (
                            <div
                                key={category._id}
                                className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-white/[0.03]"
                            >
                                {editingId === category._id ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            className="flex-1 px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-orange-500/50"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => handleUpdate(category._id)}
                                            disabled={loading}
                                            className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-medium hover:bg-emerald-500/30 disabled:opacity-40"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingId(null);
                                                setEditingName('');
                                            }}
                                            className="px-2 py-1 rounded bg-white/[0.06] text-gray-400 text-[10px] font-medium hover:bg-white/[0.1]"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-white">
                                                {category.categoryName}
                                            </p>
                                            <p className="text-[10px] text-gray-600">
                                                ₹{(category.totalAmount || 0).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setEditingId(category._id);
                                                setEditingName(category.categoryName);
                                            }}
                                            className="p-2 rounded hover:bg-white/[0.06] text-gray-400 hover:text-white transition-colors"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category._id)}
                                            disabled={loading}
                                            className="p-2 rounded hover:bg-white/[0.06] text-gray-400 hover:text-red-400 transition-colors disabled:opacity-40"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/[0.06]">
                    <button
                        onClick={onClose}
                        className="w-full py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-gray-400 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}