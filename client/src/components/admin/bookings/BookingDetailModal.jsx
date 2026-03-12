'use client';

import { format } from 'date-fns';
import { X, MapPin, Clock, CreditCard, User, Package, Tag, ArrowUpRight, RefreshCw } from 'lucide-react';

const statusConfig = {
    pending:       { bg: 'bg-yellow-500/10', text: 'text-yellow-400', ring: 'ring-yellow-500/20', dot: 'bg-yellow-400' },
    confirmed:     { bg: 'bg-blue-500/10',   text: 'text-blue-400',   ring: 'ring-blue-500/20',   dot: 'bg-blue-400'   },
    'in-progress': { bg: 'bg-purple-500/10', text: 'text-purple-400', ring: 'ring-purple-500/20', dot: 'bg-purple-400' },
    completed:     { bg: 'bg-green-500/10',  text: 'text-green-400',  ring: 'ring-green-500/20',  dot: 'bg-green-400'  },
    cancelled:     { bg: 'bg-red-500/10',    text: 'text-red-400',    ring: 'ring-red-500/20',    dot: 'bg-red-400'    }
};

export default function BookingDetailModal({ booking, onClose, onUpdateStatus }) {
    const status = statusConfig[booking.status] || statusConfig.pending;
    const canUpdate = !['completed', 'cancelled'].includes(booking.status);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="
                    pointer-events-auto
                    w-full max-w-lg max-h-[90vh]
                    flex flex-col
                    rounded-xl
                    border border-white/[0.08]
                    bg-[#0a0a0a]
                    shadow-2xl shadow-black/80
                    overflow-hidden
                ">
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
                            onClick={onClose}
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

                    {/* Divider */}
                    <div className="h-px bg-white/[0.05] mx-5" />

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin scrollbar-thumb-white/10">

                        {/* Customer */}
                        <Section icon={User} title="Customer">
                            {booking.customerId ? (
                                <>
                                    <Row label="Name"  value={`${booking.customerId.firstName} ${booking.customerId.lastName}`} />
                                    <Row label="Email" value={booking.customerId.email} mono />
                                </>
                            ) : (
                                <>
                                    <Row label="Name"  value={booking.walkInCustomer?.name  || '—'} />
                                    <Row label="Phone" value={booking.walkInCustomer?.phone || '—'} mono />
                                </>
                            )}
                        </Section>

                        <Divider />

                        {/* Service */}
                        <Section icon={Package} title="Service">
                            <Row label="Category" value={booking.categoryName} />
                            <Row label="Service"  value={booking.serviceName} />
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
                            <Row label="City"    value={booking.location?.city    || '—'} />
                            <Row label="Address" value={booking.location?.address || '—'} />
                            {booking.location?.landmark && (
                                <Row label="Landmark" value={booking.location.landmark} />
                            )}
                        </Section>

                        <Divider />

                        {/* Payment */}
                        <Section icon={CreditCard} title="Payment">
                            <Row label="Method" value={booking.paymentMethod} />
                            <Row label="Status" value={booking.paymentStatus} />
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
                                        <Row label="Reason"       value={booking.cancellationReason || '—'} />
                                    </div>
                                </div>
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
                                {format(new Date(booking.createdAt), 'dd MMM yyyy · hh:mm a')}
                            </p>

                            {canUpdate ? (
                                <button
                                    onClick={onUpdateStatus}
                                    className="
                                        group relative flex items-center gap-2
                                        px-4 py-2 rounded-lg
                                        bg-white text-black text-xs font-medium
                                        hover:bg-white/90 active:bg-white/80
                                        shadow-lg shadow-white/10
                                        transition-all duration-150
                                        overflow-hidden
                                    "
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                    <RefreshCw className="w-3 h-3 relative" />
                                    <span className="relative">Update Status</span>
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