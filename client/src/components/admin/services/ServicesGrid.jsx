'use client';

import ServiceCard from './ServiceCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ServicesGrid({
    services,
    loading,
    total,
    pages,
    currentPage,
    onPageChange,
    onView,
    onEdit,
    onDelete,
    onToggleActive
}) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-0 overflow-hidden"
                    >
                        <div className="h-44 bg-white/[0.04] animate-pulse" />
                        <div className="p-4 space-y-3">
                            <div className="h-4 w-3/4 bg-white/[0.06] animate-pulse rounded-md" />
                            <div className="h-3 w-1/2 bg-white/[0.04] animate-pulse rounded-md" />
                            <div className="h-3 w-2/3 bg-white/[0.03] animate-pulse rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!services || services.length === 0) {
        return (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-6 py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">🔧</span>
                </div>
                <p className="text-white/40 text-sm">No services found</p>
                <p className="text-white/20 text-xs mt-1">
                    Create your first service to get started
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                    <ServiceCard
                        key={service._id}
                        service={service}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onToggleActive={onToggleActive}
                    />
                ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
                    <p className="text-[11px] text-white/25">
                        Page {currentPage} of {pages} · {total} services
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="
                                w-8 h-8 rounded-lg flex items-center justify-center
                                border border-white/[0.08] bg-white/[0.03]
                                text-white/30 hover:text-white/70 hover:border-white/[0.14]
                                disabled:opacity-20 disabled:cursor-not-allowed
                                transition-all duration-150
                            "
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {[...Array(Math.min(pages, 5))].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => onPageChange(i + 1)}
                                className={`
                                    w-8 h-8 rounded-lg text-xs font-medium transition-all duration-150
                                    ${currentPage === i + 1
                                        ? 'bg-white text-black shadow-lg shadow-white/10'
                                        : 'border border-white/[0.08] bg-white/[0.03] text-white/30 hover:text-white/70 hover:border-white/[0.14]'
                                    }
                                `}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === pages}
                            className="
                                w-8 h-8 rounded-lg flex items-center justify-center
                                border border-white/[0.08] bg-white/[0.03]
                                text-white/30 hover:text-white/70 hover:border-white/[0.14]
                                disabled:opacity-20 disabled:cursor-not-allowed
                                transition-all duration-150
                            "
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}