'use client';

import { Pencil, Trash2, ToggleLeft, ToggleRight, Layers } from 'lucide-react';
import Image from 'next/image';

export default function SubcategoryCard({
    subcategory,
    categoryName,
    onEdit,
    onDelete,
    onToggleStatus,
}) {
    const isActive =
        subcategory.isActive !== undefined ? subcategory.isActive : true;

    return (
        <div
            className={`bg-neutral-950 border border-white/[0.08] rounded-xl flex flex-col overflow-hidden transition-all hover:border-white/[0.12] ${
                !isActive ? 'opacity-50' : ''
            }`}
        >
            {/* Image */}
            <div className="relative h-32 bg-white/[0.03]">
                {subcategory.image?.url &&
                !subcategory.image.url.includes('default') ? (
                    <Image
                        src={subcategory.image.url}
                        alt={subcategory.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                            <Layers className="w-4 h-4 text-white/20" />
                        </div>
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                    <span
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${
                            isActive
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                : 'bg-white/[0.06] text-white/30 border border-white/[0.08]'
                        }`}
                    >
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-3 flex-1 flex flex-col gap-2">
                {/* Title Row */}
                <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wide truncate mb-0.5">
                        {categoryName}
                    </p>
                    <h3 className="text-xs font-semibold text-white truncate">
                        {subcategory.name}
                    </h3>
                    {subcategory.description && (
                        <p className="text-[10px] text-white/30 leading-relaxed mt-1 line-clamp-2">
                            {subcategory.description}
                        </p>
                    )}
                </div>

                {/* Services Count */}
                <p className="text-[10px] text-white/25">
                    {subcategory.totalServices || 0}{' '}
                    {subcategory.totalServices === 1 ? 'service' : 'services'}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.06]">
                    <button
                        onClick={() => onEdit(subcategory)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] font-medium text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
                    >
                        <Pencil className="w-3 h-3" />
                        Edit
                    </button>
                    <button
                        onClick={() => onToggleStatus(subcategory)}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${
                            isActive
                                ? 'bg-white/[0.04] border-white/[0.06] text-white/40 hover:bg-yellow-500/10 hover:border-yellow-500/20 hover:text-yellow-400'
                                : 'bg-white/[0.04] border-white/[0.06] text-white/40 hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-400'
                        }`}
                    >
                        {isActive ? (
                            <ToggleRight className="w-3 h-3" />
                        ) : (
                            <ToggleLeft className="w-3 h-3" />
                        )}
                        {isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                        onClick={() => onDelete(subcategory._id)}
                        disabled={subcategory.totalServices > 0}
                        title={
                            subcategory.totalServices > 0
                                ? 'Remove services first'
                                : 'Delete'
                        }
                        className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:text-white/30 disabled:hover:bg-white/[0.04] disabled:hover:border-white/[0.06] transition-all"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}