// src/components/admin/subcategories/EditSubcategoryModal.jsx
'use client';

import { useState } from 'react';
import { X, Loader2, ChevronLeft } from 'lucide-react';
import subcategoryService from '@/services/subcategoryService';
import toast from 'react-hot-toast';

const EMOJI_OPTIONS = ['🚗', '🛋️', '👟', '🏠', '🧹', '🧺', '🪟', '🛵', '🚿', '✨'];

export default function EditSubcategoryModal({ subcategory, categoryName, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState(subcategory.name || '');
    const [description, setDescription] = useState(subcategory.description || '');
    const [icon, setIcon] = useState(subcategory.icon || '');
    const [displayOrder, setDisplayOrder] = useState(subcategory.displayOrder || 0);
    const [isActive, setIsActive] = useState(
        subcategory.isActive !== undefined ? subcategory.isActive : true
    );

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImage] = useState(subcategory.image?.url || null);

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
            toast.error('Subcategory name is required');
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

            if (image) {
                formData.append('image', image);
            }

            await subcategoryService.update(subcategory._id, formData);
            await new Promise(resolve => setTimeout(resolve, 300));
            onClose();
            setTimeout(() => onSuccess(), 100);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update subcategory');
            setLoading(false);
        }
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 hidden sm:block"
                onClick={onClose}
            />

            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
                <div className="pointer-events-auto w-full sm:max-w-lg sm:max-h-[92vh] h-full sm:h-auto flex flex-col bg-black sm:rounded-2xl border-0 sm:border sm:border-white/[0.08] shadow-2xl overflow-hidden">

                    {/* Header */}
                    <div className="shrink-0 flex items-center gap-3 p-3 sm:p-4 border-b border-white/[0.06]">
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.08] bg-white/[0.02] text-gray-500 hover:text-white hover:bg-white/[0.04] transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                                Edit Subcategory
                            </p>
                            <p className="text-sm font-medium text-white mt-0.5 truncate">
                                {subcategory.name}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.08] bg-white/[0.02] text-gray-500 hover:text-white hover:bg-white/[0.04] transition-all"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-5">

                        {/* Category Info */}
                        <div className="p-3 sm:p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1">
                                Category
                            </p>
                            <p className="text-sm text-white">{categoryName}</p>
                        </div>

                        <FieldGroup label="Subcategory Name *">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Subcategory name"
                                disabled={loading}
                                className="w-full bg-white/[0.02] border border-white/[0.08] text-white text-sm placeholder-gray-600 px-3 py-2.5 rounded-xl focus:outline-none focus:border-white/[0.15] transition-colors disabled:opacity-50"
                            />
                        </FieldGroup>

                        {/* Active Toggle */}
                        <div className="p-3 sm:p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-white">Active Status</p>
                                    <p className="text-[10px] text-gray-600 mt-0.5">
                                        {isActive ? 'Visible to customers' : 'Hidden from customers'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsActive(!isActive)}
                                    disabled={loading}
                                    className={`
                                        relative w-11 h-6 rounded-full transition-all
                                        ${isActive ? 'bg-emerald-500' : 'bg-white/[0.08]'}
                                        disabled:opacity-50
                                    `}
                                >
                                    <div className={`
                                        absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                                        ${isActive ? 'translate-x-6' : 'translate-x-1'}
                                    `} />
                                </button>
                            </div>
                        </div>

                        <FieldGroup label="Description">
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description..."
                                rows={3}
                                disabled={loading}
                                className="w-full bg-white/[0.02] border border-white/[0.08] text-white text-sm placeholder-gray-600 px-3 py-2.5 rounded-xl focus:outline-none focus:border-white/[0.15] transition-colors resize-none disabled:opacity-50"
                            />
                        </FieldGroup>

                        <FieldGroup label="Icon (Emoji)">
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {EMOJI_OPTIONS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => setIcon(emoji)}
                                        disabled={loading}
                                        className={`
                                            w-9 h-9 sm:w-10 sm:h-10 text-lg rounded-xl border transition-all
                                            ${icon === emoji
                                                ? 'border-white/[0.15] bg-white/[0.08]'
                                                : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'
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

                        <FieldGroup label="Subcategory Image">
                            <div className="flex items-start gap-3">
                                <div className="relative w-24 h-20 bg-white/[0.04] rounded-xl overflow-hidden shrink-0 border border-white/[0.08] flex items-center justify-center">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : existingImage && !existingImage.includes('default') ? (
                                        <img src={existingImage} alt="Current" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl">{icon || '📂'}</span>
                                    )}
                                </div>
                                <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-white/[0.08] hover:border-white/[0.15] cursor-pointer transition-all text-[10px] sm:text-xs text-gray-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.04]">
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

                        <FieldGroup label="Display Order">
                            <input
                                type="number"
                                value={displayOrder}
                                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                                disabled={loading}
                                className="w-full bg-white/[0.02] border border-white/[0.08] text-white text-sm placeholder-gray-600 px-3 py-2.5 rounded-xl focus:outline-none focus:border-white/[0.15] transition-colors disabled:opacity-50"
                            />
                            <p className="text-[10px] text-gray-600 mt-1.5">Lower numbers appear first</p>
                        </FieldGroup>
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 p-3 sm:p-4 border-t border-white/[0.06] flex gap-2">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="hidden sm:flex items-center px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-xs text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !name.trim()}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 active:bg-white/80 disabled:bg-white/[0.06] disabled:text-gray-600 disabled:cursor-not-allowed transition-all"
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

function FieldGroup({ label, children }) {
    return (
        <div>
            <label className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-medium mb-2 block">
                {label}
            </label>
            {children}
        </div>
    );
}