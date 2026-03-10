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
        <div className="bg-neutral-950 border border-neutral-800 p-6">
            <div className="flex items-start justify-between mb-6">
                <p className="text-xs text-neutral-500 tracking-[0.15em] uppercase">
                    {title}
                </p>
                <Icon className="w-4 h-4 text-neutral-700" />
            </div>

            {loading ? (
                <div className="space-y-2">
                    <div className="h-8 w-24 bg-neutral-800 animate-pulse rounded" />
                    <div className="h-3 w-16 bg-neutral-900 animate-pulse rounded" />
                </div>
            ) : (
                <>
                    <p className="text-3xl font-light text-white mb-1">
                        {prefix}{formatValue(value)}
                    </p>
                    {suffix && (
                        <p className="text-xs text-neutral-500">
                            {suffix}
                        </p>
                    )}
                </>
            )}
        </div>
    );
}