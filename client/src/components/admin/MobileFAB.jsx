'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wallet, CalendarPlus } from 'lucide-react';

export default function MobileFAB({ onNewBooking, onExpenses }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleAction = (action) => {
        setIsOpen(false);
        setTimeout(action, 300);
    };

    const menuItems = [
        {
            icon: CalendarPlus,
            label: 'New Booking',
            onClick: onNewBooking
        },
        {
            icon: Wallet,
            label: 'Expenses',
            onClick: onExpenses
        }
    ];

    // Animation variants
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { duration: 0.3, ease: 'easeOut' }
        },
        exit: { 
            opacity: 0,
            transition: { duration: 0.2, ease: 'easeIn', delay: 0.1 }
        }
    };

    const menuContainerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.05
            }
        },
        exit: {
            opacity: 0,
            transition: {
                staggerChildren: 0.05,
                staggerDirection: -1
            }
        }
    };

    const menuItemVariants = {
        hidden: { 
            opacity: 0, 
            y: 20,
            x: 20,
            scale: 0.8
        },
        visible: { 
            opacity: 1, 
            y: 0,
            x: 0,
            scale: 1,
            transition: {
                type: 'spring',
                stiffness: 400,
                damping: 25
            }
        },
        exit: { 
            opacity: 0,
            y: 10,
            x: 10,
            scale: 0.9,
            transition: {
                duration: 0.15
            }
        }
    };

    const labelVariants = {
        hidden: { 
            opacity: 0, 
            x: 20,
            scale: 0.9
        },
        visible: { 
            opacity: 1, 
            x: 0,
            scale: 1,
            transition: {
                type: 'spring',
                stiffness: 500,
                damping: 30,
                delay: 0.05
            }
        },
        exit: { 
            opacity: 0,
            x: 10,
            transition: { duration: 0.1 }
        }
    };

    return (
        <>
            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="sm:hidden fixed inset-0 z-40 bg-black/90"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* FAB Container */}
            <div className="sm:hidden fixed bottom-24 right-4 z-50">
                
                {/* Menu Items */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div 
                            className="absolute bottom-20 right-0 flex flex-col items-end gap-3"
                            variants={menuContainerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {menuItems.map((item, index) => {
                                const Icon = item.icon;
                                
                                return (
                                    <motion.div 
                                        key={item.label}
                                        className="flex items-center gap-3"
                                        variants={menuItemVariants}
                                    >
                                        {/* Label */}
                                        <motion.div 
                                            className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/10"
                                            variants={labelVariants}
                                            whileHover={{ 
                                                backgroundColor: 'rgba(255,255,255,0.15)',
                                                scale: 1.02
                                            }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <span className="text-sm font-medium text-white">
                                                {item.label}
                                            </span>
                                        </motion.div>
                                        
                                        {/* Action Button */}
                                        <motion.button
                                            onClick={() => handleAction(item.onClick)}
                                            className="w-12 h-12 rounded-xl bg-white flex items-center justify-center"
                                            whileHover={{ 
                                                scale: 1.1,
                                                rotate: 5
                                            }}
                                            whileTap={{ scale: 0.9 }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 500,
                                                damping: 20
                                            }}
                                            aria-label={item.label}
                                        >
                                            <Icon className="w-5 h-5 text-black" strokeWidth={2} />
                                        </motion.button>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main FAB Button */}
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        relative w-14 h-14 rounded-xl flex items-center justify-center
                        ${isOpen 
                            ? 'bg-white/10 border border-white/20' 
                            : 'bg-white'
                        }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 25
                    }}
                    aria-label={isOpen ? 'Close menu' : 'Open menu'}
                >
                    <motion.div
                        animate={{ 
                            rotate: isOpen ? 45 : 0
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 20
                        }}
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