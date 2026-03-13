'use client';

import { format } from 'date-fns';
import {
    X, Mail, Calendar,
    ShieldCheck, ShieldOff, ChevronLeft
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

const sectionLabel = `text-[10px] text-white/25 uppercase tracking-widest font-medium mb-3 block`;

export default function UserDetailModal({
    user,
    onClose,
    onBlock,
    onUnblock,
    onRoleChange
}) {
    const userData = user.user || user;
    const stats = user.stats || {};

    return (
        <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 hidden sm:block" onClick={onClose} />

            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
                <div className="
                    pointer-events-auto
                    w-full sm:max-w-lg sm:max-h-[92vh]
                    h-full sm:h-auto
                    flex flex-col
                    bg-[#0a0a0a]
                    sm:rounded-xl
                    border-0 sm:border sm:border-white/[0.08]
                    shadow-2xl shadow-black/80
                    overflow-hidden
                ">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent shrink-0" />

                    {/* Header */}
                    <div className="shrink-0 flex items-center gap-3 px-4 py-4">
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.06] bg-white/[0.03] text-white/35 hover:text-white/70 transition-all duration-150"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-white/25 uppercase tracking-widest">User Details</p>
                            <p className="text-sm font-medium text-white/80 mt-0.5 truncate">
                                {userData.firstName} {userData.lastName}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.06] bg-white/[0.03] text-white/30 hover:text-white/70 transition-all duration-150"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="h-px bg-white/[0.05] shrink-0" />

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">

                        {/* Avatar & Basic Info */}
                        <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-full bg-white/[0.06] overflow-hidden shrink-0 border border-white/[0.08]">
                                {userData.avatar && userData.avatar !== 'default-avatar.jpg' ? (
                                    <img
                                        src={userData.avatar}
                                        alt={userData.firstName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-lg text-white/25 uppercase font-medium">
                                        {userData.firstName?.[0]}{userData.lastName?.[0]}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-white/85 font-medium">
                                    {userData.firstName} {userData.lastName}
                                </h3>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className={`
                                        text-[11px] border px-2.5 py-1 rounded-md capitalize font-medium
                                        ${userData.role === 'admin'
                                            ? 'border-white/25 text-white/80 bg-white/[0.05]'
                                            : 'border-white/[0.08] text-white/35 bg-white/[0.02]'
                                        }
                                    `}>
                                        {userData.role === 'user' ? 'Customer' : userData.role}
                                    </span>
                                    <span className={`
                                        text-[11px] px-2.5 py-1 rounded-md font-medium
                                        ${userData.isBlocked
                                            ? 'bg-white/[0.06] text-white/30'
                                            : 'bg-white text-black'
                                        }
                                    `}>
                                        {userData.isBlocked ? 'Blocked' : 'Active'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <label className={sectionLabel}>Contact</label>
                            <div className="space-y-3">
                                <InfoRow icon={Mail} label="Email" value={userData.email || '—'} />
                                <InfoRow icon={Calendar} label="Joined" value={formatDate(userData.createdAt)} />
                                {userData.lastLogin && (
                                    <InfoRow icon={Calendar} label="Last Login" value={formatDate(userData.lastLogin, 'dd MMM yyyy, hh:mm a')} />
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        {stats && Object.keys(stats).length > 0 && (
                            <div>
                                <label className={sectionLabel}>Activity</label>
                                <div className="grid grid-cols-3 gap-2.5">
                                    <StatBox label="Bookings" value={stats.totalBookings || 0} />
                                    <StatBox label="Completed" value={stats.completedBookings || 0} />
                                    <StatBox label="Spent" value={`₹${(stats.totalSpent || 0).toLocaleString('en-IN')}`} />
                                </div>
                            </div>
                        )}

                        {/* Block Reason */}
                        {userData.isBlocked && userData.blockedReason && (
                            <div className="p-3.5 rounded-lg border border-white/[0.07] bg-white/[0.02]">
                                <label className={sectionLabel}>Block Reason</label>
                                <p className="text-sm text-white/40 leading-relaxed">
                                    {userData.blockedReason}
                                </p>
                                {userData.blockedAt && (
                                    <p className="text-[11px] text-white/15 mt-2">
                                        Blocked on {formatDate(userData.blockedAt)}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 h-px bg-white/[0.05]" />
                    <div className="shrink-0 px-4 py-4 flex gap-2">
                        <button
                            onClick={onClose}
                            className="
                                hidden sm:flex items-center px-4 py-2.5 rounded-lg
                                border border-white/[0.08] bg-white/[0.03]
                                text-xs text-white/40 hover:text-white/70
                                hover:border-white/[0.14] hover:bg-white/[0.05]
                                transition-all duration-150
                            "
                        >
                            Close
                        </button>

                        {/* Role Change */}
                        {userData.role === 'user' ? (
                            <button
                                onClick={() => onRoleChange('admin')}
                                className="
                                    flex items-center gap-2 px-4 py-2.5 rounded-lg
                                    border border-white/[0.08] bg-white/[0.03]
                                    text-xs text-white/40 hover:text-white/70
                                    hover:border-white/[0.14] hover:bg-white/[0.05]
                                    transition-all duration-150
                                "
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Make Admin
                            </button>
                        ) : (
                            <button
                                onClick={() => onRoleChange('user')}
                                className="
                                    flex items-center gap-2 px-4 py-2.5 rounded-lg
                                    border border-white/[0.08] bg-white/[0.03]
                                    text-xs text-white/40 hover:text-white/70
                                    hover:border-white/[0.14] hover:bg-white/[0.05]
                                    transition-all duration-150
                                "
                            >
                                <ShieldOff className="w-3.5 h-3.5" />
                                Remove Admin
                            </button>
                        )}

                        {/* Block/Unblock */}
                        {userData.isBlocked ? (
                            <button
                                onClick={onUnblock}
                                className="
                                    flex-1 flex items-center justify-center gap-2
                                    py-2.5 rounded-lg
                                    bg-white text-black text-sm font-medium
                                    hover:bg-white/90 active:bg-white/80
                                    shadow-lg shadow-white/10
                                    transition-all duration-150
                                "
                            >
                                <ShieldCheck className="w-4 h-4" />
                                Unblock User
                            </button>
                        ) : (
                            <button
                                onClick={onBlock}
                                className="
                                    flex-1 flex items-center justify-center gap-2
                                    py-2.5 rounded-lg
                                    border border-white/[0.12] bg-white/[0.03]
                                    text-sm text-white/50 hover:text-white/80
                                    hover:border-white/20 hover:bg-white/[0.06]
                                    transition-all duration-150
                                "
                            >
                                <ShieldOff className="w-4 h-4" />
                                Block User
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-3 pl-1">
            <Icon className="w-3.5 h-3.5 text-white/15 shrink-0" />
            <div className="flex items-center gap-2">
                <p className="text-[11px] text-white/20 w-16">{label}</p>
                <p className="text-sm text-white/50">{value}</p>
            </div>
        </div>
    );
}

function StatBox({ label, value }) {
    return (
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-lg p-3 text-center">
            <p className="text-lg font-light text-white/80">{value}</p>
            <p className="text-[10px] text-white/25 uppercase tracking-widest mt-0.5">{label}</p>
        </div>
    );
}