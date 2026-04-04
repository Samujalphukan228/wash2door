// src/components/admin/bookings/BookingDetailModal.jsx
'use client';

import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
    X, MapPin, Clock, CreditCard, User, Package, Tag,
    RefreshCw, History, CheckCircle, XCircle, Loader2,
    Phone, Mail, Calendar, FileText, AlertTriangle, Zap
} from 'lucide-react';
import adminService from '@/services/adminService';
import toast from 'react-hot-toast';

const statusConfig = {
    pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', ring: 'ring-amber-500/20', dot: 'bg-amber-400', label: 'Pending' },
    confirmed: { bg: 'bg-blue-500/10', text: 'text-blue-400', ring: 'ring-blue-500/20', dot: 'bg-blue-400', label: 'Confirmed' },
    completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', ring: 'ring-emerald-500/20', dot: 'bg-emerald-400', label: 'Completed' },
    cancelled: { bg: 'bg-red-500/10', text: 'text-red-400', ring: 'ring-red-500/20', dot: 'bg-red-400', label: 'Cancelled' }
};

const getQuickActions = (currentStatus) => {
    const actions = {
        pending: [
            { status: 'confirmed', label: 'Confirm', icon: CheckCircle, variant: 'primary' },
            { status: 'cancelled', label: 'Cancel', icon: XCircle, variant: 'danger', needsReason: true }
        ],
        confirmed: [
            { status: 'completed', label: 'Complete', icon: CheckCircle, variant: 'success' },
            { status: 'cancelled', label: 'Cancel', icon: XCircle, variant: 'danger', needsReason: true }
        ]
    };
    return actions[currentStatus] || [];
};

// Animation variants
const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const panelVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: 'spring', damping: 25, stiffness: 300 }
    },
    exit: {
        opacity: 0,
        scale: 0.98,
        y: 10,
        transition: { duration: 0.2 }
    }
};

// Sub-components
const Section = memo(function Section({ icon: Icon, title, children, variant }) {
    const variantStyles = {
        success: 'text-emerald-400/70',
        danger: 'text-red-400/70',
        purple: 'text-purple-400/70',
        default: 'text-white/30'
    };
    
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Icon className={`w-3.5 h-3.5 ${variantStyles[variant] || variantStyles.default}`} />
                <h4 className={`text-[10px] uppercase tracking-widest font-semibold ${variantStyles[variant] || variantStyles.default}`}>
                    {title}
                </h4>
            </div>
            <div className="space-y-2">{children}</div>
        </div>
    );
});

const InfoRow = memo(function InfoRow({ label, value, highlight, mono, icon: Icon }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 shrink-0">
                {Icon && <Icon className="w-3 h-3 text-white/20" />}
                <span className="text-xs text-white/30">{label}</span>
            </div>
            <span className={`text-xs text-right leading-relaxed ${
                highlight ? 'text-white font-semibold text-sm' : mono ? 'font-mono text-white/60' : 'text-white/60'
            }`}>
                {value ?? '—'}
            </span>
        </div>
    );
});

const Badge = memo(function Badge({ children, variant = 'default' }) {
    const styles = {
        default: 'border-white/[0.08] bg-white/[0.03] text-white/40',
        success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
        warning: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
        purple: 'border-purple-500/20 bg-purple-500/10 text-purple-400',
    };
    
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-medium ${styles[variant]}`}>
            {children}
        </span>
    );
});

const ActionButton = memo(function ActionButton({ action, onClick, loading, disabled }) {
    const Icon = action.icon;
    const variants = {
        primary: 'bg-white text-black hover:bg-white/90',
        success: 'bg-emerald-500 text-white hover:bg-emerald-600',
        danger: 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20',
    };
    
    return (
        <motion.button
            onClick={onClick}
            disabled={loading || disabled}
            className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                text-xs font-medium transition-all duration-150
                disabled:opacity-50 disabled:cursor-not-allowed
                ${variants[action.variant]}
            `}
            whileTap={{ scale: 0.98 }}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Icon className="w-4 h-4" />
            )}
            {action.label}
        </motion.button>
    );
});

