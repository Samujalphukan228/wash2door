// src/components/admin/bookings/UpdateStatusModal.jsx
'use client';

import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ChevronLeft, Check, AlertCircle } from 'lucide-react';
import adminService from '@/services/adminService';
import toast from 'react-hot-toast';

// ✅ FIXED: Removed 'in-progress' from status flow
const STATUS_FLOW = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled'],  // ✅ Direct to completed
    completed: [],
    cancelled: [],
};

// ✅ FIXED: Removed 'in-progress' from status config
const STATUS_CONFIG = {
    confirmed: { 
        label: 'Confirm Booking', 
        description: 'Approve and confirm this booking',
        icon: '✓',
        gradient: 'from-blue-500/20 to-blue-600/10',
        border: 'border-blue-500/20',
        text: 'text-blue-400'
    },
    completed: { 
        label: 'Mark Completed', 
        description: 'Service has been completed successfully',
        icon: '✓',
        gradient: 'from-emerald-500/20 to-emerald-600/10',
        border: 'border-emerald-500/20',
        text: 'text-emerald-400'
    },
    cancelled: { 
        label: 'Cancel Booking', 
        description: 'Cancel this booking with a reason',
        icon: '✕',
        gradient: 'from-red-500/10 to-red-600/5',
        border: 'border-red-500/20',
        text: 'text-red-400'
    },
};

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const modalVariants = {
    hidden: { 
        opacity: 0, 
        y: 100,
        scale: 0.95,
    },
    visible: { 
        opacity: 1, 
        y: 0,
        scale: 1,
        transition: {
            type: 'spring',
            damping: 30,
            stiffness: 300,
        }
    },
    exit: {
        opacity: 0,
        y: 50,
        scale: 0.98,
        transition: { duration: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.05,
            type: 'spring',
            stiffness: 300,
            damping: 25,
        }
    }),
};

const StatusOption = memo(function StatusOption({ status, config, isSelected, onSelect, disabled, index }) {
    return (
        <motion.button
            custom={index}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            onClick={() => onSelect(status)}
            disabled={disabled}
            className={`
                w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200
                ${isSelected
                    ? `bg-gradient-to-r ${config.gradient} ${config.border} shadow-lg`
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
                active:scale-[0.98]
            `}
        >
            <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center text-lg
                ${isSelected ? config.text + ' bg-white/10' : 'bg-white/[0.05] text-white/30'}
                transition-all duration-200
            `}>
                {config.icon}
            </div>
            
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/70'} transition-colors`}>
                    {config.label}
                </p>
                <p className={`text-xs mt-0.5 ${isSelected ? 'text-white/50' : 'text-white/30'} transition-colors`}>
                    {config.description}
                </p>
            </div>
            
            <AnimatePresence mode="wait">
                {isSelected && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0"
                    >
                        <Check className="w-3.5 h-3.5 text-black" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
});

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
            setTimeout(() => {
                if (onSuccess) onSuccess();
            }, 100);

        } catch (error) {
            console.error('Update status error:', error);
            toast.error(error.response?.data?.message || 'Failed to update');
            setLoading(false);
        }
    }, [selectedStatus, reason, booking._id, onClose, onSuccess]);

    const handleBackdropClick = useCallback((e) => {
        if (e.target === e.currentTarget) onClose();
    }, [onClose]);

    return (
        <AnimatePresence>
            <motion.div 
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
            >
                {/* Backdrop */}
                <motion.div 
                    className="absolute inset-0 bg-black/80"
                    onClick={handleBackdropClick}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />

                {/* Modal */}
                <motion.div 
                    className="relative bg-[#0A0A0A] w-full sm:max-w-md sm:rounded-2xl border border-white/[0.08] flex flex-col max-h-[90vh] overflow-hidden shadow-2xl"
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Top gradient line */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    
                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06]">
                        <motion.button 
                            onClick={onClose} 
                            className="sm:hidden w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.08] transition-all"
                            disabled={loading}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </motion.button>
                        
                        <div className="flex-1">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Update Status</p>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-white font-mono">{booking.bookingCode}</p>
                                <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-[10px] text-white/50 capitalize">
                                    {booking.status}
                                </span>
                            </div>
                        </div>
                        
                        <motion.button 
                            onClick={onClose} 
                            className="hidden sm:flex w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.08] transition-all"
                            disabled={loading}
                            whileTap={{ scale: 0.95 }}
                        >
                            <X className="w-4 h-4" />
                        </motion.button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Status Options */}
                        {availableStatuses.length > 0 ? (
                            <div className="space-y-2">
                                {availableStatuses.map((status, index) => {
                                    const config = STATUS_CONFIG[status];
                                    return (
                                        <StatusOption
                                            key={status}
                                            status={status}
                                            config={config}
                                            isSelected={selectedStatus === status}
                                            onSelect={setSelectedStatus}
                                            disabled={loading}
                                            index={index}
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <motion.div 
                                className="flex flex-col items-center py-12"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-3">
                                    <AlertCircle className="w-5 h-5 text-white/30" />
                                </div>
                                <p className="text-sm text-gray-500">No status changes available</p>
                                <p className="text-xs text-gray-600 mt-1">This booking is {booking.status}</p>
                            </motion.div>
                        )}

                        {/* Reason for cancellation */}
                        <AnimatePresence mode="wait">
                            {selectedStatus === 'cancelled' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="pt-2">
                                        <label className="block text-[10px] text-red-400/60 uppercase tracking-wider font-medium mb-2">
                                            Cancellation Reason *
                                        </label>
                                        <textarea
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            placeholder="Why is this being cancelled?"
                                            rows={3}
                                            disabled={loading}
                                            className="w-full bg-red-500/[0.05] border border-red-500/20 text-white placeholder-red-400/30 text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-red-500/40 resize-none disabled:opacity-50 transition-all"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/[0.06] bg-white/[0.02]">
                        <div className="flex gap-2">
                            <motion.button
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-white/[0.08] bg-white/[0.02] text-gray-400 text-sm font-medium hover:text-white hover:bg-white/[0.04] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                whileTap={{ scale: 0.98 }}
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                onClick={handleSubmit}
                                disabled={loading || !selectedStatus || (selectedStatus === 'cancelled' && !reason.trim())}
                                className={`
                                    flex-1 py-3 rounded-xl text-sm font-medium transition-all 
                                    flex items-center justify-center gap-2
                                    disabled:cursor-not-allowed
                                    ${selectedStatus === 'cancelled'
                                        ? 'bg-red-500 hover:bg-red-600 text-white disabled:bg-red-500/20 disabled:text-red-400/50'
                                        : 'bg-white text-black hover:bg-gray-200 disabled:bg-white/[0.08] disabled:text-gray-600'
                                    }
                                `}
                                whileTap={{ scale: 0.98 }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Updating…</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>Update Status</span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}