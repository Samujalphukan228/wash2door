'use client';

import { useState } from 'react';
import { X, Loader2, Plus, ChevronLeft } from 'lucide-react';
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
        features: [''],
    });

    const updateForm = (field, value) =>
        setForm((prev) => ({ ...prev, [field]: value }));

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
            if (form.discountPrice)
                formData.append('discountPrice', Number(form.discountPrice));
            formData.append(
                'features',
                JSON.stringify(form.features.filter((f) => f.trim()))
            );
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

    const canAdd = form.name && form.price && form.duration;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-2 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[520px] sm:max-h-[85vh] bg-neutral-950 rounded-2xl overflow-hidden z-50 flex flex-col border border-white/[0.08]">

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
                                <h2 className="text-sm font-semibold text-white">Variants</h2>
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

                    {/* Existing Variants */}
                    <div>
                        <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                            Current Variants ({service.variants?.length || 0})
                        </label>
                        <div className="space-y-1.5">
                            {service.variants?.length > 0 ? (
                                service.variants.map((variant) => (
                                    <div
                                        key={variant._id}
                                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                                            variant.isActive
                                                ? 'border-white/[0.06] bg-white/[0.02]'
                                                : 'border-white/[0.04] bg-white/[0.01] opacity-40'
                                        }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-white/80">
                                                {variant.name}
                                            </p>
                                            <p className="text-[10px] text-white/30 mt-0.5 font-mono">
                                                ₹{variant.price?.toLocaleString('en-IN')} ·{' '}
                                                {variant.duration} min
                                                {variant.discountPrice && (
                                                    <span className="line-through ml-2 text-white/15">
                                                        ₹{variant.discountPrice?.toLocaleString('en-IN')}
                                                    </span>
                                                )}
                                            </p>
                                            {variant.features?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                    {variant.features.map((f, i) => (
                                                        <span
                                                            key={i}
                                                            className="text-[9px] border border-white/[0.06] text-white/25 px-1.5 py-0.5 rounded-md bg-white/[0.02]"
                                                        >
                                                            {f}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDelete(variant._id)}
                                            disabled={
                                                loading || service.variants.length <= 1
                                            }
                                            title={
                                                service.variants.length <= 1
                                                    ? 'Cannot delete last variant'
                                                    : 'Delete'
                                            }
                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors shrink-0"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02] text-center">
                                    <p className="text-[10px] text-white/25">No variants yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Add New Variant */}
                    <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-3">
                        <label className="text-[10px] text-white/40 font-medium uppercase tracking-wide block">
                            Add New Variant
                        </label>

                        {/* Name & Description */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] text-white/30 font-medium mb-1.5 block uppercase tracking-wide">
                                    Name <span className="text-white/15">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => updateForm('name', e.target.value)}
                                    placeholder="e.g. Sedan"
                                    disabled={loading}
                                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-white/30 font-medium mb-1.5 block uppercase tracking-wide">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={form.description}
                                    onChange={(e) => updateForm('description', e.target.value)}
                                    placeholder="Brief description"
                                    disabled={loading}
                                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors disabled:opacity-50"
                                />
                            </div>
                        </div>

                        {/* Price / Discount / Duration */}
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { label: 'Price (₹)', field: 'price', ph: '500', req: true },
                                { label: 'Discount', field: 'discountPrice', ph: '450', req: false },
                                { label: 'Duration (min)', field: 'duration', ph: '60', req: true },
                            ].map((item) => (
                                <div key={item.field}>
                                    <label className="text-[10px] text-white/30 font-medium mb-1.5 block uppercase tracking-wide">
                                        {item.label}{' '}
                                        {item.req && (
                                            <span className="text-white/15">*</span>
                                        )}
                                    </label>
                                    <input
                                        type="number"
                                        value={form[item.field]}
                                        onChange={(e) =>
                                            updateForm(item.field, e.target.value)
                                        }
                                        placeholder={item.ph}
                                        disabled={loading}
                                        className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors disabled:opacity-50"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Features */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[10px] text-white/30 font-medium uppercase tracking-wide">
                                    Features
                                </label>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setForm((p) => ({
                                            ...p,
                                            features: [...p.features, ''],
                                        }))
                                    }
                                    disabled={loading}
                                    className="text-[10px] text-white/30 hover:text-white/60 transition-colors disabled:opacity-30"
                                >
                                    + Add
                                </button>
                            </div>
                            <div className="space-y-1.5">
                                {form.features.map((f, i) => (
                                    <div key={i} className="flex gap-1.5">
                                        <input
                                            type="text"
                                            value={f}
                                            onChange={(e) => {
                                                const features = [...form.features];
                                                features[i] = e.target.value;
                                                setForm((p) => ({ ...p, features }));
                                            }}
                                            placeholder="e.g. Exterior Wash"
                                            disabled={loading}
                                            className="flex-1 px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors disabled:opacity-50"
                                        />
                                        {form.features.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        features: p.features.filter(
                                                            (_, idx) => idx !== i
                                                        ),
                                                    }))
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
                    </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 p-3 border-t border-white/[0.06]">
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={loading || !canAdd}
                        className="w-full py-2.5 rounded-lg bg-white hover:bg-white/90 text-black text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed"
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
        </>
    );
}