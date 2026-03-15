'use client';

import { Pencil, Trash2, ToggleLeft, ToggleRight, Layers } from 'lucide-react';
import Image from 'next/image';

export default function SubcategoryCard({ 
    subcategory, 
    categoryName,
    onEdit, 
    onDelete, 
    onToggleStatus 
}) {
    return (
        <div className={`rounded-lg border bg-zinc-900/50 flex flex-col overflow-hidden transition-colors ${
            subcategory.isActive ? 'border-zinc-800 hover:bg-zinc-900/80' : 'border-zinc-800 opacity-60'
        }`}>
            {/* Image */}
            <div className="relative h-32 bg-zinc-800">
                {subcategory.image?.url && !subcategory.image.url.includes('default') ? (
                    <Image
                        src={subcategory.image.url}
                        alt={subcategory.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        {subcategory.icon ? (
                            <span className="text-4xl">{subcategory.icon}</span>
                        ) : (
                            <Layers className="w-8 h-8 text-zinc-700" />
                        )}
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                        subcategory.isActive
                            ? 'bg-white text-black'
                            : 'bg-zinc-800 text-zinc-500'
                    }`}>
                        {subcategory.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-400 truncate">
                            {categoryName}
                        </p>
                        <h3 className="text-white font-medium text-sm truncate mt-0.5">
                            {subcategory.name}
                        </h3>
                    </div>
                    {subcategory.icon && (
                        <span className="text-lg shrink-0">{subcategory.icon}</span>
                    )}
                </div>

                {subcategory.description && (
                    <p className="text-zinc-500 text-xs leading-relaxed mb-3 line-clamp-2">
                        {subcategory.description}
                    </p>
                )}

                <div className="mt-auto">
                    <span className="text-xs text-zinc-600">
                        {subcategory.totalServices || 0} service{subcategory.totalServices !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-zinc-800">
                    <button
                        onClick={() => onEdit(subcategory)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-zinc-500 hover:text-white hover:bg-zinc-800/50 transition-colors"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                    </button>
                    <button
                        onClick={() => onToggleStatus(subcategory)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-zinc-500 hover:text-white hover:bg-zinc-800/50 transition-colors"
                    >
                        {subcategory.isActive
                            ? <ToggleRight className="w-3.5 h-3.5" />
                            : <ToggleLeft className="w-3.5 h-3.5" />
                        }
                        <span>{subcategory.isActive ? 'Disable' : 'Enable'}</span>
                    </button>
                    <button
                        onClick={() => onDelete(subcategory._id)}
                        disabled={subcategory.totalServices > 0}
                        className="p-2 rounded-lg text-xs text-zinc-700 hover:text-white hover:bg-zinc-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title={subcategory.totalServices > 0 ? 'Remove services first' : 'Delete'}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}