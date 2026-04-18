'use client';

import { useState } from 'react';
import { Loader2, Lock, Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';

// ============================================
// PASSWORD STRENGTH
// ============================================

function getStrength(password) {
    if (!password) return { score: 0, label: '', width: 'w-0' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return { score, label: labels[score] || '' };
}

const REQUIREMENTS = [
    { test: (p) => p.length >= 8,                          text: 'At least 8 characters' },
    { test: (p) => /[A-Z]/.test(p),                        text: 'One uppercase letter (A-Z)' },
    { test: (p) => /[a-z]/.test(p),                        text: 'One lowercase letter (a-z)' },
    { test: (p) => /\d/.test(p),                           text: 'One number (0-9)' },
    { test: (p) => /[@$!%*?&]/.test(p),                    text: 'One special character (@$!%*?&)' },
];

const TIPS = [
    'Use a unique password not used on other sites',
    'Never share your password with anyone',
    'Change your password regularly (every 90 days)',
    'Use special characters: @ $ ! % * ? &',
    'Log out from shared or public computers',
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function SecuritySection() {
    const [loading, setLoading]             = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword]     = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent]     = useState(false);
    const [showNew, setShowNew]             = useState(false);
    const [showConfirm, setShowConfirm]     = useState(false);

    const strength = getStrength(newPassword);

    const isValid = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(newPassword);

    const canSubmit =
        currentPassword &&
        newPassword.length >= 8 &&
        isValid &&
        newPassword === confirmPassword &&
        currentPassword !== newPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentPassword) { toast.error('Current password is required'); return; }
        if (newPassword.length < 8) { toast.error('New password must be at least 8 characters'); return; }
        if (!isValid) { toast.error('Password must contain uppercase, lowercase, number and special character'); return; }
        if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
        if (currentPassword === newPassword) { toast.error('New password must be different'); return; }

        try {
            setLoading(true);
            await axiosInstance.put('/auth/change-password', {
                currentPassword, newPassword, confirmNewPassword: confirmPassword,
            });
            toast.success('Password changed successfully');
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        } catch (err) {
            const data = err.response?.data;
            const msg = Array.isArray(data?.errors)
                ? data.errors.map((e) => e.msg || e.message).join('. ')
                : data?.message || 'Failed to change password';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); };

    return (
        <div className="space-y-3">

            {/* Change Password */}
            <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-4">
                <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-white/25" />
                    <label className="text-[10px] text-white/40 font-medium uppercase tracking-wide">
                        Change Password
                    </label>
                </div>

                {/* Inputs */}
                <PasswordInput label="Current Password *" value={currentPassword} onChange={setCurrentPassword} placeholder="Enter current password" show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} />

                <div className="space-y-2">
                    <PasswordInput label="New Password *" value={newPassword} onChange={setNewPassword} placeholder="Min 8 characters" show={showNew} onToggle={() => setShowNew(!showNew)} />
                    {newPassword && (
                        <div className="space-y-1.5">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <div
                                        key={level}
                                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                            level <= strength.score ? 'bg-white/60' : 'bg-white/[0.06]'
                                        }`}
                                    />
                                ))}
                            </div>
                            {strength.label && (
                                <p className="text-[10px] text-white/35">{strength.label}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-1.5">
                    <PasswordInput label="Confirm New Password *" value={confirmPassword} onChange={setConfirmPassword} placeholder="Re-enter new password" show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
                    {confirmPassword && (
                        <p className={`text-[10px] ${newPassword === confirmPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                            {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                        </p>
                    )}
                </div>

                {/* Requirements */}
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-2">
                    <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wide">Requirements</p>
                    {REQUIREMENTS.map((req, i) => {
                        const met = newPassword ? req.test(newPassword) : false;
                        return (
                            <div key={i} className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full transition-all ${
                                    !newPassword ? 'bg-white/[0.06]' : met ? 'bg-emerald-400' : 'bg-white/20'
                                }`} />
                                <p className={`text-[10px] transition-colors ${
                                    !newPassword ? 'text-white/20' : met ? 'text-white/50' : 'text-white/25'
                                }`}>
                                    {req.text}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
                    <button
                        type="button"
                        onClick={handleClear}
                        className="px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] text-xs text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                    >
                        Clear
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !canSubmit}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white hover:bg-white/90 text-black text-xs font-semibold active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Changing...</>
                        ) : 'Change Password'}
                    </button>
                </div>
            </form>

            {/* Security Tips */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-3.5 h-3.5 text-white/25" />
                    <label className="text-[10px] text-white/40 font-medium uppercase tracking-wide">
                        Security Tips
                    </label>
                </div>
                <div className="space-y-2">
                    {TIPS.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-white/20 rounded-full mt-1.5 shrink-0" />
                            <p className="text-[10px] text-white/30 leading-relaxed">{tip}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ============================================
// PASSWORD INPUT
// ============================================

function PasswordInput({ label, value, onChange, placeholder, show, onToggle }) {
    return (
        <div>
            <label className="text-[10px] text-white/40 font-medium mb-1.5 block uppercase tracking-wide">
                {label}
            </label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-9 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/25 focus:outline-none focus:border-white/20 transition-colors"
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                >
                    {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
            </div>
        </div>
    );
}