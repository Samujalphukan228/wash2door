'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
    X, Lock, Shield, Key, AlertCircle,
    CheckCircle2, ChevronLeft, ChevronRight, ArrowRight, Check,
} from 'lucide-react';

// ============================================
// DATA
// ============================================

const GUIDES = [
    {
        icon: Lock,
        tag: 'Credentials',
        title: 'Admin Account Security',
        description: 'This account carries full privileged access to every corner of the system and all customer data.',
        tips: [
            'Never share credentials with anyone',
            'Rotate your password every 90 days',
            'Enable MFA wherever available',
        ],
    },
    {
        icon: Shield,
        tag: 'Monitoring',
        title: 'Access Protection',
        description: 'Nexxa continuously tracks all login activity and surfaces alerts for unusual locations or patterns.',
        tips: [
            'Avoid logging in on public devices',
            'Always log out on shared machines',
            'Review login history weekly',
        ],
    },
    {
        icon: Key,
        tag: 'Tokens',
        title: 'System Credentials',
        description: 'Guard every integration key, API token and system configuration value like your most sensitive asset.',
        tips: [
            'Never commit secrets to source code',
            'Rotate all keys quarterly',
            'Prefer environment variables always',
        ],
    },
    {
        icon: AlertCircle,
        tag: 'Alerts',
        title: 'System Monitoring',
        description: 'You own the responsibility of reviewing all system alerts and flagging suspicious activity immediately.',
        tips: [
            'Verify all manual booking edits',
            'Check fraud flags every day',
            'Escalate issues without delay',
        ],
    },
];

const STEPS = GUIDES.map((g, i) => ({
    key: g.tag.toLowerCase(),
    label: g.tag,
    icon: g.icon,
}));

// ============================================
// MAIN COMPONENT
// ============================================

