// src/components/admin/categories/CategoryCard.jsx

'use client';

import { Pencil, Trash2, ToggleLeft, ToggleRight, Layers } from 'lucide-react';
import Image from 'next/image';

export default function CategoryCard({ category, onEdit, onDelete, onToggleStatus }) {
    return (
        <div className={`bg-neutral-950 border flex flex-col transition-colors ${
            category.isActive ? 'border-neutral-800' : 'border-neutral-900 opacity-60'
        }`}>
            {/* Image */}
            <div className="relative h-32 bg-neutral-900 overflow-hidden">
                {category.image?.url && !category.image.url.includes('default') ? (
                    <Image
                        src={category.image.url}
                        alt={category.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        {category.icon ? (
                            <span className="text-4xl">{category.icon}</span>
                        ) : (
                            <Layers className="w-8 h-8 text-neutral-700" />
                        )}
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                    <span className={`text-xs px-2 py-0.5 ${
                        category.isActive
                            ? 'bg-white text-black'
                            : 'bg-neutral-800 text-neutral-500'
                    }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-white font-medium text-sm truncate">
                        {category.name}
                    </h3>
                    {category.icon && (
                        <span className="text-lg shrink-0">{category.icon}</span>
                    )}
                </div>

                {category.description && (
                    <p className="text-neutral-500 text-xs leading-relaxed mb-3 line-clamp-2">
                        {category.description}
                    </p>
                )}

                <div className="flex items-center gap-2 mt-auto">
                    <span className="text-xs text-neutral-600">
                        {category.totalServices || 0} services
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-neutral-800">
                    <button
                        onClick={() => onEdit(category)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                    </button>
                    <button
                        onClick={() => onToggleStatus(category)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors"
                    >
                        {category.isActive
                            ? <ToggleRight className="w-3.5 h-3.5" />
                            : <ToggleLeft className="w-3.5 h-3.5" />
                        }
                        <span>{category.isActive ? 'Disable' : 'Enable'}</span>
                    </button>
                    <button
                        onClick={() => onDelete(category._id)}
                        disabled={category.totalServices > 0}
                        className="flex items-center justify-center py-2 px-2 text-xs text-neutral-700 hover:text-white hover:bg-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title={category.totalServices > 0 ? 'Remove services first' : 'Delete'}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}