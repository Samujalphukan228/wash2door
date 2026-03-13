'use client';

import { format } from 'date-fns';
import {
    X, Mail, Calendar,
    ShieldCheck, ShieldOff
} from 'lucide-react';

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
    // Extract user data (backend returns { user, stats, ... })
    const userData = user.user || user;
    const stats = user.stats || {};

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
                            {userData.firstName} {userData.lastName}
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
                            {userData.avatar && userData.avatar !== 'default-avatar.jpg' ? (
                                <img
                                    src={userData.avatar}
                                    alt={userData.firstName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg text-neutral-500 uppercase">
                                    {userData.firstName?.[0]}{userData.lastName?.[0]}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-white font-medium">
                                {userData.firstName} {userData.lastName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs border px-2 py-0.5 capitalize ${
                                    userData.role === 'admin'
                                        ? 'border-neutral-400 text-white'
                                        : 'border-neutral-700 text-neutral-400'
                                }`}>
                                    {userData.role === 'user' ? 'Customer' : userData.role}
                                </span>
                                <span className={`text-xs px-2 py-0.5 ${
                                    userData.isBlocked
                                        ? 'bg-neutral-800 text-neutral-500'
                                        : 'bg-white text-black'
                                }`}>
                                    {userData.isBlocked ? 'Blocked' : 'Active'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3">
                        <p className="text-xs text-neutral-500 tracking-widest uppercase">
                            Contact
                        </p>
                        <InfoRow icon={Mail} label="Email" value={userData.email || '—'} />
                        <InfoRow
                            icon={Calendar}
                            label="Joined"
                            value={formatDate(userData.createdAt)}
                        />
                        {userData.lastLogin && (
                            <InfoRow
                                icon={Calendar}
                                label="Last Login"
                                value={formatDate(userData.lastLogin, 'dd MMM yyyy, hh:mm a')}
                            />
                        )}
                    </div>

                    {/* Stats from backend */}
                    {stats && Object.keys(stats).length > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                            <StatBox label="Bookings" value={stats.totalBookings || 0} />
                            <StatBox label="Completed" value={stats.completedBookings || 0} />
                            <StatBox
                                label="Spent"
                                value={`₹${(stats.totalSpent || 0).toLocaleString('en-IN')}`}
                            />
                        </div>
                    )}

                    {/* Block Reason */}
                    {userData.isBlocked && userData.blockedReason && (
                        <div className="border border-neutral-800 p-4">
                            <p className="text-xs text-neutral-500 tracking-widest uppercase mb-2">
                                Block Reason
                            </p>
                            <p className="text-sm text-neutral-400">
                                {userData.blockedReason}
                            </p>
                            {userData.blockedAt && (
                                <p className="text-xs text-neutral-600 mt-2">
                                    Blocked on {formatDate(userData.blockedAt)}
                                </p>
                            )}
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
                    {userData.role === 'user' ? (
                        <button
                            onClick={() => onRoleChange('admin')}
                            className="border border-neutral-800 text-neutral-400 hover:text-white text-xs tracking-widest uppercase px-4 py-2.5 transition-colors flex items-center gap-2"
                        >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Make Admin
                        </button>
                    ) : (
                        <button
                            onClick={() => onRoleChange('user')}
                            className="border border-neutral-800 text-neutral-400 hover:text-white text-xs tracking-widest uppercase px-4 py-2.5 transition-colors flex items-center gap-2"
                        >
                            <ShieldOff className="w-3.5 h-3.5" />
                            Remove Admin
                        </button>
                    )}

                    {/* Block/Unblock */}
                    {userData.isBlocked ? (
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