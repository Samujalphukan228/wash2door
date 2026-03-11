'use client';

import { format } from 'date-fns';
import { X, MapPin, Car, Clock, CreditCard, User } from 'lucide-react';

const statusStyles = {
    pending:      'text-neutral-400 border-neutral-700',
    confirmed:    'text-white border-neutral-400',
    'in-progress':'text-white border-neutral-400',
    completed:    'text-white border-neutral-400',
    cancelled:    'text-neutral-600 border-neutral-800'
};

export default function BookingDetailModal({ booking, onClose, onUpdateStatus }) {
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-950 border border-neutral-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 sticky top-0 bg-neutral-950">
                    <div>
                        <p className="text-xs text-neutral-500 tracking-widest uppercase mb-1">
                            Booking Details
                        </p>
                        <h2 className="text-white font-mono text-lg">
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

                    {/* Status + Type */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className={`text-xs border px-3 py-1 capitalize ${statusStyles[booking.status]}`}>
                            {booking.status}
                        </span>
                        <span className="text-xs border border-neutral-800 text-neutral-500 px-3 py-1 capitalize">
                            {booking.bookingType === 'walkin' ? 'Walk-in' : 'Online'}
                        </span>
                        <span className="text-xs border border-neutral-800 text-neutral-500 px-3 py-1 capitalize">
                            {booking.serviceCategory}
                        </span>
                    </div>

                    {/* Customer */}
                    <Section icon={User} title="Customer">
                        {booking.customerId ? (
                            <>
                                <Row label="Name" value={`${booking.customerId.firstName} ${booking.customerId.lastName}`} />
                                <Row label="Email" value={booking.customerId.email} />
                            </>
                        ) : (
                            <>
                                <Row label="Name" value={booking.walkInCustomer?.name || '—'} />
                                <Row label="Phone" value={booking.walkInCustomer?.phone || '—'} />
                                <Row label="Email" value={booking.walkInCustomer?.email || '—'} />
                            </>
                        )}
                    </Section>

                    {/* Service */}
                    <Section icon={Car} title="Service">
                        <Row label="Service" value={booking.serviceName} />
                        <Row label="Vehicle Type" value={booking.vehicleTypeName} />
                        <Row label="Duration" value={`${booking.duration} minutes`} />
                        <Row
                            label="Amount"
                            value={`₹${booking.price?.toLocaleString('en-IN')}`}
                            highlight
                        />
                    </Section>

                    {/* Schedule */}
                    <Section icon={Clock} title="Schedule">
                        <Row
                            label="Date"
                            value={format(new Date(booking.bookingDate), 'EEEE, dd MMMM yyyy')}
                        />
                        <Row label="Time Slot" value={booking.timeSlot} mono />
                    </Section>

                    {/* Location */}
                    <Section icon={MapPin} title="Location">
                        <Row label="Address" value={booking.location?.address || '—'} />
                        <Row label="City" value={booking.location?.city || '—'} />
                        {booking.location?.state && (
                            <Row label="State" value={booking.location.state} />
                        )}
                        {booking.location?.landmark && (
                            <Row label="Landmark" value={booking.location.landmark} />
                        )}
                    </Section>

                    {/* Vehicle */}
                    <Section icon={Car} title="Vehicle Details">
                        <Row label="Brand" value={booking.vehicleDetails?.brand || '—'} />
                        <Row label="Model" value={booking.vehicleDetails?.model || '—'} />
                        <Row label="Color" value={booking.vehicleDetails?.color || '—'} />
                        <Row label="Plate" value={booking.vehicleDetails?.plateNumber || '—'} mono />
                    </Section>

                    {/* Payment */}
                    <Section icon={CreditCard} title="Payment">
                        <Row label="Method" value={booking.paymentMethod} />
                        <Row label="Status" value={booking.paymentStatus} />
                    </Section>

                    {/* Special Notes */}
                    {booking.specialNotes && (
                        <div>
                            <p className="text-xs text-neutral-500 tracking-widest uppercase mb-2">
                                Special Notes
                            </p>
                            <p className="text-sm text-neutral-400 bg-neutral-900 border border-neutral-800 p-3">
                                {booking.specialNotes}
                            </p>
                        </div>
                    )}

                    {/* Cancellation */}
                    {booking.status === 'cancelled' && (
                        <div className="border border-neutral-800 p-4">
                            <p className="text-xs text-neutral-500 tracking-widest uppercase mb-2">
                                Cancellation
                            </p>
                            <Row label="By" value={booking.cancelledBy || '—'} />
                            <Row label="Reason" value={booking.cancellationReason || '—'} />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-between">
                    <p className="text-xs text-neutral-600">
                        Created {format(new Date(booking.createdAt), 'dd MMM yyyy, hh:mm a')}
                    </p>
                    {booking.status !== 'completed' &&
                     booking.status !== 'cancelled' && (
                        <button
                            onClick={onUpdateStatus}
                            className="bg-white hover:bg-neutral-200 text-black text-xs tracking-[0.15em] uppercase px-4 py-2 transition-colors"
                        >
                            Update Status
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function Section({ icon: Icon, title, children }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <Icon className="w-3.5 h-3.5 text-neutral-600" />
                <p className="text-xs text-neutral-500 tracking-widest uppercase">
                    {title}
                </p>
            </div>
            <div className="space-y-2 pl-5">
                {children}
            </div>
        </div>
    );
}

function Row({ label, value, highlight, mono }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <p className="text-xs text-neutral-600 shrink-0">{label}</p>
            <p className={`text-sm text-right ${
                highlight
                    ? 'text-white font-medium'
                    : mono
                    ? 'font-mono text-neutral-300'
                    : 'text-neutral-300'
            }`}>
                {value}
            </p>
        </div>
    );
}