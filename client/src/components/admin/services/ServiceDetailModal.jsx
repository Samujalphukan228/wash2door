'use client';

import { useState } from 'react';
import {
    X, Pencil, Star, Tag, Clock,
    Check, Minus, Plus, Trash2, Loader2, ChevronLeft
} from 'lucide-react';
import serviceService from '@/services/serviceService';
import toast from 'react-hot-toast';
import Image from 'next/image';

const inputCls = `
    w-full bg-white/[0.03] border border-white/[0.08]
    text-white/80 text-sm placeholder-white/20
    px-3 py-2.5 rounded-lg
    focus:outline-none focus:border-white/20 focus:bg-white/[0.05]
    transition-all duration-150
`;

const sectionLabel = `text-[10px] text-white/25 uppercase tracking-widest font-medium mb-3 block`;

const tierStyles = {
    basic: 'border-white/[0.08] text-white/35',
    standard: 'border-white/[0.12] text-white/50',
    premium: 'border-white/25 text-white/80',
    custom: 'border-white/[0.15] text-white/60'
};

export default function ServiceDetailModal({
    service,
    onClose,
    onEdit,
    onRefresh,
    onManageVariants
}) {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedImage, setSelectedImage] = useState(
        service.images?.find(img => img.isPrimary) || service.images?.[0]
    );
    const [loading, setLoading] = useState(false);
    const [showAddVariant, setShowAddVariant] = useState(false);

    const [newVariant, setNewVariant] = useState({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        duration: '',
        features: []
    });

    const categoryName = service.category?.name || 'Uncategorized';
    const categoryIcon = service.category?.icon || '';

    const handleDeleteVariant = async (variantId) => {
        if (!confirm('Delete this variant?')) return;
        try {
            setLoading(true);
            await serviceService.deleteVariant(service._id, variantId);
            toast.success('Variant deleted');
            onRefresh();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        } finally {
            setLoading(false);
        }
    };

    const handleAddVariant = async () => {
        if (!newVariant.name || !newVariant.price || !newVariant.duration) {
            toast.error('Name, price and duration are required');
            return;
        }
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('name', newVariant.name.trim());
            formData.append('description', newVariant.description || '');
            formData.append('price', Number(newVariant.price));
            formData.append('duration', Number(newVariant.duration));
            if (newVariant.discountPrice) {
                formData.append('discountPrice', Number(newVariant.discountPrice));
            }
            formData.append('features', JSON.stringify(
                (newVariant.features || []).filter(f => f.trim())
            ));

            await serviceService.addVariant(service._id, formData);
            toast.success('Variant added');
            setShowAddVariant(false);
            setNewVariant({
                name: '', description: '', price: '',
                discountPrice: '', duration: '', features: []
            });
            onRefresh();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add variant');
        } finally {
            setLoading(false);
        }
    };

    const tabs = ['overview', 'variants', 'reviews'];

    return (
        <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 hidden sm:block" onClick={onClose} />

            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
                <div className="
                    pointer-events-auto
                    w-full sm:max-w-3xl sm:max-h-[92vh]
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
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-medium text-white/80 truncate">
                                    {service.name}
                                </p>
                                <span className="text-[10px] border border-white/[0.08] bg-white/[0.03] text-white/40 px-2 py-0.5 rounded-md">
                                    {categoryIcon} {categoryName}
                                </span>
                                <span className={`text-[10px] border px-2 py-0.5 rounded-md capitalize ${
                                    tierStyles[service.tier] || tierStyles.basic
                                }`}>
                                    {service.tier || 'basic'}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                                    service.isActive
                                        ? 'bg-white text-black'
                                        : 'bg-white/[0.06] text-white/30'
                                }`}>
                                    {service.isActive ? 'Active' : 'Inactive'}
                                </span>
                                {service.isFeatured && (
                                    <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded-md font-medium">
                                        ★ Featured
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-white/25 mt-1">
                                {service.totalBookings || 0} bookings ·{' '}
                                {service.averageRating?.toFixed(1) || '0.0'} rating ·{' '}
                                from ₹{service.startingPrice?.toLocaleString('en-IN') || '0'}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={onEdit}
                                className="
                                    hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg
                                    border border-white/[0.08] bg-white/[0.03]
                                    text-[11px] text-white/40 hover:text-white/70
                                    hover:border-white/[0.14] hover:bg-white/[0.05]
                                    transition-all duration-150
                                "
                            >
                                <Pencil className="w-3 h-3" />
                                Edit
                            </button>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.06] bg-white/[0.03] text-white/30 hover:text-white/70 transition-all duration-150"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
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

                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-5">

                                {/* Images */}
                                {service.images?.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="relative h-56 bg-white/[0.03] rounded-lg overflow-hidden">
                                            {selectedImage && (
                                                <Image
                                                    src={selectedImage.url}
                                                    alt={service.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                        {service.images.length > 1 && (
                                            <div className="flex gap-2">
                                                {service.images.map((img, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setSelectedImage(img)}
                                                        className={`
                                                            relative w-16 h-12 rounded-md overflow-hidden border-2 transition-all duration-150
                                                            ${selectedImage?.url === img.url
                                                                ? 'border-white/40'
                                                                : 'border-white/[0.08] hover:border-white/20'
                                                            }
                                                        `}
                                                    >
                                                        <Image src={img.url} alt="" fill className="object-cover" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Description */}
                                <div>
                                    <label className={sectionLabel}>Description</label>
                                    <p className="text-sm text-white/50 leading-relaxed">
                                        {service.description}
                                    </p>
                                </div>

                                {/* Highlights */}
                                {service.highlights?.length > 0 && (
                                    <div>
                                        <label className={sectionLabel}>Highlights</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {service.highlights.map((h, i) => (
                                                <div key={i} className="flex items-center gap-2.5">
                                                    <div className="w-1 h-1 bg-white/30 rounded-full shrink-0" />
                                                    <p className="text-sm text-white/40">{h}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Includes / Excludes */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {service.includes?.length > 0 && (
                                        <div>
                                            <label className={sectionLabel}>Included</label>
                                            <div className="space-y-2">
                                                {service.includes.map((item, i) => (
                                                    <div key={i} className="flex items-center gap-2.5">
                                                        <Check className="w-3.5 h-3.5 text-white/50 shrink-0" />
                                                        <p className="text-sm text-white/40">{item}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {service.excludes?.length > 0 && (
                                        <div>
                                            <label className={sectionLabel}>Not Included</label>
                                            <div className="space-y-2">
                                                {service.excludes.map((item, i) => (
                                                    <div key={i} className="flex items-center gap-2.5">
                                                        <Minus className="w-3.5 h-3.5 text-white/20 shrink-0" />
                                                        <p className="text-sm text-white/25">{item}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Variants Tab */}
                        {activeTab === 'variants' && (
                            <div className="space-y-3">
                                {service.variants?.map((variant) => (
                                    <div
                                        key={variant._id}
                                        className={`
                                            p-4 rounded-lg border transition-all duration-150
                                            ${variant.isActive
                                                ? 'border-white/[0.07] bg-white/[0.02]'
                                                : 'border-white/[0.04] bg-white/[0.01] opacity-50'
                                            }
                                        `}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm text-white/80 font-medium">
                                                        {variant.name}
                                                    </p>
                                                    {!variant.isActive && (
                                                        <span className="text-[10px] border border-white/[0.06] text-white/25 px-1.5 py-0.5 rounded-md">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </div>
                                                {variant.description && (
                                                    <p className="text-xs text-white/25 mt-1">
                                                        {variant.description}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteVariant(variant._id)}
                                                disabled={loading || service.variants.length <= 1}
                                                className="
                                                    w-7 h-7 rounded-md flex items-center justify-center
                                                    text-white/15 hover:text-red-400/60 hover:bg-white/[0.05]
                                                    disabled:opacity-20 disabled:cursor-not-allowed
                                                    transition-all duration-150
                                                "
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-5 mb-3">
                                            <div className="flex items-center gap-1.5">
                                                <Tag className="w-3.5 h-3.5 text-white/20" />
                                                <span className="text-sm text-white/70 font-medium">
                                                    ₹{variant.price?.toLocaleString('en-IN')}
                                                </span>
                                                {variant.discountPrice && (
                                                    <span className="text-xs text-white/25 line-through ml-1">
                                                        ₹{variant.discountPrice?.toLocaleString('en-IN')}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-white/20" />
                                                <span className="text-sm text-white/40">
                                                    {variant.duration} min
                                                </span>
                                            </div>
                                        </div>

                                        {variant.features?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {variant.features.map((f, i) => (
                                                    <span
                                                        key={i}
                                                        className="text-[11px] border border-white/[0.06] text-white/30 px-2 py-0.5 rounded-md bg-white/[0.02]"
                                                    >
                                                        {f}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Add Variant */}
                                {!showAddVariant ? (
                                    <button
                                        onClick={() => setShowAddVariant(true)}
                                        className="
                                            w-full border-2 border-dashed border-white/[0.06] hover:border-white/[0.12]
                                            text-white/25 hover:text-white/50
                                            py-4 rounded-lg text-xs uppercase tracking-widest
                                            transition-all duration-150 flex items-center justify-center gap-2
                                        "
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Variant
                                    </button>
                                ) : (
                                    <div className="p-4 rounded-lg border border-white/[0.07] bg-white/[0.02] space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className={sectionLabel}>New Variant</label>
                                            <button
                                                onClick={() => setShowAddVariant(false)}
                                                className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.05] transition-all duration-150"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium mb-1.5 block">Name *</label>
                                                <input
                                                    type="text"
                                                    value={newVariant.name}
                                                    onChange={(e) => setNewVariant(p => ({ ...p, name: e.target.value }))}
                                                    placeholder="e.g. Sedan, 2 Seater"
                                                    className={inputCls}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium mb-1.5 block">Description</label>
                                                <input
                                                    type="text"
                                                    value={newVariant.description}
                                                    onChange={(e) => setNewVariant(p => ({ ...p, description: e.target.value }))}
                                                    placeholder="Brief description"
                                                    className={inputCls}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium mb-1.5 block">Price (₹) *</label>
                                                <input
                                                    type="number"
                                                    value={newVariant.price}
                                                    onChange={(e) => setNewVariant(p => ({ ...p, price: e.target.value }))}
                                                    placeholder="500"
                                                    className={inputCls}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium mb-1.5 block">Discount Price</label>
                                                <input
                                                    type="number"
                                                    value={newVariant.discountPrice}
                                                    onChange={(e) => setNewVariant(p => ({ ...p, discountPrice: e.target.value }))}
                                                    placeholder="450"
                                                    className={inputCls}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium mb-1.5 block">Duration (min) *</label>
                                                <input
                                                    type="number"
                                                    value={newVariant.duration}
                                                    onChange={(e) => setNewVariant(p => ({ ...p, duration: e.target.value }))}
                                                    placeholder="60"
                                                    className={inputCls}
                                                />
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium">Features</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setNewVariant(p => ({
                                                        ...p, features: [...(p.features || []), '']
                                                    }))}
                                                    className="text-[11px] text-white/30 hover:text-white/60 transition-all duration-150"
                                                >
                                                    + Add
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {(newVariant.features || []).map((f, fi) => (
                                                    <div key={fi} className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={f}
                                                            onChange={(e) => {
                                                                const features = [...newVariant.features];
                                                                features[fi] = e.target.value;
                                                                setNewVariant(p => ({ ...p, features }));
                                                            }}
                                                            placeholder="e.g. Exterior Wash"
                                                            className={inputCls}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setNewVariant(p => ({
                                                                ...p, features: p.features.filter((_, i) => i !== fi)
                                                            }))}
                                                            className="w-8 h-10 rounded-lg flex items-center justify-center text-white/20 hover:text-white/60 hover:bg-white/[0.05] transition-all duration-150 shrink-0"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleAddVariant}
                                            disabled={loading}
                                            className="
                                                w-full flex items-center justify-center gap-2
                                                py-2.5 rounded-lg
                                                bg-white text-black text-sm font-medium
                                                hover:bg-white/90 active:bg-white/80
                                                disabled:bg-white/10 disabled:text-white/20 disabled:cursor-not-allowed
                                                shadow-lg shadow-white/10
                                                transition-all duration-150
                                            "
                                        >
                                            {loading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                'Add Variant'
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Reviews Tab */}
                        {activeTab === 'reviews' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-0 rounded-lg border border-white/[0.07] bg-white/[0.02] overflow-hidden">
                                    <div className="flex-1 p-4 text-center">
                                        <p className="text-2xl font-light text-white/80">
                                            {service.averageRating?.toFixed(1) || '0.0'}
                                        </p>
                                        <div className="flex items-center justify-center gap-1 mt-1.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3 h-3 ${
                                                        i < Math.round(service.averageRating || 0)
                                                            ? 'text-white/60 fill-white/60'
                                                            : 'text-white/10'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-px h-14 bg-white/[0.06]" />
                                    <div className="flex-1 p-4 text-center">
                                        <p className="text-2xl font-light text-white/80">
                                            {service.totalReviews || 0}
                                        </p>
                                        <p className="text-[11px] text-white/25 mt-1">Reviews</p>
                                    </div>
                                    <div className="w-px h-14 bg-white/[0.06]" />
                                    <div className="flex-1 p-4 text-center">
                                        <p className="text-2xl font-light text-white/80">
                                            {service.totalBookings || 0}
                                        </p>
                                        <p className="text-[11px] text-white/25 mt-1">Bookings</p>
                                    </div>
                                </div>
                                <p className="text-[11px] text-white/15 text-center py-4">
                                    View all reviews in the Reviews section
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}