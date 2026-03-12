// src/components/admin/services/ServiceDetailModal.jsx

'use client';

import { useState } from 'react';
import {
    X, Pencil, Star, Tag, Clock,
    Check, Minus, Plus, Trash2, Loader2
} from 'lucide-react';
import serviceService from '@/services/serviceService';
import toast from 'react-hot-toast';
import Image from 'next/image';

const tierColors = {
    basic: 'border-neutral-700 text-neutral-400',
    standard: 'border-neutral-600 text-neutral-300',
    premium: 'border-neutral-400 text-white',
    custom: 'border-neutral-500 text-neutral-200'
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
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-950 border border-neutral-800 w-full max-w-3xl max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h2 className="text-white font-medium">
                                    {service.name}
                                </h2>
                                <span className="text-xs border border-neutral-700 bg-black/80 text-neutral-300 px-2 py-0.5">
                                    {categoryIcon} {categoryName}
                                </span>
                                <span className={`text-xs border px-2 py-0.5 capitalize ${
                                    tierColors[service.tier] || tierColors.basic
                                }`}>
                                    {service.tier || 'basic'}
                                </span>
                                <span className={`text-xs px-2 py-0.5 ${
                                    service.isActive
                                        ? 'bg-white text-black'
                                        : 'bg-neutral-800 text-neutral-500'
                                }`}>
                                    {service.isActive ? 'Active' : 'Inactive'}
                                </span>
                                {service.isFeatured && (
                                    <span className="text-xs bg-white text-black px-2 py-0.5">
                                        ★ Featured
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-neutral-500">
                                {service.totalBookings || 0} bookings ·{' '}
                                {service.averageRating?.toFixed(1) || '0.0'} rating ·{' '}
                                from ₹{service.startingPrice?.toLocaleString('en-IN') || '0'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onEdit}
                            className="flex items-center gap-2 border border-neutral-800 text-neutral-400 hover:text-white text-xs tracking-widest uppercase px-3 py-2 transition-colors"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                        </button>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
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

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            
                            {/* Images */}
                            {service.images?.length > 0 && (
                                <div className="space-y-3">
                                    <div className="relative h-56 bg-neutral-900 overflow-hidden">
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
                                                    className={`relative w-16 h-12 overflow-hidden border transition-colors ${
                                                        selectedImage?.url === img.url
                                                            ? 'border-white'
                                                            : 'border-neutral-800'
                                                    }`}
                                                >
                                                    <Image
                                                        src={img.url}
                                                        alt=""
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Description */}
                            <div>
                                <p className="text-xs text-neutral-500 tracking-widest uppercase mb-2">
                                    Description
                                </p>
                                <p className="text-sm text-neutral-300 leading-relaxed">
                                    {service.description}
                                </p>
                            </div>

                            {/* Highlights */}
                            {service.highlights?.length > 0 && (
                                <div>
                                    <p className="text-xs text-neutral-500 tracking-widest uppercase mb-3">
                                        Highlights
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {service.highlights.map((h, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className="w-1 h-1 bg-white rounded-full shrink-0" />
                                                <p className="text-sm text-neutral-400">{h}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Includes / Excludes */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {service.includes?.length > 0 && (
                                    <div>
                                        <p className="text-xs text-neutral-500 tracking-widest uppercase mb-3">
                                            Included
                                        </p>
                                        <div className="space-y-2">
                                            {service.includes.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <Check className="w-3.5 h-3.5 text-white shrink-0" />
                                                    <p className="text-sm text-neutral-400">{item}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {service.excludes?.length > 0 && (
                                    <div>
                                        <p className="text-xs text-neutral-500 tracking-widest uppercase mb-3">
                                            Not Included
                                        </p>
                                        <div className="space-y-2">
                                            {service.excludes.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <Minus className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                                                    <p className="text-sm text-neutral-500">{item}</p>
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
                        <div className="space-y-4">
                            {service.variants?.map((variant) => (
                                <div
                                    key={variant._id}
                                    className={`border p-4 ${
                                        variant.isActive
                                            ? 'border-neutral-800'
                                            : 'border-neutral-900 opacity-50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-white font-medium text-sm">
                                                    {variant.name}
                                                </p>
                                                {!variant.isActive && (
                                                    <span className="text-xs border border-neutral-800 text-neutral-600 px-1.5 py-0.5">
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                            {variant.description && (
                                                <p className="text-xs text-neutral-500 mt-1">
                                                    {variant.description}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteVariant(variant._id)}
                                            disabled={loading || service.variants.length <= 1}
                                            className="text-neutral-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            title={service.variants.length <= 1 ? 'Cannot delete last variant' : 'Delete'}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-6 mb-3">
                                        <div className="flex items-center gap-1.5">
                                            <Tag className="w-3.5 h-3.5 text-neutral-600" />
                                            <span className="text-sm text-white font-medium">
                                                ₹{variant.price?.toLocaleString('en-IN')}
                                            </span>
                                            {variant.discountPrice && (
                                                <span className="text-xs text-neutral-500 line-through ml-1">
                                                    ₹{variant.discountPrice?.toLocaleString('en-IN')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-neutral-600" />
                                            <span className="text-sm text-neutral-400">
                                                {variant.duration} min
                                            </span>
                                        </div>
                                    </div>

                                    {variant.features?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {variant.features.map((f, i) => (
                                                <span
                                                    key={i}
                                                    className="text-xs border border-neutral-800 text-neutral-500 px-2 py-0.5"
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
                                    className="w-full border border-dashed border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600 py-3 text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Variant
                                </button>
                            ) : (
                                <div className="border border-neutral-800 p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-neutral-500 tracking-widest uppercase">
                                            New Variant
                                        </p>
                                        <button
                                            onClick={() => setShowAddVariant(false)}
                                            className="text-neutral-500 hover:text-white transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1.5">
                                                Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={newVariant.name}
                                                onChange={(e) => setNewVariant(p => ({ ...p, name: e.target.value }))}
                                                placeholder="e.g. Sedan, 2 Seater"
                                                className="w-full bg-black border border-neutral-800 text-white text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1.5">
                                                Description
                                            </label>
                                            <input
                                                type="text"
                                                value={newVariant.description}
                                                onChange={(e) => setNewVariant(p => ({ ...p, description: e.target.value }))}
                                                placeholder="Brief description"
                                                className="w-full bg-black border border-neutral-800 text-white text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
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
                                                value={newVariant.price}
                                                onChange={(e) => setNewVariant(p => ({ ...p, price: e.target.value }))}
                                                placeholder="500"
                                                className="w-full bg-black border border-neutral-800 text-white text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1.5">
                                                Discount Price
                                            </label>
                                            <input
                                                type="number"
                                                value={newVariant.discountPrice}
                                                onChange={(e) => setNewVariant(p => ({ ...p, discountPrice: e.target.value }))}
                                                placeholder="450"
                                                className="w-full bg-black border border-neutral-800 text-white text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1.5">
                                                Duration (min) *
                                            </label>
                                            <input
                                                type="number"
                                                value={newVariant.duration}
                                                onChange={(e) => setNewVariant(p => ({ ...p, duration: e.target.value }))}
                                                placeholder="60"
                                                className="w-full bg-black border border-neutral-800 text-white text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                                            />
                                        </div>
                                    </div>

                                    {/* Quick Features */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs text-neutral-500">Features</label>
                                            <button
                                                type="button"
                                                onClick={() => setNewVariant(p => ({
                                                    ...p,
                                                    features: [...(p.features || []), '']
                                                }))}
                                                className="text-xs text-neutral-500 hover:text-white"
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
                                                        className="flex-1 bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-1.5 focus:outline-none focus:border-neutral-600"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setNewVariant(p => ({
                                                            ...p,
                                                            features: p.features.filter((_, i) => i !== fi)
                                                        }))}
                                                        className="text-neutral-700 hover:text-white px-2"
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
                                        className="w-full bg-white hover:bg-neutral-200 disabled:bg-neutral-800 text-black text-xs tracking-widest uppercase py-2.5 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
                            <div className="flex items-center gap-6 p-4 border border-neutral-800">
                                <div>
                                    <p className="text-3xl font-light text-white">
                                        {service.averageRating?.toFixed(1) || '0.0'}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3.5 h-3.5 ${
                                                    i < Math.round(service.averageRating || 0)
                                                        ? 'text-white fill-white'
                                                        : 'text-neutral-700'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="border-l border-neutral-800 pl-6">
                                    <p className="text-2xl font-light text-white">
                                        {service.totalReviews || 0}
                                    </p>
                                    <p className="text-xs text-neutral-500 mt-0.5">
                                        Total reviews
                                    </p>
                                </div>
                                <div className="border-l border-neutral-800 pl-6">
                                    <p className="text-2xl font-light text-white">
                                        {service.totalBookings || 0}
                                    </p>
                                    <p className="text-xs text-neutral-500 mt-0.5">
                                        Total bookings
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-neutral-600 text-center py-4">
                                View all reviews in the Reviews section
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}