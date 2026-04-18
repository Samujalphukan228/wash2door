'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
    const { login, loading } = useAuth();

    const [formData, setFormData]             = useState({ email: '', password: '' });
    const [showPassword, setShowPassword]     = useState(false);
    const [errors, setErrors]                 = useState({});
    const [loginError, setLoginError]         = useState('');
    const [remainingAttempts, setRemainingAttempts] = useState(null);
    const [mounted, setMounted]               = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setLoginError('');
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!formData.email) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email address';
        if (!formData.password) errs.password = 'Password is required';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');
        setRemainingAttempts(null);

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const result = await login(formData.email, formData.password);
        if (!result?.success && result?.message) {
            setLoginError(result.message);
            if (result.remainingAttempts !== undefined) {
                setRemainingAttempts(result.remainingAttempts);
            }
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-black flex">

            {/* ── Left: Branding ── */}
            <div className="hidden lg:flex lg:w-1/2 bg-white flex-col justify-between p-16">
                <p className="text-black text-xs tracking-[0.3em] uppercase font-medium">
                    Wash2Door
                </p>

                <div>
                    <h1
                        className="text-black text-6xl font-light leading-tight mb-8"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        Manage your<br />business<br /><em>effortlessly.</em>
                    </h1>
                    <p className="text-neutral-600 text-sm leading-relaxed max-w-xs">
                        The complete admin platform for Wash2Door.
                        Bookings, customers, services and revenue — all in one place.
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-8 border-t border-neutral-200 pt-8">
                    {[
                        { number: '47', label: 'API Endpoints' },
                        { number: '11', label: 'Email Templates' },
                        { number: '∞',  label: 'Real-time' },
                    ].map((stat) => (
                        <div key={stat.label}>
                            <p className="text-black text-2xl font-light mb-1">{stat.number}</p>
                            <p className="text-neutral-500 text-xs tracking-widest uppercase">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Right: Login Form ── */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-sm">

                    {/* Mobile logo */}
                    <div className="lg:hidden mb-12">
                        <p className="text-white text-xs tracking-[0.3em] uppercase font-medium">
                            Wash2Door
                        </p>
                    </div>

                    {/* Header */}
                    <div className="mb-10">
                        <p className="text-neutral-500 text-xs tracking-[0.2em] uppercase mb-3">
                            Admin Access
                        </p>
                        <h2
                            className="text-3xl font-light text-white"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            Sign in
                        </h2>
                    </div>

                    {/* Login error */}
                    {loginError && (
                        <div className="mb-6 flex items-start gap-3 border border-white/10 bg-white/[0.04] p-4 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-white/60 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-white/80 text-sm">{loginError}</p>
                                {remainingAttempts !== null && (
                                    <p className="text-white/40 text-xs mt-1">
                                        {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-7">

                        {/* Email */}
                        <div>
                            <label className="block text-xs tracking-[0.15em] uppercase text-neutral-500 mb-3">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="admin@wash2door.com"
                                autoComplete="email"
                                className={`w-full bg-transparent text-white placeholder-neutral-600 border-b py-3 text-sm focus:outline-none transition-colors ${
                                    errors.email
                                        ? 'border-white/60'
                                        : 'border-white/10 focus:border-white/40'
                                }`}
                            />
                            {errors.email && (
                                <p className="text-white/60 text-xs mt-2">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-xs tracking-[0.15em] uppercase text-neutral-500">
                                    Password
                                </label>
                                <Link
                                    href="/admin/forgot-password"
                                    className="text-xs text-neutral-600 hover:text-white transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className={`w-full bg-transparent text-white placeholder-neutral-600 border-b py-3 text-sm focus:outline-none transition-colors pr-10 ${
                                        errors.password
                                            ? 'border-white/60'
                                            : 'border-white/10 focus:border-white/40'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors"
                                >
                                    {showPassword
                                        ? <EyeOff className="w-4 h-4" />
                                        : <Eye className="w-4 h-4" />
                                    }
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-white/60 text-xs mt-2">{errors.password}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="pt-1">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white hover:bg-neutral-100 disabled:bg-white/20 disabled:text-white/30 disabled:cursor-not-allowed text-black text-sm tracking-[0.15em] uppercase py-4 transition-colors flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : 'Sign In'}
                            </button>
                        </div>
                    </form>

                    {/* Security note */}
                    <div className="mt-12 pt-8 border-t border-white/[0.06]">
                        <p className="text-neutral-700 text-xs leading-relaxed">
                            Secure admin area. Account locks after 5 failed attempts.
                            Unauthorized access is monitored.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}