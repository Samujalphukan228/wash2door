// src/components/admin/categories/EditCategoryModal.jsx

'use client';

import { useState } from 'react';
import { X, Loader2, Upload } from 'lucide-react';
import categoryService from '@/services/categoryService';
import toast from 'react-hot-toast';

const EMOJI_OPTIONS = ['🚗', '🛋️', '👟', '🏠', '🧹', '🧺', '🪟', '🛵', '🚿', '✨'];

export default function EditCategoryModal({ category, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState(category.name || '');
    const [description, setDescription] = useState(category.description || '');
    const [icon, setIcon] = useState(category.icon || '');
    const [displayOrder, setDisplayOrder] = useState(category.displayOrder || 0);
    const [isActive, setIsActive] = useState(category.isActive);

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImage, setExistingImage] = useState(category.image?.url || null);

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

            if (image) {
                formData.append('image', image);
            }

            await categoryService.update(category._id, formData);
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md max-h-[90vh] flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
                    <div>
                        <p className="text-xs text-neutral-500 tracking-widest uppercase mb-1">
                            Edit Category
                        </p>
                        <h2 className="text-white text-lg font-light truncate max-w-xs">
                            {category.name}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    
                    {/* Name */}
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1.5 uppercase tracking-widest">
                            Category Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Category name"
                            className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600"
                        />
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center justify-between p-3 border border-neutral-800">
                        <div>
                            <p className="text-sm text-white">Active Status</p>
                            <p className="text-xs text-neutral-500 mt-0.5">
                                {isActive ? 'Visible to customers' : 'Hidden from customers'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsActive(!isActive)}
                            className={`w-10 h-5 rounded-full transition-colors relative ${
                                isActive ? 'bg-white' : 'bg-neutral-700'
                            }`}
                        >
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-transform ${
                                isActive ? 'translate-x-5' : 'translate-x-0.5'
                            }`} />
                        </button>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1.5 uppercase tracking-widest">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description..."
                            rows={3}
                            className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 resize-none"
                        />
                    </div>

                    {/* Icon */}
                    <div>
                        <label className="block text-xs text-neutral-500 mb-2 uppercase tracking-widest">
                            Icon (Emoji)
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {EMOJI_OPTIONS.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setIcon(emoji)}
                                    className={`w-10 h-10 text-xl border transition-colors ${
                                        icon === emoji
                                            ? 'border-white bg-white/10'
                                            : 'border-neutral-800 hover:border-neutral-600'
                                    }`}
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
                            className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                        />
                    </div>

                    {/* Image */}
                    <div>
                        <label className="block text-xs text-neutral-500 mb-2 uppercase tracking-widest">
                            Category Image
                        </label>
                        <div className="flex items-start gap-4">
                            <div className="relative w-24 h-20 bg-neutral-900 overflow-hidden shrink-0">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                                ) : existingImage && !existingImage.includes('default') ? (
                                    <img src={existingImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-2xl">{icon || '📁'}</span>
                                    </div>
                                )}
                            </div>
                            <label className="border border-dashed border-neutral-800 hover:border-neutral-600 px-3 py-2 cursor-pointer transition-colors text-xs text-neutral-500 hover:text-white">
                                Change Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Display Order */}
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1.5 uppercase tracking-widest">
                            Display Order
                        </label>
                        <input
                            type="number"
                            value={displayOrder}
                            onChange={(e) => setDisplayOrder(Number(e.target.value))}
                            className="w-full bg-black border border-neutral-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-neutral-800 flex items-center gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="border border-neutral-800 text-neutral-400 hover:text-white text-xs tracking-widest uppercase px-4 py-3 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || !name.trim()}
                        className="flex-1 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed text-black text-xs tracking-widest uppercase py-3 transition-colors flex items-center justify-center gap-2"
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
        </div>
    );
}