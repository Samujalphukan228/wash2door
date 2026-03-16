// src/components/admin/subcategories/SubcategoryCard.jsx
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
    const isActive = subcategory.isActive !== undefined ? subcategory.isActive : true;

    return (
        <div className={`
            bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl 
            flex flex-col overflow-hidden transition-all hover:bg-white/[0.04]
            ${!isActive ? 'opacity-50' : ''}
        `}>
            {/* Image */}
            <div className="relative h-32 sm:h-36 bg-white/[0.04]">
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
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center">
                                <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                            </div>
                        )}
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                    <span className={`
                        text-[9px] font-medium px-1.5 py-0.5 rounded
                        ${isActive
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/15 text-red-400 border border-red-500/20'
                        }
                    `}>
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-gray-600 truncate uppercase tracking-wider">
                            {categoryName}
                        </p>
                        <h3 className="text-sm font-medium text-white truncate mt-0.5">
                            {subcategory.name}
                        </h3>
                    </div>
                    {subcategory.icon && (
                        <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                            <span className="text-sm">{subcategory.icon}</span>
                        </div>
                    )}
                </div>

                {subcategory.description && (
                    <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                        {subcategory.description}
                    </p>
                )}

                <div className="mt-auto">
                    <span className="text-[10px] text-gray-600">
                        {subcategory.totalServices || 0} service{subcategory.totalServices !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/[0.06]">
                    <button
                        onClick={() => onEdit(subcategory)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
                    >
                        <Pencil className="w-3 h-3" />
                        Edit
                    </button>
                    <button
                        onClick={() => onToggleStatus(subcategory)}
                        className={`
                            flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] text-gray-400 transition-all
                            ${isActive
                                ? 'hover:text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500/20'
                                : 'hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20'
                            }
                        `}
                    >
                        {isActive
                            ? <ToggleRight className="w-3 h-3" />
                            : <ToggleLeft className="w-3 h-3" />
                        }
                        {isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                        onClick={() => onDelete(subcategory._id)}
                        disabled={subcategory.totalServices > 0}
                        className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:bg-white/[0.04] disabled:hover:border-white/[0.08] transition-all"
                        title={subcategory.totalServices > 0 ? 'Remove services first' : 'Delete'}
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}