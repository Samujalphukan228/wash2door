'use client';

import { useState, useEffect } from 'react';
import { X, Lock, Shield, Key, AlertCircle, CheckCircle2 } from 'lucide-react';

const SECURITY_GUIDES = [
    {
        icon: Lock,
        title: 'Admin Account Security',
        description: 'This account has full privileged access to the entire system and all customer data.',
        tips: ['Never share your credentials with anyone', 'Rotate password every 90 days minimum', 'Enable MFA when available']
    },
    {
        icon: Shield,
        title: 'Access Protection',
        description: 'Nexxa continuously monitors all login activity and will alert you to unusual locations.',
        tips: ['Never login on untrusted public devices', 'Always log out on shared computers', 'Review login history weekly']
    },
    {
        icon: Key,
        title: 'System Credentials',
        description: 'Protect all integration keys, API tokens and system configuration values.',
        tips: ['Never commit secrets to source code', 'Rotate keys quarterly', 'Always use environment variables']
    },
    {
        icon: AlertCircle,
        title: 'System Monitoring',
        description: 'You are responsible for reviewing all system alerts and suspicious activity.',
        tips: ['Verify all manual booking modifications', 'Check fraud flags daily', 'Escalate issues immediately']
    }
];

export default function WelcomePopup({ user, onClose }) {
    const [currentGuide, setCurrentGuide] = useState(0);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const guide = SECURITY_GUIDES[currentGuide];
    const GuideIcon = guide.icon;
    const isLastGuide = currentGuide === SECURITY_GUIDES.length - 1;

    const handleClose = () => {
        if (dontShowAgain) {
            localStorage.setItem('hideWelcomePopup', 'true');
        }
        onClose();
    };

    // Prevent scroll on body when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-sm overflow-hidden" onClick={handleClose}>
            <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-black/80 w-full sm:max-w-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="relative px-4 sm:px-6 py-6 sm:py-8 border-b border-white/[0.06]">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.06] transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4 text-gray-500" strokeWidth={2} />
                    </button>

                    <div className="space-y-3">
                        <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-[0.2em] mb-1">Welcome</p>
                            <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                                Hi {user?.firstName}, I'm Nexxa
                            </h1>
                        </div>
                        
                        <p className="text-sm text-gray-400 leading-relaxed">
                            A monitoring system from{' '}
                            <a
                                href="https://nexxupp.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white font-semibold hover:text-gray-200 underline underline-offset-2 transition-colors"
                            >
                                nexxupp
                            </a>
                            . I'm here to help fix all the possible issues you might have.
                        </p>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="px-4 sm:px-6 py-6 space-y-5 max-h-[50vh] overflow-y-auto">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                        <GuideIcon className="w-7 h-7 text-white/80" strokeWidth={1.5} />
                    </div>

                    {/* Title & Description */}
                    <div>
                        <h2 className="text-base sm:text-lg font-semibold text-white mb-1">
                            {guide.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                            {guide.description}
                        </p>
                    </div>

                    {/* Tips */}
                    <div className="space-y-2">
                        {guide.tips.map((tip, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-white/50 shrink-0 mt-0.5" strokeWidth={2} />
                                <span className="text-xs sm:text-sm text-gray-400">{tip}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Progress & Actions - Fixed at bottom */}
                <div className="border-t border-white/[0.06] bg-white/[0.01] p-4 sm:p-6 space-y-4">
                    {/* Progress */}
                    <div className="flex gap-1">
                        {SECURITY_GUIDES.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentGuide(i)}
                                className={`h-0.5 flex-1 rounded-full transition-all ${
                                    i === currentGuide
                                        ? 'bg-white'
                                        : i < currentGuide
                                        ? 'bg-white/50'
                                        : 'bg-white/[0.1]'
                                }`}
                                aria-label={`Guide ${i + 1}`}
                            />
                        ))}
                    </div>

                    {/* Don't Show Again - Only on last tab */}
                    {isLastGuide && (
                        <button
                            onClick={() => setDontShowAgain(!dontShowAgain)}
                            className={`flex items-center justify-center gap-3 w-full px-4 py-4 rounded-xl border transition-all ${
                                dontShowAgain 
                                    ? 'bg-white/[0.08] border-white/20' 
                                    : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.12]'
                            }`}
                        >
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                dontShowAgain 
                                    ? 'bg-white border-white' 
                                    : 'border-white/30'
                            }`}>
                                {dontShowAgain && (
                                    <CheckCircle2 className="w-4 h-4 text-black" strokeWidth={3} />
                                )}
                            </div>
                            <span className={`text-sm font-medium transition-colors ${
                                dontShowAgain ? 'text-white' : 'text-gray-300'
                            }`}>
                                Don't show this welcome guide again
                            </span>
                        </button>
                    )}

                    {/* Navigation */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentGuide(Math.max(0, currentGuide - 1))}
                            disabled={currentGuide === 0}
                            className="flex-1 px-3 py-2 rounded-lg border border-white/[0.08] text-xs sm:text-sm font-medium text-gray-400 hover:text-gray-300 hover:bg-white/[0.03] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            Back
                        </button>

                        {currentGuide < SECURITY_GUIDES.length - 1 ? (
                            <button
                                onClick={() => setCurrentGuide(currentGuide + 1)}
                                className="flex-1 px-3 py-2 rounded-lg bg-white text-xs sm:text-sm font-medium text-black hover:bg-gray-100 transition-all"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleClose}
                                className="flex-1 px-3 py-2 rounded-lg bg-white text-xs sm:text-sm font-medium text-black hover:bg-gray-100 transition-all"
                            >
                                Done
                            </button>
                        )}
                    </div>

                    {/* Footer */}
                    <p className="text-[10px] text-gray-600 text-center">
                        {currentGuide + 1} / {SECURITY_GUIDES.length}
                    </p>
                </div>
            </div>
        </div>
    );
}