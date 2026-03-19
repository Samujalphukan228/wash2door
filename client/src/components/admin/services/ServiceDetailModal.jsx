'use client';

import { useState } from 'react';
import {
    X, Pencil, Star, Tag, Clock, Check, Minus,
    ChevronLeft, Eye
} from 'lucide-react';
import Image from 'next/image';

const tierStyles = {
    basic: 'border-white/[0.08] text-white/35',
    standard: 'border-white/[0.12] text-white/50',
    premium: 'border-white/25 text-white/80',
    custom: 'border-white/[0.15] text-white/60'
};

export default function ServiceDetailModal({
    service,
    onClose,
    onEdit
}) {
    const [selectedImage, setSelectedImage] = useState(
        service.images?.find(img => img.isPrimary) || service.images?.[0]
    );

    const categoryName = service.category?.name || 'Uncategorized';
    const categoryIcon = service.category?.icon || '';

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

                    <div className="h-px bg-white/[0.05] shrink-0" />

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">

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

                        {/* Basic Info */}
                        <div className="grid grid-cols-3 gap-4 p-4 rounded-lg border border-white/[0.07] bg-white/[0.02]">
                            <div>
                                <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1">Price</p>
                                <p className="text-xl font-semibold text-white">
                                    ₹{service.price?.toLocaleString('en-IN') || '0'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1">Duration</p>
                                <p className="text-xl font-semibold text-white">
                                    {service.duration || '0'} <span className="text-xs text-white/40">min</span>
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1">Rating</p>
                                <div className="flex items-center gap-1">
                                    <p className="text-xl font-semibold text-white">
                                        {service.averageRating?.toFixed(1) || '0.0'}
                                    </p>
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 rounded-lg border border-white/[0.07] bg-white/[0.02] text-center">
                                <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1">Bookings</p>
                                <p className="text-lg font-semibold text-white">
                                    {service.totalBookings || 0}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg border border-white/[0.07] bg-white/[0.02] text-center">
                                <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1">Reviews</p>
                                <p className="text-lg font-semibold text-white">
                                    {service.totalReviews || 0}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg border border-white/[0.07] bg-white/[0.02] text-center">
                                <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1">Status</p>
                                <p className={`text-sm font-medium ${
                                    service.isActive ? 'text-emerald-400' : 'text-gray-500'
                                }`}>
                                    {service.isActive ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        {service.description && (
                            <div>
                                <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium mb-2 block">Description</label>
                                <p className="text-sm text-white/50 leading-relaxed">
                                    {service.description}
                                </p>
                            </div>
                        )}

                        {/* Highlights */}
                        {service.highlights?.length > 0 && (
                            <div>
                                <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium mb-2 block">Highlights</label>
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
                                    <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium mb-2 block">Included</label>
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
                                    <label className="text-[10px] text-white/25 uppercase tracking-widest font-medium mb-2 block">Not Included</label>
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

                    {/* Footer */}
                    <div className="shrink-0 h-px bg-white/[0.05]" />
                    <div className="shrink-0 px-4 py-4 flex gap-2">
                        <button
                            onClick={onClose}
                            className="
                                hidden sm:flex flex-1 items-center px-4 py-2.5 rounded-lg
                                border border-white/[0.08] bg-white/[0.03]
                                text-xs text-white/40 hover:text-white/70
                                hover:border-white/[0.14] hover:bg-white/[0.05]
                                transition-all duration-150
                            "
                        >
                            Close
                        </button>
                        <button
                            onClick={onEdit}
                            className="
                                sm:hidden flex-1 flex items-center justify-center gap-2
                                py-2.5 rounded-lg
                                bg-white text-black text-sm font-medium
                                hover:bg-white/90 active:bg-white/80
                                shadow-lg shadow-white/10
                                transition-all duration-150
                            "
                        >
                            <Pencil className="w-4 h-4" />
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}