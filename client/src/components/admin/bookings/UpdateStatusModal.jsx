'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import adminService from '@/services/adminService';
import toast from 'react-hot-toast';

const STATUS_FLOW = {
    pending:      ['confirmed', 'cancelled'],
    confirmed:    ['in-progress', 'cancelled'],
    'in-progress':['completed', 'cancelled'],
    completed:    [],
    cancelled:    []
};

const STATUS_LABELS = {
    confirmed:    'Confirm Booking',
    'in-progress':'Mark In Progress',
    completed:    'Mark Completed',
    cancelled:    'Cancel Booking'
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
            toast.error('Please provide a cancellation reason');
            return;
        }

        try {
            setLoading(true);
            await adminService.updateBookingStatus(
                booking._id,
                selectedStatus,
                reason
            );
            toast.success(`Booking ${selectedStatus}`);
            onSuccess();
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Failed to update status'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
                    <div>
                        <p className="text-xs text-neutral-500 tracking-widest uppercase mb-1">
                            Update Status
                        </p>
                        <h2 className="text-white font-mono">
                            {booking.bookingCode}
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

                    {/* Current Status */}
                    <div>
                        <p className="text-xs text-neutral-500 tracking-widest uppercase mb-2">
                            Current Status
                        </p>
                        <span className="text-sm text-white capitalize border border-neutral-700 px-3 py-1">
                            {booking.status}
                        </span>
                    </div>

                    {/* Select New Status */}
                    {availableStatuses.length > 0 ? (
                        <div>
                            <p className="text-xs text-neutral-500 tracking-widest uppercase mb-3">
                                Change To
                            </p>
                            <div className="space-y-2">
                                {availableStatuses.map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setSelectedStatus(status)}
                                        className={`w-full flex items-center gap-3 p-3 border text-left transition-colors ${
                                            selectedStatus === status
                                                ? status === 'cancelled'
                                                    ? 'border-neutral-600 bg-neutral-900'
                                                    : 'border-white bg-white/5'
                                                : 'border-neutral-800 hover:border-neutral-600'
                                        }`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${
                                            status === 'cancelled'
                                                ? 'bg-neutral-600'
                                                : 'bg-white'
                                        }`} />
                                        <span className="text-sm text-white">
                                            {STATUS_LABELS[status] || status}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-neutral-500">
                            No status changes available for this booking.
                        </p>
                    )}

                    {/* Cancellation Reason */}
                    {selectedStatus === 'cancelled' && (
                        <div>
                            <label className="block text-xs text-neutral-500 tracking-widest uppercase mb-2">
                                Cancellation Reason *
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Enter reason for cancellation..."
                                rows={3}
                                className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2 focus:outline-none focus:border-neutral-600 resize-none"
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-neutral-800 flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-neutral-800 text-neutral-400 hover:text-white text-xs tracking-widest uppercase py-3 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !selectedStatus || availableStatuses.length === 0}
                        className="flex-1 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed text-black text-xs tracking-widest uppercase py-3 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Updating
                            </>
                        ) : (
                            'Update'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}