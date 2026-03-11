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
            { label: 'Weak', color: 'bg-neutral-600' },
            { label: 'Fair', color: 'bg-neutral-500' },
            { label: 'Good', color: 'bg-neutral-400' },
            { label: 'Strong', color: 'bg-neutral-300' },
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
        <div className="space-y-8">

            {/* ── Change Password ── */}
            <form onSubmit={handleSubmit} className="bg-neutral-950 border border-neutral-800 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Shield className="w-4 h-4 text-neutral-600" />
                    <p className="text-xs text-neutral-500 tracking-widest uppercase">
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
                            <div className="mt-2 space-y-1.5">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                            key={level}
                                            className={`h-1 flex-1 transition-colors ${
                                                level <= strength.score
                                                    ? strength.color
                                                    : 'bg-neutral-800'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-neutral-500">
                                    {strength.label}
                                </p>
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
                            <p className={`text-xs mt-1.5 ${
                                newPassword === confirmPassword
                                    ? 'text-neutral-400'
                                    : 'text-neutral-600'
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
                <div className="mt-6 p-4 border border-neutral-800 space-y-2">
                    <p className="text-xs text-neutral-500 tracking-widest uppercase mb-2">
                        Requirements
                    </p>
                    {[
                        { check: newPassword.length >= 8, text: 'At least 8 characters' },
                        { check: /[A-Z]/.test(newPassword), text: 'One uppercase letter (A-Z)' },
                        { check: /[a-z]/.test(newPassword), text: 'One lowercase letter (a-z)' },
                        { check: /\d/.test(newPassword), text: 'One number (0-9)' },
                        { check: /[@$!%*?&]/.test(newPassword), text: 'One special character (@$!%*?&)' }
                    ].map((req, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                !newPassword
                                    ? 'bg-neutral-800'
                                    : req.check
                                    ? 'bg-white'
                                    : 'bg-neutral-700'
                            }`} />
                            <p className={`text-xs transition-colors ${
                                !newPassword
                                    ? 'text-neutral-700'
                                    : req.check
                                    ? 'text-neutral-300'
                                    : 'text-neutral-600'
                            }`}>
                                {req.text}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-neutral-800">
                    <button
                        type="button"
                        onClick={() => {
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                        }}
                        className="border border-neutral-800 text-neutral-400 hover:text-white text-xs tracking-widest uppercase px-4 py-3 transition-colors"
                    >
                        Clear
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !canSubmit}
                        className="flex-1 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed text-black text-xs tracking-widest uppercase py-3 transition-colors flex items-center justify-center gap-2"
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
            <div className="bg-neutral-950 border border-neutral-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4 text-neutral-600" />
                    <p className="text-xs text-neutral-500 tracking-widest uppercase">
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
                        <div key={i} className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-neutral-600 rounded-full mt-1.5 shrink-0" />
                            <p className="text-xs text-neutral-500 leading-relaxed">
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
            <label className="block text-xs text-neutral-500 mb-1.5 uppercase tracking-widest">
                {label}
            </label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm pl-10 pr-10 py-2.5 focus:outline-none focus:border-neutral-600 transition-colors"
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors"
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