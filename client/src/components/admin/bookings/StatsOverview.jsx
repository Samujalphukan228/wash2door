'use client';

import { motion } from 'framer-motion';
import { 
    TrendingUp, 
    Clock, 
    CheckCircle, 
    XCircle, 
    DollarSign,
    Calendar,
    Activity,
    Zap
} from 'lucide-react';

const statCards = [
    {
        key: 'total',
        label: 'Total Bookings',
        icon: Activity,
        gradient: 'from-blue-500 to-cyan-500',
        format: (val) => val
    },
    {
        key: 'pending',
        label: 'Pending',
        icon: Clock,
        gradient: 'from-yellow-500 to-orange-500',
        format: (val) => val
    },
    {
        key: 'confirmed',
        label: 'Confirmed',
        icon: CheckCircle,
        gradient: 'from-green-500 to-emerald-500',
        format: (val) => val
    },
    {
        key: 'inProgress',
        label: 'In Progress',
        icon: Zap,
        gradient: 'from-purple-500 to-pink-500',
        format: (val) => val
    },
    {
        key: 'completed',
        label: 'Completed',
        icon: CheckCircle,
        gradient: 'from-teal-500 to-green-500',
        format: (val) => val
    },
    {
        key: 'cancelled',
        label: 'Cancelled',
        icon: XCircle,
        gradient: 'from-red-500 to-pink-500',
        format: (val) => val
    },
    {
        key: 'revenue',
        label: 'Total Revenue',
        icon: DollarSign,
        gradient: 'from-indigo-500 to-purple-500',
        format: (val) => `₹${val.toLocaleString('en-IN')}`
    },
    {
        key: 'todayBookings',
        label: 'Today',
        icon: Calendar,
        gradient: 'from-cyan-500 to-blue-500',
        format: (val) => val
    }
];

export default function StatsOverview({ stats, loading }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4">
            {statCards.map((card, index) => (
                <motion.div
                    key={card.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative group"
                >
                    {/* Glass Card */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 backdrop-blur-xl border border-neutral-800/50 p-4 sm:p-5 hover:border-neutral-700/50 transition-all duration-300">
                        
                        {/* Gradient Glow */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                        
                        {/* Icon */}
                        <div className={`inline-flex p-2.5 sm:p-3 rounded-xl bg-gradient-to-r ${card.gradient} mb-3 sm:mb-4`}>
                            <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>

                        {/* Content */}
                        <div>
                            <p className="text-xs sm:text-sm text-neutral-400 mb-1 font-medium">
                                {card.label}
                            </p>
                            {loading ? (
                                <div className="h-7 sm:h-8 w-16 bg-neutral-800/50 animate-pulse rounded-lg" />
                            ) : (
                                <motion.p
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-xl sm:text-2xl font-bold text-white"
                                >
                                    {card.format(stats[card.key] || 0)}
                                </motion.p>
                            )}
                        </div>

                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}