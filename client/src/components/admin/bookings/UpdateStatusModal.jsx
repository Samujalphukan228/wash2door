// src/components/admin/bookings/UpdateStatusModal.jsx
'use client';

import { useState, useCallback, memo } from 'react';
import { X, Loader2, ChevronLeft, Check, AlertCircle } from 'lucide-react';
import adminService from '@/services/adminService';
import toast from 'react-hot-toast';

const STATUS_FLOW = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
};

const STATUS_CONFIG = {
    confirmed: {
        label: 'Confirm Booking',
        description: 'Approve and confirm this booking',
        icon: '✓',
        activeClass: 'bg-blue-500/[0.08] border-blue-500/20',
        textClass: 'text-blue-400',
        iconBg: 'bg-blue-500/20',
    },
    completed: {
        label: 'Mark Completed',
        description: 'Service has been completed successfully',
        icon: '✓',
        activeClass: 'bg-emerald-500/[0.08] border-emerald-500/20',
        textClass: 'text-emerald-400',
        iconBg: 'bg-emerald-500/20',
    },
    cancelled: {
        label: 'Cancel Booking',
        description: 'Cancel this booking with a reason',
        icon: '✕',
        activeClass: 'bg-red-500/[0.08] border-red-500/20',
        textClass: 'text-red-400',
        iconBg: 'bg-red-500/20',
    },
};

// ============================================
// STATUS OPTION
// ============================================

const StatusOption = memo(function StatusOption({ status, config, isSelected, onSelect, disabled }) {
    return (
        <button
            onClick={() => onSelect(status)}
            disabled={disabled}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${
                isSelected
                    ? config.activeClass
                    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
            }`}
        >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                isSelected ? `${config.iconBg} ${config.textClass}` : 'bg-white/[0.06] text-white/30'
            }`}>
                {config.icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium transition-colors ${
                    isSelected ? 'text-white' : 'text-white/70'
                }`}>
                    {config.label}
                </p>
                <p className={`text-[10px] mt-0.5 transition-colors ${
                    isSelected ? 'text-white/40' : 'text-white/25'
                }`}>
                    {config.description}
                </p>
            </div>
            {isSelected && (
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-black" />
                </div>
            )}
        </button>
    );
});

// ============================================
// MAIN COMPONENT
// ============================================

export default function UpdateStatusModal({ booking, onClose, onSuccess }) {
    const [selectedStatus, setSelectedStatus] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const availableStatuses = STATUS_FLOW[booking.status] || [];

    const handleSubmit = useCallback(async () => {
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
                    ? 'Booking completed!'
                    : `Booking ${selectedStatus}`
            );
            onClose();
            setTimeout(() => { if (onSuccess) onSuccess(); }, 100);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update');
            setLoading(false);
        }
    }, [selectedStatus, reason, booking._id, onClose, onSuccess]);

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-2 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[420px] sm:max-h-[80vh] bg-neutral-950 rounded-2xl overflow-hidden z-50 flex flex-col border border-white/[0.08]">

                {/* Header */}
                <div className="shrink-0 px-4 pt-4 pb-3">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2.5">
                            {/* Mobile back button */}
                            <button
                                onClick={onClose}
                                className="sm:hidden w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
                                disabled={loading}
                            >
                                <ChevronLeft className="w-4 h-4 text-white/60" />
                            </button>
                            <div>
                                <h2 className="text-sm font-semibold text-white">Update Status</h2>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-mono text-white/40">
                                        {booking.bookingCode}
                                    </span>
                                    <span className="w-0.5 h-0.5 rounded-full bg-white/20" />
                                    <span className="text-[10px] text-white/30 capitalize">
                                        Currently {booking.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center transition-colors"
                        >
                            <X className="w-3.5 h-3.5 text-white/40" />
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/[0.06]" />

                {/* Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-3">
                    {availableStatuses.length > 0 ? (
                        <>
                            <p className="text-[9px] text-white/25 font-semibold uppercase tracking-widest px-1">
                                Select new status
                            </p>
                            <div className="space-y-1.5">
                                {availableStatuses.map((status) => (
                                    <StatusOption
                                        key={status}
                                        status={status}
                                        config={STATUS_CONFIG[status]}
                                        isSelected={selectedStatus === status}
                                        onSelect={setSelectedStatus}
                                        disabled={loading}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10">
                            <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                                <AlertCircle className="w-4 h-4 text-white/20" />
                            </div>
                            <p className="text-xs font-medium text-white/40 mb-0.5">
                                No changes available
                            </p>
                            <p className="text-[10px] text-white/25">
                                This booking is {booking.status}
                            </p>
                        </div>
                    )}

                    {/* Cancellation Reason */}
                    {selectedStatus === 'cancelled' && (
                        <div className="space-y-1.5">
                            <label className="text-[9px] text-red-400/60 font-semibold uppercase tracking-widest px-1">
                                Cancellation Reason <span className="text-red-400/40">*</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Why is this being cancelled?"
                                rows={3}
                                disabled={loading}
                                className="w-full bg-red-500/[0.04] border border-red-500/15 text-white text-xs placeholder-red-400/25 px-3 py-2.5 rounded-lg resize-none focus:outline-none focus:border-red-500/30 disabled:opacity-50 transition-all"
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 p-3 border-t border-white/[0.06]">
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 sm:flex-none sm:px-4 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-xs text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={
                                loading ||
                                !selectedStatus ||
                                (selectedStatus === 'cancelled' && !reason.trim())
                            }
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-20 ${
                                selectedStatus === 'cancelled'
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-white hover:bg-white/90 text-black'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Check className="w-3.5 h-3.5" />
                                    Update Status
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}