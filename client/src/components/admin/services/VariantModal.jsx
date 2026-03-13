'use client';

import { useState } from 'react';
import { X, Loader2, Plus, ChevronLeft } from 'lucide-react';
import serviceService from '@/services/serviceService';
import toast from 'react-hot-toast';

const inputCls = `
    w-full bg-white/[0.03] border border-white/[0.08]
    text-white/80 text-sm placeholder-white/20
    px-3 py-2.5 rounded-lg
    focus:outline-none focus:border-white/20 focus:bg-white/[0.05]
    transition-all duration-150
`;

const sectionLabel = `text-[10px] text-white/25 uppercase tracking-widest font-medium mb-3 block`;

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
                            <p className="text-[10px] text-white/25 uppercase tracking-widest">Variants</p>
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
                    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">

                        {/* Existing Variants */}
                        <div>
                            <label className={sectionLabel}>
                                Current Variants ({service.variants?.length || 0})
                            </label>
                            <div className="space-y-2.5">
                                {service.variants?.map((variant) => (
                                    <div
                                        key={variant._id}
                                        className={`
                                            p-3.5 rounded-lg border transition-all duration-150
                                            ${variant.isActive
                                                ? 'border-white/[0.07] bg-white/[0.02]'
                                                : 'border-white/[0.04] bg-white/[0.01] opacity-50'
                                            }
                                        `}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white/80 font-medium">{variant.name}</p>
                                                <p className="text-xs text-white/30 mt-1">
                                                    ₹{variant.price?.toLocaleString('en-IN')} · {variant.duration} min
                                                    {variant.discountPrice && (
                                                        <span className="line-through ml-2 text-white/20">
                                                            ₹{variant.discountPrice?.toLocaleString('en-IN')}
                                                        </span>
                                                    )}
                                                </p>
                                                {variant.features?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
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
                                            <button
                                                onClick={() => handleDelete(variant._id)}
                                                disabled={loading || service.variants.length <= 1}
                                                className="
                                                    w-7 h-7 rounded-md flex items-center justify-center
                                                    text-white/20 hover:text-white/60 hover:bg-white/[0.05]
                                                    disabled:opacity-20 disabled:cursor-not-allowed
                                                    transition-all duration-150 ml-2 shrink-0
                                                "
                                                title={service.variants.length <= 1 ? 'Cannot delete last variant' : 'Delete'}
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Add New Variant */}
                        <div className="p-4 rounded-lg border border-white/[0.07] bg-white/[0.02] space-y-4">
                            <label className={sectionLabel}>Add New Variant</label>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium mb-1.5 block">Name *</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => updateForm('name', e.target.value)}
                                        placeholder="e.g. Sedan, 2 Seater"
                                        disabled={loading}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium mb-1.5 block">Description</label>
                                    <input
                                        type="text"
                                        value={form.description}
                                        onChange={(e) => updateForm('description', e.target.value)}
                                        placeholder="Brief description"
                                        disabled={loading}
                                        className={inputCls}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium mb-1.5 block">Price (₹) *</label>
                                    <input
                                        type="number"
                                        value={form.price}
                                        onChange={(e) => updateForm('price', e.target.value)}
                                        placeholder="500"
                                        disabled={loading}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium mb-1.5 block">Discount Price</label>
                                    <input
                                        type="number"
                                        value={form.discountPrice}
                                        onChange={(e) => updateForm('discountPrice', e.target.value)}
                                        placeholder="450"
                                        disabled={loading}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium mb-1.5 block">Duration (min) *</label>
                                    <input
                                        type="number"
                                        value={form.duration}
                                        onChange={(e) => updateForm('duration', e.target.value)}
                                        placeholder="60"
                                        disabled={loading}
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
                                        onClick={() => setForm(p => ({ ...p, features: [...p.features, ''] }))}
                                        disabled={loading}
                                        className="text-[11px] text-white/30 hover:text-white/60 transition-all duration-150"
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
                                                disabled={loading}
                                                className={inputCls}
                                            />
                                            {form.features.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setForm(p => ({
                                                        ...p,
                                                        features: p.features.filter((_, idx) => idx !== i)
                                                    }))}
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
                            Close
                        </button>
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={loading || !form.name || !form.price || !form.duration}
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
                                    Adding…
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Add Variant
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}