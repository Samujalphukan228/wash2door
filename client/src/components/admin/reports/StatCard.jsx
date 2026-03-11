'use client';

export default function StatCard({ label, value, icon: Icon, loading }) {
    return (
        <div className="bg-neutral-950 border border-neutral-800 p-4">
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-neutral-500 uppercase tracking-widest">
                    {label}
                </p>
                {Icon && (
                    <Icon className="w-3.5 h-3.5 text-neutral-700" />
                )}
            </div>
            <p className="text-xl font-light text-white">
                {loading ? (
                    <span className="inline-block h-6 w-12 bg-neutral-800 animate-pulse rounded" />
                ) : (
                    value
                )}
            </p>
        </div>
    );
}