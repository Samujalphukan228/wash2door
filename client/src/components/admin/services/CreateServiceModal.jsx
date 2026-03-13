'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Plus, Trash2, Upload, ChevronLeft } from 'lucide-react';
import categoryService from '@/services/categoryService';
import serviceService from '@/services/serviceService';
import toast from 'react-hot-toast';

const TIERS = ['basic', 'standard', 'premium', 'custom'];

const defaultVariant = {
    name: '', description: '', price: '',
    discountPrice: '', duration: '', features: []
};

const inputCls = `
    w-full bg-white/[0.03] border border-white/[0.08]
    text-white/80 text-sm placeholder-white/20
    px-3 py-2.5 rounded-lg
    focus:outline-none focus:border-white/20 focus:bg-white/[0.05]
    transition-all duration-150
`;

const sectionLabel = `text-[10px] text-white/25 uppercase tracking-widest font-medium mb-3 block`;

export default function CreateServiceModal({ onClose, onSuccess }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [category, setCategory] = useState('');
    const [tier, setTier] = useState('basic');
    const [displayOrder, setDisplayOrder] = useState(0);
    const [isFeatured, setIsFeatured] = useState(false);

    const [variants, setVariants] = useState([{ ...defaultVariant }]);

    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [highlights, setHighlights] = useState(['']);
    const [includes, setIncludes] = useState(['']);
    const [excludes, setExcludes] = useState(['']);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getAll({ isActive: true, limit: 100 });
                if (response.success) setCategories(response.data);
            } catch (error) {
                toast.error('Failed to load categories');
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
    const removeArrayItem = (setter, index) => setter(prev => prev.filter((_, i) => i !== index));

    const updateVariant = (index, field, value) => {
        setVariants(prev => { const arr = [...prev]; arr[index] = { ...arr[index], [field]: value }; return arr; });
    };
    const addVariant = () => setVariants(prev => [...prev, { ...defaultVariant }]);
    const removeVariant = (index) => {
        if (variants.length === 1) { toast.error('At least one variant required'); return; }
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    const updateVariantFeature = (vIndex, fIndex, value) => {
        setVariants(prev => {
            const arr = [...prev];
            const features = [...(arr[vIndex].features || [])];
            features[fIndex] = value;
            arr[vIndex] = { ...arr[vIndex], features };
            return arr;
        });
    };
    const addVariantFeature = (vIndex) => {
        setVariants(prev => {
            const arr = [...prev];
            arr[vIndex] = { ...arr[vIndex], features: [...(arr[vIndex].features || []), ''] };
            return arr;
        });
    };
    const removeVariantFeature = (vIndex, fIndex) => {
        setVariants(prev => {
            const arr = [...prev];
            arr[vIndex] = { ...arr[vIndex], features: arr[vIndex].features.filter((_, i) => i !== fIndex) };
            return arr;
        });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 3) { toast.error('Maximum 3 images allowed'); return; }
        setImages(prev => [...prev, ...files]);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => setImagePreviews(prev => [...prev, ev.target.result]);
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!name.trim()) { toast.error('Service name is required'); return; }
        if (!description.trim()) { toast.error('Description is required'); return; }
        if (!category) { toast.error('Please select a category'); return; }
        const validVariants = variants.filter(v => v.name && v.price && v.duration);
        if (validVariants.length === 0) { toast.error('At least one complete variant required'); return; }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('description', description.trim());
            formData.append('shortDescription', shortDescription.trim());
            formData.append('category', category);
            formData.append('tier', tier);
            formData.append('displayOrder', displayOrder);
            formData.append('isFeatured', isFeatured);
            formData.append('highlights', JSON.stringify(highlights.filter(h => h.trim())));
            formData.append('includes', JSON.stringify(includes.filter(i => i.trim())));
            formData.append('excludes', JSON.stringify(excludes.filter(e => e.trim())));
            formData.append('variants', JSON.stringify(validVariants.map((v, index) => ({
                name: v.name.trim(), description: v.description?.trim() || '',
                price: Number(v.price), discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
                duration: Number(v.duration), features: (v.features || []).filter(f => f.trim()),
                displayOrder: index, isActive: true
            }))));
            images.forEach(img => formData.append('images', img));

            await serviceService.create(formData);
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create service');
        } finally {
            setLoading(false);
        }
    };

    const canProceed1 = name.trim() && description.trim() && category;
    const canProceed2 = variants.some(v => v.name && v.price && v.duration);

    const stepLabels = ['Basic Info', 'Variants', 'Images & Features'];

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
                            <p className="text-[10px] text-white/25 uppercase tracking-widest">New Service</p>
                            <p className="text-sm font-medium text-white/80 mt-0.5">Create Service</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.06] bg-white/[0.03] text-white/30 hover:text-white/70 transition-all duration-150"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Steps indicator */}
                    <div className="flex items-center gap-0 px-4 py-3 border-y border-white/[0.05] shrink-0">
                        {stepLabels.map((s, i) => (
                            <div key={s} className="flex items-center">
                                <div className={`flex items-center gap-2 px-3 py-1 transition-all duration-150 ${
                                    step === i + 1 ? 'text-white/80' : step > i + 1 ? 'text-white/30' : 'text-white/15'
                                }`}>
                                    <div className={`
                                        w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium border transition-all duration-150
                                        ${step === i + 1
                                            ? 'border-white bg-white text-black'
                                            : step > i + 1
                                            ? 'border-white/20 text-white/40 bg-white/[0.05]'
                                            : 'border-white/[0.08] text-white/15 bg-white/[0.02]'
                                        }
                                    `}>
                                        {i + 1}
                                    </div>
                                    <span className="hidden sm:block text-[11px] tracking-wide">{s}</span>
                                </div>
                                {i < 2 && (
                                    <div className={`h-px w-6 transition-all duration-150 ${
                                        step > i + 1 ? 'bg-white/20' : 'bg-white/[0.06]'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-4 py-5">

                        {/* STEP 1 */}
                        {step === 1 && (
                            <div className="space-y-5">
                                <div>
                                    <label className={sectionLabel}>Service Name *</label>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Premium Wash, Deep Clean" disabled={loading} className={inputCls} />
                                </div>

                                <div>
                                    <label className={sectionLabel}>Category *</label>
                                    {loadingCategories ? (
                                        <div className="h-10 bg-white/[0.04] animate-pulse rounded-lg" />
                                    ) : categories.length === 0 ? (
                                        <div className="p-4 rounded-lg border border-white/[0.07] bg-white/[0.02] text-center">
                                            <p className="text-xs text-white/30">No categories found</p>
                                            <p className="text-[11px] text-white/15 mt-1">Create a category first</p>
                                        </div>
                                    ) : (
                                        <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={loading} className={inputCls}>
                                            <option value="">Select category</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

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

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium">Short Description</label>
                                        <span className="text-[10px] text-white/15">{shortDescription.length}/200</span>
                                    </div>
                                    <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="Brief summary (max 200 chars)" rows={2} maxLength={200} disabled={loading} className={`${inputCls} resize-none`} />
                                </div>

                                <div>
                                    <label className={sectionLabel}>Full Description *</label>
                                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed description of the service..." rows={4} disabled={loading} className={`${inputCls} resize-none`} />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={sectionLabel}>Display Order</label>
                                        <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} placeholder="0" disabled={loading} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={sectionLabel}>Featured</label>
                                        <button
                                            type="button"
                                            onClick={() => setIsFeatured(!isFeatured)}
                                            disabled={loading}
                                            className={`
                                                w-full py-2.5 rounded-lg border text-xs transition-all duration-150
                                                ${isFeatured
                                                    ? 'border-white/25 bg-white/[0.06] text-white/80'
                                                    : 'border-white/[0.07] bg-white/[0.02] text-white/30 hover:border-white/[0.12]'
                                                }
                                                disabled:opacity-50
                                            `}
                                        >
                                            {isFeatured ? '★ Featured' : 'Not Featured'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <div className="space-y-5">
                                <div className="p-3.5 rounded-lg border border-white/[0.07] bg-white/[0.02]">
                                    <p className="text-xs text-white/40">
                                        <strong className="text-white/70">Variants</strong> are different options customers can choose.
                                    </p>
                                    <p className="text-[11px] text-white/20 mt-1">
                                        Examples: "Sedan", "SUV" for car wash | "2 Seater", "L-Shape" for sofa
                                    </p>
                                </div>

                                {variants.map((v, i) => (
                                    <div key={i} className="p-4 rounded-lg border border-white/[0.07] bg-white/[0.02] space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium">
                                                Variant {i + 1}
                                            </label>
                                            {variants.length > 1 && (
                                                <button type="button" onClick={() => removeVariant(i)} disabled={loading} className="w-7 h-7 rounded-md flex items-center justify-center text-white/20 hover:text-red-400/60 hover:bg-white/[0.05] transition-all duration-150">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium mb-1.5 block">Name *</label>
                                                <input type="text" value={v.name} onChange={(e) => updateVariant(i, 'name', e.target.value)} placeholder="e.g. Sedan, 2 Seater" disabled={loading} className={inputCls} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium mb-1.5 block">Description</label>
                                                <input type="text" value={v.description} onChange={(e) => updateVariant(i, 'description', e.target.value)} placeholder="Brief description" disabled={loading} className={inputCls} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium mb-1.5 block">Price (₹) *</label>
                                                <input type="number" value={v.price} onChange={(e) => updateVariant(i, 'price', e.target.value)} placeholder="500" disabled={loading} className={inputCls} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium mb-1.5 block">Discount Price</label>
                                                <input type="number" value={v.discountPrice} onChange={(e) => updateVariant(i, 'discountPrice', e.target.value)} placeholder="450" disabled={loading} className={inputCls} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium mb-1.5 block">Duration (min) *</label>
                                                <input type="number" value={v.duration} onChange={(e) => updateVariant(i, 'duration', e.target.value)} placeholder="60" disabled={loading} className={inputCls} />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium">Features</label>
                                                <button type="button" onClick={() => addVariantFeature(i)} disabled={loading} className="text-[11px] text-white/30 hover:text-white/60 transition-all duration-150">+ Add</button>
                                            </div>
                                            <div className="space-y-2">
                                                {(v.features || []).map((f, fi) => (
                                                    <div key={fi} className="flex gap-2">
                                                        <input type="text" value={f} onChange={(e) => updateVariantFeature(i, fi, e.target.value)} placeholder="e.g. Exterior Wash" disabled={loading} className={inputCls} />
                                                        <button type="button" onClick={() => removeVariantFeature(i, fi)} disabled={loading} className="w-8 h-10 rounded-lg flex items-center justify-center text-white/20 hover:text-white/60 hover:bg-white/[0.05] transition-all duration-150 shrink-0">
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addVariant}
                                    disabled={loading}
                                    className="
                                        w-full border-2 border-dashed border-white/[0.06] hover:border-white/[0.12]
                                        text-white/25 hover:text-white/50
                                        py-4 rounded-lg text-xs uppercase tracking-widest
                                        transition-all duration-150 flex items-center justify-center gap-2
                                        disabled:opacity-50
                                    "
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Variant
                                </button>
                            </div>
                        )}

                        {/* STEP 3 */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <label className={sectionLabel}>Service Images (max 3)</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {imagePreviews.map((preview, i) => (
                                            <div key={i} className="relative aspect-square bg-white/[0.03] rounded-lg overflow-hidden border border-white/[0.06]">
                                                <img src={preview} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(i)}
                                                    disabled={loading}
                                                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/80 rounded-md flex items-center justify-center text-white/70 hover:bg-black transition-all duration-150"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                                {i === 0 && (
                                                    <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-white text-black px-1.5 py-0.5 rounded-md font-medium">
                                                        Primary
                                                    </span>
                                                )}
                                            </div>
                                        ))}

                                        {imagePreviews.length < 3 && (
                                            <label className="aspect-square border-2 border-dashed border-white/[0.06] hover:border-white/[0.12] rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-150 bg-white/[0.02]">
                                                <Upload className="w-5 h-5 text-white/25 mb-1" />
                                                <span className="text-[11px] text-white/25">Add Image</span>
                                                <input type="file" accept="image/*" multiple onChange={handleImageChange} disabled={loading} className="hidden" />
                                            </label>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-white/20 mt-2">
                                        First image will be set as primary. JPG, PNG, WEBP up to 5MB.
                                    </p>
                                </div>

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
                                                <input type="text" value={item} onChange={(e) => updateArray(setIncludes, i, e.target.value)} placeholder="e.g. Full exterior wash" disabled={loading} className={inputCls} />
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
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={() => setStep(step - 1)}
                                disabled={loading}
                                className="flex items-center px-4 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs text-white/40 hover:text-white/70 hover:border-white/[0.14] hover:bg-white/[0.05] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Back
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                if (step < 3) setStep(step + 1);
                                else handleSubmit();
                            }}
                            disabled={
                                loading ||
                                (step === 1 && !canProceed1) ||
                                (step === 2 && !canProceed2)
                            }
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 active:bg-white/80 disabled:bg-white/10 disabled:text-white/20 disabled:cursor-not-allowed shadow-lg shadow-white/10 transition-all duration-150"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating…
                                </>
                            ) : step < 3 ? 'Next' : 'Create Service'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}