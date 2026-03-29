'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { X, Lock, Shield, Key, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

const SECURITY_GUIDES = [
    {
        icon: Lock,
        title: 'Admin Account Security',
        description: 'This account has full privileged access to the entire system and all customer data.',
        tips: ['Never share your credentials with anyone', 'Rotate password every 90 days minimum', 'Enable MFA when available'],
        color: 'from-blue-500/20 to-blue-600/5',
        iconColor: 'text-blue-400',
    },
    {
        icon: Shield,
        title: 'Access Protection',
        description: 'Nexxa continuously monitors all login activity and will alert you to unusual locations.',
        tips: ['Never login on untrusted public devices', 'Always log out on shared computers', 'Review login history weekly'],
        color: 'from-emerald-500/20 to-emerald-600/5',
        iconColor: 'text-emerald-400',
    },
    {
        icon: Key,
        title: 'System Credentials',
        description: 'Protect all integration keys, API tokens and system configuration values.',
        tips: ['Never commit secrets to source code', 'Rotate keys quarterly', 'Always use environment variables'],
        color: 'from-amber-500/20 to-amber-600/5',
        iconColor: 'text-amber-400',
    },
    {
        icon: AlertCircle,
        title: 'System Monitoring',
        description: 'You are responsible for reviewing all system alerts and suspicious activity.',
        tips: ['Verify all manual booking modifications', 'Check fraud flags daily', 'Escalate issues immediately'],
        color: 'from-red-500/20 to-red-600/5',
        iconColor: 'text-red-400',
    },
];

// Animation variants
const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { duration: 0.2, ease: 'easeOut' }
    },
    exit: { 
        opacity: 0,
        transition: { duration: 0.15, ease: 'easeIn' }
    },
};

const modalVariants = {
    hidden: { 
        opacity: 0, 
        y: 100,
        scale: 0.95,
    },
    visible: { 
        opacity: 1, 
        y: 0,
        scale: 1,
        transition: {
            type: 'spring',
            damping: 28,
            stiffness: 300,
            mass: 0.9,
        }
    },
    exit: { 
        opacity: 0, 
        y: 60,
        scale: 0.97,
        transition: {
            duration: 0.2,
            ease: [0.4, 0, 1, 1],
        }
    },
};

const contentVariants = {
    enter: (direction) => ({
        x: direction > 0 ? 60 : -60,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            damping: 26,
            stiffness: 300,
        }
    },
    exit: (direction) => ({
        x: direction > 0 ? -60 : 60,
        opacity: 0,
        transition: {
            duration: 0.15,
            ease: 'easeIn',
        }
    }),
};

const iconVariants = {
    initial: { scale: 0.8, rotate: -10, opacity: 0 },
    animate: { 
        scale: 1, 
        rotate: 0, 
        opacity: 1,
        transition: {
            type: 'spring',
            damping: 15,
            stiffness: 200,
            delay: 0.1,
        }
    },
    exit: { 
        scale: 0.8, 
        rotate: 10, 
        opacity: 0,
        transition: { duration: 0.1 }
    },
};

const tipVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: 0.15 + i * 0.08,
            type: 'spring',
            damping: 20,
            stiffness: 300,
        }
    }),
};

const checkboxVariants = {
    unchecked: { scale: 1 },
    checked: { 
        scale: [1, 1.2, 1],
        transition: { duration: 0.2 }
    },
};

// Memoized Tip Item
const TipItem = memo(function TipItem({ tip, index }) {
    return (
        <motion.div
            custom={index}
            variants={tipVariants}
            initial="hidden"
            animate="visible"
            className="flex items-start gap-2.5 group"
        >
            <div className="w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-white/[0.1] transition-colors">
                <CheckCircle2 className="w-3 h-3 text-white/50 group-hover:text-white/70 transition-colors" strokeWidth={2.5} />
            </div>
            <span className="text-xs sm:text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                {tip}
            </span>
        </motion.div>
    );
});

TipItem.displayName = 'TipItem';

