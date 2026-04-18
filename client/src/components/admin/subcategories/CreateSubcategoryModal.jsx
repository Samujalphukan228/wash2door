'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Upload, ChevronLeft } from 'lucide-react';
import categoryService from '@/services/categoryService';
import subcategoryService from '@/services/subcategoryService';
import toast from 'react-hot-toast';

export default function CreateSubcategoryModal({ categoryId, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [displayOrder, setDisplayOrder] = useState(0);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await categoryService.getById(categoryId);
                if (response.success) setCategory(response.data.category);
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
            formData.append('displayOrder', displayOrder);
            if (image) formData.append('image', image);
            await subcategoryService.create(formData);
            await new Promise((resolve) => setTimeout(resolve, 300));
            onClose();
            setTimeout(() => onSuccess(), 100);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create subcategory');
            setLoading(false);
        }
    };

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
                                <h2 className="text-sm font-semibold text-white">
                                    Create Subcategory
                                </h2>
                                <p className="text-[10px] text-white/40">
                                    {category ? category.name : 'Loading...'}
                                </p>
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
                            Subcategory Name <span className="text-white/20">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Sedan, SUV, 2 Seater"
                            disabled={loading}
                            className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors disabled:opacity-50"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of this subcategory..."
                            rows={3}
                            disabled={loading}
                            className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 resize-none transition-colors disabled:opacity-50"
                        />
                    </div>

                    {/* Image */}
                    <div>
                        <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                            Subcategory Image
                        </label>
                        <div className="flex items-start gap-3">
                            {imagePreview ? (
                                <div className="relative w-20 h-16 bg-white/[0.04] rounded-lg overflow-hidden shrink-0 border border-white/[0.06]">
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
                                        className="absolute top-1 right-1 w-5 h-5 bg-black/80 rounded-md flex items-center justify-center text-white hover:bg-black transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <label className="w-20 h-16 border border-dashed border-white/10 hover:border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all shrink-0 bg-white/[0.02] hover:bg-white/[0.04]">
                                    <Upload className="w-3.5 h-3.5 text-white/30 mb-0.5" />
                                    <span className="text-[9px] text-white/30">Upload</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        disabled={loading}
                                        className="hidden"
                                    />
                                </label>
                            )}
                            <p className="text-[10px] text-white/25 pt-1">
                                Optional. JPG, PNG, WEBP up to 5MB.
                            </p>
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
                            placeholder="0"
                            disabled={loading}
                            className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors disabled:opacity-50"
                        />
                        <p className="text-[10px] text-white/25 mt-1.5">
                            Lower numbers appear first
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 p-3 border-t border-white/[0.06]">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !name.trim()}
                        className="w-full py-2.5 rounded-lg bg-white hover:bg-white/90 text-black text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            'Create Subcategory'
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}