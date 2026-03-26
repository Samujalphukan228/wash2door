'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, ChevronLeft } from 'lucide-react';
import categoryService from '@/services/categoryService';
import subcategoryService from '@/services/subcategoryService';
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
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingSubcategories, setLoadingSubcategories] = useState(false);

    const [name, setName] = useState(service.name || '');
    const [category, setCategory] = useState(service.category?._id || service.category || '');
    const [subcategory, setSubcategory] = useState(service.subcategory?._id || service.subcategory || '');
    const [tier, setTier] = useState(service.tier || 'basic');
    const [price, setPrice] = useState(service.price || '');
    const [duration, setDuration] = useState(service.duration || '');
    const [isActive, setIsActive] = useState(service.isActive);
    const [isFeatured, setIsFeatured] = useState(service.isFeatured || false);
    const [features, setFeatures] = useState(
        service.features?.length > 0 ? service.features : ['']
    );

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getAll({ limit: 100 });
                const cats = response.data?.categories || response.data || [];
                setCategories(Array.isArray(cats) ? cats : []);
            } catch (error) {
                console.error('Failed to load categories:', error);
                toast.error('Failed to load categories');
                setCategories([]);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    // Fetch subcategories when category changes
    useEffect(() => {
        if (!category) {
            setSubcategories([]);
            return;
        }

        const fetchSubcategories = async () => {
            try {
                setLoadingSubcategories(true);
                const response = await subcategoryService.getByCategory(category);
                
                let subs = [];
                if (response.data?.subcategories && Array.isArray(response.data.subcategories)) {
                    subs = response.data.subcategories;
                } else if (Array.isArray(response.data)) {
                    subs = response.data;
                }
                
                setSubcategories(Array.isArray(subs) ? subs : []);
            } catch (error) {
                console.error('Failed to load subcategories:', error);
                toast.error('Failed to load subcategories');
                setSubcategories([]);
            } finally {
                setLoadingSubcategories(false);
            }
        };
        
        fetchSubcategories();
    }, [category]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error('Service name is required');
            return;
        }
        if (!category) {
            toast.error('Please select a category');
            return;
        }
        if (!subcategory) {
            toast.error('Please select a subcategory');
            return;
        }
        if (!price) {
            toast.error('Price is required');
            return;
        }
        if (!duration) {
            toast.error('Duration is required');
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('category', category);
            formData.append('subcategory', subcategory);
            formData.append('tier', tier);
            formData.append('price', Number(price));
            formData.append('duration', Number(duration));
            formData.append('isActive', isActive);
            formData.append('isFeatured', isFeatured);
            formData.append('features', JSON.stringify(features.filter(f => f.trim())));

            await serviceService.update(service._id, formData);
            toast.success('Service updated successfully');
            onSuccess();
        } catch (error) {
            console.error('Update service error:', error);
            toast.error(error.response?.data?.message || 'Failed to update service');
        } finally {
            setLoading(false);
        }
    };

    const canSubmit = name.trim() && category && subcategory && price && duration;

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

                    <div className="h-px bg-white/[0.05] shrink-0" />

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
                        
                        {/* Service Name */}
                        <div>
                            <label className={sectionLabel}>Service Name *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Service name"
                                disabled={loading}
                                className={inputCls}
                            />
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
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    disabled={loading}
                                    className={inputCls}
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

                        {/* Subcategory */}
                        <div>
                            <label className={sectionLabel}>Subcategory *</label>
                            {!category ? (
                                <div className="p-4 rounded-lg border border-white/[0.07] bg-white/[0.02] text-center">
                                    <p className="text-xs text-white/30">Select a category first</p>
                                </div>
                            ) : loadingSubcategories ? (
                                <div className="space-y-2">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-10 bg-white/[0.04] animate-pulse rounded-lg" />
                                    ))}
                                </div>
                            ) : subcategories.length > 0 ? (
                                <select
                                    value={subcategory}
                                    onChange={(e) => setSubcategory(e.target.value)}
                                    disabled={loading}
                                    className={inputCls}
                                >
                                    <option value="">Select subcategory</option>
                                    {subcategories.map(sub => (
                                        <option key={sub._id} value={sub._id}>
                                            {sub.icon} {sub.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="p-4 rounded-lg border border-white/[0.07] bg-white/[0.02] text-center">
                                    <p className="text-xs text-white/30">No subcategories available</p>
                                </div>
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

                        {/* Price & Duration */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={sectionLabel}>Price (₹) *</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="500"
                                    disabled={loading}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className={sectionLabel}>Duration (min) *</label>
                                <input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    placeholder="60"
                                    disabled={loading}
                                    className={inputCls}
                                />
                            </div>
                        </div>

                        {/* Features */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className={sectionLabel} style={{ marginBottom: 0 }}>
                                    Features ({features.filter(f => f.trim()).length}/10)
                                </label>
                                <button
                                    type="button"
                                    onClick={() => features.length < 10 && setFeatures(p => [...p, ''])}
                                    disabled={loading || features.length >= 10}
                                    className="text-[11px] text-white/30 hover:text-white/60 disabled:opacity-30 transition-all duration-150"
                                >
                                    + Add
                                </button>
                            </div>
                            <div className="space-y-2">
                                {features.map((f, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={f}
                                            onChange={(e) => {
                                                const updated = [...features];
                                                updated[i] = e.target.value;
                                                setFeatures(updated);
                                            }}
                                            placeholder={`e.g. Feature ${i + 1}`}
                                            disabled={loading}
                                            className={inputCls}
                                            maxLength={100}
                                        />
                                        {features.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setFeatures(p => p.filter((_, idx) => idx !== i))}
                                                disabled={loading}
                                                className="w-8 h-10 rounded-lg flex items-center justify-center text-white/20 hover:text-white/60 hover:bg-white/[0.05] transition-all duration-150 shrink-0"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
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
                            disabled={loading || !canSubmit}
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