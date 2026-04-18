'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { Eye, EyeOff, ArrowLeft, AlertCircle, Loader2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================
// PASSWORD STRENGTH
// ============================================

const CHECKS_CONFIG = [
    { key: 'length',    label: '8+ chars',  test: (p) => p.length >= 8 },
    { key: 'uppercase', label: 'Uppercase', test: (p) => /[A-Z]/.test(p) },
    { key: 'lowercase', label: 'Lowercase', test: (p) => /[a-z]/.test(p) },
    { key: 'number',    label: 'Number',    test: (p) => /\d/.test(p) },
    { key: 'special',   label: 'Special',   test: (p) => /[^a-zA-Z0-9]/.test(p) },
];

const REQUIREMENTS = [
    'Minimum 8 characters',
    'One uppercase letter (A–Z)',
    'One lowercase letter (a–z)',
    'One number (0–9)',
    'One special character',
];

function checkPasswordStrength(password) {
    const checks = Object.fromEntries(
        CHECKS_CONFIG.map(({ key, test }) => [key, test(password)])
    );
    const score = Object.values(checks).filter(Boolean).length;
    const strength =
        score <= 2 ? 'Weak' :
        score <= 3 ? 'Fair' :
        score <= 4 ? 'Good' : 'Strong';
    return { checks, strength, score };
}

// ============================================
// MAIN PAGE
// ============================================

