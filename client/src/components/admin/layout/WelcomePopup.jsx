'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { X, Lock, Shield, Key, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

/* ─── data ─── */
const GUIDES = [
    {
        icon: Lock,
        tag: 'Credentials',
        title: 'Admin Account\nSecurity',
        description: 'This account carries full privileged access to every corner of the system and all customer data.',
        tips: ['Never share credentials with anyone', 'Rotate your password every 90 days', 'Enable MFA wherever available'],
    },
    {
        icon: Shield,
        tag: 'Monitoring',
        title: 'Access\nProtection',
        description: 'Nexxa continuously tracks all login activity and surfaces alerts for unusual locations or patterns.',
        tips: ['Avoid logging in on public devices', 'Always log out on shared machines', 'Review login history weekly'],
    },
    {
        icon: Key,
        tag: 'Tokens',
        title: 'System\nCredentials',
        description: 'Guard every integration key, API token and system configuration value like your most sensitive asset.',
        tips: ['Never commit secrets to source code', 'Rotate all keys quarterly', 'Prefer environment variables always'],
    },
    {
        icon: AlertCircle,
        tag: 'Alerts',
        title: 'System\nMonitoring',
        description: 'You own the responsibility of reviewing all system alerts and flagging suspicious activity immediately.',
        tips: ['Verify all manual booking edits', 'Check fraud flags every day', 'Escalate issues without delay'],
    },
];

/* ─── spring presets ─── */
const SP_MODAL   = { type: 'spring', stiffness: 320, damping: 30, mass: 0.85 };
const SP_CONTENT = { type: 'spring', stiffness: 360, damping: 32 };
const SP_MICRO   = { type: 'spring', stiffness: 500, damping: 28 };

/* ─── variants ─── */
const backdropV = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.22 } },
    exit:    { opacity: 0, transition: { duration: 0.16 } },
};

const modalV = {
    hidden:  { opacity: 0, y: 80, scale: 0.96 },
    visible: { opacity: 1, y: 0,  scale: 1, transition: SP_MODAL },
    exit:    { opacity: 0, y: 48, scale: 0.97, transition: { duration: 0.18, ease: [0.4,0,1,1] } },
};

const slideV = {
    enter:  (d) => ({ x: d > 0 ? 56 : -56, opacity: 0, filter: 'blur(3px)' }),
    center: { x: 0, opacity: 1, filter: 'blur(0px)', transition: SP_CONTENT },
    exit:   (d) => ({ x: d > 0 ? -56 : 56, opacity: 0, filter: 'blur(3px)', transition: { duration: 0.14, ease: 'easeIn' } }),
};

/* ─── tip row ─── */
const TipRow = memo(({ tip, index }) => (
    <motion.div
        className="flex items-start gap-3"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0, transition: { delay: 0.12 + index * 0.07, ...SP_MICRO } }}
    >
        <span style={{
            width: 18, height: 18, borderRadius: '50%',
            border: '0.5px solid rgba(255,255,255,0.14)',
            background: 'rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginTop: 2,
        }}>
            <CheckCircle2 style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.4)' }} strokeWidth={2.5} />
        </span>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{tip}</span>
    </motion.div>
));
TipRow.displayName = 'TipRow';

/* ─── progress pip ─── */
const Pip = memo(({ index, current, total, onClick }) => {
    const isActive = index === current;
    const isPast   = index < current;
    return (
        <motion.button
            onClick={() => onClick(index)}
            aria-label={`Guide ${index + 1} of ${total}`}
            style={{
                flex: 1, height: 2, borderRadius: 999,
                background: 'rgba(255,255,255,0.08)',
                border: 'none', cursor: 'pointer', padding: 0,
                overflow: 'hidden', position: 'relative',
            }}
            whileHover={{ scaleY: 2 }}
            transition={{ duration: 0.15 }}
        >
            <motion.div
                style={{
                    position: 'absolute', inset: 0,
                    background: '#fff', borderRadius: 999,
                    transformOrigin: 'left',
                }}
                animate={{
                    scaleX: isActive || isPast ? 1 : 0,
                    opacity: isActive ? 1 : isPast ? 0.4 : 0,
                }}
                transition={{ duration: 0.28, ease: [0.4,0,0.2,1] }}
            />
        </motion.button>
    );
});
Pip.displayName = 'Pip';

