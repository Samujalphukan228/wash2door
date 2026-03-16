// src/components/admin/categories/EditCategoryModal.jsx
'use client';

import { useState } from 'react';
import { X, Loader2, ChevronLeft } from 'lucide-react';
import categoryService from '@/services/categoryService';
import toast from 'react-hot-toast';

const EMOJI_OPTIONS = ['🚗', '🛋️', '👟', '🏠', '🧹', '🧺', '🪟', '🛵', '🚿', '✨', '🧼', '🪣'];

export default function EditCategoryModal({ category, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(category.name || '');
    const [description, setDescription] = useState(category.description || '');
    const [icon, setIcon] = useState(category.icon || '');
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
            formData.append('icon', icon);
            formData.append('displayOrder', displayOrder);
            formData.append('isActive', isActive);
            if (image) formData.append('image', image);

            await categoryService.update(category._id, formData);
            await new Promise(resolve => setTimeout(resolve, 300));
            onClose();
            setTimeout(() => onSuccess(), 100);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update category');
            setLoading(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden sm:block" onClick={onClose} />

            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
                <div className="
                    pointer-events-auto w-full sm:max-w-lg sm:max-h-[92vh] h-full sm:h-auto
                    flex flex-col bg-black sm:rounded-2xl
                    border-0 sm:border sm:border-white/[0.08]
                    shadow-2xl overflow-hidden
                ">
                    {/* Top Line */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent shrink-0" />

                    {/* Header */}
                    <div className="shrink-0 flex items-center gap-3 px-4 py-4 border-b border-white/[0.06]">
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.08] bg-white/[0.02] text-gray-500 hover:text-white transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Edit</p>
                            <p className="text-sm font-medium text-white mt-0.5 truncate">{category.name}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.08] bg-white/[0.02] text-gray-500 hover:text-white transition-all"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
                        
                        {/* Name */}
                        <FieldGroup label="Category Name *">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Category name"
                                disabled={loading}
                                className="w-full bg-white/[0.02] border border-white/[0.08] text-white text-sm placeholder-gray-600 px-3 py-2.5 rounded-xl focus:outline-none focus:border-white/[0.15] transition-colors disabled:opacity-50"
                            />
                        </FieldGroup>

                        {/* Active Toggle */}
                        <div className="p-3 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-white font-medium">Active Status</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">
                                        {isActive ? 'Visible to customers' : 'Hidden from customers'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsActive(!isActive)}
                                    disabled={loading}
                                    className={`
                                        relative w-11 h-6 rounded-full transition-all duration-200
                                        ${isActive ? 'bg-white' : 'bg-white/10'}
                                        disabled:opacity-50
                                    `}
                                >
                                    <div className={`
                                        absolute top-1 w-4 h-4 rounded-full bg-black transition-transform duration-200
                                        ${isActive ? 'translate-x-6' : 'translate-x-1'}
                                    `} />
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <FieldGroup label="Description">
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description..."
                                rows={3}
                                disabled={loading}
                                className="w-full bg-white/[0.02] border border-white/[0.08] text-white text-sm placeholder-gray-600 px-3 py-2.5 rounded-xl focus:outline-none focus:border-white/[0.15] resize-none transition-colors disabled:opacity-50"
                            />
                        </FieldGroup>

                        {/* Icon */}
                        <FieldGroup label="Icon (Emoji)">
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {EMOJI_OPTIONS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => setIcon(emoji)}
                                        disabled={loading}
                                        className={`
                                            w-9 h-9 text-lg rounded-lg border transition-all
                                            ${icon === emoji
                                                ? 'border-white/25 bg-white/[0.08]'
                                                : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]'
                                            }
                                            disabled:opacity-50
                                        `}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                placeholder="Or type custom emoji"
                                disabled={loading}
                                className="w-full bg-white/[0.02] border border-white/[0.08] text-white text-sm placeholder-gray-600 px-3 py-2.5 rounded-xl focus:outline-none focus:border-white/[0.15] transition-colors disabled:opacity-50"
                            />
                        </FieldGroup>

                        {/* Image */}
                        <FieldGroup label="Category Image">
                            <div className="flex items-start gap-3">
                                <div className="relative w-20 h-16 bg-white/[0.02] rounded-xl overflow-hidden shrink-0 border border-white/[0.08]">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : existingImage && !existingImage.includes('default') ? (
                                        <img src={existingImage} alt="Current" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-2xl">{icon || '📁'}</span>
                                        </div>
                                    )}
                                </div>
                                <label className="px-3 py-2 rounded-xl border border-dashed border-white/[0.12] hover:border-white/[0.2] cursor-pointer transition-all text-[10px] text-gray-400 hover:text-white bg-white/[0.02]">
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
                        </FieldGroup>

                        {/* Display Order */}
                        <FieldGroup label="Display Order" hint="Lower numbers appear first">
                            <input
                                type="number"
                                value={displayOrder}
                                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                                disabled={loading}
                                className="w-full bg-white/[0.02] border border-white/[0.08] text-white text-sm placeholder-gray-600 px-3 py-2.5 rounded-xl focus:outline-none focus:border-white/[0.15] transition-colors disabled:opacity-50"
                            />
                        </FieldGroup>
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 p-4 border-t border-white/[0.06] flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="hidden sm:flex px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-xs text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || !name.trim()}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-gray-200 disabled:bg-white/[0.08] disabled:text-gray-600 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving…
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

function FieldGroup({ label, hint, children }) {
    return (
        <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-2">
                {label}
            </label>
            {children}
            {hint && (
                <p className="text-[10px] text-gray-600 mt-1.5">{hint}</p>
            )}
        </div>
    );
}