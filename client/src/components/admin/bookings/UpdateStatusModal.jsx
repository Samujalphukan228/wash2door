'use client';

import { useState } from 'react';
import { X, Loader2, ChevronLeft } from 'lucide-react';
import adminService from '@/services/adminService';
import toast from 'react-hot-toast';

const STATUS_FLOW = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['in-progress', 'cancelled'],
    'in-progress': ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
};

const STATUS_LABELS = {
    confirmed: 'Confirm Booking',
    'in-progress': 'Mark In Progress',
    completed: 'Mark Completed',
    cancelled: 'Cancel Booking',
};

export default function UpdateStatusModal({ booking, onClose, onSuccess }) {
    const [selectedStatus, setSelectedStatus] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const availableStatuses = STATUS_FLOW[booking.status] || [];

    const handleSubmit = async () => {
        if (!selectedStatus) {
            toast.error('Please select a status');
            return;
        }

        if (selectedStatus === 'cancelled' && !reason.trim()) {
            toast.error('Please provide a reason');
            return;
        }

        try {
            setLoading(true);
            await adminService.updateBookingStatus(booking._id, selectedStatus, reason);
            toast.success(
                selectedStatus === 'completed'
                    ? 'Booking completed! Revenue added.'
                    : `Booking ${selectedStatus}`
            );
            onSuccess?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center" onClick={onClose}>
            <div className="bg-zinc-900 w-full sm:max-w-md sm:rounded-lg border-t sm:border border-zinc-800 flex flex-col max-h-full sm:max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-800">
                    <button onClick={onClose} className="sm:hidden">
                        <ChevronLeft className="w-5 h-5 text-zinc-400" />
                    </button>
                    <div className="flex-1">
                        <p className="text-xs text-zinc-500">Update Status</p>
                        <p className="text-sm text-white font-mono">{booking.bookingCode}</p>
                    </div>
                    <button onClick={onClose} className="hidden sm:block">
                        <X className="w-4 h-4 text-zinc-400 hover:text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                    {/* Current */}
                    <div>
                        <p className="text-xs text-zinc-500 mb-2">Current Status</p>
                        <span className="inline-block text-sm text-white capitalize border border-zinc-700 px-3 py-1.5 rounded-lg">
                            {booking.status}
                        </span>
                    </div>

                    {/* Options */}
                    {availableStatuses.length > 0 ? (
                        <div>
                            <p className="text-xs text-zinc-500 mb-3">Change To</p>
                            <div className="space-y-2">
                                {availableStatuses.map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setSelectedStatus(status)}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
                                            selectedStatus === status
                                                ? 'border-zinc-600 bg-zinc-800/50'
                                                : 'border-zinc-800 hover:border-zinc-700'
                                        }`}
                                    >
                                        <span className="text-sm text-white">
                                            {STATUS_LABELS[status] || status}
                                        </span>
                                        {selectedStatus === status && (
                                            <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                                <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-zinc-500 text-center py-8">No status changes available</p>
                    )}

                    {/* Reason */}
                    {selectedStatus === 'cancelled' && (
                        <div>
                            <label className="block text-xs text-zinc-500 mb-2">
                                Reason *
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Why is this being cancelled?"
                                rows={3}
                                className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 text-sm px-3 py-3 rounded-lg focus:outline-none focus:border-zinc-600 resize-none"
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-zinc-800">
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg border border-zinc-800 text-zinc-400 text-xs font-medium hover:text-white hover:border-zinc-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !selectedStatus}
                            className="flex-1 py-2.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Updating…
                                </>
                            ) : (
                                'Update Status'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}