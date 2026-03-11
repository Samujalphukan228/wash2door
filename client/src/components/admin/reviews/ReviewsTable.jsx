'use client';

import {
    Eye, EyeOff, Star,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import Image from 'next/image';

const formatDate = (date) => {
    try {
        if (!date) return '—';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return '—';
    }
};

export default function ReviewsTable({
    reviews,
    loading,
    total,
    pages,
    currentPage,
    onPageChange,
    onView,
    onToggleVisibility
}) {
    if (loading) {
        return (
            <div className="bg-neutral-950 border border-neutral-800">
                <div className="p-6 space-y-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-neutral-800 animate-pulse" />
                            <div className="h-4 w-32 bg-neutral-800 animate-pulse rounded" />
                            <div className="h-4 w-24 bg-neutral-800 animate-pulse rounded" />
                            <div className="h-4 w-48 bg-neutral-800 animate-pulse rounded" />
                            <div className="h-4 w-16 bg-neutral-800 animate-pulse rounded ml-auto" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!reviews || reviews.length === 0) {
        return (
            <div className="bg-neutral-950 border border-neutral-800">
                <div className="px-6 py-16 text-center">
                    <p className="text-neutral-500 text-sm">No reviews found</p>
                    <p className="text-neutral-700 text-xs mt-1">
                        Try adjusting your filters
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-neutral-950 border border-neutral-800">

            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
                <p className="text-xs font-medium text-white tracking-[0.15em] uppercase">
                    All Reviews
                </p>
                <p className="text-xs text-neutral-500">
                    {total} total
                </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-neutral-800">
                            {['Customer', 'Service', 'Rating', 'Comment', 'Date', 'Visible', 'Actions'].map((h) => (
                                <th
                                    key={h}
                                    className="px-4 py-3 text-left text-xs text-neutral-500 tracking-[0.15em] uppercase font-normal whitespace-nowrap"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map((review) => (
                            <tr
                                key={review._id}
                                className={`border-b border-neutral-800/50 hover:bg-neutral-900 transition-colors ${
                                    review.isVisible === false ? 'opacity-50' : ''
                                }`}
                            >
                                {/* Customer */}
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-8 h-8 rounded-full bg-neutral-800 overflow-hidden shrink-0">
                                            {review.customerId?.avatar?.url ? (
                                                <Image
                                                    src={review.customerId.avatar.url}
                                                    alt=""
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500 uppercase">
                                                    {review.customerId?.firstName?.[0] || '?'}
                                                    {review.customerId?.lastName?.[0] || ''}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm text-white whitespace-nowrap">
                                                {review.customerId
                                                    ? `${review.customerId.firstName} ${review.customerId.lastName}`
                                                    : '—'
                                                }
                                            </p>
                                            <p className="text-xs text-neutral-600 mt-0.5">
                                                {review.customerId?.email || ''}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Service */}
                                <td className="px-4 py-4">
                                    <p className="text-sm text-neutral-300 whitespace-nowrap">
                                        {review.serviceId?.name || review.serviceName || '—'}
                                    </p>
                                </td>

                                {/* Rating */}
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3.5 h-3.5 ${
                                                    i < (review.rating || 0)
                                                        ? 'text-white fill-white'
                                                        : 'text-neutral-700'
                                                }`}
                                            />
                                        ))}
                                        <span className="text-xs text-neutral-500 ml-1">
                                            {review.rating || 0}
                                        </span>
                                    </div>
                                </td>

                                {/* Comment */}
                                <td className="px-4 py-4 max-w-xs">
                                    <p className="text-sm text-neutral-400 truncate">
                                        {review.comment || '—'}
                                    </p>
                                </td>

                                {/* Date */}
                                <td className="px-4 py-4">
                                    <p className="text-xs text-neutral-500 whitespace-nowrap">
                                        {formatDate(review.createdAt)}
                                    </p>
                                </td>

                                {/* Visible */}
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${
                                            review.isVisible === false
                                                ? 'bg-neutral-700'
                                                : 'bg-white'
                                        }`} />
                                        <span className={`text-xs ${
                                            review.isVisible === false
                                                ? 'text-neutral-600'
                                                : 'text-neutral-300'
                                        }`}>
                                            {review.isVisible === false ? 'Hidden' : 'Visible'}
                                        </span>
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => onView(review)}
                                            className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
                                            title="View details"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => onToggleVisibility(review)}
                                            className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
                                            title={review.isVisible === false ? 'Show review' : 'Hide review'}
                                        >
                                            {review.isVisible === false ? (
                                                <Eye className="w-3.5 h-3.5" />
                                            ) : (
                                                <EyeOff className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
                <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-between">
                    <p className="text-xs text-neutral-500">
                        Page {currentPage} of {pages}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-8 h-8 flex items-center justify-center border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {[...Array(Math.min(pages, 5))].map((_, i) => {
                            const page = i + 1;
                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`w-8 h-8 text-xs border transition-colors ${
                                        currentPage === page
                                            ? 'border-white bg-white text-black'
                                            : 'border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
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