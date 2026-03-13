// src/components/admin/bookings/BookingDetailModal.jsx

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { 
    X, MapPin, Clock, CreditCard, User, Package, Tag, 
    RefreshCw, History, CheckCircle, XCircle, Play, Loader2 
} from 'lucide-react';
import adminService from '@/services/adminService';
import toast from 'react-hot-toast';

const statusConfig = {
    pending:       { bg: 'bg-yellow-500/10', text: 'text-yellow-400', ring: 'ring-yellow-500/20', dot: 'bg-yellow-400' },
    confirmed:     { bg: 'bg-blue-500/10',   text: 'text-blue-400',   ring: 'ring-blue-500/20',   dot: 'bg-blue-400'   },
    'in-progress': { bg: 'bg-purple-500/10', text: 'text-purple-400', ring: 'ring-purple-500/20', dot: 'bg-purple-400' },
    completed:     { bg: 'bg-green-500/10',  text: 'text-green-400',  ring: 'ring-green-500/20',  dot: 'bg-green-400'  },
    cancelled:     { bg: 'bg-red-500/10',    text: 'text-red-400',    ring: 'ring-red-500/20',    dot: 'bg-red-400'    }
};

// Quick actions based on current status
const getQuickActions = (currentStatus) => {
    switch (currentStatus) {
        case 'pending':
            return [
                { status: 'confirmed', label: 'Confirm', icon: CheckCircle, color: 'bg-blue-500 hover:bg-blue-600' },
                { status: 'cancelled', label: 'Cancel', icon: XCircle, color: 'bg-red-500/20 hover:bg-red-500/30 text-red-400', needsReason: true }
            ];
        case 'confirmed':
            return [
                { status: 'in-progress', label: 'Start Service', icon: Play, color: 'bg-purple-500 hover:bg-purple-600' },
                { status: 'cancelled', label: 'Cancel', icon: XCircle, color: 'bg-red-500/20 hover:bg-red-500/30 text-red-400', needsReason: true }
            ];
        case 'in-progress':
            return [
                { status: 'completed', label: 'Mark Completed', icon: CheckCircle, color: 'bg-green-500 hover:bg-green-600' },
                { status: 'cancelled', label: 'Cancel', icon: XCircle, color: 'bg-red-500/20 hover:bg-red-500/30 text-red-400', needsReason: true }
            ];
        default:
            return [];
    }
};

