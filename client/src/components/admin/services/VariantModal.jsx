// src/components/admin/services/VariantModal.jsx

'use client';

import { useState } from 'react';
import { X, Loader2, Plus } from 'lucide-react';
import serviceService from '@/services/serviceService';
import toast from 'react-hot-toast';

export default function VariantModal({ service, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        duration: '',
        features: ['']
    });

    const updateForm = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleAdd = async () => {
        if (!form.name || !form.price || !form.duration) {
            toast.error('Name, price and duration are required');
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('name', form.name.trim());
            formData.append('description', form.description || '');
            formData.append('price', Number(form.price));
            formData.append('duration', Number(form.duration));
            if (form.discountPrice) {
                formData.append('discountPrice', Number(form.discountPrice));
            }
            formData.append('features', JSON.stringify(
                form.features.filter(f => f.trim())
            ));

            await serviceService.addVariant(service._id, formData);
            toast.success('Variant added');
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add variant');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (variantId) => {
        if (!confirm('Delete this variant?')) return;
        try {
            setLoading(true);
            await serviceService.deleteVariant(service._id, variantId);
            toast.success('Variant deleted');
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-950 border border-neutral-800 w-full max-w-2xl max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
                    <div>
                        <p className="text-xs text-neutral-500 tracking-widest uppercase mb-1">Variants</p>
                        <h2 className="text-white font-light truncate max-w-xs">{service.name}</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Existing Variants */}
                    <div>
                        <p className="text-xs text-neutral-500 tracking-widest uppercase mb-3">
                            Current Variants ({service.variants?.length || 0})
                        </p>
                        <div className="space-y-3">
                            {service.variants?.map((variant) => (
                                <div key={variant._id} className={`border p-3 flex items-center justify-between ${
                                    variant.isActive ? 'border-neutral-800' : 'border-neutral-900 opacity-50'
                                }`}>
                                    <div>
                                        <p className="text-white text-sm font-medium">{variant.name}</p>
                                        <p className="text-xs text-neutral-500 mt-0.5">
                                            ₹{variant.price?.toLocaleString('en-IN')} · {variant.duration} min
                                            {variant.discountPrice && (
                                                <span className="line-through ml-2">₹{variant.discountPrice?.toLocaleString('en-IN')}</span>
                                            )}
                                        </p>
                                        {variant.features?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                {variant.features.map((f, i) => (
                                                    <span key={i} className="text-xs border border-neutral-800 text-neutral-600 px-1.5 py-0.5">{f}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(variant._id)}
                                        disabled={loading || service.variants.length <= 1}
                                        className="text-neutral-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2"
                                        title={service.variants.length <= 1 ? 'Cannot delete last variant' : 'Delete'}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Add New Variant */}
                    <div className="border border-neutral-800 p-4 space-y-4">
                        <p className="text-xs text-neutral-500 tracking-widest uppercase">Add New Variant</p>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1.5">Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => updateForm('name', e.target.value)}
                                    placeholder="e.g. Sedan, 2 Seater"
                                    className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1.5">Description</label>
                                <input
                                    type="text"
                                    value={form.description}
                                    onChange={(e) => updateForm('description', e.target.value)}
                                    placeholder="Brief description"
                                    className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1.5">Price (₹) *</label>
                                <input
                                    type="number"
                                    value={form.price}
                                    onChange={(e) => updateForm('price', e.target.value)}
                                    placeholder="500"
                                    className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1.5">Discount Price</label>
                                <input
                                    type="number"
                                    value={form.discountPrice}
                                    onChange={(e) => updateForm('discountPrice', e.target.value)}
                                    placeholder="450"
                                    className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1.5">Duration (min) *</label>
                                <input
                                    type="number"
                                    value={form.duration}
                                    onChange={(e) => updateForm('duration', e.target.value)}
                                    placeholder="60"
                                    className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                                />
                            </div>
                        </div>

                        {/* Features */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs text-neutral-500">Features</label>
                                <button
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, features: [...p.features, ''] }))}
                                    className="text-xs text-neutral-500 hover:text-white transition-colors"
                                >
                                    + Add
                                </button>
                            </div>
                            <div className="space-y-2">
                                {form.features.map((f, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={f}
                                            onChange={(e) => {
                                                const features = [...form.features];
                                                features[i] = e.target.value;
                                                setForm(p => ({ ...p, features }));
                                            }}
                                            placeholder="e.g. Exterior Wash"
                                            className="flex-1 bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-1.5 focus:outline-none focus:border-neutral-600"
                                        />
                                        {form.features.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setForm(p => ({
                                                    ...p,
                                                    features: p.features.filter((_, idx) => idx !== i)
                                                }))}
                                                className="text-neutral-700 hover:text-white px-2"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-neutral-800 flex items-center gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="border border-neutral-800 text-neutral-400 hover:text-white text-xs tracking-widest uppercase px-4 py-3 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={loading || !form.name || !form.price || !form.duration}
                        className="flex-1 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed text-black text-xs tracking-widest uppercase py-3 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <Plus className="w-3.5 h-3.5" />
                                Add Variant
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}