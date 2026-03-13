'use client';

import { useState } from 'react';
import { X, Loader2, ShieldOff, ChevronLeft } from 'lucide-react';

const inputCls = `
    w-full bg-white/[0.03] border border-white/[0.08]
    text-white/80 text-sm placeholder-white/20
    px-3 py-2.5 rounded-lg
    focus:outline-none focus:border-white/20 focus:bg-white/[0.05]
    transition-all duration-150
`;

const sectionLabel = `text-[10px] text-white/25 uppercase tracking-widest font-medium mb-3 block`;

export default function BlockUserModal({ user, onClose, onBlock }) {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!reason.trim()) return;
        try {
            setLoading(true);
            await onBlock(user._id, reason);
        } catch {
            // handled in parent
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 hidden sm:block" onClick={onClose} />

            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
                <div className="
                    pointer-events-auto
                    w-full sm:max-w-md sm:max-h-[92vh]
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
                            <p className="text-[10px] text-white/25 uppercase tracking-widest">Block User</p>
                            <p className="text-sm font-medium text-white/80 mt-0.5 truncate">
                                {user.firstName} {user.lastName}
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

                        {/* Warning */}
                        <div className="p-3.5 rounded-lg border border-white/[0.07] bg-white/[0.02] flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0 mt-0.5">
                                <ShieldOff className="w-4 h-4 text-white/35" />
                            </div>
                            <div>
                                <p className="text-sm text-white/70 font-medium mb-1">
                                    Are you sure you want to block this user?
                                </p>
                                <p className="text-[11px] text-white/30 leading-relaxed">
                                    Blocked users cannot login, make bookings, or access their account.
                                    This action can be reversed.
                                </p>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="p-3.5 rounded-lg border border-white/[0.07] bg-white/[0.02] space-y-2.5">
                            <DetailRow label="Name" value={`${user.firstName} ${user.lastName}`} />
                            <DetailRow label="Email" value={user.email} />
                            <DetailRow label="Role" value={user.role === 'user' ? 'Customer' : user.role} />
                        </div>

                        {/* Reason */}
                        <div>
                            <label className={sectionLabel}>Block Reason *</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Enter reason for blocking this user..."
                                rows={3}
                                disabled={loading}
                                className={`${inputCls} resize-none`}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 h-px bg-white/[0.05]" />
                    <div className="shrink-0 px-4 py-4 flex gap-2">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="
                                flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg
                                border border-white/[0.08] bg-white/[0.03]
                                text-xs text-white/40 hover:text-white/70
                                hover:border-white/[0.14] hover:bg-white/[0.05]
                                transition-all duration-150
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !reason.trim()}
                            className="
                                flex-1 flex items-center justify-center gap-2
                                py-2.5 rounded-lg
                                bg-white text-black text-sm font-medium
                                hover:bg-white/90 active:bg-white/80
                                disabled:bg-white/10 disabled:text-white/20 disabled:cursor-not-allowed
                                shadow-lg shadow-white/10
                                transition-all duration-150
                            "
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Blocking…
                                </>
                            ) : (
                                <>
                                    <ShieldOff className="w-4 h-4" />
                                    Block User
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

function DetailRow({ label, value }) {
    return (
        <div className="flex items-center justify-between">
            <p className="text-[11px] text-white/20">{label}</p>
            <p className="text-sm text-white/50 capitalize">{value}</p>
        </div>
    );
}