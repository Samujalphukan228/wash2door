// src/components/admin/bookings/BookingDetailModal.jsx
'use client';

import { useState, useCallback, memo } from 'react';
import { format } from 'date-fns';
import {
    X, MapPin, Clock, CreditCard, User, Package, Tag,
    RefreshCw, History, CheckCircle, XCircle, Loader2,
    Phone, Mail, Calendar, FileText, AlertTriangle, Zap,
    ChevronRight
} from 'lucide-react';
import adminService from '@/services/adminService';
import toast from 'react-hot-toast';

const statusConfig = {
    pending: {
        bg: 'bg-amber-500/10', text: 'text-amber-400',
        ring: 'ring-amber-500/20', dot: 'bg-amber-400', label: 'Pending'
    },
    confirmed: {
        bg: 'bg-blue-500/10', text: 'text-blue-400',
        ring: 'ring-blue-500/20', dot: 'bg-blue-400', label: 'Confirmed'
    },
    completed: {
        bg: 'bg-emerald-500/10', text: 'text-emerald-400',
        ring: 'ring-emerald-500/20', dot: 'bg-emerald-400', label: 'Completed'
    },
    cancelled: {
        bg: 'bg-red-500/10', text: 'text-red-400',
        ring: 'ring-red-500/20', dot: 'bg-red-400', label: 'Cancelled'
    }
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

// ============================================
// SUB COMPONENTS
// ============================================

const Section = memo(function Section({ icon: Icon, title, children, variant }) {
    const variantStyles = {
        success: 'text-emerald-400/60',
        danger: 'text-red-400/60',
        purple: 'text-purple-400/60',
        default: 'text-white/25'
    };
    return (
        <div className="space-y-2.5">
            <div className="flex items-center gap-2">
                <Icon className={`w-3 h-3 ${variantStyles[variant] || variantStyles.default}`} />
                <span className={`text-[9px] font-semibold uppercase tracking-widest ${variantStyles[variant] || variantStyles.default}`}>
                    {title}
                </span>
            </div>
            <div className="space-y-1.5">{children}</div>
        </div>
    );
});

const InfoRow = memo(function InfoRow({ label, value, highlight, mono }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="text-[10px] text-white/30 shrink-0">{label}</span>
            <span className={`text-right leading-relaxed truncate max-w-[60%] ${
                highlight
                    ? 'text-sm font-bold text-white'
                    : mono
                        ? 'text-[11px] font-mono text-white/60'
                        : 'text-[11px] text-white/60'
            }`}>
                {value ?? '—'}
            </span>
        </div>
    );
});

const Divider = () => <div className="h-px bg-white/[0.04]" />;

