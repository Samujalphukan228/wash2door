// StatsCard.jsx
'use client';

export default function StatsCard({
    title,
    value,
    icon: Icon,
    loading,
    prefix = '',
    suffix = '',
    isCurrency = false
}) {
    const formatValue = (val) => {
        if (isCurrency) {
            return new Intl.NumberFormat('en-IN').format(val);
        }
        return val?.toLocaleString('en-IN') ?? '0';
    };

    return (
        <div className="
            relative overflow-hidden rounded-lg
            border border-white/[0.08]
            bg-gradient-to-br from-white/[0.03] to-transparent
            p-4 sm:p-6
            group
        ">
            {/* Hover gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.02),transparent)]" />

            <div className="relative">
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <p className="text-[10px] sm:text-xs text-white/40 tracking-[0.15em] uppercase">
                        {title}
                    </p>
                    <Icon className="w-4 h-4 text-white/20 group-hover:text-white/30 transition-colors" />
                </div>

                {loading ? (
                    <div className="space-y-2">
                        <div className="h-7 sm:h-8 w-20 sm:w-24 bg-white/[0.06] animate-pulse rounded" />
                        {suffix && (
                            <div className="h-3 w-12 sm:w-16 bg-white/[0.04] animate-pulse rounded" />
                        )}
                    </div>
                ) : (
                    <>
                        <p className="text-2xl sm:text-3xl font-light text-white mb-1">
                            {prefix}{formatValue(value)}
                        </p>
                        {suffix && (
                            <p className="text-xs text-white/30">
                                {suffix}
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}