'use client';

export default function StatCard({ label, value, icon: Icon, loading }) {
    return (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-white/25 uppercase tracking-widest font-medium">
                    {label}
                </p>
                {Icon && (
                    <Icon className="w-3.5 h-3.5 text-white/15" />
                )}
            </div>
            <p className="text-xl font-light text-white/80">
                {loading ? (
                    <span className="inline-block h-6 w-12 bg-white/[0.06] animate-pulse rounded-md" />
                ) : (
                    value
                )}
            </p>
        </div>
    );
}