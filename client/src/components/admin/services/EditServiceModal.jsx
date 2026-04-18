'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, ChevronLeft } from 'lucide-react';
import categoryService from '@/services/categoryService';
import subcategoryService from '@/services/subcategoryService';
import serviceService from '@/services/serviceService';
import toast from 'react-hot-toast';

const TIERS = ['basic', 'standard', 'premium', 'custom'];

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

    useEffect(() => {
        (async () => {
            try {
                const response = await categoryService.getAll({ limit: 100 });
                const cats = response.data?.categories || response.data || [];
                setCategories(Array.isArray(cats) ? cats : []);
            } catch {
                toast.error('Failed to load categories');
            } finally {
                setLoadingCategories(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (!category) { setSubcategories([]); return; }
        (async () => {
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
            } catch {
                toast.error('Failed to load subcategories');
                setSubcategories([]);
            } finally {
                setLoadingSubcategories(false);
            }
        })();
    }, [category]);

    const handleSubmit = async () => {
        if (!name.trim()) { toast.error('Service name is required'); return; }
        if (!category) { toast.error('Please select a category'); return; }
        if (!subcategory) { toast.error('Please select a subcategory'); return; }
        if (!price) { toast.error('Price is required'); return; }
        if (!duration) { toast.error('Duration is required'); return; }

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
            formData.append('features', JSON.stringify(features.filter((f) => f.trim())));
            await serviceService.update(service._id, formData);
            toast.success('Service updated!');
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update service');
        } finally {
            setLoading(false);
        }
    };

    const canSubmit = name.trim() && category && subcategory && price && duration;

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
                                <h2 className="text-sm font-semibold text-white">Edit Service</h2>
                                <p className="text-[10px] text-white/40 truncate max-w-[220px]">
                                    {service.name}
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
                            Service Name <span className="text-white/20">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Service name"
                            disabled={loading}
                            className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors disabled:opacity-50"
                        />
                    </div>

                    {/* Active & Featured Toggles */}
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: 'Active', sub: isActive ? 'Visible' : 'Hidden', val: isActive, set: setIsActive },
                            { label: 'Featured', sub: isFeatured ? 'Yes' : 'No', val: isFeatured, set: setIsFeatured },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]"
                            >
                                <div>
                                    <p className="text-xs font-medium text-white">{item.label}</p>
                                    <p className="text-[10px] text-white/30 mt-0.5">{item.sub}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => item.set(!item.val)}
                                    disabled={loading}
                                    style={{ width: '40px', height: '22px' }}
                                    className={`relative rounded-full transition-all duration-200 shrink-0 disabled:opacity-50 ${
                                        item.val ? 'bg-white' : 'bg-white/10'
                                    }`}
                                >
                                    <div
                                        className={`absolute top-[3px] w-4 h-4 rounded-full bg-neutral-950 transition-transform duration-200 ${
                                            item.val ? 'translate-x-[21px]' : 'translate-x-[3px]'
                                        }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                            Category <span className="text-white/20">*</span>
                        </label>
                        {loadingCategories ? (
                            <div className="h-9 bg-white/[0.04] animate-pulse rounded-lg" />
                        ) : (
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                disabled={loading}
                                className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white focus:outline-none focus:border-white/20 transition-colors disabled:opacity-50 [color-scheme:dark]"
                            >
                                <option value="">Select category</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Subcategory */}
                    <div>
                        <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                            Subcategory <span className="text-white/20">*</span>
                        </label>
                        {!category ? (
                            <div className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] text-center">
                                <p className="text-[10px] text-white/25">Select a category first</p>
                            </div>
                        ) : loadingSubcategories ? (
                            <div className="h-9 bg-white/[0.04] animate-pulse rounded-lg" />
                        ) : subcategories.length > 0 ? (
                            <select
                                value={subcategory}
                                onChange={(e) => setSubcategory(e.target.value)}
                                disabled={loading}
                                className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white focus:outline-none focus:border-white/20 transition-colors disabled:opacity-50 [color-scheme:dark]"
                            >
                                <option value="">Select subcategory</option>
                                {subcategories.map((sub) => (
                                    <option key={sub._id} value={sub._id}>
                                        {sub.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] text-center">
                                <p className="text-[10px] text-white/25">No subcategories available</p>
                            </div>
                        )}
                    </div>

                    {/* Tier */}
                    <div>
                        <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                            Service Tier
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                            {TIERS.map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setTier(t)}
                                    disabled={loading}
                                    className={`py-2 rounded-lg border text-[10px] font-medium capitalize transition-all disabled:opacity-50 ${
                                        tier === t
                                            ? 'border-white/20 bg-white/[0.08] text-white'
                                            : 'border-white/[0.06] bg-white/[0.02] text-white/30 hover:border-white/[0.12] hover:text-white/50'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price & Duration */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                                Price (₹) <span className="text-white/20">*</span>
                            </label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="500"
                                disabled={loading}
                                className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                                Duration (min) <span className="text-white/20">*</span>
                            </label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="60"
                                disabled={loading}
                                className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors disabled:opacity-50"
                            />
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-[10px] text-white/40 font-medium uppercase tracking-wide">
                                Features ({features.filter((f) => f.trim()).length}/10)
                            </label>
                            <button
                                type="button"
                                onClick={() =>
                                    features.length < 10 && setFeatures((p) => [...p, ''])
                                }
                                disabled={loading || features.length >= 10}
                                className="text-[10px] text-white/30 hover:text-white/60 disabled:opacity-30 transition-colors"
                            >
                                + Add
                            </button>
                        </div>
                        <div className="space-y-1.5">
                            {features.map((f, i) => (
                                <div key={i} className="flex gap-1.5">
                                    <input
                                        type="text"
                                        value={f}
                                        onChange={(e) => {
                                            const updated = [...features];
                                            updated[i] = e.target.value;
                                            setFeatures(updated);
                                        }}
                                        placeholder={`Feature ${i + 1}`}
                                        disabled={loading}
                                        maxLength={100}
                                        className="flex-1 px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors disabled:opacity-50"
                                    />
                                    {features.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFeatures((p) => p.filter((_, idx) => idx !== i))
                                            }
                                            disabled={loading}
                                            className="w-8 h-9 rounded-lg flex items-center justify-center text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition-colors shrink-0"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] space-y-2">
                        <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wide">
                            Summary
                        </p>
                        <SummaryItem label="Name" value={name} />
                        <SummaryItem label="Tier" value={tier} />
                        <SummaryItem label="Price" value={price ? `₹${price}` : null} />
                        <SummaryItem label="Duration" value={duration ? `${duration} min` : null} />
                        <SummaryItem label="Status" value={isActive ? 'Active' : 'Inactive'} />
                        <SummaryItem label="Featured" value={isFeatured ? 'Yes' : 'No'} />
                    </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 p-3 border-t border-white/[0.06]">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || !canSubmit}
                        className="w-full py-2.5 rounded-lg bg-white hover:bg-white/90 text-black text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed"
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
        </>
    );
}

function SummaryItem({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-white/30 shrink-0">{label}</span>
            <span className="text-[11px] text-white/60 text-right truncate capitalize">
                {value || '—'}
            </span>
        </div>
    );
}