function HistoryItem({ booking }) {
    const status = statusConfig[booking.status] || statusConfig.pending;
    return (
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
            <div className="min-w-0">
                <p className="text-[11px] text-white/70 truncate">{booking.serviceName}</p>
                <p className="text-[9px] text-white/30 mt-0.5">
                    {format(new Date(booking.bookingDate), 'dd MMM yyyy')}
                </p>
            </div>
            <div className="text-right shrink-0 ml-3">
                <span className={`text-[9px] px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                    {status.label}
                </span>
                <p className="text-[9px] text-white/30 mt-1 font-mono">
                    ₹{booking.price?.toLocaleString('en-IN')}
                </p>
            </div>
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function BookingDetailModal({ booking, customerHistory, onClose, onUpdateStatus, onStatusChange }) {
    const [actionLoading, setActionLoading] = useState(null);
    const [showCancelInput, setShowCancelInput] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const status = statusConfig[booking.status] || statusConfig.pending;
    const canUpdate = !['completed', 'cancelled'].includes(booking.status);
    const quickActions = getQuickActions(booking.status);

    const customerName = booking.customerId
        ? typeof booking.customerId === 'object'
            ? `${booking.customerId.firstName} ${booking.customerId.lastName}`
            : 'Online Customer'
        : booking.walkInCustomer?.name || 'Walk-in Customer';

    const customerEmail = booking.customerId && typeof booking.customerId === 'object'
        ? booking.customerId.email : null;

    const customerPhone = booking.customerId && typeof booking.customerId === 'object'
        ? booking.customerId.phone : booking.walkInCustomer?.phone;

    const handleQuickAction = useCallback(async (action) => {
        if (action.needsReason) {
            setShowCancelInput(true);
            return;
        }
        try {
            setActionLoading(action.status);
            await adminService.updateBookingStatus(booking._id, action.status);
            const messages = {
                completed: 'Booking completed!',
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

    const handleCancel = useCallback(async () => {
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

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-2 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[460px] sm:max-h-[85vh] bg-neutral-950 rounded-2xl overflow-hidden z-50 flex flex-col border border-white/[0.08]">

                {/* Header */}
                <div className="shrink-0 px-4 pt-4 pb-3">
                    <div className="flex items-start justify-between mb-3">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[11px] text-white/50 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-lg">
                                    {booking.bookingCode}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ring-1 ${status.bg} ${status.text} ${status.ring}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                    {status.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-white/[0.06] bg-white/[0.03] text-[10px] text-white/40">
                                    {booking.bookingType === 'walkin' ? 'Walk-in' : 'Online'}
                                </span>
                                {booking.serviceTier && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/[0.06] bg-white/[0.03] text-[10px] text-white/40">
                                        <Tag className="w-2.5 h-2.5" />
                                        {booking.serviceTier}
                                    </span>
                                )}
                                {booking.isAdminSlot && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-purple-500/20 bg-purple-500/10 text-[10px] text-purple-400">
                                        <Zap className="w-2.5 h-2.5" />
                                        Admin Slot
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center transition-colors shrink-0"
                        >
                            <X className="w-3.5 h-3.5 text-white/40" />
                        </button>
                    </div>

                    {/* Quick Actions */}
                    {canUpdate && quickActions.length > 0 && (
                        <div className="mt-2">
                            {!showCancelInput ? (
                                <div className="flex gap-2">
                                    {quickActions.map((action) => {
                                        const Icon = action.icon;
                                        const variants = {
                                            primary: 'bg-white text-black hover:bg-white/90',
                                            success: 'bg-emerald-500 text-white hover:bg-emerald-600',
                                            danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20',
                                        };
                                        return (
                                            <button
                                                key={action.status}
                                                onClick={() => handleQuickAction(action)}
                                                disabled={actionLoading !== null}
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${variants[action.variant]}`}
                                            >
                                                {actionLoading === action.status ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Icon className="w-3.5 h-3.5" />
                                                )}
                                                {action.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <textarea
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        placeholder="Reason for cancellation..."
                                        rows={2}
                                        className="w-full bg-red-500/[0.05] border border-red-500/20 text-white text-xs placeholder-red-400/30 px-3 py-2.5 rounded-lg resize-none focus:outline-none focus:border-red-500/40 transition-all"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setShowCancelInput(false); setCancelReason(''); }}
                                            className="flex-1 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.03] text-xs text-white/40 hover:text-white/60 transition-all"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            disabled={actionLoading === 'cancelled'}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-xs font-medium text-white transition-all disabled:opacity-50 active:scale-[0.98]"
                                        >
                                            {actionLoading === 'cancelled' ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <XCircle className="w-3.5 h-3.5" />
                                            )}
                                            Confirm Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="h-px bg-white/[0.06] mx-4" />

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-4">

                    {/* Customer */}
                    <Section icon={User} title="Customer">
                        <InfoRow label="Name" value={customerName} />
                        {customerEmail && <InfoRow label="Email" value={customerEmail} mono />}
                        {customerPhone && <InfoRow label="Phone" value={customerPhone} mono />}
                    </Section>

                    <Divider />

                    {/* Service */}
                    <Section icon={Package} title="Service">
                        <InfoRow label="Category" value={booking.categoryName} />
                        <InfoRow label="Service" value={booking.serviceName} />
                        {booking.variantName && <InfoRow label="Variant" value={booking.variantName} />}
                        <InfoRow label="Duration" value={`${booking.duration} min`} />
                        <InfoRow label="Amount" value={`₹${booking.price?.toLocaleString('en-IN')}`} highlight />
                    </Section>

                    <Divider />

                    {/* Schedule */}
                    <Section icon={Calendar} title="Schedule">
                        <InfoRow label="Date" value={format(new Date(booking.bookingDate), 'EEE, dd MMM yyyy')} />
                        <InfoRow label="Time" value={booking.timeSlot} mono />
                        {booking.isAdminSlot && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/[0.08] border border-purple-500/15 mt-1">
                                <span className="w-4 h-4 rounded-full bg-purple-500 text-white text-[8px] font-bold flex items-center justify-center shrink-0">A</span>
                                <span className="text-[10px] text-purple-400">Admin-only time slot</span>
                            </div>
                        )}
                    </Section>

                    <Divider />

                    {/* Location */}
                    <Section icon={MapPin} title="Location">
                        <InfoRow label="City" value={booking.location?.city} />
                        <InfoRow label="Address" value={booking.location?.address} />
                        {booking.location?.landmark && (
                            <InfoRow label="Landmark" value={booking.location.landmark} />
                        )}
                    </Section>

                    <Divider />

                    {/* Payment */}
                    <Section icon={CreditCard} title="Payment">
                        <InfoRow label="Method" value={booking.paymentMethod || 'Cash'} />
                        <InfoRow label="Status" value={booking.paymentStatus || 'Pending'} />
                    </Section>

                    {/* Special Notes */}
                    {booking.specialNotes && (
                        <>
                            <Divider />
                            <Section icon={FileText} title="Notes">
                                <p className="text-[11px] text-white/50 bg-white/[0.02] border border-white/[0.04] rounded-lg p-3 leading-relaxed">
                                    {booking.specialNotes}
                                </p>
                            </Section>
                        </>
                    )}

                    {/* Admin Notes */}
                    {booking.adminNotes && (
                        <>
                            <Divider />
                            <Section icon={FileText} title="Admin Notes" variant="purple">
                                <p className="text-[11px] text-purple-300/60 bg-purple-500/[0.04] border border-purple-500/10 rounded-lg p-3 leading-relaxed">
                                    {booking.adminNotes}
                                </p>
                            </Section>
                        </>
                    )}

                    {/* Completion Info */}
                    {booking.status === 'completed' && (
                        <>
                            <Divider />
                            <Section icon={CheckCircle} title="Completion" variant="success">
                                <div className="bg-emerald-500/[0.04] border border-emerald-500/10 rounded-lg p-3 space-y-1.5">
                                    {booking.completedAt && (
                                        <InfoRow
                                            label="Completed"
                                            value={format(new Date(booking.completedAt), 'dd MMM yyyy, hh:mm a')}
                                            mono
                                        />
                                    )}
                                    <InfoRow
                                        label="Revenue"
                                        value={`₹${booking.price?.toLocaleString('en-IN')}`}
                                        highlight
                                    />
                                </div>
                            </Section>
                        </>
                    )}

                    {/* Cancellation Info */}
                    {booking.status === 'cancelled' && (
                        <>
                            <Divider />
                            <Section icon={AlertTriangle} title="Cancellation" variant="danger">
                                <div className="bg-red-500/[0.04] border border-red-500/10 rounded-lg p-3 space-y-1.5">
                                    <InfoRow label="By" value={booking.cancelledBy} />
                                    <InfoRow label="Reason" value={booking.cancellationReason} />
                                    {booking.cancelledAt && (
                                        <InfoRow
                                            label="Date"
                                            value={format(new Date(booking.cancelledAt), 'dd MMM yyyy, hh:mm a')}
                                            mono
                                        />
                                    )}
                                </div>
                            </Section>
                        </>
                    )}

                    {/* Customer History */}
                    {customerHistory?.length > 0 && (
                        <>
                            <Divider />
                            <Section icon={History} title="Previous Bookings">
                                <div className="space-y-1.5">
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
                <div className="shrink-0 p-3 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] text-white/25 font-mono">
                            {booking.createdAt && format(new Date(booking.createdAt), 'dd MMM yyyy · hh:mm a')}
                        </p>
                        {canUpdate ? (
                            <button
                                onClick={onUpdateStatus}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.06] hover:bg-white/[0.04] text-[10px] text-white/40 hover:text-white/60 transition-all"
                            >
                                <RefreshCw className="w-3 h-3" />
                                More Options
                            </button>
                        ) : (
                            <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ring-1 ${status.bg} ${status.text} ${status.ring}`}>
                                {booking.status === 'completed' ? 'Completed' : 'Cancelled'}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}