/* ─── main component ─── */
export default function WelcomePopup({ user, onClose }) {
    const [current, setCurrent]         = useState(0);
    const [direction, setDirection]     = useState(0);
    const [dontShow, setDontShow]       = useState(false);

    const guide    = GUIDES[current];
    const Icon     = guide.icon;
    const isFirst  = current === 0;
    const isLast   = current === GUIDES.length - 1;

    const dragX      = useMotionValue(0);
    const dragAlpha  = useTransform(dragX, [-120, 0, 120], [0.55, 1, 0.55]);

    const go = useCallback((idx) => {
        setDirection(idx > current ? 1 : -1);
        setCurrent(idx);
    }, [current]);

    const next = useCallback(() => { if (!isLast)  go(current + 1); }, [isLast, go, current]);
    const prev = useCallback(() => { if (!isFirst) go(current - 1); }, [isFirst, go, current]);

    const close = useCallback(() => {
        if (dontShow) localStorage.setItem('hideWelcomePopup', 'true');
        onClose();
    }, [dontShow, onClose]);

    const onDragEnd = useCallback((_, info) => {
        if (info.offset.x < -50 || info.velocity.x < -500) next();
        else if (info.offset.x > 50 || info.velocity.x > 500) prev();
    }, [next, prev]);

    useEffect(() => {
        const h = (e) => {
            if (e.key === 'ArrowRight') next();
            else if (e.key === 'ArrowLeft') prev();
            else if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [next, prev, close]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    /* icon accent per guide — pure monochrome tints */
    const TINTS = [
        'rgba(255,255,255,0.06)',
        'rgba(255,255,255,0.05)',
        'rgba(255,255,255,0.07)',
        'rgba(255,255,255,0.05)',
    ];

    return (
        <AnimatePresence>
            <motion.div
                style={{
                    position: 'fixed', inset: 0, zIndex: 100,
                    display: 'flex', alignItems: 'flex-end',
                    justifyContent: 'center',
                }}
                variants={backdropV}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                {/* backdrop */}
                <motion.div
                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
                    onClick={close}
                />

                {/* sheet */}
                <motion.div
                    variants={modalV}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: 440,
                        background: '#0c0c0c',
                        border: '0.5px solid rgba(255,255,255,0.1)',
                        borderBottom: 'none',
                        borderRadius: '24px 24px 0 0',
                        overflow: 'hidden',
                        willChange: 'transform, opacity',
                    }}
                >
                    {/* top hairline accent */}
                    <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18) 50%, transparent)' }} />

                    {/* drag handle */}
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
                        <div style={{ width: 36, height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.1)' }} />
                    </div>

                    {/* ── HEADER ── */}
                    <div style={{ padding: '20px 24px 18px', borderBottom: '0.5px solid rgba(255,255,255,0.06)', position: 'relative' }}>
                        {/* close */}
                        <motion.button
                            onClick={close}
                            aria-label="Close"
                            style={{
                                position: 'absolute', top: 18, right: 20,
                                width: 30, height: 30, borderRadius: '50%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '0.5px solid rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', outline: 'none',
                            }}
                            whileHover={{ background: 'rgba(255,255,255,0.1)' }}
                            whileTap={{ scale: 0.92 }}
                        >
                            <X style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.4)' }} strokeWidth={2} />
                        </motion.button>

                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0, transition: { delay: 0.08, ...SP_MICRO } }}
                        >
                            <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6 }}>
                                Welcome
                            </p>
                            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1.2, margin: 0 }}>
                                Hi {user?.firstName || 'Admin'},{' '}
                                <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>I'm Nexxa</span>
                            </h1>
                        </motion.div>

                        <motion.p
                            style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.6, margin: '8px 0 0', paddingRight: 36 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { delay: 0.16 } }}
                        >
                            A monitoring system from{' '}
                            <a
                                href="https://nexxupp.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.2)', textUnderlineOffset: 3 }}
                            >
                                nexxupp
                            </a>
                            . Here to surface and fix every possible issue.
                        </motion.p>
                    </div>

                    {/* ── SLIDE CONTENT ── */}
                    <motion.div style={{ overflow: 'hidden', opacity: dragAlpha }}>
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={current}
                                custom={direction}
                                variants={slideV}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.15}
                                onDragEnd={onDragEnd}
                                style={{ x: dragX, padding: '24px 24px 20px', cursor: 'grab' }}
                            >
                                {/* icon + tag row */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                                    <motion.div
                                        style={{
                                            width: 52, height: 52, borderRadius: 16,
                                            background: TINTS[current],
                                            border: '0.5px solid rgba(255,255,255,0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0, overflow: 'hidden', position: 'relative',
                                        }}
                                        initial={{ scale: 0.75, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1, transition: { delay: 0.05, ...SP_MICRO } }}
                                    >
                                        {/* shimmer sweep */}
                                        <motion.div
                                            style={{
                                                position: 'absolute', inset: 0,
                                                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.07) 50%, transparent 60%)',
                                            }}
                                            animate={{ x: ['-100%', '200%'] }}
                                            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 3.5, ease: 'easeInOut' }}
                                        />
                                        <Icon style={{ width: 22, height: 22, color: 'rgba(255,255,255,0.7)', position: 'relative', zIndex: 1 }} strokeWidth={1.6} />
                                    </motion.div>

                                    <div>
                                        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: 3 }}>
                                            {guide.tag}
                                        </p>
                                        <h2 style={{ fontSize: 17, fontWeight: 600, color: '#fff', lineHeight: 1.25, margin: 0, whiteSpace: 'pre-line' }}>
                                            {guide.title}
                                        </h2>
                                    </div>
                                </div>

                                {/* description */}
                                <motion.p
                                    style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.65, margin: '0 0 18px' }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1, transition: { delay: 0.08 } }}
                                >
                                    {guide.description}
                                </motion.p>

                                {/* divider */}
                                <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.06)', marginBottom: 16 }} />

                                {/* tips */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {guide.tips.map((tip, i) => (
                                        <TipRow key={`${current}-${i}`} tip={tip} index={i} />
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>

                    {/* ── FOOTER ── */}
                    <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', padding: '16px 24px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                        {/* progress pips */}
                        <div style={{ display: 'flex', gap: 6 }}>
                            {GUIDES.map((_, i) => (
                                <Pip key={i} index={i} current={current} total={GUIDES.length} onClick={go} />
                            ))}
                        </div>

                        {/* don't show again — last slide only */}
                        <AnimatePresence>
                            {isLast && (
                                <motion.button
                                    onClick={() => setDontShow((v) => !v)}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto', transition: { duration: 0.2 } }}
                                    exit={{ opacity: 0, height: 0, transition: { duration: 0.15 } }}
                                    style={{
                                        width: '100%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                        padding: '11px 16px',
                                        borderRadius: 12,
                                        background: dontShow ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)',
                                        border: `0.5px solid ${dontShow ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)'}`,
                                        cursor: 'pointer', outline: 'none',
                                        transition: 'background 0.18s, border-color 0.18s',
                                    }}
                                >
                                    {/* custom checkbox */}
                                    <motion.div
                                        style={{
                                            width: 18, height: 18, borderRadius: 6,
                                            border: `1.5px solid ${dontShow ? '#fff' : 'rgba(255,255,255,0.25)'}`,
                                            background: dontShow ? '#fff' : 'transparent',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0, transition: 'all 0.15s',
                                        }}
                                        animate={{ scale: dontShow ? [1, 1.18, 1] : 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <AnimatePresence>
                                            {dontShow && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1, transition: SP_MICRO }}
                                                    exit={{ scale: 0 }}
                                                >
                                                    <CheckCircle2 style={{ width: 11, height: 11, color: '#000' }} strokeWidth={3} />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                    <span style={{ fontSize: 13, fontWeight: 500, color: dontShow ? '#fff' : 'rgba(255,255,255,0.38)', transition: 'color 0.15s' }}>
                                        Don't show again
                                    </span>
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {/* nav buttons */}
                        <div style={{ display: 'flex', gap: 8 }}>
                            <motion.button
                                onClick={prev}
                                disabled={isFirst}
                                style={{
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                    padding: '12px 16px', borderRadius: 14,
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '0.5px solid rgba(255,255,255,0.08)',
                                    color: isFirst ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.5)',
                                    fontSize: 14, fontWeight: 500,
                                    cursor: isFirst ? 'not-allowed' : 'pointer', outline: 'none',
                                    transition: 'color 0.15s',
                                }}
                                whileHover={!isFirst ? { background: 'rgba(255,255,255,0.07)' } : {}}
                                whileTap={!isFirst ? { scale: 0.97 } : {}}
                            >
                                <ChevronLeft style={{ width: 15, height: 15 }} />
                                Back
                            </motion.button>

                            <motion.button
                                onClick={isLast ? close : next}
                                style={{
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                    padding: '12px 16px', borderRadius: 14,
                                    background: '#fff',
                                    border: 'none',
                                    color: '#000',
                                    fontSize: 14, fontWeight: 600,
                                    cursor: 'pointer', outline: 'none',
                                    boxShadow: '0 2px 12px rgba(255,255,255,0.12)',
                                }}
                                whileHover={{ background: 'rgba(255,255,255,0.92)' }}
                                whileTap={{ scale: 0.97 }}
                            >
                                {isLast ? (
                                    <>
                                        <CheckCircle2 style={{ width: 15, height: 15 }} />
                                        Done
                                    </>
                                ) : (
                                    <>
                                        Next
                                        <ArrowRight style={{ width: 15, height: 15 }} />
                                    </>
                                )}
                            </motion.button>
                        </div>

                        {/* step counter */}
                        <motion.p
                            key={current}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', fontVariantNumeric: 'tabular-nums', margin: 0 }}
                        >
                            {current + 1} / {GUIDES.length}
                        </motion.p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}