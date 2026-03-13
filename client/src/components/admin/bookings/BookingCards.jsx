'use client';

import { format } from 'date-fns';
import { Eye, RefreshCw, MapPin, Clock, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

function SkeletonCard() {
    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
            <div className="flex justify-between">
                <div className="h-4 w-28 bg-zinc-800 rounded animate-pulse" />
                <div className="h-5 w-20 bg-zinc-800 rounded-full animate-pulse" />
            </div>
            <div className="h-5 w-40 bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-56 bg-zinc-800 rounded animate-pulse" />
            <div className="h-px bg-zinc-800" />
            <div className="flex justify-between">
                <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-16 bg-zinc-800 rounded animate-pulse" />
            </div>
        </div>
    );
}

function BookingCard({ booking, onView, onUpdateStatus }) {
    const customerName = booking.customerId
        ? `${booking.customerId.firstName} ${booking.customerId.lastName}`
        : booking.walkInCustomer?.name || 'Walk-in Customer';

    const isActionable = !['completed', 'cancelled'].includes(booking.status);

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors overflow-hidden">
            <button onClick={() => onView(booking)} className="w-full p-4 text-left">
                {/* Row 1 */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-zinc-400">
                            {booking.bookingCode}
                        </span>
                        <span className="text-xs text-zinc-500">
                            {booking.bookingType === 'walkin' ? 'Walk-in' : 'Online'}
                        </span>
                    </div>
                    <span className="text-xs text-zinc-400 capitalize">
                        {booking.status.replace('-', ' ')}
                    </span>
                </div>

                {/* Row 2 */}
                <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-white">{customerName}</p>
                    <ArrowUpRight className="w-4 h-4 text-zinc-600" />
                </div>

                {/* Row 3 */}
                <p className="text-xs text-zinc-500 mb-4">{booking.serviceName}</p>

                {/* Row 4 */}
                <div className="flex items-center gap-3 text-xs text-zinc-600">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(booking.bookingDate), 'dd MMM')} · {booking.timeSlot}
                    </span>
                    <span>|</span>
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {booking.location?.city || 'N/A'}
                    </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800">
                    <span className="text-xs text-zinc-500">Total</span>
                    <span className="text-sm text-white font-medium">
                        ₹{booking.price?.toLocaleString('en-IN')}
                    </span>
                </div>
            </button>

            {/* Actions */}
            {isActionable && (
                <div className="flex border-t border-zinc-800">
                    <button
                        onClick={() => onView(booking)}
                        className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        View
                    </button>
                    <div className="w-px bg-zinc-800" />
                    <button
                        onClick={() => onUpdateStatus(booking)}
                        className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Update
                    </button>
                </div>
            )}
        </div>
    );
}

function Pagination({ currentPage, pages, onPageChange }) {
    if (pages <= 1) return null;

    const getPages = () => {
        if (pages <= 5) return Array.from({ length: pages }, (_, i) => i + 1);
        if (currentPage <= 3) return [1, 2, 3, 4, 5];
        if (currentPage >= pages - 2) return [pages - 4, pages - 3, pages - 2, pages - 1, pages];
        return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
    };

    return (
        <div className="flex items-center justify-between pt-3">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft className="w-4 h-4" />
                Prev
            </button>

            <div className="flex items-center gap-1">
                {getPages().map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-7 h-7 text-xs font-medium rounded transition-colors ${
                            currentPage === page
                                ? 'bg-white text-black'
                                : 'text-zinc-500 hover:text-white'
                        }`}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === pages}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                Next
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}

export default function BookingCards({ bookings, loading, total, pages, currentPage, onPageChange, onView, onUpdateStatus }) {
    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        );
    }

    if (!bookings || bookings.length === 0) {
        return (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 py-20 text-center">
                <Clock className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-400">No bookings found</p>
                <p className="text-xs text-zinc-600 mt-1">Try adjusting your filters</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <p className="text-xs text-zinc-500">
                    <span className="text-white font-medium">{total}</span> bookings
                </p>
                <p className="text-xs text-zinc-600 font-mono">
                    {currentPage} / {pages}
                </p>
            </div>

            {bookings.map((booking) => (
                <BookingCard
                    key={booking._id}
                    booking={booking}
                    onView={onView}
                    onUpdateStatus={onUpdateStatus}
                />
            ))}

            <Pagination currentPage={currentPage} pages={pages} onPageChange={onPageChange} />
        </div>
    );
}