export default function ResetPasswordPage() {
    const router = useRouter();
    const params = useParams();
    const token  = params.token;

    const [formData, setFormData]         = useState({ password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm]   = useState(false);
    const [errors, setErrors]             = useState({});
    const [loading, setLoading]           = useState(false);
    const [success, setSuccess]           = useState(false);
    const [strength, setStrength]         = useState(null);

    useEffect(() => {
        if (!token) router.push('/admin/forgot-password');
    }, [token, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === 'password') setStrength(value ? checkPasswordStrength(value) : null);
        if (errors[name] || errors.general) setErrors((prev) => ({ ...prev, [name]: '', general: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!formData.password) errs.password = 'Password is required';
        else if (formData.password.length < 8) errs.password = 'At least 8 characters required';
        if (!formData.confirmPassword) errs.confirmPassword = 'Please confirm your password';
        else if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

        try {
            setLoading(true);
            setErrors({});
            const res = await axiosInstance.post(`/auth/reset-password/${token}`, {
                password: formData.password,
                confirmPassword: formData.confirmPassword,
            });
            if (res.data.success) {
                setSuccess(true);
                toast.success('Password reset successfully!');
            }
        } catch (err) {
            const data = err.response?.data;
            const message = Array.isArray(data?.errors)
                ? data.errors.map((e) => e.msg || e.message).join('. ')
                : data?.message || 'Reset link expired or invalid. Please request a new one.';
            setErrors({ general: message });
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const strengthPct   = strength ? `${(strength.score / 5) * 100}%` : '0%';
    const passwordsMatch = formData.confirmPassword && formData.password === formData.confirmPassword;

    return (
        <div className="min-h-screen bg-white flex">

            {/* ── Left: Branding ── */}
            <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-16">
                <p className="text-white text-xs tracking-[0.3em] uppercase font-medium">
                    Wash2Door
                </p>

                <div>
                    <h1
                        className="text-white text-6xl font-light leading-tight mb-8"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        New<br /><em>password.</em>
                    </h1>

                    <div className="bg-neutral-900 border border-neutral-800 p-6 max-w-xs">
                        <p className="text-neutral-500 text-xs tracking-widest uppercase mb-4">
                            Requirements
                        </p>
                        <div className="space-y-2">
                            {REQUIREMENTS.map((req, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-1 h-1 bg-neutral-600 rounded-full shrink-0" />
                                    <p className="text-neutral-400 text-sm">{req}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-neutral-800 pt-8">
                    <p className="text-neutral-600 text-xs">
                        © {new Date().getFullYear()} Wash2Door
                    </p>
                </div>
            </div>

            {/* ── Right: Form ── */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-sm">

                    <Link
                        href="/admin/login"
                        className="inline-flex items-center gap-2 text-neutral-400 hover:text-black transition-colors mb-12 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs tracking-widest uppercase">Back to login</span>
                    </Link>

                    {!success ? (
                        <>
                            <div className="mb-10">
                                <p className="text-neutral-400 text-xs tracking-[0.2em] uppercase mb-3">
                                    Set New Password
                                </p>
                                <h2
                                    className="text-3xl font-light text-black"
                                    style={{ fontFamily: 'Playfair Display, serif' }}
                                >
                                    Reset password
                                </h2>
                            </div>

                            {errors.general && (
                                <div className="mb-6 flex items-start gap-3 border border-neutral-200 bg-neutral-50 p-4">
                                    <AlertCircle className="w-4 h-4 text-black mt-0.5 shrink-0" />
                                    <p className="text-black text-sm">{errors.general}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-7">

                                {/* New Password */}
                                <div>
                                    <label className="block text-xs tracking-[0.15em] uppercase text-neutral-500 mb-3">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className={`w-full bg-transparent text-black placeholder-neutral-300 border-b py-3 text-sm focus:outline-none transition-colors pr-10 ${
                                                errors.password
                                                    ? 'border-black'
                                                    : 'border-neutral-200 focus:border-black'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {/* Strength meter */}
                                    {formData.password && strength && (
                                        <div className="mt-3 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-neutral-400">Strength</span>
                                                <span className="text-xs text-black font-medium">{strength.strength}</span>
                                            </div>
                                            <div className="h-px bg-neutral-100 w-full">
                                                <div
                                                    className="h-px bg-black transition-all duration-300"
                                                    style={{ width: strengthPct }}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-1.5 pt-1">
                                                {CHECKS_CONFIG.map(({ key, label }) => (
                                                    <div key={key} className="flex items-center gap-1.5">
                                                        {strength.checks[key] ? (
                                                            <Check className="w-3 h-3 text-black shrink-0" />
                                                        ) : (
                                                            <X className="w-3 h-3 text-neutral-300 shrink-0" />
                                                        )}
                                                        <span className={`text-xs ${
                                                            strength.checks[key] ? 'text-black' : 'text-neutral-300'
                                                        }`}>
                                                            {label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {errors.password && (
                                        <p className="text-black text-xs mt-2">{errors.password}</p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-xs tracking-[0.15em] uppercase text-neutral-500 mb-3">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className={`w-full bg-transparent text-black placeholder-neutral-300 border-b py-3 text-sm focus:outline-none transition-colors pr-10 ${
                                                errors.confirmPassword ? 'border-black' :
                                                passwordsMatch ? 'border-black' :
                                                'border-neutral-200 focus:border-black'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                                        >
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {formData.confirmPassword && (
                                        <p className={`text-xs mt-2 flex items-center gap-1 ${
                                            passwordsMatch ? 'text-black' : 'text-neutral-400'
                                        }`}>
                                            {passwordsMatch ? (
                                                <><Check className="w-3 h-3 shrink-0" /> Passwords match</>
                                            ) : (
                                                <><X className="w-3 h-3 shrink-0" /> Passwords do not match</>
                                            )}
                                        </p>
                                    )}

                                    {errors.confirmPassword && (
                                        <p className="text-black text-xs mt-2">{errors.confirmPassword}</p>
                                    )}
                                </div>

                                <div className="pt-1">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-black hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed text-white text-sm tracking-[0.15em] uppercase py-4 transition-colors flex items-center justify-center gap-3"
                                    >
                                        {loading ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</>
                                        ) : 'Reset Password'}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        /* ── Success ── */
                        <div>
                            <div className="mb-10">
                                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-6">
                                    <Check className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-neutral-400 text-xs tracking-[0.2em] uppercase mb-3">
                                    Success
                                </p>
                                <h2
                                    className="text-3xl font-light text-black mb-4"
                                    style={{ fontFamily: 'Playfair Display, serif' }}
                                >
                                    Password updated
                                </h2>
                                <p className="text-neutral-500 text-sm leading-relaxed">
                                    Your password has been reset successfully.
                                    You can now sign in with your new password.
                                </p>
                            </div>

                            <button
                                onClick={() => router.push('/admin/login')}
                                className="w-full bg-black hover:bg-neutral-800 text-white text-sm tracking-[0.15em] uppercase py-4 transition-colors"
                            >
                                Sign In
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}