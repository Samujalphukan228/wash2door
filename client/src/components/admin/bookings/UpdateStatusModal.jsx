'use client';

import { useState } from 'react';
import { X, Loader2, ChevronLeft } from 'lucide-react';
import adminService from '@/services/adminService';
import toast from 'react-hot-toast';

const STATUS_FLOW = {
    pending:       ['confirmed', 'cancelled'],
    confirmed:     ['in-progress', 'cancelled'],
    'in-progress': ['completed', 'cancelled'],
    completed:     [],
    cancelled:     []
};

const STATUS_LABELS = {
    confirmed:     'Confirm Booking',
    'in-progress': 'Mark In Progress',
    completed:     'Mark Completed',
    cancelled:     'Cancel Booking'
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
            toast.success(`Booking ${selectedStatus}`);
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black sm:bg-black/80 flex items-end sm:items-center justify-center">
            <div className="bg-neutral-950 w-full sm:max-w-md sm:border sm:border-neutral-800 flex flex-col max-h-full sm:max-h-[90vh]">

                {/* Header */}
                <div className="shrink-0 flex items-center gap-3 px-4 py-4 border-b border-neutral-800">
                    <button
                        onClick={onClose}
                        className="sm:hidden w-10 h-10 -ml-2 flex items-center justify-center text-neutral-400"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="flex-1">
                        <p className="text-xs text-neutral-500">Update Status</p>
                        <p className="text-white font-mono">{booking.bookingCode}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="hidden sm:flex w-8 h-8 items-center justify-center text-neutral-500 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                    {/* Current */}
                    <div>
                        <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Current</p>
                        <span className="text-sm text-white capitalize border border-neutral-700 px-3 py-1.5">
                            {booking.status}
                        </span>
                    </div>

                    {/* Options */}
                    {availableStatuses.length > 0 ? (
                        <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">Change To</p>
                            <div className="space-y-2">
                                {availableStatuses.map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setSelectedStatus(status)}
                                        className={`w-full flex items-center gap-3 p-4 border text-left transition-colors ${
                                            selectedStatus === status
                                                ? status === 'cancelled'
                                                    ? 'border-neutral-600 bg-neutral-900'
                                                    : 'border-white bg-white/5'
                                                : 'border-neutral-800 active:border-neutral-600'
                                        }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${
                                            status === 'cancelled' ? 'bg-neutral-600' : 'bg-white'
                                        }`} />
                                        <span className="text-sm text-white">
                                            {STATUS_LABELS[status] || status}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-neutral-500">No changes available.</p>
                    )}

                    {/* Reason */}
                    {selectedStatus === 'cancelled' && (
                        <div>
                            <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">
                                Reason *
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Why is this being cancelled?"
                                rows={3}
                                className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-base sm:text-sm px-3 py-3 focus:outline-none focus:border-neutral-600 resize-none"
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 p-4 border-t border-neutral-800 bg-neutral-950">
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none border border-neutral-800 text-neutral-400 text-sm sm:text-xs uppercase tracking-wider py-3.5 sm:px-4 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !selectedStatus || availableStatuses.length === 0}
                            className="flex-1 bg-white active:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-600 text-black text-sm sm:text-xs uppercase tracking-wider py-3.5 transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}