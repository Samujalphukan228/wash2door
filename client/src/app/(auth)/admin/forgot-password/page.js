'use client';

import { useState } from 'react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import {
    ArrowLeft,
    AlertCircle,
    Loader2
} from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Email is required');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Invalid email address');
            return;
        }

        try {
            setLoading(true);
            await axiosInstance.post(
                '/auth/forgot-password',
                { email }
            );
            setSent(true);
        } catch (error) {
            // Always show success for security
            setSent(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex">

            {/* Left Side */}
            <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-16">
                <div>
                    <p className="text-white text-xs tracking-[0.3em] uppercase font-medium">
                        Wash2Door
                    </p>
                </div>
                <div>
                    <h1
                        className="text-white text-6xl font-light leading-tight mb-8"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        Password<br />
                        <em>recovery.</em>
                    </h1>
                    <div className="space-y-6 max-w-xs">
                        {[
                            {
                                num: '01',
                                text: 'Enter your admin email address'
                            },
                            {
                                num: '02',
                                text: 'Check your inbox for reset link'
                            },
                            {
                                num: '03',
                                text: 'Create your new secure password'
                            }
                        ].map((step) => (
                            <div
                                key={step.num}
                                className="flex items-start gap-4"
                            >
                                <span className="text-neutral-600 text-xs tracking-widest mt-0.5">
                                    {step.num}
                                </span>
                                <p className="text-neutral-400 text-sm">
                                    {step.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="border-t border-neutral-800 pt-8">
                    <p className="text-neutral-600 text-xs">
                        © {new Date().getFullYear()} Wash2Door
                    </p>
                </div>
            </div>

            {/* Right Side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-sm">

                    {/* Back */}
                    <Link
                        href="/admin/login"
                        className="inline-flex items-center gap-2 text-neutral-400 hover:text-black transition-colors mb-12 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs tracking-widest uppercase">
                            Back to login
                        </span>
                    </Link>

                    {!sent ? (
                        <>
                            <div className="mb-10">
                                <p className="text-neutral-400 text-xs tracking-[0.2em] uppercase mb-3">
                                    Account Recovery
                                </p>
                                <h2
                                    className="text-3xl font-light text-black"
                                    style={{ fontFamily: 'Playfair Display, serif' }}
                                >
                                    Forgot password?
                                </h2>
                                <p className="text-neutral-500 text-sm mt-3 leading-relaxed">
                                    Enter your email address and we will
                                    send you a link to reset your password.
                                </p>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-xs tracking-[0.15em] uppercase text-neutral-500 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setError('');
                                        }}
                                        placeholder="admin@wash2door.com"
                                        className={`w-full bg-transparent text-black placeholder-neutral-300 border-b py-3 text-sm focus:outline-none transition-colors ${
                                            error
                                                ? 'border-black'
                                                : 'border-neutral-200 focus:border-black'
                                        }`}
                                    />
                                    {error && (
                                        <p className="text-black text-xs mt-2 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {error}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-black hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white text-sm tracking-[0.15em] uppercase py-4 transition-colors flex items-center justify-center gap-3"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Sending</span>
                                            </>
                                        ) : (
                                            'Send Reset Link'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        /* Success */
                        <div>
                            <div className="mb-10">
                                <p className="text-neutral-400 text-xs tracking-[0.2em] uppercase mb-3">
                                    Email Sent
                                </p>
                                <h2
                                    className="text-3xl font-light text-black mb-4"
                                    style={{ fontFamily: 'Playfair Display, serif' }}
                                >
                                    Check your inbox
                                </h2>
                                <p className="text-neutral-500 text-sm leading-relaxed">
                                    We sent a password reset link to
                                </p>
                                <p className="text-black text-sm font-medium mt-1">
                                    {email}
                                </p>
                            </div>

                            <div className="border-l-2 border-black pl-4 mb-10">
                                <p className="text-neutral-500 text-xs leading-relaxed">
                                    The link expires in 1 hour.
                                    Check your spam folder if you
                                    do not see it in your inbox.
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setSent(false);
                                    setEmail('');
                                }}
                                className="text-xs text-neutral-400 hover:text-black transition-colors tracking-widest uppercase"
                            >
                                Try a different email
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}