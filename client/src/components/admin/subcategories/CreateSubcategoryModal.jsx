// src/components/admin/subcategories/CreateSubcategoryModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Upload, ChevronLeft } from 'lucide-react';
import categoryService from '@/services/categoryService';
import subcategoryService from '@/services/subcategoryService';
import toast from 'react-hot-toast';

const EMOJI_OPTIONS = ['🚗', '🛋️', '👟', '🏠', '🧹', '🧺', '🪟', '🛵', '🚿', '✨'];

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
            setTimeout(() => onSuccess(), 100);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create subcategory');
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
                                New Subcategory
                            </p>
                            {category && (
                                <p className="text-sm font-medium text-white mt-0.5 truncate">
                                    {category.icon} {category.name}
                                </p>
                            )}
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

                        <FieldGroup label="Subcategory Name *">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Sedan, SUV, 2 Seater"
                                disabled={loading}
                                className="w-full bg-white/[0.02] border border-white/[0.08] text-white text-sm placeholder-gray-600 px-3 py-2.5 rounded-xl focus:outline-none focus:border-white/[0.15] transition-colors disabled:opacity-50"
                            />
                        </FieldGroup>

                        <FieldGroup label="Description">
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of this subcategory..."
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
                                placeholder="Or type custom emoji/icon"
                                disabled={loading}
                                className="w-full bg-white/[0.02] border border-white/[0.08] text-white text-sm placeholder-gray-600 px-3 py-2.5 rounded-xl focus:outline-none focus:border-white/[0.15] transition-colors disabled:opacity-50"
                            />
                        </FieldGroup>

                        <FieldGroup label="Subcategory Image">
                            <div className="flex items-start gap-3">
                                {imagePreview ? (
                                    <div className="relative w-24 h-20 bg-white/[0.04] rounded-xl overflow-hidden shrink-0 border border-white/[0.08]">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => { setImage(null); setImagePreview(null); }}
                                            disabled={loading}
                                            className="absolute top-1 right-1 w-5 h-5 bg-black/80 rounded-lg flex items-center justify-center text-white hover:bg-black transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="w-24 h-20 border border-dashed border-white/[0.08] hover:border-white/[0.15] rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all shrink-0 bg-white/[0.02] hover:bg-white/[0.04]">
                                        <Upload className="w-4 h-4 text-gray-500 mb-1" />
                                        <span className="text-[10px] text-gray-500">Upload</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            disabled={loading}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                                <p className="text-[10px] text-gray-600 pt-1">
                                    Optional. JPG, PNG, WEBP up to 5MB.
                                </p>
                            </div>
                        </FieldGroup>

                        <FieldGroup label="Display Order">
                            <input
                                type="number"
                                value={displayOrder}
                                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                                placeholder="0"
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