export default function WelcomePopup({ user, onClose }) {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(0);
    const [dontShow, setDontShow] = useState(false);

    const guide   = GUIDES[current];
    const Icon    = guide.icon;
    const isFirst = current === 0;
    const isLast  = current === GUIDES.length - 1;

    const go = useCallback((idx) => {
        setDirection(idx > current ? 1 : -1);
        setCurrent(idx);
    }, [current]);

    const next  = useCallback(() => { if (!isLast)  go(current + 1); }, [isLast, go, current]);
    const prev  = useCallback(() => { if (!isFirst) go(current - 1); }, [isFirst, go, current]);

    const close = useCallback(() => {
        if (dontShow) localStorage.setItem('hideWelcomePopup', 'true');
        onClose();
    }, [dontShow, onClose]);

    // Keyboard navigation
    useEffect(() => {
        const h = (e) => {
            if (e.key === 'ArrowRight') next();
            else if (e.key === 'ArrowLeft') prev();
            else if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [next, prev, close]);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50" onClick={close} />

            {/* Modal */}
            <div className="fixed inset-2 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[460px] sm:max-h-[85vh] bg-neutral-950 rounded-2xl overflow-hidden z-50 flex flex-col border border-white/[0.08]">

                {/* Header */}
                <div className="shrink-0 px-4 pt-4 pb-3">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            {current > 0 ? (
                                <button
                                    onClick={prev}
                                    className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4 text-white/60" />
                                </button>
                            ) : (
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-white/80" />
                                </div>
                            )}
                            <div>
                                <h2 className="text-sm font-semibold text-white">
                                    Hi {user?.firstName || 'Admin'},
                                    <span className="text-white/40 font-normal ml-1">I'm Nexxa</span>
                                </h2>
                                <p className="text-[10px] text-white/40">
                                    Step {current + 1} of {GUIDES.length} · {guide.tag}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={close}
                            className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center transition-colors"
                        >
                            <X className="w-3.5 h-3.5 text-white/40" />
                        </button>
                    </div>

                    {/* Step Indicator */}
                    <div className="flex gap-1 p-1 bg-white/[0.04] rounded-lg">
                        {STEPS.map((s, i) => (
                            <button
                                key={s.key}
                                onClick={() => {
                                    if (i <= current) go(i);
                                }}
                                disabled={i > current}
                                className={`
                                    flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium rounded-md transition-all
                                    ${current === i
                                        ? 'bg-white/10 text-white'
                                        : i < current
                                            ? 'text-white/50 hover:text-white/70 cursor-pointer'
                                            : 'text-white/20 cursor-not-allowed'
                                    }
                                `}
                            >
                                {i < current ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                    <s.icon className="w-3 h-3" />
                                )}
                                <span className="hidden sm:inline">{s.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-4">

                    {/* Intro text - first slide only */}
                    {isFirst && (
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                            <p className="text-xs text-white/40 leading-relaxed">
                                A monitoring system from{' '}
                                <a
                                    href="https://nexxupp.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white/70 underline underline-offset-[3px] decoration-white/20 hover:text-white/90"
                                >
                                    nexxupp
                                </a>
                                . Here to surface and fix every possible issue.
                            </p>
                        </div>
                    )}

                    {/* Guide Card */}
                    <div className="space-y-4">

                        {/* Icon + Title */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                                <Icon className="w-5 h-5 text-white/70" strokeWidth={1.6} />
                            </div>
                            <div>
                                <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wide mb-0.5">
                                    {guide.tag}
                                </p>
                                <h3 className="text-xs font-semibold text-white">
                                    {guide.title}
                                </h3>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-white/40 leading-relaxed">
                            {guide.description}
                        </p>

                        {/* Tips */}
                        <div>
                            <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                                Best Practices
                            </label>
                            <div className="space-y-1.5">
                                {guide.tips.map((tip, i) => (
                                    <div
                                        key={`${current}-${i}`}
                                        className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]"
                                    >
                                        <div className="w-5 h-5 rounded-md bg-white/[0.06] flex items-center justify-center shrink-0 mt-[1px]">
                                            <CheckCircle2 className="w-3 h-3 text-white/40" strokeWidth={2} />
                                        </div>
                                        <span className="text-[11px] text-white/45 leading-relaxed">
                                            {tip}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Don't show again — last slide only */}
                    {isLast && (
                        <button
                            onClick={() => setDontShow((v) => !v)}
                            className={`w-full flex items-center justify-center gap-2.5 p-3 rounded-xl border transition-all ${
                                dontShow
                                    ? 'bg-white/[0.06] border-white/[0.15]'
                                    : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]'
                            }`}
                        >
                            <div
                                className={`w-[18px] h-[18px] rounded-md flex items-center justify-center shrink-0 transition-all ${
                                    dontShow
                                        ? 'bg-white border-white'
                                        : 'bg-transparent border-white/25'
                                }`}
                                style={{
                                    border: `1.5px solid ${dontShow ? '#fff' : 'rgba(255,255,255,0.25)'}`,
                                }}
                            >
                                {dontShow && (
                                    <Check className="w-[10px] h-[10px] text-black" strokeWidth={3} />
                                )}
                            </div>
                            <span
                                className={`text-[11px] font-medium transition-colors ${
                                    dontShow ? 'text-white' : 'text-white/40'
                                }`}
                            >
                                Don't show this again
                            </span>
                        </button>
                    )}

                    {/* Summary — last slide only */}
                    {isLast && (
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] space-y-2">
                            <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wide">
                                Security Summary
                            </p>
                            {GUIDES.map((g, i) => (
                                <div key={i} className="flex items-center justify-between gap-4">
                                    <span className="text-[10px] text-white/30 shrink-0 flex items-center gap-1.5">
                                        <g.icon className="w-3 h-3" />
                                        {g.tag}
                                    </span>
                                    <span className="text-[11px] text-white/60 text-right truncate">
                                        {g.tips.length} tips reviewed
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 p-3 border-t border-white/[0.06]">
                    <button
                        onClick={isLast ? close : next}
                        className="w-full py-2.5 rounded-lg bg-white hover:bg-white/90 text-black text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                    >
                        {isLast ? (
                            <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Got It
                            </>
                        ) : (
                            <>
                                Continue
                                <ChevronRight className="w-3.5 h-3.5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}