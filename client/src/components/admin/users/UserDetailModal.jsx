// UserDetailModal.jsx
'use client';

import { format } from 'date-fns';
import { X, Mail, Calendar, ShieldCheck, ShieldOff, ChevronLeft } from 'lucide-react';

// ============================================
// HELPERS
// ============================================

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

// ============================================
// MAIN COMPONENT
// ============================================

export default function UserDetailModal({ user, onClose, onBlock, onUnblock, onRoleChange }) {
    const userData = user.user || user;
    const stats    = user.stats || {};

    const displayName = `${userData.firstName ?? ''} ${userData.lastName ?? ''}`.trim();
    const initials    = `${userData.firstName?.[0] ?? ''}${userData.lastName?.[0] ?? ''}`.toUpperCase();
    const isAdmin     = userData.role === 'admin';
    const isBlocked   = userData.isBlocked;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-2 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[460px] sm:max-h-[85vh] bg-neutral-950 rounded-2xl overflow-hidden z-50 flex flex-col border border-white/[0.08]">

                {/* Header */}
                <div className="shrink-0 px-4 pt-4 pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-white/60" />
                            </button>
                            <div>
                                <h2 className="text-sm font-semibold text-white">User Details</h2>
                                <p className="text-[10px] text-white/40 truncate max-w-[200px]">
                                    {displayName}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center transition-colors"
                        >
                            <X className="w-3.5 h-3.5 text-white/40" />
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/[0.06]" />

                {/* Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-4">

                    {/* Avatar + Identity */}
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <div className="w-14 h-14 rounded-xl bg-white/[0.06] border border-white/[0.08] overflow-hidden shrink-0 flex items-center justify-center">
                            {userData.avatar && userData.avatar !== 'default-avatar.jpg' ? (
                                <img
                                    src={userData.avatar}
                                    alt={displayName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-sm font-semibold text-white/40">
                                    {initials}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                            <p className="text-[10px] text-white/30 truncate mt-0.5">{userData.email}</p>
                            <div className="flex items-center gap-1.5 mt-2">
                                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md border capitalize ${
                                    isAdmin
                                        ? 'border-white/20 text-white/70 bg-white/[0.06]'
                                        : 'border-white/[0.06] text-white/30 bg-white/[0.02]'
                                }`}>
                                    {isAdmin ? 'Admin' : 'Customer'}
                                </span>
                                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md ${
                                    isBlocked
                                        ? 'bg-red-500/10 text-red-400'
                                        : 'bg-emerald-500/10 text-emerald-400'
                                }`}>
                                    {isBlocked ? 'Blocked' : 'Active'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                            Contact
                        </label>
                        <div className="space-y-1">
                            <InfoRow icon={Mail}     label="Email"      value={userData.email} mono />
                            <InfoRow icon={Calendar} label="Joined"     value={formatDate(userData.createdAt)} />
                            {userData.lastLogin && (
                                <InfoRow
                                    icon={Calendar}
                                    label="Last Login"
                                    value={formatDate(userData.lastLogin, 'dd MMM yyyy, hh:mm a')}
                                />
                            )}
                        </div>
                    </div>

                    {/* Activity Stats */}
                    {Object.keys(stats).length > 0 && (
                        <div>
                            <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                                Activity
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                <StatBox label="Bookings"  value={stats.totalBookings || 0} />
                                <StatBox label="Completed" value={stats.completedBookings || 0} />
                                <StatBox
                                    label="Spent"
                                    value={`₹${(stats.totalSpent || 0).toLocaleString('en-IN')}`}
                                />
                            </div>
                        </div>
                    )}

                    {/* Block Reason */}
                    {isBlocked && userData.blockedReason && (
                        <div className="p-3 rounded-xl bg-red-500/[0.04] border border-red-500/10">
                            <label className="text-[10px] text-red-400/60 font-medium mb-2 block uppercase tracking-wide">
                                Block Reason
                            </label>
                            <p className="text-[11px] text-white/40 leading-relaxed">
                                {userData.blockedReason}
                            </p>
                            {userData.blockedAt && (
                                <p className="text-[10px] text-white/20 mt-2">
                                    Blocked on {formatDate(userData.blockedAt)}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Summary */}
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] space-y-2">
                        <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wide">
                            Summary
                        </p>
                        <SummaryItem label="Name"   value={displayName} />
                        <SummaryItem label="Role"   value={isAdmin ? 'Admin' : 'Customer'} />
                        <SummaryItem label="Status" value={isBlocked ? 'Blocked' : 'Active'} />
                        <SummaryItem label="Email"  value={userData.email} />
                    </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 p-3 border-t border-white/[0.06]">
                    <div className="flex gap-2">
                        {/* Role toggle */}
                        <button
                            onClick={() => onRoleChange(isAdmin ? 'user' : 'admin')}
                            className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-[11px] font-medium text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                        >
                            {isAdmin ? (
                                <><ShieldOff className="w-3.5 h-3.5" /> Remove Admin</>
                            ) : (
                                <><ShieldCheck className="w-3.5 h-3.5" /> Make Admin</>
                            )}
                        </button>

                        {/* Block / Unblock */}
                        {isBlocked ? (
                            <button
                                onClick={onUnblock}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-white hover:bg-white/90 text-black text-xs font-semibold active:scale-[0.98] transition-all"
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Unblock User
                            </button>
                        ) : (
                            <button
                                onClick={onBlock}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15 text-xs font-semibold active:scale-[0.98] transition-all"
                            >
                                <ShieldOff className="w-3.5 h-3.5" />
                                Block User
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// ============================================
// INFO ROW
// ============================================

function InfoRow({ icon: Icon, label, value, mono }) {
    return (
        <div className="flex items-center justify-between gap-4 px-1 py-1.5">
            <div className="flex items-center gap-2 shrink-0">
                <Icon className="w-3 h-3 text-white/20" />
                <span className="text-[10px] text-white/30 w-16">{label}</span>
            </div>
            <span className={`text-right truncate ${
                mono
                    ? 'text-[10px] font-mono text-white/50'
                    : 'text-[11px] text-white/50'
            }`}>
                {value || '—'}
            </span>
        </div>
    );
}

// ============================================
// STAT BOX
// ============================================

function StatBox({ label, value }) {
    return (
        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-center">
            <p className="text-sm font-bold text-white tabular-nums">{value}</p>
            <p className="text-[9px] text-white/25 uppercase tracking-wide mt-0.5">{label}</p>
        </div>
    );
}

// ============================================
// SUMMARY ITEM
// ============================================

function SummaryItem({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-white/30 shrink-0">{label}</span>
            <span className="text-[11px] text-white/60 text-right truncate capitalize">
                {value || '—'}
            </span>
        </div>
    );
}