// Memoized Progress Dot
const ProgressDot = memo(function ProgressDot({ index, currentIndex, onClick }) {
    const isActive = index === currentIndex;
    const isCompleted = index < currentIndex;
    
    return (
        <motion.button
            onClick={() => onClick(index)}
            className="relative h-1.5 flex-1 rounded-full overflow-hidden bg-white/[0.08]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Go to guide ${index + 1}`}
        >
            <motion.div
                className="absolute inset-0 bg-white rounded-full origin-left"
                initial={false}
                animate={{
                    scaleX: isActive ? 1 : isCompleted ? 1 : 0,
                    opacity: isActive ? 1 : isCompleted ? 0.5 : 0,
                }}
                transition={{
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                }}
            />
        </motion.button>
    );
});

ProgressDot.displayName = 'ProgressDot';

export default function WelcomePopup({ user, onClose }) {
    const [currentGuide, setCurrentGuide] = useState(0);
    const [direction, setDirection] = useState(0);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    
    // For swipe gesture
    const dragX = useMotionValue(0);
    const dragOpacity = useTransform(dragX, [-100, 0, 100], [0.5, 1, 0.5]);

    const guide = SECURITY_GUIDES[currentGuide];
    const GuideIcon = guide.icon;
    const isFirstGuide = currentGuide === 0;
    const isLastGuide = currentGuide === SECURITY_GUIDES.length - 1;

    const goToGuide = useCallback((index) => {
        setDirection(index > currentGuide ? 1 : -1);
        setCurrentGuide(index);
    }, [currentGuide]);

    const goNext = useCallback(() => {
        if (!isLastGuide) {
            setDirection(1);
            setCurrentGuide(prev => prev + 1);
        }
    }, [isLastGuide]);

    const goPrev = useCallback(() => {
        if (!isFirstGuide) {
            setDirection(-1);
            setCurrentGuide(prev => prev - 1);
        }
    }, [isFirstGuide]);

    const handleClose = useCallback(() => {
        if (dontShowAgain) {
            localStorage.setItem('hideWelcomePopup', 'true');
        }
        onClose();
    }, [dontShowAgain, onClose]);

    const handleDragEnd = useCallback((event, info) => {
        const threshold = 50;
        const velocity = info.velocity.x;
        const offset = info.offset.x;

        if (offset < -threshold || velocity < -500) {
            goNext();
        } else if (offset > threshold || velocity > 500) {
            goPrev();
        }
    }, [goNext, goPrev]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                goNext();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                goPrev();
            } else if (e.key === 'Escape') {
                handleClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goNext, goPrev, handleClose]);

    // Prevent scroll on body
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                {/* Backdrop */}
                <motion.div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={handleClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                />

                {/* Modal */}
                <motion.div
                    className="relative bg-[#0A0A0A] border border-white/[0.08] rounded-t-3xl sm:rounded-2xl shadow-2xl shadow-black/80 w-full sm:max-w-md overflow-hidden"
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={(e) => e.stopPropagation()}
                    style={{ willChange: 'transform, opacity' }}
                >
                    {/* Top gradient line */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    {/* Header */}
                    <div className="relative px-5 sm:px-6 pt-6 pb-5 border-b border-white/[0.06]">
                        {/* Close button */}
                        <motion.button
                            onClick={handleClose}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Close"
                        >
                            <X className="w-4 h-4 text-gray-500" strokeWidth={2} />
                        </motion.button>

                        <div className="space-y-3 pr-10">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-[0.2em] mb-1.5">
                                    Welcome
                                </p>
                                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                                    Hi {user?.firstName || 'Admin'}, I'm{' '}
                                    <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                        Nexxa
                                    </span>
                                </h1>
                            </motion.div>

                            <motion.p
                                className="text-sm text-gray-400 leading-relaxed"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                A monitoring system from{' '}
                                <a
                                    href="https://nexxupp.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white font-medium hover:text-gray-200 underline underline-offset-2 decoration-white/30 hover:decoration-white/60 transition-all"
                                >
                                    nexxupp
                                </a>
                                . I'm here to help fix all the possible issues.
                            </motion.p>
                        </div>
                    </div>

                    {/* Content - Swipeable */}
                    <motion.div
                        className="relative overflow-hidden"
                        style={{ opacity: dragOpacity }}
                    >
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={currentGuide}
                                custom={direction}
                                variants={contentVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.2}
                                onDragEnd={handleDragEnd}
                                style={{ x: dragX, willChange: 'transform' }}
                                className="px-5 sm:px-6 py-6 space-y-5 cursor-grab active:cursor-grabbing"
                            >
                                {/* Icon with gradient background */}
                                <motion.div
                                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${guide.color} border border-white/[0.08] flex items-center justify-center relative overflow-hidden`}
                                    variants={iconVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    {/* Shimmer effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                        animate={{
                                            x: ['-100%', '100%'],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatDelay: 3,
                                            ease: 'easeInOut',
                                        }}
                                    />
                                    <GuideIcon className={`w-7 h-7 ${guide.iconColor} relative z-10`} strokeWidth={1.5} />
                                </motion.div>

                                {/* Title & Description */}
                                <div className="space-y-2">
                                    <motion.h2
                                        className="text-base sm:text-lg font-semibold text-white"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 }}
                                    >
                                        {guide.title}
                                    </motion.h2>
                                    <motion.p
                                        className="text-xs sm:text-sm text-gray-400 leading-relaxed"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        {guide.description}
                                    </motion.p>
                                </div>

                                {/* Tips */}
                                <div className="space-y-2.5 pt-1">
                                    {guide.tips.map((tip, i) => (
                                        <TipItem key={`${currentGuide}-${i}`} tip={tip} index={i} />
                                    ))}
                                </div>

                                {/* Swipe hint - mobile only */}
                                <motion.p
                                    className="sm:hidden text-[10px] text-gray-600 text-center pt-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    Swipe to navigate
                                </motion.p>
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>

                    {/* Progress & Actions */}
                    <div className="border-t border-white/[0.06] bg-white/[0.01] px-5 sm:px-6 py-5 space-y-4">
                        {/* Progress bar */}
                        <div className="flex gap-1.5">
                            {SECURITY_GUIDES.map((_, i) => (
                                <ProgressDot
                                    key={i}
                                    index={i}
                                    currentIndex={currentGuide}
                                    onClick={goToGuide}
                                />
                            ))}
                        </div>

                        {/* Don't Show Again - Only on last tab */}
                        <AnimatePresence>
                            {isLastGuide && (
                                <motion.button
                                    onClick={() => setDontShowAgain(!dontShowAgain)}
                                    className={`flex items-center justify-center gap-3 w-full px-4 py-3.5 rounded-xl border transition-all ${
                                        dontShowAgain
                                            ? 'bg-white/[0.08] border-white/20'
                                            : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.12]'
                                    }`}
                                    initial={{ opacity: 0, y: 10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: -10, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <motion.div
                                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                                            dontShowAgain
                                                ? 'bg-white border-white'
                                                : 'border-white/30 bg-transparent'
                                        }`}
                                        variants={checkboxVariants}
                                        animate={dontShowAgain ? 'checked' : 'unchecked'}
                                    >
                                        <AnimatePresence>
                                            {dontShowAgain && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    exit={{ scale: 0 }}
                                                    transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                                                >
                                                    <CheckCircle2 className="w-3 h-3 text-black" strokeWidth={3} />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                    <span className={`text-sm font-medium transition-colors ${
                                        dontShowAgain ? 'text-white' : 'text-gray-400'
                                    }`}>
                                        Don't show this again
                                    </span>
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex gap-2">
                            <motion.button
                                onClick={goPrev}
                                disabled={isFirstGuide}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/[0.08] text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.04] hover:border-white/[0.12] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-white/[0.08] transition-all"
                                whileHover={!isFirstGuide ? { scale: 1.02 } : {}}
                                whileTap={!isFirstGuide ? { scale: 0.98 } : {}}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back
                            </motion.button>

                            <motion.button
                                onClick={isLastGuide ? handleClose : goNext}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-sm font-medium text-black hover:bg-gray-100 transition-colors"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isLastGuide ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        Done
                                    </>
                                ) : (
                                    <>
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                )}
                            </motion.button>
                        </div>

                        {/* Step counter */}
                        <motion.p
                            className="text-[10px] text-gray-600 text-center font-mono"
                            key={currentGuide}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {currentGuide + 1} / {SECURITY_GUIDES.length}
                        </motion.p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}