const HistoryItem = memo(function HistoryItem({ booking }) {
    const status = statusConfig[booking.status] || statusConfig.pending;
    
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.03] transition-colors">
            <div>
                <p className="text-xs text-white/70">{booking.serviceName}</p>
                <p className="text-[10px] text-white/30 mt-0.5">
                    {format(new Date(booking.bookingDate), 'dd MMM yyyy')}
                </p>
            </div>
            <div className="text-right">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                    {status.label}
                </span>
                <p className="text-[10px] text-white/40 mt-1 font-mono">
                    ₹{booking.price?.toLocaleString('en-IN')}
                </p>
            </div>
        </div>
    );
});

export default function BookingDetailModal({ booking, customerHistory, onClose, onUpdateStatus, onStatusChange }) {
    const [actionLoading, setActionLoading] = useState(null);
    const [showCancelInput, setShowCancelInput] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const status = statusConfig[booking.status] || statusConfig.pending;
    const canUpdate = !['completed', 'cancelled'].includes(booking.status);
    const quickActions = getQuickActions(booking.status);

    // Customer info helpers
    const customerName = booking.customerId
        ? typeof booking.customerId === 'object'
            ? `${booking.customerId.firstName} ${booking.customerId.lastName}`
            : 'Online Customer'
        : booking.walkInCustomer?.name || 'Walk-in Customer';

    const customerEmail = booking.customerId && typeof booking.customerId === 'object'
        ? booking.customerId.email : null;

    const customerPhone = booking.customerId && typeof booking.customerId === 'object'
        ? booking.customerId.phone : booking.walkInCustomer?.phone;

    const handleQuickAction = useCallback(async (e, action) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();

        if (action.needsReason) {
            setShowCancelInput(true);
            return;
        }

        try {
            setActionLoading(action.status);
            await adminService.updateBookingStatus(booking._id, action.status);
            
            const messages = {
                completed: 'Booking completed! Revenue added.',
                confirmed: 'Booking confirmed!'
            };
            toast.success(messages[action.status] || `Booking ${action.status}`);
            
            onStatusChange?.();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update');
        } finally {
            setActionLoading(null);
        }
    }, [booking._id, onStatusChange, onClose]);

    const handleCancel = useCallback(async (e) => {
        e?.preventDefault?.();
        if (!cancelReason.trim()) {
            toast.error('Please provide a reason');
            return;
        }

        try {
            setActionLoading('cancelled');
            await adminService.updateBookingStatus(booking._id, 'cancelled', cancelReason);
            toast.success('Booking cancelled');
            onStatusChange?.();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel');
        } finally {
            setActionLoading(null);
            setShowCancelInput(false);
        }
    }, [booking._id, cancelReason, onStatusChange, onClose]);

    const handleBackdropClick = useCallback((e) => {
        if (e.target === e.currentTarget) onClose();
    }, [onClose]);

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
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

                {/* Panel */}
                <motion.div
                    className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl border border-white/[0.08] bg-[#0a0a0a] shadow-2xl overflow-hidden"
                    variants={panelVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Top gradient */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent shrink-0" />

                    {/* Header */}
                    <div className="flex items-start justify-between px-5 py-4 shrink-0">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs text-white/50 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-lg">
                                    {booking.bookingCode}
                                </span>
                                <motion.span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ring-1 ${status.bg} ${status.text} ${status.ring}`}
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                    {status.label}
                                </motion.span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Badge>
                                    {booking.bookingType === 'walkin' ? 'Walk-in' : 'Online'}
                                </Badge>
                                {booking.serviceTier && (
                                    <Badge>
                                        <Tag className="w-2.5 h-2.5" />
                                        {booking.serviceTier}
                                    </Badge>
                                )}
                                {/* ✅ NEW: Admin slot badge */}
                                {booking.isAdminSlot && (
                                    <Badge variant="purple">
                                        <Zap className="w-2.5 h-2.5" />
                                        Admin Slot
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <motion.button
                            onClick={onClose}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/30 hover:text-white/70 border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.06] transition-all"
                            whileTap={{ scale: 0.95 }}
                        >
                            <X className="w-4 h-4" />
                        </motion.button>
                    </div>

                    {/* Quick Actions */}
                    <AnimatePresence mode="wait">
                        {canUpdate && quickActions.length > 0 && (
                            <motion.div
                                className="px-5 pb-4 shrink-0"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                {!showCancelInput ? (
                                    <div className="flex gap-2">
                                        {quickActions.map((action) => (
                                            <ActionButton
                                                key={action.status}
                                                action={action}
                                                onClick={(e) => handleQuickAction(e, action)}
                                                loading={actionLoading === action.status}
                                                disabled={actionLoading !== null}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <motion.div
                                        className="space-y-2"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <textarea
                                            value={cancelReason}
                                            onChange={(e) => setCancelReason(e.target.value)}
                                            placeholder="Reason for cancellation..."
                                            rows={2}
                                            className="w-full bg-red-500/5 border border-red-500/20 text-white/80 text-sm placeholder-red-400/30 px-4 py-3 rounded-xl resize-none focus:outline-none focus:border-red-500/40 transition-all"
                                        />
                                        <div className="flex gap-2">
                                            <motion.button
                                                onClick={() => { setShowCancelInput(false); setCancelReason(''); }}
                                                className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs text-white/50 hover:text-white/80 transition-all"
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                Back
                                            </motion.button>
                                            <motion.button
                                                onClick={handleCancel}
                                                disabled={actionLoading === 'cancelled'}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-xs font-medium text-white transition-all disabled:opacity-50"
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                {actionLoading === 'cancelled' ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <XCircle className="w-4 h-4" />
                                                )}
                                                Confirm Cancel
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Divider */}
                    <div className="h-px bg-white/[0.05] mx-5" />

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
                        {/* Customer */}
                        <Section icon={User} title="Customer">
                            <InfoRow label="Name" value={customerName} />
                            {customerEmail && <InfoRow icon={Mail} label="Email" value={customerEmail} mono />}
                            {customerPhone && <InfoRow icon={Phone} label="Phone" value={customerPhone} mono />}
                        </Section>

                        <div className="h-px bg-white/[0.04]" />

                        {/* Service */}
                        <Section icon={Package} title="Service">
                            <InfoRow label="Category" value={booking.categoryName} />
                            <InfoRow label="Service" value={booking.serviceName} />
                            {booking.variantName && <InfoRow label="Variant" value={booking.variantName} />}
                            <InfoRow label="Duration" value={`${booking.duration} min`} />
                            <InfoRow label="Amount" value={`₹${booking.price?.toLocaleString('en-IN')}`} highlight />
                        </Section>

                        <div className="h-px bg-white/[0.04]" />

                        {/* Schedule */}
                        <Section icon={Calendar} title="Schedule">
                            <InfoRow label="Date" value={format(new Date(booking.bookingDate), 'EEE, dd MMM yyyy')} />
                            <InfoRow icon={Clock} label="Time" value={booking.timeSlot} mono />
                            
                            {/* ✅ NEW: Admin slot indicator */}
                            {booking.isAdminSlot && (
                                <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                    <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center">
                                        A
                                    </span>
                                    <span className="text-xs text-purple-400">Admin-only time slot</span>
                                </div>
                            )}
                        </Section>

                        <div className="h-px bg-white/[0.04]" />

                        {/* Location */}
                        <Section icon={MapPin} title="Location">
                            <InfoRow label="City" value={booking.location?.city} />
                            <InfoRow label="Address" value={booking.location?.address} />
                            {booking.location?.landmark && <InfoRow label="Landmark" value={booking.location.landmark} />}
                        </Section>

                        <div className="h-px bg-white/[0.04]" />

                        {/* Payment */}
                        <Section icon={CreditCard} title="Payment">
                            <InfoRow label="Method" value={booking.paymentMethod || 'Cash'} />
                            <InfoRow label="Status" value={booking.paymentStatus || 'Pending'} />
                        </Section>

                        {/* Special Notes */}
                        {booking.specialNotes && (
                            <>
                                <div className="h-px bg-white/[0.04]" />
                                <Section icon={FileText} title="Notes">
                                    <p className="text-xs text-white/50 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 leading-relaxed">
                                        {booking.specialNotes}
                                    </p>
                                </Section>
                            </>
                        )}

                        {/* Admin Notes */}
                        {booking.adminNotes && (
                            <>
                                <div className="h-px bg-white/[0.04]" />
                                <Section icon={FileText} title="Admin Notes" variant="purple">
                                    <p className="text-xs text-purple-300/70 bg-purple-500/[0.05] border border-purple-500/15 rounded-xl p-4 leading-relaxed">
                                        {booking.adminNotes}
                                    </p>
                                </Section>
                            </>
                        )}

                        {/* Completion Info */}
                        {booking.status === 'completed' && (
                            <>
                                <div className="h-px bg-white/[0.04]" />
                                <Section icon={CheckCircle} title="Completion" variant="success">
                                    <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 space-y-2">
                                        {booking.completedAt && (
                                            <InfoRow label="Completed" value={format(new Date(booking.completedAt), 'dd MMM yyyy, hh:mm a')} mono />
                                        )}
                                        <InfoRow label="Revenue" value={`₹${booking.price?.toLocaleString('en-IN')}`} highlight />
                                    </div>
                                </Section>
                            </>
                        )}

                        {/* Cancellation Info */}
                        {booking.status === 'cancelled' && (
                            <>
                                <div className="h-px bg-white/[0.04]" />
                                <Section icon={AlertTriangle} title="Cancellation" variant="danger">
                                    <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 space-y-2">
                                        <InfoRow label="By" value={booking.cancelledBy} />
                                        <InfoRow label="Reason" value={booking.cancellationReason} />
                                        {booking.cancelledAt && (
                                            <InfoRow label="Date" value={format(new Date(booking.cancelledAt), 'dd MMM yyyy, hh:mm a')} mono />
                                        )}
                                    </div>
                                </Section>
                            </>
                        )}

                        {/* Customer History */}
                        {customerHistory?.length > 0 && (
                            <>
                                <div className="h-px bg-white/[0.04]" />
                                <Section icon={History} title="Previous Bookings">
                                    <div className="space-y-2">
                                        {customerHistory.map((hist) => (
                                            <HistoryItem key={hist._id} booking={hist} />
                                        ))}
                                    </div>
                                </Section>
                            </>
                        )}

                        <div className="h-2" />
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 border-t border-white/[0.05]">
                        <div className="flex items-center justify-between px-5 py-3.5">
                            <p className="text-[11px] text-white/25 font-mono">
                                {booking.createdAt && format(new Date(booking.createdAt), 'dd MMM yyyy · hh:mm a')}
                            </p>

                            {canUpdate ? (
                                <motion.button
                                    onClick={onUpdateStatus}
                                    className="group flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs text-white/50 hover:text-white/80 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all"
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <RefreshCw className="w-3 h-3 group-hover:rotate-45 transition-transform" />
                                    More Options
                                </motion.button>
                            ) : (
                                <span className={`text-[11px] font-medium px-3 py-1.5 rounded-full ring-1 ${status.bg} ${status.text} ${status.ring}`}>
                                    {booking.status === 'completed' ? 'Completed' : 'Cancelled'}
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}