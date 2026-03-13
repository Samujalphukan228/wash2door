// StatsCard.jsx
'use client';

export default function StatsCard({
    title,
    value,
    icon: Icon,
    loading,
    prefix = '',
    isCurrency = false
}) {
    const formatValue = (val) => {
        if (isCurrency) {
            return new Intl.NumberFormat('en-IN').format(val);
        }
        return val?.toLocaleString('en-IN') ?? '0';
    };

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:bg-zinc-900/80 transition-colors">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-zinc-400">
                    {title}
                </p>
                <Icon className="w-4 h-4 text-zinc-500" />
            </div>

            {loading ? (
                <div className="h-8 w-20 bg-zinc-800 rounded animate-pulse" />
            ) : (
                <p className="text-2xl font-semibold text-white">
                    {prefix}{formatValue(value)}
                </p>
            )}
        </div>
    );
}