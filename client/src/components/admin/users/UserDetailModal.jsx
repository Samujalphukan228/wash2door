'use client';

import { format } from 'date-fns';
import {
    X, Mail, Phone, Calendar, MapPin,
    ShieldCheck, ShieldOff, Star, Car
} from 'lucide-react';
import Image from 'next/image';

const formatDate = (date, pattern = 'dd MMMM yyyy') => {
    try {
        if (!date) return '—';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '—';
        return format(d, pattern);
    } catch {
        return '—';
    }
};

export default function UserDetailModal({
    user,
    onClose,
    onBlock,
    onUnblock,
    onRoleChange
}) {
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-950 border border-neutral-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 sticky top-0 bg-neutral-950 z-10">
                    <div>
                        <p className="text-xs text-neutral-500 tracking-widest uppercase mb-1">
                            User Details
                        </p>
                        <h2 className="text-white text-lg font-light">
                            {user.firstName} {user.lastName}
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

                    {/* Avatar & Basic Info */}
                    <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-full bg-neutral-800 overflow-hidden shrink-0">
                            {user.avatar?.url ? (
                                <Image
                                    src={user.avatar.url}
                                    alt={user.firstName}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg text-neutral-500 uppercase">
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-white font-medium">
                                {user.firstName} {user.lastName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs border px-2 py-0.5 capitalize ${
                                    user.role === 'admin'
                                        ? 'border-neutral-400 text-white'
                                        : 'border-neutral-700 text-neutral-400'
                                }`}>
                                    {user.role}
                                </span>
                                <span className={`text-xs px-2 py-0.5 ${
                                    user.isBlocked
                                        ? 'bg-neutral-800 text-neutral-500'
                                        : 'bg-white text-black'
                                }`}>
                                    {user.isBlocked ? 'Blocked' : 'Active'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3">
                        <p className="text-xs text-neutral-500 tracking-widest uppercase">
                            Contact
                        </p>
                        <InfoRow icon={Mail} label="Email" value={user.email || '—'} />
                        <InfoRow icon={Phone} label="Phone" value={user.phone || '—'} />
                        <InfoRow
                            icon={Calendar}
                            label="Joined"
                            value={formatDate(user.createdAt)}
                        />
                        {user.lastLogin && (
                            <InfoRow
                                icon={Calendar}
                                label="Last Login"
                                value={formatDate(user.lastLogin, 'dd MMM yyyy, hh:mm a')}
                            />
                        )}
                    </div>

                    {/* Address */}
                    {user.addresses?.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-xs text-neutral-500 tracking-widest uppercase">
                                Addresses
                            </p>
                            {user.addresses.map((addr, i) => (
                                <div
                                    key={i}
                                    className="border border-neutral-800 p-3 space-y-1"
                                >
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-neutral-600" />
                                        <p className="text-sm text-neutral-300">
                                            {addr.address}
                                        </p>
                                    </div>
                                    <p className="text-xs text-neutral-500 pl-5">
                                        {[addr.city, addr.state, addr.zipCode]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </p>
                                    {addr.isDefault && (
                                        <span className="text-xs text-neutral-600 pl-5">
                                            Default
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Vehicles */}
                    {user.vehicles?.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-xs text-neutral-500 tracking-widest uppercase">
                                Vehicles
                            </p>
                            {user.vehicles.map((v, i) => (
                                <div
                                    key={i}
                                    className="border border-neutral-800 p-3 flex items-center gap-3"
                                >
                                    <Car className="w-4 h-4 text-neutral-600 shrink-0" />
                                    <div>
                                        <p className="text-sm text-neutral-300">
                                            {v.brand} {v.model}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            {v.type} · {v.color} · {v.plateNumber}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Stats */}
                    {(user.totalBookings !== undefined || user.totalReviews !== undefined) && (
                        <div className="grid grid-cols-3 gap-3">
                            <StatBox label="Bookings" value={user.totalBookings || 0} />
                            <StatBox label="Reviews" value={user.totalReviews || 0} />
                            <StatBox
                                label="Spent"
                                value={`₹${(user.totalSpent || 0).toLocaleString('en-IN')}`}
                            />
                        </div>
                    )}

                    {/* Block Reason */}
                    {user.isBlocked && user.blockReason && (
                        <div className="border border-neutral-800 p-4">
                            <p className="text-xs text-neutral-500 tracking-widest uppercase mb-2">
                                Block Reason
                            </p>
                            <p className="text-sm text-neutral-400">
                                {user.blockReason}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-neutral-800 flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="border border-neutral-800 text-neutral-400 hover:text-white text-xs tracking-widest uppercase px-4 py-2.5 transition-colors"
                    >
                        Close
                    </button>

                    {/* Role Change */}
                    {user.role === 'customer' ? (
                        <button
                            onClick={() => onRoleChange('admin')}
                            className="border border-neutral-800 text-neutral-400 hover:text-white text-xs tracking-widest uppercase px-4 py-2.5 transition-colors flex items-center gap-2"
                        >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Make Admin
                        </button>
                    ) : (
                        <button
                            onClick={() => onRoleChange('customer')}
                            className="border border-neutral-800 text-neutral-400 hover:text-white text-xs tracking-widest uppercase px-4 py-2.5 transition-colors flex items-center gap-2"
                        >
                            <ShieldOff className="w-3.5 h-3.5" />
                            Remove Admin
                        </button>
                    )}

                    {/* Block/Unblock */}
                    {user.isBlocked ? (
                        <button
                            onClick={onUnblock}
                            className="flex-1 bg-white hover:bg-neutral-200 text-black text-xs tracking-widest uppercase py-2.5 transition-colors flex items-center justify-center gap-2"
                        >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Unblock User
                        </button>
                    ) : (
                        <button
                            onClick={onBlock}
                            className="flex-1 border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 text-xs tracking-widest uppercase py-2.5 transition-colors flex items-center justify-center gap-2"
                        >
                            <ShieldOff className="w-3.5 h-3.5" />
                            Block User
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-3 pl-1">
            <Icon className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
            <div className="flex items-center gap-2">
                <p className="text-xs text-neutral-600 w-16">{label}</p>
                <p className="text-sm text-neutral-300">{value}</p>
            </div>
        </div>
    );
}

function StatBox({ label, value }) {
    return (
        <div className="bg-neutral-900 border border-neutral-800 p-3 text-center">
            <p className="text-lg font-light text-white">{value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
        </div>
    );
}