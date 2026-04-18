// BlockUserModal.jsx
'use client';

import { useState } from 'react';
import { X, Loader2, ShieldOff, ChevronLeft } from 'lucide-react';

// ============================================
// MAIN COMPONENT
// ============================================

export default function BlockUserModal({ user, onClose, onBlock }) {
    const [reason, setReason]   = useState('');
    const [loading, setLoading] = useState(false);

    const displayName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();

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
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-2 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[420px] sm:max-h-[85vh] bg-neutral-950 rounded-2xl overflow-hidden z-50 flex flex-col border border-white/[0.08]">

                {/* Header */}
                <div className="shrink-0 px-4 pt-4 pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-white/60" />
                            </button>
                            <div>
                                <h2 className="text-sm font-semibold text-white">Block User</h2>
                                <p className="text-[10px] text-white/40 truncate max-w-[200px]">
                                    {displayName}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={loading}
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

                    {/* Warning */}
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/[0.05] border border-red-500/10">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                            <ShieldOff className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-white/70 mb-1">
                                Block this user?
                            </p>
                            <p className="text-[10px] text-white/30 leading-relaxed">
                                Blocked users cannot login, make bookings, or access their account.
                                This action can be reversed.
                            </p>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                        <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wide">
                            User
                        </p>
                        <SummaryItem label="Name"  value={displayName} />
                        <SummaryItem label="Email" value={user.email} />
                        <SummaryItem label="Role"  value={user.role === 'user' ? 'Customer' : user.role} />
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                            Block Reason <span className="text-white/20">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter reason for blocking this user..."
                            rows={3}
                            disabled={loading}
                            className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/25 resize-none focus:outline-none focus:border-white/20 disabled:opacity-50 transition-colors"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 p-3 border-t border-white/[0.06]">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !reason.trim()}
                        className="w-full py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Blocking...
                            </>
                        ) : (
                            <>
                                <ShieldOff className="w-3.5 h-3.5" />
                                Block User
                            </>
                        )}
                    </button>
                </div>
            </div>
        </>
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