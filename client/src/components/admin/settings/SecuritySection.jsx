'use client';

import { useState } from 'react';
import { Loader2, Lock, Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';

export default function SecuritySection() {
    const [loading, setLoading] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const getPasswordStrength = (password) => {
        if (!password) return { score: 0, label: '', color: '' };

        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[@$!%*?&]/.test(password)) score++;

        const levels = [
            { label: '', color: '' },
            { label: 'Weak', color: 'bg-white/20' },
            { label: 'Fair', color: 'bg-white/40' },
            { label: 'Good', color: 'bg-white/60' },
            { label: 'Strong', color: 'bg-white/80' },
            { label: 'Very Strong', color: 'bg-white' }
        ];

        return { score, ...levels[score] };
    };

    const strength = getPasswordStrength(newPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentPassword) {
            toast.error('Current password is required');
            return;
        }

        if (newPassword.length < 8) {
            toast.error('New password must be at least 8 characters');
            return;
        }

        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(newPassword)) {
            toast.error('Password must contain uppercase, lowercase, number and special character (@$!%*?&)');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (currentPassword === newPassword) {
            toast.error('New password must be different');
            return;
        }

        try {
            setLoading(true);

            await axiosInstance.put('/auth/change-password', {
                currentPassword,
                newPassword,
                confirmNewPassword: confirmPassword
            });

            toast.success('Password changed successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            const data = error.response?.data;
            let message = data?.message || 'Failed to change password';

            if (data?.errors && Array.isArray(data.errors)) {
                message = data.errors.map(e => e.msg || e.message).join('. ') || message;
            }

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const canSubmit = currentPassword
        && newPassword.length >= 8
        && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(newPassword)
        && newPassword === confirmPassword
        && currentPassword !== newPassword;

    return (
        <div className="space-y-6">

            {/* ── Change Password ── */}
            <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Shield className="w-4 h-4 text-white/20" />
                    <p className="text-[10px] text-white/25 tracking-widest uppercase font-medium">
                        Change Password
                    </p>
                </div>

                <div className="space-y-5">
                    <PasswordInput
                        label="Current Password *"
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        placeholder="Enter current password"
                        show={showCurrent}
                        onToggle={() => setShowCurrent(!showCurrent)}
                    />

                    <div>
                        <PasswordInput
                            label="New Password *"
                            value={newPassword}
                            onChange={setNewPassword}
                            placeholder="Enter new password (min 8 chars)"
                            show={showNew}
                            onToggle={() => setShowNew(!showNew)}
                        />

                        {newPassword && (
                            <div className="mt-2.5 space-y-2">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                            key={level}
                                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                                level <= strength.score
                                                    ? strength.color
                                                    : 'bg-white/[0.06]'
                                            }`}
                                        />
                                    ))}
                                </div>
                                {strength.label && (
                                    <p className="text-[11px] text-white/40">
                                        {strength.label}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <PasswordInput
                            label="Confirm New Password *"
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            placeholder="Re-enter new password"
                            show={showConfirm}
                            onToggle={() => setShowConfirm(!showConfirm)}
                        />

                        {confirmPassword && (
                            <p className={`text-[11px] mt-2 ${
                                newPassword === confirmPassword
                                    ? 'text-white/50'
                                    : 'text-white/25'
                            }`}>
                                {newPassword === confirmPassword
                                    ? '✓ Passwords match'
                                    : '✗ Passwords do not match'
                                }
                            </p>
                        )}
                    </div>
                </div>

                {/* Requirements */}
                <div className="mt-6 p-4 rounded-lg border border-white/[0.07] bg-white/[0.02] space-y-2.5">
                    <p className="text-[10px] text-white/25 tracking-widest uppercase mb-2 font-medium">
                        Requirements
                    </p>
                    {[
                        { check: newPassword.length >= 8, text: 'At least 8 characters' },
                        { check: /[A-Z]/.test(newPassword), text: 'One uppercase letter (A-Z)' },
                        { check: /[a-z]/.test(newPassword), text: 'One lowercase letter (a-z)' },
                        { check: /\d/.test(newPassword), text: 'One number (0-9)' },
                        { check: /[@$!%*?&]/.test(newPassword), text: 'One special character (@$!%*?&)' }
                    ].map((req, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                                !newPassword
                                    ? 'bg-white/[0.06]'
                                    : req.check
                                    ? 'bg-white'
                                    : 'bg-white/20'
                            }`} />
                            <p className={`text-xs transition-colors duration-200 ${
                                !newPassword
                                    ? 'text-white/20'
                                    : req.check
                                    ? 'text-white/50'
                                    : 'text-white/25'
                            }`}>
                                {req.text}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/[0.05]">
                    <button
                        type="button"
                        onClick={() => {
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                        }}
                        className="
                            border border-white/[0.08] bg-white/[0.03]
                            text-white/40 hover:text-white/70
                            text-xs tracking-widest uppercase
                            px-4 py-2.5 rounded-lg
                            hover:border-white/[0.14] hover:bg-white/[0.05]
                            transition-all duration-150
                        "
                    >
                        Clear
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !canSubmit}
                        className="
                            flex-1 bg-white hover:bg-white/90
                            disabled:bg-white/10 disabled:text-white/20
                            disabled:cursor-not-allowed
                            text-black text-xs tracking-widest uppercase
                            py-2.5 rounded-lg
                            shadow-lg shadow-white/10
                            transition-all duration-150
                            flex items-center justify-center gap-2
                        "
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Changing...
                            </>
                        ) : (
                            'Change Password'
                        )}
                    </button>
                </div>
            </form>

            {/* ── Security Tips ── */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4 text-white/20" />
                    <p className="text-[10px] text-white/25 tracking-widest uppercase font-medium">
                        Security Tips
                    </p>
                </div>
                <div className="space-y-3">
                    {[
                        'Use a unique password not used on other sites',
                        'Never share your password with anyone',
                        'Change your password regularly (every 90 days)',
                        'Use special characters: @ $ ! % * ? &',
                        'Log out from shared or public computers'
                    ].map((tip, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                            <div className="w-1 h-1 bg-white/20 rounded-full mt-1.5 shrink-0" />
                            <p className="text-xs text-white/30 leading-relaxed">
                                {tip}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function PasswordInput({ label, value, onChange, placeholder, show, onToggle }) {
    return (
        <div>
            <label className="block text-[10px] text-white/25 mb-2 uppercase tracking-widest font-medium">
                {label}
            </label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="
                        w-full bg-white/[0.03] border border-white/[0.08]
                        text-white/80 placeholder-white/20
                        text-sm pl-10 pr-10 py-2.5 rounded-lg
                        focus:outline-none focus:border-white/20 focus:bg-white/[0.05]
                        transition-all duration-150
                    "
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                >
                    {show ? (
                        <EyeOff className="w-4 h-4" />
                    ) : (
                        <Eye className="w-4 h-4" />
                    )}
                </button>
            </div>
        </div>
    );
}