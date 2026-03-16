// src/components/admin/services/CreateServiceModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Upload, ChevronLeft } from 'lucide-react';
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

export default function CreateServiceModal({ onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingSubcategories, setLoadingSubcategories] = useState(false);

    const [category, setCategory] = useState('');
    const [subcategory, setSubcategory] = useState('');
    const [tier, setTier] = useState('basic');
    const [price, setPrice] = useState('');
    const [discountPrice, setDiscountPrice] = useState('');
    const [duration, setDuration] = useState('');
    
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getAll({ limit: 100 });
                console.log('📦 Categories response:', response);
                
                const cats = response.data?.categories || response.data || [];
                setCategories(Array.isArray(cats) ? cats : []);
            } catch (error) {
                console.error('❌ Failed to load categories:', error);
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
            setSubcategory('');
            return;
        }

        const fetchSubcategories = async () => {
            try {
                setLoadingSubcategories(true);
                console.log('🔄 Fetching subcategories for category:', category);
                
                const response = await subcategoryService.getByCategory(category);
                
                console.log('📦 Subcategories response:', response);

                // Handle the response structure correctly
                let subs = [];
                
                // Check if response.data has subcategories property
                if (response.data?.subcategories && Array.isArray(response.data.subcategories)) {
                    subs = response.data.subcategories;
                }
                // Check if response.data itself is an array
                else if (Array.isArray(response.data)) {
                    subs = response.data;
                }
                // Fallback: check if entire response is array
                else if (Array.isArray(response)) {
                    subs = response;
                }

                console.log('✅ Subcategories loaded:', {
                    count: subs.length,
                    items: subs.map(s => ({ id: s._id, name: s.name }))
                });

                setSubcategories(Array.isArray(subs) ? subs : []);
                setSubcategory('');
            } catch (error) {
                console.error('❌ Failed to load subcategories:', error);
                toast.error('Failed to load subcategories');
                setSubcategories([]);
            } finally {
                setLoadingSubcategories(false);
            }
        };
        
        fetchSubcategories();
    }, [category]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 3) { 
            toast.error('Maximum 3 images allowed'); 
            return; 
        }
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
        if (!category) { 
            toast.error('Select a category'); 
            return; 
        }
        if (!subcategory) { 
            toast.error('Select a subcategory'); 
            return; 
        }
        if (!price) { 
            toast.error('Enter price'); 
            return; 
        }
        if (!duration) { 
            toast.error('Enter duration'); 
            return; 
        }

        try {
            setLoading(true);

            const selectedSub = subcategories.find(s => s._id === subcategory);
            const selectedCat = categories.find(c => c._id === category);

            const formData = new FormData();
            formData.append('category', category);
            formData.append('subcategory', subcategory);
            formData.append('tier', tier);
            
            // Auto-generate name
            const serviceName = `${selectedCat?.icon || ''} ${selectedSub?.name || 'Service'} - ${tier.charAt(0).toUpperCase() + tier.slice(1)}`;
            formData.append('name', serviceName.trim());
            formData.append('description', serviceName.trim());
            formData.append('shortDescription', serviceName.trim());
            
            // Single variant with pricing
            const variant = {
                name: tier.charAt(0).toUpperCase() + tier.slice(1),
                description: '',
                price: Number(price),
                discountPrice: discountPrice ? Number(discountPrice) : null,
                duration: Number(duration),
                features: [],
                displayOrder: 0,
                isActive: true
            };
            formData.append('variants', JSON.stringify([variant]));
            
            // Add images
            images.forEach(img => formData.append('images', img));

            await serviceService.create(formData);
            toast.success('Service created!');
            onClose();
            onSuccess();
        } catch (error) {
            console.error('❌ Create service error:', error);
            toast.error(error.response?.data?.message || 'Failed to create service');
        } finally {
            setLoading(false);
        }
    };

    const canSubmit = category && subcategory && price && duration;

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

                    <div className="h-px bg-white/[0.05] shrink-0" />

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
                        
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
                                    {categories.length > 0 ? (
                                        categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>
                                                {cat.icon} {cat.name}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>No categories available</option>
                                    )}
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
                            <label className={sectionLabel}>Service Tier *</label>
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

                        {/* Price */}
                        <div className="grid grid-cols-3 gap-3">
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
                                <label className={sectionLabel}>Discount</label>
                                <input
                                    type="number"
                                    value={discountPrice}
                                    onChange={(e) => setDiscountPrice(e.target.value)}
                                    placeholder="450"
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

                        {/* Images */}
                        <div>
                            <label className={sectionLabel}>Images (max 3)</label>
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
                                    </div>
                                ))}

                                {imagePreviews.length < 3 && (
                                    <label className="aspect-square border-2 border-dashed border-white/[0.06] hover:border-white/[0.12] rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-150 bg-white/[0.02]">
                                        <Upload className="w-5 h-5 text-white/25 mb-1" />
                                        <span className="text-[11px] text-white/25">Add</span>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            multiple 
                                            onChange={handleImageChange} 
                                            disabled={loading} 
                                            className="hidden" 
                                        />
                                    </label>
                                )}
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
                                    Creating…
                                </>
                            ) : (
                                'Create Service'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}