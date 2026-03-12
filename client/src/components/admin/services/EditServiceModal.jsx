// src/components/admin/services/EditServiceModal.jsx

'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Upload } from 'lucide-react';
import categoryService from '@/services/categoryService';
import serviceService from '@/services/serviceService';
import toast from 'react-hot-toast';

const TIERS = ['basic', 'standard', 'premium', 'custom'];

export default function EditServiceModal({ service, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Basic Info
    const [name, setName] = useState(service.name || '');
    const [description, setDescription] = useState(service.description || '');
    const [shortDescription, setShortDescription] = useState(service.shortDescription || '');
    const [category, setCategory] = useState(service.category?._id || service.category || '');
    const [tier, setTier] = useState(service.tier || 'basic');
    const [displayOrder, setDisplayOrder] = useState(service.displayOrder || 0);
    const [isActive, setIsActive] = useState(service.isActive);
    const [isFeatured, setIsFeatured] = useState(service.isFeatured || false);

    // Features
    const [highlights, setHighlights] = useState(
        service.highlights?.length ? service.highlights : ['']
    );
    const [includes, setIncludes] = useState(
        service.includes?.length ? service.includes : ['']
    );
    const [excludes, setExcludes] = useState(
        service.excludes?.length ? service.excludes : ['']
    );

    // Images
    const [existingImages, setExistingImages] = useState(service.images || []);
    const [newImages, setNewImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const [imagesToRemove, setImagesToRemove] = useState([]);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getAll({ limit: 100 });
                if (response.success) {
                    setCategories(response.data);
                }
            } catch (error) {
                console.error('Failed to load categories');
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    // Array helpers
    const updateArray = (setter, index, value) => {
        setter(prev => {
            const arr = [...prev];
            arr[index] = value;
            return arr;
        });
    };

    const addArrayItem = (setter) => setter(prev => [...prev, '']);

    const removeArrayItem = (setter, index) => {
        setter(prev => prev.filter((_, i) => i !== index));
    };

    // Image handlers
    const handleNewImages = (e) => {
        const files = Array.from(e.target.files);
        const currentCount = existingImages.length - imagesToRemove.length + newImages.length;
        const remaining = 3 - currentCount;

        if (files.length > remaining) {
            toast.error(`Can only add ${remaining} more image(s)`);
            return;
        }

        setNewImages(prev => [...prev, ...files]);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setNewImagePreviews(prev => [...prev, ev.target.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const markImageForRemoval = (publicId) => {
        setImagesToRemove(prev => [...prev, publicId]);
        setExistingImages(prev => prev.filter(img => img.publicId !== publicId));
    };

    const removeNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Submit
    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error('Service name is required');
            return;
        }
        if (!description.trim()) {
            toast.error('Description is required');
            return;
        }
        if (!category) {
            toast.error('Please select a category');
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('description', description.trim());
            formData.append('shortDescription', shortDescription.trim());
            formData.append('category', category);
            formData.append('tier', tier);
            formData.append('displayOrder', displayOrder);
            formData.append('isActive', isActive);
            formData.append('isFeatured', isFeatured);
            formData.append('highlights', JSON.stringify(highlights.filter(h => h.trim())));
            formData.append('includes', JSON.stringify(includes.filter(i => i.trim())));
            formData.append('excludes', JSON.stringify(excludes.filter(e => e.trim())));

            if (imagesToRemove.length > 0) {
                formData.append('removeImages', JSON.stringify(imagesToRemove));
            }

            newImages.forEach(img => {
                formData.append('images', img);
            });

            await serviceService.update(service._id, formData);
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update service');
        } finally {
            setLoading(false);
        }
    };

    const tabs = ['basic', 'images', 'features'];
    const totalImages = existingImages.length + newImages.length;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-950 border border-neutral-800 w-full max-w-2xl max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
                    <div>
                        <p className="text-xs text-neutral-500 tracking-widest uppercase mb-1">
                            Edit Service
                        </p>
                        <h2 className="text-white text-lg font-light truncate max-w-xs">
                            {service.name}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-neutral-800 shrink-0">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 text-xs tracking-widest uppercase transition-colors capitalize ${
                                activeTab === tab
                                    ? 'text-white border-b border-white'
                                    : 'text-neutral-500 hover:text-white'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Basic Tab */}
                    {activeTab === 'basic' && (
                        <div className="space-y-5">
                            
                            {/* Name */}
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1.5 uppercase tracking-widest">
                                    Service Name *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Service name"
                                    className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600"
                                />
                            </div>

                            {/* Active & Featured Toggles */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-3 border border-neutral-800">
                                    <div>
                                        <p className="text-sm text-white">Active</p>
                                        <p className="text-xs text-neutral-500 mt-0.5">
                                            {isActive ? 'Visible' : 'Hidden'}
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
                                <div className="flex items-center justify-between p-3 border border-neutral-800">
                                    <div>
                                        <p className="text-sm text-white">Featured</p>
                                        <p className="text-xs text-neutral-500 mt-0.5">
                                            {isFeatured ? 'Yes' : 'No'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsFeatured(!isFeatured)}
                                        className={`w-10 h-5 rounded-full transition-colors relative ${
                                            isFeatured ? 'bg-white' : 'bg-neutral-700'
                                        }`}
                                    >
                                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-transform ${
                                            isFeatured ? 'translate-x-5' : 'translate-x-0.5'
                                        }`} />
                                    </button>
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-xs text-neutral-500 uppercase tracking-widest mb-2">
                                    Category *
                                </label>
                                {loadingCategories ? (
                                    <div className="h-10 bg-neutral-800 animate-pulse" />
                                ) : (
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-black border border-neutral-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>
                                                {cat.icon} {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Tier */}
                            <div>
                                <label className="block text-xs text-neutral-500 uppercase tracking-widest mb-2">
                                    Service Tier
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {TIERS.map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setTier(t)}
                                            className={`py-2.5 border text-xs capitalize transition-colors ${
                                                tier === t
                                                    ? 'border-white bg-white/5 text-white'
                                                    : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Short Description */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs text-neutral-500 uppercase tracking-widest">
                                        Short Description
                                    </label>
                                    <span className="text-xs text-neutral-700">
                                        {shortDescription.length}/200
                                    </span>
                                </div>
                                <textarea
                                    value={shortDescription}
                                    onChange={(e) => setShortDescription(e.target.value)}
                                    placeholder="Brief summary..."
                                    rows={2}
                                    maxLength={200}
                                    className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 resize-none"
                                />
                            </div>

                            {/* Full Description */}
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1.5 uppercase tracking-widest">
                                    Full Description *
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Full description..."
                                    rows={4}
                                    className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 resize-none"
                                />
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
                                    placeholder="0"
                                    className="w-full bg-black border border-neutral-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600"
                                />
                            </div>
                        </div>
                    )}

                    {/* Images Tab */}
                    {activeTab === 'images' && (
                        <div className="space-y-4">
                            <p className="text-xs text-neutral-500 tracking-widest uppercase">
                                Service Images (max 3) - Current: {totalImages}
                            </p>
                            
                            <div className="grid grid-cols-3 gap-3">
                                {/* Existing Images */}
                                {existingImages.map((img, i) => (
                                    <div
                                        key={img.publicId || i}
                                        className="relative aspect-square bg-neutral-900 overflow-hidden"
                                    >
                                        <img
                                            src={img.url}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => markImageForRemoval(img.publicId)}
                                            className="absolute top-1 right-1 w-5 h-5 bg-black/80 flex items-center justify-center text-white hover:bg-black"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        {img.isPrimary && (
                                            <span className="absolute bottom-1 left-1 text-xs bg-white text-black px-1">
                                                Primary
                                            </span>
                                        )}
                                    </div>
                                ))}

                                {/* New Images */}
                                {newImagePreviews.map((preview, i) => (
                                    <div
                                        key={`new-${i}`}
                                        className="relative aspect-square bg-neutral-900 overflow-hidden"
                                    >
                                        <img
                                            src={preview}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(i)}
                                            className="absolute top-1 right-1 w-5 h-5 bg-black/80 flex items-center justify-center text-white hover:bg-black"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        <span className="absolute bottom-1 left-1 text-xs bg-neutral-800 text-neutral-400 px-1">
                                            New
                                        </span>
                                    </div>
                                ))}

                                {/* Upload Button */}
                                {totalImages < 3 && (
                                    <label className="aspect-square border border-dashed border-neutral-800 hover:border-neutral-600 flex flex-col items-center justify-center cursor-pointer transition-colors">
                                        <Upload className="w-5 h-5 text-neutral-600 mb-1" />
                                        <span className="text-xs text-neutral-600">Add</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleNewImages}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            <p className="text-xs text-neutral-600">
                                JPG, PNG, WEBP up to 5MB each.
                            </p>
                        </div>
                    )}

                    {/* Features Tab */}
                    {activeTab === 'features' && (
                        <div className="space-y-6">
                            
                            {/* Highlights */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs text-neutral-500 uppercase tracking-widest">
                                        Highlights
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem(setHighlights)}
                                        className="text-xs text-neutral-500 hover:text-white transition-colors"
                                    >
                                        + Add
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {highlights.map((item, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={item}
                                                onChange={(e) => updateArray(setHighlights, i, e.target.value)}
                                                placeholder="e.g. Eco-friendly products"
                                                className="flex-1 bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                                            />
                                            {highlights.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeArrayItem(setHighlights, i)}
                                                    className="text-neutral-700 hover:text-white transition-colors px-2"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Includes */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs text-neutral-500 uppercase tracking-widest">
                                        What's Included
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem(setIncludes)}
                                        className="text-xs text-neutral-500 hover:text-white transition-colors"
                                    >
                                        + Add
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {includes.map((item, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={item}
                                                onChange={(e) => updateArray(setIncludes, i, e.target.value)}
                                                placeholder="e.g. Exterior wash"
                                                className="flex-1 bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                                            />
                                            {includes.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeArrayItem(setIncludes, i)}
                                                    className="text-neutral-700 hover:text-white transition-colors px-2"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Excludes */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs text-neutral-500 uppercase tracking-widest">
                                        What's Not Included
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem(setExcludes)}
                                        className="text-xs text-neutral-500 hover:text-white transition-colors"
                                    >
                                        + Add
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {excludes.map((item, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={item}
                                                onChange={(e) => updateArray(setExcludes, i, e.target.value)}
                                                placeholder="e.g. Engine cleaning"
                                                className="flex-1 bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                                            />
                                            {excludes.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeArrayItem(setExcludes, i)}
                                                    className="text-neutral-700 hover:text-white transition-colors px-2"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
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
                        disabled={loading || !name.trim() || !description.trim() || !category}
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