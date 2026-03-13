'use client';

import { Eye, Pencil, Trash2, ToggleLeft, ToggleRight, Star, Tag } from 'lucide-react';
import Image from 'next/image';

const tierStyles = {
    basic: 'border-white/[0.08] text-white/35',
    standard: 'border-white/[0.12] text-white/50',
    premium: 'border-white/25 text-white/80',
    custom: 'border-white/[0.15] text-white/60'
};

export default function ServiceCard({
    service,
    onView,
    onEdit,
    onDelete,
    onToggleActive
}) {
    const primaryImage = service.images?.find(img => img.isPrimary) || service.images?.[0];
    const categoryName = service.category?.name || 'Uncategorized';
    const categoryIcon = service.category?.icon || '';

    return (
        <div className={`
            bg-white/[0.02] border rounded-xl flex flex-col overflow-hidden
            transition-all duration-200 hover:bg-white/[0.03] hover:border-white/[0.12]
            group
            ${service.isActive
                ? 'border-white/[0.07]'
                : 'border-white/[0.04] opacity-60'
            }
        `}>
            {/* Image */}
            <div className="relative h-44 bg-white/[0.03] overflow-hidden">
                {primaryImage ? (
                    <Image
                        src={primaryImage.url}
                        alt={service.name}
                        fill
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <p className="text-white/15 text-xs">No image</p>
                    </div>
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                    <span className="text-[11px] border border-white/[0.12] bg-black/60 backdrop-blur-md text-white/70 px-2.5 py-1 rounded-md">
                        {categoryIcon} {categoryName}
                    </span>
                </div>

                {/* Tier Badge */}
                <div className="absolute top-3 right-3">
                    <span className={`text-[11px] border px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md capitalize ${
                        tierStyles[service.tier] || tierStyles.basic
                    }`}>
                        {service.tier || 'basic'}
                    </span>
                </div>

                {/* Featured Badge */}
                {service.isFeatured && (
                    <div className="absolute bottom-3 left-3">
                        <span className="text-[11px] bg-white text-black px-2.5 py-1 rounded-md font-medium shadow-lg shadow-white/20">
                            ★ Featured
                        </span>
                    </div>
                )}

                {/* Image Count */}
                {service.images?.length > 1 && (
                    <div className="absolute bottom-3 right-3">
                        <span className="text-[11px] bg-black/60 backdrop-blur-md text-white/50 px-2 py-1 rounded-md">
                            {service.images.length} photos
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-white/85 font-medium text-sm mb-1 truncate">
                    {service.name}
                </h3>

                <p className="text-white/30 text-xs leading-relaxed mb-3 line-clamp-2">
                    {service.shortDescription || service.description}
                </p>

                {/* Stats Row */}
                <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1.5">
                        <Star className="w-3 h-3 text-white/20" />
                        <span className="text-[11px] text-white/30">
                            {service.averageRating?.toFixed(1) || '0.0'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-white/20" />
                        <span className="text-[11px] text-white/30">
                            {service.variants?.length || 0} variants
                        </span>
                    </div>
                    <div className="ml-auto">
                        <span className="text-sm text-white/80 font-medium">
                            ₹{service.startingPrice?.toLocaleString('en-IN') || 0}+
                        </span>
                    </div>
                </div>

                {/* Variants Preview */}
                {service.variants?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {service.variants
                            .filter(v => v.isActive)
                            .slice(0, 3)
                            .map((variant, index) => (
                                <span
                                    key={variant._id || index}
                                    className="text-[11px] border border-white/[0.06] text-white/30 px-2 py-0.5 rounded-md bg-white/[0.02]"
                                >
                                    {variant.name}
                                </span>
                            ))}
                        {service.variants.filter(v => v.isActive).length > 3 && (
                            <span className="text-[11px] text-white/20">
                                +{service.variants.filter(v => v.isActive).length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Status */}
                <div className="mb-3">
                    <span className={`text-[11px] px-2.5 py-1 rounded-md font-medium ${
                        service.isActive
                            ? 'bg-white text-black'
                            : 'bg-white/[0.06] text-white/30'
                    }`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 mt-auto pt-3 border-t border-white/[0.05]">
                    <button
                        onClick={() => onView(service)}
                        className="
                            flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md
                            text-[11px] text-white/30 hover:text-white/70 hover:bg-white/[0.05]
                            transition-all duration-150
                        "
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                    </button>
                    <button
                        onClick={() => onEdit(service)}
                        className="
                            flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md
                            text-[11px] text-white/30 hover:text-white/70 hover:bg-white/[0.05]
                            transition-all duration-150
                        "
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                    </button>
                    <button
                        onClick={() => onToggleActive(service)}
                        className="
                            flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md
                            text-[11px] text-white/30 hover:text-white/70 hover:bg-white/[0.05]
                            transition-all duration-150
                        "
                    >
                        {service.isActive
                            ? <ToggleRight className="w-3.5 h-3.5" />
                            : <ToggleLeft className="w-3.5 h-3.5" />
                        }
                        <span>{service.isActive ? 'Disable' : 'Enable'}</span>
                    </button>
                    <button
                        onClick={() => onDelete(service._id)}
                        className="
                            flex items-center justify-center py-2 px-2 rounded-md
                            text-white/15 hover:text-red-400/70 hover:bg-white/[0.05]
                            transition-all duration-150
                        "
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}