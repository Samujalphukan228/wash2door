'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wallet, CalendarPlus } from 'lucide-react';

const MENU_ITEMS = [
    { icon: CalendarPlus, label: 'New Booking', key: 'booking' },
    { icon: Wallet,       label: 'Expenses',    key: 'expenses' },
];

/* ─── spring presets ─── */
const SPRING_SNAPPY = { type: 'spring', stiffness: 500, damping: 30 };
const SPRING_SOFT   = { type: 'spring', stiffness: 300, damping: 28 };

export default function MobileFAB({ onNewBooking, onExpenses }) {
    const [isOpen, setIsOpen] = useState(false);

    const handlers = { booking: onNewBooking, expenses: onExpenses };

    const handleAction = useCallback((key) => {
        setIsOpen(false);
        setTimeout(() => handlers[key]?.(), 250);
    }, [onNewBooking, onExpenses]);

    /* ─── variants ─── */
    const backdropV = {
        hidden:  { opacity: 0 },
        visible: { opacity: 1,  transition: { duration: 0.25 } },
        exit:    { opacity: 0,  transition: { duration: 0.2, delay: 0.05 } },
    };

    const listV = {
        hidden:  {},
        visible: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
        exit:    { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
    };

    const rowV = {
        hidden:  { opacity: 0, y: 16, filter: 'blur(4px)' },
        visible: { opacity: 1, y: 0,  filter: 'blur(0px)', transition: SPRING_SNAPPY },
        exit:    { opacity: 0, y: 8,  filter: 'blur(4px)', transition: { duration: 0.15 } },
    };

    return (
        <>
            {/* ── Backdrop ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="sm:hidden fixed inset-0 z-40"
                        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
                        variants={backdropV}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* ── FAB Shell ── */}
            <div className="sm:hidden fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3">

                {/* ── Menu rows ── */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            className="flex flex-col items-end gap-2.5 mb-1"
                            variants={listV}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {MENU_ITEMS.map(({ icon: Icon, label, key }) => (
                                <motion.button
                                    key={key}
                                    variants={rowV}
                                    onClick={() => handleAction(key)}
                                    aria-label={label}
                                    className="group flex items-center gap-2.5 cursor-pointer"
                                    style={{ outline: 'none', background: 'none', border: 'none', padding: 0 }}
                                    whileTap={{ scale: 0.96 }}
                                >
                                    {/* Label pill */}
                                    <motion.span
                                        className="px-3.5 py-2 rounded-xl text-sm font-medium tracking-wide"
                                        style={{
                                            background: 'rgba(255,255,255,0.08)',
                                            border: '1px solid rgba(255,255,255,0.12)',
                                            color: '#fff',
                                            letterSpacing: '0.01em',
                                        }}
                                        whileHover={{ background: 'rgba(255,255,255,0.16)' }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        {label}
                                    </motion.span>

                                    {/* Icon button */}
                                    <motion.span
                                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: '#fff' }}
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.9 }}
                                        transition={SPRING_SOFT}
                                    >
                                        <Icon className="w-[18px] h-[18px] text-black" strokeWidth={2.2} />
                                    </motion.span>
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Main FAB ── */}
                <motion.button
                    onClick={() => setIsOpen((o) => !o)}
                    aria-label={isOpen ? 'Close menu' : 'Open actions'}
                    aria-expanded={isOpen}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
                    style={{
                        background: isOpen ? 'rgba(255,255,255,0.1)' : '#fff',
                        border: isOpen ? '1px solid rgba(255,255,255,0.18)' : '1px solid transparent',
                        boxShadow: isOpen ? 'none' : '0 4px 24px rgba(0,0,0,0.35)',
                    }}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.93 }}
                    transition={SPRING_SOFT}
                >
                    {/* Subtle shimmer ring on hover when closed */}
                    {!isOpen && (
                        <motion.span
                            className="absolute inset-0 rounded-2xl"
                            style={{ border: '1px solid rgba(0,0,0,0.06)' }}
                        />
                    )}

                    <motion.div
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                    >
                        <Plus
                            className={`w-6 h-6 ${isOpen ? 'text-white' : 'text-black'}`}
                            strokeWidth={2.5}
                        />
                    </motion.div>
                </motion.button>
            </div>
        </>
    );
}