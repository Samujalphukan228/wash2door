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
                        className="bg-neutral-950 border border-neutral-800 p-6 space-y-4"
                    >
                        <div className="h-40 bg-neutral-800 animate-pulse" />
                        <div className="h-4 w-3/4 bg-neutral-800 animate-pulse rounded" />
                        <div className="h-3 w-1/2 bg-neutral-900 animate-pulse rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (!services || services.length === 0) {
        return (
            <div className="bg-neutral-950 border border-neutral-800 px-6 py-16 text-center">
                <p className="text-neutral-500 text-sm">No services found</p>
                <p className="text-neutral-700 text-xs mt-1">
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
                <div className="flex items-center justify-between border-t border-neutral-800 pt-4">
                    <p className="text-xs text-neutral-500">
                        Page {currentPage} of {pages} · {total} services
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-8 h-8 flex items-center justify-center border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {[...Array(Math.min(pages, 5))].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => onPageChange(i + 1)}
                                className={`w-8 h-8 text-xs border transition-colors ${
                                    currentPage === i + 1
                                        ? 'border-white bg-white text-black'
                                        : 'border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === pages}
                            className="w-8 h-8 flex items-center justify-center border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}