export default function BookingDetailModal({ booking, customerHistory, onClose, onUpdateStatus, onStatusChange }) {
    const [actionLoading, setActionLoading] = useState(null);
    const [showCancelInput, setShowCancelInput] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const status = statusConfig[booking.status] || statusConfig.pending;
    const canUpdate = !['completed', 'cancelled'].includes(booking.status);
    const quickActions = getQuickActions(booking.status);

    // Handle both populated and non-populated customer data
    const customerName = booking.customerId
        ? typeof booking.customerId === 'object'
            ? `${booking.customerId.firstName} ${booking.customerId.lastName}`
            : 'Online Customer'
        : booking.walkInCustomer?.name || 'Walk-in Customer';

    const customerEmail = booking.customerId && typeof booking.customerId === 'object'
        ? booking.customerId.email
        : null;

    const customerPhone = booking.customerId && typeof booking.customerId === 'object'
        ? booking.customerId.phone
        : booking.walkInCustomer?.phone;

    // Quick status update - prevent page reload
    const handleQuickAction = async (e, action) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();

        if (action.needsReason) {
            setShowCancelInput(true);
            return;
        }

        try {
            setActionLoading(action.status);
            await adminService.updateBookingStatus(booking._id, action.status);
            
            if (action.status === 'completed') {
                toast.success('Booking completed! Revenue added.');
            } else {
                toast.success(`Booking ${action.status}`);
            }
            
            // Trigger refresh without page reload
            if (onStatusChange) {
                onStatusChange();
            }
            onClose();
        } catch (error) {
            console.error('Quick action error:', error);
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setActionLoading(null);
        }
    };

    // Handle cancel with reason - prevent page reload
    const handleCancel = async (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();

        if (!cancelReason.trim()) {
            toast.error('Please provide a reason for cancellation');
            return;
        }

        try {
            setActionLoading('cancelled');
            await adminService.updateBookingStatus(booking._id, 'cancelled', cancelReason);
            toast.success('Booking cancelled');
            
            if (onStatusChange) {
                onStatusChange();
            }
            onClose();
        } catch (error) {
            console.error('Cancel error:', error);
            toast.error(error.response?.data?.message || 'Failed to cancel booking');
        } finally {
            setActionLoading(null);
            setShowCancelInput(false);
        }
    };

    const handleClose = (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        onClose();
    };

    const handleUpdateStatusClick = (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        onUpdateStatus();
    };

    const handleBackFromCancel = (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        setShowCancelInput(false);
        setCancelReason('');
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                onClick={handleClose}
            />

            {/* Panel */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div 
                    className="
                        pointer-events-auto
                        w-full max-w-lg max-h-[90vh]
                        flex flex-col
                        rounded-xl
                        border border-white/[0.08]
                        bg-[#0a0a0a]
                        shadow-2xl shadow-black/80
                        overflow-hidden
                    "
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Top gradient line */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent shrink-0" />

                    {/* Header */}
                    <div className="flex items-start justify-between px-5 py-4 shrink-0">
                        <div className="space-y-2">
                            {/* Code pill */}
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-white/40 bg-white/[0.04] border border-white/[0.07] px-2.5 py-1 rounded-md">
                                    {booking.bookingCode}
                                </span>
                                <span className={`
                                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                    text-[11px] font-medium ring-1
                                    ${status.bg} ${status.text} ${status.ring}
                                `}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                    <span className="capitalize">{booking.status}</span>
                                </span>
                            </div>

                            {/* Sub badges */}
                            <div className="flex items-center gap-1.5">
                                <Badge>
                                    {booking.bookingType === 'walkin' ? 'Walk-in' : 'Online'}
                                </Badge>
                                {booking.serviceTier && (
                                    <Badge>
                                        <Tag className="w-2.5 h-2.5 opacity-50" />
                                        {booking.serviceTier}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleClose}
                            className="
                                w-8 h-8 rounded-lg flex items-center justify-center
                                text-white/30 hover:text-white/70
                                border border-white/[0.06] hover:border-white/[0.12]
                                bg-white/[0.02] hover:bg-white/[0.06]
                                transition-all duration-150
                            "
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Quick Actions */}
                    {canUpdate && quickActions.length > 0 && (
                        <div className="px-5 pb-4 shrink-0">
                            {!showCancelInput ? (
                                <div className="flex gap-2">
                                    {quickActions.map((action) => (
                                        <button
                                            key={action.status}
                                            type="button"
                                            onClick={(e) => handleQuickAction(e, action)}
                                            disabled={actionLoading !== null}
                                            className={`
                                                flex-1 flex items-center justify-center gap-2
                                                px-4 py-2.5 rounded-lg
                                                text-xs font-medium text-white
                                                transition-all duration-150
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                ${action.color}
                                            `}
                                        >
                                            {actionLoading === action.status ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <action.icon className="w-4 h-4" />
                                            )}
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <textarea
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        placeholder="Reason for cancellation..."
                                        rows={2}
                                        className="
                                            w-full bg-white/[0.03] border border-white/[0.08]
                                            text-white/80 text-sm placeholder-white/20
                                            px-3 py-2.5 rounded-lg resize-none
                                            focus:outline-none focus:border-white/20
                                        "
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleBackFromCancel}
                                            className="
                                                flex-1 px-4 py-2 rounded-lg
                                                border border-white/[0.08] bg-white/[0.03]
                                                text-xs text-white/50 hover:text-white/80
                                                transition-all duration-150
                                            "
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            disabled={actionLoading === 'cancelled'}
                                            className="
                                                flex-1 flex items-center justify-center gap-2
                                                px-4 py-2 rounded-lg
                                                bg-red-500 hover:bg-red-600
                                                text-xs font-medium text-white
                                                transition-all duration-150
                                                disabled:opacity-50
                                            "
                                        >
                                            {actionLoading === 'cancelled' ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <XCircle className="w-4 h-4" />
                                            )}
                                            Confirm Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Divider */}
                    <div className="h-px bg-white/[0.05] mx-5" />

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin scrollbar-thumb-white/10">

                        {/* Customer */}
                        <Section icon={User} title="Customer">
                            <Row label="Name" value={customerName} />
                            {customerEmail && (
                                <Row label="Email" value={customerEmail} mono />
                            )}
                            {customerPhone && (
                                <Row label="Phone" value={customerPhone} mono />
                            )}
                        </Section>

                        <Divider />

                        {/* Service */}
                        <Section icon={Package} title="Service">
                            <Row label="Category" value={booking.categoryName} />
                            <Row label="Service" value={booking.serviceName} />
                            {booking.variantName && (
                                <Row label="Variant" value={booking.variantName} />
                            )}
                            <Row label="Duration" value={`${booking.duration} min`} />
                            <Row
                                label="Amount"
                                value={`₹${booking.price?.toLocaleString('en-IN')}`}
                                highlight
                            />
                        </Section>

                        <Divider />

                        {/* Schedule */}
                        <Section icon={Clock} title="Schedule">
                            <Row
                                label="Date"
                                value={format(new Date(booking.bookingDate), 'EEE, dd MMM yyyy')}
                            />
                            <Row label="Time" value={booking.timeSlot} mono />
                        </Section>

                        <Divider />

                        {/* Location */}
                        <Section icon={MapPin} title="Location">
                            <Row label="City" value={booking.location?.city || '—'} />
                            <Row label="Address" value={booking.location?.address || '—'} />
                            {booking.location?.landmark && (
                                <Row label="Landmark" value={booking.location.landmark} />
                            )}
                        </Section>

                        <Divider />

                        {/* Payment */}
                        <Section icon={CreditCard} title="Payment">
                            <Row label="Method" value={booking.paymentMethod || 'Cash'} />
                            <Row label="Status" value={booking.paymentStatus || 'Pending'} />
                        </Section>

                        {/* Special Notes */}
                        {booking.specialNotes && (
                            <>
                                <Divider />
                                <div className="space-y-2">
                                    <p className="text-[10px] text-white/25 uppercase tracking-widest font-medium">
                                        Special Notes
                                    </p>
                                    <p className="text-xs text-white/50 bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 leading-relaxed">
                                        {booking.specialNotes}
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Completed Info */}
                        {booking.status === 'completed' && (
                            <>
                                <Divider />
                                <div className="space-y-2">
                                    <p className="text-[10px] text-green-400/60 uppercase tracking-widest font-medium">
                                        Completion
                                    </p>
                                    <div className="bg-green-500/[0.05] border border-green-500/[0.12] rounded-lg p-3 space-y-2">
                                        {booking.completedAt && (
                                            <Row
                                                label="Completed At"
                                                value={format(new Date(booking.completedAt), 'dd MMM yyyy, hh:mm a')}
                                                mono
                                            />
                                        )}
                                        <Row
                                            label="Revenue"
                                            value={`₹${booking.price?.toLocaleString('en-IN')}`}
                                            highlight
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Cancellation */}
                        {booking.status === 'cancelled' && (
                            <>
                                <Divider />
                                <div className="space-y-2">
                                    <p className="text-[10px] text-red-400/60 uppercase tracking-widest font-medium">
                                        Cancellation
                                    </p>
                                    <div className="bg-red-500/[0.05] border border-red-500/[0.12] rounded-lg p-3 space-y-2">
                                        <Row label="Cancelled By" value={booking.cancelledBy || '—'} />
                                        <Row label="Reason" value={booking.cancellationReason || '—'} />
                                        {booking.cancelledAt && (
                                            <Row
                                                label="Cancelled At"
                                                value={format(new Date(booking.cancelledAt), 'dd MMM yyyy, hh:mm a')}
                                                mono
                                            />
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Customer History */}
                        {customerHistory && customerHistory.length > 0 && (
                            <>
                                <Divider />
                                <Section icon={History} title="Previous Bookings">
                                    <div className="space-y-2">
                                        {customerHistory.map((hist) => (
                                            <div
                                                key={hist._id}
                                                className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]"
                                            >
                                                <div>
                                                    <p className="text-xs text-white/60">{hist.serviceName}</p>
                                                    <p className="text-[10px] text-white/30 mt-0.5">
                                                        {format(new Date(hist.bookingDate), 'dd MMM yyyy')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`
                                                        text-[10px] px-2 py-0.5 rounded-full
                                                        ${statusConfig[hist.status]?.bg || ''}
                                                        ${statusConfig[hist.status]?.text || 'text-white/40'}
                                                    `}>
                                                        {hist.status}
                                                    </span>
                                                    <p className="text-[10px] text-white/40 mt-1 font-mono">
                                                        ₹{hist.price?.toLocaleString('en-IN')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Section>
                            </>
                        )}

                        {/* Bottom spacer */}
                        <div className="h-1" />
                    </div>

                    {/* Footer */}
                    <div className="shrink-0">
                        <div className="h-px bg-white/[0.05]" />
                        <div className="flex items-center justify-between px-5 py-3.5">
                            <p className="text-[11px] text-white/20 font-mono">
                                {booking.createdAt && format(new Date(booking.createdAt), 'dd MMM yyyy · hh:mm a')}
                            </p>

                            {canUpdate ? (
                                <button
                                    type="button"
                                    onClick={handleUpdateStatusClick}
                                    className="
                                        group relative flex items-center gap-2
                                        px-4 py-2 rounded-lg
                                        border border-white/[0.08] bg-white/[0.03]
                                        text-xs text-white/50 hover:text-white/80
                                        hover:bg-white/[0.06] hover:border-white/[0.12]
                                        transition-all duration-150
                                    "
                                >
                                    <RefreshCw className="w-3 h-3" />
                                    <span>More Options</span>
                                </button>
                            ) : (
                                <span className={`
                                    text-[11px] font-medium px-3 py-1.5 rounded-full ring-1
                                    ${status.bg} ${status.text} ${status.ring}
                                `}>
                                    {booking.status === 'completed' ? 'Booking completed' : 'Booking cancelled'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

/* ── Sub-components ── */

function Section({ icon: Icon, title, children }) {
    return (
        <div className="space-y-2.5">
            <div className="flex items-center gap-1.5">
                <Icon className="w-3 h-3 text-white/20" />
                <p className="text-[10px] text-white/25 uppercase tracking-widest font-medium">
                    {title}
                </p>
            </div>
            <div className="space-y-2">
                {children}
            </div>
        </div>
    );
}

function Row({ label, value, highlight, mono }) {
    return (
        <div className="flex items-start justify-between gap-6">
            <p className="text-xs text-white/25 shrink-0 pt-px">{label}</p>
            <p className={`text-xs text-right leading-relaxed ${
                highlight
                    ? 'text-white font-semibold text-sm'
                    : mono
                    ? 'font-mono text-white/55'
                    : 'text-white/55'
            }`}>
                {value ?? '—'}
            </p>
        </div>
    );
}

function Badge({ children }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/[0.07] bg-white/[0.03] text-[10px] text-white/35 font-medium">
            {children}
        </span>
    );
}

function Divider() {
    return <div className="h-px bg-white/[0.04]" />;
}