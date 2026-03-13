'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Upload, ChevronLeft } from 'lucide-react';
import categoryService from '@/services/categoryService';
import serviceService from '@/services/serviceService';
import toast from 'react-hot-toast';

const TIERS = ['basic', 'standard', 'premium', 'custom'];

const inputCls = `
    w-full bg-white/[0.03] border border-white/[0.08]
    text-white/80 text-sm placeholder-white/20
    px-3 py-2.5 rounded-lg
    focus:outline-none focus:border-white/20 focus:bg-white/[0.05]
    transition-all duration-150
`;

const sectionLabel = `text-[10px] text-white/25 uppercase tracking-widest font-medium mb-3 block`;

export default function EditServiceModal({ service, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [name, setName] = useState(service.name || '');
    const [description, setDescription] = useState(service.description || '');
    const [shortDescription, setShortDescription] = useState(service.shortDescription || '');
    const [category, setCategory] = useState(service.category?._id || service.category || '');
    const [tier, setTier] = useState(service.tier || 'basic');
    const [displayOrder, setDisplayOrder] = useState(service.displayOrder || 0);
    const [isActive, setIsActive] = useState(service.isActive);
    const [isFeatured, setIsFeatured] = useState(service.isFeatured || false);

    const [highlights, setHighlights] = useState(
        service.highlights?.length ? service.highlights : ['']
    );
    const [includes, setIncludes] = useState(
        service.includes?.length ? service.includes : ['']
    );
    const [excludes, setExcludes] = useState(
        service.excludes?.length ? service.excludes : ['']
    );

    const [existingImages, setExistingImages] = useState(service.images || []);
    const [newImages, setNewImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const [imagesToRemove, setImagesToRemove] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getAll({ limit: 100 });
                if (response.success) setCategories(response.data);
            } catch (error) {
                console.error('Failed to load categories');
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    const updateArray = (setter, index, value) => {
        setter(prev => { const arr = [...prev]; arr[index] = value; return arr; });
    };
    const addArrayItem = (setter) => setter(prev => [...prev, '']);
    const removeArrayItem = (setter, index) => {
        setter(prev => prev.filter((_, i) => i !== index));
    };

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
            reader.onload = (ev) => setNewImagePreviews(prev => [...prev, ev.target.result]);
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

    const handleSubmit = async () => {
        if (!name.trim()) { toast.error('Service name is required'); return; }
        if (!description.trim()) { toast.error('Description is required'); return; }
        if (!category) { toast.error('Please select a category'); return; }

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
            if (imagesToRemove.length > 0) formData.append('removeImages', JSON.stringify(imagesToRemove));
            newImages.forEach(img => formData.append('images', img));

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
        <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 hidden sm:block" onClick={onClose} />

            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
                <div className="
                    pointer-events-auto
                    w-full sm:max-w-2xl sm:max-h-[92vh]
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
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.06] bg-white/[0.03] text-white/35 hover:text-white/70 transition-all duration-150"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-white/25 uppercase tracking-widest">Edit Service</p>
                            <p className="text-sm font-medium text-white/80 mt-0.5 truncate">{service.name}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.06] bg-white/[0.03] text-white/30 hover:text-white/70 transition-all duration-150"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex px-4 shrink-0 border-b border-white/[0.05]">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                                    px-4 py-3 text-[11px] uppercase tracking-widest font-medium
                                    transition-all duration-150 capitalize relative
                                    ${activeTab === tab
                                        ? 'text-white/80'
                                        : 'text-white/25 hover:text-white/50'
                                    }
                                `}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-px bg-white/60" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-4 py-5">

                        {/* Basic Tab */}
                        {activeTab === 'basic' && (
                            <div className="space-y-5">
                                <div>
                                    <label className={sectionLabel}>Service Name *</label>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Service name" disabled={loading} className={inputCls} />
                                </div>

                                {/* Active & Featured Toggles */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3.5 rounded-lg border border-white/[0.07] bg-white/[0.02]">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-white/80 font-medium">Active</p>
                                                <p className="text-[11px] text-white/25 mt-0.5">
                                                    {isActive ? 'Visible' : 'Hidden'}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsActive(!isActive)}
                                                disabled={loading}
                                                className={`relative w-12 h-6 rounded-full transition-all duration-200 ${isActive ? 'bg-white' : 'bg-white/10'} disabled:opacity-50`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-transform duration-200 ${isActive ? 'translate-x-7' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-3.5 rounded-lg border border-white/[0.07] bg-white/[0.02]">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-white/80 font-medium">Featured</p>
                                                <p className="text-[11px] text-white/25 mt-0.5">
                                                    {isFeatured ? 'Yes' : 'No'}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsFeatured(!isFeatured)}
                                                disabled={loading}
                                                className={`relative w-12 h-6 rounded-full transition-all duration-200 ${isFeatured ? 'bg-white' : 'bg-white/10'} disabled:opacity-50`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-transform duration-200 ${isFeatured ? 'translate-x-7' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className={sectionLabel}>Category *</label>
                                    {loadingCategories ? (
                                        <div className="h-10 bg-white/[0.04] animate-pulse rounded-lg" />
                                    ) : (
                                        <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={loading} className={inputCls}>
                                            <option value="">Select category</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Tier */}
                                <div>
                                    <label className={sectionLabel}>Service Tier</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {TIERS.map(t => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setTier(t)}
                                                disabled={loading}
                                                className={`
                                                    py-2.5 rounded-lg border text-xs capitalize transition-all duration-150
                                                    ${tier === t
                                                        ? 'border-white/25 bg-white/[0.06] text-white/80'
                                                        : 'border-white/[0.07] bg-white/[0.02] text-white/30 hover:border-white/[0.12]'
                                                    }
                                                    disabled:opacity-50
                                                `}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Short Description */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium">Short Description</label>
                                        <span className="text-[10px] text-white/15">{shortDescription.length}/200</span>
                                    </div>
                                    <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="Brief summary..." rows={2} maxLength={200} disabled={loading} className={`${inputCls} resize-none`} />
                                </div>

                                {/* Full Description */}
                                <div>
                                    <label className={sectionLabel}>Full Description *</label>
                                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Full description..." rows={4} disabled={loading} className={`${inputCls} resize-none`} />
                                </div>

                                {/* Display Order */}
                                <div>
                                    <label className={sectionLabel}>Display Order</label>
                                    <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} placeholder="0" disabled={loading} className={inputCls} />
                                    <p className="text-[11px] text-white/20 mt-1.5">Lower numbers appear first</p>
                                </div>
                            </div>
                        )}

                        {/* Images Tab */}
                        {activeTab === 'images' && (
                            <div className="space-y-4">
                                <label className={sectionLabel}>
                                    Service Images (max 3) — Current: {totalImages}
                                </label>

                                <div className="grid grid-cols-3 gap-3">
                                    {existingImages.map((img, i) => (
                                        <div key={img.publicId || i} className="relative aspect-square bg-white/[0.03] rounded-lg overflow-hidden border border-white/[0.06]">
                                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => markImageForRemoval(img.publicId)}
                                                disabled={loading}
                                                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/80 rounded-md flex items-center justify-center text-white/70 hover:bg-black transition-all duration-150"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            {img.isPrimary && (
                                                <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-white text-black px-1.5 py-0.5 rounded-md font-medium">
                                                    Primary
                                                </span>
                                            )}
                                        </div>
                                    ))}

                                    {newImagePreviews.map((preview, i) => (
                                        <div key={`new-${i}`} className="relative aspect-square bg-white/[0.03] rounded-lg overflow-hidden border border-white/[0.06]">
                                            <img src={preview} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(i)}
                                                disabled={loading}
                                                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/80 rounded-md flex items-center justify-center text-white/70 hover:bg-black transition-all duration-150"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-white/[0.08] text-white/40 px-1.5 py-0.5 rounded-md">
                                                New
                                            </span>
                                        </div>
                                    ))}

                                    {totalImages < 3 && (
                                        <label className="aspect-square border-2 border-dashed border-white/[0.06] hover:border-white/[0.12] rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-150 bg-white/[0.02]">
                                            <Upload className="w-5 h-5 text-white/25 mb-1" />
                                            <span className="text-[11px] text-white/25">Add</span>
                                            <input type="file" accept="image/*" multiple onChange={handleNewImages} disabled={loading} className="hidden" />
                                        </label>
                                    )}
                                </div>

                                <p className="text-[11px] text-white/20">
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
                                        <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium">Highlights</label>
                                        <button type="button" onClick={() => addArrayItem(setHighlights)} disabled={loading} className="text-[11px] text-white/30 hover:text-white/60 transition-all duration-150">+ Add</button>
                                    </div>
                                    <div className="space-y-2">
                                        {highlights.map((item, i) => (
                                            <div key={i} className="flex gap-2">
                                                <input type="text" value={item} onChange={(e) => updateArray(setHighlights, i, e.target.value)} placeholder="e.g. Eco-friendly products" disabled={loading} className={inputCls} />
                                                {highlights.length > 1 && (
                                                    <button type="button" onClick={() => removeArrayItem(setHighlights, i)} disabled={loading} className="w-8 h-10 rounded-lg flex items-center justify-center text-white/20 hover:text-white/60 hover:bg-white/[0.05] transition-all duration-150 shrink-0">
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
                                        <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium">What's Included</label>
                                        <button type="button" onClick={() => addArrayItem(setIncludes)} disabled={loading} className="text-[11px] text-white/30 hover:text-white/60 transition-all duration-150">+ Add</button>
                                    </div>
                                    <div className="space-y-2">
                                        {includes.map((item, i) => (
                                            <div key={i} className="flex gap-2">
                                                <input type="text" value={item} onChange={(e) => updateArray(setIncludes, i, e.target.value)} placeholder="e.g. Exterior wash" disabled={loading} className={inputCls} />
                                                {includes.length > 1 && (
                                                    <button type="button" onClick={() => removeArrayItem(setIncludes, i)} disabled={loading} className="w-8 h-10 rounded-lg flex items-center justify-center text-white/20 hover:text-white/60 hover:bg-white/[0.05] transition-all duration-150 shrink-0">
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
                                        <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium">What's Not Included</label>
                                        <button type="button" onClick={() => addArrayItem(setExcludes)} disabled={loading} className="text-[11px] text-white/30 hover:text-white/60 transition-all duration-150">+ Add</button>
                                    </div>
                                    <div className="space-y-2">
                                        {excludes.map((item, i) => (
                                            <div key={i} className="flex gap-2">
                                                <input type="text" value={item} onChange={(e) => updateArray(setExcludes, i, e.target.value)} placeholder="e.g. Engine cleaning" disabled={loading} className={inputCls} />
                                                {excludes.length > 1 && (
                                                    <button type="button" onClick={() => removeArrayItem(setExcludes, i)} disabled={loading} className="w-8 h-10 rounded-lg flex items-center justify-center text-white/20 hover:text-white/60 hover:bg-white/[0.05] transition-all duration-150 shrink-0">
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
                    <div className="shrink-0 h-px bg-white/[0.05]" />
                    <div className="shrink-0 px-4 py-4 flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="hidden sm:flex items-center px-4 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs text-white/40 hover:text-white/70 hover:border-white/[0.14] hover:bg-white/[0.05] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || !name.trim() || !description.trim() || !category}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 active:bg-white/80 disabled:bg-white/10 disabled:text-white/20 disabled:cursor-not-allowed shadow-lg shadow-white/10 transition-all duration-150"
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