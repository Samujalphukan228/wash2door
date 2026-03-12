// src/components/admin/services/CreateServiceModal.jsx

'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import categoryService from '@/services/categoryService';
import serviceService from '@/services/serviceService';
import toast from 'react-hot-toast';

const TIERS = ['basic', 'standard', 'premium', 'custom'];

const defaultVariant = {
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    duration: '',
    features: []
};

export default function CreateServiceModal({ onClose, onSuccess }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Step 1: Basic Info
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [category, setCategory] = useState('');
    const [tier, setTier] = useState('basic');
    const [displayOrder, setDisplayOrder] = useState(0);
    const [isFeatured, setIsFeatured] = useState(false);

    // Step 2: Variants
    const [variants, setVariants] = useState([{ ...defaultVariant }]);

    // Step 3: Images & Features
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [highlights, setHighlights] = useState(['']);
    const [includes, setIncludes] = useState(['']);
    const [excludes, setExcludes] = useState(['']);

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getAll({ isActive: true, limit: 100 });
                if (response.success) {
                    setCategories(response.data);
                }
            } catch (error) {
                toast.error('Failed to load categories');
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

    // Variant helpers
    const updateVariant = (index, field, value) => {
        setVariants(prev => {
            const arr = [...prev];
            arr[index] = { ...arr[index], [field]: value };
            return arr;
        });
    };

    const addVariant = () => {
        setVariants(prev => [...prev, { ...defaultVariant }]);
    };

    const removeVariant = (index) => {
        if (variants.length === 1) {
            toast.error('At least one variant required');
            return;
        }
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
            arr[vIndex] = {
                ...arr[vIndex],
                features: [...(arr[vIndex].features || []), '']
            };
            return arr;
        });
    };

    const removeVariantFeature = (vIndex, fIndex) => {
        setVariants(prev => {
            const arr = [...prev];
            arr[vIndex] = {
                ...arr[vIndex],
                features: arr[vIndex].features.filter((_, i) => i !== fIndex)
            };
            return arr;
        });
    };

    // Image handling
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 3) {
            toast.error('Maximum 3 images allowed');
            return;
        }
        setImages(prev => [...prev, ...files]);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImagePreviews(prev => [...prev, ev.target.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
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

        const validVariants = variants.filter(v =>
            v.name && v.price && v.duration
        );

        if (validVariants.length === 0) {
            toast.error('At least one complete variant required');
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
            formData.append('isFeatured', isFeatured);
            formData.append('highlights', JSON.stringify(highlights.filter(h => h.trim())));
            formData.append('includes', JSON.stringify(includes.filter(i => i.trim())));
            formData.append('excludes', JSON.stringify(excludes.filter(e => e.trim())));
            formData.append('variants', JSON.stringify(validVariants.map((v, index) => ({
                name: v.name.trim(),
                description: v.description?.trim() || '',
                price: Number(v.price),
                discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
                duration: Number(v.duration),
                features: (v.features || []).filter(f => f.trim()),
                displayOrder: index,
                isActive: true
            }))));

            images.forEach(img => {
                formData.append('images', img);
            });

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

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-950 border border-neutral-800 w-full max-w-2xl max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
                    <div>
                        <p className="text-xs text-neutral-500 tracking-widest uppercase mb-1">
                            New Service
                        </p>
                        <h2 className="text-white text-lg font-light">
                            Create Service
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Steps */}
                <div className="flex items-center gap-0 px-6 py-3 border-b border-neutral-800 shrink-0">
                    {['Basic Info', 'Variants', 'Images & Features'].map((s, i) => (
                        <div key={s} className="flex items-center">
                            <div className={`flex items-center gap-2 px-3 py-1 text-xs transition-colors ${
                                step === i + 1
                                    ? 'text-white'
                                    : step > i + 1
                                    ? 'text-neutral-500'
                                    : 'text-neutral-700'
                            }`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                    step === i + 1
                                        ? 'border-white bg-white text-black'
                                        : step > i + 1
                                        ? 'border-neutral-600 text-neutral-500'
                                        : 'border-neutral-800 text-neutral-700'
                                }`}>
                                    {i + 1}
                                </div>
                                <span className="hidden sm:block">{s}</span>
                            </div>
                            {i < 2 && (
                                <div className={`h-px w-4 ${
                                    step > i + 1 ? 'bg-neutral-600' : 'bg-neutral-800'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* STEP 1: Basic Info */}
                    {step === 1 && (
                        <div className="space-y-5">
                            
                            {/* Service Name */}
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1.5 uppercase tracking-widest">
                                    Service Name *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Premium Wash, Deep Clean"
                                    className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600"
                                />
                            </div>

                            {/* Category Select */}
                            <div>
                                <label className="block text-xs text-neutral-500 uppercase tracking-widest mb-2">
                                    Category *
                                </label>
                                {loadingCategories ? (
                                    <div className="h-10 bg-neutral-800 animate-pulse" />
                                ) : categories.length === 0 ? (
                                    <div className="border border-neutral-800 p-3 text-center">
                                        <p className="text-xs text-neutral-500">No categories found</p>
                                        <p className="text-xs text-neutral-600 mt-1">
                                            Create a category first
                                        </p>
                                    </div>
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
                                    placeholder="Brief summary (max 200 chars)"
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
                                    placeholder="Detailed description of the service..."
                                    rows={4}
                                    className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 resize-none"
                                />
                            </div>

                            {/* Display Order & Featured */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1.5 uppercase tracking-widest">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={displayOrder}
                                        onChange={(e) => setDisplayOrder(Number(e.target.value))}
                                        placeholder="0"
                                        className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-neutral-500 uppercase tracking-widest mb-1.5">
                                        Featured
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setIsFeatured(!isFeatured)}
                                        className={`w-full py-2.5 border text-xs transition-colors ${
                                            isFeatured
                                                ? 'border-white bg-white/5 text-white'
                                                : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'
                                        }`}
                                    >
                                        {isFeatured ? '★ Featured' : 'Not Featured'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Variants */}
                    {step === 2 && (
                        <div className="space-y-6">
                            
                            {/* Info Box */}
                            <div className="p-3 border border-neutral-800 bg-neutral-900/50">
                                <p className="text-xs text-neutral-400">
                                    <strong className="text-white">Variants</strong> are different options customers can choose.
                                    <br />
                                    <span className="text-neutral-500">
                                        Examples: "Sedan", "SUV" for car wash | "2 Seater", "L-Shape" for sofa | "Sneakers", "Boots" for shoes
                                    </span>
                                </p>
                            </div>

                            {variants.map((v, i) => (
                                <div key={i} className="border border-neutral-800 p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-neutral-500 tracking-widest uppercase">
                                            Variant {i + 1}
                                        </p>
                                        {variants.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeVariant(i)}
                                                className="text-neutral-700 hover:text-white transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1.5">
                                                Variant Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={v.name}
                                                onChange={(e) => updateVariant(i, 'name', e.target.value)}
                                                placeholder="e.g. Sedan, 2 Seater"
                                                className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1.5">
                                                Description
                                            </label>
                                            <input
                                                type="text"
                                                value={v.description}
                                                onChange={(e) => updateVariant(i, 'description', e.target.value)}
                                                placeholder="Brief description"
                                                className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1.5">
                                                Price (₹) *
                                            </label>
                                            <input
                                                type="number"
                                                value={v.price}
                                                onChange={(e) => updateVariant(i, 'price', e.target.value)}
                                                placeholder="500"
                                                className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1.5">
                                                Discount Price
                                            </label>
                                            <input
                                                type="number"
                                                value={v.discountPrice}
                                                onChange={(e) => updateVariant(i, 'discountPrice', e.target.value)}
                                                placeholder="450"
                                                className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1.5">
                                                Duration (min) *
                                            </label>
                                            <input
                                                type="number"
                                                value={v.duration}
                                                onChange={(e) => updateVariant(i, 'duration', e.target.value)}
                                                placeholder="60"
                                                className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                                            />
                                        </div>
                                    </div>

                                    {/* Variant Features */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs text-neutral-500">Features</label>
                                            <button
                                                type="button"
                                                onClick={() => addVariantFeature(i)}
                                                className="text-xs text-neutral-500 hover:text-white transition-colors"
                                            >
                                                + Add
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {(v.features || []).map((f, fi) => (
                                                <div key={fi} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={f}
                                                        onChange={(e) => updateVariantFeature(i, fi, e.target.value)}
                                                        placeholder="e.g. Exterior Wash"
                                                        className="flex-1 bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-1.5 focus:outline-none focus:border-neutral-600"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariantFeature(i, fi)}
                                                        className="text-neutral-700 hover:text-white transition-colors px-2"
                                                    >
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
                                className="w-full border border-dashed border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600 py-3 text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Variant
                            </button>
                        </div>
                    )}

                    {/* STEP 3: Images & Features */}
                    {step === 3 && (
                        <div className="space-y-6">
                            
                            {/* Images */}
                            <div>
                                <p className="text-xs text-neutral-500 tracking-widest uppercase mb-3">
                                    Service Images (max 3)
                                </p>
                                <div className="grid grid-cols-3 gap-3">
                                    {imagePreviews.map((preview, i) => (
                                        <div key={i} className="relative aspect-square bg-neutral-900 overflow-hidden">
                                            <img src={preview} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                className="absolute top-1 right-1 w-5 h-5 bg-black/80 flex items-center justify-center text-white hover:bg-black transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            {i === 0 && (
                                                <span className="absolute bottom-1 left-1 text-xs bg-white text-black px-1">
                                                    Primary
                                                </span>
                                            )}
                                        </div>
                                    ))}

                                    {imagePreviews.length < 3 && (
                                        <label className="aspect-square border border-dashed border-neutral-800 hover:border-neutral-600 flex flex-col items-center justify-center cursor-pointer transition-colors">
                                            <Upload className="w-5 h-5 text-neutral-600 mb-1" />
                                            <span className="text-xs text-neutral-600">Add Image</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                                <p className="text-xs text-neutral-600 mt-2">
                                    First image will be set as primary. JPG, PNG, WEBP up to 5MB.
                                </p>
                            </div>

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
                                                placeholder="e.g. Full exterior wash"
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
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={() => setStep(step - 1)}
                            className="border border-neutral-800 text-neutral-400 hover:text-white text-xs tracking-widest uppercase px-4 py-3 transition-colors"
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
                        className="flex-1 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed text-black text-xs tracking-widest uppercase py-3 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Creating...
                            </>
                        ) : step < 3 ? 'Next' : 'Create Service'}
                    </button>
                </div>
            </div>
        </div>
    );
}