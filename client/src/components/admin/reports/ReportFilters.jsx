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

export default function ReportFilters({ filters, onFilterChange }) {
    const hasCustomDates = filters.startDate || filters.endDate;

    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">

                {/* Period */}
                <div className="flex flex-wrap gap-2">
                    {PERIOD_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => onFilterChange({
                                period: opt.value,
                                startDate: opt.value === 'custom' ? filters.startDate : '',
                                endDate: opt.value === 'custom' ? filters.endDate : ''
                            })}
                            className={`px-3 py-2 text-xs tracking-widest uppercase border transition-colors ${
                                filters.period === opt.value
                                    ? 'border-white bg-white text-black'
                                    : 'border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Group By */}
                <select
                    value={filters.groupBy}
                    onChange={(e) => onFilterChange({ groupBy: e.target.value })}
                    className="bg-neutral-950 border border-neutral-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 transition-colors ml-auto"
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
                <div className="flex flex-col sm:flex-row gap-3 p-4 border border-neutral-800 bg-neutral-950">
                    <div>
                        <label className="block text-xs text-neutral-500 tracking-widest uppercase mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => onFilterChange({ startDate: e.target.value })}
                            className="bg-black border border-neutral-800 text-white text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-neutral-500 tracking-widest uppercase mb-2">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => onFilterChange({ endDate: e.target.value })}
                            className="bg-black border border-neutral-800 text-white text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                        />
                    </div>
                    {hasCustomDates && (
                        <button
                            onClick={() => onFilterChange({ startDate: '', endDate: '' })}
                            className="self-end flex items-center gap-2 border border-neutral-800 text-neutral-500 hover:text-white text-xs tracking-widest uppercase px-4 py-2 transition-colors"
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