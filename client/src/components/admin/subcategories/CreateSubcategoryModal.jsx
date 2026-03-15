'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Upload, ChevronLeft } from 'lucide-react';
import categoryService from '@/services/categoryService';
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

export default function CreateSubcategoryModal({ categoryId, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState(null);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('');
    const [displayOrder, setDisplayOrder] = useState(0);

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await categoryService.getById(categoryId);
                if (response.success) {
                    setCategory(response.data.category);
                }
            } catch (error) {
                toast.error('Failed to load category');
                onClose();
            }
        };
        fetchCategory();
    }, [categoryId, onClose]);

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
            formData.append('category', categoryId);
            formData.append('description', description);
            formData.append('icon', icon);
            formData.append('displayOrder', displayOrder);

            if (image) {
                formData.append('image', image);
            }

            await subcategoryService.create(formData);
            
            await new Promise(resolve => setTimeout(resolve, 300));
            onClose();
            
            setTimeout(() => {
                onSuccess();
            }, 100);

        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create subcategory');
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
                                New Subcategory
                            </p>
                            {category && (
                                <p className="text-sm font-medium text-white/80 mt-0.5 truncate">
                                    {category.icon} {category.name}
                                </p>
                            )}
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
                        
                        {/* Name */}
                        <div>
                            <label className={sectionLabel}>
                                Subcategory Name *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Sedan, SUV, 2 Seater"
                                disabled={loading}
                                className={inputCls}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className={sectionLabel}>
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of this subcategory..."
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
                                placeholder="Or type custom emoji/icon"
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
                                {imagePreview ? (
                                    <div className="relative w-24 h-20 bg-white/[0.03] rounded-lg overflow-hidden shrink-0">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImage(null);
                                                setImagePreview(null);
                                            }}
                                            disabled={loading}
                                            className="absolute top-1 right-1 w-5 h-5 bg-black/80 rounded flex items-center justify-center text-white hover:bg-black transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="w-24 h-20 border-2 border-dashed border-white/[0.07] hover:border-white/[0.12] rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-150 shrink-0 bg-white/[0.02]">
                                        <Upload className="w-5 h-5 text-white/30 mb-1" />
                                        <span className="text-xs text-white/30">Upload</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            disabled={loading}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                                <p className="text-xs text-white/30 pt-1">
                                    Optional. JPG, PNG, WEBP up to 5MB.
                                </p>
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
                                placeholder="0"
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
                                    Creating…
                                </>
                            ) : (
                                'Create Subcategory'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}