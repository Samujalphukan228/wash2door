'use client';

import { useState } from 'react';
import { X, Pencil, Star, Check, Minus, ChevronLeft } from 'lucide-react';
import Image from 'next/image';

const tierColors = {
    basic: 'text-white/30 border-white/[0.06]',
    standard: 'text-white/50 border-white/[0.10]',
    premium: 'text-white border-white/20',
    custom: 'text-white/40 border-white/[0.08]',
};

export default function ServiceDetailModal({ service, onClose, onEdit }) {
    const [selectedImage, setSelectedImage] = useState(
        service.images?.find((img) => img.isPrimary) || service.images?.[0]
    );

    const categoryName = service.category?.name || 'Uncategorized';

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
                                <h2 className="text-sm font-semibold text-white truncate max-w-[200px]">
                                    {service.name}
                                </h2>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] text-white/40">{categoryName}</span>
                                    <span className="text-white/20">·</span>
                                    <span
                                        className={`text-[10px] border px-1.5 py-0.5 rounded-md capitalize ${
                                            tierColors[service.tier] || tierColors.basic
                                        }`}
                                    >
                                        {service.tier || 'basic'}
                                    </span>
                                    <span
                                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                                            service.isActive
                                                ? 'bg-emerald-500/15 text-emerald-400'
                                                : 'bg-white/[0.04] text-white/25'
                                        }`}
                                    >
                                        {service.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <button
                                onClick={onEdit}
                                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[10px] font-medium text-white/60 hover:text-white transition-colors"
                            >
                                <Pencil className="w-3 h-3" />
                                Edit
                            </button>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center transition-colors"
                            >
                                <X className="w-3.5 h-3.5 text-white/40" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-4">

                    {/* Images */}
                    {service.images?.length > 0 && (
                        <div className="space-y-2">
                            <div className="relative h-48 bg-white/[0.04] rounded-xl overflow-hidden border border-white/[0.06]">
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
                                <div className="flex gap-1.5">
                                    {service.images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedImage(img)}
                                            className={`relative w-14 h-10 rounded-lg overflow-hidden border transition-all ${
                                                selectedImage?.url === img.url
                                                    ? 'border-white/30'
                                                    : 'border-white/[0.06] hover:border-white/20'
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

                    {/* Key Stats */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                            <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wide mb-1">
                                Price
                            </p>
                            <p className="text-sm font-bold text-white">
                                ₹{service.price?.toLocaleString('en-IN') || '0'}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                            <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wide mb-1">
                                Duration
                            </p>
                            <p className="text-sm font-bold text-white">
                                {service.duration || '0'}
                                <span className="text-[10px] text-white/30 font-normal ml-0.5">min</span>
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                            <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wide mb-1">
                                Rating
                            </p>
                            <div className="flex items-center gap-1">
                                <p className="text-sm font-bold text-white">
                                    {service.averageRating?.toFixed(1) || '0.0'}
                                </p>
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            </div>
                        </div>
                    </div>

                    {/* Bookings & Reviews */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                            <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wide mb-1">
                                Bookings
                            </p>
                            <p className="text-sm font-bold text-white">
                                {service.totalBookings || 0}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                            <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wide mb-1">
                                Reviews
                            </p>
                            <p className="text-sm font-bold text-white">
                                {service.totalReviews || 0}
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    {service.description && (
                        <div>
                            <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                                Description
                            </label>
                            <p className="text-xs text-white/50 leading-relaxed">
                                {service.description}
                            </p>
                        </div>
                    )}

                    {/* Features */}
                    {service.features?.length > 0 && (
                        <div>
                            <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                                Features
                            </label>
                            <div className="space-y-1.5">
                                {service.features.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-white/25 shrink-0" />
                                        <p className="text-xs text-white/50">{f}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Includes / Excludes */}
                    {(service.includes?.length > 0 || service.excludes?.length > 0) && (
                        <div className="grid grid-cols-2 gap-4">
                            {service.includes?.length > 0 && (
                                <div>
                                    <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                                        Included
                                    </label>
                                    <div className="space-y-1.5">
                                        {service.includes.map((item, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <Check className="w-3 h-3 text-emerald-400/60 shrink-0" />
                                                <p className="text-xs text-white/40">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {service.excludes?.length > 0 && (
                                <div>
                                    <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                                        Not Included
                                    </label>
                                    <div className="space-y-1.5">
                                        {service.excludes.map((item, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <Minus className="w-3 h-3 text-white/20 shrink-0" />
                                                <p className="text-xs text-white/25">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 p-3 border-t border-white/[0.06]">
                    <button
                        onClick={onEdit}
                        className="w-full py-2.5 rounded-lg bg-white hover:bg-white/90 text-black text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit Service
                    </button>
                </div>
            </div>
        </>
    );
}