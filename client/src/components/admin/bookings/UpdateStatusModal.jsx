// src/components/admin/bookings/UpdateStatusModal.jsx
'use client';

import { useState } from 'react';
import { X, Loader2, ChevronLeft, Check } from 'lucide-react';
import adminService from '@/services/adminService';
import toast from 'react-hot-toast';

const STATUS_FLOW = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['in-progress', 'cancelled'],
    'in-progress': ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
};

const STATUS_CONFIG = {
    confirmed: { label: 'Confirm Booking', color: 'bg-blue-500', icon: '✓' },
    'in-progress': { label: 'Start Service', color: 'bg-purple-500', icon: '▶' },
    completed: { label: 'Mark Completed', color: 'bg-emerald-500', icon: '✓' },
    cancelled: { label: 'Cancel Booking', color: 'bg-red-500/20 text-red-400', icon: '✕' },
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
                    ? 'Booking completed!'
                    : `Booking ${selectedStatus}`
            );

            await new Promise(resolve => setTimeout(resolve, 300));
            onClose();
            setTimeout(() => {
                if (onSuccess) onSuccess();
            }, 100);

        } catch (error) {
            console.error('Update status error:', error);
            toast.error(error.response?.data?.message || 'Failed to update');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
            <div 
                className="bg-black w-full sm:max-w-md sm:rounded-2xl border border-white/[0.08] flex flex-col max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top Line */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06]">
                    <button 
                        onClick={onClose} 
                        className="sm:hidden w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                        disabled={loading}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex-1">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Update Status</p>
                        <p className="text-sm text-white font-mono mt-0.5">{booking.bookingCode}</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="hidden sm:flex w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] items-center justify-center text-gray-500 hover:text-white transition-colors"
                        disabled={loading}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                    {/* Current Status */}
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Current Status</p>
                        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white capitalize">
                            <span className="w-2 h-2 rounded-full bg-white/40" />
                            {booking.status.replace('-', ' ')}
                        </span>
                    </div>

                    {/* Options */}
                    {availableStatuses.length > 0 ? (
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">Change To</p>
                            <div className="space-y-2">
                                {availableStatuses.map((status) => {
                                    const config = STATUS_CONFIG[status];
                                    const isSelected = selectedStatus === status;
                                    
                                    return (
                                        <button
                                            key={status}
                                            onClick={() => setSelectedStatus(status)}
                                            disabled={loading}
                                            className={`
                                                w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all
                                                ${isSelected
                                                    ? 'border-white/20 bg-white/[0.06]'
                                                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.12]'
                                                }
                                                disabled:opacity-50
                                            `}
                                        >
                                            <span className="text-sm text-white">
                                                {config?.label || status}
                                            </span>
                                            {isSelected && (
                                                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-black" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-8">
                            <p className="text-sm text-gray-500">No status changes available</p>
                        </div>
                    )}

                    {/* Reason for cancellation */}
                    {selectedStatus === 'cancelled' && (
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-2">
                                Reason *
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Why is this being cancelled?"
                                rows={3}
                                disabled={loading}
                                className="w-full bg-white/[0.02] border border-white/[0.08] text-white placeholder-gray-600 text-sm px-3 py-3 rounded-xl focus:outline-none focus:border-white/[0.15] resize-none disabled:opacity-50 transition-colors"
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/[0.06]">
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-gray-400 text-xs font-medium hover:text-white hover:bg-white/[0.04] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !selectedStatus}
                            className="flex-1 py-2.5 rounded-xl bg-white text-black text-xs font-medium hover:bg-gray-200 disabled:bg-white/[0.08] disabled:text-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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