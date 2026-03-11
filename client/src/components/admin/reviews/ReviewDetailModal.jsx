'use client';

import {
    X, Star, Eye, EyeOff, User,
    Car, Calendar, MessageSquare
} from 'lucide-react';
import Image from 'next/image';

const formatDate = (date, options = {}) => {
    try {
        if (!date) return '—';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            ...options
        });
    } catch {
        return '—';
    }
};

export default function ReviewDetailModal({
    review,
    onClose,
    onToggleVisibility
}) {
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-950 border border-neutral-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 sticky top-0 bg-neutral-950 z-10">
                    <div>
                        <p className="text-xs text-neutral-500 tracking-widest uppercase mb-1">
                            Review Details
                        </p>
                        <h2 className="text-white text-lg font-light">
                            {review.serviceId?.name || review.serviceName || 'Review'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Status Badges */}
                    <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 ${
                            review.isVisible === false
                                ? 'bg-neutral-800 text-neutral-500'
                                : 'bg-white text-black'
                        }`}>
                            {review.isVisible === false ? 'Hidden' : 'Visible'}
                        </span>
                        <span className="text-xs text-neutral-500">
                            {formatDate(review.createdAt)}
                        </span>
                    </div>

                    {/* Rating */}
                    <div>
                        <p className="text-xs text-neutral-500 tracking-widest uppercase mb-3">
                            Rating
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${
                                            i < (review.rating || 0)
                                                ? 'text-white fill-white'
                                                : 'text-neutral-700'
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-2xl font-light text-white">
                                {review.rating || 0}
                            </span>
                            <span className="text-sm text-neutral-500">/ 5</span>
                        </div>
                    </div>

                    {/* Customer */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <User className="w-3.5 h-3.5 text-neutral-600" />
                            <p className="text-xs text-neutral-500 tracking-widest uppercase">
                                Customer
                            </p>
                        </div>
                        <div className="flex items-center gap-3 pl-1">
                            <div className="relative w-10 h-10 rounded-full bg-neutral-800 overflow-hidden shrink-0">
                                {review.customerId?.avatar?.url ? (
                                    <Image
                                        src={review.customerId.avatar.url}
                                        alt=""
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-sm text-neutral-500 uppercase">
                                        {review.customerId?.firstName?.[0] || '?'}
                                        {review.customerId?.lastName?.[0] || ''}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-white">
                                    {review.customerId
                                        ? `${review.customerId.firstName} ${review.customerId.lastName}`
                                        : '—'
                                    }
                                </p>
                                <p className="text-xs text-neutral-500">
                                    {review.customerId?.email || ''}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Service */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Car className="w-3.5 h-3.5 text-neutral-600" />
                            <p className="text-xs text-neutral-500 tracking-widest uppercase">
                                Service
                            </p>
                        </div>
                        <div className="border border-neutral-800 p-3 space-y-1">
                            <p className="text-sm text-white">
                                {review.serviceId?.name || review.serviceName || '—'}
                            </p>
                            {review.serviceId?.category && (
                                <span className="text-xs border border-neutral-700 text-neutral-400 px-2 py-0.5 capitalize inline-block">
                                    {review.serviceId.category}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Booking Reference */}
                    {review.bookingId && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                                <p className="text-xs text-neutral-500 tracking-widest uppercase">
                                    Booking
                                </p>
                            </div>
                            <div className="border border-neutral-800 p-3">
                                <p className="text-sm font-mono text-neutral-300">
                                    {review.bookingId?.bookingCode || review.bookingId || '—'}
                                </p>
                                {review.bookingId?.bookingDate && (
                                    <p className="text-xs text-neutral-500 mt-1">
                                        {formatDate(review.bookingId.bookingDate)}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Comment */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <MessageSquare className="w-3.5 h-3.5 text-neutral-600" />
                            <p className="text-xs text-neutral-500 tracking-widest uppercase">
                                Comment
                            </p>
                        </div>
                        <div className="bg-neutral-900 border border-neutral-800 p-4">
                            <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
                                {review.comment || 'No comment provided.'}
                            </p>
                        </div>
                    </div>

                    {/* Review Images */}
                    {review.images?.length > 0 && (
                        <div>
                            <p className="text-xs text-neutral-500 tracking-widest uppercase mb-3">
                                Photos
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                {review.images.map((img, i) => (
                                    <div
                                        key={i}
                                        className="relative aspect-square bg-neutral-900 overflow-hidden"
                                    >
                                        <Image
                                            src={img.url || img}
                                            alt=""
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Admin Response */}
                    {review.adminResponse && (
                        <div>
                            <p className="text-xs text-neutral-500 tracking-widest uppercase mb-3">
                                Admin Response
                            </p>
                            <div className="bg-neutral-900 border border-neutral-800 p-4">
                                <p className="text-sm text-neutral-300 leading-relaxed">
                                    {review.adminResponse}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="border-t border-neutral-800 pt-4 space-y-1">
                        <p className="text-xs text-neutral-600">
                            Created: {formatDate(review.createdAt)}
                        </p>
                        {review.updatedAt && review.updatedAt !== review.createdAt && (
                            <p className="text-xs text-neutral-600">
                                Updated: {formatDate(review.updatedAt)}
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-neutral-800 flex items-center gap-3 sticky bottom-0 bg-neutral-950">
                    <button
                        onClick={onClose}
                        className="border border-neutral-800 text-neutral-400 hover:text-white text-xs tracking-widest uppercase px-4 py-2.5 transition-colors"
                    >
                        Close
                    </button>

                    <button
                        onClick={onToggleVisibility}
                        className="flex-1 bg-white hover:bg-neutral-200 text-black text-xs tracking-widest uppercase py-2.5 transition-colors flex items-center justify-center gap-2"
                    >
                        {review.isVisible === false ? (
                            <>
                                <Eye className="w-3.5 h-3.5" />
                                Make Visible
                            </>
                        ) : (
                            <>
                                <EyeOff className="w-3.5 h-3.5" />
                                Hide Review
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}