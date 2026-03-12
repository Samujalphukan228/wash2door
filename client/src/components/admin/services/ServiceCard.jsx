// src/components/admin/services/ServiceCard.jsx

'use client';

import { Eye, Pencil, Trash2, ToggleLeft, ToggleRight, Star, Tag } from 'lucide-react';
import Image from 'next/image';

const tierColors = {
    basic: 'border-neutral-700 text-neutral-400',
    standard: 'border-neutral-600 text-neutral-300',
    premium: 'border-neutral-400 text-white',
    custom: 'border-neutral-500 text-neutral-200'
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
        <div className={`bg-neutral-950 border flex flex-col transition-colors ${
            service.isActive ? 'border-neutral-800' : 'border-neutral-900 opacity-60'
        }`}>
            {/* Image */}
            <div className="relative h-44 bg-neutral-900 overflow-hidden">
                {primaryImage ? (
                    <Image
                        src={primaryImage.url}
                        alt={service.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <p className="text-neutral-700 text-xs">No image</p>
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                    <span className="text-xs border border-neutral-700 bg-black/80 text-neutral-300 px-2 py-0.5">
                        {categoryIcon} {categoryName}
                    </span>
                </div>

                {/* Tier Badge */}
                <div className="absolute top-3 right-3">
                    <span className={`text-xs border px-2 py-0.5 bg-black/80 capitalize ${
                        tierColors[service.tier] || tierColors.basic
                    }`}>
                        {service.tier || 'basic'}
                    </span>
                </div>

                {/* Featured Badge */}
                {service.isFeatured && (
                    <div className="absolute bottom-3 left-3">
                        <span className="text-xs bg-white text-black px-2 py-0.5">
                            ★ Featured
                        </span>
                    </div>
                )}

                {/* Image Count */}
                {service.images?.length > 1 && (
                    <div className="absolute bottom-3 right-3">
                        <span className="text-xs bg-black/70 text-neutral-400 px-2 py-0.5">
                            {service.images.length} photos
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-white font-medium text-sm mb-1 truncate">
                    {service.name}
                </h3>

                <p className="text-neutral-500 text-xs leading-relaxed mb-3 line-clamp-2">
                    {service.shortDescription || service.description}
                </p>

                {/* Stats Row */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-neutral-600" />
                        <span className="text-xs text-neutral-500">
                            {service.averageRating?.toFixed(1) || '0.0'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-neutral-600" />
                        <span className="text-xs text-neutral-500">
                            {service.variants?.length || 0} variants
                        </span>
                    </div>
                    <div className="ml-auto">
                        <span className="text-sm text-white font-medium">
                            ₹{service.startingPrice?.toLocaleString('en-IN') || 0}+
                        </span>
                    </div>
                </div>

                {/* Variants Preview */}
                {service.variants?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                        {service.variants
                            .filter(v => v.isActive)
                            .slice(0, 3)
                            .map((variant, index) => (
                                <span
                                    key={variant._id || index}
                                    className="text-xs border border-neutral-800 text-neutral-600 px-2 py-0.5"
                                >
                                    {variant.name}
                                </span>
                            ))}
                        {service.variants.filter(v => v.isActive).length > 3 && (
                            <span className="text-xs text-neutral-700">
                                +{service.variants.filter(v => v.isActive).length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Status */}
                <div className="mb-4">
                    <span className={`text-xs px-2 py-0.5 ${
                        service.isActive
                            ? 'bg-white text-black'
                            : 'bg-neutral-800 text-neutral-500'
                    }`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 mt-auto pt-3 border-t border-neutral-800">
                    <button
                        onClick={() => onView(service)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                    </button>
                    <button
                        onClick={() => onEdit(service)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                    </button>
                    <button
                        onClick={() => onToggleActive(service)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors"
                    >
                        {service.isActive
                            ? <ToggleRight className="w-3.5 h-3.5" />
                            : <ToggleLeft className="w-3.5 h-3.5" />
                        }
                        <span>{service.isActive ? 'Disable' : 'Enable'}</span>
                    </button>
                    <button
                        onClick={() => onDelete(service._id)}
                        className="flex items-center justify-center py-2 px-2 text-xs text-neutral-700 hover:text-white hover:bg-neutral-900 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}