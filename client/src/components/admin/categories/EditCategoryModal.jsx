'use client';

import { useState } from 'react';
import { X, Loader2, Upload, ChevronLeft } from 'lucide-react';
import categoryService from '@/services/categoryService';
import toast from 'react-hot-toast';

export default function EditCategoryModal({ category, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(category.name || '');
    const [description, setDescription] = useState(category.description || '');
    const [displayOrder, setDisplayOrder] = useState(category.displayOrder || 0);
    const [isActive, setIsActive] = useState(category.isActive);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImage] = useState(category.image?.url || null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error('Category name is required');
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('description', description);
            formData.append('displayOrder', displayOrder);
            formData.append('isActive', isActive);
            if (image) formData.append('image', image);

            await categoryService.update(category._id, formData);
            await new Promise((resolve) => setTimeout(resolve, 300));
            onClose();
            setTimeout(() => onSuccess(), 100);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update category');
            setLoading(false);
        }
    };

    const currentPreview = imagePreview || (existingImage && !existingImage.includes('default') ? existingImage : null);

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-2 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[460px] sm:max-h-[85vh] bg-neutral-950 rounded-2xl overflow-hidden z-50 flex flex-col border border-white/[0.08]">

                {/* Header */}
                <div className="shrink-0 px-4 pt-4 pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-white/60" />
                            </button>
                            <div>
                                <h2 className="text-sm font-semibold text-white">Edit Category</h2>
                                <p className="text-[10px] text-white/40 truncate max-w-[200px]">{category.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center transition-colors"
                        >
                            <X className="w-3.5 h-3.5 text-white/40" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-4">

                    {/* Name */}
                    <div>
                        <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                            Category Name <span className="text-white/20">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Category name"
                            disabled={loading}
                            className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors disabled:opacity-50"
                        />
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                        <div>
                            <p className="text-xs font-medium text-white">Active Status</p>
                            <p className="text-[10px] text-white/30 mt-0.5">
                                {isActive ? 'Visible to customers' : 'Hidden from customers'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsActive(!isActive)}
                            disabled={loading}
                            className={`relative w-10 h-5.5 rounded-full transition-all duration-200 shrink-0 ${
                                isActive ? 'bg-white' : 'bg-white/10'
                            } disabled:opacity-50`}
                            style={{ width: '40px', height: '22px' }}
                        >
                            <div
                                className={`absolute top-[3px] w-4 h-4 rounded-full bg-neutral-950 transition-transform duration-200 ${
                                    isActive ? 'translate-x-[21px]' : 'translate-x-[3px]'
                                }`}
                            />
                        </button>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description..."
                            rows={3}
                            disabled={loading}
                            className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 resize-none transition-colors disabled:opacity-50"
                        />
                    </div>

                    {/* Image */}
                    <div>
                        <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                            Category Image
                        </label>
                        <div className="flex items-start gap-3">
                            <div className="relative w-20 h-16 bg-white/[0.04] rounded-lg overflow-hidden shrink-0 border border-white/[0.06]">
                                {currentPreview ? (
                                    <>
                                        <img src={currentPreview} alt="Preview" className="w-full h-full object-cover" />
                                        {imagePreview && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImage(null);
                                                    setImagePreview(null);
                                                }}
                                                disabled={loading}
                                                className="absolute top-1 right-1 w-5 h-5 bg-black/80 rounded-md flex items-center justify-center text-white hover:bg-black transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-[10px] text-white/20">No image</span>
                                    </div>
                                )}
                            </div>
                            <label className="px-3 py-2 rounded-lg border border-dashed border-white/10 hover:border-white/20 cursor-pointer transition-all text-[10px] text-white/40 hover:text-white/60 bg-white/[0.02] hover:bg-white/[0.04]">
                                Change Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    disabled={loading}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Display Order */}
                    <div>
                        <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                            Display Order
                        </label>
                        <input
                            type="number"
                            value={displayOrder}
                            onChange={(e) => setDisplayOrder(Number(e.target.value))}
                            disabled={loading}
                            className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors disabled:opacity-50"
                        />
                        <p className="text-[10px] text-white/25 mt-1.5">Lower numbers appear first</p>
                    </div>

                    {/* Summary */}
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] space-y-2">
                        <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wide">
                            Summary
                        </p>
                        <SummaryItem label="Name" value={name || '—'} />
                        <SummaryItem label="Status" value={isActive ? 'Active' : 'Inactive'} />
                        <SummaryItem label="Order" value={String(displayOrder)} />
                        <SummaryItem label="Image" value={imagePreview ? 'New image' : existingImage ? 'Current' : 'None'} />
                    </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 p-3 border-t border-white/[0.06]">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || !name.trim()}
                        className="w-full py-2.5 rounded-lg bg-white hover:bg-white/90 text-black text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}

function SummaryItem({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-white/30 shrink-0">{label}</span>
            <span className="text-[11px] text-white/60 text-right truncate capitalize">
                {value || '—'}
            </span>
        </div>
    );
}