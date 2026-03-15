'use client';

import { useState } from 'react';
import { X, Loader2, ChevronLeft } from 'lucide-react';
import subcategoryService from '@/services/subcategoryService';
import toast from 'react-hot-toast';

const EMOJI_OPTIONS = ['🚗', '🛋️', '👟', '🏠', '🧹', '🧺', '🪟', '🛵', '🚿', '✨'];

const inputCls = `
    w-full bg-white/[0.03] border border-white/[0.08]
    text-white/80 text-sm placeholder-white/20
    px-3 py-2.5 rounded-lg
    focus:outline-none focus:border-white/20 focus:bg-white/[0.05]
    transition-all duration-150
`;

const sectionLabel = `text-[10px] text-white/25 uppercase tracking-widest font-medium mb-3 block`;

export default function EditSubcategoryModal({ subcategory, categoryName, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState(subcategory.name || '');
    const [description, setDescription] = useState(subcategory.description || '');
    const [icon, setIcon] = useState(subcategory.icon || '');
    const [displayOrder, setDisplayOrder] = useState(subcategory.displayOrder || 0);
    const [isActive, setIsActive] = useState(subcategory.isActive);

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImage, setExistingImage] = useState(subcategory.image?.url || null);

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
            
            setTimeout(() => {
                onSuccess();
            }, 100);

        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update subcategory');
            setLoading(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 hidden sm:block" onClick={onClose} />

            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
                <div className="
                    pointer-events-auto
                    w-full sm:max-w-lg sm:max-h-[92vh]
                    h-full sm:h-auto
                    flex flex-col
                    bg-[#0a0a0a]
                    sm:rounded-xl
                    border-0 sm:border sm:border-white/[0.08]
                    shadow-2xl shadow-black/80
                    overflow-hidden
                ">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent shrink-0" />

                    {/* Header */}
                    <div className="shrink-0 flex items-center gap-3 px-4 py-4">
                        <button
                            onClick={onClose}
                            className="
                                w-8 h-8 rounded-lg flex items-center justify-center
                                border border-white/[0.06] bg-white/[0.03]
                                text-white/35 hover:text-white/70
                                transition-all duration-150
                            "
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-white/25 uppercase tracking-widest">
                                Edit Subcategory
                            </p>
                            <p className="text-sm font-medium text-white/80 mt-0.5 truncate">
                                {subcategory.name}
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="
                                w-8 h-8 rounded-lg flex items-center justify-center
                                border border-white/[0.06] bg-white/[0.03]
                                text-white/30 hover:text-white/70
                                transition-all duration-150
                            "
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="h-px bg-white/[0.05] shrink-0" />

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
                        
                        {/* Category Info */}
                        <div className="p-3.5 rounded-lg border border-white/[0.07] bg-white/[0.02]">
                            <p className="text-[11px] text-white/25 uppercase tracking-widest font-medium mb-1">Category</p>
                            <p className="text-sm text-white/70">{categoryName}</p>
                        </div>

                        {/* Name */}
                        <div>
                            <label className={sectionLabel}>
                                Subcategory Name *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Subcategory name"
                                disabled={loading}
                                className={inputCls}
                            />
                        </div>

                        {/* Active Toggle */}
                        <div className="p-3.5 rounded-lg border border-white/[0.07] bg-white/[0.02]">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-white/80 font-medium">Active Status</p>
                                    <p className="text-[11px] text-white/30 mt-0.5">
                                        {isActive ? 'Visible to customers' : 'Hidden from customers'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsActive(!isActive)}
                                    disabled={loading}
                                    className={`
                                        relative w-12 h-6 rounded-full transition-all duration-200
                                        ${isActive ? 'bg-white' : 'bg-white/10'}
                                        disabled:opacity-50
                                    `}
                                >
                                    <div className={`
                                        absolute top-1 w-4 h-4 rounded-full bg-black transition-transform duration-200
                                        ${isActive ? 'translate-x-7' : 'translate-x-1'}
                                    `} />
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className={sectionLabel}>
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description..."
                                rows={3}
                                disabled={loading}
                                className={`${inputCls} resize-none`}
                            />
                        </div>

                        {/* Icon */}
                        <div>
                            <label className={sectionLabel}>
                                Icon (Emoji)
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {EMOJI_OPTIONS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => setIcon(emoji)}
                                        disabled={loading}
                                        className={`
                                            w-10 h-10 text-xl rounded-lg border transition-all duration-150
                                            ${icon === emoji
                                                ? 'border-white/25 bg-white/[0.06]'
                                                : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]'
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
                                className={inputCls}
                            />
                        </div>

                        {/* Image */}
                        <div>
                            <label className={sectionLabel}>
                                Subcategory Image
                            </label>
                            <div className="flex items-start gap-3">
                                <div className="relative w-24 h-20 bg-white/[0.03] rounded-lg overflow-hidden shrink-0 border border-white/[0.05]">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : existingImage && !existingImage.includes('default') ? (
                                        <img src={existingImage} alt="Current" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-2xl">{icon || '📂'}</span>
                                        </div>
                                    )}
                                </div>
                                <label className="px-3 py-2 rounded-lg border border-dashed border-white/[0.07] hover:border-white/[0.12] cursor-pointer transition-all duration-150 text-xs text-white/40 hover:text-white/70 bg-white/[0.02]">
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
                            <label className={sectionLabel}>
                                Display Order
                            </label>
                            <input
                                type="number"
                                value={displayOrder}
                                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                                disabled={loading}
                                className={inputCls}
                            />
                            <p className="text-[11px] text-white/20 mt-1.5">
                                Lower numbers appear first
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 h-px bg-white/[0.05]" />
                    <div className="shrink-0 px-4 py-4 flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="
                                hidden sm:flex items-center px-4 py-2.5 rounded-lg
                                border border-white/[0.08] bg-white/[0.03]
                                text-xs text-white/40 hover:text-white/70
                                hover:border-white/[0.14] hover:bg-white/[0.05]
                                transition-all duration-150
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || !name.trim()}
                            className="
                                flex-1 flex items-center justify-center gap-2
                                py-2.5 rounded-lg
                                bg-white text-black text-sm font-medium
                                hover:bg-white/90 active:bg-white/80
                                disabled:bg-white/10 disabled:text-white/20 disabled:cursor-not-allowed
                                shadow-lg shadow-white/10
                                transition-all duration-150
                            "
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