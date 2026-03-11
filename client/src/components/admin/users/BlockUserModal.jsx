'use client';

import { useState } from 'react';
import { X, Loader2, ShieldOff } from 'lucide-react';

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
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
                    <div>
                        <p className="text-xs text-neutral-500 tracking-widest uppercase mb-1">
                            Block User
                        </p>
                        <h2 className="text-white font-light">
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

                    {/* Warning */}
                    <div className="border border-neutral-800 p-4 flex items-start gap-3">
                        <ShieldOff className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-white mb-1">
                                Are you sure you want to block this user?
                            </p>
                            <p className="text-xs text-neutral-500 leading-relaxed">
                                Blocked users cannot login, make bookings, or access their account.
                                This action can be reversed.
                            </p>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="space-y-2">
                        <DetailRow label="Name" value={`${user.firstName} ${user.lastName}`} />
                        <DetailRow label="Email" value={user.email} />
                        <DetailRow label="Role" value={user.role} />
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-xs text-neutral-500 tracking-widest uppercase mb-2">
                            Block Reason *
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter reason for blocking this user..."
                            rows={3}
                            className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 resize-none transition-colors"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-neutral-800 flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-neutral-800 text-neutral-400 hover:text-white text-xs tracking-widest uppercase py-3 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !reason.trim()}
                        className="flex-1 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed text-black text-xs tracking-widest uppercase py-3 transition-colors flex items-center justify-center gap-2"
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
        </div>
    );
}

function DetailRow({ label, value }) {
    return (
        <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-600">{label}</p>
            <p className="text-sm text-neutral-300 capitalize">{value}</p>
        </div>
    );
}