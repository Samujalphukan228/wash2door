'use client';

import { X } from 'lucide-react';

const PERIOD_OPTIONS = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
];

const GROUP_OPTIONS = [
    { value: 'day', label: 'By Day' },
    { value: 'week', label: 'By Week' },
    { value: 'month', label: 'By Month' }
];

const selectCls = `
    bg-white/[0.03] border border-white/[0.08]
    text-white/70 text-sm
    px-3 py-2.5 rounded-lg
    focus:outline-none focus:border-white/20 focus:bg-white/[0.05]
    transition-all duration-150
    appearance-none cursor-pointer
`;

export default function ReportFilters({ filters, onFilterChange }) {
    const hasCustomDates = filters.startDate || filters.endDate;

    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">

                {/* Period Pills */}
                <div className="flex flex-wrap gap-2">
                    {PERIOD_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => onFilterChange({
                                period: opt.value,
                                startDate: opt.value === 'custom' ? filters.startDate : '',
                                endDate: opt.value === 'custom' ? filters.endDate : ''
                            })}
                            className={`
                                px-3 py-2 text-[11px] tracking-widest uppercase border rounded-lg
                                transition-all duration-150 font-medium
                                ${filters.period === opt.value
                                    ? 'border-white bg-white text-black shadow-lg shadow-white/10'
                                    : 'border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/70 hover:border-white/[0.14] hover:bg-white/[0.05]'
                                }
                            `}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Group By */}
                <select
                    value={filters.groupBy}
                    onChange={(e) => onFilterChange({ groupBy: e.target.value })}
                    className={`${selectCls} ml-auto`}
                >
                    {GROUP_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Custom Date Range */}
            {filters.period === 'custom' && (
                <div className="flex flex-col sm:flex-row gap-3 p-4 border border-white/[0.08] bg-white/[0.02] rounded-lg">
                    <div className="flex-1">
                        <label className="block text-[10px] text-white/25 tracking-widest uppercase mb-2 font-medium">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => onFilterChange({ startDate: e.target.value })}
                            className={selectCls}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-[10px] text-white/25 tracking-widest uppercase mb-2 font-medium">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => onFilterChange({ endDate: e.target.value })}
                            className={selectCls}
                        />
                    </div>
                    {hasCustomDates && (
                        <button
                            onClick={() => onFilterChange({ startDate: '', endDate: '' })}
                            className="
                                self-end flex items-center gap-2
                                border border-white/[0.08] bg-white/[0.03]
                                text-[11px] text-white/40 hover:text-white/70
                                tracking-widest uppercase px-4 py-2.5 rounded-lg
                                hover:border-white/[0.14] hover:bg-white/[0.05]
                                transition-all duration-150
                            "
                        >
                            <X className="w-3.5 h-3.5" />
                            Clear
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}