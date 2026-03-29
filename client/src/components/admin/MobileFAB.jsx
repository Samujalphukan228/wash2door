'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wallet, CalendarPlus } from 'lucide-react';

const ITEMS = [
    { key: 'expenses', Icon: Wallet,       label: 'Expenses'    },
    { key: 'booking',  Icon: CalendarPlus, label: 'New Booking' },
];

// Each satellite is 56px circle. FAB is 56px circle.
// Min center-to-center = 28+16+28 = 72px. Using 80px for breathing room.
// Angle 0 = straight up, positive = clockwise when viewed from above.
const OFFSETS = [
    { x: -21, y: -77 },  // nearly straight up, slight left
    { x: -75, y: -27 },  // left diagonal
];

const SPRING_OPEN  = (i) => ({ type: 'spring', stiffness: 420, damping: 26, delay: i * 0.06 });
const SPRING_CLOSE = (i) => ({ type: 'spring', stiffness: 380, damping: 30, delay: i * 0.04 });
const SPRING_FAB   = { type: 'spring', stiffness: 340, damping: 24 };

export default function MobileFAB({ onNewBooking, onExpenses }) {
    const [isOpen,    setIsOpen]    = useState(false);
    const [triggered, setTriggered] = useState(null);

    const actions = { booking: onNewBooking, expenses: onExpenses };

    const handleAction = useCallback((key) => {
        setTriggered(key);
        setTimeout(() => {
            setIsOpen(false);
            setTriggered(null);
            actions[key]?.();
        }, 200);
    }, [onNewBooking, onExpenses]);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') setIsOpen(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    return (
        <>
            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="sm:hidden fixed inset-0 z-40"
                        style={{
                            background: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(6px)',
                            WebkitBackdropFilter: 'blur(6px)',
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: 0.2 } }}
                        exit={{ opacity: 0, transition: { duration: 0.16, delay: 0.08 } }}
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* FAB anchor — fixed position, everything radiates from here */}
            <div
                className="sm:hidden fixed z-50"
                style={{ bottom: 96, right: 16, width: 56, height: 56 }}
            >
                {/* Satellite buttons */}
                {ITEMS.map(({ key, Icon, label }, i) => {
                    const { x, y } = OFFSETS[i];
                    const isTrig   = triggered === key;

                    return (
                        <AnimatePresence key={key}>
                            {isOpen && (
                                <motion.button
                                    onClick={() => handleAction(key)}
                                    aria-label={label}
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        marginTop: -28,
                                        marginLeft: -28,
                                        width: 56,
                                        height: 56,
                                        borderRadius: '50%',
                                        background: '#fff',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        boxShadow: '0 2px 16px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.9)',
                                    }}
                                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                                    animate={{
                                        x,
                                        y,
                                        opacity: 1,
                                        scale: isTrig ? 1.12 : 1,
                                        transition: isTrig
                                            ? { type: 'spring', stiffness: 600, damping: 18 }
                                            : SPRING_OPEN(i),
                                    }}
                                    exit={{
                                        x: 0, y: 0,
                                        opacity: 0,
                                        scale: 0.4,
                                        transition: SPRING_CLOSE(ITEMS.length - 1 - i),
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.88 }}
                                >
                                    <Icon
                                        style={{ width: 20, height: 20, color: '#000', display: 'block' }}
                                        strokeWidth={2.1}
                                    />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    );
                })}

                {/* Pulse ring */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.span
                            key="pulse"
                            style={{
                                position: 'absolute',
                                inset: 0,
                                borderRadius: '50%',
                                border: '1.5px solid rgba(255,255,255,0.4)',
                                pointerEvents: 'none',
                                zIndex: 2,
                            }}
                            initial={{ scale: 1, opacity: 0.8 }}
                            animate={{ scale: 2.6, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                    )}
                </AnimatePresence>

                {/* Main FAB */}
                <motion.button
                    onClick={() => setIsOpen((o) => !o)}
                    aria-label={isOpen ? 'Close menu' : 'Open actions'}
                    aria-expanded={isOpen}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        background: isOpen ? 'rgba(255,255,255,0.13)' : '#fff',
                        border: isOpen
                            ? '0.5px solid rgba(255,255,255,0.22)'
                            : '0.5px solid rgba(0,0,0,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        outline: 'none',
                        boxShadow: isOpen
                            ? '0 0 0 8px rgba(255,255,255,0.05)'
                            : '0 4px 20px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.12)',
                        transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
                        zIndex: 3,
                    }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.91 }}
                    animate={{ rotate: isOpen ? 225 : 0 }}
                    transition={SPRING_FAB}
                >
                    <Plus
                        style={{
                            width: 22,
                            height: 22,
                            color: isOpen ? '#fff' : '#000',
                            display: 'block',
                            transition: 'color 0.18s',
                        }}
                        strokeWidth={2.4}
                    />
                </motion.button>
            </div>
        </>
    );
}