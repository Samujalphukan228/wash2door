// src/components/admin/reports/StatCard.jsx
'use client';

export default function StatCard({ label, value, icon: Icon, loading, highlight }) {
    return (
        <div className={`
            bg-white/[0.02] border rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all
            hover:bg-white/[0.04]
            ${highlight ? 'border-red-500/30 bg-red-500/[0.02]' : 'border-white/[0.08]'}
        `}>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/[0.06] flex items-center justify-center">
                    {Icon && <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />}
                </div>
                <span className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider">
                    {label}
                </span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white tracking-tight truncate">
                {loading ? (
                    <span className="inline-block h-6 w-16 bg-white/[0.06] animate-pulse rounded-md" />
                ) : (
                    value
                )}
            </p>
        </div>
    );
}